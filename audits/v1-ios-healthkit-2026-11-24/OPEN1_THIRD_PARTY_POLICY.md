# Frente B: OPEN-1, política 2 (corridas de outros apps pelo Apple Saúde)

Revisão de OPEN-1 pedida pelo Founder em 2026-11-26. O código está em `ios/Packages/HealthKitIngest`. Nenhum arquivo de `CoachingCore/**`, `ios/Packages/IntegrationContracts/**`, `ios/Packages/CoachingPresentation/**` ou `tools/device-lock/**` foi alterado. O que exigiria mudança de contrato está em `CONTRACT_CHANGE_PROPOSALS.md` (CCP-B-05..07).

## 1. Decisão e alcance

**Decisão do Founder (2026-11-26).** A V1 importa pelo Apple Saúde as corridas que estejam no HealthKit e autorizadas pelo atleta, qualquer que seja o app que as gravou: Apple Watch, iPhone, Garmin Connect, Strava, COROS, Polar e outros. A proveniência em app de terceiros, sozinha, não exclui uma corrida. A origem dos dados continua sendo só o HealthKit: nenhuma integração com API de Garmin, Strava ou fabricante.

**O que não muda:**
- só corrida (`running`) vai ao canal DEVICE;
- força continua fora do motor (G-4), e as demais modalidades viram histórico (GAP-18);
- o lançamento manual continua sendo declaração do atleta (SEC-INT-09 a);
- a janela de leitura continua a partir do dia de matrícula (NATIVE 3.4 / 3.4a). Importar corridas anteriores à matrícula seria capacidade nova, a decidir à parte; nada aqui altera o alcance temporal do motor;
- nada é escrito no Apple Saúde, e não se pede frequência cardíaca (G-1);
- `REAL_ATHLETE_READY` continua NO.

## 2. O que impedia a importação (exato)

| Onde | O quê | Situação agora |
|---|---|---|
| `Normalization.swift` `WorkoutNormalizer.select` (política 1) | `if !isDeviceSource(w.sourceBundleId) { return .excludedRun(THIRD_PARTY_SOURCE) }`, com padrão `isAppleSource` = prefixo `com.apple.health` | removido: `select` não olha a fonte |
| `HealthKitIngestor.Configuration.isDeviceSource` | o mesmo filtro, injetável (só o laboratório do Simulator o trocava) | removido |
| Contrato paralelo §4.1 item 4 ("só treinos gravados por aparelho entram") e §4.4 OPEN-1; `NATIVE_OBLIGATIONS.md` 3.2; contrato da fronteira §9.9 (SEC-INT-09) | texto de autoridade, fora da coluna de B | proposta CCP-B-06 (texto); a revisão de segurança decide (§6) |
| Fronteira congelada (`integration.mjs`, `admission.mjs`) | **nada**: a fronteira monta `source = {provider: HEALTHKIT, activityId, quality}` para qualquer DEVICE e não sabe qual app gravou | inalterada. Mas ela só deduplica por `activityId`: duas cópias da mesma corrida com UUIDs diferentes viram **duas linhas** (teste de controle `testControlTheBoundaryWouldRecordTwoCopiesAsTwoRuns`). Por isso a deduplicação entre fontes é de B |

## 3. Seleção (política 2)

| Treino no HealthKit | Resultado | Código |
|---|---|---|
| corrida medida, de qualquer fonte | canal DEVICE (fila de B) | — |
| corrida com `HKMetadataKeyWasUserEntered = true` (qualquer app) | nunca ao motor; fica no histórico como lançamento do atleta, sem distância (o número digitado não é medição) | `USER_ENTERED` |
| força tradicional/funcional | histórico apenas (G-4) | `STRENGTH_NOT_DEVICE_CHANNEL` |
| outra modalidade | histórico apenas (GAP-18) | `NON_RUN_WORKOUT` |

A normalização (`minutes`, `distanceKm`, `measurement`, `observedAt`) e o `sourceQuality` (OPEN-3) não dependem da fonte. Os mesmos fatos dão os mesmos bytes DEVICE, venha de onde vier (`testTheSourceNeverChangesSelectionNormalizationOrQuality`).

