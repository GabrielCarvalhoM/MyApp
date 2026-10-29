# V1 wearable and platform scope reconciliation — record (VWS-20261027, r2)

**What this is:** a post-R6 product scope supersession, dated 2026-10-27.

**Sources:** two current direct Founder requests, both given after DOMAIN_COACHING_R6 closed (`audits/domain-coaching-r6-2026-10-26/FINAL_DISPOSITION.json`, 2026-10-27 02:06):
- [r1](FOUNDER_REQUEST.md), which produced DR-117–119;
- [r2](FOUNDER_REQUEST_R2.md), which confirms r1 and adds DR-120–123.

Decisions: [PDR-1.9 and PDR-1.8](../../product/PRODUCT_DECISION_REGISTER.md), all DECIDED / CURRENT_PRODUCT_DECISION. The r1 versions of every file this record touched are kept in [r1/](r1/), and the pre-mission bytes in [before/](before/).

**Mission kind:** documentary only. IMPLEMENTATION_AUTHORIZED = NO · FIGMA_EDITS_AUTHORIZED = NO · no HealthKit or Android code, adapter or API research. This is not R6 continuation, and DOMAIN_COACHING_R7 is not started.

**Routing.** Global agent system, T1/R1, L1:
- one domain: product scope governance;
- reversible: dated overlays and in-place scope rows, with byte copies;
- the current instance authors;
- no material gate is being passed: the Founder decided, so no independent judge is required at this tier;
- deterministic checks are in [VERIFICATION.json](VERIFICATION.json).

No SSCTR: no training policy or prescription changes.

## 1. Decisions recorded

| ID | Decision |
|---|---|
| DR-117 | Direct wearable-manufacturer integrations are POST_V1 / V2: Garmin, COROS and Polar APIs; vendor OAuth/linking; vendor/FIT ingestion; structured workout export to any watch; workouts, plan or calendar sent to the watch; vendor two-way sync; partnerships/approvals. They never block V1. |
| DR-118 | The V1 external health/activity layer is Apple Health/HealthKit. Vilumo consumes what is available and authorized, including other devices' activities that reach it, and never assumes the source's richness. Missing data stays missing. Its "read/ingest only" qualifier is superseded by DR-121. |
| DR-119 | Generic external-data semantics stay domain capabilities; the Coaching Core is vendor-agnostic. |
| DR-120 | **V1 is iOS only.** Android is POST_V1 / FUTURE_PLATFORM_EXPANSION, considered after initial validation. No Health Connect, no Android readiness requirement, no parity blocker, no Android spec now. The architecture avoids needless coupling. OPEN_PRODUCT_PLATFORM_DECISION-01 (= OPEN_PRODUCT_PLATFORM_QUESTION-1) is **RESOLVED — V1_IOS_ONLY**. |
| DR-121 | **HealthKit inbound is REQUIRED.** It never assumes exercise, sets, reps, load, interval structure or proprietary fields; a missing field stays missing. **HealthKit write-back** of the app's own completed or recorded activities is an **OPEN_TECHNICAL_PRODUCT_DECISION**, decided at iOS implementation prep. It blocks neither R7, Coaching Core readiness nor the semantic freeze. |
| DR-122 | **Apple Watch structured delivery is POST_V1 / V2:** WorkoutKit as a requirement, interval control from the watch, plan or calendar to the Watch, any launch dependency. Garmin/COROS/Polar are reaffirmed POST_V1 / V2. None blocks V1 or R7. |
| DR-123 | **The Coaching Core is platform- and vendor-agnostic.** iOS path: `HealthKit → iOS platform adapter → canonical athlete/workout data → Coaching Core`. A future Android path (Health Connect or another layer) → platform adapter → canonical data → the same Core. No `if source == HealthKit` sport logic, and no premature abstraction. **R7 evaluates through canonical inputs.** |

**Confirmed state:**

| Item | State |
|---|---|
| V1_PLATFORM_SCOPE | IOS_ONLY |
| V1_EXTERNAL_HEALTH_SOURCE | APPLE_HEALTH_HEALTHKIT |
| HEALTHKIT_INBOUND_V1 | REQUIRED |
| HEALTHKIT_WRITEBACK | OPEN_TECHNICAL_PRODUCT_DECISION |
| STRUCTURED_WATCH_DELIVERY | POST_V1 |
| DIRECT_VENDOR_WEARABLE_INTEGRATIONS | POST_V1 |
| ANDROID | POST_V1 / FUTURE_PLATFORM_EXPANSION |
| COACHING_CORE_PLATFORM_AGNOSTIC | YES |
| R7_CAN_START_WITH_CANONICAL_INPUT | YES |

