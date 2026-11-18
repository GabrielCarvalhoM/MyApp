# QRE P0 DEVICE R1: revisão do delta do Mac e do aparelho (não commitado, sobre `2beea1b`)

**Juiz:** Quality & Reliability Engineer, independente do worker. **Data:** 2026-11-18.
**Escopo:** o delta não commitado sobre `2beea1b`:
- `Package.swift`, `CoachingCoreRuntime.swift` e `Metrics.swift`;
- `ios/DeviceHost/` (plano B);
- `lab/focal-driver.js`, `lab/focal-oracle.mjs`, `Fixtures/focal.json` e `FocalTests.swift`;
- `results/device/`;
- o `RUN.md`, alterado pelo worker durante esta revisão. Li o diff dele.

**Fora do escopo:** as 10 amostras frias e as execuções repetidas de desempenho, que o worker ainda está rodando.
**Ambiente:** Mac mini M4, Node 24.19.0, `swift test` no macOS, `jsc` do sistema. **Não toquei no iPhone.**
**Não fiz:** correções, commit ou edição de arquivo. Só gravei este arquivo e sondas no scratchpad da sessão.

## Veredito: **READY_WITH_CONDITIONS**

- Nada no delta muda o motor, o bundle, o linker ou as metas. Os mesmos bytes chegam ao motor nos três layouts. O plano B compila os mesmos testes.
- **A causa do EXPLAINED_LIBM em P16 está provada.** Pus no V8 os três valores de `exp` do JavaScriptCore. O replay do Node passou a dar exatamente os hashes do aparelho nos passos 13, 14, 25 e 26, e todos os outros passos ficaram idênticos.
- Não há bloqueio. Há cinco condições, quase todas sobre **o que o relatório pode afirmar**:
  - o aparelho não é o de entrada;
  - a cobertura focal é parcial;
  - o motor depende do idioma do aparelho fora de en/pt;
  - o ramo do par de provas não roda;
  - o teste de estresse sofre efeito térmico.

## 1. O que reproduzi

| # | Comando / sonda | Resultado |
|---|---|---|
| R1 | `node …/build/link.mjs` | `bundle 1425100 B sha256 ad4d3fdefcab552d…`, gate passou. `git diff` em `Resources/` vazio. `shasum` do bundle = `ad4d3fde…7c1f84` |
| R2 | `node …/lab/oracle.mjs` | Código 0. J5 `acc6fab3…` e P16 `c59f2444…`. `git diff` em `Fixtures/` vazio |
| R3 | `node …/lab/focal-oracle.mjs`, duas vezes | O `focal.json` tem o mesmo SHA-256 antes e depois (`20b19d71…`): é determinístico. Resultado: 24 generate, 24 schedule, learning ok, 62 pares, `differFromDefault` 0/0/0, pow 14, exp 17 |
| R4 | `git status` e `git diff --stat` depois de tudo | Só o delta do worker. Nada em `CoachingCore/`, `build/`, `PerformanceTests.swift` ou `lab/device-budgets.mjs` |
| R5 | `swift test --filter 'FocalTests\|EquivalenceTests'` (macOS, JavaScriptCore do sistema) | 11 de 11 passaram. P16 deu EXPLAINED_LIBM nos passos 13, 14, 25 e 26; a restauração em 16 deu 25 e 26. Mesma `libm` do aparelho e `tier-probe` com 393, 395 e 401 ms |
| R6 | `diff -r` entre `Sources/P0Host/Resources` e os produtos | Plano B (`Release-iphoneos/…/P0DeviceTests.xctest/P0Host_P0Host.bundle`): idêntico, mais o `Info.plist`. macOS (`.build/out/…/Contents/Resources`): idêntico. `Fixtures` do xctest: idêntico |
| R7 | Sonda `sites.mjs`: pilha de cada `localeCompare`/`toSorted` do driver no Node | Os locais atingidos estão na tabela do §5 |
| R8 | Sonda `exact.mjs`: `e^x` em aritmética exata de BigInt (200 dígitos), sobre o valor binário exato do argumento | Ver §6 |
| R9 | Causalidade: replay P16 no Node com `Math.exp` trocado pelos três valores do JSC | Só 13, 14, 25 e 26 mudam, com 24 substituições. Os 4 hashes de `runForecast` e os `F_future` são **iguais aos do aparelho** (`diff-answer/`) |
| R10 | Contagem de chamadas de `Math.log` e `**` em J5 e P16, e busca de `PRIOR_UPDATED_BY_ONE_PAIR` | `log`: 0 chamadas. Ramo do par: 0 passos |
| R11 | Sonda `lm.js`: 20.000 argumentos, `node` contra `jsc` | Diferem: `log` 1.443, `x**-0.5` 6.002, `exp` 1.864, `sqrt` 0. Entre JSC com e sem JIT: 0 |
| R12 | Sonda `tier.js`, o mesmo laço do teste, no `jsc` do M4 | JIT completo 72 ms, só baseline 87 ms, `--useJIT=false` 390 ms |
| R13 | Sonda `loc.js`: o mesmo `localeCompare` em 10 locales, `node` e `jsc` | `da` e `nb` invertem `"aa0f"` contra `"ab12"`; `cs` inverte `"chain"` contra `"dz"`. **Iguais nos dois engines.** Ver C-3 |

