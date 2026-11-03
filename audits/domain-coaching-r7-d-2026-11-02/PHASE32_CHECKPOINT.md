# R7-D · Phase 3.2 — checkpoint (2026-11-03)

**Authority.** The Founder's request (R7-D Phase 3.2), summarized in `phase32/AUTHORIZATION_PHASE32.md` and not saved verbatim.

**Routing:** T3 · R3 · L3.
- **Coordinator and engineering worker:** this instance. It gives no verdict.
- **Fresh judges**, both claude-opus-5-5 at xhigh, run in parallel:
  - SSCTR narrow recheck;
  - quality-reliability engineer, narrow check.
- **Not dispatched:**
  - Security: no trust boundary changes.
  - Research and PCG: no doctrine changes.

## R7D_PHASE32_STATUS

**`COMPLETE`.** SSCTR-P31-F02 is closed on the paths the Founder's rule names, and neither judge raised a blocker. R7D-FREEZE-3 is created and verified (26/26).

Not closed as a whole family: one residual, SSCTR-P32-F01, is disclosed with no envelope and routed to you (see REMAINING_FINDINGS).

## BASELINE

- **Branch:** `claude/domain-coaching-r7-d`, worktree `.claude/worktrees/domain-coaching-r7-d`, starting from `747eab2`.
- **Runtime:** R7D-FREEZE-2 (bound files `88d2495`, record `93f3a38`, source `211b662d…efbe5`, 921/921).
  - Superseded, not edited.
  - Its verifier now fails only `files-current`, by design.
- **Unchanged:**
  - policy (`a75be1aa…`, canonical hash `18ec48f3…`, 10 R6 boundaries);
  - catalog (`ceee276a…`);
  - R3–R6 and B0 records;
  - `product/` and `canon/`;
  - the human queue (233 items);
  - the diagnostic corpus;
  - PREREG-1 to PREREG-3;
  - the R7D-FREEZE-1 and -2 records and the Phase 3 / 3.1 folders.
- **Runtime delta:** `CoachingCore/src/r6-adaptation.mjs` only (`9f905030…` → `faa3bc12…`).

## FOUNDER_DECISIONS

- **The F02 rule.** A newer declaration replaces an older unresolved one only when it names it as its correction (`episodeId`). Otherwise both stay facts. No last-write-wins, no merge, and nothing is inferred from dates (I9).
- **The three relations:**
  - an explicit correction is a revision;
  - an exact replay records nothing new;
  - otherwise the relation is asked before any dependent return. The earlier facts are never asked for again, and clinical first stays above the question.
- **Separate breaks** stay separate facts:
  - known training between them: the existing rules on that reality;
  - known no training between them: the continuous interval (factual continuity, not a merge);
  - unknown training between them: asked.
- **Clinical first:** unchanged.
- **F08:** `KNOWN_FAIL_CLOSED_AUTHORITY_BOUNDARY`. No runtime expansion.

## F02_BEFORE

The witness is `phase32/probes/f02-witness.mjs`. The RED was recorded on R7D-FREEZE-2 before any change (`phase32/probes/out/f02-witness.R7D-FREEZE-2.json`).

| Case | R7D-FREEZE-2 result |
|---|---|
| W1: a 14-day holiday kept (fatigue report), a contiguous 7-day trip (local-fatigue report), then a plain review | REESTABLISH SHORT, 7 days: EASY 45/34, LONG 65, then THRESHOLD 41, VALID |
| W2: the trip stated by the weekly review itself | Same as W1 |
| W3 (comparator): the 21-day stop declared at once | MODERATE: EASY 15/15, LONG 20 |
| W4 (p4b): a correction of an earlier applied break while a newer break is kept | The kept break is lost (KEEP, VALID) |

## F02_CORRECTION

- **W1 and W2** now ask INTERRUPTION_RELATION, and the plan is not valid. Answered "separate", the return is MODERATE 21 days with the same run doses ahead as W3 (T4).
- **W4:** the correction is asked first, and the next review applies the kept break.
- No path re-enters from the newer break alone.

The F02 witness tests fail on R7D-FREEZE-2 and pass on the candidate.

