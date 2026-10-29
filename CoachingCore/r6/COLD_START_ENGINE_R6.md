# Cold-start engine — R6

A first program starts from what an onboarding questionnaire collects, not from a prebuilt week. The engine turns the answers into a canonical intake, decides what is known, what can be established safely in the first sessions, what must be asked, and what is outside nonclinical scope.

Scope: OFFLINE_SYNTHETIC_NODE24_REFERENCE. Candidate implementation inside reviewed envelopes (R6-COLD-START, R6-LOAD-ESTABLISHMENT); not Product Truth, production, clinical or empirical validation. Evidence: `COLD_START_ENGINE_R6.json`.

## Pipeline

1. **Canonical intake** (`src/r6-intake.mjs` `canonicalizeIntake`): onboarding-like facts in `R6-INTAKE-1` → `R6-CANONICAL-INTAKE-1` with a hash. No static priority flag is required; shifts matter only on shared days; wearable history is a provenance-bearing lower bound, deduplicated, never a replacement for current eligibility.
2. **Status**: `CLINICAL_HUMAN_REQUIRED` (pain, injury, illness, functional limitation, or a clinical pause reason, even when flagged nonclinical), `UNSUPPORTED` (outside V1: age outside 18–80, pregnancy, postpartum, adolescent, elite, marathon and longer), `INVALID_INPUT` (malformed or contradictory), `ASK` (only facts that change the first program: current eligibility, a goal, chosen days and time, the event date, an unclear pause reason), otherwise `CANONICAL`.
3. **Unknowns in four categories**: `SAFE_CONSERVATIVE_ESTABLISHMENT` (for example unknown loads), `ASK_REQUIRED`, `LEARN_DURING_FIRST_SESSIONS` (for example disagreement between self-report and wearable), `CLINICAL_OUT_OF_SCOPE`.
4. **Capability** (`src/r6-program.mjs` `assessCapability`): running WALK_JOG, RESTART, EASY_UNKNOWN, EASY_LOW, EASY_CURRENT, QUALITY_FAMILIAR; strength NONE, FAMILIAR_UNKNOWN_LOAD, KNOWN_LOAD.
5. **Goal model** (`buildGoalModel`): contextual priority per phase derived from goals and event; `staticPriorityRequired:false`.

## First-week rules

- Week 1 never exceeds the reported weekly running; the long run never exceeds the longest current run (rounding down).
- Zero or unknown exposure uses only the walk/jog ladder step 0 or the reviewed 15–20 minute easy entry.
- No new intensity and no strides in week 1; a current familiar quality task appears only if it fits the week-1 ceiling and the reported minutes, otherwise a week later.
- More chosen days than current running supports keep brisk walks on the extra days (negotiated, never silently dropped).
- Unknown loads are established inside the first exposure by an ascending ramp; nothing is derived from sex, body size or another exercise. Novices practise unloaded first.
- Load-establishment rows exist only when R6-LOAD-ESTABLISHMENT is enabled; otherwise only exercises with a current known dose or bodyweight are used.

## Input robustness (FREEZE-2)

The engineering review of FREEZE-1 found values that degraded silently (QRE-R6-12) and inputs that threw (QRE-R6-10). Now:
- A goal must be a word or an object with a kind (a run goal may carry only its event). A number, an empty object or a list is malformed, never "no goal".
- A pause length that is not a number is asked. A pause of four weeks or more restarts, whatever its length.
- A familiar quality task whose work does not add up inside its duration is kept as history, with a note, and does not start the quality ladder.
- A reported known dose above six sets is history; the plan starts at six.
- Known loads in pounds are converted to kilograms (nearest 0.5 kg) and kept as reported; any other unit leaves the load unknown (QRE-R6-01).
- A special population given as a single word, an event given as a word, and preferences that are not lists are read or rejected, never thrown.

## Limits

- Onboarding answers are self-report; the engine never treats them as clinical clearance.
- A wearable history is a lower bound for exposure, not for tolerance.
- Event feasibility is negotiated (too few days, too little long-run time, an event too early); readiness and finish times are never promised.

## After FREEZE-1 (SSCTR rounds 7–12; not frozen)

This describes the R6 runtime after FREEZE-1, which is **not frozen**: the SSCTR refused FREEZE-2 in round 12, and under the Founder's bound R6 closes with an explicit blocker (`OPEN_GAPS_R6.md`). The official evidence stays bound to FREEZE-1. Every rule below holds under the SSCTR's weekly-review contract: every elapsed week receives a gating weekly review, with unreported sessions reviewed as missed (a week without one keeps the projection's assumption; owned gap R18).

- **Status (SSCTR R6).** A yes-meaning clinical flag in any form routes to CLINICAL_HUMAN_REQUIRED.
- **A missed first session establishes nothing (SSCTR D52).** Its exercises are established at their next exposure. Later sessions of the first week repeat the establishment until a review sees the exercise performed with a logged load. Two agreeing establishment logs of that week confirm each other (D45).
- **The clock of a known dose (SSCTR D52, Q3).** A known dose from the intake was last performed on its `observedAt`. A dose skipped from week 0 is therefore re-established once more than 28 days have passed since then, possibly at its first program exposure.
