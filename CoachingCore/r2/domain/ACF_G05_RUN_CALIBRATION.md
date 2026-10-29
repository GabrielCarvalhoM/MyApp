# ACF-G05 — Run calibration / tolerance

Revision DCR2-SCI-r2 · 2026-10-24 · author /root/science_synthesis.

**CANDIDATE_PENDING_INDEPENDENT_SSCTR.** This synthesis is not scientific approval, Product Truth, clinical clearance, efficacy validation or real-user authorization. Scope: offline Node24 executable reference/oracle only.

Every target retains its construct, source and uncertainty; familiar field target can be executable without being LT2/CS.

The numerical recipes below are **DECIDED finite protocol choices**, not universal physiological thresholds. Evidence supporting a programming principle does not prove an exact dose. Every positive output requires exact independent disposition and current complete runtime binding. A synthetic witness proves semantic conformance only.

## R2-P14 — Run calibration with explicit construct and familiar-session targets

Request `CALIBRATE_RUN`. SUPPORTED_WITH_LIMITS_FOR_CONSTRUCT_SEPARATION_AND_REUSE; exact new family calibration not supplied. Confidence MODERATE: Bounded protocol selection with explicit individual context; exact dose/effect remains unvalidated.

Select exact familiar template with allowed method and full context. Unknown physiology can still permit a clearly labelled field-session target; unknown task calibration cannot. Absent harder-session calibration choose only independently admissible familiar easy alternative with explicit tradeoff, otherwise ASK.

Required inputs:

- family/intent
- actual current target and method/construct, provenance and uncertainty
- same-task dose and response history
- surface/grade/weather/context
- explicit equipment/data quality; no wearable mandatory for easy

Guards:

- Only familiar currently demonstrated recipe,target,conditions
- CS !=LT2!=MLSS!=race pace; no automatic equivalence
- Power device/algorithm needs its own validated and familiar binding; no generic watts target
- HR/RPE are supporting observations unless individually calibrated to defined construct
- Recent-race data is evidence about that performance, not automatic target for another family/distance

Finite candidate contract:

```json
[
  {
    "recipeId": "R2-EASY-20",
    "modality": "RUN",
    "family": "EASY",
    "prescription": {
      "durationMinutes": 20,
      "targetMethod": "COMFORTABLE_CONVERSATION",
      "paceTarget": null,
      "hrTarget": null
    }
  },
  {
    "recipeId": "R2-CRUISE-3X5",
    "modality": "RUN",
    "family": "THRESHOLD_CRUISE",
    "prescription": {
      "warmupMinutes": 10,
      "repetitions": 3,
      "workMinutes": 5,
      "recoveryBetweenRepetitionsSeconds": 120,
      "recoveryMode": "EASY_JOG_OR_WALK",
      "cooldownMinutes": 10,
      "paceSecondsPerKmFrom": "facts.paceSecondsPerKm",
      "targetConstruct": "FAMILIAR_FIELD_SESSION_TARGET",
      "noLT2CSEquivalence": true
    }
  },
  {
    "recipeId": "R2-RUN-4X3",
    "modality": "RUN",
    "family": "VO2_STYLE",
    "prescription": {
      "warmupMinutes": 10,
      "repetitions": 4,
      "workMinutes": 3,
      "recoveryBetweenRepetitionsSeconds": 120,
      "recoveryMode": "EASY_JOG_OR_WALK",
      "cooldownMinutes": 10,
      "paceSecondsPerKmFrom": "facts.paceSecondsPerKm",
      "targetConstruct": "FAMILIAR_FIELD_SESSION_TARGET",
      "noVO2OrLT2Equivalence": true
    }
  },
  {
    "recipeId": "R2-EASY-40",
    "modality": "RUN",
    "family": "LONG_RUN",
    "prescription": {
      "durationMinutes": 40,
      "targetMethod": "COMFORTABLE_CONVERSATION",
      "paceTarget": null,
      "hrTarget": null
    }
  },
  {
    "recipeId": "R2-EASY20-STRIDES",
    "modality": "RUN",
    "family": "EASY_STRIDES",
    "prescription": {
      "easyMinutes": 20,
      "targetMethod": "COMFORTABLE_CONVERSATION",
      "strides": {
        "repetitions": 4,
        "durationSeconds": 15,
        "recoveryWalkSeconds": 60,
        "cue": "Smooth familiar relaxed fast running, never maximal sprint"
      }
    }
  }
]
```

