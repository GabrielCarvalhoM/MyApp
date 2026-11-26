# Handoff da missão A: CoachingHost (integração nativa Swift do CoachingCore V1)

> **SUPERSEDED como ponto de entrada (2026-11-26).** A missão de consolidação final A+B+C substituiu este handoff por `audits/v1-abc-foundation-consolidation-2026-11-26/A_COACHINGHOST_HANDOFF.md`, que o referencia onde ele continua valendo. Base, comandos de verificação, contratos e ownership deste arquivo valem só onde o novo handoff não os substitui.

## 1. Objetivo

Construir o `CoachingHost`: a camada Swift que carrega o CoachingCore congelado em JavaScriptCore e lhe dá as funções de host, a chave e a âncora no Keychain, o store nativo, o lock entre processos e o relógio confiável. Ela expõe, como valores Swift tipados, cada operação da fronteira existente, inclusive o `DeviceActivitySink` que a frente B vai chamar.

A camada transporta, executa, persiste e apresenta. **Nunca decide treino.**

## 2. Onde trabalhar

| Item | Valor |
|---|---|
| Branch | `claude/v1-ios-coachinghost` |
| Worktree | `/Users/gabrieldecarvalhomaciel/.codex/worktrees/myapp-v1-ios-coachinghost/MyApp` |
| Commit-base | tag `v1-parallel-base-2026-11-24` (hash em `CONSOLIDATION_REPORT.md`), comum com a frente B |
| Sessão para a trava do aparelho | `coachinghost` |

Primeiro passo, obrigatório:

```bash
cd /Users/gabrieldecarvalhomaciel/.codex/worktrees/myapp-v1-ios-coachinghost/MyApp
git status --short                                                     # vazio
git merge-base --is-ancestor v1-parallel-base-2026-11-24 HEAD && echo BASE_OK
node CoachingCore/scripts/v1-final-release-freeze.mjs --check          # exit 0, 87/87
(cd ios/Packages/IntegrationContracts && swift test)                   # 7 testes, 0 falhas
```

## 3. Leitura obrigatória (nesta ordem)

1. `audits/v1-parallel-foundation-2026-11-24/PARALLEL_IMPLEMENTATION_CONTRACT.md`: contrato comum, com ownership (§10), erros (§6), persistência (§7), recursos (§9) e pendências (§12).
2. `audits/v1-final-physical-2026-11-24/SWIFTUI_BACKEND_HANDOFF.md`: §2 a §10 integralmente.
3. `audits/v1-final-physical-2026-11-24/NATIVE_OBLIGATIONS_FINAL.md`.
4. `audits/v1-integration-boundary-2026-11-23/INTEGRATION_BOUNDARY_CONTRACT.md`: §2 a §5 e §9.
5. `ios/Packages/IntegrationContracts/Sources/**`: a interface que você implementa (`DeviceActivitySink`) e a que você chama (`DeviceQueueControl`).
6. Código de referência do harness, **só leitura**:
   - `audits/v1-aif-p0-jsc-2026-11-17/ios/Sources/P0Host/{CoachingCoreRuntime,NativeCustody}.swift`;
   - `audits/v1-aif-p0-jsc-2026-11-17/ios/Tests/P0HostTests/*.swift`;
   - `audits/v1-aif-p0-jsc-2026-11-17/build/{link,entry,prelude,compare}.mjs`;
   - `audits/v1-aif-p0-jsc-2026-11-17/RUN.md` (§2A, o caminho do aparelho).
7. Fontes da fronteira, **só leitura**: `CoachingCore/src/boundary/*.mjs`.

## 4. Responsabilidades exclusivas

