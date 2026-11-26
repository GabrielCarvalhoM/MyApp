# REPMILE — Missão 2: consolidação final da fundação V1 (A + B + C) — relatório final

**Data:** 2026-11-26 · Mac mini M4 · sintético. **Branch:** `claude/v1-abc-foundation-consolidation` (de `237797c`). **Tag da base comum:** `v1-abc-ready-2026-11-26` (anotada, neste commit de fechamento; `git rev-parse v1-abc-ready-2026-11-26^{commit}`).

## 1. Veredito

**PARALLEL_A_B_C_READY = YES** (READY_FOR_PARALLEL_IMPLEMENTATION, modo sintético). **REAL_ATHLETE_READY = NO** (inalterado).

As três frentes podem começar hoje sobre a mesma base, cada uma na sua worktree, sem depender das outras: A e B como antes; C contra os contratos e as 99 fixtures do runtime atual. O que continua aberto tem dono e está na §12 do contrato paralelo (rev. 2); nada disso bloqueia o início.

## 2. O que foi feito

| Área | Entrega |
|---|---|
| CoachingCore | **nenhum byte** mudou; runtime = FIVE-ZONE-AMENDMENT-2 (bundle `d087ad51…`); suíte saneada preservada (1952/1952/0; 53 históricos) |
| CHG-UI-1 (+1b) | pacote `ios/Packages/CoachingPresentation`: leituras (plano, sessões, apresentação, leituras, cinco zonas, histórico, respostas), **requests fechados** do canal do atleta, portas `CoachingReading`/`CoachingWriting`/`TimeInZoneClassifying`, `Startability`, `DisplayValue` |
| CHG-UI-2 | `specialPopulation` obrigatório e provado em 7 elos; `actual.sport` e `declared`; projeções `loggedEntries`/`keepsReport`, `weekPlan`, `warningSignSet` (reexport congelado), `timeInZones` (classificador do motor, fechado por portão) |
| CHG-UI-3 | estado da ingestão e importados não-corrida (B → C), aditivo |
| CHG-UI-4 | frente C no contrato (diretórios, trava `swiftui`, bundle id, aceite) |
| CHG-UI-5 | gravador no iPhone = C (`RunRecorder`, sem UI); nenhuma coordenada ao motor; `RecordingDedupe`; escrita no HealthKit = decisão FDR + SEC |
| CHG-UI-6 | contrato paralelo **rev. 2**; três handoffs novos e três prompts; os antigos marcados SUPERSEDED |
| HR5 | contratos de `setHeartRateProfile`/`eraseHeartRateProfile`, persistência, apagamento, `carriedSeq`, proteção de concorrência definida e modelada, persistência entre processos provada em Node |
| Fontes e hardware | série de FC (B) → classificador do motor (A); FC de repouso/VFC/sono só exibição, `notInV1`; sem relógio garantido por contrato |
| Figma | alinhamento funcional atualizado (GAP-37 suportado com Z1–Z5; proposta "baixa·moderada·alta" revogada); **nenhuma edição** no Figma |

## 3. Achados novos (todos sem mudar o motor)

- **FND-ABC-01:** dois relatos avulsos no mesmo instante → uma linha; contornado (`observedAt` obrigatório, "salvo" só por `kept`).
- **FND-ABC-02:** o motor não lê parada em corrida avulsa (conhecido); o tipo não a tem, e o sintoma vai ao fluxo "Não estou 100%".
- **FND-ABC-03:** os formulários de `api.mjs` perdem RPE/distância/parada; todo relato vai por `submit`.
- **FND-ABC-04 / 04b (segurança):** um restart fora de escopo (gestação, pós-parto, idade) ou clínico deixa o plano anterior executável; portão nativo obrigatório em A (`outsideV1Scope`, `clinicalHumanRequired`).
- **FND-ABC-05:** `presentation()` mantém passos sob hold; o único acesso é `runSession(for:)`.
- **FND-ABC-06:** dupla contagem relato avulso manual × relógio (aberto: Core + SSCTR + B).
- **FND-HR5-03 fechado**; **FND-HR5-01** (`runEvidence`) mantido fechado na fronteira, por decisão.

## 4. Critérios

