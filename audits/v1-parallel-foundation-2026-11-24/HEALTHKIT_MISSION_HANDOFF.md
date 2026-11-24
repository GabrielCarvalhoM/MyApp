# Handoff da missão B: HealthKit Integration (coleta, normalização, fila e entrega ao CoachingHost)

## 1. Objetivo

Construir o `HealthKitIngest`. Ele:
- obtém autorização de leitura;
- observa e lê treinos do HealthKit;
- normaliza corridas no formato DEVICE que a fronteira congelada admite;
- vincula um treino a uma sessão só quando o vínculo é inequívoco;
- mantém uma fila persistente, idempotente e recuperável;
- trata deleções e revogação;
- entrega tudo por `DeviceActivitySink.deliver`.

**B não decide treino, não toca CoachingCore e não implementa o CoachingHost.**

## 2. Onde trabalhar

| Item | Valor |
|---|---|
| Branch | `claude/v1-ios-healthkit` |
| Worktree | `/Users/gabrieldecarvalhomaciel/.codex/worktrees/myapp-v1-ios-healthkit/MyApp` |
| Commit-base | tag `v1-parallel-base-2026-11-24` (hash em `CONSOLIDATION_REPORT.md`), comum com a frente A |
| Sessão para a trava do aparelho | `healthkit` |

Primeiro passo, obrigatório:

```bash
cd /Users/gabrieldecarvalhomaciel/.codex/worktrees/myapp-v1-ios-healthkit/MyApp
git status --short                                                     # vazio
git merge-base --is-ancestor v1-parallel-base-2026-11-24 HEAD && echo BASE_OK
node CoachingCore/scripts/v1-final-release-freeze.mjs --check          # exit 0, 87/87
(cd ios/Packages/IntegrationContracts && swift test)                   # 7 testes, 0 falhas
```

## 3. Leitura obrigatória (nesta ordem)

1. `audits/v1-parallel-foundation-2026-11-24/PARALLEL_IMPLEMENTATION_CONTRACT.md`, inteiro. Sobretudo §4 (o contrato A↔B, o vínculo e as lacunas G-1..G-5, OPEN-1..3), §6.2, §7 e §9 (dados reais do Founder no iPhone).
2. `ios/Packages/IntegrationContracts/Sources/**`: os tipos que você produz (`DeviceActivity`, `DeviceDelivery`), a interface que chama (`DeviceActivitySink`) e a que implementa (`DeviceQueueControl`).
3. `audits/v1-final-physical-2026-11-24/SWIFTUI_BACKEND_HANDOFF.md`: §5.3, §5.5, §7 (tabela de erros) e §11.
4. `audits/v1-integration-boundary-2026-11-23/INTEGRATION_BOUNDARY_CONTRACT.md`: §2 (`activities`), §4 (autoria, `activityId` de novo), §5 (tempo) e §9.6 / §9.9 (fila).
5. `audits/v1-final-physical-2026-11-24/NATIVE_OBLIGATIONS_FINAL.md`: 3.1–3.5, 4.1–4.6 e 8.
6. `product/PRODUCT_DECISION_REGISTER.md` DR-117 a DR-123 (HealthKit inbound obrigatório; somente leitura; o que falta continua faltando; nenhum fornecedor direto).
7. Só leitura, para o dublê Node: `CoachingCore/src/boundary/{integration,admission}.mjs` e `CoachingCore/test/v1int-helpers.mjs`.

**Fora do escopo de autoridade:** a branch remota `chore/v1-healthkit-workoutkit-evidence` não está na base. Não a consuma como autoridade sem decisão do Founder.

## 4. Responsabilidades exclusivas

1. **Autorização:**
   - leitura de `HKObjectType.workoutType()`, `HKQuantityType(.distanceWalkingRunning)` e `HKSeriesType.workoutRoute()` (presença de rota, OPEN-3);
   - **não** pedir frequência cardíaca (G-1);
   - **não** pedir escrita (DR-121: write-back é decisão aberta);
   - textos de uso (`NSHealthShareUsageDescription`) só no lab, marcados como provisórios.
