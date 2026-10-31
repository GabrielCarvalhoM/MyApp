# R7-B review handoff — R7B-RUNTIME-REPERTOIRE-FREEZE-1

To the independent judges (SSCTR, Engineering, Quality). Judge **the frozen bytes only**; do not edit the runtime, the tests, the catalog or the policy. Bounded review (Founder loop bound, `audits/domain-coaching-r6-2026-10-26/FOUNDER_LOOP_BOUND.md`): one review per gate; at most one narrow recheck, only for a blocker that is new, narrow and runtime-only.

## 1. Identity

| | |
|---|---|
| Freeze | R7B-RUNTIME-REPERTOIRE-FREEZE-1, record [RUNTIME_FREEZE_R7B.json](RUNTIME_FREEZE_R7B.json) (source digest, manifest digest, file list, evidence) |
| Branch | `claude/domain-coaching-r7-b`, from the B0 closure `c66966e` (its runtime = R7A-RESIDUAL-AUTHORITY-FREEZE-1, `7d2da36`) |
| Policy | R6-POLICY-5 `18ec48f3…` unchanged (hash-bound; the R6 envelope records fail closed on any byte change) |
| Catalog | R7B0-CATALOG-2 `ceee276a…` unchanged, read and checked at runtime; SSCTR r2 records `audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json` |
| Verify | from `CoachingCore/`: `npm ci`; `node scripts/verify-r7b.mjs --tests` (read-only); `node --test` |

## 2. What changed (runtime)

- New `src/r7b-repertoire.mjs` (binding). `src/r6-catalogue.mjs` now serves the 76 catalog configurations (B0-origin only with B0-C03).
- `src/r6-program.mjs`: template building (`strengthTemplates` → `buildTemplates`), slot roles on rows, novice density (templates, arrangement variants, release), rotation under DR-134 (`rotationFor`), CMP.I11 inputs and the CMP.P04 content stage, strides optionality, familiar repeated bouts, graduation applied in the run transition, run-class thresholds traced, repertoire negotiation, feasibility and progression traces, cold-start summary, runtime guards in `validateWeeks`.
- `src/r6-adaptation.mjs`: repertoire authority at the review date and the program binding check; block-boundary step in the weekly review (graduation, ladder offers and steps, MAIN changes with a reason, block summary); `EXERCISE_SUBSTITUTION` review kind; no-kilogram log reading for bands/assistance; familiar-bouts lapse on any interruption; first exposures ranked on re-plans.
- `src/r6-balanced.mjs` CMP.I11; `src/r6-prescription.mjs` rows (role, laterality, ordinal levels, single implement, family `FAMILIAR_REPEATED_BOUTS`, validation guards, forbidden claims); `src/r6-intake.mjs` (SINGLE_IMPLEMENT, ordinal loads never kilograms, 5K fallback); `src/r6-composition.mjs` (novice templates travel with the context); `src/r6-simulator.mjs` (growth measured against the last full week after a consolidation week).
- Tests: 5 new suites (41 tests) and 6 recorded changes to existing tests ([TEST_CHANGES_R7B.md](../../../audits/domain-coaching-r7-b-2026-10-31/TEST_CHANGES_R7B.md)).

## 3. Evidence on the frozen bytes

Suite count and result, conformance (301 entries, PASS), differential regression against the predecessor (83 programs: running identical except the strides optional flag; every strength difference classified; 0 dose-envelope findings) and the bounded mutation probe (15 mutants; survivors documented as equivalent) are in the freeze record. They are author evidence, not a gate.

## 4. Declared interpretations (decide them; each is the stricter or the more conservative reading available)

