# R7-D · Phase 3.3 — checkpoint (2026-11-06)

**Authority.** The Founder's request (R7-D Phase 3.3), summarized in `phase33/AUTHORIZATION_PHASE33.md` and not saved verbatim. That summary also records the Founder's mid-session instruction: no `rm -rf` and no recursive deletion; scratch copies go in new, uniquely named directories.

**Routing:** T3 · R3 · L3.
- **Coordinator and engineering worker:** this instance. It gives no verdict.
- **Fresh judges,** both claude-opus-5-5 at xhigh, run in parallel: the SSCTR (narrow recheck) and the quality-reliability engineer (narrow check).
- **Not dispatched:** Security (no trust boundary changes); Research and PCG (no doctrine changes).

## PHASE33_STATUS

**`COMPLETE`.**
- SSCTR-P32-F01 is closed on every path either judge probed, and neither judge raised a blocker.
- `HQ-R7D-SSCTR-P32-RECHECK` is integrated.
- R7D-FREEZE-4 is created and independently verified (27/27 PASS).

Two items stand before Phase 4 can be commissioned. Both are named in EXACT_NEXT:
- the open instrument conflict **QE-R7D-P33-01**, which comes from this phase's own interface and P18(a) wording;
- the Founder's decision on residual **SSCTR-P33-F01**.

## BASELINE

- **Branch:** `claude/domain-coaching-r7-d`, worktree `.claude/worktrees/domain-coaching-r7-d`, starting at `9042ed0`. The worktree was clean.
- **Runtime:** R7D-FREEZE-3: record `c938b53`, bound files `aeafc83`, reviewed bytes `dfd8779`, source `1ee8585e…aecb4`, manifest `99872c88…1083`, 364 files, 938/938.
  - Re-verified at the start with `verify-r7d-3.mjs --suite`, read-only: **26/26 PASS**.
  - Superseded, not edited.
- **Unchanged:**
  - policy (`a75be1aa…`, canonical hash `18ec48f3…`, 10 R6 boundaries);
  - catalog (`ceee276a…`);
  - R3–R6 and B0 records;
  - `product/` and `canon/`;
  - the diagnostic corpus;
  - PREREG-1 to PREREG-4;
  - the R7D-FREEZE-1/-2/-3 records and the Phase 3, 3.1 and 3.2 folders.
- **Runtime delta:** `CoachingCore/src/r6-adaptation.mjs` only (`faa3bc12…` → `15e4279b…`), +36/−12.

## F01_ROOT_CAUSE

Reproduced on R7D-FREEZE-3 before any change (`phase33/probes/f01-witness.mjs`; RED in `out/f01-witness.R7D-FREEZE-3.json`, byte-identical on a second rebuild).

`separateStop` ended the stop at the earlier break whenever `trainedBetween` saw **any** recorded session between the breaks: either sport, completed, or with minutes > 0. The earlier break was then `TRAINING_AFTER` and had no decision effect.

The return read the later break alone from `stateAtBreak(later start)`. No return had ever applied the earlier break, so that state was the one from before it: the doses executed before the holiday.

## FOUNDER_DECISION_IMPLEMENTATION

Direction B, read by an existing rule and no new number:
- **Re-entry needs a whole executed week.** Known training between two separate breaks re-enters the athlete only when a **whole week of the plan, lying wholly between them, was executed completely in every sport it plans**: every gate ADVANCE or EARNED, with usable strength logs.
  - That is the evidence reducer's existing COMPLETED_SESSIONS rule (SSCTR S-A, E3; R7-A final P5), the rule by which an unreviewed week releases a step.
  - It covers execution, tolerated load, effort, function, recovery (adverse responses hold the gate) and continuity (a whole week).
- **Then** the earlier break is history: `TRAINING_AFTER`, with `reentryWeek`. The return reads the later break from what was executed.
- **Anything less is a fact of the stop:** an isolated session, partial or aborted sessions, sessions in no complete week, a week with a session missed, unreported, conflicted or adverse. The stop runs through the earlier break as with nothing trained between (`TRAINING_NOT_REESTABLISHED`), under the unchanged return classes.
- **Unreported sessions** between the breaks are still asked first.
- **Unchanged:** identities, relations, replays, corrections, `afterReentry`, clinical first, F08 and every anchored line.

Code:
- `reestablishedBetween` (new);
- `evidenceState` exposes per-week `complete` (additive);
- `stateAtBreak` returns `history`;
- the `separateStop` loop and record;
- the return's reason text.

## BEHAVIOR_BEFORE_AFTER

