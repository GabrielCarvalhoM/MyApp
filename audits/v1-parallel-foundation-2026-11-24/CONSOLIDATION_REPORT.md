# RepMile V1: consolidação do freeze e preparação para implementação paralela (2026-11-24)

**Estado: CONCLUÍDA. `PARALLEL_EXECUTION_READY = YES`.** As frentes A (CoachingHost) e B (HealthKit) podem começar a partir do mesmo commit, com contrato, ownership e política do aparelho definidos. Nenhuma das duas foi iniciada.

## 1. Final Release Freeze

| Verificação | Resultado |
|---|---|
| `node CoachingCore/scripts/v1-final-release-freeze.mjs --check` | exit 0, 87/87 arquivos, bundle `9cf3149b83540685` como registrado, duas emendas declaradas |
| Onde rodou | na worktree do freeze, na de fundação (`results/freeze-check-foundation.txt`) e nas duas worktrees novas |
| Registro | `CoachingCore/v1/FINAL_RELEASE_FREEZE_V1.json` (commit `6482749`, binda `460a9ab`), intocado. Nenhum novo freeze |
| `CoachingCore/` entre `460a9ab` e a base | só o próprio registro (`6482749`). Esta missão não alterou nenhum byte de `CoachingCore/` |
| Branch do freeze | `claude/v1-cc-final-physical` em `a7e2e24`, worktree `.codex/worktrees/myapp-v1-final` limpa, histórico não reescrito |

## 2. Estado Git auditado

**Remote:** `origin` = `github.com/GabrielCarvalhoM/MyApp`.

**Worktrees encontradas:**
- o checkout principal em `r7/decision-authority-closure-base` (`ffc1136`, limpo);
- `myapp-p0-ios` em `claude/v1-aif-p0-jsc` (`16577b6`, limpo; a sessão que executou esta missão);
- `myapp-v1-final` em `claude/v1-cc-final-physical` (`a7e2e24`, limpo).

**Antes da missão:** `claude/v1-cc-final-physical` **não existia no remoto**, estava 5 commits à frente (fast-forward) de `origin/claude/v1-cc-blocker-closure` (`8ff74bb`), e o upstream local apontava, por engano, para essa branch de blocker-closure. Corrigido com `push -u` para o nome próprio.

**Sem colisões:** nenhuma das branches ou diretórios novos existia antes.

**Trabalho simultâneo observado:** havia um app Codex em execução na máquina. Nenhuma worktree estava suja e nenhum arquivo foi alterado por terceiros durante a missão.

**Fora da base:** `origin/chore/v1-healthkit-workoutkit-evidence` (`993b258`) não é ancestral da base. Ficou registrado no handoff B como fora da autoridade, salvo decisão do Founder.

**Branch principal:** `main` / `r7/decision-authority-closure-base` em `ffc1136` local e remoto, intocada. Nenhum merge.

## 3. Publicado (sem force, sem reescrita)

| Ref | Commit |
|---|---|
| `origin/claude/v1-cc-final-physical` | `a7e2e24122dfce256f64b1da98098ab4dfccb695` (o freeze; o registro `6482749` e o conteúdo `460a9ab` estão na história) |
| `origin/claude/v1-parallel-foundation` | `8d2a7c0` na publicação; este relatório vem no commit seguinte da mesma branch |
| tag `v1-parallel-base-2026-11-24` (anotada) | → `8d2a7c0fa7babcfc26c9fb9b2268df6057770e00` |
| `origin/claude/v1-ios-coachinghost` | `8d2a7c0fa7babcfc26c9fb9b2268df6057770e00` |
| `origin/claude/v1-ios-healthkit` | `8d2a7c0fa7babcfc26c9fb9b2268df6057770e00` |

**Commit-base das duas sessões:** `8d2a7c0fa7babcfc26c9fb9b2268df6057770e00`.

## 4. Worktrees