## 2. Authorities updated

Overlays are marked `VWS-20261027-r2` (r1 marker text in [r1/](r1/)).

| File | Change |
|---|---|
| `product/PRODUCT_DECISION_REGISTER.md` | r1: PDR-1.8, DR-117–119. r2: new top amendment PDR-1.9 with DR-120–123, the confirmed-state table, the resolution of OPEN_PRODUCT_PLATFORM_DECISION-01 and the design inputs. PDR-1.8 is kept as recorded. |
| `product/V1_RELEASE_SCOPE.md` | Overlay. Wearables row: inbound required, write-back open, no assumed fields. Transversal row: **somente iOS**, Android POST_V1. §3 lists vendor integrations, watch delivery and Android as POST_V1. §6 G06 is the HealthKit route proof. |
| `canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md` | Notes after C055 and at the start of §6, now r2: HealthKit inbound, write-back open, Apple Watch POST_V1, platform per PDR. No clause text or invariant edited. |
| `product/ADAPTIVE_ENGINE_CONTRACT.md` | §5 overlay: inbound binds V1; write-back open (if adopted: separate purpose, read-back is the same fact); outbound and Apple Watch delivery POST_V1; iOS platform adapter path; no source-keyed rule. |
| `product/PRODUCT_DOMAIN_MODEL.md` | Boundary overlay: HealthKit inbound, iOS platform adapter, platform-agnostic Core, future sources without premature abstraction; §2 "iOS+Android" reads as iOS for V1. |
| `product/UX_SPECIFICATION.md` | Overlay: VIS-01's Android statement superseded; LAC-21 is now an open decision; the V1 and POST_V1 rule lists; the design reconciliation list. |
| `product/PRODUCT_TRUTH_MAP.md` | THESIS_CONFLICT-VWS-01 (r2) plus the platform supersession note. |
| `product/DESIGNER_PRODUCT_CONTEXT.md` | Derived brief corrected in place: iOS only, inbound required, write-back open, no watch delivery, the reconciliation list. |
| `canon/CANONICAL_INDEX.md` | Current pointer (r2). It also supersedes the A/B/C phrase "Android adaptation remains". |
| `CURRENT_MISSION.md`, `MISSION_LEDGER.md` | One appended block each in r1 and in r2 (insert-only). |

Not edited, because the central map (§3) covers them clause by clause:
- PA, EM, CF, AEOS, AESL, SIS, RIL and STIL;
- AGENTS.md, CLAUDE.md;
- every candidate, audit, review, snapshot and CoachingCore file.

## 3. Superseded decisions and clause-level map

**Superseded for V1.** Each keeps its text and history; for V1 it reads through DR-117–123.

| Clause | Superseded part | What remains |
|---|---|---|
| DR-107 (2026-10-24) | Garmin/COROS/Polar candidate routes; "no documentary conflict found" | Scope from product authority; ingest-first; Apple Health base; no watch app or sending. Its "no Apple Health write" now reads as the open write-back decision (DR-121). |
| DR-58 | "enviar structured workouts quando suportado" | Reading, execution and reconciliation are distinct capabilities. |
| DR-83 | Conditional eligible outbound for V1 | Ingest-first; Nutrition light. |
| DR-68 | Outbound route selection | Neutral representation → adapter principle. |
| DR-47 / DR-103 | V1 platform "iOS+Android" | Brasil, PT-BR/EN/ES, 18+. |
| DR-118 (r1) | "read/ingest only" | Inbound of what is available and authorized; missing stays missing. |
| PDR-1.8 OPEN_PRODUCT_PLATFORM_DECISION-01 | Open | RESOLVED — V1_IOS_ONLY (DR-120). |
| PTC C040 / C055 / C009 | Structured export per route; conditional outbound; third-party provider; "preparação condicional" | Ingestion, states, provenance, consent, honest failure. |
| PTC O016 | Provider/device matrix as a V1 commitment | V1: HealthKit data types, permissions, fidelity. |
| PDR §5 G06 | Vendor/device matrix and outbound proof for V1 | V1: HealthKit route proof and phone sensors. |
| RS-1.3 wearables row, transversal row, NFV1 banner line, §6 G06 | Candidate watch routes; optional export; iOS+Android; "Android … adaptações" | Rewritten in place (before/ and r1/ copies). |
| PDM §2 "iOS+Android" | V1 platform | Read as iOS (overlay). |
| PA §2 "iOS+Android/18+ preservados" | V1 platform | Central map (PA not edited: it is a held OB-2 target). |
| UXS VIS-01 "Android segue no escopo de release … como adaptação" | V1 platform | Overlay. |
| Index A/B/C map "Android adaptation remains" | V1 platform | Index pointer (the reviewed EXP-AUTH filter text is not edited). |
| UXS LAC-21 "Gravar o realizado no Apple Saúde — PODE ESPERAR" | — (consistent) | It is now the OPEN_TECHNICAL_PRODUCT_DECISION. |
| Designer context | Vendor routes; "Android como adaptação"; "somente leitura" | Rewritten in place. |

