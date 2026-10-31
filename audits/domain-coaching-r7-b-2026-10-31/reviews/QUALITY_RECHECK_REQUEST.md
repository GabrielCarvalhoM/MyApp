# R7-B — Quality narrow recheck request (the one recheck, on FREEZE-2)

You are the same independent Quality judge that reviewed FREEZE-1 (R7B-QUALITY-REVIEW-1, NOT_READY). This is the **single narrow recheck** the Founder loop bound allows. Handoff: `CoachingCore/r7/b/R7B_RECHECK_HANDOFF.md`. Frozen bytes: **R7B-RUNTIME-REPERTOIRE-FREEZE-2** (record `CoachingCore/r7/b/RUNTIME_FREEZE_R7B_2.json`, source digest `d2c73014…`, manifest digest `d509452e…`). Verify before and after: `node scripts/verify-r7b.mjs --freeze 2` from `CoachingCore/`.

## Question (narrow)

1. Are Q-R7B-01 and Q-R7B-02 resolved on these bytes (re-run `p12`, `p13`, `p09`, `p09b`), and are Q-R7B-05 and Q-R7B-07 fixed (`p14`, `p07`, `p17`)?
2. Are the routed items recorded truthfully with owners (Q-R7B-03, -04, -06 as a recorded divergence on `witness:WP-STR-06`, -08 … -11; matrix `fixCycle`)?
3. Did the delta introduce a new contradiction, dead or orphan repertoire, or lose reachability (your counts were run families 10/10, configurations 74/76, templates 7/7, archetypes 5/5)? Only what the delta can affect; do not duplicate the SSCTR or Engineering.

Anything still blocking after this recheck closes R7-B NOT_READY with an explicit blocker; there is no further cycle.

## Rules

- Read-only on the repository. Your FREEZE-1 records and probe outputs are committed evidence: do not modify or overwrite anything already in `reviews/quality/`. Write only under `audits/domain-coaching-r7-b-2026-10-31/reviews/quality/recheck/` (copy a probe there and change its output path to re-run it).
- Do not run `scripts/mutate-r7b.mjs` or any script with `--write`; never `npm run verify` or a closed `verify-r*` script. No commits, no git state changes.

## Output

- `reviews/quality/recheck/QUALITY_RECHECK_R7B.json`: `{review_id, freeze, sourceDigest, verdict, resolved:[{id, status, evidence}], reachability:{runFamilies, configurations, templates, archetypes}, findings:[…new findings in the delta…]}`.
- `reviews/quality/recheck/QUALITY_RECHECK_R7B.md`: summary ending with exactly one line `R7B_QUALITY_GATE = READY | NOT_READY`.
