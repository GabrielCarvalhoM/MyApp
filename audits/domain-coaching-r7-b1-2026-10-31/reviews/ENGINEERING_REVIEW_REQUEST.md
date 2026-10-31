# R7-B.1 — Engineering review request (one narrow review, on R7B1-FREEZE-1)

You are an independent engineering judge (`quality-reliability-engineer`). You did not author this runtime. This is the **one review** the Founder's request allows for this gate (request §15, §17). A further cycle opens only for a narrow blocker created by R7-B.1's own correction.

## Bytes to judge

- **R7B1-FREEZE-1**: record `CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_1.json` (source digest `{SOURCE}`, manifest digest `{MANIFEST}`, freeze commit `{FREEZE_COMMIT}`). Verify read-only before and after your work, from `CoachingCore/`: `node scripts/verify-r7b1.mjs` (add `--tests` once).
- Predecessor: R7B-RUNTIME-REPERTOIRE-FREEZE-2 (`10b26d6`), judged NOT_READY in R7B-ENG-r2-RECHECK (`audits/domain-coaching-r7-b-2026-10-31/reviews/engineering/recheck/`), whose findings and probes (`n-delta`, `n7`, `n8`, the copied r1 probes) are the reproductions.
- Delta: `git diff 10b26d6 {FREEZE_COMMIT} -- CoachingCore/src CoachingCore/test`. Read `CoachingCore/r7/b1/BLOCKER_CLOSURE_R7B1.md` and the evidence the freeze record lists:
  - the timeline differential `r7/b1/REGRESSION_R7B1.json`;
  - the adversarial probes `audits/domain-coaching-r7-b1-2026-10-31/probes/`;
  - the mutation reports `r7/b1/MUTATION_*.json`;
  - the conformance reports.

## Scope (request §15)

1. **QE-R7B-R2-01:** stored proposals carry the novice templates of their context. Check the next weekly reviews after a substitution, a schedule change, an equipment change and a goal change. Check persistence of the context fields and the distinction between planned, released, executed, corrected and current program authority.
2. **QE-R7B-R2-02:** a block-choice question never drops, hides or invalidates the factual re-plan. Check every block-choice path:
   - mid-week;
   - other review kinds;
   - a complete review that does not reach the boundary step;
   - unrecognised choices;
   - stale-state resurrection after the question.
   Check R7-A A5, QE-R7ADA-01 and correction/retraction authority.
3. **QE-R7B-R2-03:** after a SKILL_MISMATCH, equipment loss never raises the skill demand. Check the fallback order (ladder rungs nearest first, then lower skill, never above the substitute in use), the question without a lower option, and the restriction to the replaced exercise's own slots (knock-on slots keep their R7-B fallback).
4. **QE-R7B-01 / -05 residuals:**
   - R2-04, the plan prescribes what the decision selects in every slot (your N5 grid);
   - R2-05, recorded as the R18 path and not changed. Judge whether that classification holds.
5. **State transitions and factual authority** on the new paths:
   - HistoricalState ≠ PlanningProjection;
   - the evidence reducer replaying the new behaviour;
   - the event-week guard reading the week's start state, and the projection semantics recorded as `projectedOnly`.
6. **Catalog/runtime binding:** catalog and records unchanged and fail-closed; the conformance delta.
7. **Relevant R7-A invariants:** QE-R7ADA-01/02, F1–F4, F4-X, R7ARA-SELF-01, D53, D56–D59, HOLD, MAINTAIN, factual execution authority, correction/retraction authority, the return factual ceiling. The 733 earlier tests pass unchanged, and the PRESERVE timelines of the differential are byte-identical to FREEZE-2. Probe where the delta could reach them.

Any new finding: severity, origin (introduced by R7-B.1 or pre-existing), reproduction, expected and actual.

## Rules

- Read-only on the repository. Write only under `audits/domain-coaching-r7-b1-2026-10-31/reviews/engineering/`. Copy a probe there and point its output there if you re-run one; re-run R7-B probes only from your own copies, never in their committed folders.
- Do **not** run `scripts/mutate-r7b.mjs`, `scripts/mutate-r7b1.mjs` or `scripts/freeze-r7b1.mjs`: they edit runtime sources in place while another judge works on the same checkout. For a mutation of your own, use a `git archive` copy in the OS temp directory. Never use `--write`, `npm run verify` or a closed `verify-r*` script with `--write`. No commits, no git state changes.

## Output

- `reviews/engineering/ENGINEERING_REVIEW_R7B1.json`: review id `R7B1-ENG-r1`, the freeze identity you verified, the status of QE-R7B-R2-01, -R2-02, -R2-03, QE-R7B-01 and -05 (RESOLVED or NOT_RESOLVED, with evidence), new findings, what holds, and the probes you ran.
- `reviews/engineering/ENGINEERING_REVIEW_R7B1.md`: a short report with exactly one final line: `R7B1_ENGINEERING_GATE = READY | NOT_READY`.
