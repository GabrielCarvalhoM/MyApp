# DOMAIN_COACHING_R7-A — task contract

**Mission:** DOMAIN_COACHING_R7-A — Semantic Core Hardening & State-Composition Stability. First of four planned phases (R7-A, R7-B, R7-C, R7-D); this contract covers **R7-A only** and never starts R7-B.
**Authority:** the direct Founder request of 2026-10-27, preserved verbatim in [FOUNDER_REQUEST.md](FOUNDER_REQUEST.md).
**Contract revision:** R7A-CONTRACT-1, 2026-10-27.

## Authorization and prohibitions

- `IMPLEMENTATION_AUTHORIZED = SHADOW_REFERENCE_ONLY`: the offline, synthetic Node 24 Coaching Core in `CoachingCore/` (runtime, tests, probes, scripts, R7-A artifacts under `CoachingCore/r7/`).
- `UI / FIGMA / KMP / PRODUCTION / REAL_USER_PLAN_EFFECTS / INTEGRATIONS / HEALTHKIT / VENDOR ADAPTERS = NO`.
- No new capability: no new training family, goal, population, modality, archetype, catalogue entry or Athlete Learning feature; no cold-start breadth work; no new holdout.
- No commit, merge or deploy (not requested).
- `product/` and `canon/` are not edited. The Coaching Core stays platform- and vendor-agnostic (DR-123): no sport rule keyed on a source label.

## R6 history is preserved

DOMAIN_COACHING_R6 is closed (`CLOSED_WITH_EXPLICIT_BLOCKER`). R7-A does not reopen it, rewrite its report, reclassify its holdout or change any of its evidence. [BASELINE.json](BASELINE.json) binds 1,007 files before the first R7-A edit: the whole `CoachingCore/` tree, `product/`, `canon/`, the closed R6 audit, the post-R6 scope record (VWS), the mission files and the human queue. The R6 closure runtime (the source SSCTR round 12 reviewed at policy `18ec48f3…`, `r6-program.mjs` `57973e97…`, never frozen) is copied byte-exact in [pre-r7a-source/](pre-r7a-source/MANIFEST.json), so every R7-A change is diffable against it.