## MULTIPLE_INTERRUPTION_SEMANTICS

**Grouping and identity** (`keptBreaks`): the breaks on record and not applied, plus the one the review states, are grouped into interruptions.
- Two reports are one interruption only when one names the other, or when they state the same facts apart from the name (an exact replay).
- Each interruption's identity is its name, else the event id of its first report.

**Reading:**
- **One interruption:** read exactly as in Phase 3.1.
- **Several:** none replaces another. Clinical comes first. Each later one must be named; otherwise the decision is **INTERRUPTION_RELATION** (`missingInputs ['interruption.episodeId']`), with no return dose.

**Answering:** re-send the newer break with the earlier break's `episodeId` (a correction: its facts replace the earlier ones) or with its own (a separate break).

**Separate breaks** (`separateStop`): the return reads the stop ending with the latest break.
- **Days that touch or overlap:** the stop runs through both.
- **Days between, nothing trained there** (every planned session reported not done, or none planned): the stop runs through them.
- **Recorded training between them:** the later break alone; the earlier one is listed `TRAINING_AFTER`.
- **Unreported planned sessions between them:** **TRAINING_BETWEEN_BREAKS**.
- No break is merged and no duration is added.
- The return records `separateBreaks`, each with its identity, dates and place.

**A correction of an applied break while a break is kept** (B4): asked when stated. When only kept, it is not read and is listed in `notApplied`; it is not asked again unless it is sent again.

**No new number:** the recipe is the unchanged R6-NONCLINICAL-RETURN, classed by the stop the facts establish.

## CLINICAL_FIRST

Unchanged. The anchored lines (`const clinical=clinicalRoute(kind,review);` and the others) are untouched, and R7-B, R7-B.1 and R7-B.2 conformance PASS.

- With several kept breaks, the review reads a clinical one when there is one. The clinical route comes before the relation question (T5).
- A newer unnamed nonclinical break no longer replaces a kept clinical-cause one (DEV-25). On R7D-FREEZE-2 it did: the F03 relabel path, now closed.

## F08_DISPOSITION

**`KNOWN_FAIL_CLOSED_AUTHORITY_BOUNDARY`** (QE-R7D-P31-01, SSCTR-P31-F03).
- **Owner:** Founder/PCG with qualified SSCTR/clinical-domain review, after R7-D and before any consumer or V1 use. No runtime expansion.
- **Disclosed (SSCTR CF-P32-04):** a named correction that restates the reason as nonclinical is honoured as the athlete's statement, not as clearance, as on R7D-FREEZE-2. Its free text is still screened, and eligibility must be NONCLINICAL_CONFIRMED. INTERFACE-4 and PREREG-4 Δ12 state it.

## DIRECTED_TESTS

**`CoachingCore/test/r7d-phase32.test.mjs`: 17/17.** They cover the 20-item matrix (mapping in `phase32/reviews/REVIEW_REQUEST_PHASE32.md`).

On R7D-FREEZE-2, 11 of the 17 fail. The other 6 are characterization tests and pass on both runtimes: explicit correction, exact replay ×2, clinical flag while unresolved, F08 named correction, determinism.

**Two existing assertions updated** (both judges accepted them). Each encoded "an unnamed newer break replaces the kept one":
- `r7d-phase31` T6: unnamed, it is now asked; named, it replaces.
- `r7a1-composition` C4/C5: the corrected return report now names its break.

As they stood at R7D-FREEZE-2, both fail on the candidate.

## MUTATION

`phase32/evidence/MUTATION_PHASE32.json`: **8/8 killed**, each by its own witness:
- last-write-wins;
- automatic merge;
- partial newer drops the older;
- "separate" with the older ignored;
- unknown between read as no training;
- unknown between read as resumed training;
- clinical bypassed by the relation question;
- the p4b correction applied across a kept break.

TEST_GAP QE-R7D-P32-06: 9 of the engineering judge's 18 mutants survive (QM32-10, -13 and -06 first).

## REGRESSION

