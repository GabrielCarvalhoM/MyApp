# SSCTR narrow recheck of the Normalization Consistency cycle, R2 (2026-11-19)

**Decision: ACCEPT_WITH_CONDITIONS. Nothing blocks the synthetic FREEZE-5.**
- **(a) Dose.** The cycle delta moves no dose except in the corrections that `ef490bb` wrongly refused. There it gives back FREEZE-4's outcome exactly.
- **(b) C-NCC-2.** It is discharged.
- **(c) Routed items.** C-NCC-1 and O-NCC-S1 are recorded correctly. The C-NCC-3 entry in CANDIDATE §F omits its binding use and owner. One record-only condition (C-NCC-R2-1) fixes this at closing.

SSCTR_NCC_R1 otherwise stands unchanged.

## Reviewer and target

**Reviewer:** SSCTR (SSCTR-1.0.0 / SSCTR-CONST-1.0.0), claude-opus-5-5, the same instance as R1.
- Authority: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical only.
- No human review took place, no clinical judgment was made, nothing was delegated and no literature was needed.
- I did not read the QRE or Security reviews. I read only how CYCLE1.md summarises them.

**Target:** runtime `963547b`, records at `b05d5ea` (worktree HEAD, clean).
- `git diff ef490bb 963547b -- CoachingCore/src` touches `src/r6-provenance.mjs` only (+8/−4):
  - `partOf` keeps the report's own clock (`availableAt`);
  - the chain rule compares a correction with the clock of the named report: the row's clock when the row is that report, else its part's, and never refused for a part kept without a clock.
- `CoachingCore/src` has no diff between `963547b` and `b05d5ea`. `v1-f08.mjs` is still `f1065bf1…7d37`.

| File | SHA-256 |
|---|---|
| `CoachingCore/src/r6-provenance.mjs` | `408eb9beb84c2548214a03bb282d5133e81e3908d21148008c57fd54a44a3581` |
| `CoachingCore/test/v1core-ncc-normalization-consistency.test.mjs` | `05377a41317671d713376bcee7d9879ffbce27dc4322bffdc723406c273f64d3` |
| `CANDIDATE.md` | `a1570a51d53af393501a3376fdfe213fae5977fcc1833b3a25585208f2ea83c8` |
| `CYCLE1.md` | `3cfa9eab322b5b00e242d17201415bb4b70fc00745b383801fc095506deaaaa4` |
| `SUCCESSOR_LEDGER.json` | `5c6747ce7daf38bf6ca649f119557e178ea4cc99dd9db933c726e2acd10e26bc` |
| `evidence/dose-963547b.json` | `9c6d6b8c555d4f4d0928bcd15a5f7e40c36b955ec2ad492e241485317913770c`, the same hash as `dose-candidate.json` |

**Commands** (Node v24.19.0, on a `git archive` extract of `b05d5ea`):
- `node --test test/v1core-ncc-normalization-consistency.test.mjs` gives **26/26**, including the five cycle tests.

**Probes.** They are read-only and synthetic, in `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/f7ba5817-8741-42b6-9733-0c42b02ab685/scratchpad/ssctr-ncc-r1-5e81/probes/`. `cyc-cases.mjs` is new; the rest are reused from R1.

## (a) The delta moves no dose beyond restoring FREEZE-4's admissions

**The five dose journeys.**
- I re-ran `dose-impact.mjs` on the cycle extract. Its output is byte-identical to my R1 rerun on `ef490bb`, and `dose-963547b.json` equals `dose-candidate.json` byte for byte.
- My extended journeys (`dose-x.mjs`) are byte-identical as well: bound, class, pause, the calibration, forecast and pace hashes, and strength.

**My R1 probes.** Every one gives byte-identical output on `963547b` and on `ef490bb`. The set covers:
- F1, F2 and F3 (`f1`, `f2`, `f3`, `f3b`, `f2row`, `f3resync`);
- SB-1 under late and monotone clocks (`sb1inv`, `sb1mono`);
- the inverse symptom stop through the engine (`inv`);
- lineage scenario 21 and its variants in both families (`s21x`);
- the skewed stop correction (`skew`).

So every R1 disposition, and SSCTR-NCC-01, reads the same on the cycle.

