# QRE_SR2_R1: Quality & Reliability gate, SEC-R2-03 + SEC-R2-04 correction integrity

**Judge:** Quality & Reliability Engineer (independent instance; not the author). I did not read the SSCTR or Security reviews of this line.
**Verdict: READY_WITH_CONDITIONS.** The runtime is ready. One condition (C1, tests only) blocks the successor freeze (`v1core-freeze-4.mjs --write`). Nothing in this review asks for a runtime change.

## Identities judged

| Item | Value |
|---|---|
| Commit | `f6a934fc9fb324230e60316d9767484e792ab59d` (runtime `4e8cffe51fa9…`; base `a6e10d0dcbcd…` = COACHINGCORE-V1-CORE-SAFETY-FREEZE-3) |
| `CoachingCore/src/r6-provenance.mjs` | `277addbc53883e9df3a8d3a591081679955181f7a7fde5910e7120ea4d43d391` (base `d701d1208b10fed1836891bf82f432442ab5620228376410b65290b1a58af00d`) |
| `CoachingCore/src/v1-f08.mjs` | `f1065bf1e8c29a4019cf5f8f1c72e9f50f38a11796bf126d39c52a6470e27d37` (base `a3ca21ae3f645ad74b6c13bfa26d2d8fdb1c90d82e85a011988271a520b5cc10`) |
| `CoachingCore/test/v1core-secr2-correction-integrity.test.mjs` | `9f6b0669a5ea05864e8f0561d2f236de442799c7feeb7821fa6121297455da0e` |
| `CoachingCore/scripts/v1core-freeze-4.mjs` | `1c8680c5aaeb70df7a67844578ce3ac38f9a96738dfaf8d7cb85d5fa3c611e3e` |
| `CoachingCore/test/v1core-secr2-freeze.test.mjs` | `dfaa25b6ca370fea19efc24581792d7a273fc9a27620b68b2260583b4a088c09` |

`git diff 4e8cffe f6a934f -- CoachingCore/src` is empty, so the runtime of `f6a934f` is the runtime of `4e8cffe`.

**Environment.** Node v24.19.0 on Windows. Scratch directory `qre-sr2-465526834` under the session scratchpad holds the following, and nothing was written to the repository except this file:
- archive extracts `cand/` (f6a934f), `f3/` (a6e10d0) and `mut/` (f6a934f, the mutation copy);
- local `--shared` clones `clone-c/` (f6a934f) and `clone-b/` (a6e10d0), used for the git-dependent freeze tests.

The FREEZE-3 worktree `v1-core-cf011-r2` was only read; its `git status` is clean. Every mutation restored its bytes under a sha256 check: the final hashes of `mut/` and `cand/` equal the committed hashes above.

## Criteria → evidence → result

### 1. Logical atomicity of admission vs replacement: PASS

**Code reading (equivalence for admitted corrections).**
- When a correction merges into `previous`, `admit()` does nothing. `previous` exists only when the holder clause, `live` and the quarantine clause are all false.
- In every other admitted case, `admit()` performs the same retirements and `byIdentity` deletions FREEZE-3 performed, in the same order. `previous` resolves to `undefined` exactly where FREEZE-3 had deleted `byIdentity`.
- There are only three exceptions, each a declared class:
  - **(D)** FREEZE-3 left `byIdentity` naming a retired row on a conflict-resolving correction.
  - **(E)** FREEZE-3 treated a stale alias (a part id still naming a retired merged row) as a row in force, and deleted `byEvent(old.eventId)` and `byIdentity`.
  - **(A)–(C)** FREEZE-3 retired a row before refusing the correction.
- `!admit && quarantined…` is equivalent to FREEZE-3: there a correction cleared the quarantine before that gate, so a correction never met it.
- The event-id check reads the record before the admission. FREEZE-3 read `kept` copies there. That changes which row `flagConflict` marks (the row in force rather than its retired copy), and only on refused reports (O-1).