- **Suite:** 938/938 (921 + 17).
- **Conformance:** R7-B, R7-B.1 and R7-B.2 PASS.
- **Directed tests:** Phase 3.1 14/14; Phase 3.2 17/17.
- **Harness validation 4:** no false block.
- **Diagnostic corpus** (regression only): P01–P18 with 0 violations. VARIANT shows the same 4 triaged cases; CE-01.
- **Generated sample:** 0 violations.

## HARNESS_REVISION

**`R7D-HARNESS-4`.**
- **P18 (new):** at every return applied while two or more stated breaks are open, (a) each is accounted for and (b) the relation was stated.
- **INSERT_NEWER_BREAK (new):** a newer unnamed break stated in a review that applied a kept one gives no return and no VALID plan.
- **RENAME_OPAQUE_IDS:** also renames `episodeId`.
- **Client:** answers TRAINING_BETWEEN_BREAKS like UNREPORTED_TRAINING.
- **Packet:** lists every kept break.
- **P18:** skips exact replays.

**After the checks (engineering C1):**
- RESTATE excludes a stated correction of an applied break when another break is in its window (B4). The excluded unit is listed.
- DEV-26 (the QE-FB-2 form) was added.
- Comments were fixed.

**Validation 4:**
- no false block;
- 13/13 sensitivity, including on R7D-FREEZE-2:
  - F02 by P18 (DEV-22/23/24/26) and by INSERT_NEWER_BREAK (DEV-18/20);
  - the F03 relabel path by P18 (DEV-25);
- QE-R7D-P3-01 still detected on R7D-FREEZE-1;
- coverage: P18 9, INSERT 5, RESTATE 14 (1 excluded), P17 44;
- 42/42 witnesses.

**Pre-registered before any holdout exists:**
- `R7D-PREREG-4` (Δ1–Δ8, plus the post-review addendum Δ9–Δ15);
- `author/INTERFACE_DELTA_R7D_4.md`;
- `author/AUTHOR_BRIEF_FINAL_R7D_3.md` (freeze 3, interface 4, coverage item 10: multiple breaks, able to expose the old F02).

## DIFFERENTIAL_VS_R7D_FREEZE_2

`phase32/evidence/DIFFERENTIAL_VS_R7D_FREEZE_2.json`: **146 cases, 141 identical, 5 differing, 0 unexplained.**
- The 5 differing cases are DEV-22 to DEV-26. Each differs from the review that states a second break while one is open.
- R7D-D10 meets that trigger (three unnamed reports of one flu break) and is identical: clinical first.

## SSCTR_RECHECK

**`SSCTR-R7D-P32-RECHECK-r1`: ACCEPT_WITH_CONDITIONS**, no block. All nine answers are favourable.
- No new dose, threshold, recipe or clinical authority.
- Both flagged readings are accepted: rest days only between breaks count as no training, and a conflicted report between breaks is asked.

| Finding | Class |
|---|---|
| F01 | Domain residual (see REMAINING_FINDINGS) |
| F02 | F08 disclosure correction (done) |
| F03 | Low residual |
| F04 | Consumer condition |

CF-P32-01 to CF-P32-08 are met in the freeze record, PREREG-4, INTERFACE-4 and this checkpoint. Queue item `HQ-R7D-SSCTR-P32-RECHECK` is proposed only.

## ENGINEERING_RECHECK

**`R7D-ENGINEERING-PHASE32-CHECK-1`: READY_WITH_CONDITIONS**, no blocker. All evidence was reproduced on scratch copies.

| Finding | Class | Status |
|---|---|---|
| QE-R7D-P32-01 | MAJOR | RESTATE versus the `notApplied` rule. Reconciled in the instruments only (C1) |
| QE-R7D-P32-02 to -05 | MINOR | Residuals, with consumer conditions |
| QE-R7D-P32-06 | TEST_GAP | Recorded |
| QE-R7D-P32-07 to -09 | OBSERVATION | Recorded |

C1 to C4 are met. The freeze ran after C1, with repo-relative paths and `--reviewed dfd8779`.

## NEW_RUNTIME_FREEZE

