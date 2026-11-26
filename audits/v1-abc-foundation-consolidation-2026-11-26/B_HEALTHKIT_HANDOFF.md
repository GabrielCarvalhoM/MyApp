# Handoff B — HealthKit (V1, base `v1-abc-ready-2026-11-26`)

## 1. Missão e objetivo

Construir `ios/Packages/HealthKitIngest`: autorização de leitura, observação e leitura do Apple Saúde, normalização com proveniência, vínculo inequívoco, fila persistente e idempotente, dedupe, revogação, e a entrega **só** pelas portas compartilhadas. **B não prescreve, não classifica FC, não cria segundo motor e não toca o CoachingCore.**

## 2. Branch, diretório, baseline

| Item | Valor |
|---|---|
| Branch | `claude/v1-ios-healthkit` (fast-forward para a tag nesta missão) |
| Worktree | `/Users/gabrieldecarvalhomaciel/.codex/worktrees/myapp-v1-ios-healthkit/MyApp` |
| Base | tag `v1-abc-ready-2026-11-26` |
| Trava | sessão `healthkit`; `-derivedDataPath <worktree>/ios/.build/DerivedData-B` |
| Bundle id | `fit.vilumo.repmile.lab.healthkit.$(DEVELOPMENT_TEAM)`; sem Keychain |

Primeiro passo:

```bash
cd /Users/gabrieldecarvalhomaciel/.codex/worktrees/myapp-v1-ios-healthkit/MyApp
git status --short && git merge-base --is-ancestor v1-abc-ready-2026-11-26 HEAD && echo BASE_OK
git diff --stat v1-abc-ready-2026-11-26 -- CoachingCore              # vazio
(cd CoachingCore && npm ci && npm test)                              # 1952/1952/0
(cd ios/Packages/IntegrationContracts && swift test)                 # 10, 0 falhas
```

## 3. Autoridade (nesta ordem)

1. Contrato paralelo **rev. 2** (§4 A↔B, §4.3 vínculo, §4.4 lacunas, §6.2, §7, §9, §10, §12).
2. `ios/Packages/IntegrationContracts/Sources/**`: `DeviceActivity`/`DeviceDelivery`/`DeviceActivitySink`/`DeviceQueueControl` (intactos) e os aditivos `HealthIngest.swift`, `AppRecordedRun.swift`.
3. `audits/v1-abc-foundation-consolidation-2026-11-26/OWNERSHIP_MATRIX.md`, `SHARED_CONTRACTS_REPORT.md` §3, `INDEPENDENT_REVIEW.md` (SSCTR-ABC-S3/S4).
4. `audits/v1-parallel-foundation-2026-11-24/HEALTHKIT_MISSION_HANDOFF.md` §4 itens 1–14 e §7: **continuam valendo**, com as mudanças abaixo.
5. `SWIFTUI_BACKEND_HANDOFF.md` §5.3, §5.5, §7, §11; DR-117..123.

## 4. Escopo: o original + o que muda

