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

## 8. CORE-C2-F01 (2026-11-18): reinício a partir de registro com correções

Este pacote passa a validar também a correção **CORE-C2-F01**, na branch **`claude/v1-core-c2-f01`** (de `d92aa88`; candidato `576e40c`; freeze **COACHINGCORE-V1-CORE-SAFETY-FREEZE-2**, registros em `00e922a`). No §2, troque o `git checkout` por ela, depois que o Founder autorizar o push. A mudança de motor é uma só: `CoachingCore/src/v1-f08.mjs`, `restartIntake`. Linhas substituídas por uma correção não contam mais como execuções no limite C-Q08-1, nem na pausa; um evento repetido no registro conta uma vez.

| Arquivo | Mudança |
|---|---|
| `ios/Sources/P0Host/Resources/*` | Bundle religado (41 módulos). SHA em `build-manifest.json`: `7953fec0…` |
| `Fixtures/focal.json` | Só o `bundleSha256` muda |
| `Fixtures/core.json` | Duas jornadas novas, `restart-f01` e `restart-f01-control`. As oito anteriores ficam idênticas (entradas e esperados), assim como as âncoras, o driver e os ids de módulo |
| `Fixtures/j5.json`, `p16.json` | **Inalterados** |
| `FocalTests.swift` | **Sem mudança.** O teste lê as jornadas do `core.json` |

**Reprodutor e oráculo Node:** `node audits/v1-core-safety-lifecycle-2026-11-18/mac/core-oracle.mjs`. Ele monta as duas jornadas:
- **`restart-f01`:** o atleta da AIF relata as semanas 0 a 2, e cada corrida é corrigida na mesma noite (12 linhas substituídas no registro). Depois vem uma ida e volta por JSON e um reinício no dia 24.
- **`restart-f01-control`:** as mesmas semanas, sem correção, com o mesmo reinício.

O oráculo **falha** se o reinício corrigido não prescrever as doses do controle. A saída esperada é:
```
CORE-C2-F01 restart doses (corrected = control): [[25,25,25,60],[25,25,25,60]]; superseded rows in the corrected record: 12
restart-f01: PROPOSED KEEP KEEP KEEP KEEP KEEP KEEP roundtrip PROPOSED
restart-f01-control: PROPOSED KEEP KEEP KEEP roundtrip PROPOSED
```
No código congelado (`d92aa88`), a mesma jornada corrigida dava 40/40/40 e longa 80, porque o registro mostrava 292 min/semana em vez de 146.

**Fixture e resultado esperado:** `Fixtures/core.json`, jornadas `restart-f01` e `restart-f01-control`. Elas trazem as entradas exatas de cada passo e os digests esperados de `answer`, `stable` e `persisted`.

**Critério de equivalência no JavaScriptCore:** o do §4. Em cada passo das duas jornadas, `status`, `namespace`, `stable` e `persisted` devem ser iguais ao Node. O passo de reinício de `restart-f01` (o último) carrega o plano no `stable`. Se ele for igual ao do Node, o aparelho prescreve as doses do controle. Um `DIVERGED` reprova. Não há `EXPLAINED_LIBM` esperado nessas jornadas, porque nelas não há `runForecast` com números não inteiros. Se aparecer um, ele é registrado e julgado pela regra RFC-NUMERIC-1.

**Lista obrigatória no aparelho:** a mesma do §3. As novas jornadas rodam dentro de `testCoreSafetyLifecycle`, nos cinco idiomas.

**Desempenho:** o benchmark Node `d92aa88` × `576e40c` (`audits/v1-core-c2-f01-2026-11-18/bench/`) dá:
- revisão: mediana ×1,009, p95 ×1,003;
- reinício a partir de registro corrigido: mediana 29,9 → 31,3 ms, p95 ×1,003;
- registro: ×1,000.

Nada disso é material, então o `PerformanceTests` físico **não** é repetido.

