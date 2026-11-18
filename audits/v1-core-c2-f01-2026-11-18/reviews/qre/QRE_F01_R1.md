# QRE_F01_R1: independent Quality & Reliability review of CORE-C2-F01 candidate `576e40c`

**Judge:** Quality & Reliability Engineer (independent instance; did not author the fix). 2026-11-18.
**Scope judged:** `git diff d92aa88 576e40c` (one source file `CoachingCore/src/v1-f08.mjs`; tests `v1core-c2f01-restart-sizing.test.mjs` (18) and `v1core-c2f01-freeze.test.mjs`; verifier `scripts/v1core-freeze-2.mjs`; Mac package `core-oracle.mjs`, the relinked bundle, `core.json`, `focal.json`, `build-manifest.json`), and the record `CANDIDATE.md` (including the uncommitted line the Chief added on disk: suite on `576e40c` 1709/1685/24), `F01_SUCCESSOR_LEDGER.json`, `evidence/`, `bench/`.
**Not in scope:** the dose rule C-Q08-1 itself, SEC-CORE-03, iOS device execution.

## Verdict: **QUALITY_READY_WITH_CONDITIONS** (READY_WITH_CONDITIONS)

The fix is correct against the mission's oracle (the same restart over a record holding only the rows in force), minimal, and in line with how every other V1 reader and `normalizeObservations` define rows in force. RED is real (14/18 on `d92aa88`, reproduced). GREEN is 18/18. Across the whole suite, in the same environment, no test changes status between base and candidate. The Mac package keeps J5/P16 and the eight earlier `core.json` journeys byte-identical, and the bundle diff equals the source diff.

One condition stops the dependent step, the FREEZE-2 `--write` (QRE-F01-01). The candidate raises the effective dose relative to `d92aa88` on one narrow class of record. It does this by removing a bound that only the defect supplied. The record says the opposite ("only ever lowered ... never raised"; "confined to removing double credit"), and SSCTR has not been asked about this class. The behaviour is consistent with the oracle and with a pre-existing gate, so the code is not wrong by the mission's definition. But the dose movement must be stated, and SSCTR must dispose of it before a freeze binds it.

## Findings

| ID | Severity | Summary |
|---|---|---|
| QRE-F01-01 | **Condition, gates FREEZE-2 write** | On a record with no execution in force (all executions corrected to "not done", or replaced by a correction that is itself conflicted), the C-Q08-1 bound no longer applies. The stated exposure passes unbounded where `d92aa88` bounded it. The record's "never raised / confined to double credit" claims are inaccurate. |
| QRE-F01-02 | Non-blocking | `once()` keeps the first row of a duplicated `eventId`. With differing copies (a malformed record), the bound depends on record order. |
| QRE-F01-03 | Non-blocking, residual | A record that holds an original *unmarked* beside its correction, or a stale separate copy of a merged part, is still counted twice. The engine never emits these shapes, and all V1 readers share this reliance on the `superseded` mark. |
| QRE-F01-04 | Non-blocking | The `trainedAfter` use of `executed()` is untested: mutant M1 survives all 197 tests in the restart, F08 and readiness files. |
| QRE-F01-05 | Non-blocking | Verifier `v1core-freeze-2.mjs`: `--write` binds whatever reviews are committed (possibly none) and does not bind `F01_SUCCESSOR_LEDGER.json` or `CANDIDATE.md`. `--check` does not re-verify the record's metadata fields. |

### QRE-F01-01: removing replaced rows can lift the C-Q08-1 bound entirely (dose raised against base); record misstates it

**Mechanism.** The bound is gated on `rows.some(executed)` (`v1-f08.mjs`, unchanged line). `executed()` now excludes `superseded:true`. When every execution report in the whole record is either replaced (with a correction to "not done") or replaced by a correction that `normalizeObservations` flags `conflicted`, then no row is `executed`. The gate then skips C-Q08-1, and the athlete's stated exposure stands unbounded. On `d92aa88` the replaced row kept the gate open, and the bound applied.

**Evidence** (`probes/probe2.mjs`, `probes/probe.mjs` P4, run on both trees; intake states 600 min/week, 7 days):

