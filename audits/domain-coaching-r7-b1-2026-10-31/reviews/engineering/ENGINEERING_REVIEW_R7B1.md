# R7-B.1 engineering review — R7B1-ENG-r1 (one narrow review)

| | |
|---|---|
| Freeze | R7B1-FREEZE-1, record `CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_1.json`, freeze commit `d41df8b`; worktree HEAD `7b285f2` has the same runtime bytes |
| Source / manifest | `976a13351f0b40ee363e9e4d6d1592e2653306ac018e3cf143d2d16968d366c9` / `2fc0a59a7b919b6b7a039981cd995c2d511437481a713a5c74a97c57c84d614b` |
| Identity | `node scripts/verify-r7b1.mjs --tests`: 24/24 PASS before (762 tests); without `--tests`: 23/23 PASS after. No tracked file changed. |
| Judge | `quality-reliability-engineer` 1.3.0, independent instance (did not author R7-B.1); fixed nothing |
| Record | [ENGINEERING_REVIEW_R7B1.json](ENGINEERING_REVIEW_R7B1.json); probes and outputs in [probes/](probes/) |

## Verdict: NOT_READY

R7-B.1 fixes what it set out to fix, and the evidence is plan-level: it fails on FREEZE-2 and passes on these bytes. But checking every block-choice path, as this gate requires, turned up one new MAJOR finding (QE-R7B1-01): a block-choice question pre-empts the clinical screen.

## Blockers in scope

| Id | Status | Evidence |
|---|---|---|
| QE-R7B-R2-01 | **RESOLVED** | N7a–d FAIL → PASS. j2: 15 decision timelines (substitution, schedule, equipment, goal, sequences) plus the weekly reviews after each. The stored capped templates follow the context; the plan is capped exactly when its state is; the next review reproduces the decision. A cap released and then corrected re-caps from the stored context, and a held release does too (j2f). Context segments stay consistent (j2g). |
| QE-R7B-R2-02 | **RESOLVED** (the factual re-plan) | N1, N1b FAIL → PASS. j1: 132 cases (17 review kinds × 3 choices × with or without a correction, plus a graduation setup). The question carries exactly the correction-alone re-plan (0 failures; 66 on FREEZE-2). The question then the answer equals the review without the choice (0; 42 on FREEZE-2). Nothing stale comes back. The r202 differential is identical. |
| QE-R7B-R2-03 | **RESOLVED** | N3 FAIL → PASS. j3: 116 equipment losses after SKILL_MISMATCH substitutions give 0 climbs, the nearest usable rung first, and no silently empty slot (76 climbs on FREEZE-2). j3d: all 30 "no lower option" questions are true questions. |
| QE-R7B-01 residual (R2-04) | **RESOLVED** | N5 8 → 0. j4 widens it to every week ahead and to capped novices: 211 applied substitutions, 0 slot-weeks inconsistent (96 on FREEZE-2). |
| QE-R7B-05 residual | **RESOLVED** on the paths in scope | R2-01 is closed. **R2-05 = the R18 path holds** (j6): week 2 is uncapped only when week 1 gets no gating review. It is capped whenever week 1 was reviewed (with nothing, part or all reported) and when the change came after the week-1 review. A new return path is recorded as QE-R7B1-02. |

The knock-on restriction (the R2-03 direction binds only the replaced exercise's own slots) holds for R2-03. Its one pre-existing residual class is QE-R7B1-03.

## New findings

| Id | Severity | Origin | Finding (reproduction) |
|---|---|---|---|
| **QE-R7B1-01** | **MAJOR** | Pre-existing since FREEZE-2 (R7-B fix cycle; FREEZE-1 routes every case to a human). **Aggravated by R7-B.1:** the question now carries a prescription. | A review that reports pain with an exercise (substitution, `pain: true`) or an illness interruption, sent with a block choice, gets the ASK "Block choices are made in the weekly review…" instead of `CLINICAL_HUMAN_REQUIRED`. Its reference pending is ASK, so the clinical pending is lost. With a correction in the same review it also gets `proposal` = the factual re-plan of the sessions ahead, including the exercise reported painful. **Cause:** `src/r6-adaptation.mjs:363-364` decide the block-choice question before the handler runs, and `:329` rejects unrecognised choices before it, so the handler screens at `:537` and `:1212` never run. The second block-choice path already yields to the clinical route (`:365`); the first does not. **Violates:** SSCTR B0-C06 condition 8 ("passes the clinical screen first"), D08, and the R7-A rule that a clinical route proposes nothing (`:1071`). **Expected:** `CLINICAL_HUMAN_REQUIRED`, no proposal, as without the choice. **Actual:** ASK in 12 of 16 cases, 4 of them with a proposal. **Reproduction:** `probes/j1b-clinical-repro.mjs`; outputs for R7B1, FREEZE-2 and FREEZE-1. |
| QE-R7B1-02 | MINOR | Pre-existing (R7-B lazy cap start × R7-A return reading HISTORY). R7-B.1's R2-01 fix exposed it. | A schedule-started cap is lost by a return in the capped period. HistoricalState, which the return reads, never starts a cap that a schedule change started. So a short return in week 2 re-plans that week's remaining days as LOWER_B and UPPER_B: three full sessions where the cap allows two. The cap returns from week 3. An intake-capped athlete keeps the cap through the same return. All weeks were reviewed, so this is not R18. Reproduction: `probes/j7b-return-cap-repro.mjs`. |
| QE-R7B1-03 | MINOR | Pre-existing (FREEZE-2 identical) | Knock-on slot: after "push-up cannot be done with steady technique", UPPER's accessory push silently becomes pike-push-up. Pike-push-up is the next ladder link above push-up, at push-up's skill, and the decision states only push-up → incline-push-up. Reproduction: `probes/j3b-knockon-repro.mjs`. Adequacy goes to the SSCTR; the missing disclosure goes to the next runtime mission. |

Observations, not counted:
- OBS-01: a capped novice's substitution re-chooses which days carry the full and the core sessions, from the decision's own week. This is unchanged since FREEZE-1 (`j4c`).
- OBS-02: one-arm-db-row → band-face-pull is a consequence of the R2-04 candidate iteration; adequacy goes to the SSCTR.

## What holds

- **Scope of the delta:** 3 runtime files and 1 new test file. The 733 earlier tests pass unchanged. Policy, catalog, schema and B0 records are unchanged.
- **Timeline differential**, re-run read-only: PASS, with 98/98 PRESERVE timelines identical.
- **Conformance:** PASS on the matrix (301 entries) and on the delta (7 entries).
- **Catalog and records** fail closed (C1a–d).
- **R7-B recheck probes:** every FAIL → PASS the closure claims, and no PASS → FAIL. The remaining FAILs are identical to FREEZE-2 and are already routed.
- **Event-week guard** (j5, j8): it reads the evidence of the decision's own week. A correction or a missed session keeps a never-performed substitute out. HistoricalState never reads the projection. `projectedOnly` fits R18.
- **R7-A on the new paths:** QE-R7ADA-01 and EARLY = LATE hold through the question. Correction authority over the cap and over the guard holds.

## Next action

REQUEST_CHANGES to the R7-B.1 owner for QE-R7B1-01: the clinical screen must come before any block-choice question on every path, as on FREEZE-1. The prescription the bypass now emits comes from R7-B.1's own R2-02 correction, so the item may qualify for the one narrow cycle (request §17). The coordinator decides. QE-R7B1-02, QE-R7B1-03 and the observations are routed and do not block.

R7B1_ENGINEERING_GATE = NOT_READY
