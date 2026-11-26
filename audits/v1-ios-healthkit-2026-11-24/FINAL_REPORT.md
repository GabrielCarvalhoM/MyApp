# Frente B (HealthKit): relatório final

**Missão:** `audits/v1-abc-foundation-consolidation-2026-11-26/B_HEALTHKIT_HANDOFF.md`, contrato paralelo rev. 2. **Base:** tag `v1-abc-ready-2026-11-26` (`065178f`). **Branch:** `claude/v1-ios-healthkit`. **Modo:** sintético (`syntheticOnly`); nada chega ao CoachingCore a partir do aparelho.
**REAL_ATHLETE_READY = NO.**

## 1. Estado e commits

| Commit | Conteúdo |
|---|---|
| `67ff0dd` | `ios/Packages/HealthKitIngest`: leitura, normalização, vínculo, fila persistente, dedupe, estado, mapeamento da série de FC; 50 testes macOS (10 contra o `createIntegration` congelado via dublê Node) |
| `53f8ab9` | `ios/Labs/HealthKitLab`: host com os entitlements HealthKit; testes no Simulator (autorização, anchored query, observer, deleção, série de FC) |
| `077077a` | sondas dentro do app instalado (estado da autorização, leitura só com contagens), evidência do iPhone; testes hospedados de aparelho removidos (§5) |
| `9570837` | portões de encerramento, `CONTRACT_CHANGE_PROPOSALS.md` |
| `312cbef` | correções da revisão independente R1 (QRE-B-01..08, 10, 11, 12) com testes de regressão; 61 testes macOS |
| `4cffa10` | correção da R2 (QRE-B-R2-01, R2-02 c) com testes; 63 testes macOS; CCP-B-04; relatório final |
| (este) | **OPEN-1 política 2** (decisão do Founder de 2026-11-26): corridas de qualquer app pelo Apple Saúde, a mesma corrida contada uma vez (`SameRunRule`), proveniência e estados por corrida para C; revisões O1/O1-R2/O1-R3 corrigidas; 101 testes macOS; 4/4 no Simulator; iPhone no build final. Ver §10 |

Sem merge com outra frente ou com `main`; push sem force.

## 2. Regras de normalização (`Normalization.swift`)

| Campo | Regra | Marca |
|---|---|---|
| `activityId` | `HKWorkout.uuid.uuidString` | |
| `observedAt` | `BoundaryInstant.string(endDate, offsetSeconds:)` com o offset de `HKMetadataKeyTimeZone` no fim do treino; sem o metadado, UTC (`Z`); nunca o fuso do aparelho. Os bytes da primeira entrega ficam congelados no item e no ledger | |
| `actual.completed` | `true` | |
| `actual.minutes` | `duration / 60`, arredondado para 0,01 min (meio para longe de zero); omitido se a duração não for positiva | |
| `actual.distanceKm` | soma de `distanceWalkingRunning` do treino em metros, arredondada ao metro, `/1000`; omitida sem distância ou com soma ≤ 0 (DR-118) | |
| `actual.measurement` | indoor (`HKMetadataKeyIndoorWorkout`) → `TREADMILL`; senão, rota associada → `GPS`; senão omitido | **PROVISIONAL** (OPEN-2) |
| `actual.gpsQuality` | sempre omitido (o HealthKit não o expõe) | |
| `sourceQuality` | `WEARABLE_FULL` com duração positiva, distância positiva e uma forma de medir (rota ou indoor); senão `WEARABLE_PARTIAL`; nunca omitido (ausente a fronteira leria FULL) | **PROVISIONAL** (OPEN-3) |
| Seleção | **política 2 (§10):** `running` de **qualquer** fonte e não `WasUserEntered` vai ao canal DEVICE; corrida digitada → `USER_ENTERED` (histórico só); força → `STRENGTH_NOT_DEVICE_CHANNEL` (G-4); outros → `NON_RUN_WORKOUT`; não-corridas viram `ImportedWorkoutSummary`. A política 1 (só `com.apple.health…`, `THIRD_PARTY_SOURCE`) vale até `4cffa10`; um arquivo dela é migrado | `OPEN1_THIRD_PARTY_POLICY.md` |
| Vínculo | §4.3 exato, no offset do plano; congelado na primeira entrega; uma sessão já vinculada (em qualquer plano) não é vinculada de novo (ver CCP-B-01) | |
| Dedupe com o iPhone | `RecordingDedupe.decision` antes da primeira entrega de cada treino; `deliverLinked` só se a sessão existe e está livre, senão de lado `OVERLAPS_APP_RECORDING`; em espera é redecidido a cada leitura, sinal de A e partida; distância medida perdida e sobreposição parcial com gravação relatada (FND-ABC-06 b) são contadas | regra da fundação; revisão SSCTR + Eng. na integração |