| Frente | Caminho absoluto | Branch |
|---|---|---|
| A | `/Users/gabrieldecarvalhomaciel/.codex/worktrees/myapp-v1-ios-coachinghost/MyApp` | `claude/v1-ios-coachinghost` |
| B | `/Users/gabrieldecarvalhomaciel/.codex/worktrees/myapp-v1-ios-healthkit/MyApp` | `claude/v1-ios-healthkit` |
| Fundação (integração posterior) | `/Users/gabrieldecarvalhomaciel/.codex/worktrees/myapp-v1-foundation/MyApp` | `claude/v1-parallel-foundation` |

Em cada worktree de A e B, verificado depois da criação: `HEAD = 8d2a7c0`, sem mudanças, `BASE_OK`, `--check` com exit 0, `IntegrationContracts` com 7/7 testes. Os diretórios de build (`.build`, `DerivedData-A|B`) são por worktree e ignorados pelo Git.

## 5. Testes

| Teste | Resultado | Evidência |
|---|---|---|
| Verificador do freeze | exit 0, 87/87 | `results/freeze-check-foundation.txt` |
| `swift test` de `IntegrationContracts` (macOS, Swift 6.4.2) | 7 testes, 0 falhas, inclusive o que roda o `observationError('DEVICE')` e o `checkReportVoice('DEVICE')` **congelados** em Node sobre o JSON codificado em Swift, e prova que eles recusam um campo de formulário | `results/swift-test-integration-contracts-macos.txt` |
| Build iOS genérico do pacote | BUILD SUCCEEDED; importa só `Foundation` | `results/ios-generic-build-integration-contracts.txt` |
| Trava do aparelho | 9 cenários: exclusão (75), liberação, exit code repassado, `--wait`, morte do pai com o comando vivo (trava mantida), morte do comando (liberada pelo kernel), duas esperas concorrentes (uma de cada vez), sessão inválida (64), comando inexistente (127) | `results/device-lock-test.txt` |

Nenhum teste no iPhone foi feito nesta missão (nada a provar no aparelho; ele ficou livre).

## 6. Arquitetura compartilhada

```
App (futuro) ── IntegrationContracts (Foundation) ──┬── A CoachingHost: JSContext + bundle + CryptoKit + Keychain + store + D1
                                                    └── B HealthKitIngest: HealthKit + fila persistente
```

- **B → A:** `DeviceActivitySink.deliver(DeviceDelivery) -> DeliveryResult` e `ingestContext()`.
- **A → B:** `DeviceQueueControl.deliveryConditionsChanged()` e `purge(_:)`, chamados só depois do commit.
- **Isolamento:** B nunca importa JavaScriptCore, CryptoKit, Security nem o módulo de A; A nunca importa HealthKit nem SwiftUI.

## 7. Contratos entregues

| Arquivo | Conteúdo |
|---|---|
| `PARALLEL_IMPLEMENTATION_CONTRACT.md` | arquitetura, responsabilidades, os 10 pontos A↔B, vínculo, lacunas G-1..G-5 e OPEN-1..5, operações, erros/retries/idempotência, persistência, mocks, recursos físicos, matriz de ownership, mudança de contrato, pendências por dono, integração, aceite |
| `ios/Packages/IntegrationContracts` | `DeviceActivity`/`DeviceActual` e enums (os valores do motor), `DeviceDelivery` (1…32, ids ≤ 128, sem duplicata), `ActivityOutcome`, `DeliveryResult`, `BoundaryDisposition.of(code:index:)` (falha fechada), `HostCode`, `IngestContext`, as duas portas |
| `tools/device-lock/with-device.sh` | trava do iPhone |
| `COACHINGHOST_MISSION_HANDOFF.md`, `HEALTHKIT_MISSION_HANDOFF.md` | as duas missões, executáveis sem consultar a outra sessão |
| `REVIEW_R1.md` | revisão independente: 9 achados (2 HIGH), todos corrigidos antes da base |

