# ACF-G01 — First prescription / establishment

Revision DCR2-SCI-r2 · 2026-10-24 · author /root/science_synthesis.

**CANDIDATE_PENDING_INDEPENDENT_SSCTR.** This synthesis is not scientific approval, Product Truth, clinical clearance, efficacy validation or real-user authorization. Scope: offline Node24 executable reference/oracle only.

No product history is not no current ability; current task demonstration differs from prior product exposure.

The numerical recipes below are **DECIDED finite protocol choices**, not universal physiological thresholds. Evidence supporting a programming principle does not prove an exact dose. Every positive output requires exact independent disposition and current complete runtime binding. A synthetic witness proves semantic conformance only.

## R2-P01 — First Run establishment without product history

Request `ESTABLISH_RUN`. SUPPORTED_WITH_LIMITS_FOR_FRAMEWORK_ONLY. Confidence MODERATE: Bounded protocol selection with explicit individual context; exact dose/effect remains unvalidated.

With all guards satisfied propose exact run/walk week. Pause run segment and walk if comfortable speech cannot be maintained; this is an instruction to regulate effort, not clinical reassurance. Week2 repeats exact week only after completed context/response review; no automatic week2 increase.

Required inputs:

- facts.walkMinutes >=30
- facts.comfortableTalk ===true
- facts.timeBudgetMinutes >=30
- facts.availableDays is one of [MON,WED,SAT], [TUE,THU,SAT], [MON,WED,FRI] and fits current schedule
- explicit adult/nonclinical eligibility
- current walking is comfortable, context/provenance known

Guards:

- 30 minutes walking is an operational entry bound, not a validated clinical test or threshold
- No clinical symptom inference from walking success
- No simultaneous Strength progression or new hard Run family
- First session does not require prior Run exposure; existing Strength competence does not substitute for Run context

Finite candidate contract:

```json
[
  {
    "recipeId": "R2-RUN-EST-10X1",
    "modality": "RUN",
    "family": "ESTABLISHMENT",
    "prescription": {
      "warmupWalkMinutes": 5,
      "repetitions": 10,
      "runMinutes": 1,
      "walkMinutes": 1,
      "cooldownWalkMinutes": 5,
      "totalMinutes": 30,
      "runningMinutes": 10,
      "targetMethod": "COMFORTABLE_CONVERSATION",
      "paceTarget": null,
      "hrTarget": null,
      "days": [
        "MON",
        "WED",
        "SAT"
      ],
      "allowedDayLists": [
        [
          "MON",
          "WED",
          "SAT"
        ],
        [
          "TUE",
          "THU",
          "SAT"
        ],
        [
          "MON",
          "WED",
          "FRI"
        ]
      ],
      "dayVariantProvenance": "MON/WED/SAT encouraged in source; other lists are DECIDED logistical transfer requiring same independent disposition, not spacing law or independent dose witnesses"
    }
  }
]
```

Essential stimulus: Repeated low-complexity running exposure at self-regulated comfortable effort; no threshold claim.

Smaller alternatives:

- ASK: Needed for absent eligibility/context; unnecessary if complete.
- Walking only: Admissible lower-demand option if run cue fails; not counted as positive running coverage.
- Continuous20min Run: Requires tolerance not supplied.

Next check: Record actual task/configuration/dose, technique/effort and current symptoms after execution and before next dependent session; contradictory response disables escalation.

Fallback: ASK missing decision-changing input; HOLD unsupported/uncalibrated dose; clinical dependency CLINICAL_HUMAN_REQUIRED.

Evidence linkage: C01, C03, C07; R2-S01, R2-S02, R2-S11. Exact-dose status: DECIDED_FINITE_PROTOCOL_NOT_POPULATION_LAW; independent disposition required.

Week1 → response → week2: R2-RUN-EST-10X1 x3 → actual completed segments, speech, effort, symptoms, recovery and other-modality exposure → REPEAT_ONLY_OR_ASK/HOLD; repeat is SUPPORTED_KEEP, not new positive progression. This repeat is SUPPORTED_KEEP, not positive progression.

## R2-P02 — First Strength week after configuration familiarization

Request `ESTABLISH_STRENGTH`. SUPPORTED_WITH_LIMITS_FOR_FRAMEWORK_ONLY. Confidence MODERATE: Bounded protocol selection with explicit individual context; exact dose/effect remains unvalidated.

Propose two exact familiarization sessions only after all four current task loads and competence are established. Week2 may repeat after response review; no calendar-driven progression.

Required inputs:

- facts.configurationFamiliar && facts.techniqueDemonstrated && facts.loadEstablished for each current configuration
- facts.loadsKg.legPress, machineChestPress, seatedCableRow, seatedLegCurl are actual current established numerical loads
- same machine/settings and ROM demonstrated
- two nonconsecutive available days
- technique/effort cue understood and no grinding/compensatory execution

Guards:

- No numerical load/RIR inferred from novice label or Run experience
- Load is established now per task; the runtime copies it, never calculates percentage1RM
- Unknown movement competence -> ASK with familiarization task; not blind prescription
- No failure test required to calibrate RIR

Finite candidate contract:

```json
[
  {
    "recipeId": "R2-ST-EST-1X8",
    "modality": "STRENGTH",
    "family": "ESTABLISHMENT",
    "prescription": {
      "days": [
        "TUE",
        "FRI"
      ],
      "exercises": [
        {
          "exercise": "legPress",
          "sets": 1,
          "reps": 8,
          "loadKgFrom": "facts.loadsKg.legPress",
          "restSeconds": 120
        },
        {
          "exercise": "machineChestPress",
          "sets": 1,
          "reps": 8,
          "loadKgFrom": "facts.loadsKg.machineChestPress",
          "restSeconds": 120
        },
        {
          "exercise": "seatedCableRow",
          "sets": 1,
          "reps": 8,
          "loadKgFrom": "facts.loadsKg.seatedCableRow",
          "restSeconds": 120
        },
        {
          "exercise": "seatedLegCurl",
          "sets": 1,
          "reps": 8,
          "loadKgFrom": "facts.loadsKg.seatedLegCurl",
          "restSeconds": 120
        }
      ],
      "effortCue": "Clearly stop before failure; maintain demonstrated technique and easy-to-moderate effort",
      "rirTarget": null,
      "loadSelection": "COPY_EXPLICIT_CURRENT_ESTABLISHED_LOAD_PER_CONFIGURATION"
    }
  }
]
```

Essential stimulus: Initial repeated exposure to lower push, upper push/pull and knee flexion; not complete long-term repertoire closure.

Smaller alternatives:

- ASK technique/load: Required if any one configuration is unknown.
- Single familiarization session: Permissible if only one day; exact two-day week is not inferred.
- Heavy barbell/load from body mass: Unsupported.

Next check: Record actual task/configuration/dose, technique/effort and current symptoms after execution and before next dependent session; contradictory response disables escalation.

Fallback: ASK missing decision-changing input; HOLD unsupported/uncalibrated dose; clinical dependency CLINICAL_HUMAN_REQUIRED.

Evidence linkage: C02, C03; R2-S03, R2-S04, R2-S11. Exact-dose status: DECIDED_FINITE_PROTOCOL_NOT_POPULATION_LAW; independent disposition required.

Week1 → response → week2: R2-ST-EST-1X8 x2 → per-task actual loads/reps/technique and effort, no new restrictions, recoverability → REPEAT_ONLY; P03 requires own comparable capacity/context. This repeat is SUPPORTED_KEEP, not positive progression.


## Retained open portions

- Never-exposed continuous run beyond establishment
- Unknown movement competence/load; no technique inference
- Initial sustained harder Run target
- Complete individualized initial training program across all configurations

All actual prescriptive approvals must be queued by Chief for funded human revalidation. No queue entry is created by this author. New applicable evidence, changed population/recipe/target, contradictory response or adverse event invalidates dependent assumptions and triggers re-review.

Sources/provenance and exact read access: [LITERATURE_SNAPSHOT_R2.json](LITERATURE_SNAPSHOT_R2.json); claim classification/counterevidence: [SCIENTIFIC_CLAIM_MAP_R2.json](SCIENTIFIC_CLAIM_MAP_R2.json). Internal ACF labels denote these R2 gaps and do not rename canonical historical G01–G04 governance gates.

## Exact runtime transport and recipe crosswalk

The earlier descriptive recipe IDs are semantic aliases. They do not add recipes or approvals. The current integrated registry supplies exact executable recipe IDs; the current independent disposition must cover those exact recipes and bounds.

P01 is source-bound to explicitly nonclinical adults aged18–65. The trial physician procedure is a transfer limitation; no app clinical clearance is inferred. Calendars [MON,WED,SAT], [TUE,THU,SAT] and [MON,WED,FRI] are one operational finite protocol, not separate dose laws. P02 current task loads/configuration/technique must all be demonstrated.

### R2-P01

```json
{
  "registry": "CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json",
  "inputSchema": "CoachingCore/r2/SHADOW_INPUT_R2_SCHEMA.json",
  "semanticsVsTransport": "requiredInputs are domain requirements; only fieldCrosswalk entries name transport fields. No undocumented field is treated as an existing API property.",
  "recipeIdAliases": {
    "R2-RUN-EST-10X1": "R2-RUN-EST-10X1"
  },
  "fieldCrosswalk": {
    "semantic current walking": "event.facts.walkMinutes",
    "semantic comfortable talk": "event.facts.comfortableTalk",
    "semantic days": "event.facts.availableDays",
    "age applicability": "athleteState.ageYears"
  },
  "authority": "Integrated registry exact recipe and current independent SSCTR disposition govern execution. Alias/composition is not an additional dose or independent approval."
}
```

### R2-P02

```json
{
  "registry": "CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json",
  "inputSchema": "CoachingCore/r2/SHADOW_INPUT_R2_SCHEMA.json",
  "semanticsVsTransport": "requiredInputs are domain requirements; only fieldCrosswalk entries name transport fields. No undocumented field is treated as an existing API property.",
  "recipeIdAliases": {
    "R2-ST-EST-1X8": "R2-ST-EST-1X8"
  },
  "fieldCrosswalk": {
    "semantic current task familiarization": "event.facts.configurationFamiliar && techniqueDemonstrated && loadEstablished",
    "numeric current loads": "event.facts.loadsKg",
    "semantic two days": "event.facts.availableDays"
  },
  "authority": "Integrated registry exact recipe and current independent SSCTR disposition govern execution. Alias/composition is not an additional dose or independent approval."
}
```