## 3. Testes → resultado → log

| Teste (handoff original §7 + B §7) | Onde | Resultado | Log |
|---|---|---|---|
| 1 Normalização: tabela → JSON exato, determinismo com 4 fusos do aparelho, omitidos, exclusões com motivo | macOS | PASS | `results/macos-swift-test.log` (`NormalizationTests`) |
| 2 Conformidade: `observationError('DEVICE')` + `checkReportVoice('DEVICE')` congelados sobre toda saída (com e sem vínculo) | macOS + Node | PASS | idem |
| 3 Vínculo: um por sessão, dois treinos no dia, duas sessões no dia, mantido em resync e mudança de plano, dia no offset do plano | macOS | PASS | `QueueTests` |
| 4 Fila com o `createIntegration` real: RECORDED/DUPLICATE, ASK reenviado com id novo depois da triagem (e o id antigo responde NOT_RECORDED para sempre), SCREEN_REQUIRED, BEFORE_RECORD_START, UNKNOWN_SESSION, ACTIVITY_LINKED_ELSEWHERE, LIMIT_EXCEEDED(index), backfill de 100 em [32,32,32,4], resync idêntico sem versão nova, só `sourceQuality` → DUPLICATE | macOS + Node | PASS | `BoundaryQueueTests` |
| 4 (roteirizado) retryLater mesmo id com backoff 2/4 s, halted para, waiting/halted não contam, adapterBug divide e põe de lado, hostUnavailable mesmo id | macOS | PASS | `QueueTests` |
| 5 Recuperação: morte entre envio e gravação → mesmo `deliveryId`, uma linha só na fronteira; morte antes do enqueue → âncora não avança, releitura | macOS + Node | PASS | `BoundaryQueueTests`, `QueueTests` |
| 6 Deleção antes/depois da entrega; `purge` para cada motivo; `purge` com entrega em voo (resposta descartada); `setEnabled(false)` | macOS | PASS | `QueueTests` |
| 7 Teto → `ATTEMPTS_EXHAUSTED` (NOT_RECORDED e retryLater) | macOS | PASS | `QueueTests`, `ReviewRegressionTests` |
| B7.1 `status()` nunca afirma negação; `purge` esvazia resumos e itens em espera | macOS | PASS | `StatusSeriesLogTests` |
| B7.2 Dedupe: os seis casos pelo caminho da fila (vinculado, de lado, em espera e redecidido, descartado, gravação curta em corrida longa) + vinculado contado uma vez na fronteira real | macOS (+ Node) | PASS | `DedupeTests` |
| B7.3 Série: ordem, só dentro do treino, ≤ 12 000 (recusa, nunca afina), `UNKNOWN` sem metadado, Apple Watch = `OPTICAL`; o JSON é a entrada do `classifySamples` congelado | macOS + Node | PASS | `StatusSeriesLogTests` |
| B7.4 Nenhum valor de saúde em log (canário: distância, duração, datas, fuso, nome de fonte, id) + nenhum `print`/`NSLog` nas fontes | macOS | PASS | `StatusSeriesLogTests` |
| B7.5 `swift test` de `IntegrationContracts` | macOS | 10/0 | `results/integrationcontracts-swift-test.log` |
| Regressões das revisões R1 e R2 (sondas P1–P6 e N1 do revisor, ida e volta do arquivo da fila) | macOS | PASS | `ReviewRegressionTests`, `ReviewR2RegressionTests` |
| 8 Simulator: autorização (folha respondida pelo teste de UI), anchored query, observer disparado por um treino novo, deleções, background delivery registrado, série de FC de amostras sintéticas | Simulator dedicado `RepMile-B-HealthKit` (iOS 27.2) | 3/3 PASS | `results/simulator-lab-tests.log` |
| iPhone: preflight de entitlements | iPhone 17 Pro Max, trava `healthkit` | PASS: `healthkit` e `healthkit.background-delivery` concedidos pelo perfil | `results/device-preflight.txt` |
| iPhone: autorização e leitura real só com contagens | idem | PASS: folha respondida pelo Founder; leitura de 28 dias sem erro; 3 treinos lidos, os 3 corridas de fonte de terceiros (excluídas, OPEN-1); 0 Apple; 0 não-corrida | `results/device-authorization-read.txt` (política 1). **Política 2:** as mesmas 3 agora elegíveis, 0 consolidadas, 0 em reconciliação, proveniência 3/3, `results/device-open1-read.txt` |
| iPhone: aparelho bloqueado | idem | **NOT_RUN** no aparelho (o Founder dispensou o teste de travar/destravar); coberto por dublês no macOS (`testLockedQueueFileWaitsAndNeverOverwrites`, `testHealthKitLockedWaitsForProtectedData`) | — |
| §1 do contrato no fim | macOS | `npm test` 1952/1952/0 (53 históricos no ponto declarado); `CoachingPresentation` 29/0; diff vazio em CoachingCore e pacotes compartilhados | `results/coachingcore-npm-test.log`, `results/coachingpresentation-swift-test.log`, `results/closing-gates.txt` |

