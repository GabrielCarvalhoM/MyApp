# RepMile V1: contrato de implementação paralela (CoachingHost ∥ HealthKit)

**Missão:** consolidação do freeze e preparação para implementação paralela (Founder, 2026-11-24).
**Estado deste documento:** CONGELADO durante a execução das frentes A e B. Só a missão de integração altera este arquivo (§11).
**Não é:** um novo freeze, uma reabertura da prescrição, uma aprovação para atletas reais ou para a App Store.

## 0. Autoridade e fontes

Este contrato **não substitui** nenhum contrato existente. Ele distribui entre duas frentes o que estes documentos já definem:

| Fonte (congelada) | O que fornece |
|---|---|
| `CoachingCore/v1/FINAL_RELEASE_FREEZE_V1.json` | os 87 arquivos e o bundle `9cf3149b…` que formam o motor; verificação: `node CoachingCore/scripts/v1-final-release-freeze.mjs --check` |
| `audits/v1-integration-boundary-2026-11-23/INTEGRATION_BOUNDARY_CONTRACT.md` | operações, unidade de custódia, autoria, canais, tempo e limites |
| `audits/v1-final-physical-2026-11-24/SWIFTUI_BACKEND_HANDOFF.md` | camadas, schemas de entrada (§5), persistência (§6), views e erros (§7), tempo (§8), apagamento (§9), equivalência (§10), HealthKit (§11) |
| `audits/v1-final-physical-2026-11-24/NATIVE_OBLIGATIONS_FINAL.md` | obrigações nativas numeradas (1.1–8, N-1..N-5) |
| `CoachingCore/src/boundary/{admission,integration,api,views,store,inventory,report-voices}.mjs` | as formas reais (lidas para derivar os tipos deste contrato; nenhum byte alterado) |
| `product/PRODUCT_DECISION_REGISTER.md` DR-117..DR-123 | HealthKit inbound obrigatório na V1, somente leitura; nada falta vira zero ou default |

Em conflito, vence a fonte da tabela. Uma lacuna (algo que nenhuma fonte aprova) fica registrada em §4.4 e **não** é preenchida por suposição.

## 1. Base comum

| Item | Valor |
|---|---|
| Conteúdo validado do motor | `460a9ab` (ligado pelo registro do freeze) |
| Registro do freeze | `6482749` |
| Tip publicado da linha do freeze | `a7e2e24` = `origin/claude/v1-cc-final-physical` |
| Linha de consolidação | `claude/v1-parallel-foundation`, a partir de `a7e2e24` |
| Commit-base das frentes A e B | o commit marcado pela tag **`v1-parallel-base-2026-11-24`** (hash literal em `CONSOLIDATION_REPORT.md`) |

Verificação obrigatória no início e no fim de cada frente:

```bash
git merge-base --is-ancestor v1-parallel-base-2026-11-24 HEAD          # a base está na história
node CoachingCore/scripts/v1-final-release-freeze.mjs --check          # exit 0, 87/87
git diff --stat v1-parallel-base-2026-11-24 -- CoachingCore            # vazio
```

O verificador do freeze também falha se surgir **qualquer** arquivo novo ou modificado sob `CoachingCore/` ("nothing else changed", "no untracked file"). Por isso `CoachingCore/**` inteiro é proibido para A e B.

## 2. Arquitetura aprovada

```
                         RepMile iOS app (futuro: missão de integração + SwiftUI)
                                       │  composição: liga A e B por protocolos
                    ┌──────────────────┴───────────────────┐
                    │  IntegrationContracts (compartilhado) │  ios/Packages/IntegrationContracts
                    │  tipos DEVICE + DeviceActivitySink    │  Foundation apenas; congelado
                    │  + DeviceQueueControl                  │
                    └───────┬──────────────────────┬────────┘
             implementa Sink│                      │implementa QueueControl
        ┌───────────────────┴─────┐      ┌─────────┴──────────────────┐
        │ A · CoachingHost         │      │ B · HealthKitIngest         │
        │ fila serial única        │◄─────│ autorização, observer +     │
        │ JSContext + bundle       │deliver│ anchored queries, normaliza-│
        │ fachada JS do app        │      │ ção, vínculo, fila persis-  │
        │ CryptoKit HMAC / Keychain│─────►│ tente, retries, deleções    │
        │ store + âncora + lock    │purge /│ background delivery         │
        │ relógio confiável (D1)   │conditions                          │
        └───────────┬─────────────┘      └─────────┬──────────────────┘
                    │ store adapter                │
        CoachingCore (bundle congelado)        HealthKit (somente leitura)
        integration.mjs → custody → engine     + arquivo da fila (B)
        Persistência: arquivo por atleta + Keychain (A)
```

