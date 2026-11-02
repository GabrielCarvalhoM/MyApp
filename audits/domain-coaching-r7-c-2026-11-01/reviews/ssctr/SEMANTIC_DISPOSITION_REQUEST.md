# R7-C Phase 4 — SSCTR semantic disposition request (narrow, before the freeze)

You are the project's sports-science reviewer: `sports-science-concurrent-training-reviewer`, PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY for bounded nonclinical internal sporting decisions. Clinical judgment stays CLINICAL_HUMAN_REQUIRED.

Before you start, read your constitution `governance/agents/sports-science-reviewer/CONSTITUTION.md` and your skill `.agents/skills/sports-science-review/SKILL.md`. You did not author this runtime, its fixes, its tests or its probes.

This is a **disposition of one semantic change**, requested by the Founder before four legacy tests may be updated. It is not the final gate: your narrow recheck on the frozen bytes comes later. Judge the current authorities as they stand.
- Do not change policy, catalog, canon, product, runtime or tests.
- Do not append to the human queue: list any proposed items in your record, and the closure decides.

## The question (the Founder's, verbatim)

> A authority longitudinal da V1 deve distinguir uma sessão realmente não executada de uma sessão simplesmente sem relato?

Result: `SEMANTIC_DISPOSITION = ACCEPT_R7C_UNKNOWN_SEMANTICS | KEEP_R12_UNREPORTED_AS_MISSED | NOT_READY`. Also rule on these:
- **D1**, the remaining mid-week behaviour: `BLOCKER | ACCEPTABLE_RESIDUAL | CONDITION`.
- **G02**: is learned maintenance still inside the approved envelope?
- **The four legacy tests**: is it authorized to split each fixture into UNREPORTED and KNOWN_MISS? UNREPORTED yields the typed question where the dose depends on it. KNOWN_MISS keeps the test's original invariant.

If you answer `KEEP_R12_UNREPORTED_AS_MISSED` or `NOT_READY`, the Founder's rule applies:
- no test is edited and no freeze is made;
- the conflict is recorded and Phase 4 closes NOT_READY;
- nothing else is improvised.

## Bytes

- **Branch and commits.** Branch `claude/domain-coaching-r7-c`, HEAD `39115ed`. That is the Phase 4 fixes `ec2c1e4` and `39115ed` on top of Phase 3 `5ba8738` and Phase 2 `f69abc1`, from the R7-B.2 closure `baa2cb1`.
- **Runtime delta against R7B2-FREEZE-1** (`1a1c728`): `src/r6-adaptation.mjs` (sha256 `7dda46de…c605`) and `src/r6-composition.mjs` (`2a4c47e8…b7ce`). Run `git diff 1a1c728 39115ed -- CoachingCore/src`.
- **Unchanged inputs.**
  - Policy R6-POLICY-5 (`a75be1aa…e100`) and catalog R7B0-CATALOG-2 (`ceee276a…92f9`) are byte-identical to R7B2-FREEZE-1.
  - `product/` and `canon/` are untouched since `baa2cb1`.
  - The human queue holds 230 items (`95ea4b92…99c8`).
- **Not frozen yet.** The freeze follows your disposition and the full suite.

## The earlier contract and what R7-C does instead

**SSCTR r12, weekly-review contract** (`audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.r12.json`):

> these bindings hold when every elapsed week receives a gating weekly review, in order and after its last session, with unreported sessions reviewed as missed. A week that receives no gating review keeps the projection's assumption that it was executed and logged […]; that path is outside this approval and must be closed before any use beyond the offline reference (R18).

