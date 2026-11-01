# R7-B.2 closure handoff: CLOSED READY (2026-11-01)

DOMAIN_COACHING_R7-B.2 closed QE-R7B1-04, the one blocker R7-B.1 left open ([R7-B.1 handoff](../b1/R7B1_CLOSURE_HANDOFF.md)). It also closed the two same-class exits its inventory found, R7B2-CAND-01 and R7B2-CAND-02. The fix is one precedence point in `src/r6-adaptation.mjs`. A review's own clinical route now comes before R7-A's late-evidence question, the factual re-plan question and the return's report-identity question. The point reuses the handlers' existing screens and adds no new clinical reading. Every gate G1–G9 holds, and the one correction cycle was not used. Start any follow-up here. Disposition: [`FINAL_DISPOSITION.json`](../../../audits/domain-coaching-r7-b2-2026-10-31/FINAL_DISPOSITION.json).

```text
R7B_RUNTIME_REPERTOIRE_READY = READY   (shadow reference runtime; SSCTR C1–C4 bind any use beyond the offline synthetic reference)
R7B2_ENGINEERING_GATE        = READY                   (R7B2-ENG-r1)
R7B2_SSCTR_GATE              = ACCEPT_WITH_CONDITIONS  (reviewed: R7B2-SSCTR-r1 + addendum A1; C1–C4)
R7B2_QUALITY_GATE            = READY                   (reviewed: R7B2-QUALITY-r1; conditions met in the U4b record)
V1_COACHING_AUTHORITY_READY  = NO (not declared)
PRODUCTION_READY             = NO
CORRECTION CYCLES USED       = 0 of 1
```

**The one question.** Is QE-R7B1-04 closed correctly, with clinical safety precedence restored and the valid predecessor behaviour preserved? **Yes.**
- **Engineering.** Q1: the clinical route comes first, 123 one-review cases and 6 two-step cases. Q2: R7-A's late-evidence behaviour is identical to FREEZE-2, 29 of 29 reviews. Q3: no R7-B.1 closure regressed. Q4: no new bypass and no false clinical route.
- **Quality.** The 848-row differential has 0 ledger differences and 0 proposal-content differences, and 0 of 260 nonclinical controls changed.
- **SSCTR.** A clinical route that proposes nothing is what clinical-screen-first requires. No prescriptive record changes meaning, and the human queue stays at 230.

## Runtime to start from

**R7B2-FREEZE-1**:
- Record [RUNTIME_FREEZE_R7B2_1.json](RUNTIME_FREEZE_R7B2_1.json), sha256 `8d51def566f2ce8f140cb3dcf22d62d0699be73571d5d931d8f5e2e50fb59fee`.
- Commit `1a1c728`, which holds the bytes of `63fa602`.
- Source digest `57512322331f7a0295525775da8bc86da5e95fe0f2085404637498e1f8f7ecbd`, manifest digest `f9c5bd5a1bb8bd6cf2a1df3298b6b9bdc62d7f951687c9e7d756889fa753ceca`.
- 122 files and 799 tests: the 786 inherited, plus 13 in `test/r7b2-clinical-precedence.test.mjs`.
- Verify with `node scripts/verify-r7b2.mjs [--tests]`, which is read-only. It gave 35/35 in [VERIFICATION_R7B2_1.json](VERIFICATION_R7B2_1.json) and 35/35 again at closure.

R7B1-FREEZE-2 (`146ebb8`) is superseded. `verify-r7b1.mjs` fails `files`, `sourceDigest` and `manifestDigest` on these bytes, by design ([SUPERSESSION_VERIFY_R7B1_ON_R7B2.json](SUPERSESSION_VERIFY_R7B1_ON_R7B2.json)). Unchanged: R6-POLICY-5, R7B0-CATALOG-2 with its schema and foundation, the 13 B0 SSCTR r2 records, the seven R7B1-SSCTR-r2 records and the human queue (230).

## Closed by this mission

