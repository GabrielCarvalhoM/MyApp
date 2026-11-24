# RepMile V1: propostas de mudança na fundação paralela, a partir da reconciliação da UI

**Data:** 2026-11-24.

**Estado:** PROPOSTAS. Nenhuma foi aplicada.
- `ios/Packages/IntegrationContracts`, `tools/device-lock`, `PARALLEL_IMPLEMENTATION_CONTRACT.md` e os handoffs A/B continuam byte a byte como em `8d2a7c0`/`077f031`.
- As branches `claude/v1-ios-coachinghost` e `claude/v1-ios-healthkit` e as worktrees delas não foram tocadas.

**Regra seguida:** contrato paralelo §11. A proposta fica registrada aqui com motivo, diff, impacto e testes; a missão de integração decide.

| Id | O quê | Afeta | Bloqueia quem | Tamanho |
|---|---|---|---|---|
| CHG-UI-1 | Novo pacote compartilhado `CoachingPresentation`: tipos das views, leituras, histórico, respostas, porta `CoachingReading`, `Startability`, `DisplayValue` | A (produz), C (consome) | C (binding de dados); o item 9 de A | proposta pronta e testada (`proposals/CoachingPresentation`) |
| CHG-UI-2 | Escopo adicional de A: projeções somente leitura na fachada e correções na lista de chaves de schema | A | nenhuma frente; corrige gaps de segurança antes de atletas reais | lista fechada abaixo |
| CHG-UI-3 | Adição em `IntegrationContracts`: estado da ingestão e resumo de importados não-corrida, B → C | B (produz), C (consome) | nada no começo; é aditivo | diff abaixo |
| CHG-UI-4 | Ownership da frente C, sessão `swiftui` na trava do aparelho, diretórios e bundle id | contrato §10, `with-device.sh` | **C não pode começar sem isso** | pequeno |
| CHG-UI-5 | Dono do gravador da corrida no app (CoreLocation, etapas, background) e decisão de gravação no HealthKit | B/C, FDR | GAP-16 | decisão + escopo |
| CHG-UI-6 | Emendas de texto: contrato §12 e handoffs A/B | contrato, handoffs | nenhuma | texto |

---

## CHG-UI-1 · Pacote `ios/Packages/CoachingPresentation`

**Motivo.**
- O handoff A, item 9, manda A definir "tipos Swift de request e resposta" e "valores Swift da view" dentro de `CoachingHost`.
- A frente C precisa desses tipos desde o primeiro dia, para programar contra fixtures enquanto A não existe.
- Se A os definir sozinho dentro do próprio módulo, C não tem contra o que compilar, ou cria tipos paralelos. As duas saídas geram retrabalho e contratos concorrentes.
- É o mesmo padrão já aprovado para A↔B: tipos e portas num pacote só com Foundation, que nenhuma das duas frentes escreve.

**Conteúdo** (proposta em `proposals/CoachingPresentation/`, `swift test`: 6 testes, 0 falhas):

| Arquivo | Tipos |
|---|---|
| `OpenCode.swift` | `ClientState` (desconhecido → `unrecognized`, falha fechada; `REDUCED` cai aí), `Code`, `EngineText` |
| `PlanView.swift` | `PlanView`, `SportState`, `Hold`, `Guidance`, `Pending`, `Question`, `DecisionSummary`, `Week`, `PlannedSession`, `Prescription`, `PrescribedExercise`, `PrescribedLoad` (prescrita × regra × estabelecimento), `NextSetting` |
| `RunPresentation.swift` | `PresentationSnapshot`, `RunSessionPresentation`, `RunBlock`, `RunStep`, `StepTarget` (`TIME`/`DISTANCE`), `StepIntensity`, `PaceBand`, `RunExecution` (medida × declarada × extensão) |
| `Readings.swift` | `Readings`, `WarningSignScreen`, `RunCalibration` (capacidade, faixas, zonas, estimativas, projeção, resultados, `assessment`), `RunForecast`, `PaceInsights`, `StrengthExposure` |
| `HistoryAndAnswers.swift` | `HistoryView`, `BoundaryAnswer`, `BoundaryError`, `LoggedEntry` (da projeção CHG-UI-2) |
| `CoachingPort.swift` | `CoachingReading` (porta), `Startability`, `NotStartableReason`, `PendingReports`, `DecisionDetail` |
| `DisplayValue.swift` | `DisplayValue<Value>`, `Availability`, `ValueSource` (`UI_DATA_STATES.md` §1) |

