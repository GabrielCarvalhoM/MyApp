# V1 Coaching Repertoire Foundation — R7-B0 specification

Revision **R7B0-SPEC-2** · 2026-10-31 · mission DOMAIN_COACHING_R7-B0 · catalog [`REPERTOIRE_CATALOG_B0.json`](REPERTOIRE_CATALOG_B0.json) `R7B0-CATALOG-2` · schema [`REPERTOIRE_CATALOG_B0.schema.json`](REPERTOIRE_CATALOG_B0.schema.json) · gaps [`GAP_CLOSURE_B0.md`](GAP_CLOSURE_B0.md).

**Status: SPECIFICATION CANDIDATE.** Not Product Truth, not runtime authority. `RUNTIME_IMPLEMENTATION_READY = NO`, `V1_COACHING_AUTHORITY_READY = NO`. The disposition of each B0 candidate is the SSCTR's and is recorded in `audits/domain-coaching-r7-b0-2026-10-31/`. Nothing here changes R6-POLICY-5 (`18ec48f3…`), the R7-A freeze or the R7-A contracts.

## 1. What B0 is

The future Coaching Core must **classify → select an admissible repertoire → parameterize → compose the hybrid week → adapt inside envelopes**, never invent a plan from first principles. B0 makes that repertoire explicit. Its intelligence is in classification, selection, parameterization, composition and declared trade-offs; it is deliberately not combinatorially free.

Authority split (unchanged, [R4](../../r4/SSCTR_AUTHORITY_REFINEMENT.md); R6 policy `authoritySplit`): sports science approves reusable envelopes; Coaching Intelligence selects concrete sessions inside them with a traceable reason; a generated workout inside an approved envelope needs no paper of its own; out-of-envelope output fails closed.

Every entry in the catalog carries an **authority status**:

| Status | Meaning | Count in R7B0-CATALOG-1 |
|---|---|---|
| APPROVED_ENVELOPE | Explicit representation of an R6 boundary approved APPROVE_WITH_CONDITIONS at the policy hash (`ssctr-policy-review.r12.json`); all its conditions apply | 9 of 10 run families; 39 R6 strength configurations; templates, substitution, composition matrix CMP.I01–I10, trajectories |
| APPROVED_FAMILIAR_PATH | Exact SSCTR-R2-P01/P07/P08/P09/P14 familiar-task reuse | attached to run families |
| APPROVED_PRODUCT_DECISION | DR-99, DR-112–115, DR-120–123, DR-134 structure | safety, placement, rotation structure |
| B0_CANDIDATE | New B0 content with prescriptive impact; usable only after SSCTR approval for this catalog hash | 12 candidates (B0-C01…C12), incl. 37 new strength configurations |
| LATER_GATE / UNSUPPORTED_V1 | Outside the V1 repertoire now, with a named fallback | 20 items |

Each rule is also labelled **EVIDENCE** (rests on reviewed science), **PRODUCT_POLICY** (rests on a PDR decision) or **IMPLEMENTATION_CHOICE** (reversible operational value inside an envelope, never a physiological law).

## 2. Parameterization model

Four levels, never mixed (catalog `parameterModel`; schema `$defs`):

1. **SESSION_FAMILY** — a training purpose with its own eligibility, boundaries, progression dimension, composition class and safety boundary (`RUN.THRESHOLD`, `STR.LOWER`).
2. **SESSION_CONFIGURATION** — a structural template with typed parameter slots and an admissible domain that is a policy ladder or range (`RUNCFG.THRESHOLD_INTERVALS` = warm-up + repeat(N)[work, recovery] + cool-down over `policy:operational.run.thresholdLadder`). Strength: a session template (`TPL.LOWER`) with ordered slots, and exercise configurations (exercise + implement + convention, e.g. `goblet-squat`).
3. **DOSE** — values for one session (`$defs/runDose`, `$defs/strengthRowDose`), every value with unit, provenance (policy path, ladder index, familiar recipe or executed fact) and class PRESCRIBED / ESTIMATED / EXECUTED. Unknown stays null with a reason; there is no population default.
4. **PROGRESSION_STATE** — per athlete × run dimension or exercise configuration (`$defs/progressionState`): mode, ladder index or reference load and sets, ceilings, last gate, executed counters. Written only by executed evidence through the R7-A state model; a prescription never writes it; each decision reads its own PlanningView.