Regras de dependência (verificáveis por `import`):
- `IntegrationContracts` importa só `Foundation`.
- B importa `IntegrationContracts` e `HealthKit`; **nunca** `JavaScriptCore`, `CryptoKit`, `Security` ou o módulo de A.
- A importa `IntegrationContracts`, `JavaScriptCore`, `CryptoKit`, `Security`; **nunca** `HealthKit`, `SwiftUI` ou o módulo de B.
- Só a raiz de composição do app (missão de integração) importa A e B juntos.

## 3. Responsabilidades

| Tema | A · CoachingHost | B · HealthKit | Integração posterior | Founder / jurídico |
|---|---|---|---|---|
| Bundle de produção (fachada do app, link, gate de equivalência) | **dono** | — | — | — |
| JavaScriptCore, fila serial, funções de host | **dono** | — | — | — |
| CryptoKit HMAC, chave de produção, Keychain (SEC-FPV-02) | **dono** | não usa Keychain | — | — |
| Store por atleta, âncora, lock entre processos (SEC-FPV-03) | **dono** | — | prova com extensão real | — |
| Reconciliação de primeira execução (§6.1) | **dono** (ramo "sem backup") | `purge(.freshInstall)` | ramo "com backup" (D2) | D2 |
| Relógio confiável D1 (referência local) | **dono** | envia `observedAt` do HealthKit, nunca um relógio | referência de servidor | se a V1 terá servidor |
| Operações da fronteira (`api.mjs` + `importActivities`, `acknowledgeRecordLoss`) | **dono** | chama só `DeviceActivitySink.deliver` | — | — |
| Estados e erros devolvidos | **dono** (mapeia para tipos Swift) | age sobre `DeliveryResult` | telas | — |
| SEC-FPV-01 (N-3) | **dono** (sinal persistente "nova triagem exigida") | — | tela que respeita o sinal | alternativa de estado na fronteira |
| Requests tipados do canal ATHLETE + testes de schema (N-1, SEC-INT-05/12) | **dono** | — | formulários SwiftUI | — |
| Tipos do canal DEVICE (SEC-INT-12 lado device) | — | consome | — | — |
| Autorização HealthKit, observer, anchored query, background delivery | — | **dono** | prova com app fechado | — |
| Normalização, identidade estável, dedupe, vínculo a sessão | — | **dono** | — | lacunas §4.4 |
| Fila persistente, recuperação, deleções, revogação | — | **dono** | — | — |
| Logs sem payload (3.5) | **dono** no seu código | **dono** no seu código | crash reports | — |
| Telas, cópias, rascunhos do atleta | — | — | **dono** | Product/UX |
| Backend | não existe nesta fase | — | — | decisão |

## 4. Contrato entre A e B

O contrato executável é o pacote `ios/Packages/IntegrationContracts` (este commit). Seus testes conferem cada valor contra os bytes congelados de `admission.mjs`, `report-voices.mjs` e `RUN_FORMATS_V1.json`, e rodam o `observationError('DEVICE')` e o `checkReportVoice('DEVICE')` reais, via Node, sobre o JSON que o Swift codifica.

### 4.1 Os 10 pontos pedidos

