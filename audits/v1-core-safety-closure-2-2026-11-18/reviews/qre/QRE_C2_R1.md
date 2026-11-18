# QRE_C2_R1: independent review of the closure-2 candidate

- **Judge:** Quality & Reliability Engineer (Opus 5.5). I wrote none of the code, tests, specs or records under review.
- **Candidate:** `219fb1c`. `8f54df6` changes only `CANDIDATE.md`.
- **Scope:** as dispatched: QRE-CORE-R2-01, QRE-CORE-R2-02 (successors and ledger), regression, B-01-R persistence, SEC-CORE-14 record continuity, and CORE-C2-F01.
- **Method:** I worked by execution on clean `git archive` extracts of `219fb1c`, `4c60915` and `7e03f84`, each with `node_modules` copied in. They are under `C:\Users\carva\AppData\Local\Temp\claude\858165ffefe5d744\e77e036a-2f59-45a8-a9e2-8287ec437c76\scratchpad\qre-c2r1-1795041146\`, with probes in `probes\` and logs in `logs\`.
  - On the worktree I ran only read-only commands: `--preserved`, the two freeze tests, and `make-successors --check`.
  - Nothing in the repo was edited except this file. No verify script was run, and git state was not changed.
  - Other judges' untracked review files appeared under `reviews/` during this review. I did not read them.

## Verdict: **READY_WITH_CONDITIONS**

- **QRE-CORE-R2-01: closed.**
- **QRE-CORE-R2-02: closed as a blocker.** The successors are mechanically sound. No historical assertion is dropped. All 20 fail on `7e03f84` by assertion. Where they state a literal instead of an executed control, I executed the control and it agrees.
- **Regressions:** none. The failure set is identical to `4c60915`.
- **B-01-R:** the fix persists across ASK, restore, restart and duplicates.
- **SEC-CORE-14:** keeps record continuity.
- **CORE-C2-F01:** confirmed, root cause located, and pre-existing. It does **not** block this successor freeze if the freeze record declares it. It does block any athlete-facing or integration acceptance.

There is no blocking item, so no correction cycle is requested by QRE. The conditions in §2 carry owners and triggers.

## 1. Per-item results

| # | Item | Disposition | Command / evidence | Observed |
|---|---|---|---|---|
| 1 | **QRE-CORE-R2-01** | **CLOSED** | See note 1 | No undelivered format is recorded after the date |
| 1b | CANDIDATE §5 (standing hold after the date) | **Not an R2-01 residue; NOTE → C-INT / SSCTR** | See note 1b | The record matches the answer; the answers change shape from one day to the next |
| 2a | R2-02 mechanics | **PASS** | See note 2a | Generated files are current; historical files untouched; no extra tests |
| 2b | R2-02 strength | **PASS, with one ledger condition** | See note 2b | No assertion dropped; every successor discriminates; literals checked by execution |
| 3 | Regression | **PASS** | See note 3 | Same 22 failures as the base, all attributed; 23 on the worktree |
| 4 | B-01-R persistence; SEC-CORE-14 continuity | **PASS** | See note 4 | The stop survives restore, restarts and duplicates; the valid part survives a re-sync |
| 5 | **CORE-C2-F01** | **CONFIRMED, pre-existing, root cause located; non-blocking for this freeze under QRE-C2-02** | See note 5 | 60/60/60 min instead of 50/50/50, from superseded rows |

**Note 1 (QRE-CORE-R2-01).**
- `node probes/r201.mjs <tree>` and `<base>`. A sign on 2027-05-02:
  - **tree:** `CLINICAL_HUMAN_REQUIRED`, EXPIRED. `runSessions` 0. Record 12 → 12, 0 new `RUN_FORMAT_EMITTED`.
  - **base `4c60915`:** record 12 → 16, 4 undelivered (the original finding).
  - **2027-04-28 (before the date):** identical on both trees: 12 sessions, 0 executable, 4 new emissions, all delivered.
  - `runEvidenceRecord` and `runHistoryRecord` equal what was carried in both cases.
- RED check: `v1core-closure2.test.mjs` on `4c60915` sources fails both R2-01 tests for the right reason ("emitted but not delivered: w3-run-d1"; "no format emitted after the date").

**Note 1b (CANDIDATE §5, the standing hold after the date).**
- Restored, the next day after expiry (05-03): the engine's own `CLINICAL_HUMAN_REQUIRED` lists 12 sessions, 0 executable, and records 8 new formats, **all for sessions it lists**. So the record says what the answer delivered.
- Unlike the day before, it carries no `authorityExpiry` marker.
- Before the date the same answer has the same shape (12 sessions, nothing new emitted).

**Note 2a (R2-02 mechanics).**
- `make-successors.mjs --check`, on the archive and on the worktree: "checked 7 files, 19 successor tests", exit 0.
- The generator writes only `test/<target>`, and the ledger outside `--check`. All targets are `v1core-successor-*`, distinct from every historical name.
- `git diff --name-only 7e03f84 219fb1c -- CoachingCore/test` shows only `v1core-*` files, so every historical test is untouched.
- Each successor file has only `SUCCESSOR closure-2` tests: 1/1/1/9/1/2/4 blocks, and no stray `test(`, `it(` or `describe(`.

**Note 2b (R2-02 strength).**
- `probes/../assertcount.mjs` rebuilds each successor from historical + declared substitutions.
  - It reconstructs 19/19.
  - No substitution has fewer `assert` calls than it replaces.
  - Assertion counts are equal or higher in every successor (for example e01 stored 13 → 21, rfc-evidence 12 → 14).
- On `7e03f84` (before E-1): `node --test test/v1core-successor-*.test.mjs` gives **20/20 fail, all `ERR_ASSERTION`**. That is all 20 successors, not just the 9 the worker reported.
- On `4c60915`: all 20 pass.
- Literals and executed controls are covered under QRE-C2-03 below.

**Note 3 (Regression).**
- Full suite, archive `219fb1c`: **1690 tests, 1666 pass, 22 fail, 2 skip**, 454 s.
- Full suite, archive `4c60915`: **1661 tests, 1638 pass, 22 fail, 1 skip**, 452 s.
- The `diff` of the two failure-title lists is **IDENTICAL**.
- The 22 fail locations are the 19 ledger entries (lineage:146 counts twice, EASY and LONG) plus `v1rc-calibration:325` and `v1rws-engine:157`.
- On the worktree, `v1core-freeze.test` gives **ok** and `v1str-freeze.test` gives **not ok** ("CHANGED outside this extension"). The worktree total is therefore 1667/23, matching the Chief.
- `node scripts/v1core-freeze.mjs --preserved` on the worktree, exit 0:
  - V1-FREEZE-1 190/198 + 8 amended;
  - RC 30/30;
  - RWS-2 97/98 + 1;
  - RFC 163/163;
  - STR 121/121;
  - nothing else changed since `16577b6`;
  - no untracked file.
- P0 `oracle.mjs` on the archive: all 90 files of the P0 folder are byte-identical before and after (sha256 lists diffed). It writes only `ios/Tests/P0HostTests/Fixtures/{j5,p16,j5-answers}.json`, and `replayFromFixture` is true for J5 and P16.
- Bench rerun `bench.mjs <base 4c60915> 5`: median ×0.925, p95 ×0.967, record bytes ×1.000 (noise). The recorded file gives ×1.007 / ×1.011.

**Note 4 (B-01-R persistence and SEC-CORE-14 continuity).** `probes/b01r.mjs`, on the tree and the base.

*B-01-R:*
- ASK record → JSON restore → restart → asked (1 fact). Restore again → second restart → still asked (1 fact). The base keeps 0 facts and does not ask.
- A replay of the original after a restart adds nothing. The same stop under a new event id adds one fact, as a second statement.
- A screen dated between the session and the report's arrival does not clear the stop, because the stop is timed at `recordedAt`. That is conservative.
- 200 distinct unplanned ids in one ASK give +200 facts. A planned session with 200 event ids gives the same +200, so this is parity and not a new amplification.
- A refused instant names the screen and records nothing (`probes/refused.mjs`). The next valid review asks again only if the report is resent; see C-INT.

*SEC-CORE-14:*
- After the re-sync over a malformed `g1` part: one live row with parts, `inputHashes` and `mergedSourceIds` = {a1, d1b}, ADVERSE kept. The superseded row still holds `g1`, so history stays append-only.
- A later athlete correction of a1 gives parts {a2, d1b} and keeps the device's corrected minutes.

**Note 5 (CORE-C2-F01).**
- `probes/p14-body.mjs`, built on the historical e01 helpers, run on tree, base and pre:
  - 4 superseded rows: **EASY 60/60/60, LONG 100** (280 run min per week, weeks 0–2);
  - the direct merge, the merged control, or the same record with the superseded rows filtered out: **50/50/50** (250).
  - Identical on all three trees.
- Mutant `mutF01`: adding `o.superseded!==true&&` to `runRows` in `src/v1-f08.mjs` (C-Q08-1, the record's bound on stated recent exposure) gives 50 in 8/8 cases.

## 2. Findings

### QRE-C2-01: CONDITION (owner: Chief; trigger: before the successor freeze is written). The ledger does not list the three preservation tests

`SUCCESSOR_LEDGER.json` maps 19 entries (20 red tests). The three freeze-preservation tests (`v1rc-calibration:325`, `v1rws-engine:157`, `v1str-freeze:15`) are mapped only in `CANDIDATE.md` §3 and in a comment in `v1core-freeze.test.mjs`. The freeze binds the ledger by hash, so it should be the whole map of the 23.

- **Minimal fix:** a declared static `preservation` section in the generated ledger, mapping those three to `test/v1core-freeze.test.mjs` + `scripts/v1core-freeze.mjs --preserved`.
- **Result test:** `--check` still passes, and the ledger's historical locations equal the suite's failing locations (23 in the worktree).

### QRE-C2-02: CONDITION (owner: Chief to route; next mission Core/F08 restart with SSCTR for the C-Q08-1 rule; trigger: declared in the freeze record now, fixed before any integration acceptance or athlete-facing use). CORE-C2-F01: restart sizing counts superseded rows

**Cause.** `restartIntake` (`src/v1-f08.mjs`, C-Q08-1) sums `actual.minutes` over every executed RUN row in the last 28 days, superseded rows included. So the record's cap on the stated recent exposure is looser than the record supports. A correction, with or without a second source, gives +10 min on each easy run of the new plan (+12% weekly run minutes) against the as-if control.

**Status.** It is pre-existing (identical on `7e03f84`) and lives in a file this line does not amend. Fixing it is a dose rule, which this mission forbids.

**Why it does not block this freeze.** This successor freeze changes nothing on that path, and no successor pins 60. The rws-e01 successor's comment names the gap.

**Required now.** The freeze record must name CORE-C2-F01 as a known open defect, so that no reader takes the freeze as covering restart sizing.

**Minimal fix (next mission).** Read only rows not superseded in C-Q08-1 (and in `done` / `prior.observations` if SSCTR agrees). In the mutant, the single condition on `runRows` restores 50 in 8/8 cases.

**Result test.** A restart from a record holding a correction (lists, plain, alone, with and without a watch) sizes the new plan exactly as the same record with superseded rows removed, and as the direct merge.

### QRE-C2-03: NOTE (owner: Chief; trigger: optional, at the next edit of the successor specs). Where the successors use literals, not an executed control

Most as-if comparisons are executed: `asIfReading` / `readingOfRow` / `directMerge` / `easyDirect` / `queuedDirect` / `neverCorrected` / `none`.

The exceptions:
- **Lineage, stored records (restart) and queued review:** these compare with `asIfWord(...)`, the row-02 word as a literal. It is anchored only by the matrix test's single-review execution.
  - I executed the controls on those paths (`probes/lineage-asif-body.mjs`).
  - Restart: row 03 `["SEVERAL_RECORDINGS"]` = row 02 executed `["SEVERAL_RECORDINGS"]`, with equal edges.
  - Queued: with and without the re-sync, every reading is equal (answer, admitted, week after, easy `[345,420]`, bare `[345,575]`).
  - So the literals are correct. An executed control would make the relation self-proving.
- **Literal but declared, and no less conservative:**
  - lineage rows 04/12/20 (SEC-CORE-03, still withheld; row 04's new `mergedSourceIds` is a literal);
  - the e01 lost-lineage `wholeRow` (more conservative than the direct merge).
- **Inherited weakness, not new:** `v1rfc-cycle`'s renamed control is skipped by its own `if(renamed.adherence)` guard, both historically and now.

### QRE-C2-04: NOTE → C-INT / SSCTR (trigger: before integration). After the date, consecutive clinical answers change shape

- Day 1 after expiry: the re-read clinical answer delivers the refusal's readings (0 sessions) with `authorityExpiry: EXPIRED`.
- Day 2: the engine's standing hold, which precedes the authority read, lists 12 non-executable formatted sessions with no marker, and records their formats.

The record is coherent with each answer, so this is not R2-01. Whether the standing hold may present formats from an expired repertoire is SSCTR's (authority) and integration's (presentation) to decide. If the answer is "no":
- **Minimal fix:** apply the same READINGS substitution and marker to the standing hold after the date.
- **Result test:** two consecutive post-expiry answers carry the same readings and the same marker.

### C-INT (carried, unchanged; integration mission)

From R2:
- wiring `v1-safety-index.mjs`;
- custody's default engine.

Added here:
- under a refused instant the stop is named and not kept, so custody must keep and resend the unsent report;
- an ASK answer's `runFormatRecord` must be kept by custody, since the B-01-R fact lives there.

## 3. Next action

Hand back to the Chief with READY_WITH_CONDITIONS:
- QRE-C2-01 and the QRE-C2-02 declaration before the freeze is written;
- QRE-C2-02's fix in the next mission (Core/F08 + SSCTR);
- QRE-C2-03 optional;
- QRE-C2-04 and C-INT to integration.

No further QRE cycle is requested.