Suíte macOS final: **63/63**, três execuções seguidas sem falha. A evidência do iPhone é do build `077077a`. As correções da revisão foram compiladas para o aparelho (BUILD SUCCEEDED), mas o app **não** foi reinstalado: toda reinstalação de um build novo zera a resposta do HealthKit (§5), e uma nova folha exigiria o Founder de novo.

## 4. Obrigações NATIVE

| # | Estado em B |
|---|---|
| 3.1 | implementada do lado de B: só `HealthKitIngestor` chama `DeviceActivitySink.deliver`; a fila serial é de A |
| 3.2 | revista pela política 2 (§10): o lançamento manual continua fora do canal DEVICE, de qualquer app; a escrita de outro app **medida** entra (decisão do Founder; texto da obrigação: CCP-B-06; disposição de Security pendente) |
| 3.3 | implementada: B nunca envia triagem (`DeviceActivity` não tem o campo; admissão real testada) |
| 3.4 / 3.4a | implementada e provada: predicado do HealthKit desde o dia da inscrição; `BEFORE_RECORD_START` com índice → de lado, o resto reenviado (fronteira real) |
| 3.5 | implementada e provada (canário, evento de log sem campo de payload); crash reports: integração |
| 4.1 | implementada e provada (§2) |
| 4.2 | implementada e provada (fronteira real) |
| 4.3 | implementada e provada; ressalva CCP-B-01 |
| 4.4 | implementada e provada (ASK → triagem → `deliveryConditionsChanged` → id novo → gravado uma vez) |
| 4.5 | B espera o que a fronteira responder (HOLD/ASK = NOT_RECORDED, espera o sinal); o comportamento de produto é Product/UX |
| 4.6 | implementada e provada (deleções nunca enviadas; contadas, G-5) |
| 8 | pendente: semana real e background com o app fechado são da integração |

## 5. O que o iOS permitiu provar sobre background delivery e autorização

- **Background delivery:** o entitlement foi concedido e `enableBackgroundDelivery(.immediate)` respondeu sem erro no iPhone (`hki.backgroundDelivery code=REGISTERED`). Nenhum treino novo foi feito com o app em segundo plano, então nenhuma entrega em background foi observada: **BACKGROUND_DELIVERY_ON_DEVICE = NOT_OBSERVED**. O disparo do observer que aparece no log da sonda é o disparo inicial do iOS ao registrar a consulta, não uma entrega em background.
- **Reinstalação zera a autorização** (iPhone e Simulator, iOS 27): uma folha respondida seguida de uma instalação feita pelo `xcodebuild test` voltou como `NOT_YET_ASKED` / `HK_ERROR_5` (`errorAuthorizationNotDetermined`). Por isso a leitura no aparelho roda dentro do app instalado, sem reinstalar entre a resposta do Founder e a leitura. Isso vale para a integração: um teste hospedado que reinstala o app nunca prova a leitura autorizada.
- **Atualização in place mantém a autorização** (2026-11-26, política 2): `xcrun devicectl device install app` de três builds novos sobre o lab instalado leu `ANSWERED` depois de cada um, sem nova folha. A perda vem do caminho de instalação do `xcodebuild test`, não de um build novo.
- **iOS 27** acrescenta à folha uma segunda página (período do histórico compartilhado). O teste de UI do Simulator responde as duas páginas por identificadores e posição, sem depender do idioma.
- A revogação da leitura não é detectável (o iOS só devolve menos dados): B não afirma detectá-la. `disabledInApp` vem só de `setEnabled(false)`.

