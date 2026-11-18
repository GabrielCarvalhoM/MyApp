# CORE-C2-F01: the focal correction cycle (one, used)

**Input:** QRE_F01_R1 (READY_WITH_CONDITIONS) and SSCTR_F01_R1 (ACCEPT_WITH_CONDITIONS), both on `576e40c` and committed as received (`be2ea69`).

**Runtime:** no change. `CoachingCore/src/v1-f08.mjs` is the bytes of `576e40c`. The cycle changes only a test file, the freeze verifier and the records.

| Condition | What was done |
|---|---|
| **QRE C1 / QRE-F01-01** (gates `--write`) | <ul><li>CANDIDATE §2 is corrected: "never raised" holds for the rule, not for every record against `d92aa88`. On a record that holds execution reports but none in force (shapes A and P4), the stated exposure is now unbounded.</li><li>§7 is annotated.</li><li>Test `QRE-F01-01 (open, SSCTR C-F01-1)` pins `recent`, `bounded`, the pause and the last executed day for A and for P4 (built through `normalizeObservations`). Each equals its in-force record. RED on `d92aa88` (13/1).</li><li>The question is routed to SSCTR: `reviews/ssctr/SSCTR_F01_R1_ADDENDUM.*`.</li></ul> |
| **QRE C2 / QRE-F01-05** | `scripts/v1core-freeze-2.mjs`: <ul><li>(a) `--write` refuses unless `QRE_F01_R1.md`, `SSCTR_F01_R1.md` and `SSCTR_F01_R1.json` are committed and bound;</li><li>(b) it also binds `CANDIDATE.md`, `F01_SUCCESSOR_LEDGER.json`, `evidence/` and all of `reviews/` (the addendum included);</li><li>`--check` now also re-reads the record's fields: revision, base, the earlier records' hashes, the amended file's hashes, the bound commit as an ancestor of HEAD, and the required reviews;</li><li>the untracked-file check covers all of `CoachingCore` and this audit folder.</li></ul> |
| **QRE C3 / QRE-F01-04** | Test `QRE-F01-04: trainedAfter reads only executions in force`. <ul><li>A valid readiness declaration (built with `readReadiness` and `readinessFact`), then a run after it that is corrected to "not done": the declaration still stands in, as in the in-force record.</li><li>The same run left in force is training after the declaration.</li><li>RED on `d92aa88`. It kills QRE's mutant M1 (19 pass, 1 fail on the mutant).</li></ul> |
| **QRE C4 / QRE-F01-02, -03; SSCTR R-F01-2** | **Declared residuals, not changed.** They need a record the engine never writes. Each is at or below `d92aa88` and is bound by SSCTR C-F01-2 (the restart receives the record exactly as the engine last returned it; QRE and Security decide whether a self-contradicting record should HOLD). <ul><li>**QRE-F01-02:** two different copies of one `eventId` are read first-wins, so the result depends on order (110 or 93; base gave 115).</li><li>**QRE-F01-03:** an original kept unmarked beside its correction, or a stale separate copy of a merged part, is counted twice (113 against 100), as by every V1 reader that relies on the `superseded` mark.</li><li>**R-F01-2:** a strength row and a run row with the same `eventId` drop the run (38 against 50).</li></ul> |
| **QRE C5** | Carried: the iOS revalidation of the relinked bundle (Mac README §8). |
| **SSCTR C-F01-1** | Open, owned by the next Core mission. Pinned by the QRE-F01-01 test, so a decision there is a visible test change. |
| **SSCTR C-F01-3, carried conditions** | Unchanged: SEC-CORE-03 with C2-C2; C2-C3, C-C3, C-C4, C-C5, A-C1/2/3/5. |

No further QRE cycle is needed, since QRE C1 closed without a code change, per QRE_F01_R1. Under the bounded-cycle rule, a SSCTR addendum that required a runtime change would close this line with a blocker instead of opening a second cycle.

## SSCTR addendum (`reviews/ssctr/SSCTR_F01_R1_ADDENDUM.*`)

**SSCTR's answer.** The decision is still ACCEPT_WITH_CONDITIONS, with no runtime change now. C-Q08-1 does apply in substance when the record holds execution reports but none in force. The `rows.some(executed)` gate is an old gap between the code and the rule, and it is carried.

**Condition C-F01-1 r2 replaces C-F01-1.**
- It is **not binding for FREEZE-2 or for synthetic use.** It **binds before any real-athlete use of `restartProgram`**, and the integration readiness report must list it as an open blocker.
- Owner: the next Core mission, then SSCTR review. Item (ii) also goes to Security, which owns SB-1.
- Scope:
  - (i) C-Q08-1 applies, by bound or by ask, whenever the record holds this athlete's execution reports in the window.
  - (ii) A session every report of which says it was done, with only its amount disputed, is an execution for the pause, the last executed day and `trainedAfter`, with its minutes counted conservatively.
  - (iii) A "not done" in force is not an execution.
  - (iv) The open-labelled tests are re-pinned to the decided reading.

**Correction of SSCTR R1 item 4.** The HOLD and CLINICAL_HUMAN_REQUIRED returns are unchanged in code. But in shape (b) after a readiness declaration, the SB-1 question (the reason of a new stop) is not asked: the disputed session reads as no session. That is also true on `d92aa88` for a direct app-vs-watch conflict, so it predates this line. It is open under C-F01-1 r2 (ii).

**Added at SSCTR's request.** The test `SSCTR_F01_R1_ADDENDUM: after a readiness declaration ...` pins two cases:
- (a) a run corrected to "not done" gives `readinessDeclared:true`, which is the correct reading;
- (b) a disputed amount gives `readinessDeclared:true` and the run's last executed day from before the declaration, labelled "open C-F01-1 (ii), SB-1 question not asked".

**Residuals.** QRE-F01-02, QRE-F01-03 and R-F01-2 are accepted as residuals under C-F01-2.

**FREEZE-2.** SSCTR allows the `--write` once these edits and tests are recorded and the record names C-F01-1 r2 as open.

**Proposed queue items (not appended).** HQ-CORE-F01-SSCTR-A, and HQ-CORE-F01-SSCTR-B widened to C-F01-1 r2 (i)–(iii).
