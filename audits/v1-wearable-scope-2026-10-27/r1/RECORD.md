# V1 wearable scope reconciliation — record (VWS-20261027-r1)

**What this is:** a post-R6 product scope supersession, dated 2026-10-27.
- **Source:** the current direct [Founder request](FOUNDER_REQUEST.md), given after DOMAIN_COACHING_R6 closed (`audits/domain-coaching-r6-2026-10-26/FINAL_DISPOSITION.json`, 2026-10-27 02:06).
- **Decisions:** [PDR-1.8 DR-117–119](../../product/PRODUCT_DECISION_REGISTER.md), DECIDED / CURRENT_PRODUCT_DECISION.
- **Kind of mission:** documentary only. IMPLEMENTATION_AUTHORIZED = NO · FIGMA_EDITS_AUTHORIZED = NO · no HealthKit code, adapter or API research.
- **Not part of R6:** this is not R6 continuation, and R6.1/R7 is not started.

**Routing.** Global agent system, T1/R1, L1:
- one domain: product scope governance;
- reversible: insert-only overlays and in-place scope rows, with pre-change copies in [before/](before/);
- the current instance authors;
- no material gate is being passed: the Founder already decided, so no independent judge is required at this tier;
- deterministic checks are in [VERIFICATION.json](VERIFICATION.json).

No SSCTR call: no training policy or prescription changes.

## 1. Decision recorded

- **DR-117 — POST_V1.** Direct wearable-manufacturer integrations are out of V1 and move to V2/POST_V1:
  - Garmin, COROS and Polar direct APIs;
  - vendor OAuth/account linking;
  - vendor-specific or FIT ingestion as a V1/launch requirement;
  - structured workout export to any watch;
  - workouts, plan or calendar sent to the watch;
  - vendor two-way sync;
  - vendor approvals/partnerships.

  Their absence never blocks a V1 readiness verdict, Coaching Core included.
- **DR-118 — the V1 layer.** On iOS, the V1 external health/activity layer is Apple Health/HealthKit, read/ingest only.
  - It brings what is actually available and authorized, including activities first recorded by Apple Watch, Garmin, COROS, Polar or other apps when they reach Apple Health.
  - The source's richness is never assumed. Missing data stays missing.
- **DR-119 — generic semantics.** Generic external-data semantics stay domain capabilities, and the Coaching Core stays vendor-agnostic. Conceptual path: `HealthKit / manual / workout execution → adapter/canonicalization → canonical athlete/workout data → Coaching Core`.

## 2. Authorities updated

Every edit is marked `VWS-20261027-r1`. Pre-change bytes are in [before/](before/).

| File | Change |
|---|---|
| `product/PRODUCT_DECISION_REGISTER.md` | New top amendment PDR-1.8: DR-117–119, OPEN_PRODUCT_PLATFORM_DECISION-01, design reconciliation inputs, owners. Older blocks untouched. |
| `product/V1_RELEASE_SCOPE.md` | Overlay. The wearables row is rewritten. §3 gets a V2/POST_V1 paragraph. §6 G06 now means the HealthKit route proof. The transversal row gets the Android open-decision marker. |
| `canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md` | Insert-only V1 supersession notes after C055 and at the start of §6 (C040/O016). Clause text and invariants are unchanged; PTC revision not bumped. |
| `product/ADAPTIVE_ENGINE_CONTRACT.md` | §5 overlay splits the integration contract: the read side binds V1 for any source; the outbound side is POST_V1 specification, inert in V1. |
| `product/PRODUCT_DOMAIN_MODEL.md` | External-data boundary overlay: V1 sources, canonical path, field known/unknown/not-applicable, W2 POST_V1. |
| `product/UX_SPECIFICATION.md` | Overlay: lists which WEA/DEG/RUN/J rules bind V1 for Apple Health and which are POST_V1. No rule text edited. |
| `product/PRODUCT_TRUTH_MAP.md` | Traceability overlay: source S-VWS and THESIS_CONFLICT-VWS-01. |
| `product/DESIGNER_PRODUCT_CONTEXT.md` | Derived brief corrected in place: Apple Health only, partial data, no direct vendor connection, design reconciliation note, Android open decision. |
| `canon/CANONICAL_INDEX.md` | New current pointer at the top. |
| `CURRENT_MISSION.md`, `MISSION_LEDGER.md` | One appended block each (insert-only). |