**Conferido no Windows** (Node e `vm` do V8, sem JavaScriptCore):
- `link.mjs` religa o bundle;
- `lab/oracle.mjs` deixa J5/P16 byte-idênticos;
- `focal-oracle.mjs` muda só o SHA;
- `core-oracle.mjs` dá as doses do controle e 0 chamadas de `localeCompare`;
- `vm-check.mjs` dá `ok: true`, com JIT e com `--jitless`.

O Swift não foi compilado. **IOS_REVALIDATION_PENDING:** não há aprovação no iPhone sem a medição física.

## 9. C-F01-1 r2 (2026-11-18): evidências de execução no reinício

Este pacote passa a validar também o fechamento de **C-F01-1 r2**, na branch **`claude/v1-core-cf011-r2`** (de `4b6e1ea`; runtime `37c0f6f`; freeze **COACHINGCORE-V1-CORE-SAFETY-FREEZE-3**). No §2, troque o `git checkout` por ela, depois que o Founder autorizar o push. A mudança de motor continua sendo um arquivo só, `CoachingCore/src/v1-f08.mjs` (`restartIntake`):
- **(i)** registro com relatos na janela de 28 dias, mesmo sem execução em vigor, limita a exposição declarada ao que mostra executado;
- **(ii)** sessão em que todas as vozes dizem que aconteceu, com só a quantidade contestada, conta para a pausa, o último dia e `trainedAfter`, com quantidade zero no limite;
- **SB-1:** qualquer voz em vigor dizendo que o atleta treinou depois da declaração de prontidão faz a pergunta do motivo da nova parada.

| Arquivo | Mudança |
|---|---|
| `ios/Sources/P0Host/Resources/*` | Bundle religado (41 módulos). SHA do `coachingcore-p0.js`: `4963a6f5…` |
| `Fixtures/focal.json` | Só o `bundleSha256` muda |
| `Fixtures/core.json` | Três jornadas novas: `restart-r2-notdone`, `restart-r2-notdone-control` e `restart-r2-disputed`. As dez anteriores ficam idênticas (entradas e esperados), assim como as âncoras, o driver, os ids de módulo e os idiomas |
| `Fixtures/j5.json`, `p16.json` | **Inalterados** |
| `FocalTests.swift` | **Sem mudança** |

**Jornadas novas (oráculo Node `core-oracle.mjs`, seção 8):**
- **`restart-r2-notdone`:** corridas da semana 0 relatadas e corrigidas para "não realizada" na mesma noite; ida e volta por JSON; reinício. Esperado: limitado ao registro, classe RESTART, 15/15/15/20. No freeze anterior (`4b6e1ea`) dava EASY_CURRENT 40/40/40/80, acima do controle.
- **`restart-r2-notdone-control`:** as mesmas corridas relatadas como feitas. EASY_LOW 15/15/20/20.
- **`restart-r2-disputed`:**
  1. Bloqueio (`NOT_FEELING_100` com sinal), depois a declaração de prontidão.
  2. Uma corrida em duas vozes (app + relógio), e a correção do atleta contra o relógio (quantidade contestada).
  3. Ida e volta por JSON.
  4. Reinício sem motivo declarado: **ASK** (`athlete.pause.reasonCategory`). No freeze anterior, PROPOSED sem perguntar.
  5. Reinício com motivo: PROPOSED.

O oráculo **falha** se o reinício "não realizada" não for RESTART limitado com a semana 0 no máximo igual à do controle, ou se a jornada contestada não perguntar. Saída esperada (primeira linha):
```
C-F01-1 r2: not done RESTART [[15,15,15,20],[20,20,20,20]] (control EASY_LOW [[15,15,20,20],[15,15,20,20]]); disputed after readiness: ASK ["athlete.pause.reasonCategory"] then PROPOSED
```
Nota: depois da semana 0, cada classe segue a sua progressão, e a RESTART passa da EASY_LOW nas semanas 2–4. Isso é a observação O-1 do SSCTR (classes não monotônicas, B0-F05), anterior a esta linha, e não um critério deste pacote.

**Critério de equivalência no JavaScriptCore:** o do §4, em cada passo das três jornadas. Um `DIVERGED` reprova.