| Id | Severity | Closure | Evidence |
|---|---|---|---|
| QE-R7B1-04 | MAJOR | Fixed at `f1259d3`: the precedence point runs before `staleReturn`. K6 and K6b pass, and late evidence stays in `actualLedger`. A later review with no signal and no pending clinical state still gets R7-A's question | [BLOCKER_CLOSURE_R7B2.md](BLOCKER_CLOSURE_R7B2.md), [U3](../../../audits/domain-coaching-r7-b2-2026-10-31/evidence/U3_EVIDENCE_R7B2.md), [Engineering review](../../../audits/domain-coaching-r7-b2-2026-10-31/reviews/engineering/ENGINEERING_REVIEW_R7B2.md) |
| R7B2-CAND-01 | MAJOR | The factual re-plan question came before a clinical route. The same point now runs before `factual?.ask`. Test 'R7-B.2 CAND-01'; the judge's mutant QM3 is killed | same |
| R7B2-CAND-02 | MAJOR | The return's same-event-id question came before its interruption-reason screen. The screen now comes first; the same report is still KEEP, and other nonclinical facts under the same id are still asked. Tests 'R7-B.2 CAND-02' | same |
| QE-R7B2-01 | MAJOR (Engineering) | Correct behaviour, not a defect. A clinical same-id resend with a factual correction now routes to a human with no proposal; FREEZE-2 attached a re-plan to a question. SSCTR ACCEPT, Quality READY | [U4](../../../audits/domain-coaching-r7-b2-2026-10-31/evidence/U4_ENGINEERING_GATE_R7B2.md), [U4b](../../../audits/domain-coaching-r7-b2-2026-10-31/evidence/U4B_SSCTR_QUALITY_GATES_R7B2.md) |
| QR7B2-01 | MAJOR (Quality) | The same shape from the graduation-withdrawal source (groups B, B2 and D, 92 rows). SSCTR ACCEPT: the first admitted review re-derives the withdrawal | [SSCTR addendum A1](../../../audits/domain-coaching-r7-b2-2026-10-31/reviews/ssctr/SSCTR_REVIEW_R7B2_ADDENDUM_1.md) |
| QR7B2-04 | OBSERVATION | Inaccuracies in the U4 record, R7B2-ENG-r1 and the SSCTR request, corrected in a new record. The originals are not edited | [U4b](../../../audits/domain-coaching-r7-b2-2026-10-31/evidence/U4B_SSCTR_QUALITY_GATES_R7B2.md) |

**Still held, on these bytes:**
- **R7-B blockers.** QE-R7B-OBS-04, -R2-01, -R2-02 and -R2-03, and the QE-R7B-01 and QE-R7B-05 residuals. The 36 R7-B.1 recheck probe copies give identical results on both runtimes, except K6 and K6b, which go from FAIL to PASS. The adversarial probes give 3,228 checks with 0 failed.
- **R7-B.1 closures.** QE-R7B1-01 (neighbor E is unchanged) and QR7B1-01 to -05. The R7-B.1 tests pass unchanged.
- **Mutation.** 9 B.2 mutants, 8 killed; M41 is documented as equivalent. The other R7-B.1 and R7-B results are inherited.

## SSCTR conditions (bind use beyond the offline synthetic reference)

- **C1.** SSCTR-R7B2-01 is resolved before any use beyond the offline reference.
- **C2.** It is never resolved by attaching a re-plan or a dose to a clinical decision.
- **C3.** The R7B1-SSCTR-r2 conditions and routed findings stay with their owners: F12 (decision half), F13, F14, F6, F7, F8, F10 and R18. So do QE-R7B2-02 and QE-R7B2-03.
- **C4.** While CLINICAL_HUMAN_REQUIRED is pending, no session is presented as current or prescribed. After a documented human resolution, an admitted review re-derives the factual state before any session is presented.

None of these needs a B.2 runtime change.

## Routed, with owners (not blocking)