| # | Pergunta | Resposta |
|---|---|---|
| 1 | Como B entrega a A | `DeviceActivitySink.deliver(DeviceDelivery) async -> DeliveryResult`. A executa `integration.importActivities({actor, clientRequestId, expectedVersion, activities})` na sua fila serial. B nunca toca JS, a custódia, o Keychain ou o store |
| 2 | Tipos, ids, metadados | `DeviceActivity {activityId = HKWorkout.uuid, activityType: RUN, sessionId?, observedAt (fim, ISO com offset), actual {completed, minutes?, distanceKm?, measurement?, gpsQuality?}, sourceQuality?}`: exatamente `OBSERVATION_KEYS.DEVICE` e handoff §5.3. `DeviceDelivery {deliveryId (UUID), activities 1…32}`. `IngestContext {recordStartDay, timezoneOffsetMinutes, runSessions[{sessionId, day}], version}` |
| 3 | Operações da fronteira usadas | só `importActivities` para B. A também usa, para avisar B: `submit` com `eligibility`, `setConsent`, `enroll`/`restart`, `eraseAccount`, `acknowledgeRecordLoss` (§4.2) |
| 4 | Autoria e proveniência | o canal é o ponto de entrada: só o código de B chega a `deliver`, e `deliver` só chega a `importActivities`. A fronteira monta `source = {provider: HEALTHKIT, activityId, quality}` e `canonicalActivityId`; B nunca envia campo `BOUNDARY_OWNED` nem fato do atleta (rpe, stop, conditions, walkBreaks, response). Só treinos gravados por aparelho entram (lacuna OPEN-1 para fontes de terceiros) |
| 5 | Duplicados, atrasados, fora de ordem | o digest dos fatos é `{sessionId, observedAt, occurrenceDate, actual}` (`integration.mjs` `factsDigest`). Mesmo `activityId` e mesmos fatos: `DUPLICATE` (sai da fila). Outros `actual`/`observedAt`: correção do próprio aparelho, ligada pela atividade. Outro `sessionId`: `ACTIVITY_LINKED_ELSEWHERE`, nunca correção. Só `sourceQuality` mudou: fora do digest, logo `DUPLICATE` (não é gravado; o ledger de B também o deixa fora do digest). Treino atrasado: aceito (testado na fronteira), dentro dos limites. Fora de ordem: B envia em ordem crescente de `endDate`, mas a fronteira não depende disso. A identidade é o `activityId`, nunca a posição |
| 6 | Erros transitórios e definitivos | `DeliveryResult` + `BoundaryDisposition.of(code:index:)` (§6). Código desconhecido = `halted` (falha fechada) |
| 7 | Quando confirmar e remover da fila | só quando `ActivityOutcome.leavesQueue` (`RECORDED` ou `DUPLICATE`) **e** depois de B gravar isso de forma durável. Nada sai da fila por `waiting`, `retryLater`, `halted`, `hostUnavailable` ou `NOT_RECORDED` |
| 8 | Cancelamento, exclusão, revogação | deleção HealthKit (`HKDeletedObject`): se o treino ainda não foi entregue, sai da fila; se já foi, nada é enviado na V1 (handoff §11) e B registra a contagem (lacuna G-5). Revogação de leitura no iOS não é detectável (o HealthKit só devolve menos dados), por isso B não promete detectá-la. Consentimento revogado na fronteira → `CONSENT_REQUIRED` → `waiting`. Apagamento de conta → A chama `purge(.accountErased)` |
| 9 | Dono de cada persistência e sua limpeza | §7 |
| 10 | O que depende do backend | referência de tempo de servidor (D1 (i)), backup/restauração (D2), apagamento de backup. Nada disso bloqueia A ou B: ambos funcionam só no aparelho |

### 4.2 Sinais de A para B (`DeviceQueueControl`)

A chama `deliveryConditionsChanged()` depois de cada sucesso de:
- `submit` (ou `api.mjs`) com `eligibility` (nova triagem, o que libera `SCREEN_REQUIRED` e os `NOT_RECORDED` de um ASK);
- `setConsent` que concede;
- `enroll` / `restart`;
- a primeira operação mutável bem-sucedida depois de um `CLOCK_BEHIND_RECORD` ou de uma recusa D1 `CLOCK_AHEAD_OF_REFERENCE` (`HostCode`);
- o host ficar disponível de novo.

A chama `purge(_:)` depois de:
- `eraseAccount` bem-sucedido (`.accountErased`);
- `acknowledgeRecordLoss` bem-sucedido (`.recordLossAcknowledged`);
- a reconciliação de primeira execução sem backup (`.freshInstall`).

A chamada a B é feita **depois** que a operação de A foi gravada. Uma falha de B não desfaz nada em A.

### 4.3 Vínculo a sessão (regra já decidida, não nova)