| Critério | Resultado | Evidência |
|---|---|---|
| LATEST_COACHINGCORE_INCORPORATED | **YES** | base `237797c` (AMENDMENT-2 + saneamento); `BASELINE_AND_ANCESTRY.md` |
| SANITIZED_TEST_SUITE_PRESERVED | **YES** | `npm test` 1952/1952/0 antes e depois; diff 0 em `CoachingCore` |
| FIVE_ZONE_HR5_CONTRACT_READY | **YES** | `HR5_INTEGRATION_REPORT.md`; 13 fixtures de zonas; e2e do perfil |
| CHG_UI_1_INCORPORATED | **YES** | `ios/Packages/CoachingPresentation` |
| CHG_UI_2_BLOCKING_FIXES_DONE | **YES** | `SECURITY_SCHEMA_VALIDATION.md` |
| CHG_UI_4_INCORPORATED | **YES** | contrato rev. 2 §9/§10/§15; trava `swiftui` |
| SPECIAL_POPULATION_PRESERVED | **YES** | 7 elos; e2e Swift + Node (restart: portão de A, FND-ABC-04) |
| BLOCKED_PLAN_DECODING_VALIDATED | **YES** | `BlockedAndDescriptiveTests` (apresentação inteira sob hold decodifica) |
| SWIFT_PRESENTATION_TESTS_PASS | **YES** | 29/29 |
| SHARED_CONTRACTS_TESTS_PASS | **YES** | IntegrationContracts 10/10; Node 13/13; iOS genérico BUILD SUCCEEDED |
| NO_DUPLICATED_SPORTS_LOGIC | **YES** | sinais, zonas e classificação só do motor; revisão QRE "limpo" |
| GPS_OWNERSHIP_DEFINED | **YES** | `OWNERSHIP_MATRIX.md`, `AppRecordedRun.swift` |
| HEALTHKIT_HR_OWNERSHIP_DEFINED | **YES** | `HealthIngest.swift`, `TimeInZone.swift` |
| WORKTREE_A_READY | **YES** | limpa, ancestral; fast-forward para a tag e push no fechamento |
| WORKTREE_B_READY | **YES** | idem |
| WORKTREE_C_READY | **YES** | branch e worktree criadas na tag no fechamento |
| ALL_THREE_ON_COMMON_BASE | **YES** | as três na tag (prova no fechamento, `PARALLEL_BRANCH_STRATEGY.md` §3) |
| FIGMA_FUNCTIONAL_ALIGNMENT_READY | **YES** | `FIGMA_FUNCTIONAL_ALIGNMENT.md` (sem edição de Figma) |
| INDEPENDENT_REVIEW_PASSED | **YES** | QRE R1/R2 READY_WITH_CONDITIONS (HIGH fechados), SSCTR ACCEPT_WITH_CONDITIONS; `INDEPENDENT_REVIEW.md` |
| REMOTE_BRANCHES_PUBLISHED | **YES** | push sem force; local = remoto verificado no fechamento |
| PARALLEL_A_B_C_READY | **YES** | §1 |

## 5. Pontos de entrada

| Frente | Handoff | Prompt |
|---|---|---|
| A · CoachingHost | `A_COACHINGHOST_HANDOFF.md` | `A_START_PROMPT.md` |
| B · HealthKit | `B_HEALTHKIT_HANDOFF.md` | `B_START_PROMPT.md` |
| C · SwiftUI | `C_SWIFTUI_HANDOFF.md` | `C_START_PROMPT.md` |

Demais: `BASELINE_AND_ANCESTRY.md`, `FOUNDATION_CHANGE_DECISIONS.md`, `SHARED_CONTRACTS_REPORT.md`, `SECURITY_SCHEMA_VALIDATION.md`, `HR5_INTEGRATION_REPORT.md`, `OWNERSHIP_MATRIX.md`, `FIGMA_FUNCTIONAL_ALIGNMENT.md`, `PARALLEL_BRANCH_STRATEGY.md`, `TEST_REPORT.md`, `INDEPENDENT_REVIEW.md`, `evidence/`.

## 6. O que continua para os gates certos (não bloqueia o início)

Atletas reais (`syntheticOnly`, OPEN-4), SEC-FPV-01/02/03, G07 (inclusive se HEALTH_SIGNALS governa o perfil de FC), D1 com servidor, D2, D3, R7-B0 até 2027-04-30, textos clínicos/jurídicos (G04), DR-121 (gravar corrida no HealthKit), GAP-17 (sinais do relógio), C10 (série de FC), FND-ABC-04/04b/06, FND-HR5-01, X1 na rota de sintoma, HealthKit com app fechado e semana real, backend (conta, assinatura, sincronização), revisão de segurança dos dados de FC, revalidação humana financiada das decisões SSCTR.

## 7. Publicação

- Commits organizados na branch da fundação; push sem force; nenhum merge em `main`.
- `MISSION_LEDGER.md`: uma entrada, só inserção. `CURRENT_MISSION.md` e os registros de freeze/emenda: intocados.
