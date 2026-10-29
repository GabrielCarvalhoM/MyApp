# ACF-G04 — Hybrid taper / race week

Revision DCR2-SCI-r2 · 2026-10-24 · author /root/science_synthesis.

**CANDIDATE_PENDING_INDEPENDENT_SSCTR.** This synthesis is not scientific approval, Product Truth, clinical clearance, efficacy validation or real-user authorization. Scope: offline Node24 executable reference/oracle only.

Exact familiar event weeks retain Strength intent; endurance mean does not prove hybrid optimality.

The numerical recipes below are **DECIDED finite protocol choices**, not universal physiological thresholds. Evidence supporting a programming principle does not prove an exact dose. Every positive output requires exact independent disposition and current complete runtime binding. A synthetic witness proves semantic conformance only.

## R2-P11 — Run-first recreational10K familiar week

Request `TAPER_10K`. SUPPORTED_WITH_LIMITS_FOR_ENDURANCE_FRAMEWORK; EXACT_COMBINED_RECREATIONAL_HYBRID_WEEK_INDIRECT. Confidence LOW_TO_MODERATE: Endurance direction supported, exact hybrid composition/sex/training-status applicability indirect; independent review must decide bounded protocol admissibility.

Only propose the exact jointly reviewed familiar week with all guards and complete targets. Unknown event/target/strength intent -> ASK. Without combined-dose approval remain NOT_SUPPORTED_YET despite endurance framework evidence.

Required inputs:

- event distance/date=SUNDAY; current proximity and completed prefix
- previous familiar week and every included task/configuration currently admissible
- numeric current established three machine loads
- current racePaceSecondsPerKm calibrated at THIS event distance and comparable conditions
- strides and primer individually familiar
- explicit strength essential intent can accept finite1x5 intent; no optimality/maintenance claim
- calendar permits exact sequence without new clashes
- Run-first priority explicit

Guards:

- Endurance taper evidence is indirect for recreational hybrid week; exact combined prescription needs independent item approval
- Every included configuration/dose/target is familiar and current; no de novo race pace/load introduced
- No long-run build, no novel eccentric demand, no new exercise family
- If strength essential target cannot be represented by1x5, ASK/HOLD rather than delete Strength
- No universal taper percentage; seven days are finite exemplar, not all-athlete optimum
- No forced post-event load; clinical findings route human; nonclinical next capacity assessed before return

Finite candidate contract:

```json
[
  {
    "recipeId": "R2-TAPER-10K-WEEK",
    "modality": "HYBRID",
    "family": "EVENT_WEEK",
    "prescription": {
      "days": [
        {
          "day": "MON",
          "sessions": [
            {
              "recipeId": "R2-EASY-25"
            },
            {
              "recipeId": "R2-RACE-ST-1X5",
              "modality": "STRENGTH",
              "family": "RACE_WEEK_FAMILIAR",
              "prescription": {
                "exercises": [
                  {
                    "exercise": "legPress",
                    "sets": 1,
                    "reps": 5,
                    "loadKgFrom": "facts.loadsKg.legPress",
                    "restSeconds": 120,
                    "effortCue": "Familiar nonfailure execution; preserve technical/strength intent; no guaranteed chronic maintenance"
                  },
                  {
                    "exercise": "machineChestPress",
                    "sets": 1,
                    "reps": 5,
                    "loadKgFrom": "facts.loadsKg.machineChestPress",
                    "restSeconds": 120,
                    "effortCue": "Familiar nonfailure execution; preserve technical/strength intent; no guaranteed chronic maintenance"
                  },
                  {
                    "exercise": "seatedCableRow",
                    "sets": 1,
                    "reps": 5,
                    "loadKgFrom": "facts.loadsKg.seatedCableRow",
                    "restSeconds": 120,
                    "effortCue": "Familiar nonfailure execution; preserve technical/strength intent; no guaranteed chronic maintenance"
                  }
                ]
              }
            }
          ]
        },
        {
          "day": "TUE",
          "sessions": [
            {
              "recipeId": "R2-RACE-10K-CUE",
              "modality": "RUN",
              "family": "RACE_PACE",
              "prescription": {
                "warmupMinutes": 10,
                "repetitions": 3,
                "workMinutes": 3,
                "recoveryBetweenRepetitionsMinutes": 2,
                "cooldownMinutes": 10,
                "paceSecondsPerKmFrom": "facts.racePaceSecondsPerKm",
                "construct": "10K_RACE_PACE"
              }
            }
          ]
        },
        {
          "day": "WED",
          "sessions": [],
          "rest": true
        },
        {
          "day": "THU",
          "sessions": [
            {
              "recipeId": "R2-EASY20-STRIDES",
              "easyMinutes": 20,
              "strides": {
                "repetitions": 4,
                "durationSeconds": 15,
                "recoveryWalkSeconds": 60,
                "cue": "Relaxed familiar fast strides; no maximal sprint or HR target"
              }
            }
          ]
        },
        {
          "day": "FRI",
          "sessions": [],
          "rest": true
        },
        {
          "day": "SAT",
          "sessions": [
            {
              "recipeId": "R2-EASY-15",
              "optional": true
            }
          ]
        },
        {
          "day": "SUN",
          "sessions": [
            {
              "recipeId": "R2-RACE-10K",
              "distanceMetres": 10000
            }
          ]
        }
      ],
      "eventDistance": "10K",
      "strengthIntent": "PRESERVE_FAMILIAR_TECHNIQUE_AND_FORCE_EXPOSURE_WITH_LOWER_VOLUME_NOT_GUARANTEED_MAINTENANCE"
    }
  }
]
```

Essential stimulus: Familiar brief event-pace cue, low-demand easy contacts, event itself; familiar low-volume Strength exposure retains intent rather than guarantees adaptations.

Smaller alternatives:

- KEEP normal week: Valid absent material event-priority/taper need; fails only when normal optional/long volume conflicts with chosen event readiness.
- Remove only optional accessory: Prefer if sufficient. Full event-week variant requires why that alone cannot satisfy existing Run taper intent.
- Delete Strength: Unnecessary when familiar admissible low-volume exposure exists; otherwise ASK explicit intent.

Trade-off: Reduced training stimulus in exchange for event preparation and commitment change; exact individual peak uncertain.

Next check: Before each included task verify current eligibility/context; after event ask actual dose, symptoms/function and recovery before next load. No event→automatic percentage-return.

Fallback: ASK missing calibration/compatibility; HOLD unreviewed combined week; clinical branch CLINICAL_HUMAN_REQUIRED.

Evidence linkage: C04, C08, C09, C10; R2-S05, R2-S06, R2-S08, R2-S09, R2-S14. Exact-dose status: DECIDED_PROTOCOL_COMPOSITION_USING_FAMILIAR_TASKS; no direct RCT of this week or hybrid maintenance.

## R2-P12 — Run-first recreational half-marathon familiar week

Request `TAPER_HALF`. SUPPORTED_WITH_LIMITS_FOR_ENDURANCE_FRAMEWORK; EXACT_COMBINED_RECREATIONAL_HYBRID_WEEK_INDIRECT. Confidence LOW_TO_MODERATE: Endurance direction supported, exact hybrid composition/sex/training-status applicability indirect; independent review must decide bounded protocol admissibility.

Only propose the exact jointly reviewed familiar week with all guards and complete targets. Unknown event/target/strength intent -> ASK. Without combined-dose approval remain NOT_SUPPORTED_YET despite endurance framework evidence.

Required inputs:

- event distance/date=SUNDAY; current proximity and completed prefix
- previous familiar week and every included task/configuration currently admissible
- numeric current established three machine loads
- current racePaceSecondsPerKm calibrated at THIS event distance and comparable conditions
- strides and primer individually familiar
- explicit strength essential intent can accept finite1x5 intent; no optimality/maintenance claim
- calendar permits exact sequence without new clashes
- Run-first priority explicit

Guards:

- Endurance taper evidence is indirect for recreational hybrid week; exact combined prescription needs independent item approval
- Every included configuration/dose/target is familiar and current; no de novo race pace/load introduced
- No long-run build, no novel eccentric demand, no new exercise family
- If strength essential target cannot be represented by1x5, ASK/HOLD rather than delete Strength
- No universal taper percentage; seven days are finite exemplar, not all-athlete optimum
- No forced post-event load; clinical findings route human; nonclinical next capacity assessed before return

Finite candidate contract:

```json
[
  {
    "recipeId": "R2-TAPER-HALF-WEEK",
    "modality": "HYBRID",
    "family": "EVENT_WEEK",
    "prescription": {
      "days": [
        {
          "day": "MON",
          "sessions": [
            {
              "recipeId": "R2-EASY-25"
            },
            {
              "recipeId": "R2-RACE-ST-1X5",
              "modality": "STRENGTH",
              "family": "RACE_WEEK_FAMILIAR",
              "prescription": {
                "exercises": [
                  {
                    "exercise": "legPress",
                    "sets": 1,
                    "reps": 5,
                    "loadKgFrom": "facts.loadsKg.legPress",
                    "restSeconds": 120,
                    "effortCue": "Familiar nonfailure execution; preserve technical/strength intent; no guaranteed chronic maintenance"
                  },
                  {
                    "exercise": "machineChestPress",
                    "sets": 1,
                    "reps": 5,
                    "loadKgFrom": "facts.loadsKg.machineChestPress",
                    "restSeconds": 120,
                    "effortCue": "Familiar nonfailure execution; preserve technical/strength intent; no guaranteed chronic maintenance"
                  },
                  {
                    "exercise": "seatedCableRow",
                    "sets": 1,
                    "reps": 5,
                    "loadKgFrom": "facts.loadsKg.seatedCableRow",
                    "restSeconds": 120,
                    "effortCue": "Familiar nonfailure execution; preserve technical/strength intent; no guaranteed chronic maintenance"
                  }
                ]
              }
            }
          ]
        },
        {
          "day": "TUE",
          "sessions": [
            {
              "recipeId": "R2-RACE-HALF-CUE",
              "modality": "RUN",
              "family": "RACE_PACE",
              "prescription": {
                "warmupMinutes": 10,
                "repetitions": 2,
                "workMinutes": 5,
                "recoveryBetweenRepetitionsMinutes": 2,
                "cooldownMinutes": 10,
                "paceSecondsPerKmFrom": "facts.racePaceSecondsPerKm",
                "construct": "HALF_MARATHON_RACE_PACE"
              }
            }
          ]
        },
        {
          "day": "WED",
          "sessions": [],
          "rest": true
        },
        {
          "day": "THU",
          "sessions": [
            {
              "recipeId": "R2-EASY20-STRIDES",
              "easyMinutes": 20,
              "strides": {
                "repetitions": 4,
                "durationSeconds": 15,
                "recoveryWalkSeconds": 60,
                "cue": "Relaxed familiar fast strides; no maximal sprint or HR target"
              }
            }
          ]
        },
        {
          "day": "FRI",
          "sessions": [],
          "rest": true
        },
        {
          "day": "SAT",
          "sessions": [
            {
              "recipeId": "R2-EASY-15",
              "optional": true
            }
          ]
        },
        {
          "day": "SUN",
          "sessions": [
            {
              "recipeId": "R2-RACE-HALF",
              "distanceMetres": 21097.5
            }
          ]
        }
      ],
      "eventDistance": "HALF",
      "strengthIntent": "PRESERVE_FAMILIAR_TECHNIQUE_AND_FORCE_EXPOSURE_WITH_LOWER_VOLUME_NOT_GUARANTEED_MAINTENANCE"
    }
  }
]
```