Origem: NATIVE §9.6, handoff §11 e SSCTR_INT_R2. Vincular no máximo um treino por sessão, e só quando o vínculo é inequívoco:
- o dia local do treino (`BoundaryInstant.day(endDate, offsetMinutes: context.timezoneOffsetMinutes)`) tem **exatamente uma** sessão RUN em `context.runSessions`;
- esse dia tem **exatamente um** treino candidato;
- nenhum treino já foi entregue vinculado àquela sessão.

Fora disso, o treino segue sem vínculo. Um treino já entregue mantém para sempre o vínculo com que foi registrado (B guarda esse vínculo). Se a fronteira responder `UNKNOWN_SESSION` ou `SPORT_MISMATCH`, o treino é reenviado sem vínculo.

### 4.4 Lacunas registradas (não preenchidas por suposição)

| ID | Lacuna | Comportamento até decisão | Dono da decisão |
|---|---|---|---|
| G-1 | `heartRate` no canal DEVICE | não enviado; não é pedida permissão de frequência cardíaca | SSCTR + Security (regra revisada que a leia) |
| G-2 | `seconds` (o motor lê; a lista aprovada §5.3 não traz) | não enviado; `minutes` decimal determinístico | Engineering + QRE (mudança revisada) |
| G-3 | `segments` / várias gravações de uma corrida | não enviado; um treino = um `DeviceActivity` | Core + SSCTR |
| G-4 | Treino de força vindo do HealthKit | **nunca** pelo canal DEVICE (`DEVICE_ACTIVITY_TYPES = ['RUN']`); B só o classifica e o exclui, com contagem | Product/UX (eventual sugestão ao atleta) |
| G-5 | Treino apagado ou editado no HealthKit depois de entregue (edição = nova UUID) | nada enviado; contado; o vínculo único por sessão impede o duplo vínculo | Core + SSCTR (C-O1-5) |
| OPEN-1 | Treinos de outros apps no Apple Health (Garmin Connect, Strava…): DR-118 admite consumi-los; o contrato revisado (SEC-INT-09) diz que "a escrita de outro app é declaração do atleta" | fora do canal DEVICE; só fontes Apple (`sourceRevision.source.bundleIdentifier` com prefixo `com.apple.health`) que não sejam `HKMetadataKeyWasUserEntered` | Founder + Security |
| OPEN-2 | Corrida indoor (`HKMetadataKeyIndoorWorkout`) → `measurement`. Omitir faz o motor ler GPS | provisório: `TREADMILL`, a medição neutra do motor (excluída de dimensionamento); marcado PROVISIONAL no relatório de B | SSCTR (antes da integração) |
| OPEN-3 | Regra de `sourceQuality` (FULL vs PARTIAL) a partir de rota, distância e duração | B define uma regra determinística e a documenta; revisão na integração | SSCTR + Engineering |
| OPEN-4 | `createIntegration({syntheticOnly = true})` por padrão: a custódia recusa um intake real (`SYNTHETIC_ONLY`) | A mantém o padrão; nenhuma frente o desliga | Founder (gate de atleta real) |
| OPEN-5 | "Semana sincronizada real" exige dados reais num registro que hoje só aceita intake sintético | não executada por A nem B | Founder, na missão de integração |

## 5. Operações da fronteira que A expõe

Exatamente a tabela do handoff §4 (`onboard`, `plan`, `sessions`, `status`, `logRun`, `logStrength`, `weeklyCheckIn`, `notFeeling100`, `wellbeingCheck`, `declareReadiness`, `reportBreak`, `updateAvailability`, `setPreferences`, `setCoach`, `accept`, `decline`, `decision`, `history`, `restart`, `setConsent`, `eraseHealthFacts`, `eraseAccount`), mais `importActivities` (via `DeviceActivitySink`) e `acknowledgeRecordLoss`.

Regras:
- Formas em §5 do handoff.
- Respostas: `{ok:true, version, …, view}` ou `{ok:false, error, state}`.
- A não cria operações novas no motor e não reinterpreta respostas: o estado e a executabilidade vêm só da `view`.
- A fachada JS do app pode juntar leituras já existentes (por exemplo, `ingestContext` a partir de `read` + `program`), sem regra esportiva.

## 6. Erros, retries e idempotência