| Case (witness) | R7D-FREEZE-3 | Candidate (R7D-FREEZE-4) |
|---|---|---|
| F1 (the original): 14-day holiday, one easy run, 4-day trip | SHORT 4: EASY 34, LONG 65, then THRESHOLD 41, LONG 70 | MODERATE 21: EASY 15, LONG 20, then 30/30/45, no quality |
| F2–F4: every gap session / one strength session / a 5-min aborted run | SHORT 4, THRESHOLD next week | MODERATE 21, as F1 |
| F5: 30 days, one run, 4 days | SHORT 4: LONG 39, THRESHOLD 34 | LONG 37: restart 15/20/20/20 |
| F6, the late form: one run in a week reviewed before the holiday was declared | SHORT 4 | MODERATE 27 |
| K1/K1b: the stop declared once (21 / 37 days) | MODERATE / LONG | Identical |
| K2: nothing trained between | MODERATE 21 | Identical |
| K3: the holiday applied when stated, then the run, then the trip | SHORT 4 from the re-entry (EASY 15 / LONG 20) | Identical |
| E1–E3: one or two whole weeks executed in full; the late form with a complete reviewed week | SHORT 4 from the executed doses | Identical doses, plus `reentryWeek` (no inverse defect) |
| E4: a week without its long run | SHORT 4 | MODERATE 25 |

## TESTS

- **Directed:** `CoachingCore/test/r7d-phase33.test.mjs` 14/14 (sha256 `99865332…`). It covers the Founder's ten items. On R7D-FREEZE-3, 11 fail; the characterization tests T2, T7 and T8 pass on both runtimes.
- **Two assertions updated in `r7d-phase32.test.mjs` T4** (sha256 `2f4cdc44…`), marked "R7-D Phase 3.3". Both judges accepted them.
  - Each encoded "any recorded session ends the stop".
  - As they stood at R7D-FREEZE-3, each fails on the candidate. As updated, each fails on R7D-FREEZE-3.
- **Suite:** 952/952 (938 + 14). Phase 3.2 17/17; Phase 3.1 14/14.
- **Conformance:** R7-B, R7-B.1 and R7-B.2 PASS.
- **Mutation:** `phase33/evidence/MUTATION_PHASE33.json`, 8/8 killed, each by its own witness.
- **Harness R7D-HARNESS-5,** validation 5:
  - P18(a) now accepts `TRAINING_AFTER` only with a whole executed week between the break and the stop; development cases DEV-27 to DEV-31;
  - no false block on the development cases;
  - 14/14 sensitivity, the new row being F01 on R7D-FREEZE-3, detected by P18 on DEV-27/28/29/31 and clean on the candidate;
  - 43/43 witnesses.
- **Regressions,** regression only: the diagnostic corpus shows 0 property violations, with VARIANT only on the 4 triaged cases; the generated sample shows 0 violations.
- **Differential against R7D-FREEZE-3:** 151 cases, 147 identical, 4 differing (DEV-27/28/29/31, each at its F01 return), 0 unexplained.
  - The re-entry control DEV-30, every Phase 3.2 case, the diagnostic corpus and the generated sample are identical.
  - QE-R7D-P33-08: most cases cannot reach the changed code.
- **Evidence manifest:** `phase33/evidence/EVIDENCE_PHASE33.json`, PASS.
- **Scratch work:** every copy in a new directory (`scratchpad/p33-runtimes-…`, `mkdtemp` work dirs). Nothing deleted.

Synthetic tests are engineering evidence, not clinical validation or authorization for real use.

## SSCTR_REVIEW

**`SSCTR-R7D-P33-RECHECK-r1`: ACCEPT_WITH_CONDITIONS**, no block.
- **F01 is closed on every path probed:** the witness forms, seven sessions in no whole week, three breaks, a complete week then an isolated run, unknown sessions answered done.
- **The reading is existing authority:** the reducer's `complete(sport)` on the plan's own week, with "every sport" per NF-R7AB-1/R40. It adds no number, threshold, count, length, clinical criterion or dose.
- **Clinical first, F08 and I9** are intact. Both updated assertions are accepted, and the queue item raises no objection.

| Finding | Class |
|---|---|
| **P33-F01** | Domain residual, inverse direction, material, not blocking. See REMAINING_FINDINGS |
| P33-F02 | Consumer condition: strength logs without reps in reserve block re-entry, for running too |
| P33-F03 | Wording corrections, made in the PREREG-5 addendum Δ8 and in INTERFACE-5. The code comment and the review request keep their bytes; the addendum prevails |

CF-P33-01 to CF-P33-07 are met in the freeze record, PREREG-5 Δ7–Δ13, INTERFACE-5 and this checkpoint. `HQ-R7D-SSCTR-P33-RECHECK` is proposed only.