**R7-C, exactly** (Phases 2–4, with the Founder's decision that the factual mechanism of R18, C15 and CQ-R6-04 belongs to R7-C, and G03 owns only how the athlete is asked):

1. **Gating is unchanged from r12.** An elapsed session with no report earns nothing and holds, exactly like a known miss: no credit, no regression, no adverse reading. An empty review reads exactly like no review.
2. **Where absence would be read as zero, R7-C asks.** This applies when the window has elapsed run sessions with no report at all outside a declared interruption, and one of these holds:
   - the single-run ceiling falls to the reviewed entry, because no completed run is in the 30-day window, and that trims a run the start plans (CQ-R6-04, R18 run side);
   - taper or race-window runs derived from the executed peaks (`achieved`) would change if those sessions had been run. This is P3-01: an empty peak planned EASY 15 with no touch and no quality.

   Then R7-C asks `UNREPORTED_TRAINING`, typed, with no proposal: neither the entry (zero) nor the projection (credit). A known stop keeps the policy's own answer: sessions reported not done get the reviewed entry, and a declared interruption gets its return recipe.
3. **While that question is open for the current week, no decision keeps, validates or re-plans the dependent run doses** (P3-02).
   - A KEEP or a re-plan is the same question, with no proposal.
   - A change that plans no run dose keeps its change, with the question pending (plan validity REQUIRES_RECONCILIATION). That covers strength-only changes and same-week skips or moves at the stored doses.
   - The stored projection stays in the plan, never valid: client condition O1.
4. **Record fidelity.** A report that a session was not done is MISSED, not PARTIAL. A moved session is gated on its own report.
5. **C15.** A week executed after weeks with no report re-bases (MODIFY). Its reason names only facts that hold (P3-03).

**Code.**
- `unknownRunWindow` and `peaksDecide` (`r6-composition.mjs`);
- `runGapInForce` with `heldByRunGap` (`r6-adaptation.mjs`, wired after the clinical screen in `evaluateProgram`);
- `rebaseReason`, `notDone` and `learnedMaintenance` (G02).

## What to evaluate (the Founder's list)

R18; D18; CQ-R6-04; QRE-R6-04; taper and race-week entry; longitudinal progression; safety; consistency with "unknown ≠ 0"; the cost of excessive asking; practical viability.

For "unknown ≠ 0", two authorities apply:
- AEOS §15: "Falta de dado é censura/unknown";
- DR-118, Product Truth: "Missing data stays missing: unknown, never zero, 'not done', default or inferred".

Then classify **D1**. It is pre-existing and identical between B.2 and R7-C: in H19 the third adverse key session mid-week changes nothing at once, and the clinical signal still routes to CLINICAL_HUMAN_REQUIRED. Then confirm or refute **G02** inside R6-PARTIAL-NOISY-LEARNING (r12 conditions 8 and 13; AEC §1.3).

## Boundary cases to rule on explicitly

- **B1 · Hold region.** With a completed run in the window, an unreported week holds like a reviewed miss, without asking. This is r12 gating: 76 of 148 cells of the Phase 4 grid. Is that acceptable under the distinction?
- **B2 · A known run inside the window anchors it.** There is no question. In the taper, a dimension never executed in the program, so with an empty peak, plans at the event authority's minimum. Example: easy runs at 15 with a known long run.
- **B3 · Independent changes.** They are kept with the question pending (a strength or equipment change, a same-week skip or move) rather than asked.
- **B4 · Late-week decisions.** A missed-session or underperformance report once the week is complete asks about the next week (its own question). A decision inside the gap week repeats the pending question verbatim.
- **B5 · Asking cost.** An athlete who never reports gets the same question at every decision. Cadence and wording are G03's (observation O2).

## Evidence (read what you need; anything read-only may be run)

- `audits/domain-coaching-r7-c-2026-11-01/PHASE3_CHECKPOINT.md`: the blockers, D1 and HISTORY.
- `probes/phase4-adversarial-g01.mjs` → `probes/out/adversarial-g01.R7C-P4-39115ed.json`. Grid A has 148 cells: 76 hold like a reviewed miss, 40 ask, 32 independent, 0 violations. Grid B (the P3-02 decision kinds) has 46 cells, all asked. P1: 165 questions, 0 failures.
- `probes/phase3-adversarial-g02.mjs` → `probes/out/adversarial-g02.R7C-P4-39115ed.json`: PASS, identical to Phase 3.
- `probes/phase3-suite-dispositions.mjs` → `probes/out/suite-dispositions.R7C-P4-39115ed.json` (F1–F4). With the misses reported not done, R7-C equals R7B2-FREEZE-1 bit for bit in all four.
- `probes/phase4-mutation.mjs` → `probes/out/mutation.R7C-P4-39115ed.json`. The original 18 mutants: 17 killed; G02-M4 is equivalent, because the model prunes by `maximumAgeDays` at the decision clock, and its witness is killed. Phase 4 rule mutants: 8/8 killed.
- Tests: `CoachingCore/test/r7c-longitudinal.test.mjs` and `CoachingCore/test/r7c-phase4.test.mjs`.
- Full suite at `39115ed`: 832 tests, 828 pass, 4 failures. These are the four legacy tests and nothing else:

| Test | File:line | Fixture | R7-C now |
|---|---|---|---|
| QRE-R6-04 | `test/r6-engineering-fixes.test.mjs:94` | "missed" = no report (simulator) | asks from week 4; known misses = B.2 |
| D18 | `test/r6-ssctr-revision.test.mjs:51` | a window with no report (not reviewed, and reviewed empty) | asks; known stop = entry 15, as B.2 |
| SSCTR F3 / R6-H25 | `test/r7asc-state-consumer.test.mjs:232` | no execution facts at all | the event-date step asks; known misses = B.2 |
| §19 | `test/r7b-hybrid-program.test.mjs:85` | "every week missed" = reviews with no report | week 4 asks; known misses = B.2 (block review names what held) |

- Authorities:
  - r12 (above);
  - D18 in `audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json`;
  - CQ-R6-04 in `audits/domain-coaching-r6-2026-10-26/reviews/coaching-quality-holdout-review.json`;
  - QRE-R6-04 in `audits/domain-coaching-r6-2026-10-26/reviews/quality-engineering-review.json`;
  - AEOS (`product/ADAPTIVE_ENGINE_OPERATIONAL_SPEC.md` §15), AEC (`product/ADAPTIVE_ENGINE_CONTRACT.md` §1.2–1.3) and DR-118 (`product/PRODUCT_DECISION_REGISTER.md`).

## Output

Write only under `audits/domain-coaching-r7-c-2026-11-01/reviews/ssctr/`: your probes go in `probes/sd/`.

- **`SSCTR_SEMANTIC_DISPOSITION_R7C.json`**, with these fields:
  - `revision`, `reviewer` (instance, model, effort, how it was dispatched) and `authority`;
  - `bytes` (HEAD, the two source sha256 values);
  - `semanticDisposition`, `d1` and `g02`;
  - `legacyTests[]`: id, file, authorized, and how each fixture splits;
  - `boundaryRulings` (B1–B5), `conditions[]`, `findings[]` and `proposedQueueItems[]`;
  - `humanRevalidation`.
- **`SSCTR_SEMANTIC_DISPOSITION_R7C.md`**: short, decision first.

State plainly what you could and could not verify.