### 6.1 Dentro de A (B não vê)

| Resposta da fronteira | A faz |
|---|---|
| `CONFLICT_STALE_VERSION` | relê a versão e reenvia com um id novo (`<deliveryId>~<n>`, no máximo 3 tentativas), depois `halted` |
| `REQUEST_ID_REUSED` | igual, com id novo |
| `BUSY` | reenvia o mesmo id após espera curta, no máximo 3 vezes, depois `retryLater` |
| `anchorStale: true` | regrava a âncora antes de responder |
| relógio > 300 s à frente da referência (D1) | não chama a fronteira; responde `waiting(code: HostCode.clockAheadOfReference)` |

Isto é seguro porque a fronteira deduplica pelo `activityId` e pelo digest dos fatos: um id novo sobre um conteúdo já gravado devolve `DUPLICATE`, nunca um crédito duplo.

### 6.2 Em B, por `DeliveryResult`

| Caso | B faz |
|---|---|
| `answered` | marca cada `RECORDED`/`DUPLICATE` como entregue (durável) e remove da fila. `NOT_RECORDED` fica e só é reenviado, numa entrega **nova**, depois de `deliveryConditionsChanged()` |
| `refused(.setAsideItem, index)` | põe o item de lado com o código (não volta a ser enviado, salvo se a amostra do HealthKit mudar) e reenvia o resto como **nova** entrega (`deliveryId` novo) |
| `refused(.resendUnlinked, index)` | reenvia o item sem vínculo junto com o resto, como nova entrega |
| `refused(.adapterBug)` | registra só o código, divide ou corrige o chunk; se repetir, põe de lado |
| `waiting` | mantém tudo e espera `deliveryConditionsChanged()` |
| `retryLater` | mesma entrega (mesmo `deliveryId`), backoff exponencial limitado |
| `halted` | mantém tudo, para de enviar e espera sinal de A |
| `hostUnavailable` | mantém tudo e tenta no próximo gatilho |

**Regra do `deliveryId` (UUID).** Ele é reutilizado **só** para repetir uma entrega cuja resposta B nunca recebeu (morte do processo, `hostUnavailable`) ou que respondeu `retryLater`. Nesses casos nada foi gravado, ou uma escrita que chegou a ser feita é reapresentada (`replayed`).

Depois de qualquer outra resposta (`answered`, `refused`, `waiting`, `halted`), o próximo envio é uma entrega nova com UUID novo, mesmo que o conteúdo seja idêntico. O motivo: a custódia grava todo request decidido, inclusive um ASK que não gravou o treino, e devolve a resposta guardada para o mesmo id (`custody.mjs`: `seen` → `replayed`). Reenviar um chunk `NOT_RECORDED` com o id antigo responderia `NOT_RECORDED` para sempre. Um id nunca é reutilizado para outro conteúdo (`CONFLICT_IDEMPOTENCY_KEY`).

**Limite de tentativas.** Contam só os reenvios de `NOT_RECORDED` feitos depois de um `deliveryConditionsChanged()`, e os `retryLater` consecutivos. `waiting` e `halted` nunca contam, porque um ASK ou um HOLD dura legitimamente até o atleta responder ou um plano reiniciado começar. Ao atingir o teto que B definir (sugestão: 8), o item vai para o lado com `ATTEMPTS_EXHAUSTED`. Nada é reenviado para sempre (handoff §11).

**Geração de `purge`.** `purge(_:)` avança primeiro um contador de geração de B. A resposta de uma entrega iniciada antes do `purge` (por exemplo, uma que estava na fila de A atrás de `eraseAccount` e voltou `GONE`) é descartada e nunca regravada (G07).

## 7. Persistência e concorrência

| Persistência | Dono | Local | Proteção | Limpeza |
|---|---|---|---|---|
| Registro selado por atleta (+ `.tmp`/`.lock`) | A | Application Support/`CoachingHost/` | `completeUntilFirstUserAuthentication` | `eraseAccount`, `acknowledgeRecordLoss`, primeira execução |
| Âncora `{version, docMac}` e chave de integridade | A | Keychain, serviço do app, `AfterFirstUnlockThisDeviceOnly` | Keychain | idem, mais a reconciliação §6.1 |
| Marcador de primeira execução | A | container do app (nunca no Keychain) | — | — |
| Sinal SEC-FPV-01 "nova triagem exigida" | A | junto do store de A | idem | ao gravar uma nova triagem |
| Fila, itens de lado, ledger de entregues (activityId → eventId, vínculo, digest) | B | Application Support/`HealthKitIngest/` | `completeUntilFirstUserAuthentication` | `purge(_:)` |
| `HKQueryAnchor` | B | idem | idem | `purge(_:)` |

