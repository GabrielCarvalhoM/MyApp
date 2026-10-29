# ACF-G02 — Positive adaptation dosing

Revision DCR2-SCI-r2 · 2026-10-24 · author /root/science_synthesis.

**CANDIDATE_PENDING_INDEPENDENT_SSCTR.** This synthesis is not scientific approval, Product Truth, clinical clearance, efficacy validation or real-user authorization. Scope: offline Node24 executable reference/oracle only.

Finite alternatives follow necessity and smallest sufficient change; no universal fatigue or progress formula.

The numerical recipes below are **DECIDED finite protocol choices**, not universal physiological thresholds. Evidence supporting a programming principle does not prove an exact dose. Every positive output requires exact independent disposition and current complete runtime binding. A synthetic witness proves semantic conformance only.

## R2-P03 — Strength next-session repetition progression inside demonstrated capacity

Request `PROGRESS_STRENGTH`. SUPPORTED_WITH_LIMITS_FOR_FRAMEWORK_ONLY. Confidence MODERATE: Bounded protocol selection with explicit individual context; exact dose/effect remains unvalidated.

Select3x9 only within currently demonstrated3x10 capability and all guards; otherwise keep adequate3x8 or ASK. No simultaneous load/sets increase.

Required inputs:

- same configuration and loadKg across current3x8 and comparable episodes
- at least two complete comparable executions including observed3x10 within effort/technique target
- recovery/current context adequate; no event/competing recovery concern
- explicit next-session candidate goal
- established task-specific targetRir2 if emitted; never defaultRIR from athlete class

Guards:

- Two episodes is witness-specific operational evidence, not magic universal sufficiency
- Do not infer RIR from one report; inconsistent technique invalidates comparison
- Current3x8 must be materially below selected adequate next-horizon stimulus; priority alone insufficient

Finite candidate contract:

```json
[
  {
    "recipeId": "R2-ST-PROG-3X9",
    "modality": "STRENGTH",
    "family": "REPETITION_PROGRESSION",
    "prescription": {
      "sets": 3,
      "reps": 9,
      "loadKgFrom": "facts.loadKg",
      "restSeconds": 180,
      "unchanged": [
        "configuration",
        "load",
        "rest",
        "exercise order"
      ]
    }
  }
]
```

Essential stimulus: Same movement/load and adequate subfailure execution, one repetition per set added.

Smaller alternatives:

- KEEP3x8: Succeeds if current dose remains adequate; must record why progression desired for next horizon.
- Increase load: Unnecessary additional dimension.

Trade-off: More work versus measurement uncertainty; moderate confidence only for exact profile.

Next check: Record actual task/configuration/dose, technique/effort and current symptoms after execution and before next dependent session; contradictory response disables escalation.

Fallback: ASK missing decision-changing input; HOLD unsupported/uncalibrated dose; clinical dependency CLINICAL_HUMAN_REQUIRED.

Evidence linkage: C02, C03; R2-S03, R2-S04, R2-S11. Exact-dose status: DECIDED_FINITE_PROTOCOL_NOT_POPULATION_LAW; independent disposition required.

## R2-P04 — Local fatigue: remove one optional accessory

Request `LOCAL_FATIGUE`. SUPPORTED_WITH_LIMITS_FOR_FRAMEWORK_ONLY. Confidence MODERATE: Bounded protocol selection with explicit individual context; exact dose/effect remains unvalidated.

If one familiar optional set is sufficient, select1x12. Omit both optional sets only when explicit oneOptionalSetStillInadequate=true. Preserve essential tasks, historical prefix and all other sessions; isolated noisy report with adequate execution -> KEEP.

Required inputs:

- optional calfRaise2x12 explicit in selected plan
- local calf fatigue without pain/clinical limitation
- repeated comparable accessory execution fails intended quality
- essential tasks unaffected and current intent preserved
- removal is prospectively allowed; no completed prefix edits
- facts.oneOptionalSetStillInadequate boolean; if false, familiar1x12 is sufficient and admissible

Guards:

