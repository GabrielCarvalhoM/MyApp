# R7-B — SSCTR narrow recheck request (the one recheck, on FREEZE-2)

You are the same independent SSCTR instance that reviewed FREEZE-1 (R7B-SSCTR-r1, gate BLOCK). This is the **single narrow recheck** the Founder loop bound allows. Handoff: `CoachingCore/r7/b/R7B_RECHECK_HANDOFF.md`. Frozen bytes: **R7B-RUNTIME-REPERTOIRE-FREEZE-2** (record `CoachingCore/r7/b/RUNTIME_FREEZE_R7B_2.json`, source digest `d2c73014…`, manifest digest `d509452e…`). Verify before and after: `node scripts/verify-r7b.mjs --freeze 2` from `CoachingCore/`.

## Question (narrow)

1. Are your blocking findings resolved on these bytes: **F1** (graduation re-entry after a restart; DECL-04 revised) and **F2** (familiar bouts only while current)? Use your reproductions (`p12`, `p13` B, `p14` A and C).
2. Are F3, F4, F5 fixed; is F7 acceptable as a recorded deviation with its owner; are F6, R18 and the ceiling-units trigger correctly routed (handoff §4)?
3. Do the fix-cycle changes that touch your scope stay inside the approved R6/B0/R7-A envelopes: graduation withdrawal on corrected evidence, the lazy start of the novice density cap, the content stage across the week wrap, one practice row per configuration per session, the class-specific quality trace, the skill/equipment disclosures? Decide the revised and new declared items (R7B-DECL-04, -05, -13 … -16).
4. Classify Engineering's escalated **QE-R7B-OBS-04**: a reason-based substitution in TAPER or RACE_WEEK introduces a never-performed configuration (B0-C05 c1 versus DR-134). State whether it blocks, and if so the narrow required change.

Areas the delta does not touch are not re-reviewed. Anything still blocking after this recheck closes R7-B NOT_READY with an explicit blocker; there is no further cycle.

## Rules

- Read-only on the repository. Your FREEZE-1 records and probe outputs are committed evidence: do not modify or overwrite anything already in `reviews/ssctr/`. Write only under `audits/domain-coaching-r7-b-2026-10-31/reviews/ssctr/recheck/` (copy a probe there and change its output path if you re-run it).
- Do not run `scripts/mutate-r7b.mjs` or any script with `--write`; never `npm run verify` or a closed `verify-r*` script. No commits, no git state changes.

## Output

- `reviews/ssctr/recheck/SSCTR_RECHECK_R7B.json`: revision R7B-SSCTR-r2 of every record (FIDELITY, NOVICE, HYBRID, TAPER, RETURN, DOSE, DECLARED), bound to the FREEZE-2 record and source digest, each with its disposition, evidence status, confidence, conditions and limitations; an r1 APPROVE_WITH_CONDITIONS record the delta does not affect may be carried forward re-bound.
- `reviews/ssctr/recheck/SSCTR_RECHECK_R7B.md`: findings resolved or not (with reproduction), new findings in the delta, the proposed human-queue entries as one JSON array of `HQ-R7B-SSCTR-*` objects for every approving r2 record (fields: queue_id, decision_id, decision_revision, target, approved_scope, conditions, approval_date, state `QUEUED_FOR_FUNDED_HUMAN_REVALIDATION`, owner, human_review null, re_review_triggers; do not edit the queue), and exactly one final line `R7B_SSCTR_GATE = ACCEPT | ACCEPT_WITH_CONDITIONS | BLOCK`.
