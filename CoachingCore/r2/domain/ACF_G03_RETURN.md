# ACF-G03 — Nonclinical return after pause

Revision DCR2-SCI-r2 · 2026-10-24 · author /root/science_synthesis.

**CANDIDATE_PENDING_INDEPENDENT_SSCTR.** This synthesis is not scientific approval, Product Truth, clinical clearance, efficacy validation or real-user authorization. Scope: offline Node24 executable reference/oracle only.

Retain old configuration context, re-establish present load/effort; never old fitness times a percentage.

The numerical recipes below are **DECIDED finite protocol choices**, not universal physiological thresholds. Evidence supporting a programming principle does not prove an exact dose. Every positive output requires exact independent disposition and current complete runtime binding. A synthetic witness proves semantic conformance only.

## R2-P09 — Nonclinical Run re-entry with present capacity re-established

Request `RETURN_RUN`. SUPPORTED_WITH_LIMITS_FOR_FRAMEWORK_ONLY. Confidence MODERATE: Bounded protocol selection with explicit individual context; exact dose/effect remains unvalidated.

Propose20min easy familiar present-capacity session; observe response before next step. Unknown current capacity never gets20 by default.

Required inputs:

- reason explicitly nonclinical (e.g. travel/time) and interruption dates/days
- prior familiar modality/session/configuration
- currentRunMinutes >=20 and capacityEstablishedToday true with comfortable speech
- no clinical symptoms or clinical-return dependency

Guards:

- Short/moderate are descriptive interruption bands, never a dosing formula
- Old race/HR/pace and prior45min are not present capacity
- Unknown current capacity -> establishment path only if its own complete eligibility; otherwise ASK

Finite candidate contract:

```json
[
  {
    "recipeId": "R2-RETURN-RUN-20",
    "modality": "RUN",
    "family": "NONCLINICAL_REENTRY",
    "prescription": {
      "durationMinutes": 20,
      "targetMethod": "COMFORTABLE_CONVERSATION",
      "paceTarget": null,
      "hrTarget": null
    }
  }
]
```

Essential stimulus: Re-establish continuous familiar easy exposure at present demonstrated ability.

Smaller alternatives:

- ASK: Required if interruption reason, eligibility or present capacity absent.
- Old normal week: Unsupported transfer of pre-pause fitness.

Next check: Record actual task/configuration/dose, technique/effort and current symptoms after execution and before next dependent session; contradictory response disables escalation.

Fallback: ASK missing decision-changing input; HOLD unsupported/uncalibrated dose; clinical dependency CLINICAL_HUMAN_REQUIRED.

Evidence linkage: C06, C10; R2-S12, R2-S13, R2-S09, R2-S10. Exact-dose status: PRESENT_DEMONSTRATED_CAPACITY_SELECTION; framework transfer only, not physiological return validation.

Trajectory: prior history -> current20min establishment -> actual execution/recovery -> repeat or separately reviewed P08 candidate; no universal return percentage.

## R2-P10 — Nonclinical Strength re-entry with loads re-established now

Request `RETURN_STRENGTH`. SUPPORTED_WITH_LIMITS_FOR_FRAMEWORK_ONLY. Confidence MODERATE: Bounded protocol selection with explicit individual context; exact dose/effect remains unvalidated.

Select exact present-load1x8 re-entry exposure, then observe before further sessions/progression; other modality is assessed independently.

Required inputs:

- explicit nonclinical interruption reason/dates
- prior familiar configurations
- all four current numerical loads and technique demonstrated today
- nonconsecutive schedule and capacity to perform1x8 per task

Guards:

- No old-load percentage or automatic prior full week
- Current machine/settings must match
- Unknown present capacity/competence -> ASK, not pseudo-low load

Finite candidate contract:

```json
[
  {
    "recipeId": "R2-RETURN-ST-1X8",
    "modality": "STRENGTH",
    "family": "NONCLINICAL_REENTRY",
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
      "rirTarget": null,
      "loadSelection": "CURRENT_ESTABLISHED_LOADS_NOT_OLD_MAXIMUM"
    }
  }
]
```

Essential stimulus: Familiar movement exposure at current load; no promise to preserve all previous adaptations.

Smaller alternatives:

- ASK task establishment: Required for any unknown load/competence.
- Full former3x8: Present tolerance not established.

Next check: Record actual task/configuration/dose, technique/effort and current symptoms after execution and before next dependent session; contradictory response disables escalation.

Fallback: ASK missing decision-changing input; HOLD unsupported/uncalibrated dose; clinical dependency CLINICAL_HUMAN_REQUIRED.

Evidence linkage: C02, C03, C06; R2-S03, R2-S04, R2-S11, R2-S12, R2-S13. Exact-dose status: CANDIDATE_REENTRY_PROTOCOL; P02 approval does not automatically approve post-pause transfer.

Trajectory: prior configuration -> current load establishment ->1x8 -> per-task response -> repeat or own admissible next-step recipe.


## Retained open portions

- Unknown current capacity without establishment inputs
- Clinical/illness/injury return
- Duration-based universal return algorithm
- Full hybrid re-entry week without two modality-specific current establishments

All actual prescriptive approvals must be queued by Chief for funded human revalidation. No queue entry is created by this author. New applicable evidence, changed population/recipe/target, contradictory response or adverse event invalidates dependent assumptions and triggers re-review.

Sources/provenance and exact read access: [LITERATURE_SNAPSHOT_R2.json](LITERATURE_SNAPSHOT_R2.json); claim classification/counterevidence: [SCIENTIFIC_CLAIM_MAP_R2.json](SCIENTIFIC_CLAIM_MAP_R2.json). Internal ACF labels denote these R2 gaps and do not rename canonical historical G01–G04 governance gates.

## Exact runtime transport and recipe crosswalk

The earlier descriptive recipe IDs are semantic aliases. They do not add recipes or approvals. The current integrated registry supplies exact executable recipe IDs; the current independent disposition must cover those exact recipes and bounds.

### R2-P09

```json
{
  "registry": "CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json",
  "inputSchema": "CoachingCore/r2/SHADOW_INPUT_R2_SCHEMA.json",
  "semanticsVsTransport": "requiredInputs are domain requirements; only fieldCrosswalk entries name transport fields. No undocumented field is treated as an existing API property.",
  "recipeIdAliases": {
    "R2-RETURN-RUN-20": "R2-EASY-20"
  },
  "fieldCrosswalk": {
    "reason": "event.facts.reason",
    "current capability": "event.facts.currentRunMinutes && capacityEstablishedToday && currentComfortableTalk"
  },
  "authority": "Integrated registry exact recipe and current independent SSCTR disposition govern execution. Alias/composition is not an additional dose or independent approval."
}
```

### R2-P10

```json
{
  "registry": "CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json",
  "inputSchema": "CoachingCore/r2/SHADOW_INPUT_R2_SCHEMA.json",
  "semanticsVsTransport": "requiredInputs are domain requirements; only fieldCrosswalk entries name transport fields. No undocumented field is treated as an existing API property.",
  "recipeIdAliases": {
    "R2-RETURN-ST-1X8": "R2-ST-EST-1X8"
  },
  "fieldCrosswalk": {
    "current config/load": "event.facts.currentConfigurationDemonstrated && currentLoadEstablished",
    "current numeric loads": "event.facts.loadsKg"
  },
  "authority": "Integrated registry exact recipe and current independent SSCTR disposition govern execution. Alias/composition is not an additional dose or independent approval."
}
```