**Desempenho:** bench Node `4b6e1ea` × candidato: revisão ×1,004; reinício de registro corrigido ×0,994; registro ×1,000. QRE mediu ×1,12 (+0,28 ms) num registro com linhas em conflito. Nada disso é material, então o `PerformanceTests` físico **não** é repetido.

**Conferido no Windows** (Node e `vm` do V8, sem JavaScriptCore):
- `link.mjs` religa o bundle;
- `lab/oracle.mjs` deixa J5/P16 byte-idênticos;
- `focal-oracle.mjs` muda só o SHA;
- `core-oracle.mjs` passa, com 0 chamadas de `localeCompare`;
- `vm-check.mjs` dá `ok: true`, com JIT e com `--jitless`.

O Swift não foi compilado. **IOS_REVALIDATION_PENDING:** não há aprovação no iPhone sem a medição física.

## 10. SEC-R2-03 + SEC-R2-04 (2026-11-19): integridade das correções

Este pacote passa a validar também o fechamento de **SEC-R2-03 e SEC-R2-04**, na branch **`claude/v1-core-sec-r2`** (de `a6e10d0`; runtime `36ea26a`; freeze **COACHINGCORE-V1-CORE-SAFETY-FREEZE-4**). No §2, troque o `git checkout` por ela, depois que o Founder autorizar o push. A mudança de motor está em dois arquivos:
- **`src/r6-provenance.mjs`:** uma correção recusada (eventId de outra sessão, atividade do relógio de outra sessão, conflito) não marca mais o original como substituído, e não leva o relógio `firstRecordedAt` da sua cadeia.
- **`src/v1-f08.mjs`:** um registro substituído só é histórico quando o substituto tem identidade positiva (mesma sessão, senão mesma atividade, senão o mesmo relato manual no mesmo instante). Dois ids ausentes nunca são a mesma sessão.

| Arquivo | Mudança |
|---|---|
| `ios/Sources/P0Host/Resources/*` | Bundle religado (41 módulos). SHA do `coachingcore-p0.js`: `449382cf…` |
| `Fixtures/focal.json` | Só o `bundleSha256` muda |
| `Fixtures/core.json` | Três jornadas novas: `sec-r2-refused-eventid`, `sec-r2-refused-activity` e `sec-r2-readiness`. As treze anteriores ficam idênticas (entradas e esperados), assim como as âncoras, o driver, os ids de módulo e os idiomas |
| `Fixtures/j5.json`, `p16.json` | **Inalterados** |
| `FocalTests.swift` | **Sem mudança** |

**Jornadas novas (oráculo Node `core-oracle.mjs`, seção 9):**
- **`sec-r2-refused-eventid`:** semana 0 relatada; uma correção da corrida d3 que reutiliza o eventId da corrida d1 (recusada); ida e volta por JSON; revisão seguinte; reinício. Esperado: d3 continua em vigor, nada marcado como substituído, e cada passo é igual ao do mesmo relato enviado sem `correctionOf`. No freeze anterior, d3 sumia do registro.
- **`sec-r2-refused-activity`:** a corrida d1 relatada só pelo relógio (atividade HK-S1), depois uma correção de d3 com HK-S1 (recusada); o resto como acima.
- **`sec-r2-readiness`:**
  1. Bloqueio, depois a declaração de prontidão.
  2. Uma corrida depois da declaração, e a correção recusada dessa corrida.
  3. Ida e volta por JSON.
  4. Reinício sem motivo: **ASK** (`athlete.pause.reasonCategory`).
  5. Reinício com motivo: PROPOSED.

O oráculo **falha** se uma correção recusada mudar o registro ou divergir do relato simples, ou se a corrida depois da declaração não ficar em vigor e a nova parada não for perguntada. Saída esperada (terceira linha):
```
SEC-R2-03/-04: refused event id [[25,20,20,15]] = plain; refused activity [[25,20,20,15]] = plain; nothing replaced; readiness then refused correction: ASK ["athlete.pause.reasonCategory"] then PROPOSED
```

**Fica só no Node, por não passar pelo cliente do aparelho:** registros manuais sem identidade de sessão, órfãos já gravados pela FREEZE-3 e o relógio `firstRecordedAt` (SEC-SR2-01). Estão em `CoachingCore/test/v1core-secr2-correction-integrity.test.mjs`. A equivalência Node/JavaScriptCore do motor que os lê é a destas jornadas.