**POST_V1 specification, preserved and inert in V1.** These clauses apply only "when an export exists"; none is deleted.

| Source | Clauses |
|---|---|
| PDR | DR-63 "envio ao relógio"; DR-65 "export explícito por sessão/revisão" |
| AEC | §5.1 publish/update/delete/revoke, consent to send, WEA-1.0 vendor matrix (Garmin/COROS Partner, Apple WorkoutKit, Polar, Terra, Health Connect planned records); §5.2 export preflight; §5.3 export cycle; §5.4 publish/update/replace/delete rows; §2 "opção de structured export" |
| UXS | WEA-02(c); send side of WEA-03; WEA-10/11; §14.2 WEA-L; OBJ-12; ST-EXP; SURF-07 send facet; ALT-UX-04 watch branch; RUN-05/RUN-07; HOJ-S4/C01 send status; CONF-04; AM-02/CONF-01 export effects; J-04; J-15; DEG-05/06/15/28/35; NOT-C send part; §1.2 "Relógio" |
| CF | F04 (its "Fluxo condicional V1" wording is superseded); S15 (Health Connect planned record); export parts of F02/F06 |
| PA | §3 "export só por rota admissível"; outbound direction of AR-08 |
| PDM | Integration row "export opcional/…"; W2 |
| EM | §6 "outbound condicional" |
| AEOS | HC09; C09; export members of `integration_state`, `burden_features`, confirmation scope |
| AESL | S17, S20, Q03, S30 export part; E-1 intents |
| SIS/RIL/STIL | SIS §3 export authorization/effects; RIL §2 "fidelidade de export"; STIL §6 "AEC preflight recusa export dependente" |

## 4. Preserved as generic Core capability (V1-binding, any source and any platform)

| Capability | Where it lives |
|---|---|
| Provenance and source identity | PDM §3 observation semantics; AEC §4; CoachingCore `r6-provenance.mjs` (the provider is a label) |
| Timestamps | PDM §3 occurred/measured/received + timezone; AEC §4 |
| Freshness and stale data | AEC §2.1; AEOS `integration_state`; UXS WEA-04 |
| Canonical workout representation | AEC §5 overlay; PDM overlay; DR-119/123 |
| Partial data, missing data and unknown fields | DR-118/121; PDM overlay (known/unknown/not applicable); CoachingCore `r6-intake.mjs` capability flags |
| Duplicate detection | AEC §4; UXS WEA-08/DEG-04; SIS SIL-I1. If write-back is adopted, it also covers a Vilumo-written activity read back. |
| Conflicting observations | AEC §4; AEOS C07; UXS DEG-07; R6 provenance conflict rule |
| Corrections and suppression | PDM §3; AEC §4/§5.4 normalize |
| Manual vs imported | PDM §3; UXS CTN-03 |
| Uncertainty | PTC C012; AEC §2.1 |
| Capability-aware interpretation | AEC §5.1 read capability; UXS WEA-03 read side; STIL/STR-09 "wearable never replaces reps/load/RIR" |
| Opaque read | AEC §5.1; UXS WEA-05; AESL S25 |

**Platform-agnostic and anti-overengineering:**
- The Core already consumes canonical, provider-labelled observations; CoachingCore `src/` contains no HealthKit- or vendor-specific branch.
- No multi-platform adapter framework is specified. The only current consumer is the iOS HealthKit adapter, and that is production work.
- A future Android layer adds its own adapter against the same canonical contract.