**Executed: the author's differential reproduces exactly.** `differential.mjs`, seed 20261119:
- Non-monotone arrival: identical 7981, explained 840, unexplained 2, lostInForce 48, newOrphans 0, nondeterministic 0.
- Monotone arrival: 7799 / 933 / 1 / 0.

Extra seeds:
- Seed 1: unexplained 0, lost 47.
- Seed 2: unexplained 2, lost 37.

I traced the three "unexplained" samples by hand. None is a behaviour change:
- (i) A same-fact "correction" reusing an id is counted EXACT_REPLAY. FREEZE-3 gave INVALID_CORRECTION_CHAIN, because it had deleted the index. The record is unchanged in both.
- (ii) The order of `quarantinedIdentities` differs; the content is the same.
- (iii) FREEZE-3 admitted a correction reusing event id M1, because the stale alias had deleted M1's index. That is a FREEZE-3 defect of class E. The candidate refuses it.

**The author's classification is coarse.** It counts a whole pass as explained as soon as FREEZE-3 holds any orphan, so it could hide an unrelated change elsewhere in that pass. I therefore ran a stricter differential (`probes/diff2.mjs`). For every pass, it takes the corrections the candidate refused after the chain check (EVENT_ID_REUSED, ACTIVITY_BOUND, DUPLICATE_CONFLICT) and turns them into plain reports. It then compares the candidate's record on the original batch with FREEZE-3's record on the plain batch, field by field: event id, session, actual, response, parts, conflicted, superseded, supersededBy.

| Seed / arrival | Passes with a refused correction | Equal | Different, FREEZE-3 defect present | Different, no defect |
|---|---|---|---|---|
| 20261119 / non-monotone | 945 | 893 | 52 | **0** |
| 20261119 / monotone | 1046 | 1001 | 45 | **0** |
| 1 / non-monotone | 1002 | 946 | 56 | **0** |
| 2 / non-monotone | 933 | 881 | 52 | **0** |

The candidate's admitted behaviour is FREEZE-3's, except where FREEZE-3 was defective.

**Finding QRE-SR2-01 (Low, non-blocking, records only; owner: author).** The claim "a refused report has exactly the effect the same report has with no `correctionOf`" (CANDIDATE §A; test header) is false for one class.
- **The class:** a correction on an identity that is quarantined (in conflict, possibly by an earlier refusal in the same pass). Corrections pass the quarantine gate. It is then refused by the activity or event-id rule, and that rule flags another row `conflicted`, so that row leaves dose.
- **The plain report** is refused at `IDENTITY_QUARANTINED_BY_CONFLICT` with no side effect.
- **Measured:** the record differs in 12 of 945 passes (seed 20261119, non-monotone), 8 of 1046 (monotone), 13 of 1002 (seed 1) and 9 of 933 (seed 2).
- **Same in FREEZE-3:** in all 10 samples I checked, FREEZE-3 flags the same rows (`probes/plainne-old.mjs`). It is not a regression.
- **Fix:** correct the claim, and add this class to the O-1 decision. No code change is asked.

### 2. Determinism, idempotence, persistence, JSON round trip, no accumulation: PASS (pre-existing residue routed)

**Determinism:** 0 nondeterministic passes in every differential run. The seeded test also asserts it.

**Fixpoint.** I re-normalized every pass's output after a JSON round trip, with nothing new (`probes/idem.mjs`, 3000 cases):

| Arrival | Candidate: record changed | FREEZE-3: record changed |
|---|---|---|
| non-monotone | 1 of 8823 | 6 |
| monotone | 0 of 8733 | 7 |

**Re-sending the same batch on its own output.**

| Arrival | Candidate: rows in force changed | FREEZE-3: rows in force changed | Candidate: rows in force increased | FREEZE-3: rows in force increased |
|---|---|---|---|---|
| non-monotone | 23 | 94 | 1 | 36 |
| monotone | 18 | 80 | 0 | 32 |

