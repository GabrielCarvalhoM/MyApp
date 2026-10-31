# V1 wearable and workout evidence strategy

Revision **VWE-20261030-r1** · 2026-10-30 America/Sao_Paulo · owner Product Constitution & Governance. Authority: the current direct [Founder request](../audits/v1-healthkit-workoutkit-evidence-2026-10-30/FOUNDER_REQUEST.md), recorded in [PDR-1.13, DR-135–147](PRODUCT_DECISION_REGISTER.md). This is one bounded decision detail under the existing PDR, [canonical index](../canon/CANONICAL_INDEX.md) and [V1 roadmap](V1_RELEASE_SCOPE.md), not another governance system. Submission: **GOVERNANCE_READY_FOR_REVIEW**; current review/publication evidence belongs to the [mission audit](../audits/v1-healthkit-workoutkit-evidence-2026-10-30/TASK_CONTRACT.md).

## Decision, delta and limits

All binding clauses VWE-01–13 below are **DECIDED / CURRENT_PRODUCT_DECISION**, sourced to the Founder request, not empirical findings. `EXTERNAL_EVIDENCE_IMMUTABILITY` is the named binding rule within this decision; it does not create or renumber a thesis identity invariant. Examples and conceptual labels are design space where indicated. Prior PDR-1.8/1.9 bytes and rationale remain below their new amendment and in Git history.

The delta from DR-117–123 is narrow: **WorkoutKit becomes a V1 native Apple capability**, and missing-only enrichment/exclusion/provenance semantics become explicit. It supersedes the Apple Watch/WorkoutKit part of DR-117/122 and any blanket “all watch outbound is POST_V1” statement. Direct third-party integrations remain deferred. “Missing stays missing” means no fabricated fact: an explicitly added missing scalar becomes a user report, never a measurement. Earlier generic “manual correction” language does not authorize editing imported values.

### VWE-01 — V1 ingestion and platform (DR-135)

Apple Health / HealthKit is the **only external health/activity ingestion path in V1**, on the existing iOS-only platform scope (DR-120). Activities originally recorded by Apple Watch, Garmin, COROS, Polar or another app/device may be consumed only to the extent they actually reach HealthKit and are available and authorized. No direct Garmin/COROS/Polar cloud API, vendor account connection, generic direct BLE wearable integration, vendor-specific/FIT ingestion or structured workout push to those providers is V1. Manual and in-app logging remain valid non-external paths. The absent direct integrations are not a V1 or Coaching Core gate.

### VWE-02 — Apple Watch V1 exception (DR-136)

WorkoutKit sends structured workouts from Vilumo to the **native Apple Watch Workout experience**. HealthKit separately ingests resulting execution/health evidence. Conceptually:

`Adaptive Engine / Plan → WorkoutKit → Apple Watch → HealthKit → iOS adapter → CanonicalEvidence → CoachingCore`

WorkoutKit is a native Apple-platform delivery capability, **not evidence ingestion**, a direct third-party provider integration, execution proof or a custom Vilumo watch-app requirement. Sending or scheduling does not establish completion. HealthKit permission is separate from WorkoutKit authorization. Writing Vilumo's own completed activities to HealthKit remains the existing **OPEN_TECHNICAL_PRODUCT_DECISION** (DR-121); approval of WorkoutKit does not resolve it.

Roadmap-level structured concepts: warmup, work, recovery and cooldown steps; duration/distance targets; alerts such as pace, HR, power and cadence **where supported for the activity, configuration, OS and device**. No universal alert/target matrix or minimum OS is selected here. Future iOS Engineering proves supported combinations and honest unsupported states under G06/G09 before claims. This follows Apple's [WorkoutKit overview](https://developer.apple.com/documentation/workoutkit), [custom-workout model](https://developer.apple.com/documentation/workoutkit/customworkout) and [WWDC23 walkthrough](https://developer.apple.com/videos/play/wwdc2023/10016/) (checked 2026-10-30); it is not device validation.

### VWE-03 — Capabilities and evidence depth (DR-137)

HealthKit is a transport/source, not a quality guarantee. Inspect actual **per-workout, per-field capabilities**: summary metrics, HR samples/coverage, pace samples, route, elevation, laps/splits, running dynamics and other relevant data. Never assign richness or coaching authority from brand, source app or “HealthKit connected.” No route collection is authorized merely because route is a possible capability; existing purpose/permission and sharing limits remain.

