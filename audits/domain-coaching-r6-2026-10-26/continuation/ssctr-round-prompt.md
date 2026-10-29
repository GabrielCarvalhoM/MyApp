# SSCTR delta-review prompt (template)

This is the prompt used for SSCTR round 8 on 2026-10-26. It was dispatched to the native agent `sports-science-concurrent-training-reviewer` with `model: opus` and `effort: xhigh`. Reuse it for the next round. Replace the bracketed values, and update the context, the function list and the questions so they match the new dossier.

---

<task-route>{"execution_level":"L3","work_kind":"material_other","model":"claude-opus-5-5","effort":"xhigh","reason":"SSCTR delta binding review, round [N], of R6-POLICY-[K] at hash [short hash] (answers to [defects]); FREEZE-2 needs its freeze verdict","mode":"productization","owner":"sports-science-concurrent-training-reviewer","judges":[],"artifacts_required":["audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-records.json","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-review.md","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-proposed-queue-items.json","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-evidence-manifest.json","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-schema-validation.json"],"stop_when":"All ten boundary records are re-issued for hash [short hash], the dossier questions are answered, the outputs validate and a FREEZE-2 verdict is recorded","escalate_if":"A change widens an approved envelope, weakens a clinical boundary, needs a Founder-owned decision, or the policy bytes do not match the stated hash"}</task-route>

You are the project's native SSCTR (sports-science-concurrent-training-reviewer) for DOMAIN_COACHING_R6 of Vilumo Fit (CoachingCore: offline, synthetic, shadow-only Node 24 reference; no production effect). This is **round [N]**. Follow your adapter: read your constitution, your skill, the R6 block of `CURRENT_MISSION.md` and what your role requires from the canonical index. You did not write the policy, the runtime or the tests.

## Context
You reviewed the R6 envelopes in rounds 1–[N−1]. Your earlier outputs are in `audits/domain-coaching-r6-2026-10-26/reviews/` with suffixes `.r1`–`.r[N−1]`; the `.r[N−1]` files are byte-identical copies of the current ones. Round [N−1], at R6-POLICY-[K−1] hash `[previous short hash]…`, said [verdict], with [defects and recommendations].

The runtime author answered them. The policy under review is **R6-POLICY-[K]**, `CoachingCore/r6/PROGRAM_POLICY_R6.json`:
- canonical hash (`CoachingCore/src/value.mjs` `hash` of the parsed JSON) `[full hash]`;
- file sha256 `[full sha]`.

Read the author's dossier `reviews/ssctr-dossier/REVISION_R6_POLICY_[K].md` (author material, not evidence). Diff the policy against the reviewed bytes `reviews/ssctr-dossier/PROGRAM_POLICY_R6.reviewed-[previous short hash].json`. Read the changed runtime and tests: [list the functions and test files].

## Task: delta binding review of R6-POLICY-[K]
1. Recompute the canonical hash and the file sha256. If either differs from the values above, stop and report.
2. Re-run your earlier probe sections ([A–D, L and M–U]), and any others you need, against the current runtime. Write a **new** probe file, e.g. `reviews/ssctr-probe-delta-policy[K]-r[N].mjs` with its own `.out.json`. Leave earlier probes and their outputs unchanged. Before your records exist, the real authority enables nothing at the new hash, so use the DEV_TEST_ONLY authority (`CoachingCore/r6/fixtures/dev-authority.mjs`) bound to the current hash, and say so.
3. Rule on each binding defect, on the dossier's questions, and on every recommendation the author adopted.
4. Re-issue all ten boundary records for the new hash, each with disposition, evidence status, conditions, limitations and runtime binding. Update the current files:
   - `ssctr-policy-review.json`: revision R6-SSCTR-POLICY-r[N]; `policyHash` must be the new hash; `freezeVerdict.runtimeMayBeFrozen` true or false, with the blocking items if false;
   - `ssctr-records.json`;
   - `ssctr-review.md`: a "round [N] at a glance" section, with round [N−1] added to the table of earlier rounds;
   - `ssctr-proposed-queue-items.json`: a proposal only;
   - `ssctr-evidence-manifest.json`;
   - `ssctr-schema-validation.json`: run your project validator, `ssctr-validate-r6.py`.
   Do not modify the `.r1`–`.r[N−1]` files.
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