## 5. Moved to V2 / POST_V1

- **Watch and vendor integrations:** all of DR-117 and DR-122. That covers:
  - Garmin, COROS and Polar APIs, vendor OAuth, vendor/FIT ingestion, vendor two-way sync, partnerships;
  - structured workout, plan or calendar to any watch, Apple Watch/WorkoutKit and interval control included.
- **Android:** Android and Health Connect are POST_V1 / FUTURE_PLATFORM_EXPANSION (DR-120).
- **Other routes:** aggregators that link vendor accounts (Terra), Strava and TrainingPeaks are not V1 routes.

Re-entry needs its own scope decision (RS §3). The outbound specification in §3 is the starting point.

**Not moved, still open:** HealthKit write-back (DR-121), decided at iOS implementation prep. It is neither V1-required nor refused.

## 6. Rehydration entry for the next coaching mission (DOMAIN_COACHING_R7 or R6.1)

Read in this order, after the mission's own Founder-authorized definition:
1. **This section.**
2. **[PDR-1.9 DR-120–123 and PDR-1.8 DR-117–119](../../product/PRODUCT_DECISION_REGISTER.md).**
3. **R6's own entry** (unchanged, historical): `CoachingCore/r6/OPEN_GAPS_R6.md` "R7 entry", then `audits/domain-coaching-r6-2026-10-26/FINAL_DISPOSITION.json`.

**R7 evaluates the Coaching Core through canonical inputs**, not through APIs or vendors. It may test data-quality variants:
- rich;
- partial;
- sparse;
- stale;
- conflicting;
- duplicate;
- corrected;
- manual;
- imported/external.

Vendor-specific ingestion and HealthKit implementation are not coaching competence and do not expand R7.

**Non-blockers** for V1 and for R7:
- no direct Garmin, COROS or Polar;
- no vendor OAuth/API or vendor FIT;
- no structured workout, plan or calendar delivery to any watch, Apple Watch/WorkoutKit included;
- no Android or Health Connect, and no iOS/Android parity;
- the open HealthKit write-back decision.

R6 has no blocker of this kind. Its blockers (D53, D54, FREEZE-2) and quality findings stay as recorded.

**Still V1-relevant** (they exist with Apple Health data too):
- partial and missing external fields;
- provenance;
- deduplication;
- stale data;
- timestamps;
- conflicting data;
- unknown details;
- manual correction;
- canonical workout semantics;
- no sport rule keyed on the source.

How R6's own items read under the new scope. R6's text is not changed.

| R6 item | Reading under DR-117–123 |
|---|---|
| JUDGE-CQ-R6-01 (cold-start fusion between wearable history and self-report) | Fully V1-relevant: Apple Health history is the V1 wearable history; a canonical "imported/external" variant. |
| JUDGE-CQ-R6-07 (self-reported known loads dropped when wearable strength rows exist) | Fully V1-relevant: a HealthKit strength workout may carry no exercise/sets/load, so it must never displace known self-reported loads. |
| NO-WEARABLE-INGESTION | Real ingestion is the production iOS HealthKit adapter, outside R7. The Core-side need is the canonical external-workout contract with per-field known/unknown status. |
| PROVENANCE_TIME_R6 rules | The generic baseline; unchanged. |
| R6 holdout provider labels (`garmin`, Apple Health, `WEARABLE_FULL/PARTIAL`) | Historical synthetic labels. Under DR-123 they are canonical source labels with no sport meaning; the dual-path duplicate cases stay valid. |

Mapping DR-112–114 (OB-2) into CoachingCore stays owned by the next coaching mission.

## 7. Inconsistencies found

