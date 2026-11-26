# Handoff A — CoachingHost (V1, base `v1-abc-ready-2026-11-26`)

## 1. Missão e objetivo

Construir `ios/Packages/CoachingHost`: o CoachingCore em vigor (FIVE-ZONE-AMENDMENT-2) executando em JavaScriptCore numa fila serial, com persistência selada, Keychain, CryptoKit, integridade, custódia, relógio confiável, e a **implementação** das portas compartilhadas `CoachingReading`, `CoachingWriting`, `TimeInZoneClassifying` (CoachingPresentation) e `DeviceActivitySink` (IntegrationContracts). A transporta, executa, persiste e apresenta. **Nunca decide treino e não faz telas.**

## 2. Branch, diretório, baseline

| Item | Valor |
|---|---|
| Branch | `claude/v1-ios-coachinghost` (fast-forward para a tag nesta missão) |
| Worktree | `/Users/gabrieldecarvalhomaciel/.codex/worktrees/myapp-v1-ios-coachinghost/MyApp` |
| Base | tag `v1-abc-ready-2026-11-26` |
| Trava do aparelho | sessão `coachinghost`; `-derivedDataPath <worktree>/ios/.build/DerivedData-A` |
| Bundle id | `fit.vilumo.repmile.lab.coachinghost.$(DEVELOPMENT_TEAM)` (testes: `.tests`); Keychain `fit.vilumo.repmile.lab.coachinghost` |

Primeiro passo (todos devem passar antes de escrever código):

```bash
cd /Users/gabrieldecarvalhomaciel/.codex/worktrees/myapp-v1-ios-coachinghost/MyApp
git status --short                                                   # vazio
git merge-base --is-ancestor v1-abc-ready-2026-11-26 HEAD && echo BASE_OK
git diff --stat v1-abc-ready-2026-11-26 -- CoachingCore              # vazio
(cd CoachingCore && npm ci && npm test)                              # 1952/1952/0; 53 históricos no ponto declarado
(cd ios/Packages/IntegrationContracts && swift test)                 # 10, 0 falhas
(cd ios/Packages/CoachingPresentation && swift test)                 # 29, 0 falhas
```

## 3. Arquivos de autoridade (nesta ordem)

1. `audits/v1-parallel-foundation-2026-11-24/PARALLEL_IMPLEMENTATION_CONTRACT.md` (**rev. 2**): §1, §2, §4–§7, §10–§12.
2. `audits/v1-abc-foundation-consolidation-2026-11-26/`: `SHARED_CONTRACTS_REPORT.md`, `HR5_INTEGRATION_REPORT.md`, `SECURITY_SCHEMA_VALIDATION.md`, `FOUNDATION_CHANGE_DECISIONS.md`, `OWNERSHIP_MATRIX.md`.
3. `ios/Packages/CoachingPresentation/**` (as portas que você implementa, os requests que envia, `Facade/app-projections.mjs` que você liga **sem editar**, as fixtures que suas respostas devem reproduzir) e `ios/Packages/IntegrationContracts/**`.
4. `audits/v1-hr5-runna-parity-2026-11-25/CONTRACT_DELTA.md` §1 e §3 (linha "CoachingHost (A)"), `NATIVE_VALIDATION_REPORT.md`, `native/build.sh`, `native/ios/**` (o host P0 da HR5R, **só leitura**: bundle `d087ad51…`, fixtures `hr5r.json`, `final.json`, `int.json`, `core`).
5. `audits/v1-final-physical-2026-11-24/SWIFTUI_BACKEND_HANDOFF.md` §2–§10 e `NATIVE_OBLIGATIONS_FINAL.md`.
6. `audits/v1-parallel-foundation-2026-11-24/COACHINGHOST_MISSION_HANDOFF.md` §4 itens 1–15 e §7: **continuam valendo**, com as substituições da §4 abaixo.
7. Fontes da fronteira, só leitura: `CoachingCore/src/boundary/*.mjs`, `CoachingCore/src/v1-heart-rate-*.mjs`.

## 4. Escopo (itens do handoff original + o que muda)

