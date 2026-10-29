# SSCTR round-12 prompt (as dispatched)

The fourth continuation session filled this from `ssctr-round-11-prompt.md` on 2026-10-27, for the narrow runtime check of D53 that the round-11 review asked for. Under the Founder bound (`../FOUNDER_LOOP_BOUND.md`) it is the **last** SSCTR round of R6. It was dispatched to the native agent `sports-science-concurrent-training-reviewer`, with `model: opus` and `effort: xhigh`.

---

<task-route>{"execution_level":"L3","work_kind":"material_other","model":"claude-opus-5-5","effort":"xhigh","reason":"SSCTR round 12, the last R6 round under the Founder bound: narrow runtime delta check at the unchanged R6-POLICY-5 hash 18ec48f3 for the runtime-only fix D53; FREEZE-2 needs its freeze verdict","mode":"productization","owner":"sports-science-concurrent-training-reviewer","judges":[],"artifacts_required":["audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-records.json","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-review.md","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-proposed-queue-items.json","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-evidence-manifest.json","audits/domain-coaching-r6-2026-10-26/reviews/ssctr-schema-validation.json"],"stop_when":"Probes AH, Z, Y2, U and X, the round-11 sections and the suite are re-run on the current runtime, D53 is ruled on, every remaining blocking item is listed, the ten records are re-issued for hash 18ec48f3 with the outputs validated and a FREEZE-2 verdict recorded","escalate_if":"A change widens an approved envelope, weakens a clinical boundary, needs a Founder-owned decision, or the policy bytes do not match the stated hash"}</task-route>

You are the project's native SSCTR (sports-science-concurrent-training-reviewer) for DOMAIN_COACHING_R6 of Vilumo Fit. CoachingCore is an offline, synthetic, shadow-only Node 24 reference with no production effect.

This is **round 12**: the narrow runtime delta check that your round-11 review asked for. Follow your adapter: read your constitution, your skill, the R6 block of `CURRENT_MISSION.md`, and what your role requires from the canonical index. You did not write the policy, the runtime or the tests.

## This is the last round R6 allows

The Founder bounded the cycle (`audits/domain-coaching-r6-2026-10-26/FOUNDER_LOOP_BOUND.md`). If this round does not allow the freeze, R6 closes with an explicit blocker and DOMAIN_COACHING_R7 is the next step. There is no further SSCTR round in R6.
- Apply your normal standard: the bound lowers nothing.
- Report **every** blocking item you find, with its required change, so that R7 starts from a complete list.

## Context

You reviewed the R6 envelopes in rounds 1–11. Your earlier outputs are in `audits/domain-coaching-r6-2026-10-26/reviews/`, with suffixes `.r1` to `.r11`; the `.r11` files are byte-identical copies of the current ones.

Round 11, at R6-POLICY-5 hash `18ec48f3…`:
- resolved D52;
- accepted the conflict filter;
- ruled on the four questions: Q1 accepted, Q2 and Q3 confirmed, Q4 accepted with the new R19;
- added R18 (weeks without a gating review) as an owned gap that does not block FREEZE-2;
- re-issued all ten records as APPROVE_WITH_CONDITIONS;
- said **freeze NO**, blocked by **D53**: after a performed re-establishment at 2 sets, the next week could be 4 sets, because the block-boundary set came back at once on top of the set regained through `priorSets`.

Its next step asked for D53 to be fixed in the runtime without a policy change, with probe AH added as regression tests. It then asked for this check: probes AH, Z, Y2, U and X, the round-11 sections and the suite re-run, and the records re-issued with a new freeze verdict.

The runtime author fixed D53 in `CoachingCore/src/r6-program.mjs` only. **The policy is unchanged:**
- canonical hash `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c` (`CoachingCore/src/value.mjs` `hash` of the parsed JSON);
- file sha256 `a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100`.

Read these, in this order:
1. **The author's note**, `reviews/ssctr-dossier/RUNTIME_DELTA_D53.md`. It is author material, not evidence. It asks no question; it discloses two consequences.
2. **The runtime diff.** `reviews/ssctr-dossier/reviewed-18ec48f3-r11-source/` holds the runtime you reviewed in round 11, copied before any D53 edit; its `MANIFEST.json` checks it against your record. Diff the current `r6-program.mjs` against it. `reviews/ssctr-dossier/RUNTIME_DELTA_D53.diff` is the author's unified diff. The changed functions are `strengthDose`, `startStrengthReturn` and `advanceStrength`.
3. **The tests.** `CoachingCore/test/r6-ssctr-r11-fixes.test.mjs` is new, with 5 tests. No other test changed.

## Task: narrow runtime delta check at hash 18ec48f3

1. **Check integrity.** Recompute the canonical hash and the file sha256. Among the files you recorded in round 11, confirm that only `r6-program.mjs` changed. If anything else differs, stop and report.
2. **Re-run the probes.** Re-run AH, Z, Y2, U and X, the round-11 sections, and any others you need, against the current runtime.
   - Write a **new** probe file, `reviews/ssctr-probe-runtime-d53-r12.mjs`, with its own `.out.json`. Leave earlier probes and their outputs unchanged.
   - Use the DEV_TEST_ONLY authority (`CoachingCore/r6/fixtures/dev-authority.mjs`) bound to the hash, and say so.
   - Author material, for reference only:
     - the author's rerun of your round-11 probe, in `reviews/ssctr-dossier/r11-author-reruns/`;
     - the author checks, in `continuation/author-checks/`.
   - Do not run the `mutation-check-*` scripts: they rewrite `CoachingCore/src` temporarily.
3. **Rule on D53**, and list every remaining blocking item, if any, with its required change.
4. **Re-issue all ten boundary records** for the hash. Each needs a disposition, an evidence status, conditions, limitations and a runtime binding. Update the current files:
   - `ssctr-policy-review.json`: revision R6-SSCTR-POLICY-r12; `policyHash` stays the hash above; `freezeVerdict.runtimeMayBeFrozen` is true or false, and lists the blocking items if false;
   - `ssctr-records.json`;
   - `ssctr-review.md`: a "round 12 at a glance" section, and round 11 added to the table of earlier rounds;
   - `ssctr-proposed-queue-items.json`: a proposal only;
   - `ssctr-evidence-manifest.json`;
   - `ssctr-schema-validation.json`: run your project validator, `ssctr-validate-r6.py`.

   Do not modify the `.r1`–`.r11` files.
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
- D53, resolved or still open;
- every remaining blocking item, with its required change;
- the freeze verdict;
- the files you wrote.