**The changed cases.** I re-ran the cycle's two engine tests myself on three trees (`cyc-cases.mjs`), adding weekly evidence, run history and the restart.

| Case | FREEZE-4 (`e704180`) | `ef490bb` | Cycle (`963547b`) |
|---|---|---|---|
| **P7**: a watch re-sync of d1 (+3 min), made before the athlete's later correction and delivered after it | re-sync in force at 43 min; COMPLETED; run fact `dev-d1-v2:43`; restart bound 51, 15+15+20 | re-sync refused (`INVALID_CORRECTION_CHAIN`); athlete's 40 min leads; bound 50, 15+15+20 | **= FREEZE-4** |
| **engine-e5d**: d3 known only from the watch; next morning the athlete's report and its symptom-stop correction (12 min, ADVERSE) | `d3-fix` in force, conflicted, with its stop; no run fact for d3; bound 40, 25+15 / 20+20 | `d3-fix` refused; the watch's 40 min in force, unflagged; run fact `d3-watch:40`; bound 50, 15+15+20 | **= FREEZE-4** |

Pause is RUN 4 / STRENGTH 5 and the class is EASY_LOW in all six cells. The warning-sign screen at the review is `REQUIRED` in all three e5d cells.

**Sporting reading.**
- **The e5d defect raised load.** `ef490bb` dropped the athlete's own symptom-stop correction and counted the watch's 40 min as executed running, in dose (bound 40 → 50, a third run day's worth of EASY minutes) and in run history. I did not catch this in R1: my `skew` probe tested a correction dated before a row's own report, not before a merged part's clock.
- **The cycle undoes it.** The stop is back in force, the dispute is quarantined, and no run-history fact comes from the disputed watch.
- **P7.** The device's corrected measurement (43 min) leads again, as on FREEZE-4. That is a measured amount from the source the athlete agrees with, and the +1 on the bound does not change any prescription.
- No other journey, rule or reader moves.

## (b) C-NCC-2: discharged

- **CANDIDATE §C, F2.** It states that the bound goes 49 → 40, restart running 45 → 40 and easy runs 2 → 1, and folds the cause into C-SR2-5.
- **CANDIDATE §C, scenario 21.** It states that the status goes CONFLICTED → COMPLETED on EASY, and that the history reference is a distance the athlete's refused symptom-stop report disputes, with the mechanism SSCTR-NCC-01. It also states that the easy band, calibration and next long run are unchanged.
- **`SUCCESSOR_LEDGER.json`.** The `sporting` field of the `:205` entry says the same.
- **Cycle bullet in §C.** It matches my table above.

## (c) Routed items in CANDIDATE §F

- **C-NCC-1 / SSCTR-NCC-01.** Correct: it binds before real-athlete weekly-review gating and run-history use, owned by the conflict-policy mission (Core with QRE and Security, then Product/UX and SSCTR). The closing criterion lives in SSCTR_NCC_R1 §6 and is not repeated there; that is acceptable.
- **O-NCC-S1.** Correct, as an observation for the F08 owners. It sits beside SEC-NCC-02, which describes the same family from the other side and binds before a real-athlete restart. The two are consistent.
- **C-NCC-3.** The content is correct (the run-format record travels with every review and restart, and one clock for `reportedAt`/`correctedAt`). The entry omits that it **binds before real-athlete use** and its **owner** (integration: Core with QRE and Security). CYCLE1.md says each routed item carries both.
- **C-SR2-5.** Its extension to the F2 shape is recorded in §C. That is acceptable.

## Conditions

| Id | What | Binding | Runtime change | Owner |
|---|---|---|---|---|
| C-NCC-R2-1 | In CANDIDATE §F, add C-NCC-3's binding use ("before real-athlete use") and owner (integration: Core with QRE and Security) | Binds the closing record only; not FREEZE-5 | No | Chief with the candidate author |
| C-NCC-1, C-NCC-3, C-SR2-5 (extended), O-NCC-S1 and the carried R1 items | Unchanged from SSCTR_NCC_R1 §6 | As recorded | As recorded | As recorded |

C-NCC-2 is discharged. HQ-NCC-SSCTR-A remains proposed only, not appended.

**Re-review triggers:** as in R1. They also cover any further change to how a part keeps or reads its own clock.