So "4 × 5 min threshold" is family `RUN.THRESHOLD` + configuration `RUNCFG.THRESHOLD_INTERVALS` + dose ladder index 1 + the athlete's `thresholdStep`; there is no "4x5 workout type". The validator instantiates one run dose, one strength row and one progression state against the schema and checks that an invalid row is rejected (V01).

Canonical units are minutes, seconds, kilograms, repetitions and RIR; pace/speed, pounds and locale formats are display (DR-103, DR-114). A pound value is converted at the boundary under `policy:operational.strength.loadUnits`.

## 3. Running repertoire

Ten families (`run.families`). Composition class follows the frozen runtime: KEY runs are protected; EASY runs carry little run-axis cost; walks carry none.

| Family | Class | Configuration(s) | Purpose and V1 role | Authority |
|---|---|---|---|---|
| `RUN.WALK` | NONE | WALK_CONTINUOUS | Keeps a chosen day without running load; converts to easy at block starts | R6-COLD-START, R6-PLANNED-PROGRESSION |
| `RUN.WALK_JOG` | EASY | WALK_JOG_INTERVALS (9-step ladder) | Zero/unknown/below-minimum running → continuous running; ≤ 3 exposures/week | R6 envelopes; R2-P01; R7-A E1 ceiling |
| `RUN.EASY` | EASY | EASY_CONTINUOUS, SHAKEOUT | Base aerobic running and the vehicle for entry, restart, return, recovery (post-event), taper and race-window doses | R6 envelopes; R2-P09 |
| `RUN.LONG` | KEY | LONG_CONTINUOUS | Prolonged easy run on the chosen long-run day, target per goal/event | R6 envelopes; R2-P08; DR-112 |
| `RUN.STRIDES` | EASY (component) | STRIDES_SET | Relaxed fast strides after an easy run, never a sprint | R6-RUN-QUALITY; R2-P14 |
| `RUN.THRESHOLD` | KEY | THRESHOLD_INTERVALS (6-step ladder) | V1 threshold/tempo family: repeated controlled-hard blocks | R6-RUN-QUALITY; R2-P14, R2-P07 |
| `RUN.EVENT_SPECIFIC` | KEY | TEN_K_SPECIFIC_INTERVALS, HALF_MARATHON_SPECIFIC_INTERVALS | 10K: the V1 interval family at 10K effort. HM: sustained steady-hard blocks | R6-RUN-QUALITY, R6-EVENT-TRANSITION |
| `RUN.RACE_TOUCH` | KEY | RACE_TOUCH_INTERVALS | One brief race-effort touch in the race window | R6-EVENT-TRANSITION |
| `RUN.RACE` | KEY | RACE_EFFORT, RACE_COMPLETION | The athlete's race; completion with walk breaks when the build did not reach continuous running | R6-EVENT-TRANSITION |
| `RUN.FAMILIAR_REPEATED_BOUTS` | KEY | FAMILIAR_REPEATED_BOUTS | The only V1 VO2-oriented path: continue an exact current familiar harder task at its familiar field target; no de novo introduction, no progression | **B0-C02** over R2-P14/P07 |

Each family states purpose, positive and negative eligibility, progression dimension and rule, regression, recovery cost, phase rules, relations and authority. The mission's list maps as follows: easy → `RUN.EASY`; **recovery** → `RUN.EASY` purpose RECOVERY_POST_EVENT and `RUN.WALK` (a recovery run is a purpose, not a validated physiological zone, ACF-G05); long run → `RUN.LONG`; **steady** → covered for events by the half-marathon blocks, generic steady is LATER_GATE; threshold/tempo → `RUN.THRESHOLD` (continuous tempo LATER_GATE); intervalado → 10K-specific ladder; VO2-oriented → familiar path only; strides → component; hills → terrain context only, hill repeats LATER_GATE; walk/jog and return → `RUN.WALK_JOG` and the return modes; race-specific → `RUN.EVENT_SPECIFIC`, `RUN.RACE_TOUCH`; taper → phase rules; event-distance specialization → 10K and half marathon only.