Regras:
- **A e B nunca leem nem escrevem os arquivos um do outro.**
- B não usa Keychain.
- Escrita atômica (tmp + fsync + rename) nos dois.
- `observedAt` precisa ser estável em bytes, porque entra no digest dos fatos: B usa o offset de `HKMetadataKeyTimeZone` quando a amostra o tem e, sem ele, UTC (`Z`), nunca o fuso atual do aparelho. Todo reenvio usa os bytes da primeira entrega, guardados no ledger de B.
- A âncora do HealthKit só avança **depois** que os itens lidos estão gravados na fila. Se o processo morrer, as amostras são relidas, e a dedupe de B (pelo ledger) e a da fronteira (`DUPLICATE`) absorvem a repetição.
- Concorrência em A: uma fila serial, e todo acesso ao store sob um lock de kernel (`flock`/`fcntl`), que vale também entre processos (SEC-FPV-03).
- Concorrência em B: um ator Swift para a fila; uma entrega em voo por vez. O background delivery roda no processo do app, não em extensão.
- Dados protegidos: com o aparelho bloqueado antes do primeiro desbloqueio, nada é lido nem escrito. O HealthKit fica inacessível com o aparelho bloqueado; B espera `protectedDataDidBecomeAvailable`.

## 8. Mocks e testes

| Frente | Dublê do outro lado | Regra |
|---|---|---|
| A | um `DeviceQueueControl` de teste que registra as chamadas | testa que `purge` e `deliveryConditionsChanged` vêm depois do commit, e nunca antes |
| B | um `DeviceActivitySink` roteirizado, mais (recomendado, só macOS) um dublê que roda o `createIntegration` **real** congelado em Node sobre `memoryStore` e o atleta sintético de `CoachingCore/test/v1int-helpers.mjs` (leitura apenas) | os roteiros usam códigos e formas reais (§6); nenhum código inventado |

Os dois rodam o teste de conformidade do pacote compartilhado (`swift test` em `ios/Packages/IntegrationContracts`) no fim.

## 9. Recursos físicos

| Recurso | Política |
|---|---|
| iPhone conectado | exclusivo. Todo `xcodebuild … -destination 'id=<UDID>'`, `devicectl` de instalação ou execução, e teste físico passa por `tools/device-lock/with-device.sh <coachinghost\|healthkit\|integration> [--wait] -- <comando>`. Exit 75 = em uso por outra sessão. A trava é um `flock` de kernel, da máquina (`~/Library/Caches/repmile/device.lock/`), sobre um descritor que o **próprio comando** herda (o wrapper faz `exec` no comando). Ela vive exatamente enquanto o comando e seus filhos vivem; a morte de qualquer processo pai não a libera, e o kernel a solta quando o comando termina ou morre. Não há trava órfã a retomar. O arquivo `owner` é só informativo (`status`). Testado em 9 cenários: `results/device-lock-test.txt` |
| Build directory | cada frente usa só a sua worktree, mais `-derivedDataPath <worktree>/ios/.build/DerivedData-<A\|B>` em todo `xcodebuild`. O `.build` do SwiftPM fica dentro de cada pacote, na própria worktree. Nada é escrito no DerivedData padrão compartilhado |
| Bundle ids | A: `fit.vilumo.repmile.lab.coachinghost.$(DEVELOPMENT_TEAM)` (testes: `.tests`). B: `fit.vilumo.repmile.lab.healthkit.$(DEVELOPMENT_TEAM)`. Diferentes do harness `fit.vilumo.p0.devicehost.*`, que nenhuma frente reinstala ou remove |
| Keychain | separado pelo bundle id. A usa o serviço `fit.vilumo.repmile.lab.coachinghost`; B não usa Keychain. Nenhuma frente apaga itens de outro serviço |
| Permissões HealthKit | só o app de B pede. A nunca pede |
| Dados do Health no iPhone | são dados reais do Founder. B **não** escreve amostras sintéticas no Health do iPhone sem autorização explícita do Founder; dados sintéticos ficam no Simulator. No aparelho, B lê dados reais autorizados só para validar a leitura, sem enviá-los a CoachingCore (a custódia é `syntheticOnly`), sem logar valores (só contagens e tipos) e sem copiá-los para o repositório |
| `DEVELOPMENT_TEAM` | só na linha de comando, nunca no `project.pbxproj` (como no harness) |