## 2. Perguntas do mandato

**(1) Motor, bundle, linker e metas.** Não mudam (R1, R2, R4). O `exposeModules` muda o **texto avaliado**, mas só no runtime focal; ver (4).

**(2) Recursos.**
- `Bundle.module.resourceURL` (`CoachingCoreRuntime.swift:63`) resolve os três layouts (R6):
  - macOS, `Contents/Resources`;
  - iOS do pacote, raso;
  - xctest do plano B.
- Se um arquivo faltar, `Data(contentsOf:)` lança: a falha é fechada.
- No aparelho, só existe uma cópia do `P0Host_P0Host.bundle`, a do xctest.
- **Lacuna antiga, que o delta torna mais relevante:** só os assets são conferidos contra o manifesto. O `coachingcore-p0.js` nunca é conferido contra `build-manifest.json`. O campo `bundleSha256` do `focal.json` é decodificado e nunca comparado (`FocalTests.swift:15`). Ver M-2.

**(3) Plano B.**
- Os testes são os mesmos: o `project.pbxproj` referencia `../Tests/P0HostTests/{Support,Equivalence,Performance,Focal}Tests.swift` e a pasta `Fixtures`, sem cópia. São exatamente os 4 arquivos do pacote, e `ColdStartTests` está em `PerformanceTests.swift`.
- O shim `Bundle(for: PlanBBundleMarker.self)` aponta para o próprio `.xctest`. Não conflita com o `Bundle.module` interno do `P0Host`.
- O esquema está certo: Test e Launch em Release, `codeCoverageEnabled = NO`, `selectedDebuggerIdentifier = ""`, e os `P0RESULT` com `debuggerAttached: false`. Release usa `-O` com `wholemodule`. O pacote é construído na configuração Release.
- O host é `WindowGroup { Color.clear }`, sem tela de produto.
- **Desvio:** o alvo de testes tem `IPHONEOS_DEPLOYMENT_TARGET = 17.0`, o app tem 16.0 e o pacote `.iOS(.v16)`. Ver M-4.
- **Não é representativo:** o aparelho. Ver C-1.

**(4) `exposeModules` e `callGlobal`.**
- O padrão é `false`. Só `testLocaleAndSortCoverage` liga o `exposeModules` (`FocalTests.swift:34`), num runtime próprio.
- A troca exige exatamente uma ocorrência do final do script (`:93-97`) e não muda o código de nenhum módulo.
- Equivalência e desempenho usam `make()` sem o flag. Não medem nada alterado.
- Os dois são API pública da biblioteca. Ver M-6.

