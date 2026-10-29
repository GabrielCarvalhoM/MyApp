# SSCTR round-11 prompt (as dispatched)

The fourth continuation session filled this from `ssctr-round-10-prompt.md` on 2026-10-26, for the narrow runtime check that the round-10 review asked for at the same policy hash. It was dispatched to the native agent `sports-science-concurrent-training-reviewer`, with `model: opus` and `effort: xhigh`.

---

<task-route>{"execution_level":"L3","work_kind":"material_other","model":"claude-opus-5-5","effort":"xhigh","reason":"SSCTR round 11: narrow runtime delta check at the unchanged R6-POLICY-5 hash 18ec48f3 for the runtime-only fix D52 and one author-found change; FREEZE-2 needs its freeze verdict","mode":"productization","owner":"sports-science-concurrent-training-reviewer","judges":[],"artifacts_required":["audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-records.json","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-review.md","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-proposed-queue-items.json","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-evidence-manifest.json","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-schema-validation.json"],"stop_when":"Probes S2, Y2 and Z, the round-10 sections A-Y and the suite are re-run on the current runtime, D52 and the author-found conflict filter are ruled on, the four dossier questions are answered, the ten records are re-issued for hash 18ec48f3 with the outputs validated and a FREEZE-2 verdict recorded","escalate_if":"A change widens an approved envelope, weakens a clinical boundary, needs a Founder-owned decision, or the policy bytes do not match the stated hash"}</task-route>

You are the project's native SSCTR (sports-science-concurrent-training-reviewer) for DOMAIN_COACHING_R6 of Vilumo Fit. CoachingCore is an offline, synthetic, shadow-only Node 24 reference with no production effect.

This is **round 11**: the narrow runtime delta check that your round-10 review asked for. Follow your adapter: read your constitution, your skill, the R6 block of `CURRENT_MISSION.md`, and what your role requires from the canonical index. You did not write the policy, the runtime or the tests.

## Context

You reviewed the R6 envelopes in rounds 1–10. Your earlier outputs are in `audits/domain-coaching-r6-2026-10-26/reviews/`, with suffixes `.r1` to `.r10`; the `.r10` files are byte-identical copies of the current ones.

Round 10 was the narrow runtime check of D50 and D51 at R6-POLICY-5, hash `18ec48f3…`:
- it resolved D50 and D51;
- it accepted Q1, confirmed Q2, and made Q3 an open gap (R14, tied to G03) and Q4 the non-blocking R16; R17 was new;
- it re-issued all ten records as APPROVE_WITH_CONDITIONS;
- it said **freeze NO**, blocked by **D52**: the strength state was updated from prescriptions rather than executions. (A) A prescription that was not executed established the exercise. (B) The `strength.resumeAfterDays` clock counted whole weeks from the last prescribed week.

Its next step asked for D52 to be fixed in the runtime without a policy change, with probe Z added as regression tests. It then asked for this check: probes S2, Y2 and Z, the round-10 sections A–Y and the suite re-run, and the records re-issued with a new freeze verdict.

The runtime author fixed D52 in `CoachingCore/src/r6-program.mjs` and `CoachingCore/src/r6-adaptation.mjs`. It also made one author-found adjacent change: a conflicted strength report neither sets nor confirms a load. **The policy is unchanged:**
- canonical hash `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c` (`CoachingCore/src/value.mjs` `hash` of the parsed JSON);
- file sha256 `a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100`.

Read these, in this order:
1. **The author's note**, `reviews/ssctr-dossier/RUNTIME_DELTA_D52.md`. It is author material, not evidence. It asks four questions and discloses the consequences it does not ask about. One of them affects your probes: the clock field `lastWeek` no longer exists. It was replaced by `lastPerformed`, a local `YYYY-MM-DD` date, so the `runtimeGapBasisDays` that your round-10 probe reads from `lastWeek` is now null.
2. **The runtime diff.** `reviews/ssctr-dossier/reviewed-18ec48f3-r10-source/` holds the runtime you reviewed in round 10, copied before any D52 edit; its `MANIFEST.json` checks it against your record. Diff the current files against it. `reviews/ssctr-dossier/RUNTIME_DELTA_D52.diff` is the author's unified diff. The changed functions are:
   - in `r6-program.mjs`: `initialStrengthState`, `strengthDose`, `advanceStrength`, `strengthRowsFor` and `buildWeek`;
   - in `r6-adaptation.mjs`: `usedInWeek`, the new `performedInWeek`, `loggedLoads`, `weeklyReview` and `rebuild`.
