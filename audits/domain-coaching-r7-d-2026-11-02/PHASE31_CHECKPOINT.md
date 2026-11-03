# R7-D · Phase 3.1 — checkpoint (2026-11-02)

**Authority.** The Founder's request (R7-D Phase 3.1), summarized in `phase31/AUTHORIZATION_PHASE31.md` and not saved verbatim.

**Routing:** T3 · R3 · L3.
- **Coordinator and engineering worker:** this instance. It gives no verdict.
- **Fresh judges**, both claude-opus-5-5 at xhigh:
  - SSCTR narrow recheck;
  - quality-reliability engineer, narrow check.
- **Not dispatched:**
  - Security: no trust boundary changes. The free-text retention is routed to it as a condition.
  - Research and PCG: no doctrine changes. The I-1 canon-index entry stays pending.

## R7D_PHASE31_STATUS

**`COMPLETE`.** All 16 definition-of-done items are met. QE-R7D-P3-01 (a), (b) and P3-F01 are closed under one rule.

All gates are clean:
- directed tests, mutants, regressions and differential;
- both narrow reviews, with no blocker;
- R7D-FREEZE-2 created and verified (26/26);
- queue appended.

**Phase 4 still waits on your decision about one open domain defect, SSCTR-P31-F02**, which the SSCTR routed to you (see REMAINING_NONBLOCKING and EXACT_NEXT).

## BASELINE

- **Branch:** `claude/domain-coaching-r7-d`, worktree `.claude/worktrees/domain-coaching-r7-d`, starting from `b77480f`.
- **Runtime:** R7D-FREEZE-1 (bytes `4cabd18`, record `6c03ca8`, 907/907). It is superseded, not edited. Its verifier now fails only `files-current`, by design.
- **Unchanged:**
  - policy (`a75be1aa…`, canonical hash `18ec48f3…`, 10 R6 boundaries);
  - catalog (`ceee276a…`);
  - R3–R6 and B0 records;
  - `product/` and `canon/`;
  - the diagnostic corpus and its evaluation;
  - PREREG-1 and PREREG-2.
- **Runtime delta:** `CoachingCore/src/r6-adaptation.mjs` only.

## QE_R7D_P3_01

- **A: CLOSED.** Another event kind that carries a break asks (`interruption.reportedOnItsOwn`) and records the break. The next plain review applies it with no repetition: the same decision as the break stated there (T1).
  - R7D-FREEZE-1: KEEP/VALID with long runs of 70 and 75 against 65 executed, on all 7 kinds.
  - Candidate: REESTABLISH, maximum 45.
- **B: CLOSED.** A break with a clinical flag routes clinically first and is recorded. It is not applied while the route stands. After qualified clearance, the first review re-enters at EASY 15 / LONG 20, then 30/30/45, with no quality work (T2; 4 flags × 4 kinds, and a pain substitution).
  - R7D-FREEZE-1: VALID with THRESHOLD and 70/75.
  - A break whose own reason is clinical routes to a human again (F08, unchanged).
- **P3_F01: CLOSED.** A break answering UNREPORTED_TRAINING through a pain substitution, then clearance:
  - the first review applies it with the same facts, class, entry and sessions ahead as the direct answer (T3);
  - CARRIER_CLINICAL stays strict, with 0 violations on DEV-17 and DEV-17b.

## FACT_PERSISTENCE_RULE

`R7D-P31-FACT-PERSISTENCE` (record field `rule`):
1. **What counts:** a stated break is an `interruption` with a value, beginning by its review.
2. **Recording:** it is recorded in the completed-work record as `INTERRUPTION_DECLARED`, whatever its review decides, including the early clinical and eligibility returns. A review refused as invalid input records nothing.
3. **In force:** it stays in force until a return is decided at or after it, or a newer declaration replaces it.
4. **Reading:** a later review that states none reads it as if it stated it. **Fact retention ≠ decision application.**

The record row is append-only and never an execution report. A replay adds nothing. Rows that are tampered with or belong to another athlete are carried but not read. The return names the report that declared the break (`declaredBy`, episode identity).

## CLINICAL_FIRST

Unchanged; the retained break never bypasses it.
- Eligibility flags, a standing route, a pain substitution and unknown eligibility all come before retention (T7, 19 kinds). No dose and no proposal is given while clinical.
- A clinical-cause break is never treated as nonclinical (F08).
- Suite clinical sets (CAND-01/02, QE-R7B1-04, R7-B.2) pass; R7-B.2 conformance PASS.

## EVENT_SEPARATION

The carrying event is never applied with the break, nor with its return (T4: schedule, goal, equipment). Sent again after the return, it is applied. While a break is kept, every other event kind asks and applies nothing but the factual state. Measured by P17(c).