- Local label alone does not establish need; require task-specific adequacy problem
- Essential calf-specific goal makes accessory nonoptional -> not eligible
- No automatic reduction elsewhere or next week

Finite candidate contract:

```json
[
  {
    "recipeId": "R2-LOWER-ONE-CALF",
    "modality": "STRENGTH",
    "family": "OPTIONAL_ACCESSORY_REDUCTION",
    "prescription": {
      "calfRaise": {
        "sets": 1,
        "reps": 12
      },
      "preserveAllOtherTasks": true
    }
  },
  {
    "recipeId": "R2-REMOVE-OPTIONAL-CALF",
    "modality": "STRENGTH",
    "family": "OPTIONAL_ACCESSORY_REMOVAL",
    "prescription": {
      "removeExercise": "calfRaise",
      "removeSets": 2,
      "removeRepsPerSet": 12,
      "preserveAllOtherTasks": true
    }
  }
]
```

Essential stimulus: All explicitly essential Run/Strength tasks unchanged; accessory intent traded off, not denied.

Smaller alternatives:

- KEEP: Fails only when actual repeated accessory quality constraint is established.
- Remove one set: Prefer this if one set is a currently admissible/tolerable useful candidate; full omission requires explicit evidence that reduced optional task remains inadequate.
- Whole-week deload: Unnecessary given localized optional task.

Trade-off: Temporarily forgo calf accessory work; no claim global fatigue resolved or injury prevented.

Next check: Record actual task/configuration/dose, technique/effort and current symptoms after execution and before next dependent session; contradictory response disables escalation.

Fallback: ASK missing decision-changing input; HOLD unsupported/uncalibrated dose; clinical dependency CLINICAL_HUMAN_REQUIRED.

Evidence linkage: C04, C05; R2-S05, R2-S06, R2-S07. Exact-dose status: DECIDED_FINITE_PROTOCOL_NOT_POPULATION_LAW; independent disposition required.

## R2-P05 — Converging systemic signals: explicit familiar branch

Request `SYSTEMIC_FATIGUE`. SUPPORTED_WITH_LIMITS_FOR_FRAMEWORK_ONLY. Confidence MODERATE: Bounded protocol selection with explicit individual context; exact dose/effect remains unvalidated.

Rank an already familiar explicitly authorized feasible branch above KEEP only when converging nonclinical facts establish current-session inadequacy. Do not invent causal attribution or a universal deload.

Required inputs:

- individually unusual sleep/recovery concern plus comparable observed performance deterioration
- nonclinical reason assessed
- known branch containing familiar20min easy now and same essential session at allowed future slot
- all essential commitments, current capacity and schedule feasibility verified
- facts.branchAuthorized && branchFamiliar && branchWindowAllowed && easyCurrentlyTolerated; fixed current registry THU/SAT branch

Guards:

- No biomarker/subjective composite cutoff
- No prescription from single noisy fatigue event
- Branch must preserve every essential session in the horizon and cannot silently propagate whole-week replan
- Repeated systemic symptoms/uncertain cause -> ASK or clinical route as applicable

Finite candidate contract:

```json
[
  {
    "recipeId": "R2-SYSTEMIC-FAMILIAR-BRANCH",
    "modality": "HYBRID",
    "family": "PREAUTHORIZED_BRANCH",
    "prescription": {
      "now": {
        "family": "EASY",
        "durationMinutes": 20,
        "targetMethod": "COMFORTABLE_CONVERSATION",
        "familiarityRequired": true
      },
      "essentialSession": "COPY_UNCHANGED_TO_EXPLICIT_ALLOWED_SLOT",
      "branchFrom": "fixed current registry THU/SAT branch"
    }
  }
]
```

Essential stimulus: Essential session retained unchanged at feasible slot; immediate familiar easy is not its physiological equivalent.

Smaller alternatives:

- KEEP: Valid if present session remains adequate despite signals; otherwise documented failure.
- Optional-volume removal: Prefer if sufficient; branch only when core-session problem survives.

Trade-off: Delay stimulus and alter commitment; mechanism of fatigue remains uncertain.

