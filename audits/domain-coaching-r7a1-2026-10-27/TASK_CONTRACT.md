# DOMAIN_COACHING_R7-A.1 — task contract

**Mission:** DOMAIN_COACHING_R7-A.1 — Weekly Composition Closure, a blocker-only continuation of R7-A. It is **not** R7-B and never starts it.
**Authority:** the direct Founder request of 2026-10-27, preserved verbatim in [FOUNDER_REQUEST.md](FOUNDER_REQUEST.md).
**Contract revision:** R7A1-CONTRACT-1, 2026-10-27.

## Authorization and prohibitions

- `IMPLEMENTATION_AUTHORIZED = SHADOW_REFERENCE_ONLY`: the offline, synthetic Node 24 Coaching Core in `CoachingCore/` (runtime, tests, probes, scripts, R7-A.1 artifacts under `CoachingCore/r7/a1/`).
- `UI / FIGMA / KMP / PRODUCTION / REAL_USER_PLAN_EFFECTS / INTEGRATIONS / HEALTHKIT / ANDROID / VENDOR ADAPTERS / iOS = NO`.
- No new capability: no cold start, catalogue, profiles, learning, programming, modality, heuristic, goal or progression; no holdout work; no BEST_SUPPORTED work.
- Policy text `18ec48f3…` is not changed. No sporting rule is invented to answer an engineering question; sporting content goes to the SSCTR.
- No commit, merge or deploy (not requested). `product/` and `canon/` are not edited. The Core stays platform- and vendor-agnostic (DR-120–123).

## Preservation

R6 and R7-A are closed history. [BASELINE.json](BASELINE.json) binds 1,266 files before the first R7-A.1 edit (the whole `CoachingCore/` tree including R6 and R7-A artifacts and both R7-A freezes, `product/`, `canon/`, the closed R6 and R7-A audits, the VWS record, the mission files, the human queue). The R7A-FREEZE-2 runtime is copied byte-exact in [freeze2-source/](freeze2-source/MANIFEST.json).
- R7-A.1 runtime edits land in the current `CoachingCore/src/` modules; R7-A's freezes, reviews, regression files and verifier outputs are never rewritten.
- Historical verifiers and writers are **never run**: `npm run verify`, `npm run simulate`, every `scripts/verify-r*.mjs` of an earlier mission and `scripts/regress-r7a.mjs` (it writes `r7/REGRESSION_R7A.json`). R7-A.1 has its own regression and verifier, writing only under `CoachingCore/r7/a1/`.
- The R5 corpus, the R6 holdout, profiles and simulations are **regression** inputs only.
- Mission files are insert-only: new blocks are appended; existing lines stay byte-identical.

## Starting blockers and the class they belong to

The seven R7-A blockers: QE-R7A-01 (HIGH), QE-R7A-03 (HIGH), QE-R7A-19 (HIGH per the Founder), QE-R7A-02, QE-R7A-05, QE-R7A-12, D56 (SSCTR; keeps D53 open). Reproduced on the R7A-FREEZE-2 snapshot by the judges' own probes (byte-identical outputs).

Before any edit the author searched for equivalent paths and confirmed ten more on R7A-FREEZE-2 (`probes/r7a1-composition-probes.mjs`, BEFORE output): every one is a handler rebuilding the week from a different subset of the state.

| Mechanism | Blockers | Equivalent paths found |
|---|---|---|
| The start of next week a decision of this week already set is re-derived | 01, 03 | E06 (SSCTR O-1/R28: review, then equipment change) |
| Same-week row adaptations are lost when the week is re-projected | 19 | E01 (short return, then review), E03 (fatigue, then equipment), E04 (unavailable day, then equipment) |
| Context stated from a later week or date is applied earlier | — | E02 (dated schedule, then review), E11, E12, E13, E14 |
| A dose planned before a return reaches the re-entry | 02 | E10 (missed pre-break session moved into the re-entry) |
| Fit-blind whole-week reading of the caps | D56 (D53 family) | — |
| Observation read as target / unknown displacing known | 12, 05 | — |

