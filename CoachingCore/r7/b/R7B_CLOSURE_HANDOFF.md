# R7-B closure handoff — CLOSED NOT_READY with explicit blockers (2026-10-31)

DOMAIN_COACHING_R7-B bound R7B0-CATALOG-2 to the Coaching Core runtime and closed **NOT_READY**: the one review per gate, the one fix cycle and the one narrow recheck of the Founder loop bound are spent. Start any follow-up here. Disposition: [`FINAL_DISPOSITION.json`](../../../audits/domain-coaching-r7-b-2026-10-31/FINAL_DISPOSITION.json).

```text
R7B_RUNTIME_REPERTOIRE_READY = NO
R7B_SSCTR_GATE               = BLOCK      (QE-R7B-OBS-04)
R7B_ENGINEERING_GATE         = NOT_READY  (QE-R7B-R2-01, -R2-02, -R2-03; QE-R7B-01 and -05 residuals)
R7B_QUALITY_GATE             = READY
V1_COACHING_AUTHORITY_READY  = NO (not declared)
```

## Runtime to start from

**R7B-RUNTIME-REPERTOIRE-FREEZE-2** — record [RUNTIME_FREEZE_R7B_2.json](RUNTIME_FREEZE_R7B_2.json), commit `10b26d6` (bytes of `d03025b`), source `d2c730140973c9037de8729387012f830204072053729fbf9bdebf1bc5fe7241`, manifest `d509452e4ad2aa98bce2889bd723c0faa22d2394aa5630d9f5a56588c9e6c23a`. Verify with `node scripts/verify-r7b.mjs --freeze 2 [--tests]` (read-only). FREEZE-1 (`4995d58`) is superseded and verifies only at its own commit. Policy, catalog, schema and the B0 r2 records are unchanged; R7-B adds no dose.

## Explicit blockers (first in the next mission)

| # | Id | Gate | Required change (from the judge) | Evidence |
|---|---|---|---|---|
| 1 | QE-R7B-OBS-04 | SSCTR (blocking) | In TAPER, RACE_WEEK and POST_EVENT weeks a reason-based substitution selects only a configuration already performed in this program and not set aside, same pattern and role; otherwise omit the exercise for those weeks with a disclosure (R6-SUBSTITUTION C8) or keep it; the substitute starts after POST_EVENT with effort-guided establishment; clinical screen and ASK first. | `reviews/ssctr/recheck/` (`r06`) |
| 2 | QE-R7B-R2-01 | Engineering (BLOCKER; pre-existing since FREEZE-1) | Store the context's `noviceTemplates` in every proposal (`rebuild` fields, `finishProposal`, the equipment change): today later decisions compose capped weeks from the intake templates, which reverts a capped novice's substitution, loses a cap started by a schedule change (SSCTR F9) and makes the next review UNSUPPORTED after a switch to kettlebell only. | `reviews/engineering/recheck/probes/n7-novice-templates.mjs`, `n8-labels.mjs` |
| 3 | QE-R7B-R2-02 | Engineering (MAJOR; introduced by the fix cycle) | Compute the canonical factual state (factual re-plan, graduation withdrawal) before the block-choice checks in `evaluateProgram` and carry its proposal in the ASK (R7-A A5). | `n-delta.mjs` (N1, N1b) |
| 4 | QE-R7B-R2-03 | Engineering (MAJOR) | When a SKILL_MISMATCH substitute stops fitting, the fallback for the set-aside configuration goes down (lower skill, previous rung), never to the next rung; otherwise ASK. | `n-delta.mjs` (N3) |
| 5 | QE-R7B-01 / -05 | Engineering (residuals) | Resolved through 2–4, with plan-level tests that run later weekly reviews, not only the deciding review. | `ENGINEERING_RECHECK_R7B.md` |

The minors and observations with owners (QE-R7B-R2-04, -R2-05, -R2-OBS-01; SSCTR F6–F10; R18; ceiling units; Q-R7B-R1/R2; Q-R7B-03/04/06/08–11; QE-R7B-OBS-01…03, 05) are listed in the disposition and in [CONFORMANCE_R7B.json](CONFORMANCE_R7B.json) (`fixCycle`).

## What holds (judged)

- Quality READY: the bound repertoire is complete and reachable (run families 10/10, configurations 74/76 with `back-extension` and `hip-hinge-practice` routed to the catalog, templates 7/7, archetypes 5/5), no unrecorded contradiction.
- SSCTR r2: NOVICE, HYBRID, TAPER (planned taper; event-week substitutions excluded until #1), RETURN, DOSE and DECLARED are APPROVE_WITH_CONDITIONS, queued for funded human revalidation (queue 217 → 223, append-only); FIDELITY is REVISE on #1. F1–F5 resolved; dose sweep clean (195 programs, 30 reviewed timelines).
- Engineering: QE-R7B-02, -03, -04, -06 … -12 resolved; R7-A invariants (HOLD, D52/E1, no load transfer), determinism, catalog fail-closed, no kilograms on bands, quality gates and the bouts lapse hold.

## Next mission

A narrow runtime closure on FREEZE-2 (proposed DOMAIN_COACHING_R7-B.1): blockers 1–5 first, then the owned minors; a new freeze; one review per gate. It needs its own Founder authorization. R7-C is not started.