Next check: Record actual task/configuration/dose, technique/effort and current symptoms after execution and before next dependent session; contradictory response disables escalation.

Fallback: ASK missing decision-changing input; HOLD unsupported/uncalibrated dose; clinical dependency CLINICAL_HUMAN_REQUIRED.

Evidence linkage: C04, C05; R2-S05, R2-S06, R2-S07. Exact-dose status: KNOWN_BRANCH_SELECTION_ONLY; not proof20min treats systemic fatigue.

## R2-P06 — Under-target Strength: one-set reduction to familiar candidate

Request `UNDER_TARGET_STRENGTH`. SUPPORTED_WITH_LIMITS_FOR_FRAMEWORK_ONLY. Confidence MODERATE: Bounded protocol selection with explicit individual context; exact dose/effect remains unvalidated.

Propose exact2x8 next horizon after necessity established; keep load/reps/rest fixed, check response before further change.

Required inputs:

- current3x8 same explicit loadKg/config/rest180s
- comparable recent episodes complete first2x8 with technique/effort target but third set repeatedly inadequate
- 2x8 candidate previously familiar and tolerated
- essential intent admissible at2sets for this horizon
- established task-specific targetRir2 if emitted; never defaultRIR from athlete class

Guards:

- Recording error, unfamiliar equipment, altered technique or external one-off explanation -> reconcile/ASK
- If first two sets also inadequate, no2set assumption
- Current essential volume requirement of3sets blocks this reduction

Finite candidate contract:

```json
[
  {
    "recipeId": "R2-ST-3TO2",
    "modality": "STRENGTH",
    "family": "SET_REDUCTION",
    "prescription": {
      "sets": 2,
      "reps": 8,
      "loadKgFrom": "facts.loadKg",
      "restSeconds": 180,
      "remove": "THIRD_DEFINED_SET_ONLY"
    }
  }
]
```

Essential stimulus: Known two-set movement/load stimulus retained; no claim identical long-term gains.

Smaller alternatives:

- KEEP: Fails if repeated third-set inadequacy at matched context.
- Longer rest: Would be smaller if allowed and sufficient; exact profile already uses appropriate familiar rest and excludes this alternative only with evidence.
- Reduce load: Changes force target unnecessarily if2sets adequate.

Trade-off: Less volume versus repeated inadequate third set.

Next check: Record actual task/configuration/dose, technique/effort and current symptoms after execution and before next dependent session; contradictory response disables escalation.

Fallback: ASK missing decision-changing input; HOLD unsupported/uncalibrated dose; clinical dependency CLINICAL_HUMAN_REQUIRED.

Evidence linkage: C02, C03, C05; R2-S03, R2-S04, R2-S11, R2-S07. Exact-dose status: DECIDED_FINITE_PROTOCOL_NOT_POPULATION_LAW; independent disposition required.

## R2-P07 — Under-target Run: remove one defined interval repetition

Request `REDUCE_RUN_REPETITION`. SUPPORTED_WITH_LIMITS_FOR_FRAMEWORK_ONLY. Confidence MODERATE: Bounded protocol selection with explicit individual context; exact dose/effect remains unvalidated.

Select familiar4x3 with existing pace/rest when5th repetition causes established inadequacy. No substitution of threshold/CS/VO2 constructs.

Required inputs:

- current5x3min at explicit paceSecondsPerKm and120s recovery
- FIELD_SESSION_TARGET calibration for same family/context
- first4 reps comparable and tolerated, fifth repeatedly inadequate
- 4x3 candidate familiar and preserves intent
- surface/conditions/recording comparable

Guards:

- Do not infer VO2max exposure from label/pace
- Do not increase speed or reduce rest to compensate
- Uncalibrated target or early-rep deterioration -> ASK/HOLD

Finite candidate contract:

```json
[
  {
    "recipeId": "R2-RUN-5TO4",
    "modality": "RUN",
    "family": "INTERVAL_REPETITION_REDUCTION",
    "prescription": {
      "warmupMinutes": 10,
      "repetitions": 4,
      "workMinutes": 3,
      "recoverySeconds": 120,
      "cooldownMinutes": 10,
      "paceSecondsPerKmFrom": "facts.paceSecondsPerKm",
      "targetConstruct": "FIELD_SESSION_TARGET"
    }
  }
]
```

Essential stimulus: Four matched work bouts at established target; total stimulus lower and not claimed equivalent.

Smaller alternatives:

- KEEP5: Fails only with comparable repeated fifth-repetition inadequacy.
- More rest: Choose if feasible/supported and sufficient; no assumption unavailable.
- Slow all reps: May alter established intent; not needed if four meet target.

Trade-off: Lower accumulated work; next response determines repeat or request further review.

Next check: Record actual task/configuration/dose, technique/effort and current symptoms after execution and before next dependent session; contradictory response disables escalation.

Fallback: ASK missing decision-changing input; HOLD unsupported/uncalibrated dose; clinical dependency CLINICAL_HUMAN_REQUIRED.

Evidence linkage: C04, C05, C10; R2-S05, R2-S06, R2-S07, R2-S09, R2-S10. Exact-dose status: DECIDED_FINITE_PROTOCOL_NOT_POPULATION_LAW; independent disposition required.

## R2-P08 — Easy/long next-horizon duration selection inside current tolerance

Request `PROGRESS_RUN`. SUPPORTED_WITH_LIMITS_FOR_FRAMEWORK_ONLY. Confidence MODERATE: Bounded protocol selection with explicit individual context; exact dose/effect remains unvalidated.

Choose45min next horizon only within current demonstrated tolerance and sufficient recovery; adequate40min remains KEEP when change unnecessary.

Required inputs:

- current40min easy/long
- 45min same family/effort/surface currently familiar and repeatedly tolerated
- current context/recovery consistent
- next-horizon goal supports increment; no simultaneous intensity increase

Guards:

- No calendar or10% rule
- Past remote45min does not establish present45min
- Long is relative to athlete; same45min not universally long

Finite candidate contract:

```json
[
  {
    "recipeId": "R2-RUN-40TO45",
    "modality": "RUN",
    "family": "DURATION_PROGRESSION",
    "prescription": {
      "durationMinutes": 45,
      "targetMethod": "COMFORTABLE_CONVERSATION",
      "paceTarget": null,
      "unchanged": [
        "effort intent",
        "frequency",
        "other session doses"
      ]
    }
  }
]
```

Essential stimulus: Familiar aerobic duration intent without intensity escalation.

Smaller alternatives:

- KEEP40: Valid whenever adequate; compare explicit goal and horizon.
- Add hard finish: Unsupported and unnecessary.

Trade-off: Additional duration versus context/tolerance uncertainty.

Next check: Record actual task/configuration/dose, technique/effort and current symptoms after execution and before next dependent session; contradictory response disables escalation.

Fallback: ASK missing decision-changing input; HOLD unsupported/uncalibrated dose; clinical dependency CLINICAL_HUMAN_REQUIRED.

Evidence linkage: C01, C07, C10; R2-S01, R2-S02, R2-S09, R2-S10. Exact-dose status: DECIDED_FINITE_PROTOCOL_NOT_POPULATION_LAW; independent disposition required.

## R2-P15 — Athlete-specific history ranks already admissible options

Request `RANK_OPTIONS`. SUPPORTED_WITH_LIMITS_FOR_DESCRIPTIVE_CONTEXTUAL_RANKING_ONLY. Confidence MODERATE: Bounded protocol selection with explicit individual context; exact dose/effect remains unvalidated.

Within admissible candidates only, compatible repeated individual observations may adjust ranking; confounding/noise/unmatched context cannot create dose or inevitability. Keep ties stable and explain context mismatch.

Required inputs:

- explicit finite options with independent admissibility
- repeated comparable context/action/response episodes
- contradictions/confounds and current context
- population prior and goal/priority
- source/time/revision for each observation

Guards:

- Never expand dose/admissibility from learned preference
- Single noisy event does not change ranking
- No universal count/confidence threshold; finite witness may use repeated data as a gate but not claim general minimum
- Associations never prove schedule/candidate caused outcome
- Contradictory equivalent observations preserve population prior/KEEP or ASK

Finite candidate contract:

```json
{
  "input": "List of independently admissible option IDs and complete recipes",
  "output": "Stable ranking with populationPrior, comparableEpisodes, counterexamples, confounds, rationale and uncertainty; no new recipe"
}
```

Essential stimulus: All candidates already protect essentials; ranking changes convenience/observed tolerance preference only.

Next check: Log selected option and next comparable observed response; contradiction removes learned preference; population prior stays visible.

Fallback: KEEP prior stable ranking or ASK missing comparability; never fit a new rule to one event.

Evidence linkage: C04, C05, C11; R2-S05, R2-S06, R2-S07. Exact-dose status: NO_NEW_DOSE; individual efficacy/causality unproved.


## Retained open portions

- Novel acute dose from subjective fatigue alone
- Systemic unexplained symptoms
- Partial replan beyond exact authorized branch
- New load/reps beyond current task tolerance
- Unmatched-context learned preference

All actual prescriptive approvals must be queued by Chief for funded human revalidation. No queue entry is created by this author. New applicable evidence, changed population/recipe/target, contradictory response or adverse event invalidates dependent assumptions and triggers re-review.

Sources/provenance and exact read access: [LITERATURE_SNAPSHOT_R2.json](LITERATURE_SNAPSHOT_R2.json); claim classification/counterevidence: [SCIENTIFIC_CLAIM_MAP_R2.json](SCIENTIFIC_CLAIM_MAP_R2.json). Internal ACF labels denote these R2 gaps and do not rename canonical historical G01–G04 governance gates.

## Exact runtime transport and recipe crosswalk

The earlier descriptive recipe IDs are semantic aliases. They do not add recipes or approvals. The current integrated registry supplies exact executable recipe IDs; the current independent disposition must cover those exact recipes and bounds.

### R2-P03

```json
{
  "registry": "CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json",
  "inputSchema": "CoachingCore/r2/SHADOW_INPUT_R2_SCHEMA.json",
  "semanticsVsTransport": "requiredInputs are domain requirements; only fieldCrosswalk entries name transport fields. No undocumented field is treated as an existing API property.",
  "recipeIdAliases": {
    "R2-ST-PROG-3X9": "R2-SQUAT-3X9"
  },
  "fieldCrosswalk": {
    "calibrated RIR": "event.facts.rirCalibratedForTask && establishedTargetRir===2",
    "comparable responses": "event.facts.episodes",
    "necessity": "event.facts.nextHorizonNeedConfirmed"
  },
  "authority": "Integrated registry exact recipe and current independent SSCTR disposition govern execution. Alias/composition is not an additional dose or independent approval."
}
```

### R2-P04

```json
{
  "registry": "CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json",
  "inputSchema": "CoachingCore/r2/SHADOW_INPUT_R2_SCHEMA.json",
  "semanticsVsTransport": "requiredInputs are domain requirements; only fieldCrosswalk entries name transport fields. No undocumented field is treated as an existing API property.",
  "recipeIdAliases": {
    "R2-REMOVE-OPTIONAL-CALF": "R2-LOWER-NO-CALF",
    "R2-LOWER-ONE-CALF": "R2-LOWER-ONE-CALF"
  },
  "fieldCrosswalk": {
    "single optional set inadequate": "event.facts.oneOptionalSetStillInadequate",
    "material current problem": "event.facts.materialProblem",
    "calibrated essential RIR": "event.facts.rirCalibratedForTask && establishedTargetRir===2"
  },
  "authority": "Integrated registry exact recipe and current independent SSCTR disposition govern execution. Alias/composition is not an additional dose or independent approval."
}
```

### R2-P05

