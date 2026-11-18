# Core Safety & Lifecycle closure-2: final report

**State: CLOSED, freeze emitted.** The freeze is **COACHINGCORE-V1-CORE-SAFETY-FREEZE-1** (`CoachingCore/v1/RUNTIME_FREEZE_V1CORE_1.json`):
- it binds 47 files at `cfb32cb` (candidate `219fb1c`; no CoachingCore change after it);
- filesDigest `c8f5879f…`;
- `node scripts/v1core-freeze.mjs --check 1` gives 47/47.

**Line:** branch `claude/v1-core-safety-closure-2`, from `4c60915`: `219fb1c` candidate → `8f54df6` record → `cfb32cb` reviews and ledger → `0a9ed80` freeze → `5b715a9` Mac package. **Nothing pushed or merged.** The correction cycle this mission allowed was **not used**, because no judge blocked.

## 1. Corrections implemented

| Item | Before (`4c60915`) | Now | File |
|---|---|---|---|
| SSCTR-CORE-B-01-R | an earlier-plan symptom stop in an ASK review was named once and then lost | kept as a stop-only fact; the screen is asked until a screen answered after the stop | `v1-run-format-index.mjs` |
| QRE-CORE-R2-01 | after expiry, 4 `RUN_FORMAT_EMITTED` facts for formats never delivered | no format the answer did not deliver; the review's report facts (stops) and every earlier row kept | `v1-safety-index.mjs` |
| SEC-CORE-14 | one malformed part discarded the athlete's valid part | only the malformed part is not carried; validation unchanged | `r6-provenance.mjs` |
| C-C1 / C-C2 / QRE-CORE-R2-02 | 17 red tests stopped early; no successors | 19 generated successors and an RWS-level C-C2 test; the ledger maps all 23 red tests | `successors/`, `test/v1core-*` |

Kept as before:
- clinical precedence, restart identity, effort and recovery under E-1;
- the anti-forgery strip, code-unit order, RFC-NUMERIC-1;
- Pace Revision off, AM/PM untouched.

No dose, progression or periodization changed.

## 2. Tests and comparison with the earlier mission

| | Earlier mission (`4c60915`) | closure-2 (`219fb1c`) |
|---|---|---|
| Full suite (worktree) | 1661 / 1638 / 23 | **1690 / 1667 / 23** |
| Red tests | 23, attributed, 17 with no successor | the same 23 (no new failure), **each with a passing successor** (`SUCCESSOR_LEDGER.json`) |
| New tests | — | 29, all pass. RED on `4c60915` for B-01-R, R2-01 and SEC-CORE-14; the 20 successors fail on `7e03f84` (QRE) |
| J5/P16 | byte-identical | byte-identical |
| Node bench vs `4c60915` | — | median ×1.007, p95 ×1.011, record ×1.000 |
| Freezes | 5 earlier records intact | intact (`--preserved`: 190/198+8, 30/30, 97/98+1, 163/163, 121/121) |

## 3. Independent reviews (in `reviews/`)

- **SSCTR_C2_R1: READY_WITH_CONDITIONS.**
  - **Closed:** B-01-R, with the refused-instant parity and the 128-character id limit accepted; C-C1; C-C2; the fix-forward:285 successor.
  - **The standing hold after the date:** acceptable.
  - **Conditions:**
    - C2-C1: CORE-C2-F01 named open; no restart from a corrected record for real athletes or integration;
    - C2-C2: re-read rows 04/12/20 as-if once SEC-CORE-03 closes;
    - C2-C3: the client re-sends a report from a refused review.
- **QRE_C2_R1: READY_WITH_CONDITIONS.** R2-01 and R2-02 are closed, and there is no regression.
  - **QRE-C2-01:** the ledger must map the three preservation tests. Done before the freeze; `--check` passes and the ledger equals the 23 failing locations.
  - **QRE-C2-02:** CORE-C2-F01 named in the freeze; fix it before integration.
  - **Notes:** QRE-C2-03, -04.
- **SEC_C2_R1: PASS_WITH_CONDITIONS.**
  - SEC-CORE-14 is closed.
  - B-01-R and R2-01 are sound at the trust boundary.
  - The R2 conditions are unchanged.
  - New notes SEC-C2-01 (session-id charset, in SEC-CORE-10) and SEC-C2-02 (pre-existing, in SEC-CORE-15).

## 4. Real security and integration items still open

- **CORE-C2-F01 (new, pre-existing, a dose):** a restart from a record holding a correction sizes the new plan's easy runs at 60 min where the as-if control gives 50. Cause per QRE: the C-Q08-1 bound in `src/v1-f08.mjs` counts superseded rows. It blocks integration and real-athlete use of such a restart. Owner: the next mission, with SSCTR review of the fix.
- **SEC-CORE-03:** a correction is not bound to its author. SSCTR C2-C2 depends on it.
- **Before integration:** SEC-CORE-06, -07, -10 (+SEC-C2-01), -16; SSCTR C-C3, C-C4, C-C5, A-C1/2/3/5, D-C1/D-C2; QRE C-INT, which now also requires custody to resend a refused report and keep the ASK `runFormatRecord`.
- **Founder decisions, not taken here:**
  - **D1:** local custody model and threat model;
  - **SEC-CORE-08:** device-clock tampering against expiry;
  - **D2:** backup;
  - **G07 / SEC-CORE-09:** retention and erasure of health facts, which now also live in stop-only facts of the `runFormatRecord`;
  - any widening of clinical scope.
- Proposed queue items HQ-CORE-C2-SSCTR-A and HQ-CORE-SSCTR-C are not appended.

## 5. Mac package

`audits/v1-core-safety-lifecycle-2026-11-18/mac/README.md` §7. It contains:
- the bundle relinked on the freeze;
- `core.json` with 8 journeys: the six earlier ones, plus `alert-b01r` and `expiry-record`;
- J5/P16 unchanged;
- `vm-check` ok, with JIT and `--jitless`.

The Swift was not compiled, and there is no cross-runtime readiness claim until the physical run. **IOS_REVALIDATION_PENDING.**

## 6. Next minimal step

Founder authorization to push `claude/v1-core-safety-closure-2`, then the Mac/iPhone run in README §2–§3 and §7. Separately, a narrow mission for CORE-C2-F01 (the restart sizing test, then the SSCTR-reviewed fix) before any integration that offers restart.
