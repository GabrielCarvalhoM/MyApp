Continuing from [Branch · Branch · Analisar fórmula de sucesso](chatgpt-conversation://6ae08e34-b0d8-83e8-b084-c6c326903fec): Use Work mode to canonize and document the V1 wearable/evidence strategy for repository GabrielCarvalhoM/MyApp, in a new isolated documentation/product-decision branch (for example chore/v1-healthkit-workoutkit-evidence). Do not alter the current R7-A frozen Coaching Core runtime, sports policy, frozen tests, review branches, R7-B0 implementation, Growth patch, or Figma. This mission is product/architecture documentation only and must use the existing governance/roadmap/canonical index rather than inventing a new system.

Record these approved Founder decisions:

1) V1 wearable/health strategy:
- Apple Health / HealthKit is the only external health/activity ingestion path in V1.
- No direct Garmin/COROS/Polar cloud API in V1.
- No generic direct BLE wearable integration in V1.
- No structured workout push to Garmin/COROS/Polar in V1.
- Direct provider integrations move to post-V1/V2 and will be prioritized using real beta usage/data-quality evidence. Garmin is a likely early candidate because Garmin→Apple Health can be comparatively limited.

2) Apple Watch V1 exception:
- Add WorkoutKit as a V1 capability to send structured workouts from the app to the Apple Watch native Workout experience.
- HealthKit is used to ingest the resulting execution/health data back into the app.
- Architecture conceptually: Adaptive Engine / Plan → WorkoutKit → Apple Watch → HealthKit → CanonicalEvidence → CoachingCore.
- Keep this separate from third-party wearable direct integrations; WorkoutKit is a native Apple-platform capability, not evidence ingestion.
- Document support for structured workout concepts only at the roadmap/architecture level here (warmup/work/recovery/cooldown, duration/distance targets, alerts such as pace/HR/power/cadence where supported by WorkoutKit). Do not implement it in this mission.

3) HealthKit is a transport/source, not an evidence-quality guarantee.
- Coaching/evidence models must be capability-based: inspect the fields actually available for each workout rather than infer richness from provider/brand.
- Document a minimal conceptual evidence-depth model such as SUMMARY / STANDARD / RICH (or equivalent) based on available capabilities such as HR samples, pace samples, route, elevation, laps/splits, running dynamics, etc.
- Do not implement this in the frozen R7-A runtime.

4) Workout Evidence Enrichment in V1.
- Imported workouts may be enriched by the user only where data is genuinely missing.
- Core rule: EXTERNAL_EVIDENCE_IMMUTABILITY.
- Any value received from Apple Health or another external measured source is immutable/read-only in the app.
- The user may only add fields that are absent.
- Manual supplements retain provenance USER_REPORTED and must never overwrite or masquerade as imported/measured data.

5) Wrong/suspicious imported data:
- If an imported value is present but the user believes it is wrong, they cannot edit it.
- Product semantics should support marking a field or whole workout as invalid/excluded from coaching analysis (for example EXCLUDED_BY_USER / IGNORE_FOR_ANALYSIS) while preserving the original source value/provenance.
- Do not implement UI here; only document behavior.

6) Manual enrichment must be intentionally bounded.
Allow useful scalar/contextual fields when missing, for example:
- average HR;
- max HR;
- average cadence;
- elevation gain;
- RPE;
- completion status (completed/partial/stopped);
- legs perception;
- breathing perception;
- discomfort/pain signal within nonclinical product boundaries;
- notes;
- reason for partial/stopped workout.

Do NOT allow users to fabricate time-series or measured streams such as:
- second-by-second HR;
- GPS route;
- pace stream;
- cadence stream;
- other synthetic measured series.

7) Partial source data rule:
- If the source provides some fields but not others (for example min/max HR but no average HR), only the missing fields may be enriched.
- Existing source values remain immutable.

8) Provenance model:
Document at minimum conceptual provenance distinctions:
- MEASURED / IMPORTED;
- USER_REPORTED;
- DERIVED.
Include source metadata where appropriate.
Measured external evidence has higher authority than user-reported supplements for the same field, but in normal UX supplementation is only allowed when the field is missing, so conflicts should be prevented by design.

9) Strength V1:
- Strength primarily uses in-app Vilumo logging for exercise/sets/reps/load/RPE-RIR/substitution/completion.
- Wearable evidence is more critical for Running Intelligence than Strength Intelligence.

10) Beta measurement / roadmap trigger:
Add a privacy-minimized measurement plan for beta to observe:
- source/provider when identifiable;
- which evidence capabilities actually arrived;
- missing-field patterns;
- evidence depth;
- manual enrichment frequency;
- whether limited evidence materially affects coaching confidence, completion, retention, or user friction.
Do not log sensitive raw health values unnecessarily.
This evidence will decide when direct Garmin/COROS/Polar integrations justify engineering cost.

11) Post-V1/V2 direct integrations:
- Architecture: Provider Adapter → CanonicalEvidence → CoachingCore.
- Core remains vendor-agnostic.
- Prioritize providers using actual beta adoption/data-loss impact rather than assumption.
- Structured workout push to Garmin/COROS/Polar is a later roadmap item.
- Live telemetry/streaming remains later and only if validated by a real use case.

12) Privacy/security/LGPD alignment:
- Align with the existing Engineering Quality & Security Foundation.
- Data minimization, purpose limitation, safe logging/redaction, revoke/disconnect behavior, deletion/export implications, and no unnecessary raw health logging.
- Do not claim legal compliance; mark legal/DPO review where applicable.

13) UI/product semantics for later reconciliation only (no Figma changes):
- imported values visibly source-labeled and read-only;
- missing values offer an action like '+ Adicionar';
- suspicious imported values offer 'Ignorar na análise' or equivalent, not edit;
- clearly distinguish measured/imported vs user-reported values.

14) Roadmap/canonical updates:
Update minimally the appropriate existing authorities, for example Product Decision Register, roadmap, canonical index, product architecture, evidence-domain/integration docs, and R7-B0 readiness pack only where relevant. Add one compact decision artifact if useful. Do not create a large new documentation system.

15) R7-A integrity:
Explicitly state that these decisions strengthen future evidence provenance/ingestion semantics but do NOT modify the current frozen R7-A runtime or reopen its decision-authority gate.
Validate byte-for-byte that R7A-RESIDUAL-AUTHORITY-FREEZE-1 runtime/policy/tests/freeze remain untouched versus commit 7d2da3603e224124696a2290766ec448080f3264.

16) Git:
Create/use a dedicated isolated branch, commit and push only documentation/roadmap/decision artifacts. Do not merge.

17) Final report must include:
- branch;
- commit SHA;
- authorities updated;
- exact Founder decisions recorded;
- V1 roadmap changes;
- HealthKit vs WorkoutKit responsibilities;
- evidence/provenance model;
- enrichment/immutability rules;
- beta measurement strategy;
- deferred direct wearable integrations;
- future B0/KMP implications if any;
- confirmation that frozen Coaching Core bytes are untouched.

STOP after documentation/canonization. Do not start implementation, R7-B0, KMP, HealthKit code, WorkoutKit code, backend work, or Figma edits.