- R7-A runtime edits land in the current `CoachingCore/src/r6-*.mjs` modules (the unfrozen runtime R6's "R7 entry" names); R6's own freezes, dossiers and outputs stay where they are.
- Historical verifiers are **never run**: `npm run verify` and every `scripts/verify-r*.mjs` rewrite closed missions' evidence. R7-A gets its own verifier.
- The R5 corpus and the R6 known and fresh holdouts are **regression** inputs only. They may be replayed to detect regressions; their first evaluations and judgments are not reclassified, and no R7-A result is presented as fresh generalization evidence.
- Mission files are insert-only: new blocks are appended to `CURRENT_MISSION.md` and `MISSION_LEDGER.md`; existing lines, including their two CRLF lines each, stay byte-identical.

## Routing (route-work, applied manually)

The global helper `agent_system.py plan` could not run: Python is not installed on this host. The routing matrix (`registry/routing.json` 1.5.0) was applied by hand; this is a recorded limitation of the executable check, not of the classification.

| Axis | Level | Evidence |
|---|---|---|
| Impact | medium | Changes prescribed strength doses and state transitions inside an offline synthetic reference; no real athlete, plan or product surface |
| Irreversibility | low | Additive, diffable against the byte-exact pre-R7A snapshot; nothing is published |
| Uncertainty | medium | The D53/D54 mechanisms are demonstrated by SSCTR probes; the sporting composition order must be derived from the current policy and checked by the SSCTR |
| Dependencies | medium | One module family (`CoachingCore`), one domain authority (SSCTR), one independent engineering judge |

**Classification:** T3 / R2 / L3 / A4, phases implementation → review. Flags: behavior, domain_logic, regression, reproducible_bug, significant_state, code_changed, independent_review. Not affected (with reason): auth, payments, permissions, sensitive_data and new_trust_boundary (synthetic offline data, no ingestion, no security boundary changes, so Security is not applicable); product_structure and visual_surface (no UX/UI); measurement and ai_material (no analytics, no model in the runtime); technical_boundary (no module boundary or contract between systems changes; the canonical input contract is consumed, not redesigned).

**Owner and graph.** The current Claude Code instance is the Chief and the runtime author (Product Engineer role). It never judges its own work. Graph: rehydration → baseline → class probes (BEFORE) → structural fix with tests → regression → candidate freeze → SSCTR narrow review (dose-changing deltas only) ∥ independent engineering review → bounded fix cycle if required → closure.

| Instance | Role | Route | Gate |
|---|---|---|---|
| Native `sports-science-concurrent-training-reviewer`, fresh | Domain judge for dose, phase, return, progression, establishment and taper semantics only | `claude-opus-5-5` (opus), effort xhigh, `material_other` | R7A_SCIENTIFIC_REVIEW |
| Fresh `quality-reliability-engineer` | Independent adversarial engineering judge | `claude-opus-5-5` (opus), effort xhigh, `material_other` | R7A_ENGINEERING_REVIEW |

Dispensed: Product/UX, UI, Research (the SSCTR owns domain evidence; no market or need hypothesis), Data (G03 and other Product/Data questions are recorded and routed, not decided), AI, Security (no trust boundary), Engineering Systems Architect (no boundary change), Integration & Release (no commit/merge/deploy).

**Engineering execution capabilities:** systematic-debugging (root cause of D53/D54 and each confirmed class), test-driven-development (each confirmed defect gets a failing test or probe before its fix), request-code-review (independent judge), verify-before-completion (always). No worktree isolation: no concurrent mission is active (no file in the tree is newer than the VWS verification of 2026-10-27 09:31 when R7-A started).

## Review-cycle bound (set at the start)

The Founder's standing rule from R6 ([FOUNDER_LOOP_BOUND](../domain-coaching-r6-2026-10-26/FOUNDER_LOOP_BOUND.md): no endless fix-and-review loops) applies from the start:
- **SSCTR:** one review of the frozen candidate, plus at most **one** narrow re-check, and only if every blocking item is new, narrow and runtime-only.
- **Engineering judge:** one review of the frozen candidate, plus at most **one** narrow re-check under the same condition.
- Anything else (the same defect failing again, a required policy text change, a needed Founder or Product decision) closes R7-A with an explicit blocker, `R7A_EXIT_READINESS = NOT_READY`, and routes the item. Borderline cases close.

## Plan

0. **Contract and baseline** (this file, BASELINE, snapshot, CHECKPOINT, insert-only mission/ledger blocks).
1. **Class probes, BEFORE.** One probe script reproduces or refutes each class below on the pre-R7A runtime and records the result. Probes are engineering instruments, not generalization evidence.
2. **Structural fixes.** Fix the cause of each demonstrated class, preferring one composition point over per-branch patches. No policy text change is intended (policy hash `18ec48f3…` stays). Refactor only where it removes a demonstrated class.
3. **Invariants and property/metamorphic tests,** each tied to a current policy clause or contract, using equivalence classes and boundary cases rather than a cartesian matrix.
4. **Regression:** the existing 443 tests, the R5 corpus replay and the R6 holdout replay (diffed against the pre-R7A runtime, every difference explained), and the probes AFTER.
5. **Candidate freeze R7A-FREEZE-1:** a manifest of `src/` and the tests, bound to the policy hash, taken before the judges start; no runtime edit while they run.
6. **Judges** (in parallel): the SSCTR narrow review of the dose-changing deltas with minimal context (rule, before, after, authority, probes, semantic diff), and the engineering judge, who tries to break the solution.
7. **Closure:** class dispositions, readiness, `R7A_FINAL_HANDOFF.md` if READY, final report, insert-only mission and ledger blocks.

## Classes to prove or discard

Initial hypotheses from reading the runtime; the probes decide.

| Id | Class (mission §6) | Hypothesis to test |
|---|---|---|
| C01 | D53: restoration after re-establishment, every state mode | The prescription and the transition decide "re-establishment" with different predicates (any mode vs. `ex.mode === 'KNOWN'`) |
| C02 | D54: re-establishment × taper / race week / post-race | The re-establishment row returns before the phase modifier |
| C03 | Early returns that skip the phase modifier (return × phase, establishment × phase) | Every early-return row of `strengthDose`, not only D54 |
| C04 | Reconstruction of the executed exposure (SSCTR R19) | The transition follows the last prescribed entry, not the executed one |
| C05 | TOTAL × PER_HAND, hidden unit conversion | Intake and external records relabel a convention without converting it |
| C06 | Source/provenance differences | Merge order or a source label changes the outcome without a sporting reason |
| C07 | Unknown treated as known | A record with unknown fields displaces a record with known ones |
| C08 | Duplicate observations | A recognized duplicate changes a prescription |
| C09 | Contradictory observations | Contradictory reports are merged by arrival order instead of quarantined |
| C10 | Historical corrections lost | Re-normalizing the carried ledger drops a correction (idempotence) |
| C11 | Inactive historical exercises altering current state | A rotated-out exercise's return step changes the dose of exercises in use |
| C12 | Bodyweight repetition restoration (CQ-R6-11) | Bodyweight reps collapse after a gated review |
| C13 | Establishment × progression | A first establishment or re-establishment takes a progression step it should not |
| C14 | Stale evidence | Stale facts influence current state |
| C15 | Unknown as zero / missing review as a negative signal (R18, CQ-R6-04) | Unreviewed weeks are credited by the projection and read as zero by the replan |
| C16 | Schedule facts persisting (CQ-R6-03) | A dated, one-day change is applied permanently |
| C17 | Early return that ignores later validation | The final validation does not check phase doses |
| C18 | Race completion semantics (CQ-R6-13) | A race finished faster than its window is recorded PARTIAL |

Each R6 HIGH finding related to structural consistency ends with one of: FIXED_R7A, PROVEN_NOT_APPLICABLE, R7B_COLD_START, R7C_LONGITUDINAL, R7D_GENERALIZATION, POST_V1, CLINICAL_OUT_OF_SCOPE.

## Readiness (R7-A only)

STATE_COMPOSITION_STABILITY, PHASE_MODIFIER_INTEGRITY, PRESCRIPTION_RECONSTRUCTION_INTEGRITY, CANONICAL_INPUT_SEMANTIC_STABILITY, R7A_ENGINEERING_REVIEW, R7A_SCIENTIFIC_REVIEW, R7A_EXIT_READINESS; each READY, READY_WITH_EXPLICIT_NONBLOCKING_GAPS or NOT_READY. No AUTONOMOUS_COACHING_READY, KMP_READY or global readiness verdict follows from R7-A. Test count is informative only.

## STOP_WHEN and ESCALATE_IF

**STOP_WHEN:** D53 and D54 are resolved (or carry a concrete external blocker); the known equivalent classes are treated or routed; the pertinent invariants are materialized and tested; old regressions pass; the pertinent SSCTR review and the independent engineering review of the candidate are complete; no known HIGH structural failure of this phase stays open. Then stop: no further coaching improvement.

**ESCALATE_IF:** a fix needs a policy text change (full SSCTR delta review of a new hash; outside this bound unless narrow), a Founder or Product/Data decision (G03, display, rotation), clinical semantics, an upstream contradiction, or the same material issue survives two fixes. Escalation closes with an explicit blocker under the cycle bound; it never invents a pass.