Conceptual depth is a navigational summary of the capability vector, not a new physiological score or permission to prescribe:

| Conceptual depth | Meaning |
|---|---|
| SUMMARY | Available workout identity/type/time and summary facts, with no usable detailed streams established. |
| STANDARD | Additional relevant detail is available, such as usable HR/pace samples or splits; explicit coverage and missingness remain. |
| RICH | Multiple useful detailed capabilities/streams and their coverage support deeper inspection, potentially route/elevation/dynamics where authorized. |

These labels are a **minimal conceptual model**, not fixed field counts, universal thresholds or an ordered coaching-confidence guarantee. Final deterministic mapping is later implementation design. Keep capability availability separate from origin, freshness, validity, comparability, exclusion and the requirements of each consumer. An excluded or stale stream cannot justify greater confidence merely because it exists; user reports never manufacture a missing measured-stream capability. Sparse evidence is unknown rather than zero, failure, noncompletion or a synthetic value.

### VWE-04 — Immutability and missing-only enrichment (DR-138)

**EXTERNAL_EVIDENCE_IMMUTABILITY:** every value received from Apple Health or another external measured source is read-only in Vilumo. Preserve its source value and provenance; no in-app user action may overwrite it, relabel it as a different origin or silently replace the import. The rule covers externally received values even if their upstream origin was user-entered. A source-authorized later update is a separately identified source revision under existing reconciliation/lineage rules, never an in-app manual edit.

The user may **only add genuinely absent fields**. Supplements are distinct linked records with **USER_REPORTED** provenance. For partial source data, eligibility is field-specific: imported minimum/maximum HR stay locked; absent average HR may receive a user report. `0`, invalid/suspicious present data, unknown permission/read outcome, and not-applicable are not automatically “missing” editing slots. Do not infer permission denial from an empty HealthKit read. A field's absence must be established within the authorized available workout representation.

### VWE-05 — Bounded supplements (DR-139)

Useful scalar/contextual examples when genuinely absent: average HR, maximum HR, average cadence, elevation gain, RPE, completion status (`completed / partial / stopped`), legs perception, breathing perception, nonclinical discomfort/pain signal, notes and reason for partial/stopped workout. Applicability, units and honest validation are later engineering details; absence is never pressure to report. Strength's detailed exercise/set logging remains the native path in VWE-09, not permission to infer unavailable imported sets.

Users must **not fabricate measured time-series**: second-by-second HR, GPS route, pace stream, cadence stream or any other synthetic measured series. A scalar estimate/report does not become sensor evidence, a stream or physiological clearance. Discomfort/pain reporting respects existing nonclinical boundaries; no diagnosis, rehabilitation or new clinical/prescriptive rule is approved.

### VWE-06 — Suspicious imported data (DR-140)

If a present imported value seems wrong, the user cannot edit it. Product semantics support **field-level or workout-level exclusion** (`EXCLUDED_BY_USER` / `IGNORE_FOR_ANALYSIS`, conceptual naming). Preserve the original value, source and provenance; record a separate analysis disposition. Exclusion does not change a value to absent or open a replacement-report slot. A workout-level exclusion withholds that workout's coaching-analysis contribution; field-level exclusion withholds the affected value and dependent derived contribution. Future implementation must apply existing reconciliation/versioning rules to affected analysis while preserving historical knowledge and avoiding any automatic rewriting of executed work or plan mutation.

An analysis exclusion is distinct from deleting an app copy, disconnecting HealthKit or deleting source records. No blanket exclusion of all same-provider data follows from one suspicious workout.

### VWE-07 — Provenance, authority and source metadata (DR-141)

| Conceptual provenance | Interpretation |
|---|---|
| MEASURED / IMPORTED | Preserve external arrival and source attribution; claim MEASURED only where supported by the source metadata/method. Import transport alone never certifies measurement. |
| USER_REPORTED | User-entered supplements and context; preserve that origin even if transported through an external store. |
| DERIVED | A computed result with named method/version and lineage to its inputs; never masquerades as a measurement. |

Transport (`IMPORTED`, via HealthKit) and evidence origin (`MEASURED`, `USER_REPORTED`, or `DERIVED`) are conceptually distinct. Retain minimum necessary source app/provider/device **when identifiable**, namespace/source record reference, source revision and occurred/measured/received times with timezone, units/method and transformation lineage where appropriate under existing PDM/AEC contracts. Unknown source remains unknown; no guessed vendor identity or verified-provider connection claim.

