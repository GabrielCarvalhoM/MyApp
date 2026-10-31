# DOMAIN_COACHING_R7-B — task contract

Contract **R7B-CONTRACT-r1** · 2026-10-31 America/Sao_Paulo · branch `claude/domain-coaching-r7-b`, created from the B0 closure `c66966e041443b0043c6c01718e840604380c9b9` on `claude/domain-coaching-r7-b0` (HEAD = that commit at start; the B0 branch is not touched). Founder authority: the direct [request](FOUNDER_REQUEST.md).

## 1. Objective and boundary

Bind the approved B0 repertoire (**R7B0-CATALOG-2**, SHA-256 `ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9`) to the real Coaching Core runtime (`CoachingCore/src`), under the SSCTR r2 record conditions, so that

```text
evidence → classification → archetype → repertoire eligibility → session configuration → hybrid composition → bounded adaptation
```

is executable behaviour, proven by tests and a catalog ↔ runtime conformance matrix, frozen as a new R7-B freeze and judged by three independent gates (SSCTR, Engineering, Quality for uncovered properties only).

**IMPLEMENTATION_AUTHORIZED = SHADOW_REFERENCE_RUNTIME** (the offline synthetic Node runtime in `CoachingCore/`, as every earlier R-mission). No UI, Figma, KMP, iOS, HealthKit/WorkoutKit, backend, Growth, social/Crew, other sports, production or real-plan effect; no merge into `main` or any other branch; no change to the B0 branch.

## 2. Authority rules

1. **Catalog bytes are the specification.** The runtime loads `CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json`, verifies its SHA-256 and fails closed on any mismatch. The catalog is not edited (any byte change invalidates the SSCTR bindings). B0-F09 stays a next-catalog-revision item.
2. **SSCTR r2 conditions prevail where stricter** (`audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json`). A B0_CANDIDATE becomes usable only through its r2 record bound to the catalog hash, read at runtime like the R6 policy records. Every condition is materialized as a runtime rule, a test, or an explicit deferral with owner in the conformance matrix.
3. **R6-POLICY-5 is not changed** (`18ec48f3…`): its hash binds the R6 envelope approvals and the authority fails closed on any byte change. Numbers come from the policy by path; the run-class thresholds that are runtime constants (B0-F05) are exposed traceably with their provenance, never changed or re-invented.
4. **R7-A invariants are preserved** (QE-R7ADA-01/02, F1–F4, F4-X, R7ARA-SELF-01, D53, D56–D59, HOLD, MAINTAIN, the state model: HistoricalState ≠ PlanningProjection, released ≠ executed, A5, E1). Every new behaviour enters through the existing mechanisms (state transitions, `withContextChange`/`contextAfter`, `composeWeeks`), so the evidence reducer replays it. An existing test changes only when it asserts an R6 representation that a B0 record supersedes, recorded per test with the superseding record.
5. **Nothing outside the catalog is prescribed.** LATER_GATE / UNSUPPORTED_V1 items fall back and are disclosed as different stimuli; no new event distance (5K gets the B0-C10 PERFORMANCE fallback, not 5K support); the five optional B0 scope items are not decided.

## 3. Routing and proportionality

Impact high (what the Core prescribes), reversibility medium (own branch, synthetic shadow runtime, nothing merged), uncertainty medium–high (binding a large catalog into an intricate state machine), dependencies high (R7-A invariants). → **T3 / R2 / L3**.

| Role | Owner | Basis |
|---|---|---|
| Coordinator and implementer (worker) | current instance | request; global agent system (Chief role, worker ≠ judge) |
| Scientific gate | project SSCTR (`sports-science-concurrent-training-reviewer`), independent, after the freeze only | request §23; CLAUDE.md mandatory routing (training policy, run/strength intelligence, interference, taper) |
| Engineering gate | independent `quality-reliability-engineer`, after the freeze | request §24 |
| Quality gate | independent judge, only for properties the two others do not cover (completeness, reachability, dead/orphan repertoire, contradictions) | request §25 |
| Founder | only for a genuinely strategic choice without existing authority | request §27 |

**Bounded review** (Founder loop bound, `audits/domain-coaching-r6-2026-10-26/FOUNDER_LOOP_BOUND.md`): one review per gate on the frozen bytes; at most one narrow recheck, only for a blocker that is new, narrow and runtime-only. Anything else closes with an explicit blocker routed to the next mission; verdicts are never forced.

## 4. Allowed and prohibited changes

**Allowed:** `CoachingCore/src/**` (runtime), new tests under `CoachingCore/test/`, re-expression of existing tests that assert a superseded R6 representation (each recorded), new scripts under `CoachingCore/scripts/` (freeze/verify/conformance for R7-B), new files under `CoachingCore/r7/b/` and `audits/domain-coaching-r7-b-2026-10-31/`; insert-only blocks in `CURRENT_MISSION.md` and `MISSION_LEDGER.md`; append-only additions to the human revalidation queue with a supersession record if a gate approves new prescriptive items.

**Prohibited:** `CoachingCore/r6/PROGRAM_POLICY_R6.json`; the B0 catalog, schema and foundation; any closed mission's evidence, freeze records or review branches; `product/` and `canon/` (no navigation entry is needed before closure); running `npm run verify` or any `verify-r*` script of a closed mission (they rewrite closed evidence).

## 5. Binding design (summary)

- `src/r7b-repertoire.mjs`: catalog load + hash check, per-candidate authority from the r2 records, runtime configuration entries, run-family map, archetype derivation, run-class thresholds (B0-F05), selection order, admissible-alternative and close-variation relations, skill ladders, rotation eligibility, load-convention increments, CMP.I11 classification.
- `src/r6-catalogue.mjs` sourced from the catalog (76 configurations; B0-origin only with B0-C03).
- Strength templates: slot-contextual roles, role admissibility, MAIN subpatterns, goal-context accessory alternatives with week distribution and the calf rule, PULL coverage, HIGH-skill gating, novice density (two full templates until the first block boundary, release on executed evidence).
- Conventions (SINGLE_IMPLEMENT, BAND_TENSION, ASSISTED_BODYWEIGHT, bodyweight pull-up), per-side laterality, rotation under DR-134/B0-C06, CMP.I11 + content stage, strides optionality, familiar repeated bouts (B0-C02), graduation (B0-C01) at block-boundary reviews, ladder offers, MAIN change with a recorded reason, reason-based substitution, block-boundary summary, feasibility trace, later-gate fallbacks, archetype label, runtime guards.

## 6. Deliverables

Runtime and tests; `CoachingCore/r7/b/`: README, F01–F09 matrix, conformance matrix (catalog rule → consumer / implementation / test / deferral), handoff; `audits/domain-coaching-r7-b-2026-10-31/`: this contract, checkpoint, test-change record, evidence runs, freeze record and verification, review briefs and records, final disposition.

## 7. Stop condition

The request §29 evaluated in the final disposition; states per request §30. `V1_COACHING_AUTHORITY_READY` is never declared. Stop after the clean commit and push of this branch; R7-C is not started.