## 6. Propostas de mudança de contrato

`CONTRACT_CHANGE_PROPOSALS.md`: **CCP-B-01** (identidade do plano no `IngestContext`, para o vínculo depois de um restart), **CCP-B-02** (código para uma série recusada), **CCP-B-03** (`ImportedWorkoutSummary: Codable`), **CCP-B-04** (A nunca espera `DeviceQueueControl` com uma chamada de B pendente; A repete um `purge` que lançou erro). Cada uma segue com um adaptador local; nenhuma bloqueia B.

## 7. Lacunas com dono

| Lacuna | Estado em B | Dono |
|---|---|---|
| G-1 FC no canal DEVICE / GAP-17 permissão | FC não pedida no aparelho; `HeartRateSeriesSource` responde `NOT_IN_V1`; mapeamento preparado e testado só com dados sintéticos | SSCTR + Security (+ FDR para exibição) |
| G-2 `seconds`, G-3 `segments` | não enviados | Engineering + QRE / Core + SSCTR |
| G-4 força do HealthKit | nunca ao motor; resumo só com duração; contada | Product/UX |
| G-5 deleção/edição após a entrega | nada enviado; contado (`DELETED_AFTER_DELIVERY`) | Core + SSCTR |
| OPEN-1 fontes de terceiros | **RESOLVIDO pelo Founder (2026-11-26), política 2 implementada (§10).** Restam: disposição de Security de SEC-INT-09 (a); textos das autoridades (CCP-B-06) | Founder (decidido) + Security |
| OPEN-B-1 / OPEN-B-3 | concordância de distância 10 % e tolerância de 60 s da `SameRunRule`, PROVISIONAL | SSCTR + Engineering |
| Reconciliação pelo atleta | estado guardado e exposto; ação não existe (CCP-B-07); até lá, uma corrida em reconciliação fica fora do motor até mudar no Apple Saúde | Product/UX + integração |
| OPEN-2 indoor → `TREADMILL` | PROVISIONAL | SSCTR (antes da integração) |
| OPEN-3 `sourceQuality` | regra determinística PROVISIONAL (§2) | SSCTR + Engineering |
| OPEN-4 / OPEN-5 | não tocados; a semana real não foi executada | Founder |
| FND-ABC-06 | (b) contada (`PARTIAL_OVERLAP_WITH_REPORTED_APP_RECORDING`); (a) relato manual: fora do alcance de B | Core + SSCTR + B |
| GAP-14 vínculo escolhido pelo atleta | não implementado (integração com A) | integração |
| QRE-B-09 backup do arquivo da fila | o arquivo (ids, datas, durações, distâncias, nomes de fonte) fica em Application Support, que entra em backup; não alterado por B | D2 (Founder) + Security |
| Gravação em andamento no iPhone | o índice de C só cobre gravações terminadas; um treino do relógio sincronizado durante a gravação escapa da dedupe (QRE-B-16) | integração com C |

## 8. Revisão independente

| Rodada | Revisor | Veredito |
|---|---|---|
| R1 | QRE + Security, sessão própria, somente leitura, com o código e as autoridades e sem as conclusões do autor | **READY_WITH_CONDITIONS**: 0 BLOCKER, 0 HIGH, 5 MEDIUM (QRE-B-01..05, cada um provado por um teste de sonda que falhava), 6 LOW, 5 NOTE |
| R2 | mesmo revisor, recheck estreito de `312cbef` | **READY_WITH_CONDITIONS**: as sondas P1–P6 passam; QRE-B-01..08 e 12 CLOSED; B-10 e B-11 PARTIAL; 1 MEDIUM novo (QRE-B-R2-01, deadlock dos leitores em espera, introduzido pela correção de B-08), 1 LOW, 3 NOTE |

