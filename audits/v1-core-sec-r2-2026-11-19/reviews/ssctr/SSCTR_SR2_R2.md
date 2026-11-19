# SSCTR narrow recheck of the SEC-R2-03 + SEC-R2-04 focal cycle, R2 (2026-11-19)

**Decision: ACCEPT.**
- The cycle delta moves no dose.
- An adverse session reported after a wellbeing check is asked about again (ASK). On FREEZE-3 and `4e8cffe` the same journey answered KEEP.
- C-SR2-1 is discharged.
- SSCTR_SR2_R1 otherwise stands: C-SR2-2, -3 and -4 still bind before real-athlete use; C-SR2-5, O-3 and O-4 are carried unchanged.

## Reviewer and target

**Reviewer:** the same SSCTR instance as R1 (SSCTR-1.0.0 / SSCTR-CONST-1.0.0, claude-opus-5-5).
- Authority: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical only.
- No human review took place, no clinical judgment was made, and nothing was delegated.
- No literature was needed, because no sporting rule is decided here.
- I did not read the Security or QRE reviews. I read only how CYCLE1.md summarises them.

**Target:** runtime `36ea26a`, records at `f62bae3`. `CoachingCore/src` and `CoachingCore/test` have no diff between `36ea26a` and HEAD.

| File | SHA-256 |
|---|---|
| `CoachingCore/src/r6-provenance.mjs` | `d2439377dce49b6e70f3d2db2c84281e940a7afd9b476964dcc9a60cb075fb3a` |
| `CoachingCore/src/v1-f08.mjs` (unchanged since R1) | `f1065bf1e8c29a4019cf5f8f1c72e9f50f38a11796bf126d39c52a6470e27d37` |
| `CoachingCore/test/v1core-secr2-correction-integrity.test.mjs` | `ffbbf43d8d2b16bab3d83a62597fedf211d83fcac1354177609c8a19f52ab489` |
| `CANDIDATE.md` | `e576a16649caafde778c4e94ab3527af86dfa81162ae4d88fb5cc1cd2138d111` |
| `CYCLE1.md` | `818a34c52d7b2385dd1a0182b8c21b9622d48497d8e66ab134475d9eb3eabcd1` |
| `evidence/dose-36ea26a.json` | `53f1feaaea6157535f486b34a3e584231df44457a066bfeebc08604c8bf0f0b0`, the same hash as `dose-4e8cffe.json` |

## 1. The delta: no dose moves, and the adverse-session question returns

**What changed.** The diff `git diff 4e8cffe 36ea26a -- CoachingCore/src` moves one statement in `r6-provenance.mjs`:
- `setFirstRecorded(o, firstRecorded(o, old, …))` now runs inside `admit()`, not before the refusal checks.
- An admitted correction still takes its chain's first-recorded clock (QE-R7C-10).
- A conflict on a correction's own parts (`CORRECTION_CONFLICTS_WITH_A_REPORT_IN_FORCE`) is flagged after `admit?.()`, so that row still gets the chain's clock.
- No predicate, bound, gate or reader changes.

**Dose.** I re-ran `dose-impact.mjs` on an extract of `36ea26a`. Its output is byte-identical to `dose-4e8cffe.json`. I also re-ran my R1 probes:
- `attr.mjs`: byte-identical to its `4e8cffe` output. That covers the bounds 50/30/40, EASY_LOW, the week-0 roles, run facts, the calibration, forecast and pace hashes, strength 27/27 and the pause.
- `walk.mjs`: running 30, 40 and 50, walking 40, 40 and 20, identical.

So the clock is not a dose input: no bound, class, pause or minute moves.

**The wellbeing question.** The test "SEC-SR2-01 through the engine" uses the QRE-V1CP-04 shape: a wellbeing reduction, then a check, then a run reported ADVERSE after it. In the crafted journey, a refused "correction" of an older row also reuses the new report's id and facts. I ran this test on extracts of all three runtimes:

| Runtime | Crafted journey |
|---|---|
| `a6e10d0` (FREEZE-3) | KEEP: "next-week steps are gated…" |
| `4e8cffe` | KEEP, same reason |
| `36ea26a` | ASK: "A session was reported as not going well: tell us how you are…" |

On `36ea26a` the crafted journey gives the same ASK as the control.

**Sporting reading.**
- A session reported as going badly after a wellbeing check is new information. The check cannot answer it, so the warning signs and exercise response must be asked again.
- The older clock let a refused report backdate that session to before the check, and the question was skipped. That is a missed question on a possibly adverse response, not a dose effect.
- The fix asks the question, as the same report with no `correctionOf` does. **This improves on FREEZE-3 and `4e8cffe`, and costs one question and no dose.**

**Tests.** On the worktree, `node --test test/v1core-secr2-correction-integrity.test.mjs` passes **24/24**.

**F1, F2 and F3 are unchanged on `36ea26a`.** My probes `f1.mjs`, `f2.mjs` and `f3b.mjs` give the same outputs as on `4e8cffe`:
- F1: the symptom stop is dropped under an earlier-sorting sync.
- F2: the borrowed watch activity is admitted as WEARABLE_FULL.
- F3: CONFLICTED turns into COMPLETED on re-read.

**Not run:** `npm run verify`, `verify-r*`, the freeze scripts and the full suite.

**Probe files.** They are read-only and use synthetic athletes.
- Extracts are in `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/d9ef9ce4-1d97-47de-bf54-0b1d98cf2cf8/scratchpad/ssctr-sr2r2-5e1d/`. Each holds `git archive` of `CoachingCore` and `audits` at its commit, the cycle's test file and a copy of `node_modules`.
- The R1 probes are in `…/scratchpad/ssctr-sr2r1-7c3a/`.

## 2. C-SR2-1: discharged

CANDIDATE §C keeps the original table and adds a correction paragraph below it. The paragraph states:
- the old column totals RUN-sport sessions, including optional walks;
- the bounds are 50/30/40, all EASY_LOW with one run day;
- running is 50/30/40, so the candidate prescribes 10 min less than the control and 10 more than FREEZE-3;
- the +10 in the total is one optional walk;
- O-1/B0-F05 plays no part;
- O-3 records the split at a bound of 40–45.

Each statement matches my R1 measurement. CYCLE1.md lists the condition as done. Keeping the old table with its correction below it is acceptable for an audit record. Any summary should quote the corrected figures, not the table.

## Conditions after this recheck

| Id | Status |
|---|---|
| C-SR2-1 | **Discharged** |
| C-SR2-2 (F1), C-SR2-3 (F3), C-SR2-4 (F2) | Unchanged: binding before real-athlete use, as scoped in R1. Identical on `36ea26a` |
| C-SR2-5, O-3, O-4 | Unchanged, non-binding |
| C-R2-2, O-1 (B0-F05), O-2 | Carried |

**Human queue** (proposed only, not appended). HQ-SECR2-SSCTR-A is as in R1, with one addition: a refused report never changes another session's recorded clock, so a later adverse session is still asked about after a wellbeing check.

**Re-review triggers:** as in R1, plus any change to how the first-recorded clock is assigned.