## 4. Deduplicação (`SameRunRule.swift`)

### Camada A: identidade exata
- O `HKWorkout.uuid` é o `activityId`. Um treino que B já conhece (na fila, entregue, excluído ou resumido) nunca entra de novo, mesmo que o HealthKit o devolva, haja reinício ou a âncora seja reiniciada (teste 4).
- Na fronteira, o mesmo `activityId` com os mesmos fatos dá `DUPLICATE` (contrato §4.1 item 5).
- **Mesmo registro, nova versão.** Mesma fonte + mesmo `HKMetadataKeySyncIdentifier` é o mesmo registro. O HealthKit substitui a versão antiga (deleção + nova UUID), o que foi confirmado no Simulator com HealthKit real.
  - Já entregue: nada é enviado (G-5); a deleção é contada e a nova versão é consolidada na entregue.
  - Nada entregue ainda: entrega-se a versão mais nova.
  - O identificador só vale dentro da mesma fonte: entre fontes diferentes, não significa nada.

### Camada B: a mesma corrida em vários registros
Regras, em ordem. São determinísticas e não dependem da fonte nem da ordem de chegada (`testDecisionsDoNotDependOnOrder`):

1. **Sem sobreposição → duas corridas; sobreposição parcial de até 60 s → também duas.** Uma pessoa não corre duas corridas ao mesmo tempo, então só a sobreposição pode fazer de dois treinos uma corrida. Mas corridas encostadas, ou dois aparelhos cujos relógios e toques de início/fim diferem por segundos, podem se sobrepor alguns segundos sem serem uma corrida (QRE-B-O1-02). A tolerância só vale para uma sobreposição que **não** atende à regra 3: cópias de uma corrida muito curta (≤ ~2 min) continuam sendo uma corrida (QRE-B-O1-11). **PROVISIONAL (OPEN-B-3):** a tolerância de 60 s é revisada por SSCTR + Engineering na integração.
2. **Sobreposição abaixo de `RecordingDedupe.sameRun` → inconclusivo.** A regra compartilhada já revisada exige sobreposição ≥ metade do mais longo.
3. **`sameRun` com fatos concordantes → mesma corrida (consolidada).** Os fatos concordam quando:
   - **duração:** diferença ≤ max(3 min, 10 % da maior). É a regra do próprio motor para dois relatos de uma execução (R7-A, `r6-provenance.mjs` `physicalAgrees`), reutilizada, não inventada;
   - **distância, quando as duas existem:** diferença ≤ 10 % da maior. **PROVISIONAL (OPEN-B-1):** o motor não tem regra de concordância de distância, então B usa a parte relativa da regra de duração. SSCTR + Engineering revisam na integração;
   - **valor ausente nunca discorda:** ausente continua ausente (DR-118).
4. **`sameRun` com fatos discordantes → inconclusivo.** Nunca se escolhe um registro com base num sinal fraco.

Não há pontuação de confiança. Cada limite tem teste no ponto exato de corte (`testPairVerdictsAtTheirBoundaries`). Título e distância sozinhos nunca decidem nada: dois treinos iguais em hora diferente são duas corridas (teste 8).

**Grupos.** Treinos ligados por qualquer par que não seja "duas corridas" formam um grupo (transitivo). O grupo só é consolidado quando **todo** par dentro dele é "mesma corrida". A corrida do grupo é escolhida assim:
- se um membro já foi enviado (congelado, em voo ou entregue), é ele, e nunca muda;
- se não, versões antigas de um registro sincronizado nunca são escolhidas; entre as demais, uma ordem total estrita: `WEARABLE_FULL` antes de `WEARABLE_PARTIAL`, depois quem tem distância, depois o início mais cedo, depois o id;
- os outros membros ficam `CONSOLIDATED_SAME_RUN`, com a própria proveniência, e nunca são enviados.