Essential stimulus: Match actual target construct to session intent; an easy downgrade explicitly loses harder stimulus, never claims equivalence.

Next check: Record executed same-method target/dose, actual effort, conditions and recovery; conflicting data invalidates target reuse, not repaired by averaging different constructs.

Fallback: ASK/HOLD/NOT_SUPPORTED_YET for uncalibrated task; familiar easy only when explicitly admissible and accepted.

Evidence linkage: C01, C03, C10; R2-S01, R2-S09, R2-S10, R2-S11. Exact-dose status: FAMILIAR_SESSION_SELECTION_NOT_DE_NOVO_THRESHOLD_OR_VO2_CALIBRATION.

## Family-specific calibration limits

- **EASY**: Comfortable low-demand aerobic exposure; not a measured physiological zone. Methods: COMFORTABLE_CONVERSATION with self-paced current effort; known same-task pace anchor as secondary only; HR from individually established same-context anchor as secondary trend. Applicability: Currently familiar20min easy, or separately approved P01 establishment; no wearable required. Uncertainty: Speech cue is useful effort regulation, not precise LT1/VT1 identification. Fallback: Walk/slow to retain cue; novel continuous tolerance -> P01 eligibility or ASK.
- **RECOVERY_EASY**: Lower-demand session purpose relative to athlete's prior work; no distinct validated universal physiological zone. Methods: same comfortable effort cue with separately familiar lower-duration candidate. Applicability: Purpose/context and current familiar dose explicit. Uncertainty: Recovery benefit cannot be inferred from label or HR. Fallback: Use familiar easy if independently admissible, otherwise ASK; never assert faster recovery.
- **STEADY**: Session-specific sustained moderate/higher intent as explicitly defined; not automatically threshold. Methods: current FIELD_SESSION_TARGET with comparable observed sustainable duration/effort; task-specific lab anchor with protocol metadata. Applicability: Same current field target, duration and conditions. Uncertainty: No single RPE/HR/percentage defines steady; generic first prescription remains open. Fallback: Familiar easy if accepted downgrade preserves immediate goal, otherwise ASK.
- **THRESHOLD_CRUISE**: Controlled repeated sustainable higher aerobic work; named construct depends on measured method. Methods: FIELD_SESSION_TARGET for same work/rest pattern with explicit no-LT2 equivalence; measured LT2 or MLSS with protocol metadata, only separately reviewed binding. Applicability: Exact3x5 pattern/pace currently observed tolerated; current target provenance explicit. Uncertainty: Pace from one race or generic RPE does not establish LT2/MLSS/CS. Fallback: Uncalibrated threshold -> familiar easy if explicitly allowed, else ASK/HOLD.
- **VO2_STYLE**: Familiar repeated harder work; no guarantee measured VO2max time from label. Methods: FAMILIAR_FIELD_SESSION_TARGET pace with same work/rest and actual response. Applicability: Exact four3min bouts currently familiar, calibrated task target, comparable surface and recovery. Uncertainty: HR kinetics lag during short work; pace/RPE alone cannot guarantee oxygen-uptake construct. Fallback: No extrapolated HR lag target/CS%/race converter; familiar easy or ASK.
- **SHORT_INTERVALS**: Short-bout session-specific performance intent. Methods: separately reviewed current field pattern and target. Applicability: Specific duration/rest/target and competency required; P14 does not create a protocol. Uncertainty: Short interval and stride/sprint/VO2 not interchangeable. Fallback: ASK/HOLD absent own recipe; do not borrow VO2-style or strides dose.
- **LONG_RUN**: Longer easy exposure relative to athlete's current baseline; not a universal minute threshold. Methods: COMFORTABLE_CONVERSATION with current demonstrated duration; same-context observed tolerance. Applicability: 40min currently familiar long/easy context, no sudden novel session distance; P08 separate45min path. Uncertainty: HR drift, heat, hills and duration change comparability; completed one long run is not an adaptation/safety rule. Fallback: Known shorter familiar easy, only if goal tradeoff explicit; unknown capacity ASK.
- **HILLS**: Task-specific grade/mechanical demand; not flat-pace equivalent. Methods: separately reviewed grade/surface/duration/effort with familiar technique. Applicability: Grade and eccentric/downhill exposure measured/familiar. Uncertainty: No flat race-pace conversion or downhill novelty by default. Fallback: Familiar flat easy if explicit suitable alternate, otherwise ASK.
- **STRIDES**: Brief relaxed coordination/speed exposure, never maximal sprint by default. Methods: RELAXED_FAST_TECHNIQUE_CUE with full familiar recovery. Applicability: Both20min easy and4x15s/60walk currently familiar and technically competent. Uncertainty: No HR/pace zone inferred; optional omission is not a new prescriptive approval. Fallback: Omit optional strides when unfamiliar; preserve easy if admissible.
- **RACE_PACE**: Event-specific currently demonstrated pace, not LT2/CS. Methods: same-distance recent actual performance with context/provenance; same-distance current validated field-session target. Applicability: Exact10K/HM calibration and week P11/P12/P13 prerequisites. Uncertainty: Conditions, fatigue, duration, course and recency matter; no fixed recency-days threshold. Fallback: Ask when old PR/different distance/hypothetical goal only; no automatic calculator conversion.