Disposição da R1: QRE-B-01..05 corrigidos com testes de regressão (as sondas P1–P6 do revisor entram em `ReviewRegressionTests`). B-06 (contagem de FND-ABC-06 b), B-07 (erro na consulta de rota falha a leitura), B-08 (conclusão do observer depois da leitura durável, sem esperar a entrega), B-10 (decodificação tolerante), B-11 (testes reforçados) e B-12 (estado morto) corrigidos. B-09: encaminhado a D2/Security (§7), não decidido por B. Disposição da R2: **QRE-B-R2-01 corrigido** (só a conclusão do observer espera uma leitura em andamento; sinais e gatilhos de A pedem mais uma leitura e voltam; a sonda N1 do revisor virou teste) e a regra foi levada ao contrato (CCP-B-04). R2-02 (c) corrigido (sem `remove()` antes da escrita atômica). R2-02 (a): o `purge` lança erro com o arquivo bloqueado e A precisa repetir (CCP-B-04). R2-02 (b): um arquivo **ilegível** volta com o interruptor desligado (`disabledInApp = true`), um desvio do item 15 ("só por `setEnabled(false)`") escolhido por privacidade: o estado do interruptor é desconhecido e nunca é ligado por padrão. Precisa de aceite de Product/UX. R2-03: depois de um despertar em background, a entrega a A roda depois do completion do HealthKit; o treino já está durável, mas pode chegar ao registro só na próxima execução (a integração envolve a entrega numa background task). B-10 (PARTIAL): `QueueState` e `QueueItem` são tolerantes; os tipos aninhados (`LedgerEntry`, `InFlight`, `StoredSummary`) seguem estritos, e um teste de ida e volta protege o decodificador manual. B-11 (PARTIAL): o laço de waiting/halted não tem NOT_RECORDED; a sequência é coberta pela regressão de B-02. R2-04 e R2-05: registrados. **A correção de R2-01 não teve uma terceira rodada de revisão**; ela restaura, nos caminhos de A, o comportamento que o revisor viu passar em `9570837`, e a sonda dele passa.

B-13 (gancho de teste interno), B-14 (`authorization` é a contabilidade de B, nunca uma negação), B-15 (depois de uma gravação de resposta que falhou, o mesmo id volta uma vez; a custódia reapresenta a resposta) e B-16: registrados, sem mudança.

## 9. Tabela final

| Critério | Resultado |
|---|---|
| FREEZE_CHECK | **PASS** pelo portão da rev. 2: `npm test` 1952/1952/0 com `v1san-runtime-integrity` e diff vazio em `CoachingCore` (o `--check` do freeze original é histórico nesta linha, contrato §1) |
| NORMALIZATION_DETERMINISTIC | **YES** |
| FROZEN_ADMISSION_ACCEPTS_OUTPUT | **YES** |
| QUEUE_DURABLE_IDEMPOTENT | **YES** (macOS, fronteira real; morte do processo, purge, falhas de escrita) |
| AUTHORIZATION_ON_DEVICE | **YES** (folha respondida pelo Founder; leitura real sem erro, só contagens) |
| BACKGROUND_DELIVERY_ON_DEVICE | **NOT_OBSERVED** (registro aceito no aparelho; nenhuma entrega em background observada) |
| INGEST_STATUS_PORT | **YES** |
| RECORDING_DEDUPE | **YES** (fila real; vinculado contado uma vez na fronteira real) |
| HR_SERIES_MAPPING (SIMULATOR) | **YES** (Simulator + `classifySamples` congelado no macOS; `NOT_IN_V1` em V1) |
| LOCKED_DEVICE_ON_DEVICE | **NOT_RUN** (dispensado pelo Founder; provado com dublês) |
| READY_FOR_INTEGRATION | **YES**, com condições levadas à integração: decidir CCP-B-01..04; OPEN-2/OPEN-3 (SSCTR); provar background delivery com o app fechado e envolver a entrega numa background task (R2-03); leitura no aparelho com o build final (a evidência é de `077077a`); teste de aparelho bloqueado no iPhone; aceite de Product/UX para R2-02 (b); QRE-B-09 (backup) com D2/Security |
| REAL_ATHLETE_READY | **NO** |

## 10. OPEN-1 política 2: corridas de outros apps pelo Apple Saúde (2026-11-26)

Decisão do Founder: a V1 importa pelo Apple Saúde as corridas de qualquer app (Garmin Connect, Strava, COROS, Polar, Apple Watch, iPhone…), sem integração direta com fabricante, e nunca conta duas vezes a mesma corrida física. Política, regras, limites e estados para C: `OPEN1_THIRD_PARTY_POLICY.md`. Propostas: CCP-B-05 (registro por corrida para C), CCP-B-06 (textos das autoridades), CCP-B-07 (ação de reconciliação).