**(5) Cobertura focal.** Está em C-2, C-3 e no §4. **(6) libm.** Está em C-4 e no §5.

**(7) Nível de execução.** Concluir "só interpretador, sem JIT" é **justificado**:
- No mesmo M4, o laço leva 72 ms com JIT completo, 87 ms só com baseline e 390 ms com `--useJIT=false` (R12).
- Em `swift test` no mesmo Mac, o JSContext dá 393 a 401 ms (R5). É o nível do interpretador, e **na mesma máquina**.
- O aparelho dá 406 a 409 ms. Uma CPU A19 Pro tem desempenho por núcleo da ordem do M4.
- Um JIT, qualquer que seja o nível, teria de ser mais de 4,5× mais lento para chegar a 407 ms.
- É inferência entre máquinas, não prova do mecanismo, mas é coerente com a regra da plataforma: processo de terceiros não tem a permissão de JIT.
- **Efeito colateral:** o comentário de `Package.swift:4` ("JIT is on there") ficou falso para o `swift test`. Ver M-3.

**(8) Ponte e estresse.** Estão em C-5, M-1, M-6 e no §6.

## 3. Achados

### C-1 · condição · O aparelho medido não é o aparelho de entrada da PF-0

**Evidência.**
- Os `P0RESULT` trazem `"machine":"iPhone18,2"`: iPhone 17 Pro Max, A19 Pro, iOS 27.2.
- A PF-0 §2/§3 define que "o orçamento é medido" num A13 (iPhone SE de 2ª geração ou iPhone 11). O `RUN.md` §2.1 repete isso.
- `lab/device-budgets.mjs:17` exige um único aparelho, mas não confere a classe dele. Um código 0 nesse aparelho passaria por aprovação da PF-0.

**Correção.**
- No relatório e no veredito de desempenho, escrever: "medido num aparelho de topo; as metas da PF-0 no aparelho de entrada continuam **NÃO MEDIDAS**".
- Equivalência, libm, nível de execução e locale valem como prova do JavaScriptCore do iOS 27.2. Os tempos não valem para o A13.
- O `device-budgets.mjs` precisa imprimir a classe do aparelho junto do veredito. Isso é rótulo, não meta, e as metas não mudam.
- Aceitar o aparelho de topo como substituto é decisão do Founder.

### C-2 · condição · A cobertura focal atinge 5 dos 8 locais; o critério "reached" passa no vazio

**Evidência** (R7: pilha de cada chamada no driver, Node; o aparelho confirma as mesmas fases):

| Local de chamada | Atingido? |
|---|---|
| `r5-contract.mjs:14` (`anchorConfigurationHash`) | sim, 567 |
| `r5-contract.mjs:25` (`toSorted`) | sim, 322 + 420 |
| `r5-learning.mjs:98` | sim, 17 |
| `r5-learning.mjs:99`, primeira comparação (`inputHash`) | sim, 24 |
| `r5-learning.mjs:99`, desempate por `reason` | **não**: nenhum par de `reason` em `collation.list` |
| `r5-learning.mjs:129` | sim, 7 |
| `r5-schedule.mjs:26` (desempate por `anchorId`) | **não**: nunca há empate de dia e minuto |
| `r6-program.mjs:960` (`lastPerformed`) | **não**: o driver não chama esse caminho |

**Por que o critério passa no vazio.**
- `reached` é por fase e cumulativo (`FocalTests.swift:51-56`).
- A asserção (`:68`) só exige **igualdade** entre os dois engines.
- `schedule.localeCompare` dá `false` no Node e no aparelho, e o teste passa assim mesmo.
- Se uma mudança futura deixar de atingir um local nos dois engines, o teste continua verde.

**O que é sólido.**
- Os digests do motor são iguais.
- O re-julgamento dos 62 pares do Node no JSContext, com o locale padrão, en-US, pt-BR e unidades UTF-16, é idêntico.
- Os 62 pares do próprio aparelho não mudam com o locale, nem quando comparados por unidades de código.
- Ignorar o número de comparações (TimSort contra merge sort) é correto. O digest de ponta a ponta mais o re-julgamento cruzado bastam.

