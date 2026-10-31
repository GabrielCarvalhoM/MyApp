# DOMAIN_COACHING_R7-B.1 — task contract

Contract **R7B1-CONTRACT-r1** · 2026-10-31 America/Sao_Paulo · branch `claude/domain-coaching-r7-b1`, created in its own worktree from the R7-B closure `4230034d8819eb384c393a921db7eb3938c3440c` on `claude/domain-coaching-r7-b` (HEAD = that commit at start; the R7-B branch was published to the remote unchanged before this branch was created). Founder authority: the direct [request](FOUNDER_REQUEST.md).

## 1. Objective and boundary

Close the explicit R7-B blockers on the predecessor runtime **R7B-RUNTIME-REPERTOIRE-FREEZE-2** (commit `10b26d6`, source `d2c73014…`, manifest `d509452e…`, 105 bound files), freeze the result as **R7B1-FREEZE-1**, and submit it to one independent review per required gate:

| # | Id | Gate that raised it |
|---|---|---|
| B1 | QE-R7B-OBS-04 — a reason-based substitution in TAPER, RACE_WEEK or POST_EVENT brings in a never-performed exercise | SSCTR (blocking) |
| B2 | QE-R7B-R2-01 — stored proposals drop the rebuilt novice templates | Engineering (BLOCKER) |
| B3 | QE-R7B-R2-02 — the block-choice ASK drops the factual re-plan (R7-A A5 regression) | Engineering (MAJOR) |
| B4 | QE-R7B-R2-03 — the SKILL_MISMATCH fallback climbs the skill ladder after equipment loss | Engineering (MAJOR) |
| — | QE-R7B-01 / -05 residuals, re-evaluated only through the paths above | Engineering |

**IMPLEMENTATION_AUTHORIZED = SHADOW_REFERENCE_RUNTIME** (`CoachingCore/`, offline synthetic Node runtime). Not R7-B reopened, not R7-B0 reopened, not R7-C. No UI, Figma, KMP, iOS, HealthKit/WorkoutKit, backend, Growth or production effect; no merge; no change to any earlier branch.

## 2. Authority rules

1. Immutable: R7B0-CATALOG-2 (`ceee276a…`), its schema and foundation; the 13 B0 SSCTR r2 records (`6867d3e8…`); R6-POLICY-5 (`18ec48f3…`); the R7-A residual-authority freeze record; every closed mission's evidence, including R7-B's freeze records, reviews and probe outputs. A needed catalog or policy change would first have to be proven a real contradiction and would go to its own gate; none is expected.
2. The authorities the fixes follow (no new policy):
   - B1: R6-EVENT-TRANSITION condition 7 ("no new exercise, load increase or rotation" in taper and race week), B0-C05 condition 1 ("no new exercise in TAPER, RACE_WEEK or POST_EVENT"), R6-SUBSTITUTION condition 8 (a pattern without a substitute is omitted and disclosed), B0-C06 condition 8 (the clinical screen first), and the SSCTR r2 required change in `audits/domain-coaching-r7-b-2026-10-31/reviews/ssctr/recheck/SSCTR_RECHECK_R7B.md`.
   - B2: R7-A.1 C2 (the context in force travels with the program), B0-C08 (novice density), the state model (HistoricalState ≠ PlanningProjection; planned ≠ released ≠ executed).
   - B3: R7-A A5 and the residual authority closure (QE-R7ADA-01): the canonical factual state comes before any decision, and a question carries the factual re-plan (`withFactualReplan`).
   - B4: the catalog SKILL_MISMATCH rule ("the previous configuration on its skill ladder"), B0-C07 condition 1 (regression along the chain), the B0 skill ladders.
3. R7-A invariants are preserved and regression-tested: QE-R7ADA-01/02, F1–F4, F4-X, R7ARA-SELF-01, D53, D56–D59, HOLD, MAINTAIN, factual execution authority, correction/retraction authority, the return factual ceiling.

## 3. Routing and proportionality

Impact high (what the Core prescribes in event weeks, novice weeks and after corrections), reversibility medium (own branch, synthetic shadow runtime), uncertainty medium (narrow, reproduced defects in an intricate state machine), dependencies high (R7-A factual authority) → **T3 / R2 / L3**, the routing of R7-B.

