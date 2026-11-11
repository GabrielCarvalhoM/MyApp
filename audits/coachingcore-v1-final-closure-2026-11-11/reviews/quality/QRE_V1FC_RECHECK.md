# QRE recheck of the V1FC fix cycle (QRE-V1FC-RECHECK-r1)

**Commit:** `06bbc7f` (on top of `2d089c0`), reviewed as `git archive` extracts. This was the one narrow recheck the cycle allows; `QRE_V1FC_RECHECK.json` is authoritative.

**Verdict: READY_WITH_CONDITIONS.** The V1-scoped CoachingCore is ready to freeze from the reliability side.

## My findings

| Id | Status | Evidence |
|---|---|---|
| QRE-V1FC-01 (blocking) | CLOSED | A marathon date change asks for a new plan (`newProgramInput`), whether sent as `EVENT_DATE_CHANGE` or as a same-kind `GOAL_CHANGE`, at +9 to +105 days. Restating the same date keeps the plan. The 5K and 10K date rule is unchanged. Mutant N01 is killed. |
| QRE-V1FC-02 (blocking) | CLOSED | A missing or unknown condition, an unrecognized sign key or a non-boolean answer is now asked, exactly as the research engine asks it. Across 88 checks over every condition: when every sign is answered no, the plan is kept; any single yes holds, with the same guidance level as the research engine; fields V1 does not read are never asked. Mutant N03 is killed. N02 is an equivalent mutant: a yes sign is already routed before `readWellbeing` runs. |
| QRE-V1FC-03 | OPEN, non-blocking | A repeated session report still gets `ENGINE_CONTRACT_VIOLATION`. This is a condition of INTEGRATION_READY. |
| QRE-V1FC-04 | CLOSED | The V1 restart is HOLD `record.outsideV1Scope` over a record holding a temporary-reduction report. Mutant N04 is killed. |
| QRE-V1FC-05 | OPEN, non-blocking | Integration condition: pass no options. The comment is corrected. |
| QRE-V1FC-06 | Condition of the freeze record | The committed records file (`b2bcc23a…`) is bound to the old extension hash `e53a282d…`, while the pin is now `8a4ba9b3…`. So at `06bbc7f` the 5K is off by default and the marathon is UNSUPPORTED. The freeze must name the records file and its hash, and report the 5K state against it. |
| QRE-V1FC-07 | CLOSED, one residual | Mutants M04, M09, M15, M26, M30 and M35 are now killed. The residual, M26b, replaces the module constant so it reads the bytes without the pin check; it survives because the committed file equals the pin, and it is covered by my probe on altered and missing bytes. |

## New finding

| Id | Severity | Blocking | Reproduction | Smallest fix |
|---|---|---|---|---|
| QRE-V1FC-08 (for Security) | LOW | No | Mutant N06: if the V1 entry's version gate is set to always true, the full suite still passes. The legacy inputs in the test are refused further down, so they do not test the gate. | Add a test with a well-formed `R5-INPUT-1` intake, asserting that V1 returns INVALID_INPUT and no program. |

## Checks rerun on `06bbc7f`

- **Suite:** 1258/1258, run twice; no test was flaky.
- **Differential:** byte-identical to `3b14804`, 990 digest lines over 48 programs (10K, half marathon, non-event) and their reviews, under both the development and the default authority. Nothing existing moved. The intended `MISSED_SESSION` change is not exercised by these inputs; its test kills mutant N05.
- **Regressions from the fixes:** none found.
  - V1 scope sweep: 490 checks, 0 violations.
  - Offer path: 178 checks, 0 violations.
  - Extension fail-closed: altered bytes, missing file, malformed records and records bound to other bytes all fail closed.
  - Custody schema 3: 5K and marathon round trips work in both stores, and the seal verifies.

## States

- **RUNTIME_CORRECTNESS:** READY_WITH_CONDITIONS.
- **V1_SCOPE_ENFORCED:** yes, for both the temporary reduction and marathon eligibility.
- **EVENT_EXTENSION:**
  - 5K: off at `06bbc7f` until a record is bound to `8a4ba9b3…`.
  - MARATHON: off (UNSUPPORTED).
- **F08_STATUS:** Situation 1 is out of V1.
- **RECORD_CUSTODY_STATUS:** a reference implementation on synthetic data.
- **INTEGRATION_READY:** NO.
- **Real athletes:** NOT AUTHORIZED.

The probes are in `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/59c304d8-d767-447e-b589-a66e8b74bd72/scratchpad/qre-probes` (`p2d-*`, `p1d-*`, `p5b-*`, plus the earlier scripts rerun).
