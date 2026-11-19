# SEC-R2-03 + SEC-R2-04: correction integrity candidate

**Line:** branch `claude/v1-core-sec-r2`, worktree `.claude/worktrees/v1-core-sec-r2`, from `a6e10d0` (C-F01-1 r2 final; COACHINGCORE-V1-CORE-SAFETY-FREEZE-3 verifies 24/24 there). Nothing pushed or merged.
**Runtime candidate:** `4e8cffe`. Two files change: `CoachingCore/src/r6-provenance.mjs` (`normalizeObservations`, the correction branch only) and `CoachingCore/src/v1-f08.mjs` (`replacedBy` only). Synthetic athletes only.

## A. Correction integrity report

### SEC-R2-03: a refused correction retired what it named

**Reproduction on FREEZE-3** (`evidence/red-probe-a6e10d0.json`, `evidence/probe-red.mjs`; tests below):

| Shape | FREEZE-3 | Candidate |
|---|---|---|
| (A) correction of X reusing Y's event id → `EVENT_ID_REUSED_WITH_DIFFERENT_FACTS` | X marked replaced by "Y", nothing replaces it; run history 2 → 0 | X in force, as it was; refused; run history 2 → 1 (Y: the event-id conflict rule, see O-1) |
| (B) correction of X carrying Y's watch activity → `ACTIVITY_BOUND_TO_TWO_SESSIONS` | X marked replaced by "X2" | X in force |
| (C) correction of X reusing X's own id with other facts | X marked replaced by itself, gone | X in force (event-id conflict rule) |
| (D) a correction that resolves a conflict and agrees with the row it retires | merged into the retired row: the session leaves the record in force | in force |
| (E) a second correction of an already corrected part (stale alias of a retired merged row) | a second row in force on the session: counted twice | merged into, or in conflict with, the row in force |

**Root cause (one):** the correction branch applied its effects before the correction was admitted, and applied them inconsistently.
- (A)–(C): `retire()` and the index deletions ran before the event-id, activity and conflict checks that can still refuse the report.
- (D): retiring the conflicted rows left `byIdentity` naming a retired row.
- (E): a report already replaced, still named by a merged part's id, was treated as a row in force: its index entries were deleted and its identity freed.

**Fix (`r6-provenance.mjs`, correction branch, +24/−12 lines):**
- The retirements become `admit()`, run only once every refusal check has passed: before the merge into the row in force, or before the accept.
- The identity checks read the record as the admission leaves it (`dropsIdentity`; for a conflict-resolving correction, no row to merge into). The event-id check reads it before the admission.
- `live`: only a row in force is retired. A report an earlier correction already replaced is handled as a carried replaced row already is.
- No new structure, ledger, copy or policy. The acceptance rules (chain, event id QRE-R6-14, activity QRE-R6-13, conflicts, E-1 parts, SEC-CORE-14) are unchanged. A refused report has exactly the effect the same report has with no `correctionOf` (tests 5, 6, 13, 16, consumers).

### SEC-R2-04: two missing identities matched