3. **The tests.**
   - `CoachingCore/test/r6-ssctr-r10-fixes.test.mjs` is new, with 10 tests.
   - In `CoachingCore/test/r6-ssctr-revision.test.mjs`, only the D30 test changed: it now sets `lastPerformed` instead of `lastWeek`.
   - No other test changed.

## Task: narrow runtime delta check at hash 18ec48f3

1. **Check integrity.** Recompute the canonical hash and the file sha256. Among the files you recorded in round 10, confirm that only three changed: `r6-program.mjs`, `r6-adaptation.mjs` and `test/r6-ssctr-revision.test.mjs`. If anything else differs, stop and report.
2. **Re-run the probes.** Re-run S2, Y2 and Z, the round-10 sections A–Y, and any others you need, against the current runtime.
   - Write a **new** probe file, `reviews/ssctr-probe-runtime-d52-r11.mjs`, with its own `.out.json`. Leave earlier probes and their outputs unchanged.
   - Read the runtime clock from `lastPerformed`.
   - Use the DEV_TEST_ONLY authority (`CoachingCore/r6/fixtures/dev-authority.mjs`) bound to the hash, and say so. The real authority also enables the boundaries, through your round-10 records.
   - Author material, for reference only:
     - the author's rerun of your round-10 probe, in `reviews/ssctr-dossier/r10-author-reruns/`;
     - the author checks, in `continuation/author-checks/`: `author-check-resume-clock.mjs` and `author-check-same-week.mjs`, with their `.out.json`.
   - Do not run the `mutation-check-*` scripts: they rewrite `CoachingCore/src` temporarily.
3. **Rule** on D52, on the author-found conflict filter and on the four questions.
4. **Re-issue all ten boundary records** for the hash. Each needs a disposition, an evidence status, conditions, limitations and a runtime binding. Update the current files:
   - `ssctr-policy-review.json`: revision R6-SSCTR-POLICY-r11; `policyHash` stays the hash above; `freezeVerdict.runtimeMayBeFrozen` is true or false, and lists the blocking items if false;
   - `ssctr-records.json`;
   - `ssctr-review.md`: a "round 11 at a glance" section, and round 10 added to the table of earlier rounds;
   - `ssctr-proposed-queue-items.json`: a proposal only;
   - `ssctr-evidence-manifest.json`;
   - `ssctr-schema-validation.json`: run your project validator, `ssctr-validate-r6.py`.

   Do not modify the `.r1`–`.r10` files.
5. **The freeze gate.** `CoachingCore/scripts/freeze-r6-2.mjs` refuses to freeze unless `ssctr-policy-review.json` carries the current `policyHash` and `freezeVerdict.runtimeMayBeFrozen === true`.

## Rules

- **Write only** your review outputs, probes and evidence files, under `audits/domain-coaching-r6-2026-10-26/reviews/`.
- **Do not modify** anything under `CoachingCore/`, `product/` or `canon/`, nor `CURRENT_MISSION.md`, `MISSION_LEDGER.md` or the human queue `reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json`.
- **Do not read** `CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json`, `FIRST_EVALUATION.json` or any post-fix evaluation.
- **Never run** `npm run verify` or any `verify-r*` script. `node --test` in `CoachingCore` is fine.
- **Literature:** use it where a ruling needs it (Europe PMC works from Node), and log your searches as before.
- **Claims:** make no claim of human, empirical or clinical validation.

## Final answer

A short report covering:
- the disposition per boundary;
- D52, resolved or still open, with the required change if it is still open;
- your ruling on the conflict filter;
- your rulings on the four questions;
- the freeze verdict;
- the files you wrote.