## 10. Matriz de ownership de arquivos

| Caminho | A | B | Integração |
|---|---|---|---|
| `ios/Packages/CoachingHost/**` (Swift, fachada JS, cópia do linker, bundle gerado, fixtures copiadas) | **escreve** | proibido | — |
| `ios/Labs/CoachingHostLab/**` (app host + testes no aparelho) | **escreve** | proibido | — |
| `audits/v1-ios-coachinghost-2026-11-24/**` (relatório, evidência) | **escreve** | proibido | — |
| `ios/Packages/HealthKitIngest/**` | proibido | **escreve** | — |
| `ios/Labs/HealthKitLab/**` | proibido | **escreve** | — |
| `audits/v1-ios-healthkit-2026-11-24/**` | proibido | **escreve** | — |
| `ios/Packages/IntegrationContracts/**`, `tools/device-lock/**`, `audits/v1-parallel-foundation-2026-11-24/**` | leitura (congelado) | leitura (congelado) | **escreve** |
| `CoachingCore/**` | proibido | proibido | só pela regra de exceção pós-freeze |
| `audits/v1-aif-p0-jsc-2026-11-17/**`, `audits/v1-final-physical-2026-11-24/**`, `audits/v1-integration-boundary-2026-11-23/**` e demais `audits/` existentes | leitura | leitura | leitura |
| `MISSION_LEDGER.md`, `CURRENT_MISSION.md`, `CLAUDE.md`, `AGENTS.md`, `.gitignore`, `canon/**`, `product/**`, `governance/**` | proibido | proibido | **escreve** |
| `ios/App/**`, `ios/*.xcworkspace`, qualquer alvo que importe A e B juntos, telas SwiftUI | proibido | proibido | **escreve** |

Um arquivo fora desta matriz: a frente só o cria se estiver dentro dos seus diretórios.

## 11. Mudança de contrato compartilhado

Uma frente que precise mudar `IntegrationContracts`, este documento ou a trava do aparelho:
1. não edita;
2. escreve a proposta em `audits/<sua-pasta>/CONTRACT_CHANGE_PROPOSALS.md`, com motivo, diff proposto e impacto na outra frente;
3. segue com um adaptador local no próprio módulo, quando possível, sem mudar a interface consumida pela outra frente;
4. a missão de integração decide.

Nenhuma sessão faz merge da outra.

## 12. Pendências: quem responde por cada uma

