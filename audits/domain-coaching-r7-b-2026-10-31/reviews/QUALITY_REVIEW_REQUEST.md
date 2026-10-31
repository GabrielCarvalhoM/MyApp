# R7-B — Quality review request (third judge, uncovered properties only)

You are an independent quality judge. You did not author this runtime. Two other judges cover sports-science fidelity (SSCTR) and engineering correctness (state transitions, stale state, correction, determinism, boundaries, impossible combinations, R7-A regression); **do not duplicate them**.

## Question

On the frozen bytes of **R7B-RUNTIME-REPERTOIRE-FREEZE-1** (`CoachingCore/r7/b/RUNTIME_FREEZE_R7B.json`), is the bound repertoire complete and reachable, without contradictions? Request §25:

- **completeness**: every catalog family, configuration, template, relation and rule has a runtime consumer, an implementation or an explicit, justified deferral (check `CoachingCore/r7/b/CONFORMANCE_R7B.json` against the catalog yourself; do not trust its checker blindly);
- **reachability**: each of the 10 run families, each of the 76 strength configurations, each of the 7 templates and each of the 5 archetypes can actually be produced by some valid onboarding-like input (and later reviews where needed), or the matrix explains why not;
- **dead repertoire / orphan configurations**: configurations that no admissible input can select, alternatives never used, rules with no effect;
- **unreachable archetypes** and overlays;
- **contradictions**: between catalog rules, SSCTR r2 conditions, runtime behaviour, disclosures and the matrix (e.g. a disclosure that promises an option the runtime never applies, a witness the runtime contradicts without a recorded reason).

## Read (minimum)

`CoachingCore/r7/b/R7B_REVIEW_HANDOFF.md`, `CoachingCore/r7/b/CONFORMANCE_R7B.json`, `CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json`, `CoachingCore/src/r7b-repertoire.mjs`, `CoachingCore/r7/b/fixtures/helpers.mjs` (for building inputs). Write your own reachability probes.

## Rules

- Do not edit anything under `CoachingCore/src`, `CoachingCore/test`, `CoachingCore/r6`, `CoachingCore/r7`, `product/`, `canon/`. Do not commit, stash, check out or reset. Never run `npm run verify` or any closed `verify-r*` script.
- Write only into `audits/domain-coaching-r7-b-2026-10-31/reviews/quality/`.
- Bounded: one review.

## Output

- `audits/domain-coaching-r7-b-2026-10-31/reviews/quality/QUALITY_REVIEW_R7B.json`: `{review_id, freeze, sourceDigest, verdict, reachability:{runFamilies, configurations, templates, archetypes}, findings:[{id, severity: BLOCKER|MAJOR|MINOR|OBSERVATION, kind: COMPLETENESS|REACHABILITY|DEAD|ORPHAN|CONTRADICTION, summary, evidence}]}`.
- `audits/domain-coaching-r7-b-2026-10-31/reviews/quality/QUALITY_REVIEW_R7B.md`: summary ending with exactly one line `R7B_QUALITY_GATE = READY | NOT_READY`. READY means no BLOCKER or MAJOR finding inside this gate.