## DIRECTED_TESTS

`CoachingCore/test/r7d-phase31.test.mjs`: **14/14**.

| Group | Tests |
|---|---|
| T1 | 2 |
| T2 | 3 |
| T3 | 1 |
| T4 | 1 |
| T5 | 1 |
| T6 | 2 |
| T7 | 2 |
| Record | 2 |

On R7D-FREEZE-1, 13 of 14 fail for the retention reason. The 14th is a characterization test.

**Two existing assertions updated** (both reviewers accepted them). Each encoded the dropped break, fails on R7D-FREEZE-1 and passes now:
- `r7a1-composition` C4: the unavailable day is asked while a 16-day break is kept. Both orders agree once the break is completed.
- `r7c-phase5-cc` QE-R7C-01: an illness break after clearance routes clinical instead of VALID.

## MUTATION

`phase31/evidence/MUTATION_PHASE31.json`: **6/6 killed**, each by its own witness:
- lost after ASK;
- lost at clearance;
- P3-F01 answer dropped;
- sibling applied;
- applied twice;
- newer declaration ignored.

TEST_GAP: 9 of the engineering judge's 17 mutants survive the suite. QM31-07 comes first: an early return that drops the record is caught only by harness P10.

## REGRESSION

- **Suite:** 921/921 (907 + 14).
- **Conformance:** R7-B, R7-B.1 and R7-B.2 PASS.
- **Diagnostic corpus** (regression only): P01–P17 with 0 violations (P17: 9 units; RESTATE: 3). VARIANT: the same 4 triaged cases. CE-01.
- **Generated sample:** 0 violations.
- **Differential against R7D-FREEZE-1:** 141 cases, 137 identical, 4 differing (DEV-18 to DEV-21, each after an unapplied stated break), **0 unexplained**. The engineering judge reproduced it: in all 141 cases the candidate equals R7D-FREEZE-1 with the kept break stated again.

## HARNESS_REVISION

**`R7D-HARNESS-3`.**
- **P17 (new):** checks (a) no VALID before a break is applied, (c) event separation, (d) applied once. A review refused unread is excluded.
- **RESTATE_DECLARED_BREAK (new):** P17's metamorphic part (b).
- **P03 and P10:** read the new row, including its clock and hash.
- **P11 and P12:** ignore a change that was asked or refused. This is a scoped relaxation, disclosed.
- **Packet:** shows a kept break.

**Validation 3:**
- no false block;
- 10/10 sensitivity, including QE-R7D-P3-01 (a) and (b) and P3-F01 on R7D-FREEZE-1;
- coverage: P17 19, RESTATE 4, CARRIER_CLINICAL 7, CARRIER_HOLD 1, RESEND 20;
- witnesses: 39/39.

## PREREG_3

**`R7D-PREREG-3`** (`PREREGISTRATION_R7D_3.md`, sha256 `8e00cf45…a067`).
- **Registered:** in `1357638`, before any holdout existed.
- **Amended:** only in `3d66de4`, by the reviewers' conditions, also before any holdout.
- **Contents:** Δ1–Δ9, with P17 and no envelope, a violation is a blocker; Δ6 adds required coverage (P17 ≥ 4, RESTATE > 0).
- **Companions:**
  - interface: `author/INTERFACE_DELTA_R7D_3.md`;
  - brief: `author/AUTHOR_BRIEF_FINAL_R7D_2.md` (freeze 2, coverage items 8–9).

## SSCTR_RECHECK

**`SSCTR-R7D-P31-RECHECK-r1`** (`304eedd6…`): **ACCEPT_WITH_CONDITIONS**, no block. The Founder's question is answered yes, with conditions:
- re-entry from a kept break equals the same break stated again (135/135 probe cells);
- clinical first preserved;
- no new number.

| Finding | Class |
|---|---|
| F02 | Open domain defect, routed to the Founder |
| F01 | Residual |
| F03 (F08) | Residual |
| F04 | Consumer condition |
| F05 | Interface statement |

Conditions CF-P31-01 to CF-P31-08 are met in the record, PREREG-3, the interface and this checkpoint.

## ENGINEERING_RECHECK

**`R7D-ENGINEERING-PHASE31-CHECK-1`** (`43d02ed8…`): **READY_WITH_CONDITIONS**, no blocker. All evidence was reproduced byte for byte.

| Finding | Class |
|---|---|
| QE-R7D-P31-01 | MAJOR (F08; decision needed) |
| P31-02 to P31-06 | MINOR. The texts were fixed; P03 and P17 were tightened |
| P31-07 to P31-13 | OBSERVATION |

Conditions CF-1 to CF-6 are met; the survivors are TEST_GAP.

## HUMAN_REVALIDATION_QUEUE

