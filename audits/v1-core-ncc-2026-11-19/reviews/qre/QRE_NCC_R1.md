# QRE review R1: Normalization Consistency Closure (F1, F2, F3)

**Judge:** Quality & Reliability Engineer (independent instance; not the author). I did not read any Security or SSCTR review of this line.
**Verdict: NOT_READY** (QUALITY_BLOCKED for the successor freeze). The fixes for F1, F2 and F3 hold on everything the author measured, and I reproduced each of those measurements. However, the new correction-before-report rule refuses valid corrections that FREEZE-4 admitted, in the same late-arrival class this mission closes. One of those corrections carries the athlete's adverse answer. The author's differential cannot see this. One focal runtime change fixes it (C1), with tests and harness (C2).

## Identities judged

| Item | Value |
|---|---|
| Candidate commit | `ef490bbc892082f1ec3f062890458ec9b7ce45a3` (runtime commit `07301f366fca92c7f877ed77886853fdb9b53999`; `git diff 07301f3 ef490bb -- CoachingCore` is empty) |
| Base | `e704180d48995a9648d46a632eb02589b9942228` = COACHINGCORE-V1-CORE-SAFETY-FREEZE-4 |
| Runtime change | one file: `CoachingCore/src/r6-provenance.mjs`, sha256 `fc04b9e21ed5435bbe66fd0bf6bfe40972755b5dc8311a1dd00b7fcf84eddb19` (base `d2439377dce49b6e70f3d2db2c84281e940a7afd9b476964dcc9a60cb075fb3a`) |
| Added | `test/v1core-ncc-normalization-consistency.test.mjs` `43c13b99…62ca`; `test/v1core-ncc-freeze.test.mjs` `6dddc4f6…0467`; `scripts/v1core-freeze-5.mjs` `3b75ff2e…8571` |
| Records | `CANDIDATE.md` `b7717b7d…443c`; `SUCCESSOR_LEDGER.json` `878c1cb5…d701`; `evidence/differential.mjs` `d28e021d…6b24` |
| Scope outside CoachingCore | `git diff e704180 ef490bb` touches nothing except `audits/v1-core-ncc-2026-11-19/` |

Environment: Node v24.19.0 on Windows. Everything ran on scratch extracts (`git archive`) and on two `git clone --shared` checkouts (ef490bb and e704180) with `core.longpaths`. Nothing was written to any worktree except this file. No `--write`, no `npm run verify`, no `verify-r*`.

## Criteria → evidence → result

### 1. Processing order (history, then carried rows in force, then incoming) for every caller: PASS

- **`r6-adaptation.mjs`, both review paths (:569 clinical hold, :605):** the record goes in as `prior` (declarations and F08 facts filtered) and the review's reports as `observations` (`incoming:true`), so the group order applies as intended.
- **`canonicalRecord` (:2521):** the whole record is `prior`, with no incoming reports. The order is history first, then rows in force by availability. Re-reads are stable (§3).
- **`r6-learning.mjs`:** `model.observations` (rows in force only) is `prior`, and the review's bound rows are the incoming reports. Record-first means the model's rows are read first. The suite's learning tests do not change status. The author's observation stands unchanged: a carried correction finds no original there.
- **`r6-legacy.mjs`:** the R5 path, not V1. Only `fresh` rows are appended to its ledger, so normalizer output is never stored there.
- **Comparator:** every key is finite (`availability` falls back to `now`) and ties break by code point, so the sort is total and deterministic.

### 2. Determinism: PASS

- The author's harness, re-run by me, reports nondeterministic = 0. Its output is byte-identical to `evidence/differential-late-20261119.json` and `differential-mono-20261119.json`.
- My probe P6 re-reads the output a second time: 0 changes on the candidate.

### 3. Replays, idempotence, re-read and JSON round trip: PASS for records this line writes

- **Author's invariants:** reproduced exactly, all 0 (rows lost, orphans, double identity, double activity, re-read instability, round trip, nondeterminism).
- **Deeper probe (P6).** The author's re-read check compares only in-force sets and flags. P6 compares every field of every row (in force and history), with `recordArrival:true` as the engine uses it. Seed 20261119, 1500 cases, 4405 passes: candidate 0 changed rows in force, 0 changed history rows, 0 changes on a second re-read. FREEZE-4 had 1 change.
- **Records FREEZE-4 wrote (P10).** Re-read once by the candidate, these lose rows in force: 17 rows (seed 20261119) and 11 (seed 1), non-monotone only; monotone gives 0. FREEZE-4's own re-read of the same records loses 0. Every case is event-id reuse: a row in force with the same event id as a history row. With history now read first, the row in force meets the history row's id. It is refused as `EVENT_ID_REUSED_WITH_DIFFERENT_FACTS` (16 cases), or taken as an `EXACT_REPLAY` of the history row and silently dropped (1 case; for example record `[M0<M1 in force, M1~M0, M0~C0-0]` re-reads to zero rows in force with nothing excluded). The candidate never writes such records, and every FREEZE-4 record is synthetic. → **C3** (declare it; not blocking).