| Role | Owner | Basis |
|---|---|---|
| Coordinator and implementer (worker) | current instance | request; global agent system (worker ≠ judge) |
| Scientific gate | project SSCTR (`sports-science-concurrent-training-reviewer`), independent, after the freeze | request §14; CLAUDE.md mandatory routing (substitution, taper, rules affecting prescribed training) |
| Engineering gate | independent `quality-reliability-engineer`, after the freeze | request §15 |
| Quality gate | inherited (R7-B Quality READY) when the delta does not touch its properties, with the justification recorded; otherwise one narrow independent review | request §16 |
| Founder | only for a genuinely strategic choice without existing authority | request; CLAUDE.md |

**Bounded review** (Founder loop bound, `audits/domain-coaching-r6-2026-10-26/FOUNDER_LOOP_BOUND.md`, and request §17): implementation → freeze → one review per required gate. Only a narrow blocker created by this mission's own correction may open one cycle (correction → new freeze → narrow recheck); then stop. Anything else closes with `R7B_RUNTIME_REPERTOIRE_READY = NO` and an explicit blocker. No verdict is forced.

## 4. Allowed and prohibited changes

**Allowed:** `CoachingCore/src/**` (the smallest change per blocker); new tests under `CoachingCore/test/`; an existing test changes only if it asserted the defective behaviour, each change recorded with its reason; new scripts under `CoachingCore/scripts/` for R7-B.1 (regression, mutation, conformance delta, freeze, verify); new files under `CoachingCore/r7/b1/` and `audits/domain-coaching-r7-b1-2026-10-31/`; insert-only blocks in `CURRENT_MISSION.md` and `MISSION_LEDGER.md`; append-only additions to the human revalidation queue with a supersession record if the SSCTR approves new prescriptive records.

**Prohibited:** everything in §2.1; `product/` and `canon/`; running `npm run verify` or any closed `verify-r*` script with `--write`; the backlog items of request §9 (F6, F7, R18, ceiling units, F05, F07, F09, 5K, hills, new VO2, plyometrics, Nordic, Copenhagen, loaded bodyweight); R7-C, R7-D, KMP, iOS, HealthKit, WorkoutKit, backend, Figma, Growth.

## 5. Design per blocker (finding → root cause → authority → runtime path → fix → regression test → preservation)

The full chain with evidence is kept in `CoachingCore/r7/b1/BLOCKER_CLOSURE_R7B1.md`; the design in brief:

- **B3 (R2-02).** Root cause: `evaluateProgram` returns its two block-choice questions (`src/r6-adaptation.mjs` lines 357 and 359 at FREEZE-2) without passing them through `withFactualReplan`, although the canonical factual state (factual re-plan, graduation withdrawal) is already computed. Fix: both questions are decisions like any other: a factual question keeps precedence; otherwise the block-choice ASK carries the factual proposal.
- **B2 (R2-01).** Root cause: `rebuild` builds its proposal fields without `noviceTemplates`, `finishProposal` copies no `noviceTemplates`, and the equipment change passes none, so a stored proposal keeps the intake's capped templates while its context changed. Fix: every proposal that changes the context stores that context's `noviceTemplates` (or removes them when the context has none); nothing else is copied.
- **B4 (R2-03).** Root cause: when the configuration a slot reaches through its recorded decisions is set aside and the decision's substitute no longer fits, `buildTemplates` falls back to the slot's best configuration, ranked with the higher admissible skill first. Fix: after a SKILL_MISMATCH the fallback follows the direction of its reason: a rung below the set-aside configuration on its ladder or a lower skill, never above the skill of the substitute in use; with no such configuration the slot is left unfilled and the decision that removed the equipment asks.
- **B1 (OBS-04).** Root cause: nothing in the planner applies the event-week rule to a configuration a reason-based substitution placed in a slot. Fix: in TAPER, RACE_WEEK and POST_EVENT days, a slot whose configuration comes from a reason-based substitution and has not been performed in this program uses a configuration already performed in this program (not set aside, same pattern and role, admissible skill and equipment, never above the reason's direction); otherwise the slot is left out of those sessions. The substitute starts after the post-event week with its establishment. The substitution decision discloses it; the clinical screen and the questions still come first.

## 6. Deliverables

Runtime and tests; `CoachingCore/r7/b1/`: README, blocker closure record, conformance delta, regression and mutation evidence, freeze record, verification, closure handoff; `audits/domain-coaching-r7-b1-2026-10-31/`: this contract, checkpoint, test-change record, probes, review requests and records, final disposition.

## 7. Stop condition

The request §18 evaluated in the final disposition, with the states of request §21. `V1_COACHING_AUTHORITY_READY` is never declared. Stop after the clean commit and push of this branch with the remote HEAD confirmed; R7-C is not started.