I traced every candidate sample I examined:
- **F1:** a re-sent report dated before a carried correction sorts ahead of it. The carried row is re-refused, then the replayed copy re-admits it, which leaves an extra superseded history row or swaps the row in force.
- **F2:** a refused correction carrying a watch activity merged into another session is admitted on re-send, because the merged activity is not indexed on re-read. See §8.

No accumulation of credit was attributable to the fix. Tests 11 and 14 cover the narrow cases, and both pass.

**Stored FREEZE-3 records** (`probes/stored-orphan.mjs`). I wrote records with FREEZE-3's normalizer in four orphan shapes:
- (a) session, event id reused;
- (b) session, activity of another session;
- (c) watch row with no session;
- (d) manual row with no session.

Results:
- Re-normalizing them with the candidate leaves them unchanged.
- The candidate's `restartIntake` asks (`readinessDeclared` undefined) in all four shapes, before and after re-normalization. FREEZE-3 gives `true` in (d), which is SEC-R2-04 fixed.
- A later valid correction of the orphaned report is admitted and puts a row back in force on the candidate.

### 3. Consumer regression: PASS

- **`dose-impact.mjs`** reproduces byte-identically on both trees (`dose-a6e10d0.json`, `dose-4e8cffe.json`).
  - Journeys A and S on the candidate equal their plain-report controls in every field: rows in force, run facts, weekly review status and action, strength exposure and restart week 0.
  - Journey B is F2. It is identical on FREEZE-3 and the candidate, and it is not a regression.
  - The +10 min in week 0 of the restart (A: 80 vs control 70) is what FREEZE-3 itself gives the plain report. Its cause is the non-monotonic start class (SSCTR O-1 / B0-F05), which belongs to SSCTR, not QRE.
- **Test "15 and consumers"** passes. It covers the weekly review, `strengthExposure`, run history (`factsFromLedger`) and the restart, for run and strength, plus a session of a replaced plan.
- **Readers of `superseded` / `supersededBy`.**
  - `v1-f08` `replacedBy`: see C1.
  - `v1-run-format` lineage (`retiredBy`): there are fewer retired rows, never more.
  - `boundary/custody` `annotates`: a refused correction that flags a stored row `conflicted` makes custody's reconcile report "a stored row changed". FREEZE-3 did the same (it flagged a stored row, or a kept copy carrying the conflict). The plain report does the same. That is unchanged, and it belongs to C-F01-2. I did not exercise the custody boundary end to end.

### 4. Test quality: PASS with a gap (C1)

**RED against the FREEZE-3 bytes**, reproduced by swapping files with a hash-checked restore:
- Both runtime files at FREEZE-3 bytes: 4/20 pass (1-4, 7-8, 11, 14).
- Only `r6-provenance.mjs` at FREEZE-3 bytes: 5/20 pass.
- Only `v1-f08.mjs` at FREEZE-3 bytes: 19/20; the one failure is the SEC-R2-04 stored-record test.
- On the candidate: 20/20.

Test 14 passes on FREEZE-3: it is a stability control, not a RED.

**Author mutants:** `mutate.mjs` on my copy gives 9/9 killed, the same as `mutation.txt`.

**My mutants** (`probes/qmut.mjs`, `probes/qmut2.mjs`). The second runner compares against a baseline across the 43 test files that touch `correctionOf`, `supersededBy` or `readinessDeclared`.

| Mutant | Result |
|---|---|
| Q1 admit before the activity check | killed by the new file |
| Q2 admit before the event-id check | killed by the new file |
| Q4 conflict resolution retires nothing | killed by the new file |
| Q6 live original never retired | killed by the new file |
| Q13 corrections skip the previous-conflict check | killed by the new file |
| Q3 the admission keeps the quarantine | killed by the wider suite (`R7-D Phase 3.3 T4`) |
| Q5 the holder is never retired | killed by the wider suite (`QRE-CORE-01`) |
| Q7 `dropsIdentity` ignores the holder | killed by the wider suite (`QRE-CORE-01`) |
| **Q11** `o.sessionId ? true` (any row with that event id replaces a session row) | **survives** |
| **Q9** `activityOf(o) !== null ? true` | **survives** |
| Q10 the manual match ignores the replacement's activity | survives |
| Q8 previous ignores quarantine for every report | survives |