2. **Leitura:**
   - `HKObserverQuery` + `HKAnchoredObjectQuery` sobre treinos;
   - predicado a partir de `recordStartDay` do `IngestContext` (âncora começa no dia da inscrição);
   - `enableBackgroundDelivery(for: workoutType, frequency: .immediate)` com o entitlement `com.apple.developer.healthkit.background-delivery`;
   - observer registrado no launch e `completionHandler` sempre chamado.
3. **Seleção:**
   - `HKWorkoutActivityType.running` vai para o canal DEVICE;
   - força (`traditionalStrengthTraining`, `functionalStrengthTraining`) é classificada e excluída, com contagem (G-4);
   - excluídos: `HKMetadataKeyWasUserEntered == true` e fontes que não sejam Apple (OPEN-1), com contagem por motivo.
4. **Normalização** (determinística; a mesma amostra dá sempre os mesmos bytes):
   - `activityId = workout.uuid.uuidString`;
   - `observedAt = BoundaryInstant.string(endDate, offsetSeconds:)` com o offset de `HKMetadataKeyTimeZone` quando a amostra o tem, senão `0` (UTC, `Z`), **nunca** o fuso atual do aparelho (`observedAt` entra no digest dos fatos; um fuso que muda faria do mesmo treino uma "correção"); todo reenvio usa os bytes da primeira entrega, guardados no ledger;
   - `actual.completed = true`;
   - `minutes` = duração / 60, arredondada de forma fixa e documentada;
   - `distanceKm` = distância total em km, arredondada de forma fixa e documentada, e só se o HealthKit a tiver;
   - `measurement`: GPS quando há rota; indoor → `TREADMILL` provisório (OPEN-2); sem informação → omitido;
   - `gpsQuality` omitido (o HealthKit não o expõe);
   - `sourceQuality` pela regra determinística que você documentar (OPEN-3);
   - nada que falte vira 0 ou default (DR-118).
5. **Vínculo:** a regra do contrato §4.3, com o `IngestContext` de A. Guarde o vínculo usado na primeira entrega e reuse-o sempre.
6. **Fila persistente** (contrato §7):
   - ator Swift; arquivo em Application Support/`HealthKitIngest/` com `completeUntilFirstUserAuthentication`, escrita atômica;
   - estados: pendente, em voo (`deliveryId`), esperando (código), de lado (código), entregue (eventId ou duplicate, vínculo, digest);
   - a âncora do HealthKit só avança depois do enqueue durável;
   - chunks de no máximo 32, em ordem de `endDate`;
   - uma entrega em voo por vez.
7. **Respostas:** a tabela do contrato §6.2, inteira, com as três regras dela:
   - `deliveryId` reutilizado **só** depois de morte do processo, `hostUnavailable` ou `retryLater`; depois de qualquer outra resposta, UUID novo, mesmo com conteúdo idêntico (a custódia reapresenta a resposta guardada de um ASK para o mesmo id);
   - `NOT_RECORDED` só é reenviado depois de `deliveryConditionsChanged()`, e só esses reenvios (mais os `retryLater` seguidos) contam para o teto; ao atingi-lo, `ATTEMPTS_EXHAUSTED`;
   - `waiting` e `halted` nunca contam.
8. **Recuperação:** depois da morte do processo, os itens "em voo" voltam a pendentes com o mesmo `deliveryId`, desde que o conteúdo seja o mesmo; nada se perde e nada vira crédito duplo (a fronteira responde `DUPLICATE`).
9. **Deleções:** `HKDeletedObject` de um item ainda não entregue o remove da fila; de um item já entregue, nada é enviado e B só conta (G-5).
10. **Revogação:** o iOS não informa a revogação de leitura. B documenta isso e não afirma detectá-la. Ofereça `setEnabled(false)` na API pública de B: para os observers e desliga o background delivery. A limpeza dos dados é `purge`.
11. **`DeviceQueueControl`:**
    - `deliveryConditionsChanged()` relê o contexto e tenta o que espera;
    - `purge(_:)` avança primeiro a geração de purge (a resposta de uma entrega iniciada antes é descartada, nunca regravada: G07) e remove fila, itens de lado, ledger e âncoras do HealthKit de forma durável, nunca os dados do Health.