Essential stimulus: Familiar brief event-pace cue, low-demand easy contacts, event itself; familiar low-volume Strength exposure retains intent rather than guarantees adaptations.

Smaller alternatives:

- KEEP normal week: Valid absent material event-priority/taper need; fails only when normal optional/long volume conflicts with chosen event readiness.
- Remove only optional accessory: Prefer if sufficient. Full event-week variant requires why that alone cannot satisfy existing Run taper intent.
- Delete Strength: Unnecessary when familiar admissible low-volume exposure exists; otherwise ASK explicit intent.

Trade-off: Reduced training stimulus in exchange for event preparation and commitment change; exact individual peak uncertain.

Next check: Before each included task verify current eligibility/context; after event ask actual dose, symptoms/function and recovery before next load. No event→automatic percentage-return.

Fallback: ASK missing calibration/compatibility; HOLD unreviewed combined week; clinical branch CLINICAL_HUMAN_REQUIRED.

Evidence linkage: C04, C08, C09, C10; R2-S05, R2-S06, R2-S08, R2-S09, R2-S14. Exact-dose status: DECIDED_PROTOCOL_COMPOSITION_USING_FAMILIAR_TASKS; no direct RCT of this week or hybrid maintenance.

## R2-P13 — Balanced temporary event-priority familiar week

Request `TAPER_BALANCED`. SUPPORTED_WITH_LIMITS_FOR_ENDURANCE_FRAMEWORK; EXACT_COMBINED_RECREATIONAL_HYBRID_WEEK_INDIRECT. Confidence LOW_TO_MODERATE: Endurance direction supported, exact hybrid composition/sex/training-status applicability indirect; independent review must decide bounded protocol admissibility.

Only propose the exact jointly reviewed familiar week with all guards and complete targets. Unknown event/target/strength intent -> ASK. Without combined-dose approval remain NOT_SUPPORTED_YET despite endurance framework evidence.

Required inputs:

- event distance/date=SUNDAY; current proximity and completed prefix
- previous familiar week and every included task/configuration currently admissible
- numeric current established three machine loads
- current racePaceSecondsPerKm calibrated at THIS event distance and comparable conditions
- strides and primer individually familiar
- explicit strength essential intent can accept finite1x5 intent; no optimality/maintenance claim
- calendar permits exact sequence without new clashes
- athlete explicitly chose TEMPORARY_EVENT_PRIORITY; end date and original Balanced objective retained

Guards:

- Endurance taper evidence is indirect for recreational hybrid week; exact combined prescription needs independent item approval
- Every included configuration/dose/target is familiar and current; no de novo race pace/load introduced
- No long-run build, no novel eccentric demand, no new exercise family
- If strength essential target cannot be represented by1x5, ASK/HOLD rather than delete Strength
- No universal taper percentage; seven days are finite exemplar, not all-athlete optimum
- No forced post-event load; clinical findings route human; nonclinical next capacity assessed before return

Finite candidate contract:

```json
[
  {
    "recipeId": "R2-TAPER-BALANCED-WEEK",
    "modality": "HYBRID",
    "family": "EVENT_WEEK",
    "prescription": {
      "days": [
        {
          "day": "MON",
          "sessions": [
            {
              "recipeId": "R2-EASY-25"
            },
            {
              "recipeId": "R2-RACE-ST-1X5",
              "modality": "STRENGTH",
              "family": "RACE_WEEK_FAMILIAR",
              "prescription": {
                "exercises": [
                  {
                    "exercise": "legPress",
                    "sets": 1,
                    "reps": 5,
                    "loadKgFrom": "facts.loadsKg.legPress",
                    "restSeconds": 120,
                    "effortCue": "Familiar nonfailure execution; preserve technical/strength intent; no guaranteed chronic maintenance"
                  },
                  {
                    "exercise": "machineChestPress",
                    "sets": 1,
                    "reps": 5,
                    "loadKgFrom": "facts.loadsKg.machineChestPress",
                    "restSeconds": 120,
                    "effortCue": "Familiar nonfailure execution; preserve technical/strength intent; no guaranteed chronic maintenance"
                  },
                  {
                    "exercise": "seatedCableRow",
                    "sets": 1,
                    "reps": 5,
                    "loadKgFrom": "facts.loadsKg.seatedCableRow",
                    "restSeconds": 120,
                    "effortCue": "Familiar nonfailure execution; preserve technical/strength intent; no guaranteed chronic maintenance"
                  }
                ]
              }
            }
          ]
        },
        {
          "day": "TUE",
          "sessions": [
            {
              "recipeId": "R2-RACE-10K-CUE",
              "modality": "RUN",
              "family": "RACE_PACE",
              "prescription": {
                "warmupMinutes": 10,
                "repetitions": 3,
                "workMinutes": 3,
                "recoveryBetweenRepetitionsMinutes": 2,
                "cooldownMinutes": 10,
                "paceSecondsPerKmFrom": "facts.racePaceSecondsPerKm",
                "construct": "10K_RACE_PACE"
              }
            }
          ]
        },
        {
          "day": "WED",
          "sessions": [],
          "rest": true
        },
        {
          "day": "THU",
          "sessions": [
            {
              "recipeId": "R2-EASY20-STRIDES",
              "easyMinutes": 20,
              "strides": {
                "repetitions": 4,
                "durationSeconds": 15,
                "recoveryWalkSeconds": 60,
                "cue": "Relaxed familiar fast strides; no maximal sprint or HR target"
              }
            }
          ]
        },
        {
          "day": "FRI",
          "sessions": [],
          "rest": true
        },
        {
          "day": "SAT",
          "sessions": [
            {
              "recipeId": "R2-EASY-15",
              "optional": true
            }
          ]
        },
        {
          "day": "SUN",
          "sessions": [
            {
              "recipeId": "R2-RACE-10K",
              "distanceMetres": 10000
            }
          ]
        }
      ],
      "eventDistance": "10K",
      "strengthIntent": "PRESERVE_FAMILIAR_TECHNIQUE_AND_FORCE_EXPOSURE_WITH_LOWER_VOLUME_NOT_GUARANTEED_MAINTENANCE"
    }
  }
]
```

Essential stimulus: Familiar brief event-pace cue, low-demand easy contacts, event itself; familiar low-volume Strength exposure retains intent rather than guarantees adaptations.

Smaller alternatives:

- KEEP normal week: Valid absent material event-priority/taper need; fails only when normal optional/long volume conflicts with chosen event readiness.
- Remove only optional accessory: Prefer if sufficient. Full event-week variant requires why that alone cannot satisfy existing Run taper intent.
- Delete Strength: Unnecessary when familiar admissible low-volume exposure exists; otherwise ASK explicit intent.

Trade-off: Reduced training stimulus in exchange for event preparation and commitment change; exact individual peak uncertain.

Next check: Before each included task verify current eligibility/context; after event ask actual dose, symptoms/function and recovery before next load. No event→automatic percentage-return.

Fallback: ASK missing calibration/compatibility; HOLD unreviewed combined week; clinical branch CLINICAL_HUMAN_REQUIRED.

Evidence linkage: C04, C08, C09, C10; R2-S05, R2-S06, R2-S08, R2-S09, R2-S14. Exact-dose status: DECIDED_PROTOCOL_COMPOSITION_USING_FAMILIAR_TASKS; no direct RCT of this week or hybrid maintenance.


## Retained open portions

- Individual optimal combined taper
- First-ever race readiness
- Strength1x5 guaranteed maintenance
- Post-event automatic recovery dose
- Novel race-pace calibration and unfamiliar speed/strength exposure

