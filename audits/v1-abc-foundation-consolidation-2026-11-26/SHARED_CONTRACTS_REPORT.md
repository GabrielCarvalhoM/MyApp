# Contratos compartilhados — relatório

Dois pacotes Swift só com Foundation, uma fachada JS somente leitura e um conjunto de fixtures do runtime atual. É tudo o que A, B e C compartilham. Dono: a missão de integração (contrato §10/§11); leitura para as três frentes.

## 1. Pacotes

| Pacote | Quem produz | Quem consome | Dependências | Testes |
|---|---|---|---|---|
| `ios/Packages/IntegrationContracts` | A (`DeviceActivitySink`), B (`DeviceQueueControl`, `HealthIngestStatusSource`, `HeartRateSeriesSource`, `HealthSignalSource`), C (`AppRecordingIndex`) | A, B, C, composição | Foundation | 10 (7 originais intactos + 3) |
| `ios/Packages/CoachingPresentation` | A (implementa `CoachingReading`, `CoachingWriting`, `TimeInZoneClassifying`; liga `Facade/app-projections.mjs`) | C (views, formulários), A (decodifica a fachada nesses tipos) | Foundation + `IntegrationContracts` (uma via) | 29 Swift (+ 13 Node dentro deles) |

Os dois compilam para macOS e para iOS genérico (`evidence/ios-generic-build-*.txt`: BUILD SUCCEEDED).

## 2. `CoachingPresentation`

| Arquivo | Conteúdo |
|---|---|
| `OpenCode.swift` | `ClientState` (desconhecido → `unrecognized`, falha fechada; `REDUCED` cai aí), `Code`, `EngineText` |
| `PlanView.swift` | `PlanView`, `SportState`, `Hold`, `Guidance`, `Pending`, `Question`, `Week`, `PlannedSession` (`executable` necessário, não suficiente), `Prescription`, `PrescribedLoad` (prescrita × regra × estabelecimento) |
| `RunPresentation.swift` | `PresentationSnapshot` com **`runSession(for:)`** (único caminho para os passos, filtrado pela view: FND-ABC-05) e `execution(sessionId:date:)`; `RunSessionPresentation` (`blocks` opcional sob hold), `RunExecution` (medida × declarada × extensão) |
| `Readings.swift` | `Readings`, `WarningSignScreen`, `RunCalibration`, `RunForecast`, `PaceInsights`, `StrengthExposure` (FND-HR5-03: `isDescriptiveOnly` nunca falso) |
| `HeartRateFiveZones.swift` | as cinco zonas da HR5R (referência, proveniência, confiança, limites `minBpm…maxBpm` do motor, `notUsed`, medições únicas, `sessionDistribution`/`liveHeartRate` UNAVAILABLE), `HeartRateProfileRequest` (nil = limpa, omitido = mantém), `HeartRateProfileAnswer` |
| `HistoryAndAnswers.swift` | `HistoryView` congelado; `BoundaryAnswer` (+ `planOutcome`: `planCreated`, `outsideV1Scope`, `needsInput`, `clinicalHumanRequired`, `invalidInput`, `failed`, `unrecognized`), `BoundaryError` (+ `fields`, `purpose`, `version`); **projeções:** `LoggedEntries`/`LoggedEntry` (vozes, `measuredKm` × `declaredKm` × `contested`, `unplannedMerge`, `keeps(_:)`), `WeekPlanProjection`, `TimeInZoneReading` |
| `CoachingPort.swift` | `CoachingContract.version = RM-ABC-CONTRACT-1`, `projections = RM-APP-PROJECTIONS-1`, `engineRecord`; `Startability` / `NotStartableReason` (+ `OUTSIDE_V1_SCOPE`); portas `CoachingReading`, `CoachingWriting`; `WriteOutcome {answer, kept, notKept}` |
| `TimeInZone.swift` | porta `TimeInZoneClassifying` (A), entrada `IntegrationContracts.HeartRateSeries` |
| `DisplayValue.swift` | `DisplayValue<Value>`, `Availability` (`available`, `partial`, `missing`, `stale`, `loading`, `error`, `unsupported`, `disabledInApp`), `ValueSource` |
| `Requests/Intake.swift` | `OnboardingAnswers` (o que C coleta), `IntakeRequest` (o que A envia; envelope só do host), `AthleteIntake` (**`specialPopulation` obrigatório**), `EligibilityScreen` (não respondido = omitido), `PerformanceAnchor` (+ FC e lab), `IntakeCustodyMode.syntheticShadowReference` (único caso), `Consents` |
| `Requests/Reports.swift` | `AthleteObservation` (`plannedRun`, `plannedStrength`, `unplannedRun`, `unplannedStrength`, `correcting(eventId:)`), enumerações congeladas (`StopReason`, `DeclaredDistanceReason`, respostas, cargas) |
| `Requests/Reviews.swift` | `ReviewRequest` (um caso por intenção, só `CLIENT_REVIEW_FIELDS`), `WarningSignQuestionSet` (vem da fachada), `SignAnswers` (só os sinais perguntados), `WellbeingDeclaration`, `WellbeingCheckAnswers`, `ReadinessDeclaration`, `BreakReport`, `ExerciseSubstitution` |
| `Facade/app-projections.mjs` | `loggedEntries`, `keepsReport`, `weekPlan`, `warningSignSet(s)` (reexport do `v1-f08.mjs` congelado), `timeInZones` (o `classifySamples` congelado, com portão `enabled:false`) |
| `Facade/capture-fixtures.mjs` | gera as 99 fixtures pelo runtime atual (`createIntegration` + `api.mjs`), determinístico |
| `Facade/e2e-runner.mjs` | roda requests codificados pelo Swift na fronteira real, fazendo o papel de A |