**Interação com o resto.**
- A regra é aplicada em toda gravação do arquivo de B (`commit`), sobre tudo o que B guarda: fila e entregues. Uma deleção, uma cópia nova ou uma entrega refaz as decisões.
- Um treino posto de lado como `OVERLAPS_APP_RECORDING` está no registro (o relato do atleta já conta essa corrida). Ele continua sendo a corrida do seu grupo, e as cópias são consolidadas nele, nunca promovidas e enviadas (QRE-B-O1-01 b). Os outros itens postos de lado nunca são enviados e saem dos grupos: a cópia deles é decidida por conta própria.
- A regra de gravação do app (`RecordingDedupe`) é aplicada à **corrida inteira** (se uma cópia entra ou sai do grupo enquanto o índice é consultado, a decisão é refeita: QRE-B-O1-10), isto é, à corrida do grupo e a cada cópia consolidada nela. Se qualquer cópia for a mesma corrida que uma gravação do app, essa decisão vale para o grupo (QRE-B-O1-01 a; testes 7 e `ReviewOpen1RegressionTests`). Assim, a distância medida perdida é contada uma vez por corrida, não por cópia.
- Só a corrida do grupo passa pela regra de vínculo §4.3. Uma cópia consolidada não conta como segundo candidato do dia, então a regra de vínculo continua vinculando (teste 5).

### Camada C: conflitos ambíguos
Um grupo que não pode ser consolidado fica com todos os membros abertos em `reconcile`, com um destes motivos:
- `RECONCILE_PARTIAL_OVERLAP`;
- `RECONCILE_MEASUREMENTS_DISAGREE`;
- `RECONCILE_SEVERAL_RUNS` (um treino sobrepõe duas corridas distintas).

O que acontece com esses treinos:
- os registros de origem ficam preservados;
- nenhum vai ao motor, logo não há carga duplicada;
- o motivo e o grupo (id determinístico) ficam guardados;
- continuam contados em `queued`, nunca como importados. `waitingReason = AWAITING_RECONCILIATION` quando só eles restam;
- são redecididos a cada gravação: se o atleta apagar uma das cópias no Apple Saúde, a outra segue (teste 10);
- uma cópia que discorda de uma corrida já entregue também espera, e a entregue continua contada.

A ação de reconciliar (o atleta escolher) não existe ainda. É a proposta CCP-B-07, que inclui "estas são corridas distintas" (QRE-B-O1-03). Até lá, o estado necessário está disponível, e uma corrida em reconciliação **fica fora do motor até ser apagada ou substituída no Apple Saúde**. Um caso comum é o uso de dois relógios ao mesmo tempo com tempos que diferem mais que max(3 min, 10 %). Product/UX precisa aceitar isso, e C deve explicá-lo.

**Limites conhecidos** (notas da revisão independente, QRE-B-O1-09):
- Duas cópias deslocadas no tempo (por exemplo, um app que grava o horário com o fuso errado) não se sobrepõem e contam como duas corridas. Escolha conservadora: nunca fundir sem sobreposição real.
- Uma sobreposição real de mais de 60 s entre duas corridas distintas, já com uma delas entregue, deixa a outra em reconciliação: aí a ordem de chegada importa, porque a entregue não muda.
- `reconciliationGroup` é o menor id do grupo e muda quando o grupo muda. C não deve guardá-lo como chave.
- Mesma fonte + mesmo `syncIdentifier` liga dois treinos sem olhar o horário (é o mesmo registro, por definição do HealthKit).
- A regra roda sobre o livro inteiro a cada gravação, e o livro cresce sem limite (custo linear-logarítmico; a revisar se o histórico ficar grande).
- A leitura completa da migração (com uma consulta de rota por treino) pode cair no tempo de um background delivery. Acontece uma vez, e uma falha não avança a âncora.
- A identidade entre treinos do HealthKit reutiliza `RecordingDedupe.sameRun` (regra compartilhada, PROVISIONAL). Uma mudança nela muda a regra de B.

