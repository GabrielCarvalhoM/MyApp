# R7-B.2 — test changes

**No existing test was changed, removed or skipped.** The 786 tests of R7B1-FREEZE-2 (commit `146ebb8`) pass unchanged on the R7-B.2 runtime. No test asserted the defective behaviour, so contract §7 G2 needed no change.

**Added:** `CoachingCore/test/r7b2-clinical-precedence.test.mjs`, 13 tests (U2, commit `f1259d3`):

| Group | Tests | Finding |
|---|---|---|
| QE-R7B1-04 | 4 | Pain, injury, `pain:'yes'` or clinical free text with a named exercise, reported with late training before the break, routes to the handler's own clinical route (exact reason, no proposal, pending CLINICAL_HUMAN_REQUIRED) and the late report stays recorded. The same with a ladder step, a graduation decline or an unrecognised choice. Two steps (K6b). After the clinical route, a later review with no signal and no pending clinical state still gets R7-A's late-evidence question, and one carrying the clinical reference state stays clinical |
| R7B2-CAND-02 | 1 | A return resent under its event id with an illness reason, an injury category or the clinical flag routes to a human, not to the report-identity question |
| R7B2-CAND-01 | 1 | When the factual re-plan raises its own question, substitution pain, an illness return, or pain with an unrecognised choice routes to a human; the correction stays recorded |
| Preserved | 7 | Neighbor A (late evidence, no clinical signal: R7-A's question for a weekly review, a substitution with `pain:false`, an unclear `pain:'maybe'`, nonclinical discomfort); neighbor B (a clinical signal without late evidence: the handler's own route and text); an illness return in the re-entry week; neighbor D (a nonclinical correction with late evidence is never clinical); neighbor F (a skill substitution substitutes); CAND-02 (the same report is KEEP; the same id with other nonclinical facts is asked); CAND-01 (without a clinical signal the factual question is asked) |

On the baseline bytes (`033f300`, equal to R7B1-FREEZE-2 in Coaching Core) the six non-preserved tests fail and the seven preserved tests pass ([RED log](evidence/RED_r7b2-clinical-precedence_baseline-033f300.log)). On the R7-B.2 bytes all 13 pass, and the full suite is 799 tests, 799 pass, 0 fail ([GREEN log](evidence/SUITE_U2-fixed.log)).

Neighbor E (a block choice with a clinical signal, QE-R7B1-01) keeps its R7-B.1 tests in `test/r7b1-correction-cycle.test.mjs`, unchanged and passing. The fixtures are the R7-B ones (`CoachingCore/r7/b/fixtures/helpers.mjs`), unchanged.

## U3 (evidence and freeze)

No test was added or changed in U3. The U3 evidence lives in new scripts (`CoachingCore/scripts/regress-r7b2.mjs`, `neighbors-r7b2.mjs`, `mutate-r7b2.mjs`, `conformance-r7b2.mjs`, `freeze-r7b2.mjs`, `verify-r7b2.mjs`) and in the reports the freeze record R7B2-FREEZE-1 binds.

The rerun of R7-B.1's mutant M41 on the new bytes survives every test file. It is documented as an equivalent mutant (`r7/b2/MUTATION_R7B2.json`, `equivalent`). The guard it removes, "a clinical handler result outranks the block-choice question", is subsumed by the precedence point: every handler clinical route is now returned by the precedence point first, through the same screen function on the same review. No test was added for it, because no input reaches the fragment with a different result.
