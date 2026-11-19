# Normalization Consistency (F1, F2, F3): the focal correction cycle (one, used)

**Input:** three R1 reviews of `ef490bb` (runtime `07301f3`), committed as received (`a1c9b56`):
- **QRE_NCC_R1: NOT_READY.**
  - C1 blocks: runtime.
  - C2 blocks: tests and harness.
  - C3, C4 and C5 do not block.
- **SEC_NCC_R1: PASS_WITH_CONDITIONS.**
  - SEC-NCC-01 blocks: runtime. It is the same defect as QRE C1.
  - SEC-NCC-02 and SEC-NCC-03 do not block.
- **SSCTR_NCC_R1: ACCEPT_WITH_CONDITIONS.**
  - C-NCC-2 binds the record.
  - C-NCC-1 and C-NCC-3 bind before real athletes.
  - No runtime change is asked.

**Cycle runtime:** `963547b`. One file, `CoachingCore/src/r6-provenance.mjs` (+8/−4 against `ef490bb`): `partOf` keeps the report's own clock, and the chain rule reads the named report's clock. No other rule, file or structure is touched.

| Condition | What was done | Evidence |
|---|---|---|
| **QRE C1 / SEC-NCC-01** (blocking) | A part keeps when its own report became available (`availableAt`: the correction time, else the report time, else the observed instant, as `availability` reads a row). The correction-before-report rule compares with the named report's own clock: the row's when the row is that report, else its part's. A part kept without a clock (before this line) is never refused by the rule, as on FREEZE-4. | Tests C1/P1-S1, C1/P1-S2+P2, SEC-NCC-01 (e5d d1 = d2 on what is in force, the conflict and the quarantine; E5a admitted; E5c refused split and in one review; a part without a clock not refused), C1/P7 (engine: the d1 re-sync in force, the device measurement leads), SEC-NCC-01 engine-e5d (the symptom-stop correction in force and conflicted, no run-history fact from the watch). On the exact `ef490bb` bytes, 21/26 pass: the 5 cycle tests fail (`evidence/red-cycle1-on-ef490bb.txt`). Re-read and JSON round trip are stable, inside the tests. |
| **QRE C2** (blocking) | (1) The reproducers above, at the normalizer and through the engine. (2) `evidence/differential.mjs` now accounts for the fate of every incoming report before any class. A report refused by one side and not the other, or by both for different reasons, must be explained from the inputs and the candidate's record (CHAIN_BEFORE_REPORT, CHAIN_CASCADE, CHAIN_OTHER_IDENTITY, BOUND_IN_FORCE/HISTORY, CONFLICT_WITH_RECORD, CONFLICT_THEN_RESOLVED, ID_HELD; admissions CHAIN_NOW_FOUND, CONFLICT_STATE_DIFFERS, QUARANTINE_RESOLVED, REPLAY_OF_RECORD). Otherwise the pass is UNEXPLAINED, whatever class it would get. (3) `EXT=1` generator: per watch report, an athlete's correction of the session's own report and a late device re-sync made before that correction but delivered after it. (4) The six configurations re-run with both generators. | Run with `ef490bb` as the candidate, the extended generator reports **20 unexplained refusals**, all `INVALID_CORRECTION_CHAIN` and all of the S1 shape; the original generator reports 0, as QRE found. On `963547b`: see the table below. Mutants 11/11 killed, including the holder clock (= `ef490bb`) and two QM12-style weakenings: parts without a clock, and the rule only where the row is the named report (`evidence/mutation-cycle1.txt`). |
| **QRE C3** (records) | CANDIDATE §A declares the second limitation for records FREEZE-4 wrote with event-id reuse, routed to Core with custody. | — |
| **QRE C4** (declare or change) | Declared, not changed: unbinding an activity that a correction replaced is an identity-policy question, routed with O-1. | CANDIDATE §A |
| **QRE C5** (records) | The split-independence claim is withdrawn for `ef490bb` and restated for `963547b`, with the only remaining order dependence (which correction's id holds the row, E-1). The ledger names `:14`. The harness header states that only the fate accounting reads every incoming report. | CANDIDATE §A, `SUCCESSOR_LEDGER.json` |
| **SSCTR C-NCC-2** (records) | The scenario 21 EASY status change (CONFLICTED → COMPLETED) and its disputed history reference, and the F2 easy runs 2 → 1 and bound 49 → 40, are stated in CANDIDATE §C and the ledger. | — |
| SEC-NCC-02, SEC-NCC-03, SSCTR C-NCC-1 and C-NCC-3, OOS-1/O-QRE-NCC-A, O-NCC-S1 | Routed in CANDIDATE §F with their binding use and owner. Not changed. | — |

**Suite on `963547b`** (`evidence/suite-963547b.txt`): **1801 / 1770 / 31**. The 5 cycle tests pass. The 31 failures are at the same assertion locations as on `ef490bb`: the baseline's 29 plus the two ledger entries.

**Dose:** the five sporting journeys are byte-identical to `ef490bb` (`evidence/dose-963547b.json`). The cycle changes only the corrections `ef490bb` refused, and there it restores FREEZE-4's outcome (CANDIDATE §C).

**Differential on `963547b`** (`evidence/cycle1/`, CANDIDATE §B): six configurations × two generators. In all twelve runs, every candidate invariant is 0, UNEXPLAINED is 0 and every changed incoming fate is explained (54 to 444 per run). With `ef490bb` as the candidate, the same harness reports 42 UNEXPLAINED passes on the extended generator.

**Rechecks requested, narrow, on the cycle commit:**
- QRE: C1, C2, C3 and C5, and C4 as declared.
- Security: SEC-NCC-01's seven closing items.
- SSCTR: that the cycle delta moves no dose beyond restoring FREEZE-4's admission of those corrections, and C-NCC-2.

There is no second cycle. A blocker found in the rechecks closes this line without a freeze, or partially.