All actual prescriptive approvals must be queued by Chief for funded human revalidation. No queue entry is created by this author. New applicable evidence, changed population/recipe/target, contradictory response or adverse event invalidates dependent assumptions and triggers re-review.

Sources/provenance and exact read access: [LITERATURE_SNAPSHOT_R2.json](LITERATURE_SNAPSHOT_R2.json); claim classification/counterevidence: [SCIENTIFIC_CLAIM_MAP_R2.json](SCIENTIFIC_CLAIM_MAP_R2.json). Internal ACF labels denote these R2 gaps and do not rename canonical historical G01–G04 governance gates.

## Exact runtime transport and recipe crosswalk

The earlier descriptive recipe IDs are semantic aliases. They do not add recipes or approvals. The current integrated registry supplies exact executable recipe IDs; the current independent disposition must cover those exact recipes and bounds.

### R2-P11

```json
{
  "registry": "CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json",
  "inputSchema": "CoachingCore/r2/SHADOW_INPUT_R2_SCHEMA.json",
  "semanticsVsTransport": "requiredInputs are domain requirements; only fieldCrosswalk entries name transport fields. No undocumented field is treated as an existing API property.",
  "recipeIdAliases": {
    "R2-TAPER-10K-WEEK": "COMPOSITION_OF_POLICY_RECIPE_IDS"
  },
  "fieldCrosswalk": {
    "exact week context": "event.facts.allRecipesFamiliar && runTargetsCalibrated && essentialRunFeasible && scheduleConfirmed",
    "current event pace": "event.facts.racePaceSecondsPerKm; eventDistance=10K",
    "strength intent": "event.facts.strengthIntent=MAINTAIN_FAMILIAR; loadsKg"
  },
  "authority": "Integrated registry exact recipe and current independent SSCTR disposition govern execution. Alias/composition is not an additional dose or independent approval."
}
```

### R2-P12

```json
{
  "registry": "CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json",
  "inputSchema": "CoachingCore/r2/SHADOW_INPUT_R2_SCHEMA.json",
  "semanticsVsTransport": "requiredInputs are domain requirements; only fieldCrosswalk entries name transport fields. No undocumented field is treated as an existing API property.",
  "recipeIdAliases": {
    "R2-TAPER-HALF-WEEK": "COMPOSITION_OF_POLICY_RECIPE_IDS"
  },
  "fieldCrosswalk": {
    "exact week context": "event.facts.allRecipesFamiliar && runTargetsCalibrated && essentialRunFeasible && scheduleConfirmed",
    "current event pace": "event.facts.racePaceSecondsPerKm; eventDistance=HALF_MARATHON",
    "strength intent": "event.facts.strengthIntent=MAINTAIN_FAMILIAR; loadsKg"
  },
  "authority": "Integrated registry exact recipe and current independent SSCTR disposition govern execution. Alias/composition is not an additional dose or independent approval."
}
```

### R2-P13

```json
{
  "registry": "CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json",
  "inputSchema": "CoachingCore/r2/SHADOW_INPUT_R2_SCHEMA.json",
  "semanticsVsTransport": "requiredInputs are domain requirements; only fieldCrosswalk entries name transport fields. No undocumented field is treated as an existing API property.",
  "recipeIdAliases": {
    "R2-TAPER-BALANCED-WEEK": "COMPOSITION_OF_POLICY_RECIPE_IDS"
  },
  "fieldCrosswalk": {
    "temporary selected event priority": "event.facts.eventPriorityConfirmed with BALANCED athlete",
    "exact week context": "event.facts.allRecipesFamiliar && runTargetsCalibrated && essentialRunFeasible && scheduleConfirmed"
  },
  "authority": "Integrated registry exact recipe and current independent SSCTR disposition govern execution. Alias/composition is not an additional dose or independent approval."
}
```

