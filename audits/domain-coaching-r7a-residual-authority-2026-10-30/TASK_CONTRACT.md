# R7-A RESIDUAL AUTHORITY CLOSURE — task contract

**Mission:** DOMAIN_COACHING_R7-A — Residual Authority Closure, a final bounded implementation mission.
- It succeeds R7A-DECISION-AUTHORITY-FREEZE-1, whose two independent reviews closed NOT_READY:
  - Engineering, on `review/r7ada-decision-authority-engineering` at `17e7285`: QE-R7ADA-01 and QE-R7ADA-02;
  - SSCTR, on `review/r7ada-decision-authority-ssctr` at `6f5d40c`: F4-X.
- Both reviews were read with `git show`; neither branch is merged or changed.
- It is **not** R7-B0 and never starts it.

**Authority:** the direct Founder request of 2026-10-30, verbatim in [FOUNDER_REQUEST.md](FOUNDER_REQUEST.md).
- Its decisions are binding and are not re-discussed (§2, §3):
  - QE-R7ASC-01..04 and F1–F3 are closed;
  - D53, D56–D59, HOLD and MAINTAIN are valid;
  - R2 and R3 are ACCEPT_WITH_REASON; R6-H35 is EXPECTED_CORRECTION;
  - `R1_R7A_BLOCKER = NO`, `R1_PRE_TESTFLIGHT_GATE = YES`.

**Contract revision:** R7ARA-TASK-1, 2026-10-30. The rules are in [RESIDUAL_AUTHORITY_CONTRACT.md](RESIDUAL_AUTHORITY_CONTRACT.md).

## Authorization and prohibitions

- **Implementation:** `SHADOW_REFERENCE_ONLY`, inside the existing authorization of the decision authority closure. It covers the offline, synthetic Node 24 Coaching Core in `CoachingCore/`: runtime, tests and scripts, and `CoachingCore/r7/residual-authority/`.
- **Only the two root causes (§4):**
  - A, the canonical factual correction before every decision (QE-R7ADA-01);
  - B, the return factual ceiling (QE-R7ADA-02, F4-X, the EASY return).
- **Not here:**
  - no general R1 solution (§3); NF-R7ADA-2 (§21);
  - real athletes, clinical work, fresh generalization, repertoires, marathon, pace, KMP, HealthKit or B0 (§28);
  - no new science, no reviewer run.
- **Unchanged:** policy R6-POLICY-5 (`18ec48f3…`). `product/` and `canon/` are not edited.
- **Not applied (§36):** `audits/growth-layer-2026-10-29/PENDING_CANON_SYNC.patch`. Its SHA-256 `6b737179…` is bound by [BASELINE.json](BASELINE.json) and checked by the freeze.
- **Branch:** `claude/r7a-residual-authority-closure`, created by this session from `5434b3265f5634d1e7c796426cd9d8415b3b1af2`, the baseline `claude/trusting-euler-04la8t`.
  - The request lets the session create its own branch from the baseline. It forbids altering or merging into the baseline (§0, §31).
  - The infrastructure named the baseline branch itself, so the work, the freeze and the push go to the session's own branch.
  - Nothing is merged into `claude/trusting-euler-04la8t`, `r7/decision-authority-closure-base` or `main`.
- **Stop at the freeze (§32):** one freeze, then the handoff and the two recheck briefs. No reviewer runs in this session. `R7A_EXIT_READINESS` is not declared.

## Immutable history

- [BASELINE.json](BASELINE.json) (R7ARA-BASELINE-1) binds 4,745 files before the first runtime edit, among them:
  - every closed R6 and R7-A audit, the decision authority audit included;
  - `product/`, `canon/`, the mission files, the human queue, the Growth Layer patch and the CoachingCore tree.
- `decision-authority-freeze-source/` keeps the R7A-DECISION-AUTHORITY-FREEZE-1 runtime byte for byte, with its own MANIFEST:
  - 85 files; source `3a7166b2…`, manifest `a500cdd9…`;
  - `prepare-r7ara.mjs` refused to copy unless all 85 matched the freeze record.
- **The reviewers' probes are copied byte-exact into `probes/judges/`, never edited.**
  - `qe/`: Q01, Q01b, Q04, Q05, Q06, Q06b, Q06c, Q06d, with their library.
  - `ssctr/`: continuous, walk/jog matrix, progression, return walks, R6-H25, with their library.
  - Their git blob ids equal the review branches' (recorded in [PRE_FREEZE_REPORT.md](PRE_FREEZE_REPORT.md)). Earlier probes are re-run from their own folders.
- **One earlier test file is edited in place**, marked `Residual authority closure`: `test/r7ab-week-start-authority.test.mjs` (I5/P3, §13 premise, I6). Its earlier bytes stay in `decision-authority-freeze-source/`.

## Baseline (§0), reproduced before any runtime edit

| Check | Result |
|---|---|
| Branch, HEAD | `claude/trusting-euler-04la8t` at `5434b32` (child of `d4631cd`), clean. The session branch was created there |
| R7A-DECISION-AUTHORITY-FREEZE-1 | 85 of 85 bound files match the freeze record; source digest `3a7166b25aaf550f7692cc058f0e582b42e9eb7f74b9e361f23733b5e74ab244` |
| The findings on the predecessor, with the reviewers' own probes | QE-R7ADA-01: Q01 14 cells, Q01b 12. QE-R7ADA-02: Q06c 11 cells; Q06 W-EXIT and E-RELEASED. F4-X: the SSCTR's continuous probe, 10 ladder and 4 duration cells. All as the reviewers reported |

## Root causes (one change each)

| Finding | Root cause on the predecessor | Contract |
|---|---|---|
| QE-R7ADA-01 | A3's factual re-plan ran only inside the weekly review, and only while a later-dated session remained. Every other review kind, and every kind on the week's last day before that day's session, decided on rows planned from the retracted fact, which then stayed the D44 reference | A5 |
| QE-R7ADA-02, F4-X | The state a return reads capped only walk/jog steps, and only while the mode was WALK_JOG. A released mode (the walk/jog exit) and released doses (long, easy, return step, restart) counted as tolerated | E1 |

## Pre-freeze gate (§29)

All gates, with their evidence: [PRE_FREEZE_REPORT.md](PRE_FREEZE_REPORT.md).