1. **Bundle de produção** (handoff §2, NATIVE 2.2):
   - a fachada JS do app (`ios/Packages/CoachingHost/facade/entry.mjs`), com funções que recebem e devolvem JSON string sobre `createBoundary({custody: createIntegration({store, key, clock, anchor})})`;
   - mais `importActivities`, `acknowledgeRecordLoss` e `ingestContext` (leitura derivada: `doc.createdAt` como dia no offset do plano, `program.timezoneOffsetMinutes` e as sessões RUN de todas as semanas, `{sessionId, day}`);
   - `syntheticOnly` fica no padrão (`true`, OPEN-4);
   - o linker é uma **cópia** de `build/link.mjs` (+ `prelude.js`) em `ios/Packages/CoachingHost/build/`, com diff mínimo (ENTRY, OUT, nome do global da fachada) registrado no relatório. O original do harness não muda.
2. **Runtime**: um `JSVirtualMachine` e um `JSContext` numa fila serial fora da main thread; toda chamada da fronteira passa por ela (handoff §3).
3. **Funções de host:**
   - `readAsset`, `existsAsset`, `sha256`, `now` (só para medir tempo);
   - `hmacSHA256(keyRef, text)` com CryptoKit, onde o host resolve `keyRef` no Keychain e a chave nunca entra no JS;
   - `constantTimeEqual`.
4. **SEC-FPV-02 / N-4:**
   - chave de produção aleatória de 256 bits (`SecRandomCopyBytes`), criada pelo host;
   - `keyRef` = rótulo opaco numa allowlist;
   - escrita com `SecItemAdd`, depois `SecItemUpdate`;
   - `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`;
   - nunca logada;
   - nenhuma chave de fixture fora dos testes, com um teste que prove isso.
5. **Store nativo** (NATIVE 1.1–1.6): um arquivo por atleta, tmp + fsync + rename + fsync do diretório, `completeUntilFirstUserAuthentication`, compare-and-swap por versão, limpeza de `.tmp`/`.lock` na partida.
6. **SEC-FPV-03 / N-5:**
   - lock de kernel (`flock`/`fcntl`) em toda leitura-comparação-escrita, com teste de dois processos no macOS;
   - âncora `{version, docMac}` por `SecItemUpdate`, nunca apagando antes de adicionar. O `Keychain.set` do harness faz `SecItemDelete` + `SecItemAdd`: **não copie esse padrão**.
7. **Reconciliação de primeira execução** (handoff §6.1, NATIVE 1.5):
   - marcador no container;
   - sem backup: remove os itens do Keychain deste app e chama `DeviceQueueControl.purge(.freshInstall)`;
   - o ramo "com backup" fica como ponto de extensão (D2).
8. **Relógio confiável D1** (handoff §8, opção (ii)):
   - referência local = `lastAt` do registro + `mach_continuous_time` desde aquela escrita, na mesma sessão de boot (invalida no reboot);
   - operação a mais de 300 s à frente: recusada **antes** da custódia, sem gravar nada, com o código `HostCode.clockAheadOfReference` (`CLOCK_AHEAD_OF_REFERENCE`, tela "verificar data e hora"); no `DeviceActivitySink`, `waiting`; depois da primeira operação mutável bem-sucedida, chama `deliveryConditionsChanged()`;
   - sem referência (primeira execução ou após reboot): o relógio do aparelho, como o handoff prevê;
   - nenhuma fonte de tempo inventada.
9. **Operações** (contrato §5): tipos Swift de request e resposta para cada operação; mapeamento de `state` e `error.code` (handoff §7) para enums Swift; `clientRequestId` novo por ação do usuário e reusado só no retry da mesma ação (NATIVE 7.7).
10. **SEC-FPV-01 / N-3:**
    - depois de qualquer `eraseHealthFacts` bem-sucedido, um sinal persistente "nova triagem exigida";
    - `isStartable(session) = session.executable && !sinal`;
    - o sinal só cai quando uma requisição com `eligibility` é gravada;
    - teste com o caso do relatório: "not 100%" sem hold apagado → view executável, mas `isStartable` falso.
11. **SEC-INT-05/12 (N-1), canal ATHLETE:**
    - structs Swift fechadas para o intake (§5.1), as observações (§5.2) e os formulários F08 (§5.4);
    - testes de que o JSON produzido tem só as chaves listadas e de que a admissão real (no JSContext) aceita cada forma.
