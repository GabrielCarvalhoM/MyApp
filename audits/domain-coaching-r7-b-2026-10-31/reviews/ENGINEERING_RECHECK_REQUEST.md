# R7-B — Engineering narrow recheck request (the one recheck, on FREEZE-2)

You are the same independent Engineering judge that reviewed FREEZE-1 (R7B-ENG-r1, NOT_READY). This is the **single narrow recheck** the Founder loop bound allows. Handoff: `CoachingCore/r7/b/R7B_RECHECK_HANDOFF.md`. Frozen bytes: **R7B-RUNTIME-REPERTOIRE-FREEZE-2** (record `CoachingCore/r7/b/RUNTIME_FREEZE_R7B_2.json`, source digest `d2c73014…`, manifest digest `d509452e…`). Verify before and after: `node scripts/verify-r7b.mjs --freeze 2` from `CoachingCore/`.

## Question (narrow)

1. Are QE-R7B-01 … QE-R7B-06 resolved on these bytes (re-run your reproductions: `a10-repro`, `a3-substitution`, `a4-rotation`, `a-state`, `a2-state`) and are the fixed minors QE-R7B-07 … -12 as the handoff states?
2. Did the fix-cycle delta (`git diff 4995d58 d03025b -- CoachingCore/src CoachingCore/test`) introduce a defect in your scope: state transitions, stale-state resurrection, correction/retraction (A5), determinism, boundaries, impossible combinations, regression against R7-A? In particular the new paths: slot-located decisions and their natural-pick replay, rotation counted from a decision's week, graduation withdrawal inside the canonical factual state, the density cap read from evidence and started by a context change, block-choice validation, the record veto and the UTC review-by date.

Areas the delta does not touch are not re-reviewed. Anything still blocking after this recheck closes R7-B NOT_READY with an explicit blocker; there is no further cycle.

## Rules

- Read-only on the repository. Your FREEZE-1 records and probe outputs are committed evidence: do not modify or overwrite anything already in `reviews/engineering/`. Write only under `audits/domain-coaching-r7-b-2026-10-31/reviews/engineering/recheck/` (copy a probe there and change its output path to re-run it; mutation-style probes on copies under your OS temp dir).
- Do not run `scripts/mutate-r7b.mjs` or any script with `--write`; never `npm run verify` or a closed `verify-r*` script. No commits, no git state changes.

## Output

- `reviews/engineering/recheck/ENGINEERING_RECHECK_R7B.json`: `{review_id, freeze, sourceDigest, manifestDigest, verdict, resolved:[{id, status: RESOLVED|NOT_RESOLVED, evidence}], findings:[…new findings in the delta, same schema as before…]}`.
- `reviews/engineering/recheck/ENGINEERING_RECHECK_R7B.md`: summary ending with exactly one line `R7B_ENGINEERING_GATE = READY | NOT_READY` (READY means no BLOCKER or MAJOR finding remains or is new in the delta).
