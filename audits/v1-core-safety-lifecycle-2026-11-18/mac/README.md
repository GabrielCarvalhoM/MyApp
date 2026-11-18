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

## 7. Closure-2 (2026-11-18): o que vale agora

Este pacote passa a validar o freeze **COACHINGCORE-V1-CORE-SAFETY-FREEZE-1**, sobre o candidato `219fb1c`, com os registros em `cfb32cb`. Ele substitui o candidato `430c493` dos §§1–6, que fica histórico. A branch é **`claude/v1-core-safety-closure-2`**: no §2, troque o `git checkout` por ela, depois que o Founder autorizar o push.

| Arquivo | Mudança na closure-2 |
|---|---|
| `ios/Sources/P0Host/Resources/*` | Bundle religado sobre o freeze (41 módulos). O SHA está em `build-manifest.json`: `a34165db…` |
| `Fixtures/focal.json` | Só o `bundleSha256` muda; os resultados do motor são idênticos |
| `Fixtures/core.json` | Regravado com duas jornadas novas (abaixo); as seis anteriores estão incluídas |
| `Fixtures/j5.json`, `p16.json` | **Inalterados** (o `lab/oracle.mjs` deixa o diff vazio) |
| `FocalTests.swift` | **Sem mudança.** O `testCoreSafetyLifecycle` lê as jornadas do `core.json` e confere os nomes e o número de passos |

**Jornadas novas em `core.json`** (o critério é o do §4: `status`, `stable` e `persisted` iguais ao Node em todos os passos):
- **`alert-b01r` (SSCTR-CORE-B-01-R):**
  - plano A, depois reinício, depois o relato tardio de uma parada por sintoma numa revisão sem elegibilidade (ASK);
  - ida e volta por JSON, revisão seguinte e correção tardia, ambas em ASK;
  - duplicata e terceiro plano;
  - triagem respondida depois da parada.

  Esperado em Node: `PROPOSED KEEP PROPOSED ASK roundtrip KEEP ASK ASK PROPOSED KEEP KEEP`.
- **`expiry-record` (QRE-CORE-R2-01):**
  - plano que atravessa a data de revisão;
  - sinal com parada por sintoma depois da data (`CLINICAL_HUMAN_REQUIRED`), mantido;
  - ida e volta e a revisão seguinte.

  O registro persistido não pode conter formatos não entregues.

**Cobertura pedida pela missão, onde está:**

| Cobertura | Onde |
|---|---|
| Persistência de alertas entre revisões | `alert-b01r` |
| Reinício e identidade de sessões | `restart`, `alert-b01r` |
| E-1 | `e1-ADVERSE`, `e1-HEAT` |
| Expiração de autoridade | `expiry`, `expiry-record` |
| Determinismo e locale | âncoras nos cinco idiomas e `localeCompareCalls` = 0 |
| Race Forecast com uma e com duas provas | `forecast-one`, `forecast-two` |

**Desempenho:** o benchmark Node `4c60915` × closure-2 dá mediana ×1,007, p95 ×1,011 e registro ×1,000 (`audits/v1-core-safety-closure-2-2026-11-18/bench/`). Pelo §5, o `PerformanceTests` físico **não** é repetido, a menos que o Founder peça.

**Conferido no Windows** (só Node e o `vm` do V8, sem JavaScriptCore):
- `link.mjs` religa o bundle;
- `lab/oracle.mjs` deixa J5/P16 byte-idênticos;
- `focal-oracle.mjs` está determinístico (só o SHA muda);
- `core-oracle.mjs` dá âncoras iguais e 0 chamadas de `localeCompare`;
- `vm-check.mjs` dá `ok: true`, com JIT e com `--jitless`.

**O Swift não foi compilado.**

**Limite declarado:** este pacote não muda a condição aberta **CORE-C2-F01**, o dimensionamento no reinício a partir de linhas substituídas. O Mac valida a equivalência entre runtimes, não a dose.