Not edited, because the central supersession (DR-117, §3 below) covers them clause by clause:
- PA, EM, CF, AEOS, AESL, SIS, RIL and STIL;
- AGENTS.md, CLAUDE.md;
- every candidate, audit, review, snapshot and CoachingCore file.

## 3. Superseded decisions and clause-level map

**Superseded for V1.** Each keeps its text and history; for V1 it reads through DR-117/118.

| Clause | Superseded part | What remains |
|---|---|---|
| DR-107 (2026-10-24) | "Garmin, COROS and Polar remain named candidate routes (AEC §5.1, WEA matrix) under G06"; its "no documentary conflict found" note | Scope from product authority, not the Figma; ingest-first; Apple Health base route; no watch app, sending or Apple Health write. |
| DR-58 | "enviar structured workouts quando suportado" (already conditioned by DR-83) | Reading, execution and reconciliation are distinct capabilities with consents and visible states. |
| DR-83 | Conditional eligible outbound for V1 | Ingest-first; Nutrition light support. |
| DR-68 | Outbound route selection: Running structured outbound per destination, Polar/Health Connect/Terra notes | Domain → neutral representation → adapter principle; Strava not a foundation. |
| PTC C040 / C055 | Structured export as a per-route V1 option; conditional outbound; third-party provider shortcut | Ingestion/reconciliation, states, provenance, consent, late/conflicting/unavailable data, honest failure, no dozens of integrations. |
| PTC O016 | Provider/device matrix as a V1 commitment | V1: HealthKit data types, permissions, fidelity. |
| PDR §5 G06 | Vendor/device matrix, sending/guiding/return, contracted cost for V1 | V1: proof of the HealthKit read route and phone sensors before a dependent claim. |
| RS-1.3 wearables row, NFV1 banner line, §6 G06 | Candidate watch routes; optional export | Rewritten in place (pre-change copy in before/). |
| Designer context, integrations paragraph | Garmin/COROS/Polar candidate routes | Rewritten in place. |

**POST_V1 specification, preserved and inert in V1.** These clauses apply only "when an export exists", and no outbound route exists in V1. None is deleted, and they are the starting specification for V2.

| Source | Clauses |
|---|---|
| PDR | DR-63 "envio ao relógio"; DR-65 "export explícito por sessão/revisão" |
| AEC | §5.1 publish/update/delete/revoke, consent to send, WEA-1.0 vendor matrix (Garmin/COROS Partner, Apple WorkoutKit, Polar, Terra); §5.2 export preflight; §5.3 export cycle; §5.4 publish/update/replace/delete rows; §2 "opção de structured export" output |
| UXS | WEA-02(c); send side of WEA-03; WEA-10/11; §14.2 WEA-L ladder; OBJ-12; ST-EXP; SURF-07 send/versions facet; ALT-UX-04 watch branch; RUN-05/RUN-07; HOJ-S4/HOJ-C01 send status; CONF-04; export effects in AM-02/CONF-01; J-04; J-15; DEG-05/06/15/28/35; NOT-C send part; §1.2 "Relógio" row |
| CF | F04 "Enviar structured workout" (its "Fluxo condicional V1" wording is superseded); S15; the export parts of F02/F06 |
| PA | §3 integration row "export só por rota admissível"; outbound direction of AR-08 |
| PDM | Integration row "export opcional/intenção/cópia/recibos"; W2 |
| EM | §6 "outbound condicional com seus estados/controles intactos" |
| AEOS | HC09 export fidelity; C09 preparation/export mismatch; the export members of `integration_state`, `burden_features` and the confirmation scope |
| AESL | S17, S20, Q03, S30 export part; E-1 intents |
| SIS/RIL/STIL | Export notes: SIS §3 "autorização de export" and the export effects; RIL §2 "fidelidade de export"; STIL §6 "AEC preflight recusa export dependente" |

## 4. Preserved as generic Core capability (V1-binding, any source)