### Reinício, crash e migração
- O índice de deduplicação é o próprio arquivo de B: fila e livro de entregues, agora com início e proveniência, na mesma escrita atômica (contrato §7). Reiniciar o app mantém as decisões (teste 12).
- Crash entre envio e confirmação: o mesmo `deliveryId` é reenviado, a fronteira credita uma vez, e a cópia continua sem ser enviada (teste 11).
- **Arquivo da política 1.** `selectionPolicy` ausente equivale a 1. Na carga:
  - as exclusões `THIRD_PARTY_SOURCE` saem e seus ids vão para `rescanIds`;
  - na leitura seguinte, além da leitura ancorada normal (que traz as deleções), uma leitura completa filtrada exatamente a esses ids os traz de volta;
  - um id apagado nesse meio tempo não volta;
  - a migração é idempotente e a releitura acontece uma vez (`testAPolicyOneFileIsMigratedAndItsThirdPartyRunsAreReadAgain`).

## 5. Proveniência e o motor

- `source.provider = HEALTHKIT` na fronteira é o **canal** (a corrida chegou pelo Apple Saúde), não o app que gravou. B não cria provider novo, que a fronteira congelada não admite, e não mascara a origem: nada diz "Apple Watch" para um treino Garmin.
- A origem fica no arquivo de B (`RunProvenance`):
  - `sourceBundleId`, `sourceName`;
  - `productType`;
  - `syncIdentifier` / `syncVersion`;
  - presença de rota.
- Para a UI, B expõe `ImportedRunOrigin`:
  - `APPLE_WATCH`, `IPHONE` ou `APPLE_OTHER`, para fonte Apple, conforme o `productType`;
  - `GARMIN` (`com.garmin.connect.mobile`) e `STRAVA` (`com.strava.stravaride`), pela tabela de exibição PROVISIONAL (OPEN-B-2), que só serve para mostrar e nunca seleciona;
  - `OTHER_APP`, para qualquer outro app, com o `sourceName`;
  - `UNKNOWN`, sem fonte.
- O motor recebe no máximo uma atividade por corrida física, e a corrida passa por todas as regras de admissão da fronteira, sem atalho.

## 6. Segurança (SEC-INT-09 a)

**O risco apontado em R1:** "a escrita de outro app vira medição `WEARABLE_FULL`". Com a política 2, um app que o atleta autorizou a escrever no Apple Saúde pode pôr no canal DEVICE uma corrida errada ou fabricada.

**O que limita esse risco:**
- **Quem pode escrever:** só apps que o próprio atleta instalou e autorizou a escrever treinos no Apple Saúde. O dado é do próprio registro do atleta, que tem o mesmo poder pelo formulário.
- **Lançamento manual:** continua fora do motor, de qualquer app (`USER_ENTERED`).
- **Qualidade:** `sourceQuality` vem dos fatos (duração, distância, rota ou indoor), nunca da marca. Um treino ao ar livre sem rota é `WEARABLE_PARTIAL`; um treino indoor com duração e distância recebe `measurement = TREADMILL` (OPEN-2) e é `WEARABLE_FULL`, venha de onde vier (QRE-B-O1-04). Numa fusão de relatos, um `WEARABLE_FULL` passa à frente do relato do atleta (`SOURCE_RANK`, `r6-provenance.mjs`), inclusive quando B o vincula à sessão de uma gravação relatada.
- **A fronteira congelada continua aplicando tudo:**
  - limites de admissão por sessão e por dia;
  - `BEFORE_RECORD_START`;
  - relógio (`futureSkewSeconds`);
  - triagem `ASK` / `SCREEN_REQUIRED`;
  - a regra de um treino por sessão;
  - nenhuma tela no caminho do aparelho.
- **Logs:** só contagens e códigos; nenhum nome de fonte, bundle, data, distância ou id (`testLogsNameNoSourceAndNoValue`, e os testes do Simulator).

**Risco residual:**
- um app que grava lançamentos manuais **sem** `HKMetadataKeyWasUserEntered` é lido como medição;
- um app pode escrever valores errados;
- B não verifica fornecedor (DR-118: a identidade da fonte é o que o HealthKit expõe, sem conexão verificada).

R1 pedia "excluir ou rebaixar" essas fontes, e a política 2 não faz nenhum dos dois: o Founder aceitou a intenção de produto, mas Security ainda não redispôs SEC-INT-09 (a) (QRE-B-O1-04). Esse risco é aceitável ou não a critério de **Security**. A política 2 está implementada, mas o fechamento de SEC-INT-09 (a) para ela é condição da integração (`FINAL_REPORT.md` §10).