**Quality gates.** Every quality family (threshold, event-specific, familiar repeated bouts) also carries all gates of the frozen runtime (`qualityAllowed`): run goal RACE or PERFORMANCE (a supported event implies RACE), at least three chosen run days, a BUILD, DEVELOPMENT, SPECIFIC or NEXT_BLOCK context (a consolidation week takes the context of the development phase before it) and R6-RUN-QUALITY enabled. A GENERAL or REGULAR runner, or a week with fewer than three chosen run days, gets no quality session.

**Intensity.** Effort cues (talk test, perceived effort) are the default for every family; the first exposure to each intensity family is a calibration. A pace target is admissible only as the athlete's current **familiar field-session target** for the exact same task (SSCTR-R2-P14: not LT2, CS, MLSS or race pace; no transfer to another family). Pace from a time goal or from easy pace is never admissible.

**Modes** (`run.modes`): NONE, WALK_JOG, RESTART, EASY, RETURN. Modes are progression states, not families: RESTART and RETURN produce easy-family sessions with their own dose rules.

**Not in the V1 run repertoire** (`laterGate`, B0-C10): generic steady, continuous tempo, de novo VO2 work, hill repeats, short intervals/speed, fartlek/progression runs, fitness tests/time trials, de novo pace zones, multi-week taper, 5K events; marathon/ultra are UNSUPPORTED_V1. Each has a fallback inside the repertoire. None is filled by intuition.

## 4. Strength repertoire

### 4.1 Configurations and metadata

76 configurations (`strength.configurations`): the 39 frozen R6 entries with their ids and selection fields unchanged, plus 37 B0 candidates (B0-C03). Fourteen slot patterns: SQUAT, HINGE, LUNGE, CALF, PUSH, PULL, TRUNK (R6) and the isolation/capacity patterns KNEE_FLEXION, KNEE_EXTENSION, HIP_ABDUCTION, ANKLE_DORSIFLEXION, ELBOW_FLEXION, ELBOW_EXTENSION, SHOULDER_ABDUCTION. Subpatterns distinguish horizontal/vertical push and pull, scapular work, hinge vs bridge, split-stance/step/lateral lunges, straight- vs bent-knee calf raises and the three anti-movement trunk directions.

Each configuration states identity, pattern/subpattern, region, equipment (all-of), loading and **load convention**, laterality, **skill, lower-body, axial and eccentric demand**, **primary and secondary muscles**, kind (compound, isolation, stability, practice), **admissible roles**, purposes (strength development, hypertrophy, running support, durability/capacity, general, skill practice), variant family and origin. Representation differences from the R6 runtime are declared in `r6Delta` (B0-F01, F02): single-implement configurations (goblet squats, kettlebell deadlift, dumbbell hip thrust, one-arm row) use **SINGLE_IMPLEMENT** instead of PER_HAND (JUDGE-CQ-R6-07); band resistance is **BAND_TENSION**, an ordinal level, never kilograms; band-assisted pull-ups use **ASSISTED_BODYWEIGHT**; the pull-up is bodyweight.

Demand classes are **ordinal priors** for comparing alternatives and placing sessions. They depend on dose, athlete and evidence; they are never a fatigue measurement, a recovery timer or an additive score (STIL §§5/7, SIS §5). The session recovery-cost class is derived: HIGH if any row is HEAVY lower after the R6 dose adjustment or axial HIGH; MODERATE if any row is MODERATE lower, axial MODERATE or eccentric HIGH; otherwise LOW. Muscle counting (IMPLEMENTATION_CHOICE pending G02): working sets count once per primary muscle, secondaries are listed and not counted, unilateral sets count once per side, preparation sets never count (SIL-I5).

### 4.2 Session families and templates

Session families STR.FULL_BODY, STR.LOWER, STR.UPPER and STR.TRUNK_CALF, built from the frozen R6 templates by number of chosen strength days (1: FULL_A; 2: FULL_A+FULL_B; 3: LOWER, UPPER, FULL_B; 4: LOWER, UPPER, LOWER_B, UPPER_B; extra days: CORE). Slot patterns and roles are R6's. B0 adds (B0-C05):