**`R7D-FREEZE-3`**:
- **Record:** `CoachingCore/r7/d/RUNTIME_FREEZE_R7D_3.json`, sha256 `6c27126e…cabd8`, commit `c938b53`.
- **Bound files committed at:** `aeafc83`.
- **Runtime bytes:** those reviewed in `dfd8779`.
- **Source:** `1ee8585e…aecb4`. **Manifest:** `99872c88…1083`. 364 files, 938/938, conformance PASS.
- **Verifier** (read-only), **26/26 PASS** (`d57b75f`):
  ```
  node CoachingCore/scripts/verify-r7d-3.mjs --suite
  ```

R7D-FREEZE-1 and R7D-FREEZE-2 are not overwritten.

## FINAL_HOLDOUT_EXISTS

`NO`

## V1_COACHING_AUTHORITY_READY

`NO`

## REMAINING_FINDINGS

**For your decision before the holdout is commissioned: SSCTR-P32-F01.** It is identical to R7D-FREEZE-2 and has no envelope.
- **What happens:** any recorded session between two separate breaks (any sport, even a short aborted one) removes the earlier break's effect. A 14-day holiday, one session, then a 4-day trip gives SHORT with THRESHOLD the next week. A 30-day break, one run, then 4 days gives SHORT where LONG applies.
- **Measurement:** no instrument detects it. A holdout case of "break, one session, break" is judged on domain grounds.
- **Options from the SSCTR:**
  - (a) read the earlier break as the existing episode rule would, as if applied, so the later break starts from that return's state (TRAINING_BETWEEN);
  - (b) align what counts as training between and state what the re-entry resumes.

  No new number is proposed.

**Residuals, disclosed in the record and in PREREG-4:**
- **F08:** the fail-closed boundary, with the named-correction exception disclosed.
- **F03 / QE-R7D-P32-03:** dateless equal facts on different days are one declaration.
- **F04:** a conflicted session between breaks is answered by `correctionOf`.
- **QE-R7D-P32-02:** equal clocks depend on record order.
- **QE-R7D-P32-04:** a report id re-sent with other facts.
- **QE-R7D-P32-05:** an earlier separate break is not addressable after its return.
- **TEST_GAP:** QE-R7D-P32-06.
- **Inherited:** P31-F01 (with F07), P31-F04, P31-03, P31-12, P31-07 (Security), and the PCG I-1 canon-index entry.

**Not appended:** HQ-R7D-SSCTR-P32-RECHECK. This phase has no queue authorization; the queue stays at 233.

## EXACT_NEXT

Your decisions, before Phase 4 is commissioned:
1. **SSCTR-P32-F01:** the reading of "known training between them", option (a) or (b) above. That may need a narrow runtime phase.
2. **Authorize the append of HQ-R7D-SSCTR-P32-RECHECK**, naming R7D-FREEZE-3, by its owner.

**Then Phase 4**, on its own authorization:
- a fresh author with `AUTHOR_BRIEF_FINAL_R7D_3.md` and INTERFACE-4;
- seed H2 = `sha256('R7D-SAMPLE|FINAL|' + 99872c883179165b24e64994f94b4c739b3daad57e7aa9e6c2a6535a309e1083)`;
- seal, a single evaluation, and the QRE and SSCTR judges in parallel.

F08 stays with Founder/PCG and the qualified clinical-domain review before any consumer use.

**STOP.**

## GIT_STATE

**Branch:** `claude/domain-coaching-r7-d`, on top of `747eab2`:

| Commit | Content |
|---|---|
| `dfd8779` | Runtime candidate, directed tests, the two updated assertions, HARNESS-4, dev cases 4, PREREG-4, INTERFACE-4, brief 3, authorization, the F02 witness and its RED output |
| `36e9f02` | Evidence, review request, freeze and verifier scripts |
| `3efcaeb` | Both reviews |
| `aeafc83` | Post-review conditions (no runtime or test byte) |
| `c938b53` | R7D-FREEZE-3 record |
| `d57b75f` | Verification 26/26 |

Plus this checkpoint's commit, with the mission and ledger lines.
- **Not pushed, not merged.** The main checkout and the other worktrees are untouched.
- `CoachingCore/node_modules` is ignored by git.