| # | Item | O que vale agora |
|---|---|---|
| 1 | Bundle de produção | runtime = bytes que a **AMENDMENT-2** liga (`CoachingCore/v1/HR5_RUNNA_AMENDMENT_V1.json`), 50 módulos, 18 assets, **+** `ios/Packages/CoachingPresentation/Facade/app-projections.mjs` linkado verbatim (sha no manifesto). Linker: cópia de `audits/v1-hr5-runna-parity-2026-11-25/native/` (`build.sh`, `redirect.mjs`) + `audits/v1-aif-p0-jsc-2026-11-17/build/{link,entry,prelude,compare}.mjs`, diff mínimo registrado. Export gate 0 divergências |
| 2–8 | Runtime, funções de host, N-4, store, N-5, 1ª execução, D1 | como no handoff original; **âncora `{version, docMac, carriedSeq}` inteira** (HR5R) |
| 9 | Operações | **implementar** `CoachingReading` e `CoachingWriting` decodificando com os tipos de `CoachingPresentation` (nenhum tipo de view ou request paralelo). Todo relato do atleta por `integration.submit` com o JSON de `ReviewRequest` (**FND-ABC-03**: nunca os formulários de `api.mjs`); leituras por `api.mjs`/`integration` + fachada (`loggedEntries`, `weekPlan`, `warningSignSet`). `WriteOutcome.kept/notKept` por `keepsReport` logo depois de cada escrita, na mesma fila |
| 10 | `Startability` | `executable && !SEC-FPV-01 && !triagem pendente (warningSignScreen REQUIRED) && relógio confiável && R7-B0 válido && !foraDeEscopo`. **Novo, segurança (FND-ABC-04):** depois de um `restart` com `planOutcome == .outsideV1Scope`, sinal persistente (junto do store) → `.notStartable(.outsideV1Scope)` em toda sessão, até um intake aceito (`.planCreated`) ou `eraseAccount` |
| 11 | SEC-INT-05/12 | os tipos já existem (`Requests/*`); seu trabalho: provar que a admissão **no JSContext** aceita cada forma (o mesmo conjunto de `EndToEndBoundaryTests`, rodando no bundle) |
| 12–15 | SSCTR-BC-01, `DeviceActivitySink`, sinais para B, logs | como no original |
| 16 | **HR5** | `setHeartRateProfile`/`eraseHeartRateProfile` na mesma fila; mapeamento de erros de `HR5_INTEGRATION_REPORT.md` §1; proteção de concorrência §4 (lock por atleta do load ao commit, CAS por bytes, retry com leitura nova e id novo) |
| 17 | **Tempo em zona** | `TimeInZoneClassifying.timeInZones(series)` → fachada `timeInZones(readings, series, {durationSeconds, enabled:false})`. `enabled` só muda por decisão registrada (SSCTR C10), nunca por você |
| 18a | **Revisão (SSCTR-ABC-S1/S2, QRE-ABC-03/04)** | (i) `Startability` também `.notStartable(.clinicalHumanRequired)` depois de um `restart` com `planOutcome == .clinicalHumanRequired` (FND-ABC-04b), mesma persistência e liberação; (ii) **rota avulsa abandonada:** se o atleta respondeu "sim" na pergunta da corrida avulsa e saiu sem responder os sinais, `.notStartable(.screenRequired)` até respondê-los (sinal recebido de C pela escrita); (iii) **check-in com várias condições:** os sinais e os `improved` por condição vêm de `missingInputs` da resposta (`wellbeingCheck.warningSigns.<sinal>`, `wellbeingCheck.improved.<CONDIÇÃO>`) → `WellbeingCheckAnswers(askingWarningSigns:…)`; (iv) `timeInZonesForReviewOnly` nunca é chamado fora de teste (grep no gate de encerramento) |
| 18 | CHG-UI-2 restantes | `pendingWeek` (força do plano proposto, mesmo formato da view) como projeção **sua** em `CoachingHost/facade/`, com teste Node sobre a fronteira real e proposta de tipo (contrato §11) para C; prova `LOCAL_FATIGUE` (GAP-11); exercício fora da prescrição (2.10) |

## 5. Entregáveis

- `ios/Packages/CoachingHost` (Swift + fachada JS + linker + bundle gerado + cópias de fixtures);
- `ios/Labs/CoachingHostLab` (app host e testes no aparelho);
- `audits/v1-ios-coachinghost-2026-11-24/` (pasta existente no contrato): `FINAL_REPORT.md`, `results/`, `CONTRACT_CHANGE_PROPOSALS.md` (ou "nenhuma").