- Q11 and Q9 are not cosmetic. On FREEZE-3-stored orphans they flip the restart from ASK to `readinessDeclared: true` (`probes/mut-effect.mjs`): Q11 in shape (a), Q9 in shape (c).
- At FREEZE-3, the session clause was guarded by `v1core-cf011r2-restart-evidence.test.mjs:287`. On this line that test stops at its first assertion (by design), so its readiness and `restartProgram` assertions for stored orphans no longer execute.
- The successors named in `SUCCESSOR_LEDGER.json` ("SEC-R2-01 successor", "18") go through the candidate normalizer, which no longer writes an orphan. They cannot reach these clauses. The ledger's "the rest of the test … passes in the successor" is therefore not true as coverage. See C1.
- Q8 only matters when an incoming report sorts before a carried conflicted row (F1 territory). It is non-blocking.

### 5. Suite: PASS (claim confirmed)

| Run | Tests | Pass | Fail |
|---|---|---|---|
| Git clone at a6e10d0 (base) | 1749 | 1722 | 27 |
| Git clone at f6a934f (candidate) | 1770 | 1741 | 29 |
| Author's run on 4e8cffe (before the freeze-4 test existed) | 1769 | 1740 | 29 |

- The failure sets differ by exactly two locations: `v1core-cf011r2-freeze.test.mjs:12` and `v1core-cf011r2-restart-evidence.test.mjs:287`. These are the two declared in `SUCCESSOR_LEDGER.json`.
- My candidate failure set equals the author's `suite-4e8cffe.txt` set exactly.
- `v1core-secr2-freeze.test.mjs` passes in the git clone.
- **Archive extracts** (no `.git`): base 1749/1721/26 and candidate 1770/1740/28, with 2 skipped. Two preservation tests skip there, and `secr2-freeze` fails for lack of git. These counts are not a measure of the freeze tests. I judged the freeze tests in the clones and the worktree.
- **In the worktree**, `secr2-freeze` fails only on `UNTRACKED: …/reviews/ssctr/SSCTR_SR2_R1.md`, another reviewer's uncommitted file, which is expected.

### 6. Freeze integrity: PASS (one observation)

- **Whole-repo diff `a6e10d0..f6a934f`:** 24 files: two src files modified, three CoachingCore files added and 19 added under `audits/v1-core-sec-r2-2026-11-19/`. No earlier audit or freeze record is touched.
- **`v1core-freeze-4.mjs --preserved` in clone-c:** exit 0.
  - The eight records are the base bytes.
  - FREEZE-1 is 46/47, FREEZE-2 is 14/15 and FREEZE-3 is 23/24, each with only the declared amended file differing.
  - V1_1 is 196/198 with 2 amended. Its two bound files already differed from its own hashes before this line: the base-bytes comparison is the right test for those.
  - Nothing else in CoachingCore changed, and there is no untracked file.
- **In the worktree:** exit 1, only because of the untracked SSCTR review, which is expected.
- **`v1core-freeze-3.mjs --check`:** exit 1, naming `r6-provenance.mjs` (FREEZE-1 drift) and this line's files. This is by design and declared.
- **Observation O-QRE-1 (non-blocking).** `--preserved` (iii) diffs only `CoachingCore/` against the base. An edit to an earlier `audits/…` folder would not be caught. Only the FREEZE-1..3 bound files and this line's folder are covered. Today the whole-repo diff shows nothing else changed. Consider widening (iii) to the repository, minus this line's folder, before `--write`.

### 7. Performance: PASS (Node only)

My rerun (`node --expose-gc bench.mjs`, 5 rounds, run while other jobs were active):

| Measure | Ratio |
|---|---|
| review median | ×0.986 |
| review p95 | ×0.961 |
| corrected restart median | ×1.021 |
| corrected restart p95 | ×1.082 |
| record bytes | ×1.000 |
| normalizer, small batch | ×0.961 |
| normalizer, corrected history | ×1.003 |
| normalizer, re-sync | ×0.882 |
| heap per normalization | 1188 → 1199 KiB |