- **subpattern constraints** on MAIN slots (a MAIN pull is horizontal or vertical, never scapular);
- **goal-context accessory alternatives**: HYPERTROPHY may fill accessory slots with knee flexion/extension, elbow flexion/extension or lateral raises; RUNNING_SUPPORT and event athletes alternate straight- and bent-knee calf work across the week and may use hip abduction or tibialis work in a trunk slot. An alternative pattern without an admissible configuration on that equipment is skipped and the slot keeps its base pattern;
- a configuration is used **at most once per session** (R6), and a deterministic **selection order** replaces the bare alphabetical tie-break of the larger catalog: familiar → already established → purpose matching the goal context → the pattern's default subpattern → external loading → higher admissible skill → R6-origin → id (IMPLEMENTATION_CHOICE, no dose or admissibility effect);
- doses are unchanged: goal doses, rest and preparation by role and the R6 strength candidate rules; **B0 adds no dose**.

### 4.3 Contextual roles (DR-134)

The role of a selected configuration is **the role of the slot it fills in this program context**; a configuration may fill a slot only if its `roles` admit that role. The same exercise can be MAIN in one program and ACCESSORY in another (`db-split-squat` is the MAIN of `TPL.LOWER_B` and an accessory elsewhere); practice configurations admit only PRACTICE. There is no universal role by exercise name and no fourth role: running-specific strengthening is a **purpose**, close variation is a **relation**.

### 4.4 Rotation eligibility (DR-134 operational mapping, B0-C06)

| Preference | MAIN | ACCESSORY | PRACTICE |
|---|---|---|---|
| COACH_DECIDES / EVERY_6_WEEKS | BLOCK_BOUNDARY_ELIGIBLE | BLOCK_BOUNDARY_ELIGIBLE | REASON_ONLY |
| EVERY_2_WEEKS | BLOCK_BOUNDARY_ELIGIBLE | TWO_WEEK_ELIGIBLE when an admissible alternative exists, else BLOCK_BOUNDARY_ELIGIBLE | REASON_ONLY |
| FIXED | REASON_ONLY | REASON_ONLY | REASON_ONLY |

ESTABLISHMENT, SPECIFIC, TAPER, RACE_WEEK and POST_EVENT make every role REASON_ONLY. An **admissible alternative** keeps the slot pattern and the subpattern (or a subpattern of the same rotation group: split-stance ↔ step), shares a primary muscle, stays within one step on lower, axial and eccentric demand, fits equipment and skill, admits the slot role, does not worsen the week's arrangement cost, and is not the configuration used in the previous rotation when another exists. Rotation is permitted, never mandatory. A rotated exercise is established by effort with no load transferred and no progression in its first exposure (R6-ROTATION). On six reference equipment profiles, 92 of 96 accessory slots have an admissible two-week alternative; the other 4 (the second pull accessory on dumbbell-, kettlebell-, band- or bodyweight-only profiles) keep block-boundary eligibility (V06).