## 6. Dependências

- De B: nada para começar (o dublê de `DeviceQueueControl` registra chamadas).
- De C: nada. C usa provedores de fixture; você entrega as mesmas formas.
- Da integração: nova base só se uma proposta sua for aceita.

## 7. Testes obrigatórios

Os 14 do handoff original §7, com estas mudanças e acréscimos:
1. Bundle: manifesto = shas da **AMENDMENT-2** + `app-projections.mjs`; sha do bundle verificado no boot; asset adulterado recusado.
2. Equivalência (regra do handoff §10): `core`, `int`, `final`, **`hr5r`** (98 passos) com 0 DIVERGED (macOS JSC e iPhone).
3. **Decodificação:** cada resposta real da sua fachada (Node e JSC) decodifica nos tipos de `CoachingPresentation` e é **byte-igual** à fixture correspondente para os mesmos passos (reproduza `capture-fixtures.mjs` pelo bundle).
4. **E2E no JSContext:** os casos de `EndToEndBoundaryTests` (gestação/pós-parto bloqueiam; restart fora de escopo; sinais; avulsos; parada por sintoma; perfil FC) pela sua implementação de `CoachingWriting`.
5. **FND-ABC-04/04b:** depois do restart fora de escopo **ou** clínico, nenhuma sessão `.startable`, inclusive após reabrir o processo **e após reinstalar** (com a reconciliação de 1ª execução); a liberação só por intake aceito ou `eraseAccount`.
6. **HR5:** dois processos macOS disputando `setHeartRateProfile` (nenhuma declaração perdida, 200 rodadas); **persistência entre processos** (processo 1 grava, processo 2 novo lê `ATHLETE_DECLARED_MAXIMUM` 195); rollback do blob à mesma versão → `RECORD_ROLLED_BACK` com a âncora do Keychain.
7. `WriteOutcome`: o par avulso sem `observedAt` (impossível pelo tipo, injete o JSON) dá `notKept` 1; com `observedAt`, `kept` 2.
8. Os três `swift test` / `npm test` da §2 continuam verdes.

**iPhone** (pela trava `coachinghost --wait`): 2, 3 (amostra), 5, 6 (persistência entre processos), aparelho bloqueado, reinstalação com reconciliação, PF-0 sem regressão contra a HR5R (cold load p95 ≤ 1 s, revisão p95 ≤ os orçamentos do handoff).

## 8. Restrições

- Proibido: `CoachingCore/**`, os pacotes compartilhados, `tools/device-lock/**`, pastas de B e C, `ios/App/**`, `audits/` existentes (exceto a sua), arquivos de governança (contrato §10).
- Sem `import HealthKit` ou `SwiftUI` (exceto o `App` vazio do lab); sem tipo paralelo; sem regra esportiva; `syntheticOnly` fica `true`.
- Nenhum dado de saúde em log; nenhuma chave de fixture fora dos testes.

## 9. Quality gates e encerramento

Todos verdadeiros: testes da §7 com logs em `results/`; `git diff --name-only v1-abc-ready-2026-11-26..HEAD` só em caminhos de A; `git diff --stat v1-abc-ready-2026-11-26 -- CoachingCore ios/Packages/IntegrationContracts ios/Packages/CoachingPresentation` vazio; `grep -rE '^import (HealthKit|SwiftUI)' ios/Packages/CoachingHost` vazio; revisão independente QRE/Security sobre o seu diff; tabela final do handoff original §10 + `PORTS_IMPLEMENTED`, `FND_ABC_04_GATE`, `HR5_CROSS_PROCESS`.

## 10. Integração e o que fica para depois

- **Validação física nesta frente:** bundle, equivalência, persistência entre processos, aparelho bloqueado, reinstalação, PF-0.
- **Só na integração final:** extensão real + lock entre processos com App Groups (SEC-FPV-03), HealthKit fim a fim com o app fechado, semana sincronizada real (OPEN-5), backup (D2), servidor de tempo (D1 i).
- **REAL_ATHLETE_READY = NO**; nada aqui muda isso.