| Record | `d92aa88` | `576e40c` |
|---|---|---|
| A: one run, corrected to "not done" (`replaced` + correction `completed:false`) | bounded to **13 / 1** | **600 / 7, not bounded** |
| B: one "not done" row, no correction (pre-existing) | 600 / 7, not bounded | 600 / 7, not bounded |
| C: one `conflicted` row only (pre-existing) | 600 / 7 | 600 / 7 |
| E: one execution 40 days ago only | 0 / 0 | 0 / 0 |
| F: A plus an execution 40 days ago | 13 / 1 | **0 / 0** |
| P4 (through `normalizeObservations`): app + watch merged; the athlete corrects the app report to 20 min, the watch says 50 → correction `CORRECTION_CONFLICTS_WITH_A_REPORT_IN_FORCE`, merged row superseded | bounded 13 / 1, pause 3 days, last executed 2026-11-07 | **600 / 7 not bounded, pause null, last executed null** |

**Reading.**
- Under the mission's oracle (A equals its in-force record B), the candidate is consistent, and the discontinuity B vs E (no execution ever → unbounded; an old execution → bounded to 0) is pre-existing rule semantics.
- But it is a real dose movement *upward* against the frozen base. In P4 it also goes beyond "double credit": a real session whose correction conflicts with the watch now counts zero, for C-Q08-1, the pause and `trainedAfter`. That is consistent with how `v1-run-history`, `v1-strength`, `v1-run-calibration` and the normalizer treat `conflicted`, but it is not what CANDIDATE §2/§3/§7 tell SSCTR.
- `unit 4-5` (`lone`) does exercise case A. Mutant M2, which keeps the gate on the old predicate, is killed by it. So the test pins "unbounded" as correct through the in-force oracle, without stating that this is a raise against base.

**Smallest action (one focal step, no code change required unless SSCTR rules otherwise).**
1. Worker: correct CANDIDATE §2 ("never raised") and §7. State that, against `d92aa88`, the stated exposure can now pass unbounded on a record with no execution in force (cases A and P4), and that a conflicting correction removes the execution entirely. Add one explicit test that pins `recent` for case A and for the P4 shape, so the chosen behaviour is visible rather than implied by the oracle.
2. Chief → SSCTR: dispose explicitly whether C-Q08-1 applies when the record holds execution reports but none in force. This is the pre-existing gate, now reached by corrected records.
3. If SSCTR keeps the current reading, the condition closes on items 1 and 2. If SSCTR changes the gate, that is a dose-rule code change: it uses the one focal cycle, and QRE re-checks only that delta.

**Stop:** no `v1core-freeze-2.mjs --write` until 1 and 2 are on record.

### QRE-F01-02: order-dependent `once()` for a reused `eventId` with different facts

- `once()` keeps the first in-force row per `eventId`. With two copies of `dupX` (90 min and 20 min), the bound is 110 or 93 depending on order. `d92aa88` gave 115 for both orders.
- Both values are ≤ base, so this is never less safe than before, and the engine never emits such a record. `normalizeObservations` treats the same shape as `EVENT_ID_REUSED_WITH_DIFFERENT_FACTS`: a conflict, not first-wins.
- **Smallest action (optional):** keep `once()` for exact duplicates only, and for differing copies take a deterministic choice: the minimum, or HOLD as an unreadable record. Do not drop both, because that would reopen QRE-F01-01's gate. Or declare it as a residual.

### QRE-F01-03: unmarked original / stale part copy still double-count (residual, shared)

- `[x unmarked, correction of x]` gives 113. The in-force control gives 100.
- `[merged row (parts app-m, dev-m), separate dev-m row]` gives 113. The control gives 100.
- Both shapes count the same on base and candidate. Every V1 reader relies on the engine's `superseded` mark in the same way, and the engine's ledger (`r6-adaptation` `[...accepted, ...supersededRows, ...]`) never holds these shapes.
- **Action:** none for this candidate. Name it in the record as a residual for record-integrity work (client-held records), next to SEC-CORE-03.

### QRE-F01-04: `trainedAfter` path not covered