| # | Item | Agora |
|---|---|---|
| 1–14 | autorização, leitura, seleção, normalização, vínculo, fila, respostas, recuperação, deleções, revogação, `DeviceQueueControl`, dados protegidos, contagens, logs | como no handoff original |
| 15 | **CHG-UI-3** | implementar `HealthIngestStatusSource`: `status()` (nunca "negado"; `disabledInApp` só por `setEnabled(false)`), `importedNonRunWorkouts(since:)` (força e outros: `ImportedWorkoutSummary`, só duração, nunca ao motor), apagados por `purge` |
| 16 | **Dedupe com o iPhone** | antes de entregar qualquer corrida: `RecordingDedupe.decision(workout:recordings:)` com `AppRecordingIndex` (C). `deliverLinked` → entrega vinculada àquela sessão (respeita um treino por sessão e o esporte); `setAside(OVERLAPS_APP_RECORDING)` → de lado, contado (com a distância medida perdida contada); `holdUntilRecordingSettles` → espera e redecide quando a gravação for relatada ou descartada (nunca perde o treino). O índice não notifica: **B reavalia os treinos em espera** a cada leitura do HealthKit, a cada `deliveryConditionsChanged()` e na partida |
| 17 | **Série de FC** (preparação) | `HeartRateSeriesSource`: responde `.unavailable("NOT_IN_V1")` enquanto a permissão de FC não for decidida (G-1/GAP-17). Implemente e teste o mapeamento com dados sintéticos do Simulator: amostras do intervalo do treino → `HeartRateSeries` (t desde o início, bpm como vêm, artefato quando o HealthKit o marcar), sensor mapeado sem adivinhar (`UNKNOWN` se não souber; Apple Watch = `OPTICAL`). **Nunca** classifique, interpole, preencha lacuna ou derive de média; nenhuma tabela de zonas em B |
| 18 | **Sinais de exibição** | `HealthSignalSource` responde `.notInV1` (FC de repouso, VFC, sono) até a decisão FDR + SEC; o mapeamento pode ser preparado só no Simulator |
| 19 | Proveniência | `sourceName` como o Apple Saúde informa; fontes de terceiros continuam fora do canal DEVICE (OPEN-1) |

**Não pedir** permissão de FC, sono, VFC ou escrita no aparelho real nesta fase.

## 5. Entregáveis

`ios/Packages/HealthKitIngest`, `ios/Labs/HealthKitLab`, `audits/v1-ios-healthkit-2026-11-24/{FINAL_REPORT.md,results/,CONTRACT_CHANGE_PROPOSALS.md}`.

## 6. Dependências

- A: nada para começar (dublê roteirizado de `DeviceActivitySink` + o dublê Node recomendado sobre `createIntegration`).
- C: nada; o `AppRecordingIndex` tem dublê de teste.

## 7. Testes obrigatórios

Os do handoff original §7, mais:
1. `status()` com leitura vazia nunca afirma negação; `purge` esvazia resumos e itens retidos.
2. Dedupe: os seis casos de `AdditiveContractTests.testRecordingDedupeCountsARunOnce` pelo caminho real da fila (vinculado, de lado, em espera e redecidido, gravação curta dentro de corrida longa).
3. Série: ordem, dentro do treino, ≤ 12 000 amostras, sensor `UNKNOWN` quando não houver metadado; o JSON é a entrada do `classifySamples` (teste Node como em `testEngineClassifierReadsTheSeriesAsEncoded`).
4. Nenhum valor de saúde em log (canário).
5. `swift test` de `IntegrationContracts` verde.

**iPhone** (trava `healthkit --wait`): autorização e leitura de treinos reais só com contagens; background delivery só se observado; aparelho bloqueado.

## 8. Restrições

Contrato §10: proibidos `CoachingCore/**`, pacotes compartilhados, pastas de A e C, `ios/App/**`. Sem `JavaScriptCore`, `CryptoKit`, `Security`, `SwiftUI`, `CoachingPresentation`. Nada de escrita no Health do Founder sem autorização explícita.

## 9. Quality gates e encerramento

Testes acima com logs; `git diff --name-only v1-abc-ready-2026-11-26..HEAD` só em caminhos de B; pacotes compartilhados e CoachingCore com diff vazio; grep de imports proibidos vazio; revisão independente; tabela final do handoff original §10 + `INGEST_STATUS_PORT`, `RECORDING_DEDUPE`, `HR_SERIES_MAPPING (SIMULATOR)`.

## 10. Integração e depois

- **Físico nesta frente:** autorização, leitura, aparelho bloqueado, o que for observável de background delivery.
- **Só na integração:** background com o app fechado, semana real sincronizada (OPEN-5), dedupe com o `RunRecorder` real de C, `GAP-14` (vínculo escolhido pelo atleta) com A, **FND-ABC-06** (corrida avulsa digitada pelo atleta + treino do relógio no mesmo horário viram duas linhas no motor: a dedupe não cobre relatos manuais; decisão de Core + SSCTR + B).
- **REAL_ATHLETE_READY = NO.**
