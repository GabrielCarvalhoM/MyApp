# SEC-R2-03 + SEC-R2-04: the focal correction cycle (one, used)

**Input:** three reviews of `f6a934f` (runtime `4e8cffe`), committed as received (`6b5af90`):
- SSCTR_SR2_R1: ACCEPT_WITH_CONDITIONS, with C-SR2-1 binding the closing record.
- SEC_SR2_R1: PASS_WITH_CONDITIONS, with SEC-SR2-01 blocking the freeze.
- QRE_SR2_R1: READY_WITH_CONDITIONS, with C1 blocking `--write`.

**Cycle candidate:** `36ea26a`. The runtime change is one moved statement in `src/r6-provenance.mjs`; `src/v1-f08.mjs` is unchanged (`f1065bf1…`).

| Condition | What was done | Evidence |
|---|---|---|
| **SEC-SR2-01** (blocking) | The correction takes its chain's first-recorded clock inside `admit()` only. A refused report, or one read as a replay of another session's row (that row's id and facts), carries its own clock only, as with no `correctionOf`. An admitted correction still takes the chain's clock (QE-R7C-10). | Test **SEC-SR2-01** (normalizer, also in one batch): Y's clock stays 11-06, as with the plain report. Test **SEC-SR2-01 through the engine** (QRE-V1CP-04 shape): ASK, as the control. Both fail on `4e8cffe` (`red-cycle-on-4e8cffe` below). Mutant **M9** (clock back before admission) is killed. |
| **QRE C1** (blocking `--write`) | Tests on records holding orphans as FREEZE-3 stored them: hand-marked normalized rows, never written by this line's normalizer. | **C1**: shapes (a) another session's event id, (b) an id the record lacks, (c) a watch row with no session, and (q10) a manual row "replaced" by a row of the same provider and instant that carries an activity. Each gives `readinessDeclared` undefined through `restartIntake` (also after a round trip) and ASK with `athlete.pause.*` through `restartProgram`. **C1 controls**: same session, same activity, same manual instant: history (the declaration answers). QRE's Q11, Q9 and Q10 become **M10–M12**, all killed. |
| **QRE C2** (non-blocking) | Wording corrected: CANDIDATE §A (QRE-SR2-01, the exception for a session already in conflict), the test file header, and the `SUCCESSOR_LEDGER.json` successor text for `:287`, which now names the C1 tests. | — |
| **SSCTR C-SR2-1** (binds the record) | CANDIDATE §C corrected. Running minutes are 50 / 30 / 40 (control / FREEZE-3 / candidate): 10 min less running than the control. The +10 in the total is an optional walk, and O-1/B0-F05 plays no part. | `dose-36ea26a.json`, identical to `dose-4e8cffe.json` |
| **SEC-SR2-02** (observation) | Not changed. A forged pair of rows naming each other needs custody-level power. Carried to C-F01-2's closing evidence. | — |
| **O-QRE-1** (optional) | Not taken. `--preserved` (iii) stays scoped to `CoachingCore/`, as in FREEZE-3's verifier. The rest of the repository is covered by the freeze record's own file hashes. | — |

**Tests:** `v1core-secr2-correction-integrity.test.mjs` is 24/24. The cycle's 4 new tests on `4e8cffe`: the two SEC-SR2-01 tests fail and the two C1 tests pass, since C1 adds coverage, not a fix.

**Mutants:** 13/13 killed (`evidence/mutation-cycle1.txt`; run on a byte-identical scratch extract).

**Differential (cycle runtime):** the same as `4e8cffe` (`evidence/differential-cycle1.json`): 0 orphans, 0 second rows in force, 0 rows lost under monotone arrival, deterministic. F1 is unchanged.

**Full suite on `36ea26a`** (`evidence/suite-36ea26a.txt`): **1774 / 1744 / 30**.
- The 27 inherited failures and the two declared in `SUCCESSOR_LEDGER.json` are as on `4e8cffe`.
- The 30th is `v1core-secr2-freeze.test.mjs:12`. During the run, `CYCLE1.md` and the new evidence were untracked in the audit folder, which check (iv) refuses: a working-tree artifact, not the runtime.
- Once committed (`bbea6bc`), that test passes (25/25 for the line's two test files, and `--preserved` exits 0). So on the committed tree the suite is **1774 / 1745 / 29**.

**Rechecks requested, narrow, on the cycle commit:**
- Security: SEC-SR2-01.
- QRE: C1, C2 and the runtime delta.
- SSCTR: that the delta moves no dose, and C-SR2-1.

There is no second cycle. A blocker found in the rechecks closes this line BLOCKED or PARTIAL.