**Correção.**
- No relatório: QRE-P0-04 fica **parcialmente coberta**, com os três locais não atingidos listados.
- No teste: atribuir cada chamada ao local dela (por exemplo, pela pilha, como em R7) e afirmar o conjunto esperado como `true`, não só igual entre os engines.
- Para fechar: entradas congeladas com empate de dia e minuto, para `r5-schedule:26`, e um caminho de `r6-program:960`, de preferência tirados de testes existentes do `CoachingCore/test`.

### C-3 · condição · O motor depende do idioma do aparelho fora de en-US e pt-BR (nos dois engines)

**Evidência.**
- R13: com `localeCompare` sem locale explícito, que é a forma de todos os locais do motor:
  - em `da` e `nb`, `"aa…"` vem depois de `"b…"` (a contração `aa` vira `å`), e isso afeta os **hashes hexadecimais** de `r5-learning.mjs:99`;
  - em `cs`, `"ch"` vem depois de `"h"`.
- O resultado é o mesmo no V8 e no JSC do Mac.
- Prova direta no motor:
  - `LC_ALL=en_US` dá `anchorConfigurationHash([{id:"aa12"},{id:"b345"}])` = `66cbdb47…`;
  - `LC_ALL=da_DK` dá `c564664f…`.
- A fixture focal não pega isso (R3 rodado em 7 locales dá o mesmo digest), porque nenhum par decisivo tem `aa` ou `ch`. Com hashes aleatórios, um `inputHash` começa com `aa` em 1 de cada 256 casos.
- O teste só roda em en e pt-BR.

**Consequência.** Num aparelho em dinamarquês ou norueguês, o hash do modelo de aprendizagem pode diferir:
- do mesmo motor em outro idioma;
- de uma auditoria em Node;
- do mesmo usuário depois de trocar o idioma.

Isso não é específico do JavaScriptCore e não bloqueia a P0. Mas é um defeito de determinismo, e a QRE-P0-04 o apresentava como "efeito do idioma não testado".

**Correção.**
- Registrar no §4.2 e no §8 do relatório, com owner (Engineering), para um freeze sucessor: comparação por unidades de código, ou locale fixo explícito.
- Não afirmar "locale testado". Afirmar "en-US e pt-BR testados; o motor depende do locale em `da`, `nb` e `cs`, entre outros".

### C-4 · condição · EXPLAINED_LIBM está provado só para o caminho sem par de provas; `log` e `**-0.5` nunca rodam

**Evidência.**
- R10: J5 e P16 fazem 0 chamadas de `Math.log` e nunca entram no ramo `PRIOR_UPDATED_BY_ONE_PAIR`. Esse ramo está no bundle, linhas 11362 e 11363: `Math.log(...)`, `(w0+w1)**-0.5` e `Math.sqrt`.
- O `**` não é interceptável, e o `testLibmBits` também não o vê.
- R11: entre V8 e JSC, `x**-0.5` difere em 30 % das amostras e `log` em 7 %, contra 9 % do `exp`.

**Correção.**
- A decisão sobre EXPLAINED_LIBM (P0_REPORT §4.2) precisa dizer que vale para `exp` e `pow` no caminho sem par.
- Para cobrir o par: uma fixture focal reaproveitando entradas congeladas de `CoachingCore/test/v1rfc-*.test.mjs`, que têm `pairA`, comparada pelo `diff-answer`, mais os bits de `log` e `pow(x,-0.5)` no `testLibmBits`. Sem cenário esportivo novo.

### C-5 · condição · Estresse: efeito térmico e "view while review" precisam do rótulo certo

**Evidência.**
- `stress` começou com `thermalStart: "fair"` e terminou com `thermalEnd: "serious"`.
- As medianas por bloco de 50 revisões sobem 285 → 288 → 294 → 303 ms (+6 %), o que se confunde com o calor.
- O `FocalTests` rodou logo depois da equivalência.
- `viewWhileReviewMs` deu 282 ms, contra `viewIdleMs` de 0,5 ms. A fila do motor é serial (`:182-186`). O número mede **espera atrás da revisão**, não o custo da projeção.