1. **DR-107 and the RS NFV1 banner** called Garmin/COROS/Polar candidate V1 routes. Superseded and corrected (r1).
2. **Platform.** RS/PDM/PA/DR-47/DR-103/UXS VIS-01/index A/B/C kept iOS+Android in V1. r1 opened this as OPEN_PRODUCT_PLATFORM_DECISION-01; r2 resolved it as V1_IOS_ONLY (DR-120). PA and the reviewed EXP-AUTH filter text are superseded centrally, not edited.
3. **Interpretations.** r1 classified WorkoutKit as POST_V1, and r2 confirmed it (DR-122). Terra-type aggregators stay classified POST_V1 as vendor account linking; that is still an interpretation the Founder may reverse.
4. **Write-back.** r1 recorded "read only", but the Founder's r1 text said "consumir". r2 corrects this: inbound is required and write-back is open (DR-121). LAC-21 "PODE ESPERAR" was already consistent.
5. **New Figma `TYR10AIrquCpKvKL3eyXyO`.** Per the [NFV1 gate closure](../new-figma-v1-completion-2026-10-23/GATE_CLOSURE_2026-10-24.md), it shows:
   - Garmin, COROS and Polar rows in Integrações;
   - CF-14/CF-15 with a Garmin prototype path;
   - ON-08 pointing vendor users to Integrações.

   These are stale for V1 and go to the design reconciliation (§9). The Figma was not opened or edited.
6. **Wording in files not edited.** CF F04 "Fluxo condicional V1", EM §6 "outbound condicional" and PA §2 "iOS+Android" still read as V1. They are superseded centrally and not edited, to keep the mission small and the held OB-2 corrections applicable.
7. **Held OB-2 doc corrections** (`audits/new-figma-onboarding-v2-2026-10-25/PENDING_DOC_CORRECTIONS_R2.json`, r3, 38 ops, unapplied). Their targets PDR, UXS and AEC changed, so the applier's preSha256 check refuses.
   - All 38 `from` strings still occur exactly once, a sequential apply simulates cleanly, and none sits inside a VWS block (VERIFICATION.json).
   - The owning judge re-checks before applying, per that file's own `applyWhen`. The file itself was not modified.
8. **R6 BASELINE.json** binds the R6-era hashes of the product/canon files edited here. A re-run of `verify-r6` `baseline-preserved` would list them: an expected post-closure supersession. Not run, because it rewrites R6 evidence.
9. **Historical records stay as written:**
   - MISSION_LEDGER line 542 "iOS + Android smartphone" and line 552 "structured export quando suportado";
   - the FG phase-3 platform answer in the PDR and PTM S3;
   - the legacy `explorations/visual-v1` "Enviar ao relógio".

## 8. Platform decision — RESOLVED

**OPEN_PRODUCT_PLATFORM_DECISION-01** (the Founder's OPEN_PRODUCT_PLATFORM_QUESTION-1) is **RESOLVED — V1_IOS_ONLY** (DR-120, 2026-10-27). Android is POST_V1 / FUTURE_PLATFORM_EXPANSION, after initial product validation.

**Remaining open product item from this mission:** HEALTHKIT_WRITEBACK = OPEN_TECHNICAL_PRODUCT_DECISION (DR-121). Owners: Founder + Product/UX + Engineering, at iOS implementation prep (G06/G07). It is not a blocker.

## 9. Inputs for the future V1 Design Reconciliation & Implementation Freeze

This mission runs after the Coaching Core closes. No Figma round happens now. The reconciliation:
- **removes from V1:** Garmin, COROS and Polar (Integrações rows, CF-15 Garmin states, prototype path), Health Connect, Android-specific flows and structured-watch delivery (any sending of a workout, plan or calendar to a watch, Apple Watch included);
- **re-points ON-08** to Apple Health, without claiming that a vendor app writes there;
- **represents** only the pertinent iOS / Apple Health ecosystem, with HealthKit inbound;
- **shows partial and missing data honestly:** the fields that arrived and the unknown ones, never defaulted;
- **removes** any visual blocker based on direct wearable integration;
- **does not draw HealthKit write-back** as a requirement or as a refusal while it is open.

## 10. R6 history integrity

The SHA-256 of 606 files was taken before r1 and compared again after r2 ([before.json](before.json), VERIFICATION.json). The files covered:
- `audits/domain-coaching-r6-2026-10-26/**`;
- `CoachingCore/r6/**`;
- `CoachingCore/scripts/verify-r6.mjs`;
- the human revalidation queue.

No R6 report, freeze, holdout, review, evidence, hash, readiness or verdict was edited or reinterpreted.

## 11. Verdicts

| Verdict | Value |
|---|---|
| V1_WEARABLE_SCOPE_RECONCILIATION | READY |
| NEXT_COACHING_MISSION_CAN_REHYDRATE_NEW_SCOPE | YES |

The r2 confirmed state is in §1.