### 4. Continuity across reviews and restarts: FAIL (C1)

The rule added for F1 reads:

```js
Date.parse(corrected) < availability(old)   // old = byEvent.get(o.correctionOf)
```

It refuses a correction made before the report it corrects became available. But `old` is the **row that holds** the named report, not the report itself. When the named report is a merged part (`byEvent` maps part ids to the holder row, :205/:220/:224), the rule compares against the holder's own availability, which is the `reportedAt` or `correctedAt` of whichever report leads the row. That is mis-identity.

The holder is later than the part in exactly two situations:
- an earlier report merged late into a carried row (the F1 shape this line introduces);
- the holder is a later correction that inherited the part.

In both, a valid correction is refused. The outcome then depends on how the reports were split into reviews, which contradicts CANDIDATE §A ("one rule keeps the outcome independent of how reports were split into reviews"). FREEZE-4 admitted every one of these corrections.

**Minimal reproducer P1-S1 (device re-sync delivered late).** Normalizer, `incoming:true`, session `s1`, all reports on 2026-11-10:

```
R1 @10:00  W  watch HK1, reportedAt 08:00, 40 min;  A athlete, reportedAt 09:00, 40 min   -> row W{W,A}
R2 @13:30  A2 correctionOf A, correctedAt 13:00, 38 min                                  -> row A2{A2,W}
R3 @15:00  W2 watch HK1 correctionOf W, correctedAt 12:00 (after W's 08:00), 42 min
```

- **Candidate R3:** `W2: INVALID_CORRECTION_CHAIN`. The row in force keeps the stale watch part (40 min). The rule compared 12:00 with A2's 13:00.
- **Same four reports in one review (candidate):** W2 admitted, `A2{A2,W2}`, 42 min.
- **FREEZE-4, either split:** W2 admitted, 42 min.

