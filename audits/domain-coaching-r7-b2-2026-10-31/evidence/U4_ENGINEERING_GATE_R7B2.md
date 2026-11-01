# R7-B.2 — U4 Engineering gate record, and the §5 condition reopened

**Gate:** contract §7 G8, Engineering. **Freeze judged:** R7B2-FREEZE-1, record `CoachingCore/r7/b2/RUNTIME_FREEZE_R7B2_1.json`:
- record sha256 `8d51def5…fee`;
- freeze commit `1a1c728`;
- source `57512322…ecbd`, manifest `f9c5bd5a…ceca`;
- 122 files, 799 tests.

This record adds to the U3 note [`U3_EVIDENCE_R7B2.md`](U3_EVIDENCE_R7B2.md). It never edits it, and it never edits the freeze or its evidence reports.

## The review

- **Request:** [`reviews/engineering/REVIEW_REQUEST.md`](../reviews/engineering/REVIEW_REQUEST.md), committed at `0c73605` before the dispatch.
- **Judge:** one fresh, independent `quality-reliability-engineer`, route `claude-opus-5-5` / `xhigh`, mode `productization`, `<task-route>` envelope. It is not the author of the fix or its evidence, and not the R7-B.1 judge.
- **Output:** [`ENGINEERING_REVIEW_R7B2.md`](../reviews/engineering/ENGINEERING_REVIEW_R7B2.md) (sha256 `04a01c7c…f4d`) and [`.json`](../reviews/engineering/ENGINEERING_REVIEW_R7B2.json) (sha256 `185f01d6…a013`). Its probes and their outputs are in [`reviews/engineering/probes/`](../reviews/engineering/probes/).
- **Identity:** the coordinator ran `verify-r7b2.mjs --tests` read-only before writing the request: 35/35 PASS. The judge ran it before, after its probes and after its deliverables: 35/35 PASS each time.
- **Verdict:** `R7B2_ENGINEERING_GATE = READY`.
  - **Q1, yes.** K6 and K6b pass on the frozen bytes; on FREEZE-2 they fail as recorded. A matrix of 123 one-review cases and 6 two-step cases all give the clinical route: no proposal, the handler's reason, pending CLINICAL_HUMAN_REQUIRED, late evidence kept in `actualLedger`.
  - **Q2, yes.** 29 late-evidence reviews without a clinical signal, across every review kind, are identical to FREEZE-2. The question after a clinical route is kept, and neighbor D is identical.
  - **Q3, no regression.** These all hold:
    - 36 R7-B.1 judge probe copies are identical, except K6 and K6b, which go from FAIL to PASS;
    - the adversarial probes give 3,228/0;
    - the read-only `regress-r7b2` rerun reproduces the record;
    - intake 83/83; neighbors 32/32; conformance PASS; suite 799/799.
  - **Q4, no new bypass and no false clinical route.** These all hold:
    - the inventory is complete;
    - the screen fuzz gives 288/288 agreement between the precedence point and the handlers;
    - the point never fires before admission (13/13);
    - an instrumented copy ran 7,555 decisions with 649 clinical routes, and every one matched its handler;
    - CAND-01 and CAND-02 are correct;
    - M41 is equivalent;
    - OBS-01 is class (c).

## Findings and their disposition

