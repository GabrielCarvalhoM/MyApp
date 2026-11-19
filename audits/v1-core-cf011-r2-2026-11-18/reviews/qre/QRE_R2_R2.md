# QRE_R2_R2: narrow QRE recheck of the C-F01-1 r2 focal cycle (runtime `37c0f6f`, records `2819e6a`)

**Judge:** Quality & Reliability Engineer, the same independent instance as QRE_R2_R1. 2026-11-18. Scope:
- `git diff 3f0b04f 2819e6a -- CoachingCore`;
- `CYCLE1.md`, CANDIDATE §4, and `evidence/suite-37c0f6f.txt`.

## Verdict: **READY**

The two blocking conditions, C1 and C2, are closed. C4 is closed too. The runtime delta is minimal and introduces no regression. `v1core-freeze-3.mjs` is ready for `--write`, with one precondition: the three R2 recheck reviews must be committed first. The tool enforces that itself, through check (iv), "no untracked file", and through "the bound files must be committed".

## 1. Conditions

| Condition | Status | Evidence |
|---|---|---|
| C1 (QRE-R2-01, M06) | **Closed** | Mutant M06 on `37c0f6f` is killed by the QRE-R2-01 test, and only by it. |
| C2 (QRE-R2-02) | **Closed** | CANDIDATE §4 now carries the correction note (1744). On a clean clone at `2819e6a` the suite gives **1749 / 1722 / 27**, which confirms CYCLE1's account of the 28th failure in `suite-37c0f6f.txt`: the freeze test, run while `CYCLE1.md` was untracked, now passes. |
| C3 | Routed | DECISION §6 has the residual line. SSCTR owns it. |
| C4 (QRE-R2-04) | **Closed** | M27, M30 and M31 are killed by the QRE-R2-04 test. |

## 2. Runtime delta

The delta is in `restartIntake` only, and changes two things:
- `wellFormed`, inside `occurred`;
- `claimsDoneIn`, used for `trainedAfter` only.

No dose reader changes. `executed`, the gate, the amount, `once`, `done` and `lastBy` are untouched apart from the predicate inside `occurred`.

**Tests:**
- The new file is 36/36 on `37c0f6f`.
- On the `3f0b04f` runtime it is 33/36. D9, SEC-R2-01 and SEC-R2-02 fail there, each for the right reason.

**Suite accounting:** the 27 failing locations on `2819e6a` are identical to those on `7dc0ee5`, and none is new.

**Probes:** the QRE_R2_R1 probes give **byte-identical** output on both runtimes. They cover:
- determinism over 200 permutations and JSON round trips;
- the A→B→C restart chain;
- legacy shapes and the shapes outside the window;
- the reachable path behind M06.

`probe2` also matches: engine-written chains corrected to "not done" keep `readinessDeclared`.

**Mutants:** 44 in total, the 32 from R1 adapted plus 12 on the new code.
- Killed: 35, including all of N01–N08 (`wellFormed`, `replacedBy`, `claimsDoneIn`).
- Survivors:
  - equivalent on reachable inputs: M07, M11, M18, M29 and M32 (as in R1), and N09 and N12;
  - killed by the wider restart test set in R1: M28;
  - minor, **non-blocking**:
    - N10 (`some` changed to `every` on an orphaned row with several voices);
    - N11 (`replacedBy` matching by session only; it differs only for rows without a `sessionId`).

## 3. `v1core-freeze-3.mjs`

The only change is that `RECORDS` now binds `CYCLE1.md`. It is still sound:
- On the clean clone, `--preserved` passes: the freeze test is GREEN.
- In the worktree, `--preserved` currently refuses only on the untracked `SEC_R2_R2.md` and `SSCTR_R2_R2.md`, and will refuse on this file until it is committed. That is the intended behaviour.

## Hashes judged (SHA-256)

| File | SHA-256 |
|---|---|
| `src/v1-f08.mjs` @37c0f6f (= @2819e6a) | `a3ca21ae3f645ad74b6c13bfa26d2d8fdb1c90d82e85a011988271a520b5cc10` |
| `test/v1core-cf011r2-restart-evidence.test.mjs` | `6844a9c2e5e3591750ec2414c5e682e994760d07d21e2541e27ff09ed18e035a` |
| `test/v1core-cf011r2-freeze.test.mjs` | `a6a0cf099925248075d4dbdbd1710dd3aa56ae75fe3bb6451b4a9d027c79538a` |
| `scripts/v1core-freeze-3.mjs` | `e714cacee0243bc7a7923c431e454aa360fa8833788b51c3e6f053f91d046754` |
| `CANDIDATE.md` | `a6c6e33273db83fd7d1ec549847e3c86dd83a1f1ba7e31cab2599626bb6de73b` |
| `DECISION.md` | `f1184e0abeb0b86b6fe233a6faf05b4d886fa7848cbc72dd8d155a473c652924` |
| `CYCLE1.md` | `5278bc47b44a1ffb98af1fd3907ab883606968ca945111960245ae636082644b` |
| `SUCCESSOR_LEDGER.json` | `3f16168b43217a9025a2ace8042c575853059933cfcbc8aadc3b685f8b59d1ba` |
| `evidence/suite-37c0f6f.txt` | `d8d326587bc671b5f8401080e19b57e0cae8991ef72155427544a0ce5c493b10` |
| `evidence/cycle1-tests-on-3f0b04f-runtime.txt` | `97ceab135eab15073696e0c2939fb40e29335c8e198587187f869ced63c5d555` |
| scratch `suite-gc-2819e6a.txt` (clean clone) | `52949910a93e288aec1d79345addca3fef5e18909c30a60621e6e7ac95ffee62` |
| scratch `cycle-on-3f0b04f-runtime.txt` | `39d81a6f248cc8afa5a2dea92b8896f8c4f67432a7b8d904b3a64be35be928b9` |
| scratch `mutants-cycle.json` | `713fa6d859617338e4c4663ac429b680989bd2301cfada00581d251e5c83df70` |
| scratch `scripts/mutate2.mjs` | `7725243cff87b24cd7bc95737d3fc020eb5435309686287b1f6e86f2a7c2af3d` |
| scratch `probe-cycle.json` (= R1 `probe-cand.json`) | `3fa1eea22c443eb3b1ea25ee5d1af27865183532ea06eb1bdde4de76dcc9471d` |

## Commands

All scratch work is under `…/scratchpad/qre-r2-221911-27678`:
- `git archive 2819e6a CoachingCore audits`, extracted into `mut/` and `rt3/`. In `rt3/`, `src/v1-f08.mjs` was replaced with its `3f0b04f` bytes.
- A clean `git clone` at `2819e6a`, with a full run of `node --test`.
- `node --test test/v1core-cf011r2-restart-evidence.test.mjs` in `mut/` and in `rt3/`.
- `node scripts/mutate2.mjs` (44 mutants). Each mutated file was restored by rewriting its bytes; the restored sha matches the one above.
- The R1 `probes/probe.mjs` and `probe2.mjs`, run on `mut/`.
- In the worktree, read-only: `node CoachingCore/scripts/v1core-freeze-3.mjs --preserved`.

No verify script was run, nothing was committed, and no worktree file other than this one was edited.