## Routing (route-work, applied manually)

The global helper could not run: Python is not installed on this host (as in R7-A). The routing matrix (`registry/routing.json` 1.5.0) was applied by hand.

| Axis | Level | Evidence |
|---|---|---|
| Impact | medium | Prescribed doses and state transitions in an offline synthetic reference; no real athlete, plan or surface |
| Irreversibility | low | Additive, diffable against the byte-exact FREEZE-2 snapshot |
| Uncertainty | medium | Mechanisms reproduced; the composition model and the D56 formulation need the judges |
| Dependencies | medium | One module family, one domain authority, one engineering judge |

**Classification:** T3 / R2 / L3 / A4, phases implementation → review. Flags: behavior, domain_logic, regression, reproducible_bug, significant_state, code_changed, independent_review. Not affected: auth, payments, permissions, sensitive data, trust boundary (Security not applicable); product structure and visual surface; measurement and AI material; no boundary between systems changes (a new internal module is not a system boundary).

**Owner and graph.** The current Claude Code instance is the Chief and the runtime author (Product Engineer role); it never judges its own work. Graph: rehydration → baseline → equivalent-path probes (BEFORE) → composition contract → structural fix with tests → regression → FREEZE-A1 → engineering review ∥ SSCTR review → one correction cycle (material findings only) → FREEZE-A2 → one narrow re-check → closure.

| Instance | Role | Route | Gate |
|---|---|---|---|
| Fresh `quality-reliability-engineer` | Independent adversarial engineering judge: hunts for other equivalent paths | `claude-opus-5-5`, effort xhigh | R7A1_ENGINEERING_REVIEW |
| Fresh default instance explicitly loading `.claude/agents/sports-science-concurrent-training-reviewer.md`, the SSCTR constitution 1.0.0 and `.agents/skills/sports-science-review/SKILL.md` | Domain judge for the sporting items only (QE-R7A-02, QE-R7A-12 dose reading, D56/D53, E10 and any return/recovery/progression rule touched) | `claude-opus-5-5`, effort xhigh | R7A1_SCIENTIFIC_REVIEW |

The native SSCTR agent type is not exposed in this session's agent list; the documented fallback is used and labelled as such. Merge and provenance items without sporting effect (QE-R7A-05) are not sent to the SSCTR.

## Cycle bound (set at the start)

Build (one implementation phase) → **R7A1-FREEZE-A1** → both reviews → **one** correction cycle with material review findings only → **R7A1-FREEZE-A2** → **one** narrow re-check by each judge → stop. Any material blocker left after that closes the mission `R7A1_EXIT_READINESS = NOT_READY` with the blocker named; no third cycle.

## Acceptance and readiness

READY only if QE-R7A-01, 02, 03, 05, 12, 19, D56 and D53 are CLOSED; one composition semantics is demonstrated across handlers; R5, R6 and R7-A regressions are preserved (every difference named); no material mutation of the class survives undetected or unjustified; Engineering = ACCEPT and SSCTR = ACCEPT on the **same** freeze; zero new HIGH blockers of R7-A. Verdicts: WEEK_COMPOSITION_INTEGRITY, STATE_PRESERVATION_INTEGRITY, EVENT_SUPERSESSION_INTEGRITY, EXERCISE_MERGE_INTEGRITY, RETURN_RECOVERY_CEILING_INTEGRITY, R7A1_ENGINEERING_REVIEW, R7A1_SCIENTIFIC_REVIEW, R7A_EXIT_READINESS. `CoachingCore/r7/R7A_FINAL_HANDOFF.md` only if R7A_EXIT_READINESS = READY.

## STOP_WHEN and ESCALATE_IF

**STOP_WHEN:** the acceptance above holds after the re-check, or the cycle bound is used. Then stop; R7-B is never started.

**ESCALATE_IF:** a fix needs a policy text change, a Founder or Product/Data decision, clinical semantics, or the same material issue survives the correction cycle. Escalation closes with an explicit blocker; it never invents a pass.