## ENGINEERING_REVIEW

**`R7D-QUALITY-PHASE33-CHECK-1`: READY_WITH_CONDITIONS**, no blocker.
- Every author output reproduced.
- The fix holds for run-only and strength-only plans, three breaks, an earlier return in force, determinism and append-only provenance.
- A freeze dry run on a scratch clone gave 23/23 on the verifier, and no script deletes anything.

| Finding | Severity | Disposition |
|---|---|---|
| **QE-R7D-P33-01** | **MAJOR** | Open conflict, binding before any final holdout, author or seed. The runtime reads re-entry through its gates: optional WALK, RECOVERY_EASY, SHAKEOUT, RACE_TOUCH and RACE are ungated. INTERFACE-5 §1, PREREG-5 Δ1/Δ2 and P18(a) required every session, so P18(a) can false-block the candidate. The "never blocks" claim is withdrawn (PREREG-5 Δ9; harness README) |
| QE-R7D-P33-02 | MINOR | Residual: a whole week before a later break that starts later the same day (`startedAt`) is not recognized (conservative) |
| QE-R7D-P33-03 | MINOR | Residual: an applied break between two separate breaks gives a relation question restating cannot end (fail-closed; pre-existing without training) |
| QE-R7D-P33-06 | MINOR | The queue item states the supersession by R7D-FREEZE-4 before that freeze existed. It was appended immediately before the freeze (C3), and the freeze was then created |
| QE-R7D-P33-05 | TEST_GAP | Recorded (PREREG-5 Δ12) |
| QE-R7D-P33-04, -07, -08 | OBSERVATION | Recorded |

**C1 to C6:**
- **C1** is recorded as open (preferred in this phase, not required).
- **C2 and C5** are met in PREREG-5 Δ10–Δ12 and this checkpoint.
- **C3:** the queue append ran right before the freeze, which then succeeded.
- **C4:** the freeze ran with `--reviewed 3228a70`, after a check that `src`, `test`, the harness lib and `r7d-harness.mjs` were unchanged since `3228a70` and the scripts since `f74bb82`. After the freeze, `postReview.changedSinceReviewed` lists only added evidence, review, queue-record and script files, the queue, and the three condition-driven instrument-text edits (PREREG-5, INTERFACE-5, harness README).
- **C6:** both folders were committed before the freeze.

## QUEUE

**`HQ-R7D-SSCTR-P32-RECHECK` appended: 233 → 234**, commit `b242237`, record `phase33/QUEUE_INTEGRATION_R7D_P33.json`.
- It was absent before the append, and every earlier item and addendum is byte-identical (55 lines added, 0 removed).
- Its scientific content is verbatim. It names **R7D-FREEZE-3**, the freeze its SSCTR record judged: record `6c27126e…`, reviewed runtime `dfd8779`, source digest `1ee8585e…` recomputed from those bytes.
- Owner: Chief / Founder. State: `QUEUED_FOR_FUNDED_HUMAN_REVALIDATION`, `human_review: null`.
- It is provisional AI revalidation, not funded human validation.
- `HQ-R7D-SSCTR-P33-RECHECK`, which names R7D-FREEZE-4, stays proposed: it needs its own authorization (CF-P33-06).

## NEW_RUNTIME_FREEZE

**`R7D-FREEZE-4`:**
- **Record:** `CoachingCore/r7/d/RUNTIME_FREEZE_R7D_4.json`, sha256 `bee62152348c8ff0d97034fda778c2d5526d78cfa38b745bef6f40cf40859df3`, commit `8bbbb8e`.
- **Bound files committed at:** `b242237`.
- **Runtime bytes:** those reviewed in `3228a70`.
- **Source:** `754d42a4856fce6aaa563d48ee67c991fa15c7091290ed9169d86982c97ded8c`. **Manifest:** `e41418da91f212ef4f803242049cbeb9a939e9a936f2402532aae608db6a10ba`. 423 files, 952/952, conformance PASS.
- **Verifier** (read-only), **27/27 PASS** (`69bc17e`):
  ```
  node CoachingCore/scripts/verify-r7d-4.mjs --suite
  ```

R7D-FREEZE-1, -2 and -3 are not overwritten. `verify-r7d-3.mjs` now fails `files-current` by design.

## REMAINING_FINDINGS

