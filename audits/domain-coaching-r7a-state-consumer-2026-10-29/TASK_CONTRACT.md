# COACHING CORE — STATE MODEL CONSUMER CLOSURE — task contract

**Mission:** COACHING CORE — STATE MODEL CONSUMER CLOSURE: history ingress, semantic PlanningView & temporal evidence. It follows the State Model Closure (HISTORICAL-PROJECTION-FREEZE-1, closed NOT_READY on both independent reviews) and is the decision that mission routed to. It is **not** R7-B0 or R7-B and never starts them.
**Authority:** the direct Founder request of 2026-10-29, preserved verbatim in [FOUNDER_REQUEST.md](FOUNDER_REQUEST.md). Its §0 decision is given and not re-discussed: KEEP `HistoricalState`, `PlanningProjection` and `PlanningView`; close only the consumers that still cross the boundary. No HistoricalState v2, provenance framework, event sourcing, temporal database, new planner or new general reducer (§4).
**Contract revision:** R7ASC-CONTRACT-1, 2026-10-29.

## Authorization and prohibitions

- `IMPLEMENTATION_AUTHORIZED = SHADOW_REFERENCE_ONLY`: the offline, synthetic Node 24 Coaching Core in `CoachingCore/` (runtime, tests, scripts, artifacts under `CoachingCore/r7/state-consumer/`).
- `UI / FIGMA / KMP / PRODUCTION / REAL_USER_PLAN_EFFECTS / INTEGRATIONS / HEALTHKIT / ANDROID / iOS / ADMIN = NO`. No B0, archetypes, pace, marathon, run or strength repertoire, hybrid patterns or athlete learning (§32). No new sporting rule: every dose rule applied is an approved one (§9, §10).
- Policy R6-POLICY-5 (`18ec48f3…`) is not changed. No commit, merge or deploy (not requested). `product/` and `canon/` are not edited.
- **Stop at the freeze** (§29): one freeze, STATE-MODEL-CONSUMER-FREEZE-1, its integrity proven, the handoff and both briefs prepared; then stop. No reviewer is dispatched, no readiness verdict is issued, `R7A_EXIT_READINESS` is not emitted (§35), the runtime is not changed after the freeze.

## Preservation (§26)

R6 and every R7-A mission, State Evidence and State Model included, are closed history. [BASELINE.json](BASELINE.json) binds 3,851 protected files before the first edit, and `state-model-freeze-source/` keeps the HISTORICAL-PROJECTION-FREEZE-1 runtime byte for byte (83 files, own MANIFEST). Earlier freezes, reviews, regressions, verdicts and verification records are never rewritten. Historical verifiers and writers are never run in write mode: `npm run verify`, `npm run simulate`, any `verify-r*.mjs --write`, and any earlier `regress-*`, `freeze-*`, `queue-*` or `prepare-*` script or evidence runner. `verify-r7asm.mjs` ran read-only for the baseline (15/16 before this mission added a file; only `reviews-not-dispatched` failing, by design now that both reviews exist); after the first edit its `freeze-current` and `baseline-preserved` checks fail by design, because this mission supersedes HISTORICAL-PROJECTION-FREEZE-1 without rewriting its record. Mission files are insert-only. Where this mission changes the meaning of an earlier test, that test is edited in place and marked `State consumer`; its HISTORICAL-PROJECTION-FREEZE-1 bytes stay in `state-model-freeze-source/`. The reviewers' probes are never edited: they are re-run from their own folders with outputs written here.

Must not regress (§26): R5, the R6 holdout, profiles, simulations, every R7-A suite, week composition, event supersession, exercise merge, interruption identity, the state at an interruption, week-start authority, the HistoricalState / PlanningProjection separation, D56, D58, D59, R40 and every blocker closed before. Must be restored: D53 and D57. Every difference needs a named cause.

## Baseline (§3), reproduced before any edit

| Check | Result |
|---|---|
| HISTORICAL-PROJECTION-FREEZE-1 | `prepare-r7asc.mjs` refuses unless all 83 bound files match the manifest: 0 drift; source digest `0db72d0edd9fd7f1382e1ed8622d29e2ff3356699da18872b0670615956e2eb8`, manifest `39b326ac…`, policy `18ec48f3…` |
| `verify-r7asm.mjs` read-only | 15/16 before any file of this mission existed (`reviews-not-dispatched`, by design); 14/16 after `prepare-r7asc.mjs` was added, the added script being the only cause (`probes/baseline/verify-r7asm.baseline-preserved.detail.out.json`) |
| `node --test` (Node v24.19.0) | 589/589 (`probes/baseline/node-test.on-state-model-freeze.out.txt`) |
| QE-R7ASM-01 | the judge's Q3, Q3b and Q12 byte-identical to `reviews/qe-r7asm-runs/` |
| QE-R7ASM-02 | Q4, Q4b byte-identical |
| QE-R7ASM-03 | Q11c, Q12 byte-identical |
| QE-R7ASM-04 | Q2, Q2b byte-identical |
| F1 | the SSCTR's restoration grid (4 shards) and caps grid (4 shards) byte-identical: B = 2 in each (`sg-ret16thu-{STRENGTH,HYPERTROPHY}-K-3-20-after3`, db-overhead-press 3 sets in week 10, largest executed since the break 1); `trace-b`, `trace-b2` byte-identical |
| F2 | the SSCTR's `reps` probe and `tick` probe byte-identical (HOLD: 82.5 kg × 3 in a 4–6 range; target raised to 6 on a HOLD) |
| F3 | the SSCTR's `trace-h25` identical except its own wall-clock `at` field (week 7 bench press 2 × 12 FROM_LOG under MAINTAIN 8–8 after 70 kg × 10) |