- Mutant M1 (the `trainedAfter` check reverts to the old predicate, which counts superseded rows) passes 197/197 across `v1core-c2f01-restart-sizing`, `v1core-restart`, `r7c-phase7`, `v1cib-cfobs1`, `v1cib-custody`, `v1cp-f08`, `v1cp-ff`, `v1cp-ff-guard`, `v1cp-fixcycle` and `v1fc-boundary`.
- The candidate changes this path. With a session after the readiness declaration that was later corrected to "not done", the readiness now stands in for the stop (`readinessDeclared:true`) instead of asking for the new stop's reason.
- The direction looks right, but nothing pins it.
- **Smallest action:** one unit test with a readiness declaration, then a run after it that is replaced and corrected to "not done", asserting `facts.pause.readinessDeclared`. Mutants M2 (the gate) and M3 (`once` removed) are killed by `unit 4-5` and `unit 10`.

### QRE-F01-05: verifier as a future freeze tool

The script is sound for what it states:
- `--preserved` on the worktree: exit 0.
  - The six records are the base bytes.
  - FREEZE-1 47/47.
  - V1-FREEZE-1 197/198 with 1 declared.
  - The four other records are whole.
  - 4 changed files, all declared.
  - No untracked file.
- (iii) is a diff against the working tree, so uncommitted edits are caught.
- `RUNTIME_FREEZE_V1RWS_1.json` is outside `PRIOR`, as in the FREEZE-1 verifier, but (iii) still protects it.

Gaps:
- (a) `filesOf()` binds `git ls-files` of `reviews/`. If the QRE/SSCTR reviews are not committed when `--write` runs, they are silently not bound. Require the named review files to exist and be tracked.
- (b) FREEZE-1 bound its successor ledgers. FREEZE-2 does not bind `F01_SUCCESSOR_LEDGER.json`, `CANDIDATE.md` or `bench/`, which justify the 24th failure and the values. Add them to the bound files.
- (c) `--check` verifies the `files` hashes and the digest but not `commit`, `amended` or `additiveTo`. This is acceptable, because `preserved()` reruns.
- (d) The (iv) untracked check covers only `src`, `v1`, `test` and `scripts`.
- The relinked iOS bundle is not bound, which is consistent with FREEZE-1. The iOS revalidation stays pending.

**Smallest action:** (a) and (b) before `--write`. Neither is blocking for the candidate.

## Criteria → evidence

| Criterion | Result | Evidence |
|---|---|---|
| Fix minimal, in one file | PASS | `git diff d92aa88 576e40c -- CoachingCore/src/v1-f08.mjs`: `executed()` gains `superseded!==true`; `once()` is added and used only in the C-Q08-1 window. `--preserved`: 4 changed files under CoachingCore, 1 amended. |
| In line with the definition of rows in force | PASS | `v1-run-calibration:153,568`, `v1-run-forecast-index:99`, `v1-run-format-index:95,352`, `v1-run-history:164` and `v1-strength:128` all filter `superseded!==true` (and `conflicted` where relevant). `normalizeObservations` keeps replaced rows only as `supersededRows` ("never accepted, counted or bound again"), and its accepted rows have a unique `eventId`, so the dedup in `once()` matches the engine. |
| Drops a valid distinct execution? | None found for engine-made records | A distinct execution never shares an `eventId` in an engine ledger (a reuse is a normalizer conflict). Corrections carry the execution forward. The exception is a conflicting correction: the execution counts zero (QRE-F01-01, P4). This matches the other readers. |
| Still double-counts? | Only for non-engine shapes | QRE-F01-03. |
| 12 cases covered | PASS, with gaps | The case → test mapping in CANDIDATE §4 matches the file. The e2e control is an independent path: a direct merge with no correction, through `F.restartProgram`, plus pinned absolutes `[50,50,50,100]`, `(7*50+60)/4`, `(7*50+45)/4` and 100. The unit oracle `inForce = superseded!==true` mirrors the fix's predicate, so it adds pinned values rather than independence. Gaps: `trainedAfter` (QRE-F01-04); the raise against base is not stated (QRE-F01-01). |
| RED real and for the right reason | PASS | Base extract: 4 pass / 14 fail, the same 14 named in CANDIDATE §4. Example (unit 12): actual 113, expected 100, from the replaced row counted. The four passing on base are invariance and no-reduction guards, as stated. |
| GREEN | PASS | Candidate extract: 18/18. The freeze test fails there only because the extract has no `.git`. In the worktree, `node CoachingCore/scripts/v1core-freeze-2.mjs --preserved` exits 0. |
| Suite regression | PASS | Same environment (git-less extracts), whole suite. Base: 1690 tests, 1666 pass, 22 fail. Candidate: 1709 tests, 1684 pass, 23 fail. The failing locations are identical, except the git-dependent `v1core-c2f01-freeze.test.mjs:12`. The Chief's worktree run on `576e40c`: 1709/1685/24. Its 24 locations equal closure-2's 19 ledger entries, plus the three preservation entries, plus `v1rws-lineage:146` twice, plus `v1core-freeze:11` (by design, mapped in `F01_SUCCESSOR_LEDGER.json`). |
| Mac package | PASS | `probes/cmp-mac.mjs` checks: (1) the eight earlier `core.json` journeys are identical in input and expected; (2) the anchors, locales, driver, modules and `localeCompareCalls` are identical; (3) `j5.json` and `p16.json` are byte-identical; (4) the manifest's `v1-f08.mjs` sha equals the file; (5) the manifest's bundle sha equals the bundle; (6) the bundle diff is exactly the source diff. New journeys: `restart-f01` and `restart-f01-control`, both PROPOSED, and Node checks equal doses. Device execution: not available here (iOS revalidation pending). |
| Bench | Accepted on inspection, not re-run | One extra linear pass with a `Set` over the record. The author's figures (restart from a corrected record, ×1.047 median, ×1.003 p95) are plausible and not material. Node only. |
| Security | N/A for QRE | No new input or trust rule. QRE-F01-03 is a record-integrity residual. |