This agrees with the author's figures within noise. `admit` is a closure with no copy. No iPhone measurement exists; that is the existing iOS revalidation gate.

### 8. Pre-existing findings (each reproduced identical on FREEZE-3)

**F1, carried row re-refused by arrival order.**
- **Reproduced:** 48 / 47 / 37 rows in force lost on seeds 20261119 / 1 / 2 (non-monotone only). All 48 are equally absent from FREEZE-3's output. Re-sending a batch reaches the same path.
- **Binding before a real-athlete restart: yes.** A carried row leaving the record can hide a session after a readiness declaration. Under custody (C-F01-2) the review is refused instead ("a stored row is missing"), but the engine defect stands.
- **Owner:** Core with QRE, then Security.

**F2, a merged watch activity is not indexed on re-read.**
- **Reproduced:** journey B is identical on both trees, with one activity credited to two sessions. Re-sending a refused activity-bound correction admits it in the next review (`probes/idem2.mjs` samples).
- **Binding before a real-athlete restart: yes.** It over-credits dose, and HealthKit re-delivery is ordinary.
- **Owner:** Core with Security.
- **Note for closure wording:** shape (B) of SEC-R2-03 is refused only while the activity is indexed. SEC-R2-03 itself, "a refused correction retires nothing", holds.

**F3, a carried conflicted correction loses its identity's quarantine on re-read.**
- **Reproduced:** `probes/f3.mjs`; both trees give `["session:sm"]` then `[]`.
- **Not binding for the restart:** the row stays `conflicted`, so no dose reader counts it.
- **Binding before real athletes see weekly-review evidence:** its conflict mark there is lost.
- **Owner:** Core with QRE.

**O-1, refused reports keep the conflict rule's effect on the row they hit** (QRE-R6-13/-14), extended by QRE-SR2-01.
- **This is a policy decision, not a defect of this mission.** It errs low on dose, and the readiness question still hears every voice (`claimsDone` ignores `conflicted`).
- **Not binding before the restart.**
- **Owner:** Founder / Core with Security (conflict policy).

None of F1, F2, F3 or O-1 blocks the closure of SEC-R2-03 or SEC-R2-04.

## Conditions

**C1, blocking for FREEZE-4 `--write`, tests only (owner: author; verified by QRE re-run).**

Add to `v1core-secr2-correction-integrity.test.mjs`, or to a new successor test file, tests that read records holding orphans as FREEZE-3 stored them. The rows can be hand-built, or produced by literal FREEZE-3 output fixtures; they cannot come from the candidate normalizer, which no longer writes them. Cover:
1. Shape (a): a session row marked replaced by the event id of another session's row in the record.
2. Shape (b): a session row marked replaced by an id the record does not hold.
3. Shape (c): a watch row with no session, marked replaced by another activity's row.

For each, assert the following, also after a JSON round trip:
- `restartIntake` gives `readinessDeclared` other than `true` after a declaration.
- `restartProgram` gives `ASK` with an `athlete.pause.*` missing input.
- The legitimate same-session, same-activity and same-manual controls stay history.

Acceptance: QRE mutants Q9 and Q11 are killed (and Q10, if a forged replacement row is cheap to build). The runtime stays byte-identical.

**C2, non-blocking (owner: author, in the same cycle).**
- Correct the QRE-SR2-01 claim in CANDIDATE §A and in the header of the test file.
- Correct the `SUCCESSOR_LEDGER.json` "successor" text for `:287` so that it names the C1 tests.
- Optionally address O-QRE-1.

**Routed, not conditions of this mission:** F1 and F2 bind before a real-athlete restart; F3 binds before real-athlete weekly-review evidence; O-1 is a decision. Owners are as listed in §8.

Nothing here invalidates C-F01-2, SEC-CORE-03 or the iOS revalidation, which remain open as before.