| Id | Severity | Origin | What | Owner |
|---|---|---|---|---|
| SSCTR-R7B2-01 / QR7B2-02 | MINOR | Pre-existing (QE-R7ADA-01); reach extended by B.2 | A correction recorded by a clinically routed review is read only at the next whole-week review. No review re-plans the rest of the current week from it (C1, C2) | Next runtime mission (Engineering), with SSCTR (D44) and Data |
| SSCTR-R7B2-03 | MINOR | Pre-existing; reach extended by B.2 (QR7B2-01) | While a clinical dependency is pending, the quality sessions a recorded correction disqualified stay in the plan in force until the first admitted review, and nothing marks them invalid (C4) | Next runtime mission: Engineering, with Product/UX and SSCTR |
| SSCTR-R7B2-02 | OBSERVATION | Pre-existing | No runtime input represents a human resolution of a clinical dependency | Founder/Product (service model), with Engineering and the qualified-human route |
| QE-R7B2-02 / R7B2-OBS-01 | MINOR | Pre-existing (R7-B), class (c), not a bypass | A substitution report with pain and no named `exerciseId` gets "Say which exercise should change and why", and the pain is not carried forward. Routing it needs a new, unscoped clinical route shape | Next runtime mission (Engineering), Product/UX for the wording, SSCTR if an unscoped route is proposed |
| QE-R7B2-03 | MINOR | Pre-existing (R6/R7-B input reading) | The substitution screen does not read the structured `illness`, `functionalLimitation`, `clinicalConcern` or `persistentPain` flags. A pain field on a weekly review or on `SUBSTITUTION_NEED` is ignored. Fixing it needs a new clinical reading | SSCTR (the reading), with the next runtime mission (Engineering) and Product/UX |
| QE-R7B2-04 | OBSERVATION | Introduced by B.2 (test coverage) | Two gaps: no test kills a mutant that routes a substitution with no named exercise, and the M41 guard cannot be killed. The point also stays complete only while `clinicalRoute`'s hand-kept kind list matches the handlers' screens | Next runtime mission (Engineering): an invariant test |
| QR7B2-03 | OBSERVATION | Introduced by B.2; fails closed | A non-JSON reason now gives HOLD instead of a question (2 rows) | Next runtime mission (Engineering): an optional admission check |

**Carried from R7-B.1, unchanged and not blocking:**
- R7B1-SSCTR-F12 (decision half), F13 (narrowed) and F14;
- QE-R7B1-02 and QE-R7B1-03;
- QR7B1-06;
- the R7-B.1 Engineering and Quality observations.

They are listed in [`../b1/R7B1_CLOSURE_HANDOFF.md`](../b1/R7B1_CLOSURE_HANDOFF.md). The R7-B backlog is carried too, in [`../b/R7B_CLOSURE_HANDOFF.md`](../b/R7B_CLOSURE_HANDOFF.md): QE-R7B-R2-05 (the R18 path), R2-OBS-01, OBS-01 to -03, F6, F7, F8, F10, R18 and the running-ceiling units.

## Execution notes

- **Runtime.** This was the first mission run by the agent execution runtime: seven supervised sessions joined by validated checkpoints.
- **Run 5.** It dispatched its two judges in the background, and they were stopped before writing any verdict. Their partial probes are kept and classified (`9269164`, `probes/INTERRUPTED_RUN5.md`). They are not a review. Each gate has exactly one review.
- **Leftovers.** Run 5 left three temporary directories outside the repository: `%TEMP%/r7b2-ssctr-judge-pred`, `%TEMP%/r7b2-quality-r1-pred-366` and `%TEMP%/r7b2-pred-McCNdx`. They are reported, not deleted.

## Next

No mission is opened. The next runtime mission needs its own Founder authorization. It starts from R7B2-FREEZE-1, with the routed findings above and SSCTR C1–C4. R7-C is not authorized, and `V1_COACHING_AUTHORITY_READY` stays NO.