All outputs are in `probes/baseline/`. The seven findings match both reviewers semantically and byte for byte.

## The causes (one per finding)

| Finding | Cause |
|---|---|
| QE-R7ASM-01 | The evidence reducer sets up an exercise it does not hold from the row that prescribed it (`setUp`), a KNOWN row's load included, and takes that row's load as the adoption reference (`loggedLoadDecision`). A prescription establishes history. |
| QE-R7ASM-04 | `historicalStateOf` reads the carried record as given, superseded rows included, instead of the canonical result the runtime's normalizer gives. |
| QE-R7ASM-02 | `planningBase` takes the run from history only in mode RETURN; a LONG return is mode RESTART, read from the projection. |
| QE-R7ASM-03 | `planningExercise` takes the repetition target from the projection; in REPS_THEN_LOAD goals that target is the progression itself. |
| F2 | `earnedAt` sets the logged repetitions as the new load's target whatever the gate, so HOLD no longer repeats the dose it held. |
| F3 | After the goal change the view keeps the old goal's projected repetition target; history's executed date correctly asks for a re-establishment, and the from-log rows carry that target unclamped to MAINTAIN's 8–8. |
| F1 | A return step advances on any executed exposure: an exposure that repeated the entry dose (the plan re-based week 7 at the entry; history had credited the week-6 Friday entry) completes step 2, so three exercises finish a week early; the time fit then drops the overhead press, and D51 removes its coverage with no cap. |

## The model (Founder §5–§15)

- **A — History ingress.** A prescription never establishes HistoricalState. An exposure of an exercise history does not hold is read as an effort-guided establishment, whatever its row prescribed: no prescribed load, no adoption reference from a prescribed value (SSCTR D45, D52).
- **B — Correction boundary.** Every public reading of HistoricalState runs on the canonical record: the carried record normalized and bound by the same functions `evaluateProgram` uses (dedupe, corrections, supersession, retraction, quarantine), so the public reader and the internal reducer agree.
- **C — Semantic PlanningView.** One function resolves an exercise's dose for the planner (`resolveExercisePrescription`): ingress, the dose as a unit from EarnedProgress (load, repetitions, tick), the current goal's repetition range, never a projected step; HOLD repeats the dose of the exposure it held (DOSE-READING); the run comes from history while either reading is in a re-entry mode (RETURN or RESTART).
- **D — Temporal evidence.** Evidence counts from the instant it exists: HistoricalState through T reads only executions observed before T (the reducer's cut), the return's own week reads only what was prescribed after the return point, and a return step is credited only by an exposure executed at that step's dose.

The contract that goes with the runtime is written with it: `STATE_CONSUMER_CONTRACT.md` in this folder.

## Routing (route-work, applied manually)

Python is not installed on this host, so the global helper cannot run; `registry/routing.json` is applied by hand, as in the R7-A missions.

| Axis | Level | Evidence |
|---|---|---|
| Impact | medium | Prescribed doses, return pace and HistoricalState readers in an offline synthetic reference; no real athlete, plan or surface |
| Irreversibility | low | Additive, diffable against the byte-exact HISTORICAL-PROJECTION-FREEZE-1 copy |
| Uncertainty | medium | Consumer and boundary corrections inside a fixed model; both judges needed later |
| Dependencies | medium | One module family, one domain authority, one engineering judge |

**Classification:** T3 / R2 / L3, phase implementation → freeze. Security, Product/UX, Data and AI are not affected. **Owner:** the current Claude Code instance, Chief and runtime author (Product Engineer role); it never judges its own work. The two independent reviews (engineering; SSCTR regression-only) run in later sessions from `REVIEW_HANDOFF.md`.

## Cycle bound (§27–§29, §34)

Build → tests, properties, consumer and test-quality audits, self-challenge, mutation, regression → **one freeze, STATE-MODEL-CONSUMER-FREEZE-1** → handoff and two briefs → stop. After the reviews, only a material violation of Property A–D or a direct sporting regression F1/F2/F3/D53–D59 can block; everything else goes to the backlog (§34).

## Pre-freeze exit conditions (§27)

No freeze while any of QE-R7ASM-01..04 or F1..F3 fails on its reproduction; and only with the full suite green, properties green, a self-challenge with no known blocker, the pertinent mutation run, the consumer audit done, the correction fixtures validated, every regression difference classified, D53 and D57 restored, and D56, D58 and D59 preserved.

## STOP_WHEN and ESCALATE_IF

**STOP_WHEN:** the freeze exists, its read-only verification passes, `REVIEW_HANDOFF.md` and both briefs point at it, and the mission and ledger blocks record `CURRENT_MISSION = STATE_MODEL_CONSUMER_CLOSURE_FROZEN`, `NEXT_STEP = INDEPENDENT_REVIEWS`.

**ESCALATE_IF:** a fix needs a policy text change, a new sporting rule, a Founder or Product/Data decision beyond §0, or clinical semantics. Escalation stops before the freeze; it never invents a pass.
