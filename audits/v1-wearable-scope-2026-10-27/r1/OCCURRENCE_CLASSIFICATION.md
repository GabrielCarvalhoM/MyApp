# Occurrence classification — V1 wearable scope (VWS-20261027-r1)

## Search

Case-sensitive, run after the edits. Case-sensitive so that "Vilumo Fit" is not counted as FIT.

`Garmin|garmin|COROS|Coros|coros|Polar\b|polar\b|[Ww]earable|[Ss]tructured (workout|export)|WorkoutKit|[Ww]atch[ -]?sync|FIT (file|ingestion|import)|\.fit\b|[Dd]evice partner|Partner API|Health Connect|[Oo]utbound|relógio|[Ww]atch\b`

- **Scope:** the whole repository, without `.git` and `node_modules`.
- **No blind replacement:** every edit is a dated overlay or an in-place scope row with a before/ copy.
- **Classes:**
  - HISTORICAL — preserve;
  - SUPERSEDED — current reference updated, or superseded by a dated overlay or the central DR-117 map;
  - V2_POST_V1 — backlog specification, inert in V1;
  - GENERIC_CORE_CAPABILITY — preserve;
  - STALE_V1_REQUIREMENT — corrected here.

## A. Current authority files (clause level)

| File | Occurrence | Class | Action |
|---|---|---|---|
| canon/CANONICAL_INDEX.md | VWS pointer (new) | — | Current pointer |
| | A/B/C map, PDM/AEC "wearable … semantics" | GENERIC_CORE_CAPABILITY | Kept |
| | Prior CI-3.2.1 record "Ingest-first; outbound condicional" | HISTORICAL | Kept; filtered by the VWS pointer |
| canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md | C055 "provider terceiro … outbound condicional" | SUPERSEDED (V1 part) | Note after C055 |
| | C040, the "quando suportado" paragraph, §6 heading "closed loop" | SUPERSEDED (V1 outbound part) + GENERIC (states/provenance/consent/failure) | §6 note |
| | C009 "preparação condicional" | SUPERSEDED (V1 part) | §6 note |
| | O016 provider/device matrix | V2_POST_V1 (V1 narrowed to HealthKit) | §6 note |
| | C038 "Wearables priorizam ingestão confiável" | GENERIC_CORE_CAPABILITY | Kept, consistent |
| | C015 and agency (§4), disconnection ≠ rest (§8), health context (§9), failure table (§12) | GENERIC_CORE_CAPABILITY | Kept |
| | §14 source paragraph and rebaseline history "C040 amplia a direção wearable" | HISTORICAL | Kept |
| product/PRODUCT_DECISION_REGISTER.md | DR-107 Garmin/COROS/Polar candidate routes | SUPERSEDED | DR-117 |
| | DR-58 structured workouts; DR-83 conditional outbound; DR-68 outbound routes | SUPERSEDED (V1) / V2_POST_V1 | DR-117 |
| | DR-63 "envio ao relógio" | V2_POST_V1 (inert) | DR-117 |
| | §5 G06 row; "Não estão abertas … outbound condicional" | SUPERSEDED (V1 part) | DR-117/118 |
| | DR-47 old block "relógios e outros apps só como fontes"; FG phase-3 answers (Garmin age row) | HISTORICAL | Kept |
| product/V1_RELEASE_SCOPE.md | Wearables row "rotas pertinentes … export opcional" | STALE_V1_REQUIREMENT | Corrected in place |
| | NFV1 banner "Garmin, COROS, Polar … under G06" | SUPERSEDED | VWS banner |
| | §6 G06 "rota/device … sem outbound global" | STALE_V1_REQUIREMENT | Corrected in place |
| | §3 "app nativo em todos os relógios" OUT | GENERIC (still OUT) | Kept |
| | §7 "supersedem … outbound-launch obrigatório" | HISTORICAL | Kept |
| product/DESIGNER_PRODUCT_CONTEXT.md | "rotas candidatas Garmin, COROS e Polar sob G06" | STALE_V1_REQUIREMENT | Corrected in place |
| product/ADAPTIVE_ENGINE_CONTRACT.md | §5.1 WEA matrix (Garmin/COROS Partner, WorkoutKit, Polar, Terra), publish/update/delete, consent to send; §5.2/5.3; §5.4 publish/update/delete; §2 "opção de structured export" | V2_POST_V1 (inert) | §5 overlay |
| | §2.1, §4, §5.1 read side, opaque HealthKit, history gaps, §5.4 webhook/normalize/adapt | GENERIC_CORE_CAPABILITY | Kept, V1-binding |
| | §5.3 watch-copy states; Strength row "wearable somente suplemento fiel" | V2_POST_V1 / GENERIC | Overlay |
| product/PRODUCT_DOMAIN_MODEL.md | Integration row "export opcional"; W2 | V2_POST_V1 (inert) | Overlay |
| | §3 observation semantics; W1/W3 | GENERIC_CORE_CAPABILITY | Kept |
| product/UX_SPECIFICATION.md (61) | WEA-02(c), WEA-03 send side, WEA-10/11, §14.2 WEA-L, OBJ-12, ST-EXP, SURF-07 send facet, ALT-UX-04, RUN-05/07, HOJ-S4/C01, CONF-04, AM-02/CONF-01 export effects, J-04, J-15, DEG-05/06/15/28/35, NOT-C, §1.2 "Relógio" row | V2_POST_V1 (inert) | Overlay |
| | WEA-01/02(a,b)/03 read/04/05/06–07 read/08/09, STR-09, AM-12, CTN-03, HIS-02, DEG-01/04/07/14, ST-CONN, DEP-07 read | GENERIC_CORE_CAPABILITY | Kept, V1-binding for Apple Health |
| | HOJ-C02 / STR "relógio nunca substitui séries/reps/carga" | GENERIC_CORE_CAPABILITY | Kept |
| product/PRODUCT_TRUTH_MAP.md | VFT-C040 row "structured workouts quando suportado"; VFT-O016 row "wearable bidirecional"; THESIS_CONFLICT-RB-04; FZ-02; C006/C039/C040 row | SUPERSEDED (V1 part) | THESIS_CONFLICT-VWS-01 overlay |
| | S3 source "relógios apenas fontes"; failure rows | HISTORICAL / GENERIC | Kept |
| | L009/L014/C012/C034 rows | GENERIC_CORE_CAPABILITY | Kept |
| product/PRODUCT_ARCHITECTURE.md | §3 integration row "export só por rota admissível, sem projeto nativo de relógios"; AR-08 outbound | V2_POST_V1 (inert); "no native watch project" GENERIC | Central map (not edited: OB-2 target) |
| product/CORE_FLOWS.md | F04 "Enviar structured workout … Fluxo condicional V1"; S15; F02/F06 export effects | SUPERSEDED / V2_POST_V1 | Central map (not edited: OB-2 target) |
| | F05 ingestion; HealthKit opaque read; S01 solo without wearable; S13 favourable watch vs limitation | GENERIC_CORE_CAPABILITY | Kept |
| product/EXPERIENCE_MODEL.md | §6 "outbound condicional com seus estados" | SUPERSEDED (V1 part) | Central map |
| | §1 "ausência de relógio mantém observação manual" | GENERIC_CORE_CAPABILITY | Kept |
| product/ADAPTIVE_ENGINE_OPERATIONAL_SPEC.md | HC09, C09, export members | V2_POST_V1 (inert) | Central map (not edited: OB-2 target) |
| | C07 "Garmin atrasado não significa treino perdido"; `systemic_context`, `integration_state` | GENERIC_CORE_CAPABILITY | Kept; the vendor name is an example of lag |
| product/ADAPTIVE_ENGINE_SCENARIO_LAB.md | S17, S20, Q03, E-1 export intents | V2_POST_V1 (dormant oracles) | Central map |
| | S08 "Garmin é só nome da origem no fixture"; S25 opaque HealthKit; FZ-S12 ingestion only | GENERIC_CORE_CAPABILITY | Kept |
| product/SPORT/RUN/STRENGTH_INTELLIGENCE_SPEC.md | SIL-I1 manual + wearable one fact; RIL "ausência de GPS/FC/relógio não elimina caminho manual"; STIL "relógio não … inventa reps/carga/RIR" | GENERIC_CORE_CAPABILITY | Kept |
| | Export-fidelity notes | V2_POST_V1 (inert) | Central map |
| CURRENT_MISSION.md | NFV1/OB-2 records ("Apple Health drawing") | HISTORICAL | Kept |
| MISSION_LEDGER.md | Line 542 platforms/sources (2026-10-10); line 552 "structured export quando suportado"; line 543 Garmin age; line 730 "Apple Saúde and Apple Watch" | HISTORICAL | Kept, append-only |
| AGENTS.md / CLAUDE.md | No real hit ("Vilumo Fit" false positive with case-insensitive search) | — | — |