**Correção.**
- Não usar o estresse como prova de desempenho.
- Escrever que uma projeção pedida durante uma revisão espera até o fim dela: cerca de 280 ms no aparelho de topo, mais no A13. É acima dos 100 ms de toque se a interface esperar o motor.
- Isso é um dado de arquitetura (projeção servida de cache fora da fila), não uma meta da P0.
- A conclusão "sem vazamento" (`churn` 18,4 → 14,4 MB, `long` estável em 13,8 MB, `afterLongGC` 13,8 MB) se sustenta.

### M-1 · menor · A ponte desconta o relógio em dobro

**Evidência.**
- Em `FocalTests.swift:118`, `nowPair` mede **duas** chamadas de `now()` por iteração.
- O intervalo do wrapper (`:117`) vai do relógio lido dentro do 1º `now()` até o lido dentro do 2º. Ele contém só **uma** travessia completa: a volta da 1ª mais a ida da 2ª.
- Descontar `calls × nowPair` (`:123`) tira uma travessia a mais por chamada. Por outro lado, o JS do próprio wrapper não é descontado.
- `jsObservedMs` (14,1 ms; 5,2 % da parede) e `crossingAndConversionMs` (6,8 ms) ficam com erro de sinal incerto, da ordem de 1.934 × uma travessia.
- O `nowPair` não é registrado, e a nota de `:133` está errada.

A conclusão continua de pé: a ponte é uma fração pequena da revisão, cerca de 3 a 6 %.

**Correção.** Registrar `nowPair` e descontar `nowPair/2`, ou dar o intervalo entre os dois descontos. Corrigir a nota.

### M-2 · menor · Os "mesmos bytes" não são provados em execução

**Evidência.**
- Ninguém confere o SHA-256 do `coachingcore-p0.js` carregado.
- O `bundleSha256` do `focal.json` não é usado.
- `testLibmBits` e `testExecutionTierProbe` só emitem resultado, sem asserção.
- Eu confirmei os bytes por inspeção dos produtos (R6), não pelo teste.

**Correção.** Só nos testes:
- calcular o hash de `source` antes do `exposeModules` e compará-lo com `build-manifest.json` e com o `focal.bundleSha256`;
- emitir o hash no `host-contract`;
- afirmar que `libm.differ` está contido nos passos não idênticos.

### M-3 · menor · `Package.swift:4` diz que o macOS tem JIT

**Evidência.** Pelo R5, o `swift test` roda no nível do interpretador (393 ms).

**Correção.** Corrigir o comentário. No relatório, os tempos do Mac são "sem JIT, em outra CPU", e continuam não contando como medição.

### M-4 · menor · Deployment target dos testes é 17.0 e o piso é 16.0

**Evidência.** Sem efeito no iOS 27.2. Mas o plano B não instalaria num aparelho com iOS 16, e o motivo não está escrito.

**Correção.** Documentar a razão (por exemplo, o mínimo do XCTest no Xcode 27) ou alinhar em 16.0.

### M-5 · menor · As respostas brutas do aparelho não ficaram guardadas

**Evidência.** `results/device/diff-answer/*.json` não guarda o hash do anexo de origem, e os `.xcresult` ficaram no scratchpad do worker. O R9 compensa de forma independente, mas a cadeia não se reproduz a partir do repositório.

**Correção.** Guardar o SHA-256 de cada anexo na saída do `diff-answer`, ou versionar os 6 anexos redigidos.

### M-6 · menor · Superfície de teste pública e rótulos imprecisos