**Critério de equivalência no JavaScriptCore:** o do §4, em cada passo das três jornadas. Um `DIVERGED` reprova.

**Desempenho:** bench Node `a6e10d0` × candidato:
- revisão ×1,009;
- reinício de registro corrigido ×1,00 a ×1,06 (ruído entre execuções);
- registro ×1,000;
- normalizador ×0,98 a ×1,01;
- heap igual.

Nada disso é material, então o `PerformanceTests` físico **não** é repetido.

**Conferido no Windows** (Node e `vm` do V8, sem JavaScriptCore):
- `link.mjs` religa o bundle;
- `lab/oracle.mjs` deixa J5/P16 byte-idênticos;
- `focal-oracle.mjs` muda só o SHA;
- `core-oracle.mjs` passa, com 0 chamadas de `localeCompare`;
- `vm-check.mjs` dá `ok: true`, com JIT e com `--jitless`;
- uma segunda execução não muda nada.

O Swift não foi compilado. **IOS_REVALIDATION_PENDING:** não há aprovação no iPhone sem a medição física.

## 11. Normalization Consistency F1 + F2 + F3 (2026-11-19): eventos atrasados, identidade de atividades, quarentena

Este pacote passa a validar também o fechamento de **F1, F2 e F3**, na branch **`claude/v1-core-normalization-consistency`** (de `e704180`; runtime `963547b`; freeze **COACHINGCORE-V1-CORE-SAFETY-FREEZE-5**). No §2, troque o `git checkout` por ela, depois que o Founder autorizar o push. A mudança de motor está num arquivo só, **`src/r6-provenance.mjs`**:
- **F1:** o registro carregado é reconstruído (histórico, depois registros em vigor) antes de ler os relatos da revisão. Um relato atrasado com relógio anterior não expulsa mais um registro já admitido. Uma correção feita antes de o relato que ela nomeia existir é recusada, lida pelo relógio do próprio relato nomeado.
- **F2:** uma parte mesclada guarda a atividade do relógio e o próprio relógio de disponibilidade. A atividade continua vinculada à execução em toda revisão seguinte.
- **F3:** reler uma correção em conflito não resolve mais o conflito; só uma correção válida resolve.

| Arquivo | Mudança |
|---|---|
| `ios/Sources/P0Host/Resources/*` | Bundle religado (41 módulos). SHA do `coachingcore-p0.js`: `ce5b01bd…` |
| `Fixtures/focal.json` | Só o `bundleSha256` muda |
| `Fixtures/core.json` | Três jornadas novas: `ncc-late-report`, `ncc-merged-activity` e `ncc-quarantine`. As dezesseis anteriores têm entradas idênticas. Doze têm esperados idênticos. Em quatro (`e1-ADVERSE`, `e1-HEAT`, `restart-f01`, `restart-r2-disputed`) só os digests `answer`/`stable`/`persisted` mudam; `status`, `proposal`, `namespace`, `expiry` e `forecast` são iguais |
| `Fixtures/p16.json` | Só digests mudam, a partir do passo 18 |
| `Fixtures/j5.json` | **Inalterado** |
| `FocalTests.swift` | **Sem mudança** |

**Por que os digests mudam (e só isso):**
- As partes mescladas ganharam dois campos (`activityId`, `availableAt`).
- A lista `excluded` do modelo de aprendizado sai na ordem do registro, com o mesmo conteúdo.
- Prova em Node:
  - `audits/v1-core-ncc-2026-11-19/evidence/core-journeys-delta.mjs` reexecuta as dezesseis jornadas no motor da FREEZE-4 e no candidato. Retirados os dois campos das partes, comparadas como conjuntos as listas do modelo e descartados os digests, dá 0 diferenças.
  - `p16-model-order.mjs` mostra, para a P16, só a ordem de `updatedModel.excluded` (igual como conjunto) e os hashes calculados sobre ela.

