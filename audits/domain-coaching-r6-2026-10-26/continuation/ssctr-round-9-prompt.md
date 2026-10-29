# SSCTR round-9 prompt (as dispatched)

Filled from `ssctr-round-prompt.md` on 2026-10-26 by the third continuation session. It was dispatched to the native agent `sports-science-concurrent-training-reviewer` with `model: opus` and `effort: xhigh`.

---

<task-route>{"execution_level":"L3","work_kind":"material_other","model":"claude-opus-5-5","effort":"xhigh","reason":"SSCTR delta binding review, round 9, of R6-POLICY-5 at hash 18ec48f3 (answers to D47, D48 and D49, plus R11, R12, R13 and one author-found restart change); FREEZE-2 needs its freeze verdict","mode":"productization","owner":"sports-science-concurrent-training-reviewer","judges":[],"artifacts_required":["audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-records.json","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-review.md","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-proposed-queue-items.json","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-evidence-manifest.json","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-schema-validation.json"],"stop_when":"All ten boundary records are re-issued for hash 18ec48f3, the dossier questions are answered, the outputs validate and a FREEZE-2 verdict is recorded","escalate_if":"A change widens an approved envelope, weakens a clinical boundary, needs a Founder-owned decision, or the policy bytes do not match the stated hash"}</task-route>

You are the project's native SSCTR (sports-science-concurrent-training-reviewer) for DOMAIN_COACHING_R6 of Vilumo Fit (CoachingCore: offline, synthetic, shadow-only Node 24 reference; no production effect). This is **round 9**. Follow your adapter: read your constitution, your skill, the R6 block of `CURRENT_MISSION.md` and what your role requires from the canonical index. You did not write the policy, the runtime or the tests.

## Context
You reviewed the R6 envelopes in rounds 1–8. Your earlier outputs are in `audits/domain-coaching-r6-2026-10-26/reviews/` with suffixes `.r1`–`.r8`; the `.r8` files are byte-identical copies of the current ones.

Round 8, at R6-POLICY-4 hash `1046ad0e…`, said **freeze NO**:
- REVISE: NONCLINICAL-RETURN (D49) and EVENT-TRANSITION (D47);
- binding defects: D47, D48 and D49;
- new recommendations: R11, R12 and R13, which you recommended fixing in the same revision.

The runtime author answered them. The policy under review is **R6-POLICY-5**, `CoachingCore/r6/PROGRAM_POLICY_R6.json`:
- canonical hash (`CoachingCore/src/value.mjs` `hash` of the parsed JSON) `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`;
- file sha256 `a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100`.

Read these, in this order:
1. **The author's dossier**, `reviews/ssctr-dossier/REVISION_R6_POLICY_5.md` (author material, not evidence). It asks nine questions.
2. **The policy diff** against the reviewed bytes, `reviews/ssctr-dossier/PROGRAM_POLICY_R6.reviewed-1046ad0e.json`.
3. **The runtime diff.** `reviews/ssctr-dossier/reviewed-1046ad0e-source/` is a byte-identical copy of the runtime and tests you reviewed in round 8; diff the current files against it. The changed files are:
   - `r6-program.mjs`: `strengthDose`, `returnStepSets`, `startStrengthReturn`, `advanceStrength`, `strengthRowsFor`, `advanceRun`, `plannedOf`, `projectionGates`, `withModeHistory`, `projectWeeks`, `raceDayCompletionBasis`, `raceDayCompletion`, `eventCompletionItem`, `generateProgram`;
   - `r6-adaptation.mjs`: `finishProposal`, `returnAfterPause`;
   - `r6-prescription.mjs`: `exerciseRow`;
   - `r6-clinical.mjs`: the lexicon and `joinCompounds`.
4. **The tests.** `CoachingCore/test/r6-ssctr-r8-fixes.test.mjs` is new. `r6-ssctr-r7-fixes.test.mjs` gained one D48 assertion in its D45 test.

## Task: delta binding review of R6-POLICY-5
1. Recompute the canonical hash and the file sha256. If either differs from the values above, stop and report.
2. Re-run your earlier probe sections (A–D, L and M–U), and any others you need, against the current runtime. Write a **new** probe file, `reviews/ssctr-probe-delta-policy5-r9.mjs`, with its own `.out.json`. Leave earlier probes and their outputs unchanged. Before your records exist, the real authority enables nothing at the new hash, so use the DEV_TEST_ONLY authority (`CoachingCore/r6/fixtures/dev-authority.mjs`) bound to the current hash, and say so.
   - The author's rerun of your round-8 probe is in `reviews/ssctr-dossier/policy5-author-reruns/`. It is author material only.
   - Your round-8 section P expects completion from the race-week mode alone, and section U compares with the literal last pre-break count. Both expectations are what D47 and dossier question 1 ask you to rule on.
3. Rule on each binding defect, on the dossier's nine questions, and on every recommendation and author-found change the author adopted.
4. Re-issue all ten boundary records for the new hash, each with disposition, evidence status, conditions, limitations and runtime binding. Update the current files:
   - `ssctr-policy-review.json`: revision R6-SSCTR-POLICY-r9; `policyHash` must be the new hash; `freezeVerdict.runtimeMayBeFrozen` true or false, with the blocking items if false;
   - `ssctr-records.json`;
   - `ssctr-review.md`: a "round 9 at a glance" section, with round 8 added to the table of earlier rounds;
   - `ssctr-proposed-queue-items.json`: a proposal only;
   - `ssctr-evidence-manifest.json`;
   - `ssctr-schema-validation.json`: run your project validator, `ssctr-validate-r6.py`.
   Do not modify the `.r1`–`.r8` files.
5. `CoachingCore/scripts/freeze-r6-2.mjs` refuses to freeze unless `ssctr-policy-review.json` carries the current `policyHash` and `freezeVerdict.runtimeMayBeFrozen === true`.

## Rules
- **Write only** your review outputs, probes and evidence files under `audits/domain-coaching-r6-2026-10-26/reviews/`.
- **Do not modify** anything under `CoachingCore/`, `product/`, `canon/`, `CURRENT_MISSION.md`, `MISSION_LEDGER.md` or the human queue `reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json`.
- **Do not read** `CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json`, `FIRST_EVALUATION.json` or any post-fix evaluation.
- **Never run** `npm run verify` or any `verify-r*` script. `node --test` in `CoachingCore` is fine.
- **Literature:** use it where a ruling needs it (Europe PMC works from Node), and log searches as before.
- **Claims:** make none of human, empirical or clinical validation.

## Final answer
A short report covering:
- the disposition per boundary;
- each defect, resolved or still open, with the required change for any still open;
- your rulings on the dossier's questions;
- the freeze verdict;
- the files you wrote.