## Commands run (raw)

- Extracts: `git archive 576e40c CoachingCore audits` and `git archive d92aa88 CoachingCore audits` → `scratchpad/qre-f01-r1/{cand,base}`, with the worktree `node_modules` copied in. The new test file was copied into base only for the RED run.
- `node --test test/v1core-c2f01-restart-sizing.test.mjs` on base → `red-base.txt`: tests 18, pass 4, fail 14.
- The same plus `v1core-c2f01-freeze.test.mjs` on the candidate → `green-cand.txt`: 18 pass, 1 fail (no git in the extract).
- `node CoachingCore/scripts/v1core-freeze-2.mjs --preserved` in the worktree (read-only) → exit 0 (output quoted above).
- `node --test` (full) on both extracts in parallel → `suite-base.txt` (1690/1666/22) and `suite-cand.txt` (1709/1684/23). The failing locations were diffed with `comm`.
- `node probes/probe.mjs <root>` and `node probes/probe2.mjs <root>` on both trees → `probe-{base,cand}.json` and the table in QRE-F01-01.
- `node probes/cmp-mac.mjs <base> <cand>`.
- Mutation on the scratch candidate (restored and verified with `cmp`): M1 `trainedAfter` survives 197/197; M2 gate killed (`unit 4-5`); M3 `once` removed killed (`unit 10`). Unmutated: 197/197.
- Nothing was run in the worktree except read-only git commands and `--preserved`. No `npm run verify` or `verify-r*` was run. No worktree file was edited except this review.

Scratch (session-local, not part of the record): `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/a1e30549-2d0a-4d67-ba6e-d90e2d830854/scratchpad/qre-f01-r1/`.

## Conditions

| # | Condition | Owner | Trigger / stop | Evidence of resolution |
|---|---|---|---|---|
| C1 | QRE-F01-01: the record states the raise against base for records with no execution in force (cases A and P4), with a test pinning `recent` for both; SSCTR disposes whether C-Q08-1 applies to such records | Worker (record + test); Chief → SSCTR (disposition) | **Before `v1core-freeze-2.mjs --write`.** If SSCTR changes the gate, that is the one focal cycle, and QRE re-checks only that delta. | Corrected CANDIDATE §2/§7, new test, SSCTR disposition on record |
| C2 | QRE-F01-05 (a)(b): `--write` requires the named reviews to be tracked, and binds `F01_SUCCESSOR_LEDGER.json` and `CANDIDATE.md` | Worker | Before `--write` | Verifier diff; the written record lists them |
| C3 | QRE-F01-04: one `trainedAfter` test | Worker | Optional; can ride with C1's test commit | M1 killed |
| C4 | QRE-F01-02 / -03: decide or declare as residuals | Worker / Chief | Declared in the freeze record | A line in the freeze record |
| C5 | iOS physical revalidation of the relinked bundle (carried from closure-2) | Chief | Before integration acceptance | Device run of `core.json` |

No further QRE cycle is requested if C1 closes without a code change. If the gate changes, QRE reviews only that delta.