**Jornadas novas (oráculo Node `core-oracle.mjs`, seção 10)**, cada uma com ida e volta por JSON, revisão seguinte e reinício:
- **`ncc-late-report`** (F1 e o ciclo C1):
  - a corrida d1 é relatada pelo atleta e pelo relógio (mesclada);
  - o atleta corrige a sua parte e chega uma ressincronização do relógio feita antes dessa correção: fica em vigor, 43 min;
  - uma correção de d3 (parada por SINTOMA);
  - um relato do relógio de d3 feito antes e entregue depois: recusado, e a correção fica em vigor, em conflito.
- **`ncc-merged-activity`** (F2): uma correção de d3 com a atividade mesclada de d1, depois um relato de outra sessão com a mesma atividade. As duas são recusadas, e a atividade fica só em d1.
- **`ncc-quarantine`** (F3):
  - o atleta contesta a sua parte de d1 contra a voz do relógio: CONFLICTED;
  - ida e volta e nova leitura sem nada novo: ainda CONFLICTED;
  - uma correção válida resolve: COMPLETED.

O oráculo **falha** se algum desses resultados mudar. Saída esperada (quarta linha):
```
NCC F1/F2/F3: late report ["DUPLICATE_CONFLICT_QUARANTINED"], the correction d3-fix! in force; late re-sync in force (d1 [43]); merged activity reused ["ACTIVITY_BOUND_TO_TWO_SESSIONS","ACTIVITY_BOUND_TO_TWO_SESSIONS"], held by w0-run-d1; dispute CONFLICTED, again CONFLICTED, settled COMPLETED; restarts PROPOSED PROPOSED PROPOSED
```

**Fica só no Node:** o diferencial gerado (doze configurações), as mutações e os formatos sem cliente de aparelho. Estão em `audits/v1-core-ncc-2026-11-19/evidence/` e em `CoachingCore/test/v1core-ncc-normalization-consistency.test.mjs`.

**Critério de equivalência no JavaScriptCore:** o do §4, em cada passo das dezenove jornadas e de J5/P16. Um `DIVERGED` reprova.

**Desempenho:** bench Node `e704180` × candidato:
- revisão ×0,98;
- reinício de registro corrigido ×0,99;
- registro ×1,00;
- normalizador ×1,03 a ×1,09 em lote pequeno (submilissegundo) e ×0,88 na ressincronização;
- heap retido igual.

Nada disso é material, então o `PerformanceTests` físico **não** é repetido.

**Conferido no Windows** (Node e `vm` do V8, sem JavaScriptCore):
- `link.mjs` religa o bundle;
- `lab/oracle.mjs`: J5 byte-idêntico, P16 só digests (explicados acima);
- `focal-oracle.mjs` muda só o SHA;
- `core-oracle.mjs` passa, com 0 chamadas de `localeCompare`;
- `vm-check.mjs` dá `ok: true`, com JIT e com `--jitless`;
- uma segunda execução não muda nada.

## 12. O-1 Conflict Evidence (2026-11-19): relatos recusados por conflito, SB-1

Este pacote passa a validar também **SSCTR-NCC-01** e **SEC-NCC-02**, na branch **`claude/v1-core-conflict-policy`** (de `f40fbe1`). No §2, troque o `git checkout` por ela, depois que o Founder autorizar o push. A mudança de motor está num arquivo só, **`src/r6-provenance.mjs`** (sha256 `b206416f…`):
- **Voz mantida:** um relato válido recusado só por conflito com o registro em vigor da mesma execução fica guardado como voz (parte) do registro marcado em conflito. Nunca entra no volume nem na dose.
- **Resolução:** uma correção só resolve a disputa quando concorda com todas as vozes mantidas. Enquanto a disputa existe, uma correção substitui só as vozes do próprio autor (o relógio ou o atleta), qualquer que seja o id nomeado.
- **SB-1:** a pergunta de prontidão ouve a voz mantida. Uma parada relatada depois da declaração de prontidão volta a perguntar (ASK).