| Id | Severity | Origin | Clinical-screen-first bypass | Disposition |
|---|---|---|---|---|
| QE-R7B2-01 | MAJOR | Introduced by B.2 (the CAND-02 fix combined with a factual correction) | No. The R7-B.2 output is the correct one | **Not a runtime defect, and no correction cycle.** A return report is resent under its own event id with a clinical reason (for example "Flu illness"), in a review that also corrects earlier reports. On FREEZE-2 this gave the report-identity question (or, with a block choice, the block-choice question) **with the factual re-plan proposal `439a61ba…` attached**. R7-B.2 gives CLINICAL_HUMAN_REQUIRED with no proposal (QE-R7B1-01; QE-R7ADA-01: a clinical route proposes nothing). Once each result is applied, weeks 5–11 are prescribed differently. This is outside the contract §5 condition ("no proposal on either side", "no prescription differs"). The U3 differential never combined a same-id resend with a correction. **Consequence: §5 now requires the SSCTR review and one narrow independent Quality review before G8 and G9 can hold.** |
| QE-R7B2-02 | MINOR | Pre-existing (R7-B) | No | Same behaviour as R7B2-OBS-01. A substitution report with pain and no named exercise gets the exercise question, and the pain is not carried forward. Routed: the next runtime mission (Engineering), with the SSCTR and Product/UX. Not blocking (contract §10) |
| QE-R7B2-03 | MINOR | Pre-existing (R6/R7-B input reading); identical on both runtimes | No | The substitution screen does not read the structured `illness`, `functionalLimitation`, `clinicalConcern` or `persistentPain` flags, and a pain field on a weekly review or on `SUBSTITUTION_NEED` is ignored. Closing it would need a new clinical reading, which the contract forbids (§2.3, §10 stop conditions). Routed: the SSCTR (the reading), with the next runtime mission. Not blocking |
| QE-R7B2-04 | OBSERVATION | Introduced by B.2 (test coverage of the precedence structure) | No | Two gaps: no test fails if the point routes a report with no named exercise, and the M41 guard cannot be killed. The point also stays complete only while its kind list matches the handlers' screens. Routed: the next runtime mission (Engineering), which should add an invariant test. Not blocking; the bounded loop allows no correction cycle for an observation |

## Coordinator reproduction of QE-R7B2-01

The Engineering READY rests on it, and §5 depends on it, so the coordinator reran it independently:
- **Setup.** The judge's `probes/dual.mjs` and `probes/s5-factual-proposal.mjs` were copied to a temporary directory outside the repository. The predecessor was the full tree `git archive 146ebb8`, because the catalog binding reads files outside `CoachingCore/`, with the installed `node_modules` copied in. Everything temporary was deleted afterwards.
- **Same rows.** The output equals the judge's `probes/out/s5-factual-proposal.json` in every field except the run timestamp. Rows S5R2 and S5R8 are FREEZE-2 `ASK` with proposal `439a61ba5e87c7206a79460c79594d857d33ddd746b52f8157aa37b9d0951240`, against R7-B.2 `CLINICAL_HUMAN_REQUIRED` with proposal `null`.
- **Other changed rows.** S5b, S5c, S5f, S5h and S5R3 change from ASK to CLINICAL with no proposal on either side, which is inside §5.
- **Downstream rows.** S5R9 and S5R10 have the same status on both runtimes; the program they start from is different.

**Reading.** This does not change any rule. The difference comes from the existing rule that a clinical route proposes nothing, applied to a review that the predecessor wrongly answered with a nonclinical question. But the contract made the SSCTR and Quality exemptions conditional on there being no prescription difference, and that condition is not met. So the exemption does not apply, and the reviews it waived are now required. That is the contract's own routing, not a Founder decision.

## Gate states after U4

- R7B2_ENGINEERING_GATE: **READY** (R7B2-ENG-r1, on R7B2-FREEZE-1).
- R7B2_SSCTR_GATE: **REQUIRED, not yet reviewed** (§5 reopened by QE-R7B2-01).
- R7B2_QUALITY_GATE: **REQUIRED, one narrow independent review, not yet reviewed** (§5 reopened by QE-R7B2-01).
- Correction cycles used: 0.

## Next unit

Continue U4: one request file for each of the two reviews, bound to R7B2-FREEZE-1, under `reviews/ssctr/` and `reviews/quality/`. Then one fresh dispatch of each:
- `sports-science-concurrent-training-reviewer`;
- `quality-reliability-engineer`, a new instance and not the Engineering judge.

Both run at `claude-opus-5-5` / `xhigh`, mode `productization`.

Each review is narrow, on the frozen bytes:
- **SSCTR:** is the changed behaviour of QE-R7B2-01 acceptable? A clinical route replaces the predecessor's factual re-plan proposal, so the sessions ahead are not re-planned from the correction until the human route resolves. Is it consistent with B0-C06 condition 8, D08 and R7B1-SSCTR-r2, with no prescriptive record changed?
- **Quality:** is the G4 differential complete once the same-id resend × correction × choice class is added? Is any other changed decision outside §5?

The judges get the Engineering review and this record. If both accept, U6 closes the mission. If either finds an issue the B.2 change causes, it goes to U5, the one correction cycle.