**Fora da proposta, de propósito:**
- os requests de escrita. Eles são de A (handoff A item 9, structs fechadas de intake e formulários), porque carregam as regras de schema SEC-INT-05/12;
- C chama a escrita por uma porta `CoachingWriting`, que A publica no mesmo pacote quando fechar as structs (CHG-UI-1b, depois do item 9 de A);
- até lá, C programa formulários contra as fixtures de resposta e um dublê de escrita que só aceita os payloads de HO §5.

**Diff:**
- adicionar `ios/Packages/CoachingPresentation/` com o conteúdo de `proposals/CoachingPresentation/`;
- copiar `probes/out/*.json` para `Tests/CoachingPresentationTests/Fixtures/` e trocar o caminho dos testes;
- adicionar `audits/v1-ui-functional-reconciliation/probes/` à lista "leitura" do contrato §10.

**Impacto:**
- **A:** ver a tabela abaixo.
- **B:** nenhum.
- **C:** depende do pacote para todo binding de dados.

Impacto em A:

| O que muda | Como |
|---|---|
| Implementação | A implementa `CoachingReading` e decodifica o JSON da fachada nesses tipos |
| Proibição | A não cria tipos de view paralelos |
| Teste | as saídas da fachada no aparelho decodificam e batem com o oráculo Node |

**Testes:**
1. os 6 da proposta;
2. um teste de A que decodifica cada resposta da fachada real (Node e JSC);
3. um teste de C que renderiza uma fixture por estado sem crash.

---

## CHG-UI-2 · Escopo adicional de A (fachada e schema), sem mudar o CoachingCore

A fachada JS é código de aplicação (HO §2) e lê a custódia pela API congelada. Nada aqui altera bytes do freeze.

| # | Item | Gap | Natureza |
|---|---|---|---|
| 2.1 | `loggedEntries()`: os relatos visíveis do próprio atleta, projetados em `LoggedEntry` (canal, esporte, data, minutos, distância e medição, RPE, motivo de parada, exercícios, séries e cargas, `superseded`). Sem chaves reservadas da fronteira | GAP-06 | projeção somente leitura; **revisão SEC** do que cruza a ponte |
| 2.2 | `weekPlan()`: `{index, startDate, phase, plannedRunMinutes, plannedStrengthSets, status}` de `program.weeks[]` | GAP-07 | projeção somente leitura |
| 2.3 | `pendingWeek()`: as sessões do plano proposto, no formato da view | GAP-08 | projeção somente leitura |
| 2.4 | `warningSignsFor(condition)` e `exerciseSignsFor(condition)` reexportados de `v1-f08.mjs`, sem cópia em Swift | GAP-03 | reexport da função congelada |
| 2.5 | `startability(sessionId)` com a regra SEC-FPV-01, `warningSignScreen` pendente, D1 e R7-B0 | GAP-04, GAP-21 | já é do item 9 de A; aqui só ganha o tipo de CHG-UI-1 |
| 2.6 | Operação de troca de exercício por `submit({kind: EXERCISE_SUBSTITUTION, substitution: {exerciseId, reason: NONCLINICAL_DISCOMFORT_OR_PREFERENCE \| SKILL_MISMATCH, nonclinicalConfirmed, pain?}})` | itens confirmados | `api.mjs` não tem formulário; A expõe |
| 2.7 | **Schema SEC-INT-05 (intake):** acrescentar `athlete.specialPopulation: [PREGNANCY \| POSTPARTUM]` | **GAP-02 (segurança)** | correção da lista fechada |
| 2.8 | **Schema SEC-INT-12 (relatos do atleta):** acrescentar `actual.sport` (relato sem `sessionId`) e `actual.declared {distanceKm, reason}` (contestar a distância) | GAP-12, itens confirmados | correção da lista fechada |
| 2.9 | **Investigação:** a força avulsa é respondida como `recorded` e não fica no documento (`probes/trace-unplanned-strength.mjs`). Teste próprio, registro do resultado e, se for defeito, encaminhamento pela regra de exceção pós-freeze | GAP-12 | diagnóstico |
| 2.10 | **Provas pendentes:** `LOCAL_FATIGUE` (GAP-11); exercício fora da prescrição no relato de força; teste de campo (`assessment` oferecido); "aparelho sem vínculo + formulário do atleta" sem contagem dupla (GAP-14, com B na integração) | GAP-11, GAP-14 | testes |
| 2.11 | Opcional: `exportRecord()` (os dados do próprio atleta, local), parâmetros estruturados do retorno, chaves de FC dos anchors e `LAB_TEST` (GAP-37, se o Founder quiser zonas na V1) | GAP-24, GAP-31, GAP-37 | opcional |

