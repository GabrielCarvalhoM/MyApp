# C-F01-1 r2: restart evidence and safety, candidate record

**Mission:** Founder, 2026-11-18. Close C-F01-1 r2 (i)–(iv) and SB-1, and nothing else.

**Line:** branch `claude/v1-core-cf011-r2`, worktree `.claude/worktrees/v1-core-cf011-r2`, from `4b6e1ea` (CORE-C2-F01's last commit; FREEZE-2 checks 15/15 there). The candidate is **`3f0b04f`**. Nothing is pushed.

**Routing:** T3/R3. The change affects dose and a safety screen. Judges: SSCTR, Security and QRE, one round each on the same candidate, plus one focal correction cycle if needed.

**Decision record:** `DECISION.md`, covering what an execution, an admitted amount and a disputed amount are, the bound, the ASK alternative and SB-1.

## 1. Defects reproduced on `4b6e1ea`

| Item | Path | Reproduction |
|---|---|---|
| (i) | `restartIntake`, gate `rows.some(executed)` | Shape A, and P4 through the normalizer: stated 600/7 unbounded. Through `restartProgram`: EASY_CURRENT 65/65/65/100, the same as an empty record. |
| (ii) | `done`, `lastBy` and `trainedAfter` read `executed`, which excludes every conflicted row | P4: pause null, no last executed day. Disputed session 20 days ago: pause null. |
| (iii) | `executed` | Already correct; now pinned across 11 shapes. |
| SB-1 | `trainedAfter`, and the `else if(readiness)` branch | Readiness, then a disputed session: `readinessDeclared:true`, so the new stop's reason is not asked. The same happens with a direct conflict, or with the watch saying done against a "not done" correction. |

## 2. Change (one runtime file, `src/v1-f08.mjs`, 21+/7−)

- `did` factors the existing "took place" test. `executed` is the same predicate.
- `occurred` adds the execution of disputed amount (DECISION §1). It feeds `done` and `lastBy`, so the pause and the last executed day.
- `claimsDone` (any voice in force says it took place) feeds `trainedAfter`. The `else if(readiness)` branch now also honours `trainedAfter`.
- The C-Q08-1 gate also opens on any report of a session in the 28-day window. The amount is still `executed` rows only, each event once.

**Unchanged:**
- every HOLD and CLINICAL_HUMAN_REQUIRED path, which run first;
- C-Q08-2/3, the record returned (byte for byte), `once`, and the dose tables;
- progression, periodization, calibration, Race Forecast, Pace Insights, Strength, AM/PM and the coach profiles;
- the JavaScriptCore architecture. Pace Revision stays off.

## 3. Tests

**New:** `test/v1core-cf011r2-restart-evidence.test.mjs` (31 tests) covers the mission's lists:
- A1–A12 plus an e2e through `restartProgram`;
- B1–B7 plus persistence through a re-normalization;
- C1–C11;
- D1–D9, with D6 through the intake.

**RED on `4b6e1ea`:** 12 of 31 fail, each on the defect it targets (`evidence/red-on-4b6e1ea.txt`). The 19 that pass there are the no-change guards: A1, A2, A6–A11, B3, B4–B5, persistence, C1–C6, C9–C11, D2, D5, D8 and D9. **GREEN on `3f0b04f`:** 31/31.

**Preservation:**
- `test/v1core-cf011r2-freeze.test.mjs` runs `scripts/v1core-freeze-3.mjs --preserved`:
  - the seven earlier records are the `4b6e1ea` bytes;
  - FREEZE-1 is 47/47;
  - FREEZE-2 is 14/15, with `src/v1-f08.mjs` declared;
  - V1-FREEZE-1 is 197/198, with the same file declared;
  - the other four records are whole;
  - nothing else changed, and there are no untracked files.

**Re-pinned (C-F01-1 r2 (iv)):** three tests that are bound by FREEZE-2 now fail by design and were not edited. `SUCCESSOR_LEDGER.json` gives, for each, the contract, the old and new values, the sporting reason, the safety consequence and the successor's result:
- `v1core-c2f01-restart-sizing:223` (QRE-F01-01, "open");
- `:255` (ADDENDUM (b), "open");
- `v1core-c2f01-freeze:12`.

## 4. Regression and performance (Node 24, worktree)

- **Full suite on `3f0b04f`:** **1743 / 1716 / 27**.
  - 24 are exactly CORE-C2-F01's failures: closure-2's 23 ledgered tests, with `v1rws-lineage:146` counted twice, plus `v1core-freeze:11`. Their locations were compared one by one.
  - The other three are the re-pinned tests of §3.
  - No other test changes status. The base was 1712 / 1688 / 24; the 31 new tests and the freeze test add 32.
- **Bench** (`bench/`, `4b6e1ea` vs this tree, 5 interleaved rounds):
  - review median ×1.004, p95 ×0.980;
  - restart from a corrected record ×0.994 (p95 ×0.991);
  - record bytes ×1.000.

  This is not material. The added work is one pass over the record, plus the parts of conflicted rows.
- **The Mac package** is updated after approval (mission §12), not in this candidate.

## 5. For the judges

- **SSCTR:**
  - Is the (i) choice (bound, not ASK, with 0 mapped to RESTART) and the (ii) amount (0) right under C-Q08-1?
  - Is `occurred` the right reading of "a session every report says was done"?
  - Do any dose changes go beyond those in DECISION §4?
  - Should the window residual (a "not done" report older than 28 days) be widened?
- **Security:**
  - SB-1: is `claimsDone` (any voice in force, conflicted included) the right trigger?
  - Can a forged or malformed row now admit an execution, or bypass the screen, beyond what custody C-F01-2 already names (D9: an orphaned `superseded` mark)?
  - Does the reading persist through restore and restart?
- **QRE:**
  - Is the change minimal?
  - Is the coverage of the case lists, including the negative and no-change cases, sufficient?
  - Are RED/GREEN, the suite accounting, preservation and determinism sound?