| Capability | Where it lives |
|---|---|
| Provenance and source identity | PDM §3 observation semantics; AEC §4 identity per provider/route/account/originator; CoachingCore `r6-provenance.mjs` (provider is a label) |
| Timestamps | PDM §3 occurred/measured/received + timezone; AEC §4 fact time ≠ receipt time |
| Freshness and stale data | AEC §2.1; AEOS `integration_state`; UXS WEA-04 |
| Canonical workout representation | AEC §5 overlay (inbound neutral representation); PDM overlay; DR-119 |
| Partial data and unknown fields | DR-118; PDM overlay (known/unknown/not applicable); CoachingCore `r6-intake.mjs` capability flags (`exerciseIdentityAvailable`, `setsRepsLoadAvailable` …) |
| Duplicate detection | AEC §4; UXS WEA-08/DEG-04; SIS SIL-I1 |
| Conflicting observations | AEC §4; AEOS C07; UXS DEG-07; R6 provenance conflict rule |
| Corrections and suppression | PDM §3; AEC §4/§5.4 normalize |
| Manual vs imported data | PDM §3 raw/declared/derived; UXS CTN-03 |
| Uncertainty | PTC C012; AEC §2.1 |
| Capability-aware interpretation | AEC §5.1 read capability per type with levels of proof; UXS WEA-03 read side; STIL "wearable never replaces reps/load/RIR"; UXS STR-09 |
| Opaque read | AEC §5.1; UXS WEA-05; AESL S25 |

## 5. Moved to V2 / POST_V1

The full DR-117 list:
- Garmin, COROS and Polar direct APIs;
- vendor OAuth/account linking;
- vendor-specific/FIT ingestion as a V1 requirement;
- structured workout export to watches, including Apple WorkoutKit for Apple Watch;
- workouts, plan or calendar sent to the watch;
- vendor two-way sync;
- vendor approvals/partnerships.

Also not V1 routes, unless a later Founder decision says otherwise:
- aggregators that link vendor accounts (Terra);
- Health Connect (see §8);
- Strava and TrainingPeaks.

Re-entry needs its own scope decision (RS §3 anti-bloat). The outbound specification in §3 above is the starting point.

## 6. Rehydration entry for the next coaching mission (R6.1 or R7)

Read in this order, after the mission's own Founder-authorized definition:
1. **This section.**
2. **[PDR-1.8 DR-117–119](../../product/PRODUCT_DECISION_REGISTER.md).**
3. **R6's own entry** (unchanged, historical): `CoachingCore/r6/OPEN_GAPS_R6.md` "R7 entry", then `audits/domain-coaching-r6-2026-10-26/FINAL_DISPOSITION.json`.

**Non-blockers for V1.** None of these may hold the Coaching Core V1 in BLOCK:
- no direct Garmin;
- no direct COROS;
- no direct Polar;
- no structured workout export to a watch;
- no vendor OAuth/API;
- no vendor-specific FIT.

R6 has no blocker of this kind. Its blockers (D53, D54, FREEZE-2) and quality findings are runtime and coaching issues, and they stay as recorded.

**Still V1-relevant**, because they exist with Apple Health data too:
- partial external workouts;
- provenance;
- deduplication;
- stale data;
- timestamps;
- conflicting data;
- unknown details;
- manual correction;
- canonical workout semantics.

How R6's own items read under the new scope. R6's text is not changed; this is a reading guide only.

| R6 item | Reading under DR-117–119 |
|---|---|
| JUDGE-CQ-R6-01 (cold-start fusion between wearable history and self-report) | Fully V1-relevant: Apple Health history is the V1 wearable history. |
| JUDGE-CQ-R6-07 (self-reported known loads dropped when wearable strength rows exist) | Fully V1-relevant: a HealthKit strength workout may carry no exercise/sets/load, so it must never displace known self-reported loads. |
| NO-WEARABLE-INGESTION ("intake accepts wearable-like summaries only") | Real ingestion is the production HealthKit adapter, not a Coaching Core blocker. The Core-side need is a vendor-agnostic canonical external-workout contract with per-field known/unknown status. |
| PROVENANCE_TIME_R6 rules (skew, timezone, out-of-order, duplicates, stale, conflicts) | The generic baseline; unchanged. |
| R6 holdout provider labels (`garmin`, Apple Health, `WEARABLE_FULL/PARTIAL`) | Historical synthetic labels. The dual-path duplicate cases stay valid, because the same activity can reach Apple Health from two source apps. |

Mapping DR-112–114 (OB-2) into CoachingCore stays owned by the next coaching mission, as before.

