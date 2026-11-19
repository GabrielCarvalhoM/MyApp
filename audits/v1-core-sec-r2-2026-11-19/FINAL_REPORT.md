# SEC-R2-03 + SEC-R2-04 provenance and correction integrity closure: final report

**State: CLOSED, freeze emitted.** The freeze is **COACHINGCORE-V1-CORE-SAFETY-FREEZE-4** (`CoachingCore/v1/RUNTIME_FREEZE_V1CORE_4.json`):
- It binds 40 files at `6a51958` (filesDigest `900d7896…`).
- The runtime is `36ea26a`: candidate `4e8cffe` plus the one focal cycle.
- `node CoachingCore/scripts/v1core-freeze-4.mjs --check` gives 40/40.

The freeze is additive. The eight earlier records are the `a6e10d0` bytes. FREEZE-1 is 46/47, with `src/r6-provenance.mjs` declared amended. FREEZE-2 is 14/15 and FREEZE-3 is 23/24, each with `src/v1-f08.mjs` declared. By design, `v1core-freeze-3.mjs --check` now names `src/v1-f08.mjs` as drift.

**Line:** branch `claude/v1-core-sec-r2`, worktree `.claude/worktrees/v1-core-sec-r2`, from `a6e10d0`. Commits, in order:
- `4e8cffe`: candidate
- `b231565` and `f6a934f`: records and evidence
- `6b5af90`: reviews
- `36ea26a`: cycle 1
- `bbea6bc` and `f62bae3`: cycle records
- `9e55960`: rechecks
- `6a51958`: Mac package
- `985c018`: freeze
- this report

**Nothing pushed or merged.**

## A. Correction integrity, per item

| Item | Defect reproduced (on `a6e10d0`) | Root cause | Fix | Tests | Judges | State |
|---|---|---|---|---|---|---|
| **SEC-R2-03** (A, B, self id) | A refused correction (event id of another session, watch activity of another session, its own id with other facts) marked the original replaced; the run left every reader | Replacement effects applied before the refusal checks | `normalizeObservations`: retirements in `admit()`, run only after every refusal check; the identity checks read the record as admission leaves it; the event-id check reads it before | 5, 6, 13, 16, consumers, seeded invariants | Security PASS, QRE READY, SSCTR ACCEPT | **Closed** |
| **SEC-R2-03 (D)**, same cause | A correction resolving a conflict, agreeing with the row it retired, was merged into that retired row: the session left the record in force | `byIdentity` still named the retired row | A conflict-resolving correction has no row to merge into | 9 | as above | **Closed** |
| **SEC-R2-03 (E)**, same cause | A second correction of an already corrected part (a stale alias of a retired merged row) became a second row in force: counted twice | A replaced report was retired again as if in force | Only a row in force is retired (`live`) | 11 | as above | **Closed** |
| **SEC-SR2-01** (Security R1, cycle 1) | A correction read as a replay of another session's row gave that row its chain's older `firstRecordedAt`; a late adverse session after a wellbeing check read as KEEP, not ASK | The chain clock was applied before admission | The clock is set inside `admit()` only | SEC-SR2-01 (normalizer and engine) | Security PASS, QRE READY, SSCTR ACCEPT | **Closed** |
| **SEC-R2-04** | Two manual rows with no session: the readiness declaration stood in for a later stop (`null === null`), through the normalizer and on stored records | `replacedBy` matched missing identities | Through the normalizer: no longer reachable after SEC-R2-03. On stored/forged records: `replacedBy` needs a positive identity (session, else activity, else the manual provider at its instant) | 18, SEC-R2-04, C1 (a, b, c, q10) with controls | Security PASS, QRE READY | **Closed** |