12. **SSCTR-BC-01:** `weeklyCheckIn({reports, eligibility})` reenvia, na mesma requisição, um formulário que veio `NOT_RECORDED` por ASK; teste.
13. **`DeviceActivitySink`** (contrato §4, §6.1):
    - `deliver` executa `importActivities` com o ator autenticado, `clientRequestId = deliveryId` e a versão atual;
    - resolve internamente `CONFLICT_STALE_VERSION`, `REQUEST_ID_REUSED`, `BUSY` e `anchorStale`;
    - devolve exatamente um `DeliveryResult`, com `BoundaryDisposition.of(code:index:)`;
    - `ingestContext()` pela fachada.
14. **Sinais para B** (contrato §4.2): `deliveryConditionsChanged()` e `purge(_:)`, chamados só depois do commit.
15. **Logs:** só `telemetryOf`; `os_log` com `.private` em tudo que não é código, versão ou id opaco.

## 5. Interfaces

| Direção | Interface |
|---|---|
| Entra | JSON das operações da fronteira (formas do handoff §5), `DeviceDelivery` vinda de B |
| Sai para B | `DeliveryResult`, `IngestContextResult`, `DeviceQueueControl.deliveryConditionsChanged()`, `.purge(_:)` |
| Sai para a futura UI | valores Swift da `view` (handoff §7), `isStartable`, estado de expiração R7-B0, erros tipados |

## 6. Diretórios

**Permitidos (escrita):**
- `ios/Packages/CoachingHost/**`;
- `ios/Labs/CoachingHostLab/**` (projeto Xcode do app host e dos testes no aparelho, bundle id `fit.vilumo.repmile.lab.coachinghost.$(DEVELOPMENT_TEAM)`, padrão do plano B do harness);
- `audits/v1-ios-coachinghost-2026-11-24/**`.

**Proibidos:**
- `CoachingCore/**` (o verificador do freeze falha com qualquer arquivo novo ali);
- `ios/Packages/IntegrationContracts/**`, `tools/device-lock/**`, `audits/v1-parallel-foundation-2026-11-24/**` (congelados);
- `ios/Packages/HealthKitIngest/**`, `ios/Labs/HealthKitLab/**`, `audits/v1-ios-healthkit-2026-11-24/**` (da frente B);
- `audits/v1-aif-p0-jsc-2026-11-17/**` e todo `audits/` existente (evidência; copie, não edite);
- `MISSION_LEDGER.md`, `CURRENT_MISSION.md`, `CLAUDE.md`, `AGENTS.md`, `.gitignore`, `canon/**`, `product/**`, `governance/**`;
- `ios/App/**`, qualquer `*.xcworkspace` que junte A e B;
- `import HealthKit`, `import SwiftUI` (exceto o `App` vazio do lab, como no harness).

## 7. Testes obrigatórios

**macOS (`swift test`):**
1. Bundle: manifesto com cada `CoachingCore/src/*` e o sha do freeze, nada mais do CoachingCore; export gate com 0 divergências; sha do bundle igual ao manifesto e verificado no boot; asset adulterado recusado.
2. Equivalência: `core.json`, `int.json` e `final.json` (cópias das fixtures do harness) com 0 DIVERGED pela regra do handoff §10.
3. HMAC: os 40 vetores de `hmac.json` direto e pelo JSContext; `constantTimeEqual`.
4. Chave N-4: 32 bytes aleatórios; `keyRef` fora da allowlist → `""` e o bundle recusa; nenhuma chave de fixture no alvo de produção.
5. Store: as provas de 1.1, 1.3, 1.6 e da morte antes e depois do rename (padrão de `BoundaryTests`).
6. N-5: dois processos disputando o lock (200 rodadas, 0 escritas intercaladas); âncora por `SecItemUpdate` sem janela sem item.
7. D1: +299 s aceito, +301 s recusado sem escrita com `CLOCK_AHEAD_OF_REFERENCE` (e `waiting` no sink), reboot simulado invalida a referência, relógio atrás → `CLOCK_BEHIND_RECORD`, revogação e apagamento passam.
8. N-3: o caso SEC-FPV-01 e o sinal persistindo depois de reabrir o processo.
9. N-1: schema fechado de cada request do canal ATHLETE aceito pela admissão real.
10. SSCTR-BC-01: reenvio com a triagem grava o formulário.
11. `DeviceActivitySink`: RECORDED, DUPLICATE, NOT_RECORDED (ASK), SCREEN_REQUIRED, BEFORE_RECORD_START (index), UNKNOWN_SESSION, versão obsoleta resolvida, BUSY, PERSISTENCE_FAILURE, RECORD_LOST → `halted`; nenhum crédito duplo quando o mesmo chunk volta com id novo.
12. Sinais para B: ordem depois do commit; `purge` em `eraseAccount`, `acknowledgeRecordLoss` e primeira execução.
13. Reconciliação §6.1 (store sem arquivo + Keychain com itens → limpa e começa como nova instalação).
14. `swift test` em `ios/Packages/IntegrationContracts` continua verde.