| Arquivo | Mudança |
|---|---|
| `ios/Sources/P0Host/Resources/*` | Bundle religado (41 módulos). SHA do `coachingcore-p0.js`: `679fcf48…` |
| `Fixtures/focal.json` | Só o `bundleSha256` muda |
| `Fixtures/core.json` | Duas jornadas novas: `o1-stop-resync` e `o1-readiness`. As dezenove anteriores têm entradas idênticas. Dezoito têm esperados idênticos. Em `ncc-late-report` só os digests `answer`/`stable`/`persisted` mudam, a partir do passo 5; `status` e `op` são iguais |
| `Fixtures/j5.json`, `Fixtures/p16.json` | **Inalterados** |
| `FocalTests.swift` | **Sem mudança** |

**Por que `ncc-late-report` muda (e só isso):**
- O relato atrasado do relógio de d3 continua recusado.
- Agora fica guardado como voz do registro em conflito, com o hash de entrada.
- Prova em Node: `audits/v1-core-o1-2026-11-19/evidence/o1-journeys-delta.mjs` reexecuta as dezenove jornadas no motor da FREEZE-5 e no candidato. Retiradas as vozes mantidas e descartados os digests, dá 0 diferenças.

**Jornadas novas (oráculo Node `core-oracle.mjs`, seção 11)**, cada uma com ida e volta por JSON:
- **`o1-stop-resync`** (SSCTR-NCC-01, cenário 21):
  - o relógio relata d3 concluída;
  - o atleta relata parada por SINTOMA: recusado e mantido como voz;
  - o relógio ressincroniza o próprio relato: **CONFLICTED** (a FREEZE-5 dava COMPLETED);
  - nova leitura sem nada novo: ainda CONFLICTED;
  - o relógio ressincroniza com a parada (concordam): PARTIAL, sem conflito;
  - reinício PROPOSED.
- **`o1-readiness`** (SEC-NCC-02):
  - uma retenção, a declaração de prontidão, uma corrida depois dela relatada "não feita";
  - a parada por SINTOMA atrasada dessa corrida: recusada e mantida;
  - ida e volta;
  - reinício sem motivo: **ASK** (`athlete.pause.reasonCategory`; a FREEZE-5 dava PROPOSED sem perguntar); com motivo: PROPOSED.

O oráculo **falha** se algum desses resultados mudar. Saída esperada (linha O-1):
```
O-1: stop refused ["DUPLICATE_CONFLICT_QUARANTINED"] and kept (app-stop,dev-d3-v3); after the re-sync CONFLICTED, again CONFLICTED, agreed PARTIAL; late stop after readiness ["DUPLICATE_CONFLICT_QUARANTINED"]: restart ASK ["athlete.pause.reasonCategory"] then PROPOSED
```

**Fica só no Node:** o diferencial gerado (doze configurações), as mutações (9/9) e os casos de integridade. Estão em `audits/v1-core-o1-2026-11-19/evidence/` e em `CoachingCore/test/v1core-o1-conflict-evidence.test.mjs`.

**Critério de equivalência no JavaScriptCore:** o do §4, em cada passo das vinte e uma jornadas e de J5/P16. Um `DIVERGED` reprova.

**Desempenho:** bench Node `f40fbe1` × candidato:
- revisão ×0,98;
- reinício de registro corrigido ×1,01;
- registro ×1,00 nas jornadas sem disputa;
- ×1,03 a ×1,04 em registros com muitas disputas (gerados).

Nada disso é material, então o `PerformanceTests` físico **não** é repetido.

**Conferido no Windows** (Node e `vm` do V8, sem JavaScriptCore):
- `link.mjs` religa o bundle;
- `lab/oracle.mjs`: J5 e P16 byte-idênticos;
- `focal-oracle.mjs` muda só o SHA;
- `core-oracle.mjs` passa, com 0 chamadas de `localeCompare`;
- `vm-check.mjs` dá `ok: true`, com JIT e com `--jitless`;
- uma segunda execução não muda nada.

## 13. Safety Continuity (2026-11-20): interrupções que não desaparecem, ocorrência disputada