## 3. `IntegrationContracts` (aditivo)

| Arquivo | Conteúdo |
|---|---|
| `DeviceActivity.swift`, `DeviceDelivery.swift`, `Ports.swift` | **intactos** (A ↔ B, canal DEVICE) |
| `HealthIngest.swift` | `HealthIngestStatus` (nunca "negado"), `ImportedWorkoutSummary` (não-corrida, só duração, nunca ao motor), `HeartRateSeries` (validada, no formato de entrada do `classifySamples`; B nunca classifica), `HeartRateSensorClass` (`UNKNOWN` não qualifica), `HealthSignalReading`/`HealthSignalAvailability` (`notInV1` até a decisão GAP-17) e as portas de B |
| `AppRecordedRun.swift` | `AppRecordedRunRef` (sem coordenada, distância, ritmo ou rota), `AppRecordingIndex` (C), `RecordingDedupe` (regra única de contagem) |

## 4. Regra única por tema

| Tema | Regra |
|---|---|
| **Tipos compartilhados** | só nestes dois pacotes. Uma frente não cria tipo paralelo de view, request, erro ou estado; precisa de um → proposta (contrato §11) |
| **Protocolos** | as portas acima; cada uma tem um único implementador de produção (A, B ou C) e um dublê de teste permitido |
| **Modelos de apresentação** | os tipos decodificados; os view models de C derivam `DisplayValue` deles, sem número inventado |
| **DTOs** | o JSON da fronteira é o DTO; A decodifica com os tipos daqui; não existe segundo DTO |
| **Fixtures** | só as de `Tests/CoachingPresentationTests/Fixtures`, regeneradas por `capture-fixtures.mjs`. C pode montar cenários **combinando** fixtures; não pode escrever JSON de resposta à mão |
| **Erros** | `BoundaryError.code` (aberto) + `ClientState`; a tabela do handoff §7; código desconhecido = falha fechada |
| **Loading** | `Availability.loading` enquanto a chamada assíncrona de A não volta; nunca um zero |
| **Sem permissão** | HealthKit: nunca "negado" (`HealthAuthorizationRequest` + "nada recebido"); localização: estado do `RunRecorder`; consentimento: `CONSENT_REQUIRED` (`BoundaryError.purpose`) |
| **Bloqueado** | `ClientState.blocked` + `Hold`; nenhuma prescrição, nenhum passo (`runSession(for:)` nil), "Começar" desligado por `Startability` |
| **Disponibilidade parcial** | `Availability.partial(missing:)`; o layout fecha o espaço do que falta |
| **Identificadores** | `eventId`, `decisionId`, `sessionId`, `activityId` (= `HKWorkout.uuid`), `AppRecordedRunRef.id` (UUID do gravador). A UI nunca cria `clientRequestId`, `expectedVersion` ou `actor`: A cria |
| **Versionamento** | `CoachingContract.version` / `projections` / `engineRecord`; mudou o runtime (emenda) → as fixtures mudam e `FixtureFreshnessTests` falha até regenerar; mudou a fachada → sobe `PROJECTIONS_VERSION` |

## 5. Validação contra o CoachingCore atual

- **99 fixtures** (mais `INDEX.json`) capturadas do runtime da AMENDMENT-2 (não as antigas da reconciliação), em duas execuções byte a byte iguais; `FixtureFreshnessTests` refaz a captura em cada `swift test` e compara.
- Todas decodificam (`testEveryFixtureDecodes`), inclusive hold, apagado, fora de escopo, sem dados, erros de versão/idempotência/consentimento e as cinco zonas em 13 casos.
- As 10 asserções originais do CHG-UI-1/HR5R passam nas fixtures atuais; a compatibilidade com as capturas congeladas e de revisão 1 continua testada (lidas nas pastas históricas).