**230 → 233** (`88d2495`, record `phase31/QUEUE_INTEGRATION_R7D.json`, queue sha256 `667e1ff0…f9ae`), appended by the authorized owner (Chief / Founder).
- **New items:** `HQ-R7D-SSCTR-F03B`, `HQ-R7D-SSCTR-P3-RECHECK` and `HQ-R7D-SSCTR-P31-RECHECK`.
- **What changed in them:** only the queue id, the runtime named and the owner. Their scientific content is unchanged.
- **Freeze named:** **all three point to R7D-FREEZE-2** (runtime commit `1357638`, source digest `211b662d…efbe5`).
- **Earlier items and pins:** untouched.

## NEW_RUNTIME_FREEZE

**`R7D-FREEZE-2`**:
- **Record:** `CoachingCore/r7/d/RUNTIME_FREEZE_R7D_2.json`, sha256 `d7346212…f43e`, record commit `93f3a38`.
- **Bound files committed at:** `88d2495`.
- **Runtime bytes:** those reviewed in `1357638`.
- **Source:** `211b662d…efbe5`. **Manifest:** `d74eefbb…b265`. 303 files, 921/921, conformance PASS.

**It binds:**
- runtime, tests, HARNESS-3 and validation 3;
- PREREG-3, the interface delta and final brief 2;
- evidence, both reviews and the authorization;
- the queue and its integration record;
- F02 as an open defect, with the disclosures, routings and test gaps.

**Verifier** (read-only), **26/26 PASS**:
```
node CoachingCore/scripts/verify-r7d-2.mjs --suite
```

R7D-FREEZE-1 is not overwritten.

## FINAL_HOLDOUT_EXISTS

`NO`

## V1_COACHING_AUTHORITY_READY

`NO`

## REMAINING_NONBLOCKING

**Open defect, your decision before Phase 4: SSCTR-P31-F02.** A newer break for a different, separate period ends the retention of a kept, unapplied break.
- **Example:** a 14-day holiday is kept, then a 7-day trip is declared. The result is SHORT, with EASY 45/34, LONG 65, then THRESHOLD 41, where the 21-day stop declared at once gives MODERATE (EASY 15, LONG 20).
- **Measurement:** no automated property detects it.
- **Comparison:** never worse than R7D-FREEZE-1.
- **Not safe, no envelope:** it conflicts with D2.

**Residuals, disclosed in the record and PREREG-3:**
- **F08 / QE-R7D-P31-01:** a clinical-cause break keeps the athlete clinical indefinitely after clearance. The only exit, a different declaration, is not conservative. It fails closed. Decide it before any consumer use.
- **F01:** days held after a stated end date are not counted. Goes with F07.
- **F04:** an asked event must be re-sent after the return.
- **P31-03:** an applied break stated again is applied again.
- **P31-11:** a partial declaration replaces a kept break.
- **P31-12:** an open-ended break absorbs the sessions reported before its applying review; a forged row is read.
- **Security (P31-07):** the free-text reason is now carried in the record. Route before any real-data consumer.
- **Still pending:** the PCG I-1 canon-index entry.

## EXACT_NEXT

Your decisions, before Phase 4 is commissioned:
1. **F02:** correct it first (a narrow phase, with a new freeze), or proceed and let the holdout judge it with no envelope. Correction options are:
   - ask whether two separate kept stops are one period, using the existing episode question;
   - merge contiguous stops. This conflicts with rule I9, which never joins two declarations on its own.
2. **F08 (QE-R7D-P31-01):** the path back after clearing a clinical break. It is needed before any consumer use, not for Phase 4.

**Then Phase 4**, on its own authorization:
- a fresh author with `AUTHOR_BRIEF_FINAL_R7D_2.md` and INTERFACE-3;
- seed H2 = `sha256('R7D-SAMPLE|FINAL|' + d74eefbb…b265)`;
- seal, a single evaluation, and the QRE and SSCTR judges in parallel.

**STOP.**

## GIT_STATE

**Branch:** `claude/domain-coaching-r7-d`, on top of `b77480f`:

| Commit | Content |
|---|---|
| `1357638` | Runtime candidate, directed tests, HARNESS-3, PREREG-3, interface and brief |
| `a6a11f5` | Evidence, review request, freeze and verifier scripts |
| `6987454` | Both reviews |
| `3d66de4` | Post-review conditions (no runtime byte) |
| `88d2495` | Queue append (bound files of the freeze) |
| `93f3a38` | R7D-FREEZE-2 record and verification |

Plus this checkpoint's commit, with the mission and ledger lines.
- **Not pushed, not merged.** The main checkout and the other worktrees are untouched.
- `CoachingCore/node_modules` is ignored by git.