**Impacto:**
- **A:** pode começar em `8d2a7c0` sem nada disto. Os itens 2.7 e 2.8 precisam entrar antes de A fechar as structs (item 9). Os itens 2.1 a 2.4 entram depois do runtime (itens 1 a 8).
- **B:** só o 2.10 (GAP-14), na integração.
- **C:** usa as projeções por dublê até A entregar.

**Testes:**
- cada projeção tem um teste Node contra os mesmos atletas sintéticos dos probes;
- o resultado é decodificado pelos tipos de CHG-UI-1;
- `eraseAccount` deixa `loggedEntries` vazio;
- o teste de schema falha se `specialPopulation` sumir.

---

## CHG-UI-3 · `IntegrationContracts`: estado da ingestão e importados não-corrida (B → C)

**Motivo:**
- 81 (Apple Saúde: conectado, nada recebido, atrasado, primeira importação, desligado por você, "o que está chegando");
- 20 ("Sem dados recentes do relógio", "2 aguardando sincronizar");
- 50 e 60 (força importada só com a duração).

Hoje só B sabe disso, e nenhuma porta leva essa informação à UI. A UI não pode ler o HealthKit diretamente: isso violaria o isolamento do contrato §2.

**Diff proposto** (arquivo novo `Sources/IntegrationContracts/IngestStatus.swift`; nada existente muda):

```swift
public enum HealthAuthorizationRequest: String, Sendable { case notRequested = "NOT_REQUESTED", requested = "REQUESTED" }
/// What B can honestly say about Apple Health. Never "denied": iOS does not reveal read denial (GAP-19).
public struct HealthIngestStatus: Equatable, Sendable {
    public let authorization: HealthAuthorizationRequest
    public let disabledInApp: Bool
    public let lastReadAt: Date?
    public let lastWorkoutReceivedAt: Date?
    public let initialImportInProgress: Bool
    public let lastReadError: String?        // a code, never a payload
    public let queued: Int                   // waiting for delivery
    public let waitingReason: String?        // e.g. SCREEN_REQUIRED, CLOCK_AHEAD_OF_REFERENCE, HOST_UNAVAILABLE
    public let setAside: Int
    public let receivedTypes: [String]       // what is arriving, e.g. ["RUN_WORKOUT","DISTANCE","ROUTE_PRESENCE"]
}
/// A non-run workout read from Apple Health for the history only: never delivered to CoachingCore (G-4).
public struct ImportedWorkoutSummary: Equatable, Sendable, Identifiable {
    public let id: String                    // HKWorkout.uuid
    public let activityKind: String          // e.g. TRADITIONAL_STRENGTH_TRAINING
    public let start: Date, end: Date
    public let durationSeconds: Double
    public let sourceName: String?           // as Apple Health reports it
}
public protocol HealthIngestStatusSource: AnyObject, Sendable {
    func status() async -> HealthIngestStatus
    func importedNonRunWorkouts(since: Date) async -> [ImportedWorkoutSummary]
}
```

