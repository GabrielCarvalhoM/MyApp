# QRE_CORE_R2: narrow recheck of the one correction cycle

- **Judge:** Quality & Reliability Engineer, the same independent instance as R1. I wrote none of the code, tests or cycle records.
- **Candidate:** `430c493`. Cycle record and evidence: `6f747f2` (`CYCLE1.md`, `REGRESSION.md`).
- **Scope:** as dispatched: QRE-CORE-01 to QRE-CORE-07, preservation (J5/P16), and the one new suite failure. QRE-CORE-02 is judged in the light of `reviews/ssctr/SSCTR_CORE_R1.md`.
- **Method:** by execution on a clean `git archive 430c493` in `C:/Users/carva/AppData/Local/Temp/qre-core-r1-1795033884/r2/`. Probes are in `…/probes/`, logs in `…/logs/`. Nothing in the repo was edited except this file. No verify script was run and git state was not changed.

## Verdict: **READY_WITH_CONDITIONS**

Both R1 blockers are closed as blockers:
- **QRE-CORE-01 is fixed.** The E-1 re-merge now composes through the carried record.
- **QRE-CORE-02 is no longer a blocker for this verdict.** The behavior it moves is now stable, and SSCTR has accepted it as rule L1. What remains is the test restatement SSCTR itself made a pre-freeze condition (C-C1), which has not been done.

QRE-CORE-03 and QRE-CORE-04 are fixed. QRE-CORE-06 is fixed for the readings, with one record inconsistency left (QRE-CORE-R2-01). No reliability regression was found. The conditions in §2 carry owners and triggers. None is cleared by this verdict.

## 1. Rechecked findings

| Finding | R1 | R2 | Evidence (command, observed) |
|---|---|---|---|
| **QRE-CORE-01** | BLOCKING | **CLOSED** | See note 1 below |
| **QRE-CORE-02** | BLOCKING | **CONDITION (before any freeze)** | See note 2 below |
| **QRE-CORE-03** | CONDITION | **CLOSED** | See note 3 below |
| **QRE-CORE-04** | CONDITION | **CLOSED** | See note 4 below |
| **QRE-CORE-05** | CONDITION | **Test CLOSED; wiring stays a CONDITION** | See note 5 below |
| **QRE-CORE-06** | CONDITION | **CLOSED for readings; one residue (QRE-CORE-R2-01)** | See note 6 below |
| **QRE-CORE-07** | CONDITION | **CLOSED, with one weak assertion left (NOTE)** | See note 7 below |

**Note 1 (QRE-CORE-01).**
- `e1-diff.mjs` compares one call against one call per report with the record carried through JSON. The R1 sequences now diverge in **0 of 7** (R1: 6 of 7).
- `e1-dump.mjs worse-after-resync`: the athlete corrects to ADVERSE after a re-sync. The edit gives `adverse: 1` and so does the Sunday probe. There is no conflict and nothing is excluded. The base gave 1; `0b8e45a` gave 0.
- Conflict, then a correction from either voice: resolved, `conflicted: false`, and the other voice is kept.
- Extended probe `e1-diff2.mjs`: athlete A→A2→A3, three voices with W then A corrected, a third voice arriving after a re-sync then an athlete edit, a replayed correction, two conflicting corrections, a conflict that persists, and not-completed then completed. **7 of 8 are identical** in both modes.
- The one divergence is pre-existing on the base (QRE-CORE-R2-03).
- The cycle test `v1core-cycle1` (five sequences, carried vs one call, one live row each) passes.

**Note 2 (QRE-CORE-02).**
- SSCTR R1 §4 accepts the 16 RWS reading changes as L1's own merged reading, with conditions C-C1 to C-C5.
- My R1 ground for blocking was that the E-1 composition was not yet defined. QRE-CORE-01 being closed removes that ground.
- Still not done: C-C1 (successor tests restating each of the 16 scenarios in as-if form, with QRE judging their strength) and C-C2 (a legacy row with no parts keeps `REPORT_NOT_CARRIED`, tested at the RWS level). `CYCLE1.md` says the invariants are restated in `FINAL_READINESS_REPORT.md`. That file is not in `430c493` or `6f747f2`, and a document is not an executable restatement in any case.
- Until this is done, the 16 tests stay red and stop at their first assertion, so **their later invariants (race evidence, conflicts, sizing source, history reference) are not executed on the candidate at all.** See QRE-CORE-R2-02.