**Evidência.**
- `exposeModules`, `callGlobal` e `evaluate` são API pública da biblioteca. Hoje não há app de produção; o risco só aparece quando este host for promovido.
- `testStress`:
  - `cpu0` mede tempo de parede, não CPU (`:140`);
  - "read after it is released" (`:144`) não é garantido, porque o bloco da fila ainda pode reter o runtime e o JSC libera a memória de forma tardia. O erro é para cima.

**Correção.** Ao promover o host, pôr esses três sob `#if DEBUG` ou num alvo de suporte de testes. Corrigir os dois rótulos.

## 4. O que se sustenta

- **Equivalência no aparelho:** J5 5/5 IDENTICAL. P16 29 IDENTICAL e 4 EXPLAINED_LIBM (13, 14, 25, 26). Restauração J5 IDENTICAL; P16 15 IDENTICAL e 2 EXPLAINED_LIBM (25, 26). `host-contract` sem ausências nem recusas. O macOS reproduz o mesmo (R5), e o diff do aparelho é igual ao `mac-reference/mac-diff-*`, tirando o campo `step`.
- **Cobertura focal nos locais atingidos:** não passa no vazio. O digest cobre o status e o hash de cada caso (23 PROPOSED e 1 ASK) e o modelo de aprendizagem. **Fica descoberto:** `r5-schedule:26`, `r6-program:960`, o desempate por `reason` em `r5-learning:99`, os locales com regras próprias (C-3) e as entradas que não sejam identificadores ASCII.

## 5. libm: verificação independente

| Argumento | Arredondamento correto (R8) | V8 | JSC (aparelho = Mac = libm do macOS) |
|---|---|---|---|
| `exp(-0.6)` | `0.5488116360940264` | `…265`, erro de 0,5005 ULP | correto, 0,4994 ULP |
| `exp(-1.1)` | `0.33287108369807955` | `…795`, 0,5147 ULP | correto, 0,4852 ULP |
| `exp(-1.2)` | `0.30119421191220214` | `…021`, 0,5206 ULP | correto, 0,4793 ULP |

- A afirmação está correta **para esses três argumentos**. Não é uma propriedade geral de nenhum dos dois engines.
- `exp(-1.1)` também difere nos passos 23 e 24, que saem IDENTICAL: a diferença é absorvida.
- **Causa provada pelo R9**, não só localizada: com os três valores do JSC, o V8 reproduz os hashes do aparelho, e só esses quatro passos mudam.
- O `diff-answer` está coerente: 6 folhas por passo, todas em `runForecast`, com diferença relativa de no máximo 2,1e-15 e `unexplained` vazio.
- **O que escapa:** o `**` não inteiro e o `log` do ramo do par (C-4). O `**2` com expoente inteiro e o `sqrt` são exatos (R11: `sqrt` dá 0).

## 6. Ponte e estresse: aritmética

- **Ponte:** 1.934 chamadas e 4,70 MB de UTF-8 por revisão. 7,3 ms dentro do Swift = 2,7 % da parede mediana de 270 ms, as duas das mesmas repetições sem wrapper: a conta é correta. `jsObserved` vem das repetições com wrapper e é dividido pela parede sem wrapper, o que é aceitável; o desconto tem o erro de M-1.
- **Estresse:** a cadeia com reinício a cada passo dá os mesmos 4 EXPLAINED_LIBM e nenhum DIVERGED, e o isolamento confere. Gravação mediana de 2,6 ms; pico da vida do processo de 35 MB. Rótulos em C-5 e M-6.

## 7. Encerramento

Esta revisão vale para o working tree sobre `2beea1b` em 2026-11-18, com o bundle `ad4d3fde…`. Ela não julga as amostras frias nem as execuções repetidas de desempenho.

**Condições antes do fechamento:**
- C-1 a C-5, no texto do relatório e no veredito;
- M-1 e M-2, recomendadas, de baixo custo.

A decisão sobre EXPLAINED_LIBM continua sendo do owner (P0_REPORT §4.2). Esta revisão dá a causa, não a aceitação. A decisão sobre o JavaScriptCore fica INCONCLUSIVA para o aparelho de entrada até a C-1 ser resolvida.
