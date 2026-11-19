# QRE_R2_R1: independent Quality & Reliability review of C-F01-1 r2 candidate `3f0b04f`

**Judge:** Quality & Reliability Engineer, an independent instance that did not author the fix. 2026-11-18.

**Scope judged:**
- `git diff 4b6e1ea 3f0b04f`: one runtime file, `CoachingCore/src/v1-f08.mjs`;
- `test/v1core-cf011r2-restart-evidence.test.mjs` (31 tests) and `test/v1core-cf011r2-freeze.test.mjs`;
- `scripts/v1core-freeze-3.mjs`;
- the records at `7dc0ee5`: `CANDIDATE.md`, `DECISION.md`, `SUCCESSOR_LEDGER.json`, `evidence/` and `bench/`.

**Not in scope:**
- the sporting reading (SSCTR): bound versus ASK, zero for a disputed amount, and the window;
- the trust model (Security): `claimsDone` as the SB-1 trigger, and custody C-F01-2;
- iOS device execution.

## Verdict: **READY_WITH_CONDITIONS**

The runtime change is minimal and correct against `DECISION.md`. Every reader it touches does what §1–§4 state. RED/GREEN, the suite accounting, preservation, determinism and compatibility all reproduce independently.

One condition (QRE-R2-01) stops the dependent step, the FREEZE-3 `--write`. It needs a test-only addition. No runtime change is needed. QRE-R2-01 is a coverage gap: the `superseded !== true` guard in `occurred` is reached by an engine path and no test pins it. QRE-R2-02 also has to be fixed before the write, because the freeze binds `evidence/` and `CANDIDATE.md`.

## Findings

| ID | Severity | Summary |
|---|---|---|
| QRE-R2-01 | **Condition, gates the FREEZE-3 write** | Mutant M06 (`occurred` without `superseded!==true`) survives the 31 new tests and all 32 restart-related test files (416 tests). It is reachable through the normalizer. |
| QRE-R2-02 | **Condition, gates the FREEZE-3 write** (evidence accuracy) | `evidence/suite-3f0b04f.txt` holds 1743 tests and does not contain the freeze test. CANDIDATE §4 says that 1712 plus 32 new tests gives 1743, but 1712 + 32 = 1744. |
| QRE-R2-03 | Non-blocking; routed to SSCTR | A disputed-amount session older than 28 days, alone on the record, leaves the stated exposure unbounded (600/7) while setting a 5-week pause. An execution at the same age bounds the exposure to 0/0. DECISION §5 names only the "not done" variant of this residual. |
| QRE-R2-04 | Non-blocking (pre-existing) | The `did` disjunction is unpinned. M30 (completed only) and M31 (minutes only) survive all 32 restart-related files. Boundary M27 (`>=` against the declaration time) also survives. |
| QRE-R2-05 | Non-blocking, informational | The bench is plausible, but it exercises no conflicted rows. On a 300-row record with 100 conflicted rows, my micro-bench measured ×1.12 (+0.28 ms). |

### QRE-R2-01: the replaced-row guard of `occurred` is unpinned on a reachable path

