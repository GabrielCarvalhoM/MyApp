# R6 conformance scope

BSR/R2/R3/R4/R5 runtime, fixtures, independent corpora, first evaluations, envelope registries and historical evidence are preserved byte for byte (checked against `audits/domain-coaching-r6-2026-10-26/BASELINE.json`). R6 is additive: new `src/r6-*.mjs` modules behind `src/r6-index.mjs`, a new policy `r6/PROGRAM_POLICY_R6.json`, new tests and new scripts. The R5 holdout is replayed through R6 with its facts unchanged; it is regression evidence, never fresh holdout evidence.

`CoachingCore/package.json` is the only baseline file R6 changes besides the insert-only mission files. The default `simulate` and `verify` commands now select R6; `verify` is read-only (`verify:r6-write` writes only `r6/VERIFICATION.json`). `verify:r5` is renamed `verify:r5-historical`, matching the R2–R4 aliases. The test command and dependencies are unchanged. R5's verifier asserted the R5 default entrypoints; that one assertion is superseded by this record, as R5 superseded R4's. Historical verifiers regenerate closed evidence, so R6 neither runs them nor declares them newly run.

`CURRENT_MISSION.md` and `MISSION_LEDGER.md` receive insert-only R6 blocks; the pre-entry copies in `audits/domain-coaching-r6-2026-10-26/snapshots/` let the verifier check that every earlier line survives in order (parallel OB-2 inserts are preserved). No UI, Figma, KMP, production, canonical training doctrine, Product Truth or real-athlete plan is changed. Fixture dates are their stated synthetic dates; delivery is 2026-10-26.

The single funded-human revalidation queue advances from 114 to 127 entries at closure: the three OB-2 items prepared before R6 opened (verbatim, `audits/new-figma-onboarding-v2-2026-10-25/QUEUE_ADDITIONS_PROPOSED.json`) and the ten reusable R6 envelope approvals proposed by the SSCTR (`audits/domain-coaching-r6-2026-10-26/reviews/ssctr-proposed-queue-items.json`). Every earlier item stays byte-identical and the funding trigger stays NOT_DECLARED. R5's verifier asserted exactly 114 items; that assertion is superseded here, as R5 superseded R4's 110. The record is `audits/domain-coaching-r6-2026-10-26/QUEUE_INTEGRATION_R6.json`.

## FREEZE-2

The independent engineering review failed FREEZE-1 (`audits/domain-coaching-r6-2026-10-26/reviews/quality-engineering-review.json`, 23 findings). The single first holdout evaluation had already been recorded on the unchanged FREEZE-1, and it stays the primary record (`holdout/FIRST_EVALUATION.json`).

The fixes are R6 work and touch only R6 files:
- `src/r6-*.mjs`;
- the policy, revised to R6-POLICY-3 (semantic declarations; no envelope magnitude widened);
- tests: one new file `test/r6-engineering-fixes.test.mjs`, and one updated R6 test in `test/r6-balanced-provenance.test.mjs`, whose earlier assertion encoded the removal of a conflicting report that QRE-R6-14 identifies as a defect;
- R6 scripts.

No historical runtime, fixture, corpus or evidence changes.

`RUNTIME_FREEZE_R6_2.json` records the delta against FREEZE-1 and the SSCTR binding of the new policy. The sealed corpus is rerun once on FREEZE-2 as labelled challenge reuse (`holdout/POSTFIX_EVALUATION_FREEZE2.json`). The FREEZE-1 official outputs are archived byte-identical in `audits/domain-coaching-r6-2026-10-26/freeze-1-outputs/`. The live outputs here are regenerated on FREEZE-2.