| Pendência | A | B | Integração | Founder / jurídico | Estado ao fim de A+B |
|---|---|---|---|---|---|
| **SEC-FPV-01** | implementa N-3: sinal persistente depois de qualquer `eraseHealthFacts`; `isStartable(session)` = `executable && !sinal`; o sinal só cai com uma nova triagem gravada | — | a tela respeita | ou prefere um estado de fronteira revisado | aberto até a tela |
| **SEC-FPV-02** | N-4: chave aleatória de 256 bits do host, `keyRef` opaco numa allowlist, `SecItemAdd`/`SecItemUpdate`, nunca logada, nenhuma chave de fixture em produção | — | — | — | fechável por A + revisão Security |
| **SEC-FPV-03** | N-5: `flock`/`fcntl` entre processos com teste de dois processos (macOS) e âncora por `SecItemUpdate`, nunca apagar antes de adicionar (o `Keychain.set` do harness apaga antes: **não copiar**) | — | prova com extensão real (App Groups) | — | parcial até a integração |
| **G07** | remoção nativa em `eraseAccount` (6.3); nenhuma mudança de retenção | `purge(.accountErased)` | backups (D2) | **decide** a retenção dos fatos de parada | aberto (Founder + jurídico) |
| **D1** | referência local (`lastAt` + tempo monotônico desde a escrita, na mesma sessão de boot), recusa a mais de 300 s antes da custódia | `observedAt` = fim do treino, nunca relógio próprio | referência de servidor | se haverá servidor | parcial (sem backend) |
| **D2** | ramo "sem backup" da reconciliação §6.1 | `purge(.freshInstall)` | restauração | **decide** | aberto |
| **D3** | pacote com piso iOS 16 (piso do bundle) | idem | — | **decide** o mínimo | aberto |
| **SEC-INT-05/12** | requests tipados fechados do canal ATHLETE e testes de que a admissão aceita cada forma | tipos DEVICE já fechados aqui (testados) | formulários usam só os tipos de A | — | fechável nos testes; a recusa de chaves desconhecidas pela fronteira é mudança revisada posterior |
| **SSCTR-BC-01** | caminho `weeklyCheckIn({reports, eligibility})` que reenvia, na mesma requisição da triagem, o formulário não gravado; teste | `NOT_RECORDED` do device espera e segue com a próxima triagem | rascunhos e tela | — | aberto até a tela + SSCTR |
| **R7-B0** (validade até 2027-04-30) | expõe o estado de expiração das views; nunca mostra sessão fora delas (7.6) | — | aviso | **renova** antes de 2027-04-30 | aberto, com data |
| **HealthKit** real, background, semana sincronizada | — | autorização, leitura, observer + background delivery no aparelho (o que o iOS permitir provar) | app fechado + semana real (OPEN-5) | OPEN-1, OPEN-5 | parcial |
| Logs sem payload (3.5) | `telemetryOf` apenas, `os_log` privado | contagens e códigos apenas | crash reports | — | parcial |
| C-BC-3 / SSCTR-BC-05 (texto) | — | — | Product/UX + SSCTR | — | aberto |
| OPEN-1..5, G-1..G-5 | — | — | — | §4.4 | abertos |

Nenhuma frente declara fechada uma pendência que dependa de outra coluna.

## 13. Integração posterior

Missão própria, depois de A e B entregues:
1. Confirmar que `claude/v1-ios-coachinghost` e `claude/v1-ios-healthkit` contêm a base e não tocam arquivos fora da sua coluna: `git diff --name-only v1-parallel-base-2026-11-24..<branch>` contra a §10.
2. Fazer merge das duas numa branch de integração nova (nunca em `main` sem autorização): a matriz garante zero conflitos de arquivo.
3. Decidir as `CONTRACT_CHANGE_PROPOSALS.md`.
4. Criar a raiz de composição (`ios/App`) que liga `CoachingHost` como `DeviceActivitySink` e `HealthKitIngest` como `DeviceQueueControl`.
5. No aparelho (`with-device.sh integration`): fim a fim do HealthKit ao registro, background delivery com o app fechado, extensão + lock entre processos, reconciliação de reinstalação, equivalência do bundle.
6. Levar a semana sincronizada real e as lacunas OPEN ao Founder.
7. Rodar `--check` do freeze: 87/87.

## 14. Critérios de aceite independentes (resumo; detalhe nos handoffs)

**A está pronto para integração quando:**
- o bundle de produção passa as três regras do handoff §2 (manifesto = shas do freeze, export gate com 0 divergências, `core`/`int`/`final` com 0 DIVERGED no aparelho);
- N-4 e N-5 estão implementados e testados;
- D1 (referência local), N-3 e a reconciliação §6.1 estão implementados e testados;
- todas as operações da §5 estão expostas com mapeamento de estado e erro;
- `DeviceActivitySink` está implementado e testado contra a fronteira real;
- `--check` dá exit 0.

**B está pronto para integração quando:**
- autorização, observer + anchored query e background delivery estão registrados e provados até onde o iOS permite;
- normalização e vínculo determinísticos estão testados;
- a fila sobrevive à morte do processo, sem perda e sem envio duplicado que vire crédito;
- §6.2 está testado com códigos reais (o dublê Node recomendado);
- deleções e `purge` estão testados;
- a leitura no aparelho foi validada sem payload em logs;
- `--check` dá exit 0.

Nenhum dos dois implementa telas, backend ou regra esportiva.
