# Matriz de ownership por tema (A · B · C · integração)

Complementa a matriz de **arquivos** do contrato paralelo §10 (rev. 2). **Dono** = único implementador de produção; **consome** = usa pela porta; **—** = não toca. Nenhuma frente implementa o que é de outra.

## 1. Temas

| Tema | A · CoachingHost | B · HealthKit | C · SwiftUI | Integração / FDR |
|---|---|---|---|---|
| Bundle JavaScriptCore (AMENDMENT-2, 50 módulos, + `app-projections.mjs` verbatim), fila serial, funções de host | **dono** | — | — | gate de equivalência no aparelho |
| Persistência do registro, Keychain, CryptoKit, âncora `{version, docMac, carriedSeq}`, lock entre processos, reconciliação de 1ª execução, D1 | **dono** | — | — | extensão real, backup (D2) |
| Operações da fronteira e tradução para Swift (`CoachingReading`, `CoachingWriting`) | **dono** | — | consome | — |
| Requests fechados (intake, relatos, F08, perfil FC) | envia | — | **preenche** (tipos compartilhados) | mantém os tipos |
| Triagens (`eligibility`, `specialPopulation`, sinais por condição) | transporta; `Startability` (SEC-FPV-01, triagem pendente, D1, R7-B0, **FND-ABC-04**) | — | fluxo e cópia; nunca decide | SSCTR/SEC |
| Estados de prescrição (`view`, hold, pergunta, pendente) | mapeia | — | apresenta | — |
| Custódia, integridade, consentimentos, apagamentos | **dono** | `purge` | telas | G07 (FDR + jurídico) |
| Autorização HealthKit, leitura de treinos e distância, observer/anchored query, background delivery, fila, dedupe, revogação | — | **dono** | — | prova com app fechado |
| Entrega de corridas ao motor (canal DEVICE) | `DeviceActivitySink` | **dono** do envio | — | — |
| Estado da ingestão e importados não-corrida para a UI (CHG-UI-3) | — | **dono** (`HealthIngestStatusSource`) | consome | — |
| **FC: zonas Z1–Z5** (estimada, informada, personalizada, medida) | expõe a leitura do motor; `set/eraseHeartRateProfile` | — | mostra `minBpm…maxBpm`; telas de máxima e limites | — |
| **FC: amostras de um treino** (série) | — | **dono** da leitura e validação (`HeartRateSeriesSource`); **nunca** classifica | — | decisão da permissão (G-1/GAP-17) |
| **FC: tempo em zona** | **dono** do cálculo (`TimeInZoneClassifying` → `classifySamples` do motor, portão) | fornece a série | mostra ou oculta | SSCTR C10 abre o portão |
| FC de repouso, VFC, sono (só exibição) | — | **dono** (`HealthSignalSource`, `notInV1` por padrão) | mostra quando aprovado | **FDR + SEC decidem** a leitura |
| **GPS: gravação da corrida no iPhone** (CoreLocation, cronômetro, pausa/retomada, background, arquivo temporário e recuperação, rota local para compartilhar, estados de localização) | — | — | **dono**, pacote **não visual** `ios/Packages/RunRecorder` | — |
| GPS: o que vai ao motor | recebe o relato do atleta (minutos, RPE, resposta, parada de sessão planejada) | — | constrói o relato a partir do tempo gravado; **nenhuma** coordenada, distância, ritmo ou parcial medida do iPhone | — |
| GPS: escrita no HealthKit (DR-121) | — | seria B (B2) | — | **FDR + SEC decidem**; default: não grava |
| Dedupe gravação do iPhone × Apple Saúde | — | **aplica** `RecordingDedupe` antes de entregar | publica `AppRecordingIndex` | revisão da regra (SSCTR + Eng.) |
| **Histórico** prescritivo (decisões, fatos F08) | `history()` | — | telas | — |
| **Histórico** de execução (relatos com séries, cargas, distâncias, vozes) | `loggedEntries()` (projeção compartilhada) | — | telas, PRs, "Anterior" | — |
| **Força avulsa** | `submit` com `unplannedStrength` (com `observedAt`); `WriteOutcome.kept` por `keepsReport` | — | "salvo" só se `kept` | Core (FND-ABC-01) |
| Força importada do Apple Saúde | — | resumo `ImportedWorkoutSummary` (nunca ao motor) | "só a duração" | — |
| Splits, rota, mapa, ritmo ao vivo | — | — | **dono** (`RunRecorder` + MapKit), só exibição | — |
| Navegação, design system, componentes, telas, onboarding, Hoje, Plano, Histórico, Progresso, Perfil, gamificação V1, shareables, paywall (StoreKit 2 local), notificações, Live Activity, WeatherKit, motion | — | — | **dono** | backend (conta, assinatura de servidor) |
| Composição real (A + B + C) | — | — | — | **dono** (`ios/App/Composition/**`) |
| Contratos compartilhados, fixtures, trava do aparelho | leitura | leitura | leitura | **dono** |

## 2. Fonte de cada campo do histórico e do detalhe (mission 5.4)

| Campo na tela | Fonte | Disponível na V1 |
|---|---|---|
| data, feito / não feito, minutos | `loggedEntries` (motor: relato do atleta e/ou do aparelho) | sim |
| séries, repetições, cargas, RIR | `loggedEntries.exercises` (o que o atleta registrou) | sim |
| carga prescrita / regra / estabelecimento | `PlannedSession.prescription.exercises[].load` (motor) | sim |
| distância medida | `loggedEntries.measuredKm` (canal DEVICE: Apple Watch / iPhone via Apple Saúde) | só com treino do Apple Saúde |
| distância declarada / contestada | `declaredKm` / `contested` (atleta) | sim |
| distância medida pelo **iPhone (RepMile)** | `RunRecorder` local — **não** está no registro | só no resumo local ("medido pelo iPhone · não usado pelo plano"), até DR-121 |
| ritmo, parciais, rota | `RunRecorder` local (gravação do app) ou nada | só exibição local |
| RPE, parada, resposta | `loggedEntries` (voz do atleta) | sim |
| FC (máxima da sessão, tempo em zona) | máxima única: anchors de intake; tempo em zona: série de B + classificador do motor | máxima: sim; tempo em zona: **oculto** (portão C10) |
| o que mudou no plano e por quê | `history().decisions`, `decision(id)` | sim (texto do motor por código) |
| execução contra a prescrição de corrida | `presentation().inForce[].execution` via `execution(sessionId:date:)` | sim |

O motor não guarda os dados brutos de uma atividade, e não precisa: o que influencia a adaptação chega a ele só pelos canais existentes (relato do atleta; corrida do aparelho).

## 3. Sem relógio (mission 6.4)

| Capacidade | Depende de relógio? | Como |
|---|---|---|
| criar o plano | não | intake (`OnboardingAnswers`) |
| executar corrida | não | `RunRecorder` (tempo, etapas) + relato do atleta |
| registrar musculação | não | `plannedStrength` / `unplannedStrength` |
| consultar histórico | não | `loggedEntries` |
| consultar zonas estimadas | não | `AGE_ESTIMATE` (220 − idade) |
| progressão por ritmo, duração e esforço | não | calibração do motor por relatos e anchors |