**Minimal reproducer P1-S2 / P2 (athlete's correction, adverse answer):**

```
R1 @14:30  X  watch HK2, reportedAt 14:00                                                -> row X
R2 @16:00  Y  athlete, reportedAt 09:00 (late);  Y2 correctionOf Y, correctedAt 10:00, response {recovery:ADVERSE, effort:HARDER}
```

- **Candidate:** Y merges into X, then `Y2: INVALID_CORRECTION_CHAIN` (the rule compared 10:00 with X's 14:00). The record in force has response all `UNKNOWN`: **the adverse answer is lost**. It is also lost when Y2 comes in a third review.
- **Same reports in one review (candidate):** Y2 admitted.
- **FREEZE-4, both splits:** Y2 in force with `ADVERSE/HARDER`.

**Through the engine (P7).** Week 0 of `athleteA`: run d1 is the athlete's report plus watch `dev-d1`, merged. The athlete corrects their part at 20:30 (review 21:00). A re-sync of `dev-d1` made at 20:00 (+3 min) is delivered at 23:00.
- Candidate: `dev-d1-v2: INVALID_CORRECTION_CHAIN`, and d1 stays at 40 min with the old watch part.
- FREEZE-4: `dev-d1-v2` in force, 43 min.

**What a fix needs (author's choice).** Compare with the named report's own availability:
- when `old.eventId === o.correctionOf`, as now;
- for a part, its own availability, which the part would then need to keep;
- where that availability is unknown (parts written earlier), never refuse.

My QRE-only variant QM12 (rule applied only when `old.eventId === o.correctionOf`) fixes S1, S2 and P7 and gives the one-review outcome. It passes the NCC file 21/21. On the author's generator it is identical to the candidate: 0 differences in any incoming report's fate on seeds 20261119, 1 and 2, non-monotone and monotone. This shows the generator never reaches this class. QM12 is an indication, not the required fix: it would still admit a correction of a part made before that part was available, when the two arrive in separate reviews.

### 5. Activity index (F2), including the flag now on the row in force: PASS with one non-blocking edge (C4)

- **Binding:** part activity ids are kept only when present, and missing or empty ids bind nothing. The NCC tests and my mutants confirm both: QM10 "parts' activities indexed only for new rows" is killed by 3 tests.
- **Prevalence:** on the author's generator, the candidate refuses 52–55 reports per seed as `ACTIVITY_BOUND_TO_TWO_SESSIONS` where FREEZE-4 admitted them (P3, incoming-fate accounting). Every sample I traced is the intended QRE-R6-13 conflict: a correction carrying another session's activity, plus its chained corrections that then find no original.
- **Edge (P11).** A device correction moves session s1 to a new activity id (W@HK1 → W2@HK9), and a report of session s2 carrying HK1 arrives in the same review.
  - Candidate: flags W2 conflicted (`ACTIVITY_BOUND_TO_TWO_SESSIONS`), although W2 no longer holds HK1, and quarantines both sessions. In the next review the same report is admitted, because history does not bind activities.
  - FREEZE-4: refused it in the same review too, but flagged nothing in force.
  - Effect: errs low on dose, and depends on the split. → **C4**.

### 6. The new correction-before-report rule: does it refuse what FREEZE-4 admitted in a realistic flow? YES

See §4. The flows (a late device re-sync, an athlete's correction made offline and delivered late) are the late-arrival premise the mission treats as P0 for F1. The athlete's voice (P2) and the device's corrected measurement (S1, P7) leave the record as refused reports.

Where the named report really is the row (the author's tests E and K), the rule behaves as claimed: the same result in one review or two. QM6 (`<=`) is killed.

### 7. The `heldBefore` change (F3): PASS

- A carried correction in conflict keeps its quarantine on re-read, after a JSON round trip and after a second re-read: reproduced (author's tests, P6).
- A valid correction still resolves a conflict. One still in conflict keeps its own conflict.
- **Mutant survivors.** QM1–QM5 revert one `heldBefore` site at a time; QM11 drops the fallback to the history row. All survive, and all are equivalent on records where an identity has at most one row in force. They differ only for an incoming report carrying a client-supplied `conflicted:true` (see O-QRE-NCC-A). Not a condition.

### 8. State integrity: PASS except C1

No orphans, no two rows in force on one identity, and no activity in force on two identities, on any configuration I ran. Refused corrections stay visible in `excluded`. The losses in §4 are refusals of incoming reports, not silent evictions. The losses in §3 (P10) are on FREEZE-4-written records only.

### 9. Freeze preservation: PASS

- `node scripts/v1core-freeze-5.mjs --preserved` on the clean clone of ef490bb exits 0:
  - the nine earlier records are the base bytes;
  - FREEZE-1 46/47, FREEZE-2 14/15 and FREEZE-3 23/24 (one file at FREEZE-4's bytes), FREEZE-4 39/40;
  - V1-FREEZE-1 197/198, V1RC 30/30, RWS-2 98/98, RFC 163/163, STR 121/121;
  - nothing else changed, no untracked file.
- `v1core-freeze-4.mjs --check` names only this line's three added files: by design, as the ledger states.
- `src/v1-f08.mjs` is at FREEZE-4's bytes.

### 10. Regression, by location: PASS

| Suite run (clean `git clone --shared`) | tests / pass / fail |
|---|---|
| ef490bb (candidate) | 1796 / 1765 / 31 |
| e704180 (base) | 1774 / 1745 / 29 |

- **Base vs FREEZE-4's evidence:** the failing locations are those of `audits/v1-core-sec-r2-2026-11-19/evidence/suite-36ea26a.txt`, minus `v1core-secr2-freeze.test.mjs:14`. That one is the untracked-file artifact of that run; it passes on a clean e704180.
- **Candidate vs base:** the base locations plus exactly two:
  - `v1core-secr2-freeze.test.mjs:14`. The ledger cites `:12`, the test's line; the assertion is `:14`.
  - `v1core-successor-lineage.test.mjs:205`: scenario 21, EASY. Runtime and oracle both now give `['app-stop','dev-x-v2']`.
- **Author's run:** the location set of `evidence/suite-07301f3.txt` is identical to mine.
- **Successors:** both successor tests pass in my suite.

### 11. Soundness of the differential classification: FAIL (C2)

The classifier takes the first matching class, and it only accounts for *carried* rows:
- `lostOf` checks prior rows only, so an incoming report refused only by the candidate is never counted as a loss;
- `F1_ORDER` matches any pass with one late report in which every carried row is kept, whatever else differs (359 / 336 / 318 passes);
- `F1_LOSS` and `F3_RESOLUTION` also return before anything else is compared.

Run on the S1 and S2 passes, the author's own `classify` returns **`F1_ORDER`** for both: the new defect would be classified as explained. The generator also never produces a correction of a merged part whose holder became available after the part (0 fate differences between the candidate and QM12, §4).

My incoming-fate accounting (P3) counts, per seed, reports the candidate refuses although FREEZE-4 admitted them:
- `ACTIVITY_BOUND_TO_TWO_SESSIONS` 52–55;
- `INVALID_CORRECTION_CHAIN` 13–21;
- `DUPLICATE_CONFLICT_QUARANTINED` 9–11;
- `EVENT_ID_REUSED_WITH_DIFFERENT_FACTS` 0–6.

Those I traced are justified (F2 conflicts and their chains, F1 order), but the harness does not classify them.

### 12. Tests and mutants: PASS for what they cover; gap for C1

- **Author's run, reproduced exactly:** RED 5 pass / 16 fail; 8/8 mutants killed.
- **My 12 mutants:**
  - killed: QM6 (`<=`), QM7 (incoming before carried), QM8 (no availability inside groups), QM10;
  - surviving: QM1–QM5 and QM11 (equivalent, §7); QM9 (a merged report's activity not bound in its own review: an existing line this line's tests do not pin; non-blocking); QM12 (narrowed rule, which shows the tests do not pin the holder case).

### 13. Performance (Node only): PASS

- **Author's bench, re-run (5 rounds):** review median ×0.995, corrected restart ×1.012, normalizer small ×1.02 / corrected history ×1.035 / re-sync ×0.90, merged re-read ×1.01, merged kept bytes ×1.017.
- **Heap retained:** 210–223 KiB on both trees.
- **Scale probe P9** (600 sessions, athlete and watch merged): merge 111 vs 114 ms, re-read 61 vs 54 ms, full late re-sync batch 123 vs 135 ms (candidate vs FREEZE-4).
- Not an iPhone measurement.

## Conditions

**C1. Blocking the freeze; runtime change (owner: author, Core).**
- The correction-before-report rule must compare `correctedAt` with the availability of the report `correctionOf` names, never with the row holding it.
- Where that availability is not known (a part written before this line), it must not refuse.
- Acceptance:
  - P1-S1, P1-S2, P2 and P7 (§4) admit the correction. The rows in force (event ids, parts, minutes, response) equal the one-review outcome, on re-read and after a JSON round trip.
  - In P2, `ADVERSE/HARDER` stays in force.
  - The author's tests E/K (named report is the row) still refuse and admit as now.
  - The NCC file and the six differential configurations keep every invariant at 0.

**C2. Blocking the freeze; tests and harness only (owner: author; verified by the QRE recheck).**
1. Add the C1 reproducers to `v1core-ncc-normalization-consistency.test.mjs`, at the normalizer and at the engine (P7 shape). They must be RED on ef490bb and GREEN after C1, and must kill QM12-style weakening if the fix stores part availability. If the fix only narrows the rule, add a test that pins the declared residual instead.
2. In `differential.mjs`:
   - account for the fate of every incoming report (FREEZE-4 admitted, candidate refused, and the reverse) and classify each one; one left unexplained counts as UNEXPLAINED;
   - stop a class that only checks carried rows (F1_ORDER, F1_LOSS, F3_RESOLUTION) from absorbing a pass with an unexplained incoming refusal;
   - extend the generator with corrections of merged parts and late device re-syncs, including a correction delivered after a later correction of another part.
3. Re-run the six configurations.

**C3. Not blocking; records only.** In CANDIDATE §A, declare the second limitation for records FREEZE-4 wrote (§3, P10):
- with event-id reuse, the first candidate read refuses or drops a row in force (17 / 11 on seeds 20261119 / 1, one of them silently as an `EXACT_REPLAY` of a history row; 0 monotone);
- synthetic only; any future migration of stored records is routed to Core with custody (C-F01-2).

**C4. Not blocking; runtime change optional, else declared (owner: author).** In P11 (§5), the F2 retargeting flags a row in force that no longer holds the activity. Either flag only a row in force that holds it (own or part), or declare the behaviour. It errs low and depends on the split.

**C5. Not blocking; records only.**
- Remove or correct CANDIDATE §A's claim of split-independence until C1 holds.
- In `SUCCESSOR_LEDGER.json`, name `v1core-secr2-freeze.test.mjs:14` as the failing assertion (or say `:12` is the test).
- State in the harness header that the classes account only for carried rows (until C2).

**Routed, not conditions:**
- **O-QRE-NCC-A (Low/Medium, pre-existing; owner Core + Security, incoming sanitization).** `incoming:true` does not strip `conflicted` or `provenance.conflict`. A correction cloned from a conflicted record row stays conflicted on both trees (P8). On the candidate it also keeps its identity quarantined until a correction without the flag arrives.
- **QM9 test gap (Low).** Binding of a merged report's activity within one review is not pinned by a test.

Nothing here changes C-F01-2, SEC-CORE-03, O-1, or the iOS revalidation (`IOS_REVALIDATION_PENDING`), which remain open.

**Verdict: NOT_READY.** Blocking: C1 (runtime) and C2 (tests and harness). Not blocking: C3, C4, C5.