**MAIN at a block boundary** (extends R6's "main lifts stay"): default keep; change only with a recorded reason — deliberate block transition with its purpose, skill progression through the ladders with agency, equipment change, athlete preference — never in the deferred phases; the new MAIN is established by effort with no load transfer. A configuration serving MAIN cannot evade this by being called a close variation.

**Close variation** is directed (`closeVariationRule`): B is a close variation of A when they share pattern, subpattern and a primary muscle, B's skill is not higher, and the demand classes are within one step. It ranks admissible replacements; it confers no permission by itself. The catalog yields 187 directed edges, 51 one-way only (V07).

### 4.5 Substitution, skill ladders and coverage

- **Reason-based substitution overrides cadence**, MAIN retention and FIXED, never coverage, safety, clinical limits or agency (`strength.substitution`). Reasons: equipment unavailable (R6-SUBSTITUTION, dated windows), skill mismatch (previous ladder step), nonclinical discomfort or preference **only after the clinical screen** (pain, injury, illness or functional limitation route to a qualified human; ambiguous is ASK), protected-run conflict, deliberate block transition. Stagnation has no invented plateau threshold (LATER_GATE, R7-B). Ranking: familiar → close variation → same subpattern → same pattern; a bodyweight-for-load swap is disclosed as a different stimulus; no load conversion.
- **Skill ladders** (B0-C07): practice configurations per compound pattern and progression chains (sit-to-stand → box squat → goblet squat → back squat; hinge practice → kettlebell deadlift → dumbbell RDL → barbell RDL; wall → incline → full push-up; prone row practice → band/dumbbell rows; scapular pull-up → band-assisted pull-up → pull-up/chin-up; …). A progression is offered at a block boundary with agency after ADVANCE/EARNED final exposures; the new configuration is established by effort. HIGH skill stays familiarity-gated unless reached through the ladder.
- **Coverage**: every MAIN squat, hinge, lunge and push slot has an admissible configuration on all nine equipment profiles for novices and intermediates; an accessory slot left without a distinct option (a novice's second push accessory without equipment) is dropped and disclosed, as in R6. Every session with pull slots carries a pull row; PULL is never silently empty (B0-C09, JUDGE-CQ-R6-12): kettlebell-only gets `kb-row`, bands get rows and pulldowns, bodyweight-only gets low-load scapular work as ACCESSORY with the disclosure PULL_LIMITED_FOR_EQUIPMENT, a pull-up bar alone gives novices scapular pull-ups; the disclosure is computed from the rows actually selected (V05).
- **Novice density** (B0-C08, JUDGE-CQ-R6-10): strength class NONE gets at most two full templates per week until the first block boundary; further chosen strength days carry TPL.CORE as lower-demand by design, with the non-blocking negotiation STRENGTH_DAYS_ABOVE_CURRENT_PRACTICE (DR-112: more days spread the load).

## 5. Hybrid week composition

Composition is a **constrained admissibility problem** with ordinal costs, not a fixed run-first or strength-first priority (`composition`).

- **Session classes.** Run: KEY / EASY / NONE by family. Strength: the maximum lower-body demand of its rows after the R6 dose adjustment (a HEAVY configuration under the heavy-set minimum counts MODERATE; calf rows count at most LIGHT). A strength session is key when heavy with a MAIN squat or hinge.
- **Interference relations** CMP.I01–I10 reproduce the frozen runtime exactly (V12 runs each case through the read-only `interferenceCosts`): lower-body strength within 72 h before the race → HIGH run cost; heavy lower within ~30 h before a key run → MODERATE, within ~54 h → LOW; moderate lower within ~30 h before a key run → LOW; a key run shortly (≤ 6 h) before heavy lower → MODERATE strength cost, within ~30 h → LOW; a key run shortly before moderate lower → LOW; an easy run shortly before moderate/heavy lower when strength develops → LOW; two key runs within ~30 h → MODERATE; two heavy lower sessions within 48 h → MODERATE. Upper-body and trunk work carry no run-axis cost. **CMP.I11** (B0-C11, SIS §5 / DR-112 under SSCTR OB-2): HIGH-eccentric or first/re-establishment lower-body work within ~30 h before the long run or a quality run adds a LOW run cost.
- **AM/PM.** Shifts map to policy turn hours (AM 7, PM 18), so the same matrix covers same-session (≤ 6 h), "earlier the same day" and next-day pairs. Example (WP-HYB-01): run-led, quality on Tuesday AM — heavy legs on Tuesday PM costs LOW on the strength axis, on Monday PM it costs MODERATE on the run axis.
- **Protected stimuli** by lead: RUN protects the long run and the week's quality session (strength keeps its essential stimulus, never removed near events); STRENGTH protects key strength sessions (running keeps easy participation; the long run's content may yield); JOINT protects both and asks once on a genuine equal-harm trade-off.
- **Placement rules** CMP.P01–P09: chosen days and shifts are hard constraints (DR-112); same-shift pairs are back-to-back, confirmed, key session first by lead; one quality session a week, not next to the long run when another day can hold it; heavier, HIGH-eccentric or new leg work away from the day before the long run and that same day when days allow, otherwise demand falls by content with disclosure; axial-HIGH lifts are the first replaced by a lower-axial alternative near key runs (tie-break, not a score); no lower-body strength within 72 h of the race; consolidation weeks every fourth development week; return states compose with the same relations; novice limits.
- **Ranking**: Pareto first, then leximax of sorted severities per horizon (H0 session … H3 goal) under the phase lead; never counts or sums. Equal-cost back-to-back order is disclosed as "either". A kept MODERATE or higher cost is disclosed with alternatives.
- **Infeasible or incomparable** compositions are represented, never hidden: GENUINE_TRADE_OFF (ASK), TOO_MANY_RUN_DAYS_FOR_CURRENT_PRACTICE, STRENGTH_DAYS_ABOVE_CURRENT_PRACTICE, EQUIPMENT_LIMITS_STRENGTH_SESSION, PULL_LIMITED_FOR_EQUIPMENT, EVENT_AMBITIOUS_FOR_CURRENT_RUNNING, LONG_RUN_PEAK_BELOW_TARGET, EVENT_TOO_CLOSE_OR_OUTSIDE_HORIZON.
- **Combined taper**: run doses from achieved executed peaks (one taper week, race window of six days) and strength at a reduced dose — one set fewer in specific weeks, about half the sets on taper days, no strength in the last three days, at most one light main-lift session in the race window, one light session after the race; no new exercise, load increase or rotation.

## 6. Classification and eligibility

Signals (`classification.signals`) are the facts the onboarding and the ledger actually provide: eligibility, age/population, run and strength goals, event (kind, date; a time goal is context only), run and strength experience, recent running (minutes, days, longest run, basis), familiar quality tasks, performance anchors (context only), known exercises, equipment and windows, emphasis, schedule (days, shifts, long-run day, time per session, same-shift confirmation), a stated priority (resolves genuine trade-offs and same-shift order only), rotation preference, interruptions, HealthKit history (an exposure lower bound, never tolerance; absent fields stay absent), executed evidence, learning consent. **Sex, height and weight drive nothing** in dose, volume, frequency, selection, progression or pace (DR-114); no numeric load prior is approved.

Statuses: CLINICAL_HUMAN_REQUIRED, UNSUPPORTED, INVALID_INPUT, ASK, CANONICAL. Unknowns: SAFE_CONSERVATIVE_ESTABLISHMENT, ASK_REQUIRED, LEARN_DURING_FIRST_SESSIONS, CLINICAL_OUT_OF_SCOPE.

Run classes NOT_PROGRAMMED, WALK_JOG, RESTART, EASY_UNKNOWN, EASY_LOW, QUALITY_FAMILIAR, EASY_CURRENT and strength classes NOT_PROGRAMMED, NONE, FAMILIAR_UNKNOWN_LOAD, KNOWN_LOAD are the reviewed runtime binding of R6-COLD-START; V09 shows the written predicates equal the frozen `assessCapability` on 4,000 grid cases. Their 45/60-minute and 2-day thresholds are runtime constants to be declared at the next policy revision (B0-F05). Skill admissibility: novices LOW, others up to MODERATE, HIGH only when familiar or reached through a ladder.

## 7. Archetypes

Only archetypes with a consumer exist (B0-C12): the arrangement ranking, protected stimuli, the strength dose role and explanations consume the **lead**. They derive from the R6 contextual goal model; no static priority flag is required.

| Archetype | When | Base lead |
|---|---|---|
| ARCH.RUN_ONLY | strength not programmed | RUN |
| ARCH.STRENGTH_ONLY | running not programmed | STRENGTH |
| ARCH.RUN_LED | both; run develops (or an event) without strength development | RUN |
| ARCH.STRENGTH_LED | both; strength develops, running does not, no event | STRENGTH |
| ARCH.JOINT | both develop (incl. event + strength development), or neither | JOINT |

Phase leads override the base: SPECIFIC, TAPER and RACE_WEEK → RUN; POST_EVENT → JOINT; NEXT_BLOCK → STRENGTH when strength develops or running is absent, else JOINT (RUN when strength is absent). V13 checks 77 goal × event combinations against the frozen `buildGoalModel`. **Event preparation, novice and returning are overlays, not archetypes**: an event is a phase sequence, novice and return are run-mode and strength-class states — their consumers are the trajectories, not the composition ranking.

## 8. Trajectories (state system)

`trajectories` encodes state machines whose states are PROGRESSION_STATE values:

- **Run**: intake class → WALK_JOG(step) / RESTART(minutes) / EASY; ladder and restart steps advance only on an executed week without an adverse signal and regress one step after repeated adverse responses; walk/jog and restart exit to EASY; EASY gains quality and strides through eligibility; any state → RETURN_SHORT (≤ 10 days: resume last executed doses, hold a week, first quality slot easy), RETURN_MODERATE (≤ 28 days: demonstration or 15-minute entry, two conditional steps to the prior executed dose), RESTART (> 28 days, achieved peaks cleared), CLINICAL_HOLD or ASK_HOLD. R7-A invariants hold: a return never starts above the state or dose last executed and tolerated; released is not executed; an interruption keeps one identity.
- **Event**: BUILD/DEVELOPMENT → SPECIFIC → TAPER → RACE_WINDOW → RACE → POST_EVENT → NEXT_BLOCK, by days to the race, doses from executed peaks, mode-aware for walk/jog, restart and return athletes, completion race day when required, an eligibility and function check dated on or after the race before redevelopment.
- **Strength exercise**: NOT_PERFORMED → PRACTICE → ESTABLISH → FROM_LOG_PENDING → FROM_LOG_ADOPTED / KNOWN → steps by ADVANCE/EARNED, one step back after repeated misses; REESTABLISH after more than 28 days unused; RETURN_ENTRY → RETURN_STEP after a moderate or long break; rotation and substitution start a new configuration at ESTABLISH. Missing logs hold and never regress; HOLD repeats the current valid dose; MAINTAIN is goal-context specific.

## 9. Beginner paths

Novice is not "smaller numbers" (request §14):

- **Running**: walk/jog ladder with at most three exposures and walks on extra days → continuous 20 minutes → easy runs of the exit dose on at most three days → walks convert one at a time at block starts → strides after two executed established easy weeks (the frozen runtime already allows them after walk/jog or restart exit; optional for every novice-started athlete) → quality only through an **executed-evidence graduation at a block boundary** (B0-C01): the last two executed weeks each reached at least 60 running minutes on at least two days without an adverse signal (the existing EASY_CURRENT thresholds applied to executed evidence, which then supersedes the self-declared NOVICE label for this purpose only), under all quality gates and the conditions of the SSCTR record; for walk/jog or restart starters the qualifying weeks lie in a block executed entirely in EASY mode. Event-specific work needs executed threshold sessions; a race after a walk/jog or restart build is a completion.
- **Strength**: practice configurations in the establishment week → effort-guided establishment of LOW-skill loaded configurations (≤ 2 sets at RIR ≥ 3, ascending ramp, no load from sex or body size) → goal dose with FROM_LOG adoption → at most two full templates per week until the first block boundary (B0-C08) → higher-skill configurations only through the ladders, at a block boundary, with agency (B0-C07).

## 10. Safety and boundaries

The product is nonclinical (`safety`). It **may** adapt inside envelopes, reduce or hold, regress after repeated adverse responses, replace a session with an explained lower-demand option, ask, exclude evidence while preserving originals, recommend caution with a disclosure, route to a qualified human for the dependent scope and withhold dependent outputs (AEC §7.1 HOLD with cause, scope, owner and exit). It **must not** diagnose, treat or rehabilitate, prescribe a "safe" exercise for pain, infer disease or pregnancy, grant clearance, claim injury prevention or performance, derive load from sex or body size, derive pace from a goal, progress on missing data or time, create volume debt, or let an LLM fill a policy. Routes: clinical category, mention or flag → CLINICAL_HUMAN_REQUIRED; ambiguous or missing → ASK; unknown eligibility → ASK (neither clearance nor illness); out-of-scope population → UNSUPPORTED; malformed → INVALID_INPUT; uncovered recipe → LATER_GATE fallback or HOLD, never an invented dose. Each family's negative eligibility and cited envelope conditions are its safety boundary.

## 11. Evidence

`evidence.map` ties every rule group to the 56 sources already verified by the SSCTR for R6 (`ssctr-evidence-manifest.r12.json`: ACSM 2026 resistance-training position stand; exercise-variation trials and review; RIR accuracy; concurrent-training order, recovery and interference meta-analyses; eccentric damage and repeated-bout effect; strength training for runners; recreational running progression and intensity distribution; taper and detraining) and to the R2 calibration snapshot. Approved envelopes need no new research. New research for the B0 candidates is the SSCTR's, only where the project evidence is insufficient (request §18).

## 12. Candidates for the SSCTR gate

| ID | Candidate | Nature |
|---|---|---|
| B0-C01 | Run novice graduation (strides after walk/jog exit; executed-evidence quality eligibility at a block boundary) | New eligibility rule inside R6-RUN-QUALITY |
| B0-C02 | Familiar repeated-bout continuation inside the R6 week | Binding of R2-P14/P07 into the R6 structure |
| B0-C03 | 37 new strength configurations for the V1 population | Catalogue extension |
| B0-C04 | Demand/emphasis metadata; SINGLE_IMPLEMENT, BAND_TENSION, ASSISTED_BODYWEIGHT; pull-up loading | Metadata and representation |
| B0-C05 | Contextual role admissibility; goal-context accessory alternatives | Template extension, no dose |
| B0-C06 | Rotation eligibility mapping; directed close variation; MAIN block-boundary change | DR-134 operationalization; extends R6-ROTATION |
| B0-C07 | Skill ladders and strength novice graduation | Progression relation |
| B0-C08 | Strength novice density | Composition limit |
| B0-C09 | PULL coverage and disclosure | Coverage rule |
| B0-C10 | LATER_GATE and UNSUPPORTED classifications | Abstention-type |
| B0-C11 | CMP.I11/CMP.P04 eccentric/new leg work before key runs; axial tie-break | Composition extension under SIS §5 |
| B0-C12 | Archetypes from the goal model; overlays | Derivation check |

A candidate the SSCTR does not approve becomes LATER_GATE; the approved envelopes and the rest of the catalog stand on their own.

## 13. Validation

`audits/domain-coaching-r7-b0-2026-10-31/validate-b0.mjs` (read-only; `--write` records `VALIDATION_B0.json`): schema and parameterization instances (V01); policy hash and 111 policy references resolved (V02); R6 catalogue fidelity with declared deltas (V03); identity and references (V04); slot coverage on nine equipment profiles × two experience levels and goal-context alternatives (V05, V05b); rotation mapping and alternatives (V06); directed close variation (V07); skill ladders (V08); run classification equal to the runtime on 4,000 cases (V09); trajectories without dead ends (V10); run families bound to approved envelopes (V11); composition equal to the runtime and hybrid constants equal to the policy (V12); archetypes equal to the goal model on 77 cases (V13); witnesses — 31 positive (eligible context → family → configuration → progression → regression) and 25 negative, with 15 executable assertions (V14); later-gate separation (V15); gap-closure coverage (V16); status and scope guards (V17). It proves structural and binding properties of the specification, not training efficacy.

## 14. SSCTR gate

Gate R7B0-SSCTR-r1 ([records](../../../audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_REVIEW_B0.json), [summary](../../../audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_REVIEW_B0.md)) reviewed R7B0-CATALOG-1: B0-C01…B0-C12 APPROVE_WITH_CONDITIONS; B0-FIDELITY REVISE with four exact changes (M1–M4: the frozen runtime quality gates stated on the quality families and on the graduation rule; the protected-run substitution authority re-pointed to B0-C11), applied in R7B0-CATALOG-2 for the one narrow recheck. **The record conditions bind the catalog entries and prevail wherever they are stricter** — for example: strides optional for every novice-started athlete; quality graduation only from a block executed entirely in EASY mode; a straight-knee calf exposure kept every week; rotation never faster than the preference cadence; no first-exposure or HIGH-eccentric configuration used as a substitute before a protected run. The final state is in the closure record.