**Note 3 (QRE-CORE-03).**
- `f99.mjs`: after a restart, a new report carrying a forged `context` and `comparable: true` is stored as `UNPLANNED` with `comparable: false` (on `0b8e45a` it was kept as `RUN:EASY`).
- `forged-effect.mjs`: the answers with and without the forged context are now identical. Before the cycle they differed in `runFormat.history.runs`.
- The strip is limited to `incoming:true`. It is passed only at the two review call sites (`r6-adaptation:569,605`). The learning model, legacy and inventory readers do not strip, and preservation confirms they are unchanged.

**Note 4 (QRE-CORE-04).** `parts-forge.mjs`:
- `BOGUS` response values, negative or non-numeric measures, a `null` part and a part without `actual` are all not read.
- In each case the correction replaces the row as before. Nothing throws, and no invalid value reaches the live row.
- The cycle test passes three malformed forms through the engine with no HOLD and no row lost.

**Note 5 (QRE-CORE-05).**
- `v1core-cycle1` "through the V1CIB custody with the new entry injected": a sign after the date gives `CLINICAL_HUMAN_REQUIRED`, and the answer is kept.
- `expiry-adv.mjs`: custody with its **default** engine (`v1-index`) still answers `UNSUPPORTED` (unchanged, as declared).
- The wiring belongs to the integration mission (C-INT below).

**Note 6 (QRE-CORE-06).**
- `exp06.mjs`: the post-expiry clinical answer's `runSessions`, `runFormat`, `runCalibration`, `runForecast`, `paceInsights`, `paceRevision`, `strengthExposure` and `qualityAssessment` are byte-equal to the refusal's. `updatedModel` and `weekEvidence` are absent.
- The ledger (with the `CLINICAL_HOLD` fact) and `referenceState` come from the clinical reading, as they should.
- The authority-mislabel note from R1 QRE-CORE-08 is also fixed. A caller `authority`, altered or missing records, and another policy each give an unmarked `UNSUPPORTED`.

**Note 7 (QRE-CORE-07).**
- The restart assertion is now pinned to `KEEP`. The readiness status after the date is pinned to `CLINICAL_HUMAN_REQUIRED`. The integrity-after-the-date test runs on 2027-05-02.
- The B-01 matrix's conditional `if(r.runFormat?.warningSignScreen)` does execute: `b01.mjs` shows the screen object present with `REQUIRED` on `430c493` and `NOT_RAISED_BY_THIS_EXTENSION` on `0b8e45a`, so the test can fail.
- Weak spot: the QRE-CORE-06 test only asserts `status !== 'AVAILABLE'/'ACTIVE'`, not equality to the refusal. My probe covers that gap, but the test does not.

**Preservation.** I ran P0 `lab/oracle.mjs` in the `430c493` archive. The generated `j5.json`, `p16.json` and `j5-answers.json` are byte-identical (sha256 `81f2cb7d…`, `75995397…`, `6958e5da…`) to the files committed at `16577b6`, and the replay from the fixtures passes.

**Full suite.**

| Tree | Tests | Pass | Fail | Wall |
|---|---|---|---|---|
| clean archive `430c493` | 1661 | 1638 | 22 + 1 skipped | 281 s |

- The skipped test is the V1STR freeze check, which skips in an archive and fails in a worktree. This matches the Chief's worktree count of 23.
- Against `0b8e45a` there is exactly **one** new failure, `SSCTR-RWS-B-01: the signal survives time…` (`v1rws-fix-forward:316`).
- There is no material change in wall time (base 277 s, `0b8e45a` 256 s, `430c493` 281 s).