## 7. Estados para a frente C (sem telas em B)

`HealthKitIngestor.importedRuns(since:) -> [ImportedRunRecord]` é adaptador local; a forma compartilhada é a CCP-B-05. `HealthIngestStatus` (compartilhado) não mudou.

| Estado pedido | Como C lê |
|---|---|
| Corrida importada do Apple Saúde | todo `ImportedRunRecord` (o canal é sempre o Apple Saúde) |
| Origem Garmin / Strava / outra / desconhecida | `origin` = `GARMIN` / `STRAVA` / `OTHER_APP` (+ `sourceName`) / `UNKNOWN`; Apple: `APPLE_WATCH`, `IPHONE`, `APPLE_OTHER` |
| Registro duplicado consolidado | `status = CONSOLIDATED_DUPLICATE`, `sameRunAs` = a corrida entregue |
| Aguardando reconciliação | `status = AWAITING_RECONCILIATION`, `statusCode` = motivo, `reconciliationGroup`; `HealthIngestStatus.waitingReason = AWAITING_RECONCILIATION` quando só eles restam |
| Importado, ainda não contabilizado | `status = AWAITING_DELIVERY` (`statusCode` = motivo NOT_RECORDED, se houver) |
| Contabilizado | `status = COUNTED` (`statusCode` = `RECORDED` / `DUPLICATE`), `sessionId` |
| Posto de lado | `status = SET_ASIDE`, `statusCode` (`BEFORE_RECORD_START`, `OVERLAPS_APP_RECORDING`, `ATTEMPTS_EXHAUSTED`, recusa da fronteira) |
| Lançamento manual | `status = NOT_FOR_ENGINE`, `statusCode = USER_ENTERED`, `distanceKm` nil, `completeness` nil |
| Dados parciais | `completeness = WEARABLE_PARTIAL`; `distanceKm` / `minutes` nil quando o HealthKit não informou; `hasRoute` só presença |

Rota, FC, ritmo e splits nunca são prometidos: o registro não tem campo de FC nem de splits, e o ritmo, se C o mostrar, só existe com `minutes` e `distanceKm` presentes.

## 8. Evidências

| Item | Resultado | Evidência |
|---|---|---|
| macOS (`swift test`) | 101/101, três execuções seguidas (63 anteriores + 38 novos: `SameRunRuleTests` 5, `ThirdPartyImportTests` 23, `ReviewOpen1RegressionTests` 7, `ReviewOpen1R2RegressionTests` 3) | `results/macos-swift-test-open1.log` |
| Simulator (HealthKit real, dados sintéticos, Simulator dedicado apagado antes) | 4/4: autorização; leitura ancorada com fonte de terceiro (o próprio lab) entregue; `importedRuns`; cópia sobreposta consolidada; versão 2 de registro sincronizado substituiu a 1 no HealthKit e não foi enviada | `results/simulator-lab-tests-open1.log` |
| iPhone (só leitura, contagens; três execuções, a terceira no build final) | as 3 corridas de terceiros antes excluídas (`THIRD_PARTY_SOURCE:3`) agora são elegíveis: `eligibleForEngine=3`, `consolidated=0`, `reconcile=0`, `provenancePreserved=3/3`, `partialData=3/3`; nada chegou ao motor; fila purgada | `results/device-open1-read.txt` |
| Permissão no iPhone | mantida (`ANSWERED`) após três atualizações in place com `devicectl device install app`; nenhuma nova autorização pedida. A perda de permissão vista antes vinha da instalação do `xcodebuild test` | idem |

**Dado do aparelho para SSCTR (OPEN-3).** As 3 corridas reais chegam sem rota no Apple Saúde (`receivedTypes` sem `ROUTE_PRESENCE`). Pela regra provisória OPEN-3, entram como `WEARABLE_PARTIAL` mesmo com duração e distância. Se o motor deve ou não tratá-las assim é decisão de SSCTR + Engineering. B não mudou a regra.
