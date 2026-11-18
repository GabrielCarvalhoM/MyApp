# Mac revalidation package: Core Safety & Lifecycle

Pequeno de propósito. Reusa o harness da P0 (`audits/v1-aif-p0-jsc-2026-11-17`, `RUN.md` §2A): o mesmo projeto `DeviceHost`, o mesmo esquema, o mesmo host de quatro funções. **Não há segundo sistema de testes iOS.** Nada aqui rodou em JavaScriptCore: no Windows só rodaram Node e um contexto `vm` do V8.

## 1. O que mudou no harness da P0, nesta linha

| Arquivo | Mudança |
|---|---|
| `build/entry.mjs` | Importa `v1-safety-index.mjs`, para o linker levar a entrada sucessora ao bundle. A fachada e as jornadas J5/P16 não mudam |
| `ios/Sources/P0Host/Resources/*` | Bundle reconstruído pelo `link.mjs` desta linha (41 módulos, 16 assets). O SHA está em `build-manifest.json`. Os bytes da P0 ficam no commit `16577b6` |
| `Fixtures/focal.json` | Regravado pelo `focal-oracle.mjs`. Os resultados do motor são idênticos aos da P0; só muda a seção de colação, porque o motor não chama mais `localeCompare` (0 pares) |
| `Fixtures/core.json` (novo) | Oráculo Node do `mac/core-oracle.mjs`: as entradas exatas e os digests esperados |
| `FocalTests.swift` | A expectativa de alcance do `testLocaleAndSortCoverage` passa a ser `localeCompare` alcançado em nenhuma fase. Novo `testCoreSafetyLifecycle` |
| `Fixtures/j5.json`, `p16.json` | **Inalterados.** As jornadas da P0 dão os mesmos bytes no motor sucessor |

## 2. Sincronizar e conferir, antes do Xcode

```
git fetch && git checkout claude/v1-core-safety-lifecycle   # depois que o Founder autorizar o push
node audits/v1-aif-p0-jsc-2026-11-17/build/link.mjs           # o SHA do bundle deve ser o do build-manifest.json commitado
node audits/v1-aif-p0-jsc-2026-11-17/lab/oracle.mjs           # git diff vazio (J5/P16)
node audits/v1-aif-p0-jsc-2026-11-17/lab/focal-oracle.mjs     # git diff vazio, exceto defaultLocale se o Mac não estiver em pt-BR (registrar)
node audits/v1-core-safety-lifecycle-2026-11-18/mac/core-oracle.mjs   # git diff vazio
node audits/v1-core-safety-lifecycle-2026-11-18/mac/vm-check.mjs     # ok:true (o bundle num contexto clássico do V8)
node --jitless audits/v1-core-safety-lifecycle-2026-11-18/mac/vm-check.mjs
```

O bundle depende do código-fonte. Um SHA diferente do commitado quer dizer que a fonte mudou, e então o teste não vale para o commit.

## 3. Testes no aparelho (o mesmo `T()` do `RUN.md` §2A)

```
T EquivalenceTests                                                   2>&1 | tee equivalence.log    # J5, P16, restaurações: como na P0
T FocalTests/testCoreSafetyLifecycle -testLanguage en    -testRegion US 2>&1 | tee core-en.log
T FocalTests/testCoreSafetyLifecycle -testLanguage pt-BR -testRegion BR 2>&1 | tee core-pt.log
T FocalTests/testCoreSafetyLifecycle -testLanguage da    -testRegion DK 2>&1 | tee core-da.log
T FocalTests/testCoreSafetyLifecycle -testLanguage nb    -testRegion NO 2>&1 | tee core-nb.log
T FocalTests/testCoreSafetyLifecycle -testLanguage cs    -testRegion CZ 2>&1 | tee core-cs.log
T FocalTests/testLocaleAndSortCoverage -testLanguage en -testRegion US 2>&1 | tee focal-en.log
T FocalTests/testLibmBits                                            2>&1 | tee libm.log
T PerformanceTests                                                   2>&1 | tee performance.log      # só se o Founder pedir: ver §5
```

**Lista obrigatória de testes físicos:** `EquivalenceTests` (completo); `testCoreSafetyLifecycle` nos cinco idiomas; `testLocaleAndSortCoverage` (en); `testLibmBits`.

## 4. Critérios de aceitação no JavaScriptCore

| Cobertura | Jornada em `core.json` | Aceito quando |
|---|---|---|
| Identidade de plano e sessão, persistência e restauração | `restart`: plano A, reinício, revisão sem relato, primeiro relato de B, ida e volta por JSON, segundo reinício no mesmo dia | `status`, `namespace`, `stable` e `persisted` iguais ao Node em todos os passos |
| Alerta clínico depois da expiração | `expiry`: sinal em 04-29, 04-30 e 05-01; instante 22:30 −03:00 de 30/4; semanal depois; hold de pé; prontidão | idem; os sinais depois da data dão `CLINICAL_HUMAN_REQUIRED`, sem proposta |
| E-1 | `e1-ADVERSE`, `e1-HEAT` | idem |
| Race Forecast (RFC-NUMERIC-1) | `forecast-one`, `forecast-two` (seis semanas relatadas) | `stable` e `persisted` iguais. Um passo com `answer` diferente e todo o resto igual é `EXPLAINED_LIBM`: o relatório o lista, e o RFC-NUMERIC-1 o aceita |
| Ordem independente de idioma | âncoras em pt-BR, en-US, da-DK, nb-NO e cs-CZ | `localeCompareCalls` = 0, o hash das âncoras é o mesmo nos cinco e é igual ao do Node |
| Integridade dos assets | toda execução | `assertHostClean`: nenhuma ausência, nenhuma recusa; um asset adulterado continua recusado (`EquivalenceTests` da P0) |
| J5/P16 | `EquivalenceTests` | como na P0: 5/5; 29 + 4 `EXPLAINED_LIBM` nos mesmos passos, ou melhor; 0 `DIVERGED` |

Qualquer `DIVERGED` reprova e volta ao Engineering, com a resposta anexada (`core-reply.json`).

## 5. Diferenças conhecidas e como tratar

- **EXPLAINED_LIBM:** permitido pelo RFC-NUMERIC-1, só dentro de `runForecast`, só em números não inteiros (e nos dois digests do bloco). Não há caminho de persistência para eles: o teste Node mostra o estado persistido idêntico com `exp`/`log`/`pow` deslocados em 1 ULP.
- **O ramo de duas provas** (`(w0+w1)**-0.5`, `Math.log`): nenhuma fixture de Node o alcançou com certeza (`decomposition.O` não se moveu). Se `testLibmBits` ou a jornada `forecast-two` mostrar esse ramo, vale a mesma regra; se não mostrar, a cobertura dele continua lacuna (C-4).
- **Desempenho:** nesta linha, nenhuma mudança toca o caminho quente de uma revisão de forma material (ver `REGRESSION.md`, benchmark Node). A medição física completa **não** é repetida. Só se o benchmark Node apontar custo material, rodar `PerformanceTests` e o `device-budgets.mjs`.
- **`defaultLocale`:** o oráculo registra o idioma da máquina, fora do digest.

## 6. Entrega

Os logs vão para `audits/v1-core-safety-lifecycle-2026-11-18/results/device/`, sem Team ID, UDID, Apple ID nem caminhos pessoais. Junto vai um relatório curto: `IOS_REVALIDATION_REPORT.md`, com a decisão `IOS_REVALIDATED` ou `IOS_REVALIDATION_FAILED`, por critério.