12. **Dados protegidos:** `errorDatabaseInaccessible` e aparelho bloqueado → espera `protectedDataDidBecomeAvailable`, sem perda.
13. **Estado para a futura UI:** contagens por estado da fila (base do `NOT_SYNCED`, que é do app) na API pública de B, sem payload.
14. **Logs:** só contagens, códigos e ids opacos; nunca distância, duração, datas de treino ou nome de fonte em log.

## 5. Interfaces

| Direção | Interface |
|---|---|
| Entra | HealthKit; `IngestContextResult` e `DeliveryResult` de A; `deliveryConditionsChanged()` / `purge(_:)` de A |
| Sai | `DeviceDelivery` por `DeviceActivitySink.deliver`; contagens de estado para a UI futura |

B nunca importa o módulo de A, `JavaScriptCore`, `CryptoKit` nem `Security`.

## 6. Diretórios

**Permitidos (escrita):**
- `ios/Packages/HealthKitIngest/**`;
- `ios/Labs/HealthKitLab/**` (app host mínimo com o entitlement HealthKit + background delivery, bundle id `fit.vilumo.repmile.lab.healthkit.$(DEVELOPMENT_TEAM)`, cena vazia como no harness, sem tela de produto);
- `audits/v1-ios-healthkit-2026-11-24/**`.

**Proibidos:**
- `CoachingCore/**` (o verificador do freeze falha com qualquer arquivo novo ali);
- `ios/Packages/IntegrationContracts/**`, `tools/device-lock/**`, `audits/v1-parallel-foundation-2026-11-24/**` (congelados);
- `ios/Packages/CoachingHost/**`, `ios/Labs/CoachingHostLab/**`, `audits/v1-ios-coachinghost-2026-11-24/**` (da frente A);
- todo `audits/` existente;
- `MISSION_LEDGER.md`, `CURRENT_MISSION.md`, `CLAUDE.md`, `AGENTS.md`, `.gitignore`, `canon/**`, `product/**`, `governance/**`;
- `ios/App/**`, qualquer `*.xcworkspace` que junte A e B;
- `import JavaScriptCore`, `CryptoKit`, `Security`, `SwiftUI` (exceto o `App` vazio do lab).

## 7. Testes obrigatórios

**macOS / Simulator (sem o aparelho):**
1. Normalização: tabela de amostras sintéticas (`HKWorkout` construído em teste, ou um protocolo de leitura com dublê) → JSON exato; determinismo (duas execuções = mesmos bytes); campos ausentes omitidos; indoor, força, digitado e de terceiros excluídos com o motivo certo.
2. Conformidade: todo `DeviceActivity` produzido passa pelo `observationError('DEVICE')` e pelo `checkReportVoice('DEVICE')` reais (o padrão de `ContractConformanceTests.testFrozenAdmissionAcceptsSwiftEncoding`).
3. Vínculo: um treino por sessão; dois treinos no dia → sem vínculo; duas sessões RUN no dia → sem vínculo; vínculo mantido em resync; dia lido no offset do plano, não do aparelho.
4. Fila com o dublê Node recomendado (o `createIntegration` real sobre `memoryStore` + atleta sintético, só macOS) e com o dublê roteirizado:
   - RECORDED e DUPLICATE saem da fila;
   - NOT_RECORDED (ASK) espera e é entregue depois de uma triagem;
   - SCREEN_REQUIRED espera;
   - BEFORE_RECORD_START põe de lado e reenvia o resto;
   - UNKNOWN_SESSION reenvia sem vínculo;
   - ACTIVITY_LINKED_ELSEWHERE põe de lado;
   - LIMIT_EXCEEDED (index) põe de lado;
   - retryLater com o mesmo id; halted para;
   - backfill de 100 treinos em chunks de até 32;
   - re-sync idêntico não gera nova versão;
   - **um chunk só de ASK (`NOT_RECORDED_BY_THIS_DECISION`), reenviado depois de uma triagem, é gravado** (prova da regra do `deliveryId` novo; com o id antigo ele ficaria `replayed` para sempre);
   - uma mudança só de `sourceQuality` dá `DUPLICATE`; outro `sessionId` para um treino já entregue dá `ACTIVITY_LINKED_ELSEWHERE` e vai para o lado;
   - `observedAt` idêntico em bytes depois de uma mudança de fuso do aparelho.