**For your decision before the holdout is commissioned: SSCTR-P33-F01.** It is the inverse direction of F01's fix, with no envelope.
- **What happens:** an earlier break is left unapplied across weeks of training that never complete a plan week in every sport. A strength session missed each week, or missing reps in reserve, is enough. Those training days count as stop days, so the class grows with the training span.
- **Example:** a 14-day holiday, two weeks with every run done and one strength session missed each week, then a 4-day trip, gives LONG 32, a restart. The existing episode rule gives SHORT 4 at LONG 45, and R7D-FREEZE-3 gave SHORT 4 at LONG 75.
- **Reach:** it needs a bulk sync without review, or a late declaration. Normal weekly reviews avoid it, and a single break reported late already ignores the training after it (B1–B4, pre-existing).
- **Measurement:** no instrument detects it.
- **Options, no number:** (a) read the later break from the earlier break's own return state; (b) per-sport re-entry (R40); (c) accept this reading as the authorized conservative behaviour. Decide also whether a restart there counts as a domain failure in the holdout.

**QE-R7D-P33-01, open and binding before Phase 4:** which sessions a re-entry week needs (optional WALK, RECOVERY_EASY, SHAKEOUT; race-week RACE_TOUCH, RACE). The SSCTR judges, then Chief/Founder chooses an instrument revision (P18(a) and PREREG, with a QH-1-style development case) or a runtime change in a new authorized mission.

**Residuals, disclosed in the record and in PREREG-5:**
- plan-week alignment;
- every sport;
- a reviewed week alone is not enough;
- O-01 over-asking;
- SSCTR-P33-F02;
- QE-R7D-P33-02, -03, -04;
- TEST_GAP QE-R7D-P33-05.

**Inherited, unchanged:**
- **F08:** `KNOWN_FAIL_CLOSED_AUTHORITY_BOUNDARY`, with Founder/PCG and the qualified clinical-domain review before any consumer use. No change in this phase.
- SSCTR-P32-F02, -F03, -F04;
- QE-R7D-P32-02, -04, -05, -06;
- P31-F01 (with F07), P31-F04, P31-03, P31-12, P31-07 (Security);
- the PCG I-1 canon-index entry.

## FINAL_HOLDOUT_EXISTS

`NO`

## V1_COACHING_AUTHORITY_READY

`NO`

## EXACT_NEXT

Before Phase 4 can be requested:
1. **Your decision on SSCTR-P33-F01:** option (a), (b) or (c), and whether a restart on that path counts as a domain failure in the holdout (CF-P33-03). Options (a) and (b) need a narrow runtime phase.
2. **Resolve QE-R7D-P33-01:** the SSCTR judges which sessions a re-entry week needs; then authorize either an instrument revision (PREREG-5 addendum, P18(a), a QH-1-style development case, re-validation) or a runtime change. This step can share a phase with item 1.
3. **Authorize the append of `HQ-R7D-SSCTR-P33-RECHECK`**, naming R7D-FREEZE-4 (or its successor, if item 1 or 2 changes the runtime), by its owner.

**Then Phase 4**, on its own authorization:
- a fresh author with `AUTHOR_BRIEF_FINAL_R7D_4.md` and INTERFACE-5;
- seed H2 = `sha256('R7D-SAMPLE|FINAL|' + e41418da91f212ef4f803242049cbeb9a939e9a936f2402532aae608db6a10ba)`, or the manifest digest of any later freeze;
- seal, a single evaluation, and the QRE and SSCTR judges in parallel.

F08 stays with Founder/PCG and the qualified clinical-domain review before any consumer use.

**STOP.**

## GIT_STATE

**Branch:** `claude/domain-coaching-r7-d`, on top of `9042ed0`:

| Commit | Content |
|---|---|
| `3228a70` | Runtime candidate, directed tests, the two updated assertions, HARNESS-5, development cases 5, PREREG-5, INTERFACE-5, brief 4, authorization, the F01 witness and its RED output, the Phase 3.3 probes |
| `f74bb82` | Evidence, regressions, validation 5, the candidate witness output, review request, freeze, verifier and queue-integration scripts |
| `47a99c0` | Both reviews |
| `3b85837` | Post-review conditions: PREREG-5 addendum, INTERFACE-5, harness README (no runtime, test, harness-lib or script byte) |
| `b242237` | Queue append (233 → 234) and its integration record |
| `8bbbb8e` | R7D-FREEZE-4 record |
| `69bc17e` | Verification |

Plus this checkpoint's commit, with the mission and ledger lines.
- **Not pushed, not merged.** The main checkout and the other worktrees are untouched.
- `CoachingCore/node_modules` is ignored by git.
- Scratch copies live only in the session scratchpad, in new directories. Nothing was deleted. The SSCTR left one read-only extract, `cand-r6.mjs`, in the scratchpad root.