**Derivação:** cada chave, enum e limite vem de `admission.mjs`, `report-voices.mjs`, `integration.mjs`, `custody.mjs` e `RUN_FORMATS_V1.json`, e é conferido pelos testes contra esses bytes. Onde nenhuma fonte aprova um formato, a lacuna está registrada e não foi preenchida:
- G-1 `heartRate`, G-2 `seconds`, G-3 `segments`;
- G-4 força do HealthKit;
- G-5 deleção ou edição depois da entrega;
- OPEN-1 fontes de terceiros, OPEN-2 indoor → measurement, OPEN-3 `sourceQuality`;
- OPEN-4 `syntheticOnly`, OPEN-5 semana real.

## 8. Separação de responsabilidades

- **A:** bundle de produção e gate de equivalência; runtime; host HMAC; N-4, N-5, D1 local, N-3, §6.1; operações e mapeamento de erros; N-1 do canal ATHLETE; SSCTR-BC-01 (caminho); `DeviceActivitySink`.
- **B:** autorização; observer + anchored query + background delivery; normalização determinística; vínculo inequívoco; fila durável e idempotente; deleções; `purge` com geração; dados protegidos.
- **Integração:** composição, telas, extensão real, app fechado, semana real, propostas de contrato.

A matriz de arquivos (contrato §10) não tem caminho escrito pelas duas frentes. `CoachingCore/**` e todo `audits/` existente são proibidos às duas.

**Aparelho:**
- toda execução física passa pela trava;
- `-derivedDataPath` por frente;
- bundle ids e Keychain separados;
- só B pede HealthKit;
- nada sintético é escrito no Health real do iPhone sem autorização do Founder.

## 9. O que continua bloqueando atletas reais

**REAL_ATHLETE_READY = NO** e **APPLICATION_READY_FOR_RELEASE = NO**, como no freeze. Continuam pendentes:
- SEC-FPV-01 (N-3 em A, depois a tela);
- SEC-FPV-02 / SEC-FPV-03 (A; a extensão real fica para a integração);
- G07: a retenção dos fatos de parada (Founder + jurídico);
- D1 (local em A; servidor depende de decisão), D2 backup, D3 iOS mínimo (Founder);
- SEC-INT-05/12 (testes de schema em A; o canal DEVICE já está fechado nos tipos);
- SSCTR-BC-01 (tela + SSCTR);
- C-BC-3 / SSCTR-BC-05 (texto);
- HealthKit real, background delivery com o app fechado e semana sincronizada real (B e integração; OPEN-5);
- logs e crash reports sem payload;
- R7-B0: renovação antes de **2027-04-30**;
- `syntheticOnly` (OPEN-4): desligá-lo é um gate do Founder.

## 10. Impedimentos e divergências

- **Upstream trocado** da branch do freeze: corrigido (§2).
- **Riscos que as frentes verificam primeiro:** um Personal Team pode não permitir o entitlement HealthKit, o de background delivery ou App Groups (este último necessário para provar SEC-FPV-03 com extensão). Os handoffs mandam registrar isso como bloqueio, sem contornar.
- **DR-118 × contrato revisado SEC-INT-09** sobre treinos de outros apps: OPEN-1, para Founder + Security.
- **`CURRENT_MISSION.md`** segue com `IMPLEMENTATION_AUTHORIZED = NO` no seu escopo documentário. Como nas missões V1INT/V1BC/V1FPV, a autorização de cada frente é o pedido direto do Founder ao abrir a sessão. Esta missão não editou `CURRENT_MISSION.md`.
- Nenhuma divergência entre os runtimes foi investigada ou reaberta: fora do escopo e sem gatilho.

## 11. Tabela final

| Critério | Resultado |
|---|---|
| FREEZE_PRESERVED | YES |
| REMOTE_BASE_READY | YES |
| SHARED_CONTRACT_READY | YES |
| WORKTREE_A_READY | YES |
| WORKTREE_B_READY | YES |
| PARALLEL_EXECUTION_READY | YES |
