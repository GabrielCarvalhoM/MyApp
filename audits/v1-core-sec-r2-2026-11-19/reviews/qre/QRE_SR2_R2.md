# QRE_SR2_R2: narrow recheck of the focal cycle (C1, C2, SEC-SR2-01 runtime delta)

**Judge:** Quality & Reliability Engineer, the same independent instance as QRE_SR2_R1 (not the author).
**Scope, as requested:** only C1, C2, and whether the runtime delta keeps four things: determinism, the QE-R7C-10 clocks (of admitted corrections, merges and same-execution replays), and freeze preservation. Nothing else from R1 is re-judged.
**Verdict: READY.** C1 and C2 are met, the delta is sound, and `v1core-freeze-4.mjs --write` is no longer blocked by QRE.

## Identities

| Item | Value |
|---|---|
| Commit | `f62bae3` (runtime `36ea26a`) |
| `src/r6-provenance.mjs` | `d2439377dce49b6e70f3d2db2c84281e940a7afd9b476964dcc9a60cb075fb3a` |
| `src/v1-f08.mjs` | `f1065bf1e8c29a4019cf5f8f1c72e9f50f38a11796bf126d39c52a6470e27d37` (unchanged since R1) |
| `test/v1core-secr2-correction-integrity.test.mjs` | `ffbbf43d8d2b16bab3d83a62597fedf211d83fcac1354177609c8a19f52ab489` |
| QRE_SR2_R1 as committed in `6b5af90` | `f7e88beb6cf2439d1011df52191e42463651bfa051b02141db67cf6cc7a600e4` (byte-identical to what I wrote) |

**Where I ran things** (scratch directory `qre-sr2-465526834`):
- `c1/`: an archive extract of `f62bae3`, used for probes and mutation.
- `clone-r2/`: a `--shared` clone at `f62bae3`, used for the suite and the freeze check.

Every mutation restored its file's bytes under a sha256 check. The final hashes match the table above.

## Runtime delta: PASS

`git diff 4e8cffe 36ea26a -- CoachingCore/src` moves one statement: `setFirstRecorded(o, firstRecorded(o, old, …))` now runs at the start of `admit()`.

**Code reading.** On every admitted path nothing mutates `accepted`, `quarantined` or `old` between the chain check and `admit()`, so the clock is computed from the same values as before.
- **Merge:** `admit()` runs before `setFirstRecorded(previous, firstRecorded(previous, o))`, so the order is unchanged.
- **New row:** `admit()` runs before the row is built.
- **Same-execution replay:** the replayed row already holds a clock no later than its chain's. `firstRecorded(sameEvent, o)` is therefore unchanged whether `o` carries the chain clock (before) or only its own arrival clock (now).
- **What does change:** a correction that is refused, or that is read as an `EXACT_REPLAY` of a row of another chain, no longer carries its chain's clock. That is exactly SEC-SR2-01.

**Executed: clock differential** (`probes/clockdiff.mjs`). It compares `4e8cffe` with `36ea26a`, with `incoming: true` and `recordArrival: true` and a different clock on each pass, over the full output of every pass:

| Seed / arrival | Passes | Identical | Clock-only differences | …all with a refused or replayed correction in the batch | Other differences | Nondeterministic |
|---|---|---|---|---|---|---|
| 20261119 / non-monotone | 8823 | 8806 | 17 | 17 | 0 | 0 |
| 20261119 / monotone | 8733 | 8712 | 21 | 21 | 0 | 0 |
| 5 / non-monotone | 8848 | 8837 | 11 | 11 | 0 | 0 |

**Accepted correction rows whose clock moved.** There were 2, 2 and 3 such rows. I traced them (`probes/clockdiff2.mjs`): each is a correction of another chain that reused the row's event id with the same facts and was read as `EXACT_REPLAY`.
- On `4e8cffe`, the replay dragged that row's clock back to the other chain's older clock. This is the SEC-SR2-01 defect.
- On `36ea26a`, the row keeps its own chain's clock.

No admitted correction, merge or same-execution replay changed its clock.

**Tests.**
- On `36ea26a`, the test file passes 24/24.
- With `r6-provenance.mjs` at `4e8cffe` bytes, it passes 22/24. The 2 failures are exactly the two SEC-SR2-01 tests (normalizer, and the engine's QRE-V1CP-04 shape).
- The author's mutant M9 (clock set before admission) is killed, as `mutation-cycle1.txt` records.
- My earlier mutants Q1, Q2, Q4, Q6 and Q13 stay killed on the cycle runtime.

## C1: MET

**What the tests cover.**
- "C1 (QRE_SR2_R1)" builds orphans the way FREEZE-3 stored them, by marking normalized rows replaced by hand. It covers shapes (a), (b), (c) and (q10). For each it checks:
  - `restartIntake` → `readinessDeclared` undefined, also after a JSON round trip;
  - `restartProgram` → `ASK` with an `athlete.pause.*` missing input.
- "C1 controls" covers same session, same activity and same manual instant: each stays history.

**My mutants on `36ea26a`** (`probes/qmut.mjs`, against the test file alone):

| Mutant | Result |
|---|---|
| Q11 (any row with the id replaces a session row) | killed by C1 |
| Q9 (any row with the id replaces an activity row) | killed by C1 |
| Q10 (manual match ignores the replacement's activity) | killed by C1 |

This agrees with the author's M10–M12. The runtime of `v1-f08.mjs` is byte-identical.

**Non-blocking wording nit (owner: author; no effect on the gate).** C1's assertion message says "FREEZE-3 read (a) and (c) as replaced". That is not what I observe:
- C1 passes with both FREEZE-3 runtime files in place (`red-r2-f3.txt`): FREEZE-3's `replacedBy` already asked for (a), (b) and (c).
- C1 is coverage carried forward, not a RED. CYCLE1.md says so correctly.
- The FREEZE-3 defect on stored records was only the manual null shape, and the SEC-R2-04 test still covers it.

The message can be corrected in the closing record or a later touch, with no runtime change.

## C2: MET

The QRE-SR2-01 exception (a session already in conflict) is now stated in three places:
- CANDIDATE §A;
- the test file header;
- the `SUCCESSOR_LEDGER.json` successor text for `:287`, which now names the C1 tests.

O-QRE-1 was optional and was declined in CYCLE1.md with a reason. Accepted.

## Freeze preservation: PASS

- **Whole-repository diff `a6e10d0..f62bae3`:** outside this line's audit folder, only the two amended src files and the three added CoachingCore files changed.
- **`v1core-freeze-4.mjs --preserved` in the clean clone at `f62bae3`:** exit 0. The eight records are the base bytes; FREEZE-1, -2 and -3 each differ only by the one declared amended file; there is no untracked file.
- **The same check in the worktree:** exit 1, only because of `UNTRACKED: …/reviews/ssctr/SSCTR_SR2_R2.md`, another reviewer's uncommitted file, which is expected.
- **Suite in the clone at `f62bae3`:** 1774 / 1745 / 29. The failure set is identical to the set on `f6a934f`: the 27 inherited failures plus the two declared in `SUCCESSOR_LEDGER.json`. This confirms the author's committed-tree figure.

## Status of what R1 routed

Unchanged and not re-judged here:
- F1 and F2 bind before a real-athlete restart;
- F3 binds before real athletes see weekly-review evidence;
- O-1 is a decision to be taken;
- C-F01-2, SEC-CORE-03 and the iOS revalidation remain open.