**iPhone** (sempre por `tools/device-lock/with-device.sh coachinghost -- …`, com `-derivedDataPath <worktree>/ios/.build/DerivedData-A`):
- 2, 3, 5 e 8 no aparelho;
- aparelho bloqueado (padrão de `testPhaseLockedDevice`);
- reinstalação com a reconciliação ativa (o atleta não vê `RECORD_LOST` causado só pela reinstalação);
- PF-0 dentro dos orçamentos do handoff §7 / FINAL_REPORT §8.

## 8. Critérios objetivos de conclusão

Todos verdadeiros:
- os testes da §7 passam (logs em `audits/v1-ios-coachinghost-2026-11-24/results/`);
- `node CoachingCore/scripts/v1-final-release-freeze.mjs --check` dá exit 0;
- `git diff --name-only v1-parallel-base-2026-11-24..HEAD` lista só caminhos permitidos (§6);
- `grep -rE '^import (HealthKit|SwiftUI)' ios/Packages/CoachingHost` vazio;
- relatório final escrito (§10).

## 9. Bloqueios que permanecem explícitos

SEC-FPV-01 (até a tela), SEC-FPV-03 com extensão real (integração), G07 (Founder + jurídico), D1 com servidor, D2, D3, SSCTR-BC-01 (tela + SSCTR), C-BC-3/SSCTR-BC-05, R7-B0 (2027-04-30), OPEN-4 (`syntheticOnly`), HealthKit e semana real.

**REAL_ATHLETE_READY = NO.** Nada nesta missão o muda.

## 10. Relatório final

Arquivo: `audits/v1-ios-coachinghost-2026-11-24/FINAL_REPORT.md`, com:
1. Estado e commits.
2. Sha do bundle de produção e prova das três regras do §2.
3. Tabela teste → resultado → log (macOS e iPhone).
4. Obrigações NATIVE / N-x: implementada, provada, pendente.
5. Diff do linker copiado.
6. Propostas de mudança de contrato (ou "nenhuma").
7. Pendências da §9 com o dono.
8. Tabela final:

| Critério | Resultado |
|---|---|
| FREEZE_CHECK | PASS/FAIL |
| PRODUCTION_BUNDLE_EQUIVALENT | YES/NO |
| N4_KEY / N5_LOCK / D1_LOCAL / N3_SIGNAL | YES/NO cada |
| DEVICE_SINK_READY | YES/NO |
| READY_FOR_INTEGRATION | YES/NO |

## 11. Entrega para a integração

- Commits só na sua branch, com push da sua branch (sem force).
- Sem merge com `claude/v1-ios-healthkit`, `main` ou qualquer outra.
- Comunicação com B só pelo contrato; dúvida de contrato vira proposta (contrato §11), sem perguntar à outra sessão como implementar.
- Ao terminar, libere o aparelho (a trava sai sozinha ao fim do comando) e deixe a worktree limpa.