## B. Historical, evidence and candidate areas (group level)

| Area | Files with hits | Class | Note |
|---|---|---|---|
| `audits/domain-coaching-r6-2026-10-26/**`, `CoachingCore/r6/**` | 124 + 23 | HISTORICAL | R6 closed. Untouched (hash-verified). Provider labels in the holdout are synthetic. |
| `CoachingCore/r2–r5`, `artifacts`, `fixtures`, `test`, `scripts` | 10/15/12/3, 1, 2, 6, 2 | HISTORICAL / GENERIC_CORE_CAPABILITY | Synthetic fixtures (`wearable_baseline`, `NO_WEARABLE`) test generic data-tier and provenance handling. |
| `CoachingCore/src/**` | 10 | GENERIC_CORE_CAPABILITY | Vendor-agnostic: provider is a label; capability flags; "wearable is evidence with provenance". No vendor coupling, so the Core already fits DR-119. |
| `CoachingCore/BOUNDED_SHADOW_RUNTIME_CONTRACT.md` | 1 | GENERIC_CORE_CAPABILITY | "Wearables never create a fatigue/readiness score". |
| `audits/**` (other missions), `governance/snapshots/**`, `governance/drafts/**` | ~290 | HISTORICAL | Includes WEA-1.0 research packs (pre-ux, rebaseline), the NFV1 delivery (Garmin/COROS/Polar rows) and the before/ copies. |
| `reviews/**` | 14 | HISTORICAL | Scientific review records; wearable mentions are generic evidence/signal limits. |
| `product/candidates/**` | 19 | HISTORICAL (candidate, non-authoritative) | Read through DR-117–119 if ever promoted. |
| `explorations/visual-v1/**` | 1 | HISTORICAL | Legacy experience exploration ("Enviar ao relógio"); no authority. |
| Figma `TYR10AIrquCpKvKL3eyXyO` (not opened) | — | Stale V1 rows for the design reconciliation | Integrações rows Garmin/COROS/Polar, CF-14/CF-15, ON-08; see RECORD §9. |

## Result

- **Remaining STALE_V1_REQUIREMENT in current authority:** 0. The three found (RS wearables row, RS §6 G06, the designer context) were corrected in place.
- **Other V1 statements:** each sits under a dated VWS overlay in its file or in the DR-117 clause map. That covers PA, CF, EM, AEOS, AESL and SIS/RIL/STIL, which were left unedited on purpose.