Este pacote passa a validar também **SEC-O1-01b/c**, **C-O1-2** e o caso de parada de zero minuto (O-NCC-S1).
- **Branch:** **`claude/v1-core-safety-continuity`**, a partir de `48e428f`.
- **Freeze:** `COACHINGCORE-V1-CORE-SAFETY-FREEZE-7`.
- **Antes de usar:** no §2, troque o `git checkout` por essa branch, depois que o Founder autorizar o push.

A mudança de motor está em dois arquivos:
- **`src/v1-f08.mjs`** (sha256 `7ec9b6d5…`):
  - uma parada declarada depois da declaração de prontidão continua pedindo a verificação, mesmo depois de uma correção esportiva;
  - uma sessão disputada em que todas as vozes dizem que aconteceu conta como ocorrida para a pausa, sem crédito de quantidade.
- **`src/r6-provenance.mjs`** (sha256 `cd0ede9d…`):
  - sem quarentena "fantasma";
  - no máximo 16 vozes mantidas por registro em disputa, mais uma por tipo de sinal (parada, aconteceu, não aconteceu).

| Arquivo | Mudança |
|---|---|
| `ios/Sources/P0Host/Resources/*` | Bundle religado (41 módulos). SHA do `coachingcore-p0.js`: `cbd47958…` |
| `Fixtures/focal.json` | Só o `bundleSha256` muda |
| `Fixtures/core.json` | Três jornadas novas: `sc-stop-corrected`, `sc-zero-stop` e `sc-occurrence`. As vinte e uma anteriores têm entradas **e** esperados idênticos |
| `Fixtures/j5.json`, `Fixtures/p16.json` | **Inalterados** |
| `FocalTests.swift` | **Sem mudança** |

**Jornadas novas** (oráculo Node `core-oracle.mjs`, seção 12), cada uma com ida e volta por JSON:
- **`sc-stop-corrected`** (SEC-O1-01b/c):
  1. uma retenção, a declaração de prontidão e uma corrida depois dela, relatada com parada por SINTOMA;
  2. o atleta corrige para "não feita";
  3. ida e volta;
  4. reinício sem motivo: **ASK**. A FREEZE-6 dava PROPOSED: a correção apagava a parada;
  5. uma nova retenção e uma declaração posterior;
  6. reinício: PROPOSED.
- **`sc-zero-stop`** (O-NCC-S1): uma parada de zero minuto, por tempo, depois da declaração. Reinício sem motivo: **ASK** (FREEZE-6: PROPOSED); com motivo: PROPOSED.
- **`sc-occurrence`** (C-O1-2):
  1. o relógio e o atleta relatam d3 com minutos diferentes (disputa mantida, duas vozes);
  2. ida e volta;
  3. reinício PROPOSED, com a pausa lida a partir de d3.

O oráculo **falha** se algum desses resultados mudar. Saída esperada (linha Safety Continuity):
```
Safety Continuity: corrected stop restart ASK ["athlete.pause.reasonCategory"] (history row kept), then after a later declaration PROPOSED; zero-minute stop ASK then PROPOSED; head-on d3 kept voices app-sc,dev-sc, restart PROPOSED
```

**Fica só no Node:**
- o diferencial gerado (doze configurações);
- as mutações (19/19);
- os casos de quarentena e de limite de vozes.

Estão em `audits/v1-core-sc-2026-11-20/evidence/` e em `CoachingCore/test/v1core-sc-safety-continuity.test.mjs`.

**Critério de equivalência no JavaScriptCore:** o do §4, em cada passo das vinte e quatro jornadas e de J5/P16. Um `DIVERGED` reprova.

**Desempenho:** bench Node `48e428f` × candidato:
- revisão ×0,98;
- reinício corrigido ×1,03;
- registro ×1,00.

Nada disso é material, então o `PerformanceTests` físico **não** é repetido.

**Conferido no Windows** (Node e `vm` do V8, sem JavaScriptCore):
- `link.mjs` religa o bundle;
- `lab/oracle.mjs`: J5 e P16 byte-idênticos;
- `focal-oracle.mjs` muda só o SHA;
- `core-oracle.mjs` passa;
- `vm-check.mjs` dá `ok: true`, com JIT e com `--jitless`;
- uma segunda execução não muda nada.