5. Recuperação: morte simulada entre o envio e a gravação do resultado → reenvio com o mesmo `deliveryId`, sem perda e sem crédito duplo (dublê Node); morte antes do enqueue → a âncora não avançou e a amostra é relida.
6. Deleção antes e depois da entrega; `purge` para cada `QueuePurgeReason`; `purge` durante uma entrega em voo (a resposta que chega depois é descartada e nada volta para a fila); `setEnabled(false)`.
7. Teto de tentativas → `ATTEMPTS_EXHAUSTED`.
8. Simulator: autorização, anchored query e observer com amostras sintéticas escritas **só no Simulator**.

**iPhone** (sempre por `tools/device-lock/with-device.sh healthkit -- …`, com `-derivedDataPath <worktree>/ios/.build/DerivedData-B`):
- preflight: o time de assinatura permite o entitlement HealthKit e o de background delivery? Se não, registre como bloqueio e continue no Simulator;
- autorização e leitura de treinos reais autorizados pelo Founder: só contagens por tipo e motivo de exclusão no log, nenhum valor, nada enviado a CoachingCore (o lab usa o dublê roteirizado);
- background delivery: registre o que for observável (o observer disparado com o app em segundo plano depois de um treino novo, se o Founder fizer um). Sem esse evento, `BACKGROUND_DELIVERY_ON_DEVICE = NOT_OBSERVED`, nunca "validado";
- aparelho bloqueado: a fila espera e retoma depois do desbloqueio.
- Escrita de amostras sintéticas no Health do iPhone: **proibida** sem autorização explícita do Founder.

## 8. Critérios objetivos de conclusão

Todos verdadeiros:
- os testes da §7 passam (logs em `audits/v1-ios-healthkit-2026-11-24/results/`), ou têm bloqueio físico registrado com o motivo;
- `node CoachingCore/scripts/v1-final-release-freeze.mjs --check` dá exit 0;
- `git diff --name-only v1-parallel-base-2026-11-24..HEAD` lista só caminhos permitidos (§6);
- `grep -rE '^import (JavaScriptCore|CryptoKit|Security|SwiftUI)' ios/Packages/HealthKitIngest` vazio;
- nenhum payload em logs (teste com canário);
- relatório final escrito (§10).

## 9. Bloqueios que permanecem explícitos

Background delivery com o app fechado e semana sincronizada real (integração; OPEN-5), OPEN-1 (fontes de terceiros), OPEN-2 (indoor → measurement, SSCTR), OPEN-3 (`sourceQuality`), G-1..G-5, HealthKit write-back (DR-121, decisão aberta) e logs de crash.

**REAL_ATHLETE_READY = NO.**

## 10. Relatório final

Arquivo: `audits/v1-ios-healthkit-2026-11-24/FINAL_REPORT.md`, com:
1. Estado e commits.
2. Regras de normalização (arredondamentos, fuso, measurement, sourceQuality), com a marca PROVISIONAL onde couber.
3. Tabela teste → resultado → log (macOS, Simulator, iPhone).
4. Obrigações NATIVE 3.x / 4.x / 8: implementada, provada, pendente.
5. O que o iOS permitiu provar sobre background delivery, sem extrapolar.
6. Propostas de mudança de contrato (ou "nenhuma").
7. Lacunas OPEN/G com o dono.
8. Tabela final:

| Critério | Resultado |
|---|---|
| FREEZE_CHECK | PASS/FAIL |
| NORMALIZATION_DETERMINISTIC | YES/NO |
| FROZEN_ADMISSION_ACCEPTS_OUTPUT | YES/NO |
| QUEUE_DURABLE_IDEMPOTENT | YES/NO |
| AUTHORIZATION_ON_DEVICE | YES/NO/BLOCKED |
| BACKGROUND_DELIVERY_ON_DEVICE | OBSERVED/NOT_OBSERVED/BLOCKED |
| READY_FOR_INTEGRATION | YES/NO |

## 11. Entrega para a integração

- Commits só na sua branch, com push da sua branch (sem force).
- Sem merge com `claude/v1-ios-coachinghost`, `main` ou qualquer outra.
- Comunicação com A só pelo contrato; dúvida vira proposta (contrato §11), sem perguntar à outra sessão como implementar.
- Ao terminar, libere o aparelho e deixe a worktree limpa.