| Id | Item |
|---|---|
| R7B-DECL-01 | B0-C01 c5: in the introduction week easy and long are held **at what was executed** (a long-run step the state took in the consolidation week is not run first now). The planned weekly total still rises because the 34-min threshold session replaces a shorter easy run (T09: 89 vs the last full week 70). No weekly-volume rule exists in the policy; none was invented. |
| R7B-DECL-02 | B0-C01 c3: any adverse or conflicted report of the week, either sport, disqualifies it; missing strength sessions do not. |
| R7B-DECL-03 | B0-C01 c6: graduation is applied by default as a proposal with the easy run as an equal alternative on the introduced session and a decline choice, not as a pure opt-in. |
| R7B-DECL-04 | B0-C01 / R7-A: graduation lives in the context from its week and is re-applied by any later transition under that context, so the evidence reducer and returns keep it; the introduction hold applies only at the introduction. |
| R7B-DECL-05 | B0-C02 c2/c3: the familiar bouts start after the two established easy weeks of the EASY_CURRENT class (never week 1); repeated adverse responses withdraw them to threshold step 0; the P07 fewer-repetition path is unused (no degradation record exists). |
| R7B-DECL-06 | B0-C08: "first strength block boundary" = the end of the first development-family block (where R6 already caps novice sets); TPL.CORE days run at practice dose in the establishment week and accessory dose after it ("practice configuration first"). |
| R7B-DECL-07 | B0-C06 c4: the cadence is counted from the program start (first block boundary on or after week 6, then six weeks after the last turn); EVERY_2_WEEKS turns on even weeks (the R6 modulo); a turn never raises the lower or eccentric class; lower-body turns never land in a session within about a day before a protected run. |
| R7B-DECL-08 | B0-C11 c4/c5: the content stage uses only "one set fewer" (never a swap), only under a RUN lead, only on non-MAIN HIGH-eccentric lower rows; first and re-establishment rows are not reduced (already at establishment dose). CMP.I11 ranks first exposures in the context of week 0 and, on re-plans, configurations not yet in use; a mid-context re-establishment (> 28 days) is not re-ranked. |
| R7B-DECL-09 | B0-C04 c5: band and assistance repetitions progress up to the top of the goal range; a row whose start target is already above it (a STRENGTH-goal accessory at 7) holds. |
| R7B-DECL-10 | B0-C03 c6 / B0-C09 c4: the bodyweight lower-stimulus disclosure is raised for load-mode goals (STRENGTH) on MAIN rows. |
| R7B-DECL-11 | B0-C05 c6: the catalog selection order (purpose before external loading) selects `bulgarian-split-squat-db` for a STRENGTH-goal lunge accessory and `db-split-squat` in running-support or event contexts (R6 origin first); witness WP-STR-04 names the Bulgarian split squat there (divergence recorded in the conformance matrix). |
| R7B-DECL-12 | B0-C10 c3: a 5K becomes a PERFORMANCE plan without event phases at intake, with the race date and time goal kept as context and the absence of 5K rules disclosed (not 5K support). |

## 5. Known limits and deferrals (owners named; none hidden)

B0-F05 policy declaration (next policy revision; values unchanged and exposed). B0-F07 implement-step availability (Product/Data). Band-level change confirmation flow and the SSCTR-R2-P07 degradation record (Product/Data logging contract). Muscle counting (G02). No derived session recovery-cost class (no consumer). B0-F09 (next catalog revision; no runtime effect, verified). EASY_UNKNOWN-started athletes have no graduation path (B0-C01 covers WALK_JOG, RESTART and EASY_LOW only). R7B-OBS-01: the R6 session-time estimate counts one side of unilateral rows. R7-C longitudinal learning, R7-D fresh generalization, PRE_KMP/PRE_TESTFLIGHT items and funded human revalidation stay as recorded in the B0 handoff.

## 6. What each gate checks

- **SSCTR** ([request](../../../audits/domain-coaching-r7-b-2026-10-31/reviews/SSCTR_REVIEW_REQUEST.md)): fidelity to the catalog and the r2 conditions, progression, regression, novice paths, hybrid interference, taper, return/recovery, dose boundaries, and the declared items.
- **Engineering** ([request](../../../audits/domain-coaching-r7-b-2026-10-31/reviews/ENGINEERING_REVIEW_REQUEST.md)): catalog/runtime conformance, state transitions, stale-state resurrection, correction/retraction, determinism, boundaries, impossible combinations, regression against R7-A.
- **Quality** ([request](../../../audits/domain-coaching-r7-b-2026-10-31/reviews/QUALITY_REVIEW_REQUEST.md)): only what the two others do not cover — completeness, reachability, dead or orphan repertoire, unreachable archetypes, contradictions.