**Shape:** P4 (app plus watch, with the athlete's correction to 20 min in conflict), followed by a second correction to "not done". The normalizer leaves this record:
- `Axf1`, in force: conflicted, not done, with the watch part saying done;
- `Ax`, replaced;
- `Axf0`: replaced and **conflicted**, with both voices saying done (`probes/probe.mjs`, `p4ThenNotDone`).

**Results:**
- Candidate: pause null, last executed day null. This is correct, because the voice in force disputes the occurrence.
- Under M06: pause `RUN: 3` and last executed day `2026-11-07`. A replaced disputed row is read as an occurrence, which shortens the pause.
- No test fails under M06.

**Evidence that closes it:**
- a test in a new file, through `normalizeObservations`, of P4 then a correction to "not done", asserting `lastExecuted === null` and `pause === null`. It must fail under M06 and pass on the candidate;
- optionally, the same check after a JSON round trip.

### QRE-R2-02: the suite evidence predates the freeze test

My run on a clean clone at `7dc0ee5` gave **1744 / 1717 / 27**. The one test the author's file lacks, `C-F01-1 r2: the seven earlier freezes are preserved…`, passes. The failure set matches the author's exactly.

**Evidence that closes it:** a fresh full-suite file in `evidence/` (or the existing one replaced), with CANDIDATE §4 corrected to 1744 / 1717 / 27.

### QRE-R2-03

Through `restartProgram`, both shapes still give RESTART, because the 5-week pause dominates. No dose impact was observed on that path. Owner: SSCTR, which may widen the window or confirm the residual. Closing evidence: a line in DECISION §5 naming this variant. Not blocking.

### QRE-R2-04

M30, M31 and M27 are inherited from `executed`, or are edge cases. Engine-written rows carry both `completed` and `minutes`. Recommendation: pin a row with minutes only and a row with completed only. Not blocking.

## The items judged

1. **Minimal and correct.** The change adds four readers:
   - `did`, a pure refactor;
   - `occurred`, which feeds `done` and `lastBy`;
   - `claimsDone`, which feeds `trainedAfter` and the `else if(readiness)` branch;
   - the windowed gate.

   The amount is still `executed` only, with `once`. Each reader matches DECISION §1–§3. The HOLD and CLINICAL paths are untouched and run first. Rows dated after the restart, and other athletes' rows, HOLD before these readers run, so M29 (upper window bound) is unreachable.

   Engine-written chains corrected to "not done" after a declaration keep `readinessDeclared:true`, the same as at base (`probe2.mjs`, solo and merged chains). That holds because the parts of the row in force carry only the voices in force.
2. **Coverage.** A1–A12, B1–B7 plus persistence, C1–C11 and D1–D9 are present, with real oracles: exact values, the normalizer and e2e `restartProgram`. The negative and no-change cases are A1, A2, A6–A11, B3–B5, C1–C6, C9–C11, D2, D5, D8 and D9.

   Mutants: 32 in total, covering `occurred`, `claimsDone`, `voices`, the gate, the amount, `done`, `lastBy`, `trainedAfter` and the `else if` branch.
   - **Killed (23):** M01–M05, M08–M10, M12–M17, M19–M26 and M28. M28 is killed only by the wider restart-related set.
   - **Equivalent on reachable inputs:** M07, M11, M18 and M32 (facts carry no `actual`), and M29 (later rows HOLD).
   - **Gaps:** M06 (QRE-R2-01), plus M27, M30 and M31 (QRE-R2-04).
3. **RED/GREEN.** On `4b6e1ea` plus the new file, 12 of 31 fail: A3-A4, A5, A12, A e2e, B1-B2, B6, B7, C7-C8, D1, D3-D4, D6 and D7. Each fails on its targeted assertion: 600/7 against 0/0, EASY_CURRENT against RESTART, a null pause or last day, or `readinessDeclared` true. On `3f0b04f`, 31/31 pass.
4. **Suite accounting.** I ran clean git clones of both commits.
   - `4b6e1ea`: 1712 / 1688 / 24.
   - `7dc0ee5`: 1744 / 1717 / 27.
   - Failing only on the candidate: exactly `v1core-c2f01-freeze:12`, `v1core-c2f01-restart-sizing:223` and `:255`, the three ledgered tests.
   - Failing only on the base: none.
   - The 24 are closure-2's 19 entries plus 3 preservation tests (with `v1rws-lineage:146` failing twice), plus `v1core-freeze:11`.
5. **Preservation and the freeze tool.**
   - `--preserved` on the clean clone passes: the seven records are the base bytes, FREEZE-1 47/47, FREEZE-2 14/15, V1-FREEZE-1 197/198, and the other four are whole.
   - In the worktree it currently fails only on untracked review files, which is expected until the reviews are committed.
   - `--write` requires HEAD, all three review folders committed, the three records and a clean status. It binds `CANDIDATE.md`, `DECISION.md`, `SUCCESSOR_LEDGER.json`, `evidence/`, `bench/` and `reviews/`.
   - `--check` re-verifies the hashes, extra files, the digest, the base, ancestry, `additiveTo`, `amended` and the required reviews.
   - This also resolves predecessor QRE-F01-05. The tool is sound.
6. **Determinism and continuity.**
   - 200 random permutations of a mixed record (executions, P4 twice, a "not done" conflict, a readiness declaration), each also after a JSON round trip: 0 differences.
   - Restart chain A→B→C: the record returned byte-equal at each step, and the final reading equals a direct reading.
   - Re-normalization persistence (test B) holds.
7. **Compatibility.** Legacy shapes read sensibly:
   - a conflicted row with no provenance: no occurrence, bounded;
   - a row with `occurrenceDate` only: read;
   - a row with minutes only, or completed only: read as executed.

   Multi-plan records (C11) pass, as do all of v1cp-f08 and the earlier restart suites.
8. **Bench.** My rerun gives review median ×0.974, corrected restart ×0.993 and record bytes ×1.000. See QRE-R2-05.

## Conditions

| ID | Blocking? | Owner | Closing evidence |
|---|---|---|---|
| C1 (QRE-R2-01) | Blocks the FREEZE-3 `--write` only. The runtime is unchanged. | Author | The P4-then-"not done" test through the normalizer: RED under M06, GREEN on the candidate, in a new test file. |
| C2 (QRE-R2-02) | Blocks the FREEZE-3 `--write` only. | Author | A full-suite evidence file at 1744 tests or more that includes the freeze test, and CANDIDATE §4 corrected. |
| C3 (QRE-R2-03) | No | SSCTR | A DECISION §5 residual line, or a widening ruling. |
| C4 (QRE-R2-04) | No | Author, next line | Rows with minutes only and completed only pinned. |

QRE re-review of C1 and C2: a narrow check of the added test against M06, plus the evidence diff. A rerun of this whole review is not needed.

## Commands run (Node v24.19.0, Git Bash)

Scratch directory: `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/bd5bc05f-f34c-4538-bfb8-fc330e278203/scratchpad/qre-r1-212017-8228`.

**Setup:**
- `git archive {3f0b04f|4b6e1ea} CoachingCore audits | tar -x` into `cand/`, `base/` and `mut/`, with `node_modules` copied;
- `git clone --no-checkout` of the repository into `gcand/` (`7dc0ee5`) and `gbase/` (`4b6e1ea`). Some long paths under old `audits/` and `governance/` failed to check out (MAX_PATH). Nothing in `CoachingCore/` was dirty.

**Tests:**
- `node --test test/v1core-cf011r2-restart-evidence.test.mjs` in `cand/`, and in `base/` with the file copied in;
- `node --test`, the full suite, in `gcand/CoachingCore` and `gbase/CoachingCore`.

**Mutants:**
- `node scripts/mutate.mjs <mut> … restart-evidence.test.mjs`;
- the survivors with `ONLY=… BASEFAILS=…` over the 32 files that import `v1-f08` or the restart path;
- every mutated file was restored by rewriting its bytes (sha below).

**Probes and freeze tools:**
- `node probes/probe.mjs <tree>`, `probes/probe2.mjs`, and `probes/microbench.mjs <base> <cand>`;
- `node audits/v1-core-cf011-r2-2026-11-18/bench/bench.mjs <base> 5`, from `gcand/`;
- in the worktree, read-only: `node CoachingCore/scripts/v1core-freeze-3.mjs --preserved`, `node CoachingCore/scripts/v1core-freeze-2.mjs --check` and `node CoachingCore/scripts/v1core-freeze-3.mjs --check` (no record yet).

No `npm run verify` or `verify-r*` script was run. No worktree file was edited except this review, and nothing was committed.

## SHA-256

| File | SHA-256 |
|---|---|
| `CoachingCore/src/v1-f08.mjs` @3f0b04f (also `mut/` after restore) | `41cdbb3d85e7efc12197c3b073998dc9fde1f6932b9054f8f3122aec7e5abb55` |
| `CoachingCore/src/v1-f08.mjs` @4b6e1ea | `a06c580c2d4f9c64287af3105c4cb471913b66cbd38605c0b7d24cc5bdd4d68b` |
| `test/v1core-cf011r2-restart-evidence.test.mjs` | `a74adc52a34aff8eedbb2788b0cfd47ee80d08baf818765dbb1c0fbef42e2bc2` |
| `test/v1core-cf011r2-freeze.test.mjs` | `a6a0cf099925248075d4dbdbd1710dd3aa56ae75fe3bb6451b4a9d027c79538a` |
| `scripts/v1core-freeze-3.mjs` | `0ab82c3500cd03b85e5352fc35007da96a56f4968d2afa21f30b8ecdc3750cf3` |
| `CANDIDATE.md` | `4edc59fffa33ebda6749b5227652e76a2b98ad01cc318bf54cf1802b79a3247e` |
| `DECISION.md` | `cc58a76a32ec69f6619ae9f2badfc936cbd3203618c1706d49dd50d3cc0c1854` |
| `SUCCESSOR_LEDGER.json` | `3f16168b43217a9025a2ace8042c575853059933cfcbc8aadc3b685f8b59d1ba` |
| `evidence/red-on-4b6e1ea.txt` | `f268cb6793f84cb415aa0b5cbae884c3d0520d979f3150bbbf10ad96900a468d` |
| `evidence/suite-3f0b04f.txt` | `ba1820a248903949b4f631228fe49567f6fc612b78cc7cb9989e067badf5085c` |
| `bench/bench.mjs` | `727e5347559db05f3c80ea299c02c0e31331f6267ce1607a1c059ab00cb7adcf` |
| `bench/bench-4b6e1ea-vs-candidate.json` | `def70c303f3f96a35981aea5614a1ab047d2bf81f2e126c8aeaf3b005055eb93` |
| scratch `suite-gcand.txt` | `4feefff71fe92f6ed6679561adbfd207777fda3900a01dbb717b9fe7be065579` |
| scratch `suite-gbase.txt` | `9c6441dad5b6c652cdc6c6f30a6ab41cc10460c53d92a57223af8a387de92957` |
| scratch `red-mine.txt` | `b58583705c43ea4eb7c345d50a6e15cf742b54364bffe871fe14203f2767a473` |
| scratch `mutants-new.json` | `a395766908f08c1f5e47f8989245aa8a6a3b5ed85d9f067049b31edb2a8010ef` |
| scratch `mutants-survivors.json` | `55e0d853ad77758cbd542585fbab5ea82055f2e0b29f189026a80e3c4c6e4116` |
| scratch `probe-cand.json` | `3fa1eea22c443eb3b1ea25ee5d1af27865183532ea06eb1bdde4de76dcc9471d` |
| scratch `bench-mine.json` | `d34621a53c7b321405e981897a985be50af6d88c0745461564adc9cc8369b4f2` |
| scratch `scripts/mutate.mjs` | `91d1df9d96252e092a14f7bf3467caa665d4a4b57dbffbe4d1ba1bf512daba1f` |
| scratch `probes/probe.mjs` | `3e2339a1c61968b45e951826bf3f00182c188da7243d3a53806744b3e185fb5c` |
| scratch `probes/probe2.mjs` | `297be0a1ea7b078a6db212f7eabba53ff3662e059dd138a93a82f29a6174fb49` |
| scratch `probes/microbench.mjs` | `275794697cca9f9d333212df3163c65ce9c0f1f607df4060683e050a2636344a` |