**The new failure.**
- *Cause:* the test pins that a carried row of a session the plan does not name, with no report fact beside it, raises no screen. The B-01 fix now reads a stop on any row not known to be another sport's, so this gives `REQUIRED`.
- *Isolated:* in a temporary copy of the test I changed only that expected value (line 317, `'NOT_RAISED…'` → `'REQUIRED'`). **The rest of the test then passes**: duplicates, a correction that changes only the reason, a merging update, an exact instant that clears the stop, and an instant before the stop that does not. The athlete filter still holds (`someone-else` gives `NOT_RAISED`).
- *Clearing still works:* a row with no `firstRecordedAt` has no finite instant and is not read, and an answered screen still clears the stop.
- *QRE judgment:* this is **not a reliability regression**. It is a narrow, more conservative widening, and the case stays answerable. Its sporting acceptance is SSCTR's. The pinned value needs a successor assertion (under QRE-CORE-R2-02).

## 2. Remaining findings

### QRE-CORE-R2-01: CONDITION (owner: Chief, SSCTR to choose; trigger: before freeze). After expiry, the clinical answer records format emissions it does not deliver

**Evidence.** `exp06.mjs` / `exp06b.mjs` on the `430c493` archive, a sign on 2027-05-02:
- the answer's `runSessions` is `{}` (the refusal's);
- its `runFormatRecord` holds **16** facts, against 12 carried and 12 in the refusal;
- the 4 extra facts are `RUN_FORMAT_EMITTED` for `w3-run-d1/d3/d5/d6`, taken from the reading with the dates set aside.

Before the date, the same review returns 12 `runSessions` keys (0 executable) and those same 16 facts. So after the date, the kept record says formats were emitted that the athlete was never shown, under an expired authority. Later readers match reports against `RUN_FORMAT_EMITTED`.

**Minimal fix.** After the date, either keep the refusal's `runFormatRecord` (plus only the facts the clinical route itself records), or deliver the reading's non-executable `runSessions` as before the date. Choose one and test that the record matches what the answer delivers.

### QRE-CORE-R2-02: CONDITION (owner: Chief; trigger: before any successor freeze). The accepted RWS and B-01 changes have no executable successor assertions; 17 pinned tests are red and stop early

The 16 RWS tests (SSCTR C-C1), the C-C2 legacy-row withholding test and the B-01 pin at `v1rws-fix-forward:317` need successor tests. Each should restate the accepted reading (word, `wholeRow`, band edges, history reference, race evidence, sizing source) with the as-if equality. Historical tests stay unedited.

While these 17 tests stay red, every assertion after their first failing line goes unexecuted. For the B-01 test I showed the rest passes. For the 16 RWS tests nobody has shown it.

A freeze needs these successor tests, plus a ledger that maps each red test to its successor.

### QRE-CORE-R2-03: NOTE (pre-existing, not this line). A forked correction chain inside one call leaves two live rows on one session

`e1-diff2.mjs` "stale correction of A after A2", in which a second `correctionOf: 'A'` arrives after `A2` has already corrected A:
- **one call:** two live rows on `w0-run-d1` (`A>12` and `A>13x`);
- **carried:** one row, `conflicted: true`.

The base `16577b6` gives the same divergence, with two live rows in one call. The cause: `old` is the in-memory merged row that `retire` replaced by a copy. The `old.superseded!==true && !accepted.includes(old)` branch then deletes `byEvent[old.eventId]` and `byIdentity`.

This is not a regression of this line. Route it to the queue: a stale fork should be the conflict the carried path makes.

### C-INT: CONDITION carried to the integration mission (QRE-CORE-05 and SEC/SSCTR wiring items)

The app and custody must call `v1-safety-index.mjs` under `V1_CORE_ENGINE`. Custody's default engine still answers `UNSUPPORTED` to a sign after expiry. An integration-level expiry test is needed.

### NOTE

- Record growth (×1.61) and performance are unchanged from R1.
- `repro-p0.mjs` still runs its expiry branch through `v1-strength-index`. The cycle test now carries the evidence, so this is a documentation note only.

## 3. Next action

1. Hand back to the Chief with READY_WITH_CONDITIONS: R2-01 and R2-02 before freeze, C-INT for integration, R2-03 to the queue.
2. No further QRE cycle is requested. R2-02's successor tests are judged when the freeze is prepared.