**Reproduction on FREEZE-3:**
- (a) Through the normalizer (Security's probe3): X is gone and `readinessDeclared: true`.
- (b) On a record FREEZE-3 already wrote with that orphan, stored and restored, and re-normalized: `readinessDeclared: true`.

**After SEC-R2-03:** (a) is no longer reachable by admitted events; test 18 passes with the FREEZE-3 `v1-f08.mjs` (`evidence/red-f08-at-a6e10d0.txt`). (b) stays reachable on records kept before this fix, and on a forged row, so the focal defence is needed.

**Fix (`v1-f08.mjs`, +4/−1):** `replacedBy` matches only on a positive identity: the same session, else the same activity, else the normalizer's identity of a manual report (its provider at its instant, both rows without session or activity). Readiness question only; no dose reader reads it.

### Tests

`CoachingCore/test/v1core-secr2-correction-integrity.test.mjs`, 20 tests: the Founder's cases 1–18, SEC-R2-04, the SEC-R2-01 successor, engine consumers and a seeded invariant run.
- **On the candidate:** 20/20.
- **With the runtime files at FREEZE-3 bytes:** 4/20 pass, all controls (`evidence/red-a6e10d0.txt`).
- **With only `v1-f08.mjs` at FREEZE-3 bytes:** 19/20; the one failure is the restored-record SEC-R2-04 test (`evidence/red-f08-at-a6e10d0.txt`).
- **Mutants** (`evidence/mutate.mjs`, `evidence/mutation.txt`): 9/9 killed:
  - never admit;
  - drop the conflict clause;
  - gate corrections on quarantine;
  - stale alias as in force;
  - event-id check after admission;
  - ignore `dropsIdentity`;
  - `null === null` back;
  - no session guard;
  - provider ignored.

### Limitations

- A record already written by FREEZE-3 with an orphan stays as written: no healing, no new reconciliation. The restart now asks for it (SEC-R2-04), and its dose readers still miss that session, which errs low. Every such record is synthetic.
- Within the pass of a refused report, the report's own identity is quarantined (`quarantinedIdentities`), as for any conflicting report. Nothing is persisted on the original row.

## B. Regression evidence

- **Differential**, FREEZE-3 vs the candidate (`evidence/differential.mjs`, `evidence/differential.json`). There are 3000 generated multi-pass records, each pass given the same prior, for each arrival clock.
  - **Monotone arrival:** 0 rows in force lost, 0 orphans written, 0 second rows in force, deterministic. Every difference from FREEZE-3 is a pass where FREEZE-3 wrote an orphan, a replacement by a refused report, or a second row in force. The remaining 1–2 differences are classification only: a replay counted as a replay rather than refused, after an index FREEZE-3 had deleted, and the order of `quarantinedIdentities`.
  - **Arrival with earlier timestamps and replays:** the same, except F1 below, which is identical in FREEZE-3.
- **Consumers through the composed engine** (`v1-safety-index.mjs`). For a refused correction of a run and of a strength session, these read exactly what the same plain report gives (test "15 and consumers"):
  - the weekly review (status, action, `weekEvidence`);
  - `strengthExposure`;
  - run history (calibration, forecast, pace);
  - the restart plan.

  Nothing is replaced, and every session keeps its row in force. A session of a plan a restart replaced keeps its row.
- **Dose** (`evidence/dose-impact.mjs`, `evidence/dose-a6e10d0.json` / `dose-4e8cffe.json`): see §C.
- **Full suite:** see §D.
- **Bench:** `bench/bench.mjs`, `bench/bench-a6e10d0-vs-candidate.json`.

## C. Dose: what changes and why (for SSCTR)

Doses change only on records where FREEZE-3 lost a session to a refused correction (or merged a correction into a retired row, or counted one execution twice). The session now counts as it did before the refused report, exactly as with the same report sent without `correctionOf`.

Engine journey (plan A, week 0 reported in full, then a refused correction of run d3 reusing run d1's id; restart at day 10). C-Q08-1 bounds the stated exposure to the run minutes executed in the 28-day window ÷ 4:

| | Runs counted | Bound (min/wk) | Restart week 0, RUN minutes |
|---|---|---|---|
| no refused report (control) | 4 | ≈40 | 15, 15, 20, 20 = 70 |
| FREEZE-3 (d3 lost, d1 in conflict) | 2 | ≈20 | 15, 20, 20, 15 = 70 |
| candidate = plain report (d3 kept, d1 in conflict) | 3 | ≈30 | 25, 20, 20, 15 = 80 |

The +10 min of the candidate over both comes from the start classes, which are not monotonic (SSCTR O-1, B0-F05, a residual already open): a lower bound (30) maps to a higher first session than 40. The same 80 is what FREEZE-3 itself gives to the plain report. Strength (journey S): the restart plan is unchanged (STRENGTH 27, 27). No progression, threshold, periodization, calibration rule, Race Forecast, Pace Insights, Strength rule or coach profile is changed, and Pace Revision stays off.

## D. Full suite

On `4e8cffe` (`evidence/suite-4e8cffe.txt`): **1769 / 1740 / 29**, against FREEZE-3's 1749 / 1722 / 27.
- The 20 new tests pass.
- The 27 earlier failures are at the same locations as in `audits/v1-core-cf011-r2-2026-11-18/evidence/suite-37c0f6f.txt`.
- Two failures are new, both by design (`SUCCESSOR_LEDGER.json`):
  - `v1core-cf011r2-restart-evidence.test.mjs:287`, whose first assertion pins the orphan itself;
  - `v1core-cf011r2-freeze.test.mjs:12`, the FREEZE-3 line's preservation check, which now names `src/r6-provenance.mjs` and this line's files.

  No other test changes status.

**Bench** (Node, interleaved, 5 rounds; `bench/bench-a6e10d0-vs-candidate.json`, run with `--expose-gc`):

| Measure | Ratio |
|---|---|
| review median | ×1.009 |
| restart from a corrected record, median | ×1.062 (an earlier run gave ×1.000: noise) |
| record bytes | ×1.000 |
| normalizer, small batch | ×0.98 |
| normalizer, 240-row corrected history | ×1.003 |
| normalizer, re-sync | ×0.992 |
| heap per normalization | 1191 vs 1198 KiB |

The change makes no copy of the history: `admit` is a closure over the rows it already holds. No budget was changed, and none of this is a measurement on the iPhone.

## E. Findings outside SEC-R2-03/-04, routed, not fixed (each identical in FREEZE-3)

- **F1. A carried row in force is re-refused when an incoming report sorts before it** (High; owner: Core with QRE, then Security). The normalizer sorts carried and incoming rows together by availability (`correctedAt ?? reportedAt`). A new report dated before a carried correction (a late watch sync, a replay of an old item) is processed first. The carried row is then refused (`DUPLICATE_CONFLICT_QUARANTINED`, `ACTIVITY_BOUND_TO_TWO_SESSIONS`, `INVALID_CORRECTION_CHAIN`) and leaves the record entirely, not even as history. Reproduction: `evidence/differential.mjs` without MONO, KIND=lost (48/3000 cases). Never seen with a monotone arrival clock. Binding: to be judged; it is the "execution disappears" class through arrival order, not through a refused correction.
- **F2. A watch activity merged as a part of another row is not indexed on later reviews** (Medium; owner: Core with Security). `byActivity` is built from each row's own `source.activityId` / `canonicalActivityId`, so a manual row that merged the watch report does not carry it. In a later review, a correction of another session carrying that activity is accepted: one activity, two sessions (`evidence/dose-impact.mjs`, journey B).
- **F3. A carried correction in conflict loses its identity's quarantine when re-read** (Medium; owner: Core with QRE). The carried `conflicted` flag restores the quarantine, and the same correction's own admission (the "a correction resolves a conflict on its identity" step) deletes it. `weekEvidence` reads `quarantinedIdentities` for its conflict mark. A plain conflicted row keeps it. Reproduction: a P4 record (`C1` in conflict) normalized again with nothing new gives `quarantinedIdentities: []`; the control gives `["session:sm"]`.
- **O-1 (decision for the judges, not changed).** A refused report that reuses an event id with other facts flags the row holding that id as `conflicted` (QRE-R6-14), whether or not it names a correction. That row stays in the record, in force, out of dose and calibration. Activity reuse does the same to the bound row (QRE-R6-13). So a refused correction still has the conflict rule's effect on another row, the same as the plain report. Changing that is a conflict-policy decision, outside this mission.

## F. Unchanged gates

- **C-F01-2** (custody: the restart receives the record exactly as the engine returned it) and **SEC-CORE-03** (the author of a correction is not checked) are untouched and still bind before a real-athlete restart.
- The fix depends on neither. A forged replacement row or a forged refused report has the power custody already grants.
- The observedAt vs localDate observation (SEC_R2_R1) is unchanged.

## G. Freezes

- FREEZE-3's verifier now names `src/v1-f08.mjs` as drift, and C-F01-1 r2's preservation test names this line's files, both by design. FREEZE-1 binds the base bytes of `src/r6-provenance.mjs`. Every other record (V1_1, every R7 record) already bound earlier bytes of both files before this line.
- The successor verifier is `CoachingCore/scripts/v1core-freeze-4.mjs` (`--preserved`), with test `v1core-secr2-freeze.test.mjs`.
- The tests that fail by design are listed with old and new values in `SUCCESSOR_LEDGER.json`.