```json
{
  "registry": "CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json",
  "inputSchema": "CoachingCore/r2/SHADOW_INPUT_R2_SCHEMA.json",
  "semanticsVsTransport": "requiredInputs are domain requirements; only fieldCrosswalk entries name transport fields. No undocumented field is treated as an existing API property.",
  "recipeIdAliases": {
    "R2-SYSTEMIC-FAMILIAR-BRANCH": "THU_R2-EASY-20__SAT_R2-RUN-5X3"
  },
  "fieldCrosswalk": {
    "branch authorization": "event.facts.branchAuthorized",
    "branch familiarity/window": "event.facts.branchFamiliar && branchWindowAllowed",
    "current easy capability": "event.facts.easyCurrentlyTolerated",
    "converging facts": "event.facts.subjectiveFatigue && performanceDecline && contextComparable && materialProblem"
  },
  "authority": "Integrated registry exact recipe and current independent SSCTR disposition govern execution. Alias/composition is not an additional dose or independent approval."
}
```

### R2-P06

```json
{
  "registry": "CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json",
  "inputSchema": "CoachingCore/r2/SHADOW_INPUT_R2_SCHEMA.json",
  "semanticsVsTransport": "requiredInputs are domain requirements; only fieldCrosswalk entries name transport fields. No undocumented field is treated as an existing API property.",
  "recipeIdAliases": {
    "R2-ST-3TO2": "R2-SQUAT-2X8"
  },
  "fieldCrosswalk": {
    "current load": "event.facts.loadKg",
    "comparable task episodes": "event.facts.episodes",
    "familiar reduced candidate": "event.facts.reducedCandidateTolerated",
    "calibrated RIR": "event.facts.rirCalibratedForTask && establishedTargetRir===2"
  },
  "authority": "Integrated registry exact recipe and current independent SSCTR disposition govern execution. Alias/composition is not an additional dose or independent approval."
}
```

### R2-P07

```json
{
  "registry": "CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json",
  "inputSchema": "CoachingCore/r2/SHADOW_INPUT_R2_SCHEMA.json",
  "semanticsVsTransport": "requiredInputs are domain requirements; only fieldCrosswalk entries name transport fields. No undocumented field is treated as an existing API property.",
  "recipeIdAliases": {
    "R2-RUN-5TO4": "R2-RUN-4X3"
  },
  "fieldCrosswalk": {
    "current field target": "event.facts.paceSecondsPerKm && targetCalibrated",
    "material fifth-rep issue": "event.facts.fifthRepDegrades && fourRepsTolerated && materialProblem"
  },
  "authority": "Integrated registry exact recipe and current independent SSCTR disposition govern execution. Alias/composition is not an additional dose or independent approval."
}
```

### R2-P08

```json
{
  "registry": "CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json",
  "inputSchema": "CoachingCore/r2/SHADOW_INPUT_R2_SCHEMA.json",
  "semanticsVsTransport": "requiredInputs are domain requirements; only fieldCrosswalk entries name transport fields. No undocumented field is treated as an existing API property.",
  "recipeIdAliases": {
    "R2-RUN-40TO45": "R2-EASY-45"
  },
  "fieldCrosswalk": {
    "current demonstrated45min": "event.facts.candidatePreviouslyTolerated && episodes",
    "necessity": "event.facts.nextHorizonNeedConfirmed"
  },
  "authority": "Integrated registry exact recipe and current independent SSCTR disposition govern execution. Alias/composition is not an additional dose or independent approval."
}
```

### R2-P15

```json
{
  "registry": "CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json",
  "inputSchema": "CoachingCore/r2/SHADOW_INPUT_R2_SCHEMA.json",
  "semanticsVsTransport": "requiredInputs are domain requirements; only fieldCrosswalk entries name transport fields. No undocumented field is treated as an existing API property.",
  "recipeIdAliases": {},
  "fieldCrosswalk": {
    "finite admissible alternatives": "event.facts.alternatives && candidatesAdmissible",
    "comparable individual episodes": "event.facts.episodes && relevantContextUnchanged && counterevidenceConsidered"
  },
  "authority": "Integrated registry exact recipe and current independent SSCTR disposition govern execution. Alias/composition is not an additional dose or independent approval."
}
```