## 7. Inconsistencies found

1. **DR-107 and the RS NFV1 banner** (2026-10-24) said Garmin/COROS/Polar were candidate V1 routes and "no documentary conflict". Superseded; the RS row and the designer context were corrected.
2. **Android.** RS/PDM/PA/DR-47/DR-103 keep iOS+Android in V1, but the only V1 external layer is iOS-only → OPEN_PRODUCT_PLATFORM_DECISION-01 (§8).
3. **Interpretations to confirm** (the Founder may reverse them):
   - Apple WorkoutKit is classified POST_V1 as "structured workout export para relógios";
   - Terra-type aggregators are classified POST_V1 as vendor account linking.
4. **New Figma `TYR10AIrquCpKvKL3eyXyO`.** Per the [NFV1 gate closure](../new-figma-v1-completion-2026-10-23/GATE_CLOSURE_2026-10-24.md), it shows:
   - Garmin, COROS and Polar rows in Integrações;
   - CF-14/CF-15 connect and connection-state frames with a Garmin prototype path;
   - ON-08 pointing Garmin/COROS/Polar users to Integrações.

   These are now stale for V1 and go to the design reconciliation (§9). The Figma was not opened or edited.
5. **Wording in files not edited.** CF F04's heading text "Fluxo condicional V1" and EM §6 "outbound condicional" still read as V1. They are superseded centrally (§3) and not edited, to keep this mission small and the held OB-2 corrections applicable.
6. **Held OB-2 doc corrections.** `audits/new-figma-onboarding-v2-2026-10-25/PENDING_DOC_CORRECTIONS_R2.json` (r3, 38 ops, still unapplied) binds the preSha256 of eight files. Three of them changed here: PDR, UXS and AEC.
   - All 38 `from` strings were re-validated and still occur exactly once (VERIFICATION.json). No VWS insertion overlaps an op.
   - Its applier will refuse on the hash check. Per its own `applyWhen`, its owner re-validates (done here, mechanically) and has the owning judge re-check before applying. That file was not modified.
7. **R6 BASELINE.json.** It binds the R6-era SHA-256 of product/ and canon/ files. If `verify-r6` were re-run, its `baseline-preserved` check would list this mission's files as changed: an expected post-closure supersession, like R2/R4's historical verifiers. It was not run, because it rewrites R6 evidence (VERIFICATION.json lists the affected entries).
8. **Historical records stay as written:**
   - MISSION_LEDGER line 552, "Wearables ingestão + structured export quando suportado";
   - the legacy `explorations/visual-v1` button "Enviar ao relógio".

## 8. OPEN_PRODUCT_PLATFORM_DECISION-01

**Owner:** Founder, with Product/UX and Engineering.

**Question:** what is the V1 Android external health/activity layer, if any? Possible paths, not decided here:
- Android V1 with manual and in-app execution only;
- Health Connect in V1 for Android;
- Android later than iOS.

**Until decided:**
- the iOS+Android rows stay as written;
- Health Connect is not added to V1;
- no design promises an Android integration.

Not a Coaching Core blocker: the Core is vendor- and platform-agnostic.

## 9. Inputs for the future V1 Design Reconciliation & Implementation Freeze

This mission runs after the Coaching Core closes. No Figma round happens now. The reconciliation must:
- remove the direct Garmin, COROS and Polar connections, including the Integrações rows, the CF-15 Garmin states and the prototype path;
- re-point ON-08 to Apple Health, without claiming that a vendor app writes there;
- remove structured workout sending to watches as a V1 promise;
- treat Apple Health as the V1 integration;
- show partial and missing data honestly: show the fields that arrived and the unknown ones, and never default them;
- remove any visual blocker based on direct wearable integration.

## 10. R6 history integrity

The SHA-256 of 606 files was taken before the edits and compared after them. Any difference is reported in VERIFICATION.json. The files covered:
- `audits/domain-coaching-r6-2026-10-26/**`;
- `CoachingCore/r6/**`;
- `CoachingCore/scripts/verify-r6.mjs`;
- the human revalidation queue.

No R6 report, freeze, holdout, review, evidence, hash, readiness or verdict was edited or reinterpreted.

## 11. Verdicts

See the final block of [VERIFICATION.json](VERIFICATION.json) and the CURRENT_MISSION block of 2026-10-27.