**O que mudou em B:**
- `WorkoutNormalizer.select` não olha mais a fonte; o lançamento manual (`USER_ENTERED`) continua fora do motor, de qualquer app.
- Nova `SameRunRule`, determinística e sem pontuação:
  - **identidade exata:** UUID e `syncIdentifier` dentro da mesma fonte;
  - **mesma corrida:** sobreposição de mais de 60 s (PROVISIONAL), mais a regra compartilhada `sameRun`, mais a concordância de duração R7-A do próprio motor e de distância 10 % (PROVISIONAL);
  - **inconclusivo:** reconciliação; os registros ficam preservados e nada vai ao motor.
- A regra de gravação do app e a regra de vínculo §4.3 olham a corrida inteira, não a cópia.
- A proveniência fica no arquivo de B; `source.provider = HEALTHKIT` continua sendo o canal.
- `importedRuns(since:)` expõe a origem e o estado de cada corrida (adaptador local).
- Um arquivo da política 1 é migrado: as corridas excluídas só pela fonte são relidas uma vez, sem perder deleções.

**Nenhum arquivo compartilhado ou somente leitura foi alterado** (`results/closing-gates-open1.txt`). Teste de controle: se B mandasse as duas cópias, a fronteira congelada gravaria duas linhas. Por isso a deduplicação é de B.

| Evidência | Resultado | Log |
|---|---|---|
| macOS | 101/101, três execuções (os 14 cenários pedidos + regras nos pontos de corte + regressões da revisão) | `results/macos-swift-test-open1.log` |
| Simulator (HealthKit real, sintético) | 4/4: fonte de terceiro entregue, cópia sobreposta consolidada, versão 2 de registro sincronizado substitui a 1 sem novo envio | `results/simulator-lab-tests-open1.log` |
| iPhone (só leitura, contagens, build final) | as 3 corridas reais antes `THIRD_PARTY_SOURCE` agora elegíveis (3/3), 0 consolidadas, 0 em reconciliação, proveniência 3/3; nada ao motor; fila purgada; permissão mantida sem nova folha | `results/device-open1-read.txt` |
| Contrato §1 | `npm test` 1952/1952/0; `IntegrationContracts` 10/0; `CoachingPresentation` 29/0; diff vazio | `results/*-open1.log` |
| Revisão independente | O1 NOT_READY (2 HIGH, 2 MEDIUM) → corrigido; O1-R2 NOT_READY estreito (1 HIGH, 1 MEDIUM) → corrigido com os esboços verificados do revisor; **O1-R3 READY_WITH_CONDITIONS** (111/111 com as sondas do revisor) | `INDEPENDENT_REVIEW.md` |

**Dado do aparelho para SSCTR.** As 3 corridas reais chegam sem rota: pela regra OPEN-3 provisória são `WEARABLE_PARTIAL` (`partialData=3/3`).

| Critério (política 2) | Resultado |
|---|---|
| THIRD_PARTY_RUNS_IMPORTABLE | **YES** (macOS + fronteira real; Simulator; iPhone 3/3 elegíveis) |
| SAME_RUN_COUNTED_ONCE | **YES** (Garmin+Strava, Watch+terceiro, gravação do RepMile + cópias, crash, reinício, deleção, nova versão; fronteira real: uma linha) |
| DISTINCT_CLOSE_RUNS_KEPT | **YES** (encostadas, deriva de cópia, 1 s de sobreposição, mesmos números em outra hora) |
| AMBIGUOUS_TO_RECONCILIATION | **YES** (preservados, fora do motor, motivo e grupo guardados, nunca "importado") |
| MANUAL_ENTRY_DISTINCT | **YES** (`NOT_FOR_ENGINE`, sem distância) |
| PROVENANCE_PRESERVED | **YES** (arquivo de B; iPhone 3/3; nada nos logs) |
| READY_FOR_INTEGRATION | **YES, com condições:** Security redispor SEC-INT-09 (a) para a política 2; SSCTR + Engineering para OPEN-B-1, OPEN-B-3 e OPEN-3 (as corridas reais de terceiros são PARTIAL); integração decidir CCP-B-05..07; Product/UX aceitar "em reconciliação fica fora do motor até a ação de CCP-B-07"; as condições da §9 continuam |
| REAL_ATHLETE_READY | **NO** |