Measured external evidence has higher authority than a user-reported supplement **for the same field**, subject to validity/exclusion and existing consumer rules. Normal UX prevents this conflict by allowing supplements only for absent fields. If measured evidence later arrives, preserve the earlier report/history and reconcile the effective measured contribution under existing dedupe/versioning; never let the manual value overwrite the import, double-count the fact or silently relabel the report. A derived average from available samples stays DERIVED rather than being recast as an imported measured average. A known usable derived contribution must be distinguished from genuinely unavailable data before offering enrichment. No field-ranking algorithm or frozen Core behavior changes here.

### VWE-08 — Later product/UI reconciliation (DR-142)

Imported values are visibly source-labeled and read-only. Missing eligible values offer an action such as **“+ Adicionar”**. Suspicious present values offer **“Ignorar na análise”**, or equivalent, rather than edit. Measured/imported versus user-reported versus derived information must be understandable; transport and evidence origin cannot be conflated. Labels are examples; no screen, layout, navigation, component or Figma change is approved here. Capabilities do not mandate new surfaces.

### VWE-09 — Strength V1 (DR-143)

Strength primarily uses **in-app Vilumo logging** for exercise, sets, reps, load, RPE/RIR, substitution and completion. Wearable evidence is more critical to Running Intelligence than Strength Intelligence. An imported strength summary does not invent missing exercise details or replace the native record; existing fact identity/dedupe applies. This is product emphasis, not a new sporting policy or a claim that every run requires a wearable.

### VWE-10 — Privacy-minimized beta learning (DR-144)

Use the existing measurement/governance foundation, with a future allowlisted schema reviewed **before collection**. Observe only what answers the direct-integration decision:

| Decision signal | Minimum useful observation |
|---|---|
| Adoption and source | Coarse source/provider category only when identifiable; `UNKNOWN` retained, no vendor-account identifiers. |
| Data loss and depth | Capability-presence/usable-coverage categories, missing-field names/categories, conceptual evidence depth; distinguish not applicable, unavailable/unknown and excluded. Do not infer read denial. |
| Enrichment and friction | Counts/rates of offered/added supplements by field category, exclusion counts and coarse failed/abandoned flow outcomes; never entered scalar values, notes or pain content. |
| Material coaching/user impact | Aggregate associations of evidence limitations with existing valid coaching-confidence categories/abstentions, workout completion, retention and coarse friction; do not invent confidence physiology, infer cause or a new retention metric formula. |

Use aggregate counts/coarse cohorts first, suppress small/reidentifiable cohorts under a reviewed method, and only use a short-lived pseudonymous join if necessary to evaluate completion/retention. Such joins remain personal data, not “anonymous” by label. Define purpose, schema/version, minimum granularity, access, justified retention/deletion, approved processor flows and legal/DPO decision before beta activation. No arbitrary universal thresholds, vendor ranking or automatic integration trigger is set here.

Never log raw HealthKit payloads, HR/pace/cadence values or streams, coordinates/routes, free text, pain content, source-record IDs, secrets, or unnecessary raw health data. Disable incidental SDK/body/error/crash capture; use safe categories/redaction and synthetic negative log tests before activation. Do not collect more health data merely to fill analytics. Coaching confidence/completion/retention/friction analysis is observational: evidence of association and user impact, not causal efficacy.

### VWE-11 — POST_V1 / V2 providers (DR-145)

Later architecture: **`Provider Adapter → CanonicalEvidence → CoachingCore`**. Adapters own provider transport, permissions, identifiers, losses and canonicalization; Core stays vendor-agnostic and capability-based. Prioritize direct Garmin/COROS/Polar integrations by actual beta adoption, missing-capability/data-loss impact, material coaching/user friction and engineering cost, not a brand assumption.

