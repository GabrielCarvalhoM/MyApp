# SSCTR narrow recheck of the C-F01-1 r2 focal cycle, R2 (2026-11-18)

**Decision: ACCEPT.** The cycle delta changes no dose and no sporting reading. SSCTR_R2_R1 stands, with C-R2-1 now discharged and C-R2-2, O-1 and O-2 carried as before. This recheck needs no correction cycle.

## Reviewer and target

**Reviewer:** the same SSCTR instance as R1 (SSCTR-1.0.0 / SSCTR-CONST-1.0.0, claude-opus-5-5).
- Authority: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical only.
- No human review took place, I made no clinical judgment, and I delegated nothing.
- No literature was needed, because no sporting rule is decided here.
- I did not read SEC_R2_R1 or QRE_R2_R1, only how DECISION §6 and CYCLE1 summarise them.

**Target:** runtime `37c0f6f`, records `2819e6a`. The worktree HEAD is `2819e6a`, and `CoachingCore/src` and `CoachingCore/test` have no diff between `37c0f6f` and `2819e6a`.

| File | SHA-256 |
|---|---|
| `CoachingCore/src/v1-f08.mjs@37c0f6f` | `a3ca21ae3f645ad74b6c13bfa26d2d8fdb1c90d82e85a011988271a520b5cc10` |
| `CoachingCore/test/v1core-cf011r2-restart-evidence.test.mjs@37c0f6f` | `6844a9c2e5e3591750ec2414c5e682e994760d07d21e2541e27ff09ed18e035a` |
| `audits/v1-core-cf011-r2-2026-11-18/DECISION.md@2819e6a` | `f1184e0abeb0b86b6fe233a6faf05b4d886fa7848cbc72dd8d155a473c652924` |
| `audits/v1-core-cf011-r2-2026-11-18/CYCLE1.md@2819e6a` | `5278bc47b44a1ffb98af1fd3907ab883606968ca945111960245ae636082644b` |

## Evidence

**The runtime delta** (`git diff 3f0b04f 37c0f6f -- CoachingCore/src`, 13 lines) changes three things:
- `wellFormed` is applied to `occurred`;
- `claimsDoneIn` and `replacedBy` are added, and only `trainedAfter` reads them;
- `executed`, `once`, the gate, the bound and its amount are the `3f0b04f` bytes.

**Tests:**
- `node --test test/v1core-cf011r2-restart-evidence.test.mjs` passes **36/36**.
- I did not run `verify`, `verify-r*`, the freeze scripts or the full suite.

**Probes.** I re-ran my R1 probes unchanged on the cycle runtime: `dose.mjs`, `floor.mjs` and `strength.mjs`, in `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/bd5bc05f-f34c-4538-bfb8-fc330e278203/scratchpad/ssctr-r2r1-9e4b/`.
- Every case gives the same output as on `3f0b04f`: status, class, the first six weeks' run minutes, the bound, the pause days and the calibration hash.
- That covers 25 cases: shapes A and P4, direct conflicts, the window variants, strength-only records, the return-floor lift, and the cases with unstated exposure and with no stated pause.

## Sporting reading of the delta

**SEC-R2-01.** An orphaned replaced row now keeps its voice, but only for the SB-1 question. In that case the declaration no longer stands in for the stop, and the reason is screened or asked.
- This adds a question and no dose.
- The dose, the bound and the pause still read no execution from such a row.
- It is the same direction I accepted for `claimsDone` in R1, item 4.

**SEC-R2-02.** `wellFormed` requires a boolean completion and readable, non-negative measures.
- The normalizer already rejects rows without a boolean completion (`ACTUAL_COMPLETION_REQUIRED`, `r6-provenance.mjs:121`) and parts without one (`validPart`, `:59`). So no record the engine writes loses its occurrence.
- A malformed voice now sets no pause. The result is a longer pause or none, never a shorter one.
- The probes show no change on any engine-written shape.

## Records

- **C-R2-1 reads as intended** (DECISION §6): the return-floor lift is named as the one change in the less conservative direction, and as correct under (ii). **Discharged.**
- **C-R2-2 reads as intended,** both variants with their owner, and not binding before real-athlete use.
  - "Per sport" includes the strength-only record that bounds running, as I meant it in R1 §5.
  - The final report should say so explicitly.
- **O-1 and O-2** are carried to the final report, as intended.

## SEC-R2-03 routing: agreed

- **Why an independent issue.** The root cause is in `r6-provenance.mjs`, which earlier freezes bind, and fixing it changes what every V1 reader reads. That needs its own mission and review.
- **Sporting severity.** The lost session errs toward a lower dose: the bound is lower, and the pause read from an earlier session is longer. It also errs toward less calibration evidence. It never errs toward a higher dose, and with SEC-R2-01 the SB-1 question is now asked.
- **What it does cost.** It is a record-integrity loss of the athlete's real training.
- **What the final report should do.** List SEC-R2-03 as an open record-integrity item for real-athlete exposure. Its owner is the next Core mission, then QRE, then SSCTR.
- From the sporting side, it is not a safety blocker.

**Human queue:** unchanged from R1 (proposed only, not appended).

**Re-review triggers:** as in R1.