**Impacto:**
- **B:** implementa a porta. B já classifica a força com contagem (G-4); passa a guardar o resumo, um dado do atleta, sob a mesma proteção da fila e apagado por `purge`.
- **A:** nenhum.
- **C:** consome.
- **Privacidade:** o resumo é um dado de saúde, apagado por `purge(.accountErased)` (G07).

**Testes:**
- B prova com um dublê de leitura que `status()` nunca afirma negação;
- `purge` esvazia os resumos;
- `swift test` de `IntegrationContracts` continua verde, com os 7 testes atuais intocados mais os novos.

---

## CHG-UI-4 · Ownership da frente C, trava do aparelho e diretórios

**Motivo:**
- o contrato §10 reserva `ios/App/**`, `ios/*.xcworkspace` e "telas SwiftUI" à missão de integração, e não tem nenhuma linha para uma frente C;
- `with-device.sh` só aceita `coachinghost | healthkit | integration`.

**Diff no contrato §10** (linhas novas; as atuais de A, B e compartilhado ficam):

| Caminho | A | B | C | Integração |
|---|---|---|---|---|
| `ios/Packages/RepMileUI/**` (design system, componentes, telas, view models, provedores de fixture, previews) | proibido | proibido | **escreve** | — |
| `ios/Packages/RunRecorder/**` (se CHG-UI-5 der o gravador a C) | proibido | proibido | **escreve** | — |
| `ios/App/RepMile.xcodeproj`, `ios/App/RepMile/**` (o app definitivo; na fase paralela liga só `RepMileUI` + `CoachingPresentation` + `IntegrationContracts` e os provedores de fixture) | proibido | proibido | **escreve** | — |
| `ios/App/Composition/**` (o ponto que liga `CoachingHost` e `HealthKitIngest` reais) | proibido | proibido | proibido | **escreve** |
| `ios/Packages/CoachingPresentation/**` | leitura (congelado) | — | leitura (congelado) | **escreve** |
| `audits/v1-ios-swiftui-2026-11-24/**` | proibido | proibido | **escreve** | — |
| `audits/v1-ui-functional-reconciliation/**` | leitura | leitura | leitura | **escreve** |
| `ios/*.xcworkspace` | proibido | proibido | proibido | **escreve** |

**Trava do aparelho:**
- `with-device.sh`: aceitar `swiftui` como quarto nome (uma linha no `case`);
- `-derivedDataPath <worktree>/ios/.build/DerivedData-C`.

**Identificação:**
- **Bundle id de desenvolvimento:** `fit.vilumo.repmile.dev.app.$(DEVELOPMENT_TEAM)`. O id definitivo da loja é decisão do FDR; o prefixo histórico `fit.vilumo` foi mantido só por coerência com os labs A e B.
- **Keychain:** C não usa o Keychain na fase paralela.
- **Entitlements:** só os de C (WeatherKit, se aprovado, e Live Activity).
- **HealthKit:** C nunca pede permissão de HealthKit. Isso é de B.

**Testes:** a bateria `device-lock-test` repete com `swiftui` (exclusão 75, sessão inválida 64).

---

## CHG-UI-5 · Gravador da corrida no app e gravação no HealthKit

**Motivo** (GAP-16): ninguém tem hoje o gravador da corrida (CoreLocation, cronômetro das etapas, background location, Live Activity, retomada depois da morte do processo). Sem decisão, a distância medida pelo iPhone não tem caminho honesto até o registro.

**Proposta:**
1. **Dono do gravador:** C, no pacote `ios/Packages/RunRecorder` (CoreLocation + cronômetro; sem HealthKit, sem JavaScriptCore).
   - **Saída:** o relato do atleta (tempo, etapas, esforço) e um `RecordedRun` local, com distância, rota e parciais.