Garmin is a **likely early candidate**, not a committed first integration or a beta finding. Its [official Apple Health sharing article](https://support.garmin.com/en-US/?faq=lK5FPB9iPF5PXFkIpFlFPA) (checked 2026-10-30) describes limitations including high/low HR for timed activities rather than a complete workout HR series. This is a rationale to inspect actual beta capabilities, not a universal richness classification or guaranteed persistent limitation. Recheck provider behavior at implementation. Structured workout push to Garmin/COROS/Polar remains later; live telemetry/streaming remains later **only with a validated use case**. No generic BLE route is added by this roadmap.

### VWE-12 — Privacy/security/LGPD preparation (DR-146)

Align with the existing Engineering Quality & Security Foundation at **e0666d57b35ef85c19d6dfb58159cdf5eead8dfa**, specifically [Privacy](https://github.com/GabrielCarvalhoM/MyApp/blob/e0666d57b35ef85c19d6dfb58159cdf5eead8dfa/docs/engineering/PRIVACY.md), [Security](https://github.com/GabrielCarvalhoM/MyApp/blob/e0666d57b35ef85c19d6dfb58159cdf5eead8dfa/docs/engineering/SECURITY.md) and [runtime boundaries](https://github.com/GabrielCarvalhoM/MyApp/blob/e0666d57b35ef85c19d6dfb58159cdf5eead8dfa/docs/engineering/decisions/0001-runtime-boundaries.md). These are pinned separate-branch planning inputs, not merged artifacts. Its older “all watch delivery POST_V1” context is superseded only by VWE-02; its security/privacy boundaries stand.

Data minimization and purpose limitation govern ingestion, evidence storage and measurement separately. Request minimum necessary types/purposes contextually. OS authorization is distinct from legal consent and app purpose; do not claim knowledge of HealthKit read-grant/denial from empty results. Revoke/disconnect stops relevant app-side queries/background delivery, queued imports/sync and processing for revoked purposes; invalidate app-held anchors/caches as appropriate and prevent retries/restore from silently reviving choices. Explain that Health settings controls OS permission. Reassess already-held/derived records against their remaining purpose/basis rather than assuming disconnect erases them.

App-copy deletion, source Health record deletion and analysis exclusion are separate. Existing suppression/tombstone or equivalent lawful controls prevent unauthorized reimport/resurrection; preserve only minimum justified markers, never unlimited raw health retention. Deletion/export planning covers canonical facts, source provenance, user reports, exclusion disposition, warranted derived data, caches/queues/processors/backups and scoped exceptions. Export is authenticated/principal-scoped and bounded; no public payload links. Do not delete original Apple Health records without separate supported authorization. Immutability means no in-app source-value editing, **not permanent retention or denial of applicable data rights**. Log only approved safe metadata with redaction; no unnecessary raw health logging. Legal/DPO review must resolve bases, notices, rights procedures, retention/backup exceptions, processors/transfers and automated-decision obligations as applicable before dependent real collection. **No LGPD/legal compliance verdict or legal deadline is claimed.**

### VWE-13 — Frozen R7-A and future handoff (DR-147)

These decisions strengthen **future evidence ingestion/provenance semantics**. They do **not modify the current frozen R7-A runtime**, sports policy, tests, freezes, reviews or its decision-authority gate. R7A-RESIDUAL-AUTHORITY-FREEZE-1 remains compared against **7d2da3603e224124696a2290766ec448080f3264**; its pending narrow rechecks and R7A exit disposition are not decided by this mission. No new runtime behavior, review verdict, clinical authority or scientific claim follows from canonization.

Future **R7-B0** may carry available/required evidence capabilities and provenance in repertoire metadata where its separately authorized definition needs them. It must not invent a recipe, measured evidence or deeper confidence to compensate for missing data. This is a context pointer, not B0 execution or a reopened R7-A requirement. Future **KMP/production Core** can consume canonical vendor-neutral contracts; HealthKit and WorkoutKit remain Apple-platform adapter responsibilities, outside the frozen Node Reference Oracle. No KMP abstraction, schema migration or code is created ahead of an authorized consumer.

Open owners/triggers: iOS Engineering + Product prove supported WorkoutKit concepts and HealthKit fidelity at implementation prep (G06/G09); HealthKit own-activity write-back stays Founder + Product/Engineering's open decision; Data + Privacy/Security + legal/DPO review beta measurement before collection (G07); direct-provider scope/priority returns to Founder/Product/Engineering on actual beta evidence; experience reconciliation remains a later authorized mission. G01–G11 and all existing sporting/clinical/agency/privacy gates remain as applicable. **STOP after documentation/canonization and the authorized docs-only commit/push. No merge, R7-B0, KMP, HealthKit/WorkoutKit code, backend, production or Figma.**