**Tests:** `v1core-secr2-correction-integrity.test.mjs` is 24/24, and `v1core-secr2-freeze.test.mjs` is 1/1.
- **RED:** with both runtime files at FREEZE-3 bytes, 4/20 pass. Of the cycle's tests, the two SEC-SR2-01 tests fail on `4e8cffe`.
- **Mutants:** 13/13 killed (author's), plus QRE's and Security's own.
- QRE's non-blocking nit, recorded here and not edited after review: one C1 assertion message says FREEZE-3 read (a) and (c) as replaced. FREEZE-3 already asked for (a), (b) and (c); the defect shape was the manual one, covered by the SEC-R2-04 test.

## B. Regression

- **Full suite, committed tree (`f62bae3`):** **1774 / 1745 / 29**, reproduced by QRE in a clean clone.
  - The 27 inherited failures are unchanged.
  - The two new failures are by design (`SUCCESSOR_LEDGER.json`): `v1core-cf011r2-restart-evidence.test.mjs:287`, which pinned the orphan itself, and `v1core-cf011r2-freeze.test.mjs:12`, the FREEZE-3 line's preservation check.
- **Differential vs FREEZE-3** (3000 generated records, two arrival clocks):
  - 0 orphans written, 0 second rows in force, deterministic.
  - 0 rows in force lost under monotone arrival.
  - Every other difference is a FREEZE-3 defect pass.
  - Security's independent fuzzer ran about 47,700 passes and agrees.
- **Consumers through the composed engine, for a refused correction of a run and of a strength session:** the weekly review, strength exposure, run history (calibration, forecast, pace) and restart read exactly what the same plain report gives.
- **Bench (Node):**
  - review ×1.009;
  - restart from a corrected record ×1.00 to ×1.06 (noise);
  - normalizer ×0.98 to ×1.01;
  - heap and record bytes equal.

## C. Reviews (`reviews/`)

| Judge | R1 on `f6a934f` | R2 on the cycle (`f62bae3`) |
|---|---|---|
| SSCTR | ACCEPT_WITH_CONDITIONS (C-SR2-1 on the record; C-SR2-2/3/4 = F1/F3/F2 bind before real athletes; C-SR2-5 = O-1) | ACCEPT |
| Security | PASS_WITH_CONDITIONS (SEC-SR2-01 blocking; F1–F3 binding before real athletes; SEC-SR2-02 observation) | PASS |
| QRE | READY_WITH_CONDITIONS (C1 blocking `--write`; C2) | READY |

The one focal cycle was used (`CYCLE1.md`). There is no second one.

## D. Freeze: see the header.

## E. Mac package

`audits/v1-core-safety-lifecycle-2026-11-18/mac/README.md` §10, with hashes in `evidence/MAC_PACKAGE.json`:
- the bundle is relinked (`449382cf…`);
- three journeys are added (`sec-r2-refused-eventid`, `sec-r2-refused-activity`, `sec-r2-readiness`);
- the thirteen earlier journeys and J5/P16 are identical;
- `vm-check` is ok with JIT and with `--jitless`;
- a second run is a no-op.

## F. Readiness: the twelve questions

1. **SEC-R2-03 closed?** Yes, for the synthetic freeze, including variants D and E and SEC-SR2-01.
2. **SEC-R2-04 closed?** Yes. It is not reachable through the normalizer, and on records FREEZE-3 stored (or forged rows) the restart asks.
3. **Can a refused correction still modify the state in force?** It no longer retires, unindexes, re-parts or re-clocks any row. Two existing rules still apply to it, as to any report:
   - the event-id and activity conflict rules flag the row holding the id or activity as `conflicted` (O-1, conservative);
   - in a session already in conflict, a correction passes the quarantine where a plain report would be refused (QRE-SR2-01).

   Both are identical on FREEZE-3 and are routed to the conflict-policy decision, which is not binding for synthetic use.
4. **Can a valid execution still vanish improperly?** Not through a refused correction. **Yes, through F1:** a carried row is refused again when an incoming report sorts before it by timestamp. This is identical on FREEZE-3 and binding before real athletes.
5. **Dose change?** Only where FREEZE-3 had lost a session, merged it into a retired row, or counted it twice. The session now counts as executed.
   - Engine journey (SSCTR-verified): week-0 running was 30 min on FREEZE-3, the run lost; it is now 40 min. The control with no bad report is 50 min.
   - The +10 in CANDIDATE's original total table was an optional walk (C-SR2-1, corrected).
   - No sporting rule changed, and Pace Revision stays off.
6. **Run and strength records correct?** Yes, through the engine, for the shapes tested. F2 remains: a merged watch activity is not indexed on later reviews, so one activity can back two sessions.
7. **Clinical and readiness?** Preserved and improved.
   - SB-1 asks on stored orphans.
   - A late adverse session after a wellbeing check is asked about again (SEC-SR2-01).
   - A symptom stop stays on a row in force.
   - No clinical criterion changed.
8. **FREEZE-3 and earlier preserved?** Yes: see the header. The C-F01-1 r2 tests that fail by design have successors.
9. **Performance regression?** No (Node; §B).
10. **What still blocks a real-athlete restart?**
    - **F1** (binding before any real-athlete review or restart; Core + QRE, then Security, then SSCTR).
    - **F2** (binding before real-athlete HealthKit use, restart, and run-evidence readers; Core + Security, then SSCTR).
    - **F3** (binding before real-athlete weekly-review gating; Core + QRE, then SSCTR).
    - **C-F01-2** custody, with SEC-SR2-02 (a forged pair of rows naming each other).
    - **SEC-CORE-03:** the correction author is not checked.

    Not binding: O-1/C-SR2-5 (conflict policy), O-3 (minute split at a bound of 40–45), O-4.

    Carried from FREEZE-3: C-R2-2, SSCTR O-1 (B0-F05) and O-2, and the FREEZE-2 carry-overs. SSCTR proposed HQ-SECR2-SSCTR-A inside its record only; the human queue is unchanged.
11. **What depends on the iPhone?** Equivalence of Node and JavaScriptCore for the relinked bundle in every step of the sixteen `core.json` journeys, J5/P16 and focal (README §2–§4 and §8–§10). **IOS_REVALIDATION_PENDING.** The Swift was not compiled, and the physical PerformanceTests are not needed.
12. **Next minimal action:**
    1. The Founder authorizes the push of `claude/v1-core-sec-r2`.
    2. The Mac/iPhone run, README §2–§3 and §8–§10.
    3. A narrow Core mission for F1 (arrival order of carried rows), with F2 and F3, then C-F01-2 custody, before any real-athlete restart.

    No further mission is started here.