## Retained open portions

- First-ever threshold/VO2/short/hills/strides targets
- Generic HRmax zones
- Unvalidated power/device target
- Automatic race-distance conversion
- Steady/recovery labels as physiological zones

All actual prescriptive approvals must be queued by Chief for funded human revalidation. No queue entry is created by this author. New applicable evidence, changed population/recipe/target, contradictory response or adverse event invalidates dependent assumptions and triggers re-review.

Sources/provenance and exact read access: [LITERATURE_SNAPSHOT_R2.json](LITERATURE_SNAPSHOT_R2.json); claim classification/counterevidence: [SCIENTIFIC_CLAIM_MAP_R2.json](SCIENTIFIC_CLAIM_MAP_R2.json). Internal ACF labels denote these R2 gaps and do not rename canonical historical G01–G04 governance gates.

## Exact runtime transport and recipe crosswalk

The earlier descriptive recipe IDs are semantic aliases. They do not add recipes or approvals. The current integrated registry supplies exact executable recipe IDs; the current independent disposition must cover those exact recipes and bounds.

STRIDES uses only the combined currently tolerated easy20+4x15s/60walk template. Its easy20 is the familiar warmup; no standalone cold-stride prescription exists.

### R2-P14

```json
{
  "registry": "CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json",
  "inputSchema": "CoachingCore/r2/SHADOW_INPUT_R2_SCHEMA.json",
  "semanticsVsTransport": "requiredInputs are domain requirements; only fieldCrosswalk entries name transport fields. No undocumented field is treated as an existing API property.",
  "recipeIdAliases": {
    "R2-EASY-20": "R2-EASY-20",
    "R2-EASY-40": "R2-EASY-40",
    "R2-CRUISE-3X5": "R2-CRUISE-3X5",
    "R2-RUN-4X3": "R2-RUN-4X3",
    "R2-EASY20-STRIDES": "R2-EASY20-STRIDES"
  },
  "fieldCrosswalk": {
    "current family/target": "event.facts.family && targetMethod && construct && paceSecondsPerKm",
    "actual tolerance binding": "event.facts.toleratedRecipeId && toleranceFactId && familyFamiliar && targetEstablished && conditionsComparable && toleranceKnown",
    "output FIELD_SESSION_TARGET semantic": "registry FAMILIAR_FIELD_SESSION_TARGET; no physiological equivalence"
  },
  "authority": "Integrated registry exact recipe and current independent SSCTR disposition govern execution. Alias/composition is not an additional dose or independent approval."
}
```