2. **Decisão do FDR e de SEC** (DR-121 write-back, OPEN-1):
   - **(a) recomendada:** gravar o `RecordedRun` como `HKWorkout` + `HKWorkoutRoute` (escrita no HealthKit, escopo novo de B);
   - B importa pelo canal DEVICE com `measurement: GPS`;
   - a política de fonte passa a tratar "gravação do próprio Repmile" como aparelho.
3. **Sem decisão:** o `RecordedRun` só guia a sessão ao vivo e é descartado depois de salvar. O resumo mostra só o que o registro guarda.

**Impacto:**
- **B:** a escrita é escopo novo (B2), só com a decisão.
- **C:** o gravador entra no plano da frente C.
- **A:** nenhum.

**Testes:**
- com localização simulada, a sessão segue as etapas de `presentation`;
- depois de matar o processo, retoma;
- sem a decisão, nenhuma distância medida chega a um relato do atleta.

---

## CHG-UI-6 · Emendas de texto (contrato e handoffs)

**Contrato §12 (pendências).** Acrescentar, com dono:
- GAP-02 (A, SEC);
- GAP-03 (A);
- GAP-12 (A);
- GAP-16 (FDR, SEC, B/C);
- GAP-17 (FDR, SEC);
- GAP-18 (B).

**Handoff A:**
- item 9 passa a citar CHG-UI-1 (tipos de view) e CHG-UI-2 (projeções e schema);
- os itens 2.7 e 2.8 entram antes de fechar as structs.

**Handoff B:**
- CHG-UI-3 como entrega aditiva;
- G-4 passa a guardar o resumo de não-corrida para exibição.

**Handoff C:** `SWIFTUI_IMPLEMENTATION_HANDOFF.md` (esta pasta) entra em `audits/v1-parallel-foundation-2026-11-24/` como terceiro handoff.

---

## Como incorporar sem quebrar A e B

**Pré-condição.** As duas branches estão em `8d2a7c0`, sem commits (verificado nesta missão: worktrees limpas, `HEAD = 8d2a7c0`, remoto igual).

1. **O Founder aprova as propostas,** todas ou uma parte.
   - O mínimo para C começar é CHG-UI-1 + CHG-UI-4.
   - CHG-UI-2 entra no escopo de A sem bloquear o início dele.
   - CHG-UI-3 e CHG-UI-5 podem vir depois.
2. **A missão de integração aplica as propostas** na worktree de fundação (`claude/v1-parallel-foundation`):
   - adiciona `ios/Packages/CoachingPresentation`;
   - aplica a emenda de `IntegrationContracts` (se CHG-UI-3);
   - aplica a mudança de `with-device.sh`;
   - aplica as emendas de §10/§12 e dos handoffs.
3. **Ela verifica, nessa ordem:**
   - `--check` (87/87);
   - `swift test` dos dois pacotes;
   - build iOS genérico;
   - a bateria da trava.
4. **Ela publica a nova base:** commit, push sem force e tag anotada `v1-parallel-base-2-<data>`.
5. **A e B passam à nova base:**
   - **sem commits:** `git merge --ff-only v1-parallel-base-2-<data>` na própria worktree. É fast-forward puro: não reescreve nada e não precisa de force;
   - **se já tiverem commits:** um merge normal da nova base. Os caminhos são disjuntos (§10), sem conflito esperado;
   - quem faz o passo: a integração com OK do Founder, ou a própria sessão como passo 0.
6. **A frente C nasce da nova base:** branch `claude/v1-ios-swiftui` e worktree `.codex/worktrees/myapp-v1-ios-swiftui/MyApp`.

**Sem esperar a incorporação:**
- **A:** pode começar já, em `8d2a7c0`, pelos itens 1 a 8 do handoff (bundle, runtime, host, store, D1), que não dependem de nada aqui.
- **B:** pode começar já, sem mudança.
- **C:** só depois de CHG-UI-1 e CHG-UI-4, porque sem eles não tem diretório próprio nem contrato contra o qual compilar.
