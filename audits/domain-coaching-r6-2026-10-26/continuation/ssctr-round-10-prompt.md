# SSCTR round-10 prompt (as dispatched)

Filled from `ssctr-round-prompt.md` on 2026-10-26 by the third continuation session, for the narrow runtime check the round-9 review asked for (same policy hash). It was dispatched to the native agent `sports-science-concurrent-training-reviewer` with `model: opus` and `effort: xhigh`.

---

<task-route>{"execution_level":"L3","work_kind":"material_other","model":"claude-opus-5-5","effort":"xhigh","reason":"SSCTR round 10: narrow runtime delta check at the unchanged R6-POLICY-5 hash 18ec48f3 for the runtime-only fixes D50 and D51; FREEZE-2 needs its freeze verdict","mode":"productization","owner":"sports-science-concurrent-training-reviewer","judges":[],"artifacts_required":["audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-records.json","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-review.md","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-proposed-queue-items.json","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-evidence-manifest.json","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-schema-validation.json"],"stop_when":"Probes A, P, S, T, U, V, X and Y and the suite are re-run on the current runtime, D50 and D51 are ruled on, the dossier questions are answered, the ten records are re-issued for hash 18ec48f3 with the outputs validated and a FREEZE-2 verdict recorded","escalate_if":"A change widens an approved envelope, weakens a clinical boundary, needs a Founder-owned decision, or the policy bytes do not match the stated hash"}</task-route>

You are the project's native SSCTR (sports-science-concurrent-training-reviewer) for DOMAIN_COACHING_R6 of Vilumo Fit (CoachingCore: offline, synthetic, shadow-only Node 24 reference; no production effect). This is **round 10**: the narrow runtime delta check your round-9 review asked for. Follow your adapter: read your constitution, your skill, the R6 block of `CURRENT_MISSION.md` and what your role requires from the canonical index. You did not write the policy, the runtime or the tests.

## Context
You reviewed the R6 envelopes in rounds 1–9. Your earlier outputs are in `audits/domain-coaching-r6-2026-10-26/reviews/` with suffixes `.r1`–`.r9`; the `.r9` files are byte-identical copies of the current ones.

Round 9, at R6-POLICY-5 hash `18ec48f3…`:
- resolved D47, D48 and D49, and accepted the unreduced D49 ceiling;
- re-issued all ten records as APPROVE_WITH_CONDITIONS;
- said **freeze NO**, blocked by two runtime-only defects, D50 and D51.

Its next step asked for both fixes without a policy change, then this check: probes A, P, S, T, U, V, X and Y and the suite re-run, and the records re-issued with a new freeze verdict.

The runtime author fixed D50 and D51 in `CoachingCore/src/r6-program.mjs` only. **The policy is unchanged:**
- canonical hash (`CoachingCore/src/value.mjs` `hash` of the parsed JSON) `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`;
- file sha256 `a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100`.

Read these, in this order:
1. **The author's note**, `reviews/ssctr-dossier/RUNTIME_DELTA_D50_D51.md` (author material, not evidence). It asks four questions; question 4 discloses a pre-existing consolidation-week effect that D50 makes more frequent.
2. **The runtime diff.** `reviews/ssctr-dossier/reviewed-18ec48f3-r9-source/` holds the runtime you reviewed in round 9. Its `r6-program.mjs` was rebuilt by undoing the two fixes; its sha256 matches your `reviewedFiles` record (`MANIFEST.json`). Diff the current `r6-program.mjs` against it. The changed functions are `distributeRun`, `plannedOf`, `advanceRun` and `advanceStrength`.
3. **The tests.** `CoachingCore/test/r6-ssctr-r9-fixes.test.mjs` is new; no other test changed.

## Task: narrow runtime delta check at hash 18ec48f3
1. Recompute the canonical hash and the file sha256, and confirm that only `r6-program.mjs` changed among the runtime files you recorded. If anything else differs, stop and report.
2. Re-run probes A, P, S, T, U, V, X and Y, and any others you need, against the current runtime. Write a **new** probe file, `reviews/ssctr-probe-runtime-d50-d51-r10.mjs`, with its own `.out.json`. Leave earlier probes and their outputs unchanged. Use the DEV_TEST_ONLY authority (`CoachingCore/r6/fixtures/dev-authority.mjs`) bound to the hash, and say so; the real authority now also enables the boundaries through your round-9 records.
   - The author's rerun of your round-9 probe is in `reviews/ssctr-dossier/r9-author-reruns/`, and the author checks are in `continuation/author-checks/`. They are author material only.
   - Do not run the `mutation-check-*` scripts: they rewrite `CoachingCore/src` temporarily.
3. Rule on D50 and D51, and on the four questions.
4. Re-issue all ten boundary records for the hash, each with disposition, evidence status, conditions, limitations and runtime binding. Update the current files:
   - `ssctr-policy-review.json`: revision R6-SSCTR-POLICY-r10; `policyHash` stays the hash above; `freezeVerdict.runtimeMayBeFrozen` true or false, with the blocking items if false;
   - `ssctr-records.json`;
   - `ssctr-review.md`: a "round 10 at a glance" section, with round 9 added to the table of earlier rounds;
   - `ssctr-proposed-queue-items.json`: a proposal only;
   - `ssctr-evidence-manifest.json`;
   - `ssctr-schema-validation.json`: run your project validator, `ssctr-validate-r6.py`.
   Do not modify the `.r1`–`.r9` files.
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
- D50 and D51, resolved or still open, with the required change for any still open;
- your rulings on the four questions;
- the freeze verdict;
- the files you wrote.
