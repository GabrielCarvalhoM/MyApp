# QRE P0 R2: rechecagem estreita do delta `b04e79c..5de68a7`

**Juiz:** Quality & Reliability Engineer, a mesma instância independente da R1. **Data:** 2026-11-17. **Ciclo:** o último.
**Escopo:** só o delta da correção (`5de68a7`). O commit `b9e9d11` só traz a R1, como recebida. Bundle avaliado: `ad4d3fde…7c1f84`.
**Ambiente:** o mesmo da R1: Windows, Node 24.19.0, sem Mac nem iPhone. O Swift foi **lido, não compilado**.
**Não fiz:** correções, commit ou `npm run verify`. Só gravei este arquivo e sondas no scratchpad da sessão.

## Veredito: **READY_FOR_DEVICE_RUN_WITH_CONDITIONS**

- A QRE-P0-01 está fechada: o gate de exports é correto e falha fechado, e eu o provei com um mutante.
- Fixtures e resultados de laboratório se reproduzem no bundle novo.
- As condições 02, 05, 06, 07 e 08 estão aplicadas.
- Os textos de 03, 04, 10 e 11 são honestos.
- O delta só tem achados menores (R2-01 a R2-03).

**Condições para a execução no aparelho.**
- As lacunas registradas com owner continuam abertas e não são resolvidas pela P0: a QRE-P0-03, a QRE-P0-04 (com o piso `.iOS(.v16)` mantido) e a QRE-P0-11.
- A primeira compilação no Mac pode pedir ajustes pequenos (R2-02).
- Recomendo aplicar a R2-01 antes da execução, porque o custo é baixo.

## 1. O que reproduzi

| # | Comando / sonda | Resultado |
|---|---|---|
| R1 | `node audits/v1-aif-p0-jsc-2026-11-17/build/link.mjs` | `bundle 1425100 B sha256 ad4d3fdefcab552d…`, o mesmo de `build-manifest.json`. O gate passou: 684 bindings, 0 divergências. `git status` ficou limpo |
| R2 | `node audits/v1-aif-p0-jsc-2026-11-17/lab/oracle.mjs` | Código de saída 0 e `git diff` vazio. `git diff b04e79c 5de68a7 -- …/Fixtures` também vazio: as fixtures não mudaram |
| R3 | `node audits/v1-aif-p0-jsc-2026-11-17/lab/replay-vm.mjs` | Com JIT e com `--jitless`: J5 true, P16 true (0 falhas), restauração 4:true e 16:true, 0 ausentes, 0 recusas. ULP: pow 8108, exp 364, só `runForecast` mudou. Blocos `equiv` (sem tempos) e `ulp` **idênticos** aos de `5de68a7`. Depois restaurei `results/lab-vm.json` com `git checkout --` |
| R4 | Sonda independente da R1 (`exports`), sobre o bundle novo: fonte das funções, chaves, ordem e valores contra o Node | 684 nomes. Só restam as 14 diferenças de forma das constantes `*_URL` (QRE-P0-11, registrada). Zero bindings errados |
| R5 | **Linker mutante:** a cópia de `link.mjs` com a regex `local()` da R1 de volta, saída redirecionada para o scratchpad | `link: export gate:` recusou exatamente os três bindings: `admitted` em `v1-strength-index` e em `v1-run-forecast-index`, e `S` em `harness/lib.mjs`. Código de saída 1, **nenhum arquivo gravado**. O gate falha fechado: `fail()` roda antes de qualquer `writeFileSync` |
| R6 | Colisões entre um nome de `export *` e um export local, no grafo inteiro | Seis casos, todos de sombreamento legítimo (`generateProgram`, `evaluateProgram` e `restartProgram` nos dois índices). Os valores do Node diferem, então `fromStar` devolve o local, o que está correto. **Nenhum** export local tem valor primitivo igual ao de uma fonte `*`. O único `let` de topo no grafo é o `client` de `entry.mjs`, que não é exportado |
| R7 | Tamanho das respostas inteiras de P16 com `answer:true` | 18,3 milhões de caracteres nos 33 passos, no máximo 0,97 milhão por passo |

## 2. Itens verificados

**(a) QRE-P0-01: fechada.**
- `fromStar` (`build/link.mjs`) decide a origem pela identidade `s.mod.ns[n] === m.ns[n]` nos namespaces do próprio Node. Pela regra do ESM, um export local sombreia `*` e um local não exportado nunca sombreia.
- **Um primitivo igual pode ligar errado?** Só se três coisas coincidirem: o nome é exportado localmente; o valor é idêntico ao da fonte `*` no momento do build; o binding é mutável depois (uma variável `let` exportada por lista).
  - Com `const` ou função, o valor lido pelo getter é o mesmo para sempre, então não há diferença observável.
  - No grafo atual não existe nenhum caso (R6).
  - Um valor `NaN` cairia no ramo do local e lançaria. O gate então recusaria o build: falha fechada, não silenciosa.
- **Limite do gate:**
  - `view()` compara funções só por nome e aridade, e um `symbol` vira `symbol:undefined` dos dois lados;
  - então o gate sozinho não pegaria a troca entre duas funções de mesmo nome e mesma aridade, nem entre dois símbolos;
  - como a origem já é decidida por identidade, o gate é uma segunda linha;
  - a sonda R4, que compara o código-fonte, confirma que não há troca.

**(b) Fixtures e laboratório.** Fixtures inalteradas. Resultados booleanos e de ULP reproduzidos no bundle `ad4d3fde…` (R2 e R3).

**(c) Condições aplicadas.**

| Condição | Onde | Situação |
|---|---|---|
| 02 | `Support.swift` (`HostCalls`, `hostCalls`, `assertHostClean`); `EquivalenceTests.check` | J5, P16 e os dois runtimes restaurados terminam conferindo `misses` e `unsupported` |
| 05 | `attachNonIdentical`, opções `{"digest":true,"answer":true}` em toda a equivalência; `diff-answer.mjs <j5\|p16>` | Anexa a resposta em todo passo não IDENTICAL. Regra: toda folha diferente dentro de `runForecast` e, ou um dos hashes dele, ou um número a até 1e-12 relativo; senão, DIVERGED, com código de saída 1. Folha ausente, `a = 0` e `NaN` caem em DIVERGED, o que é conservador. P16 é regenerada nativamente |
| 06 | `PerformanceTests` | O pico usa `max(lifetimePeak, amostrados)`. O rótulo "dica de GC" ficou honesto. Os dois erram para cima |
| 07 | `PerformanceTests`; `lab/device-budgets.mjs` | Carga e primeiro plano julgados **a frio** sobre 10 amostras; menos de 10 amostras reprova. Gravação atômica ≤ 50 ms p95. Pausa na main ≤ 100 ms. O ambiente só vale com um único aparelho, Release, sem simulador, sem depurador e fora do Modo de Pouco Consumo; senão, código de saída 1. Nenhuma meta foi afrouxada; o limite da main é mais estrito que os 250 ms de um "hang" |
| 08 | `RUN.md` §2.1–2.3; `Metrics.swift` `isDebuggerAttached` | Passo de interface removido, plano B descrito, `debuggerAttached` registrado em todo `P0RESULT`. Ver R2-01 |
| 09 | `replaySteps` | O `defer` dentro do `do` fecha o intervalo de signpost mesmo quando a chamada lança. A inicialização definitiva de `let raw` é válida |

**Leitura do Swift do delta, sem compilador.**
- `kinfo_proc`, `sysctl(&mib, u_int(mib.count), &info, &size, nil, 0)` e `kp_proc.p_flag & P_TRACED`: forma usual, disponível no SDK de iOS por meio do Foundation e do Darwin.
- `HostCalls` é `Codable` e casa com o JSON de `hostCalls()` da fachada.
- `replay` e `check` usam tuplas e chamadas `try` válidas.
- `bridge.atomicWriteMs.p95` e `gapOffMain` estão definidos antes de `budgets`.
- O único risco novo de compilação é a R2-02.

**(d) Honestidade do relatório.**
- 03, 04 e 11 aparecem como lacunas, com owner e sem nenhuma alegação de cobertura. O piso iOS 16 está mantido e justificado.
- 10:
  - os números do §5.1 batem com o `lab-vm.json` de `5de68a7`;
  - a nota sobre os 13 % da execução anterior e o comando do perfil são honestos;
  - "cerca de 1,7×" na verdade é 1,8× (474/265), uma diferença menor.
- §3 "Prova de que o gate funciona": confirmada de forma independente pelo mutante (R5).
- §4.1 "A revisão independente reproduziu tudo isso…": verdadeiro depois desta R2.

## 3. Achados do delta

### QRE-P0-R2-01 · menor · Detecção de depurador falha aberta, e o RUN.md não diz como sair dela

**Evidência.**
- `Metrics.swift` (`isDebuggerAttached`) retorna `false` quando `sysctl` falha. Assim, uma leitura impossível vira "sem depurador", e `device-budgets.mjs` aceita a medição.
- O `RUN.md` §2.3 afirma que o `xcodebuild test` não anexa o LLDB, mas isso não foi verificado.
- Se no aparelho aparecer `debuggerAttached: true`, o script recusa a medição (correto), mas o `RUN.md` não ensina a desligar o depurador.

**Correção.**
- Registrar o resultado como desconhecido (`Bool?`, ou um campo de erro) e tratar o desconhecido como medição inválida em `device-budgets.mjs`.
- No `RUN.md`, descrever o remédio: desmarcar "Debug executable" na ação Test do esquema compartilhado do pacote, ou usar o plano B.

### QRE-P0-R2-02 · menor · `attachNonIdentical` chama `XCTestCase.add(_:)` fora do MainActor

**Evidência.** Em `Support.swift`, `attachNonIdentical` é uma função livre, sem isolamento, que chama `test.add(a)`. Antes, essa chamada ficava num método de classe `@MainActor`. Em tempo de execução está certo, porque todos os chamadores rodam na main. Mas, se o SDK do XCTest isolar `add(_:)` no MainActor, a compilação dá aviso ou erro de isolamento.

**Correção.** Marcar `attachNonIdentical` com `@MainActor`, como já está o `emit`.

### QRE-P0-R2-03 · menor · O oráculo regenerado de P16 não é conferido contra a fixture

**Evidência.** `lab/diff-answer.mjs` regenera a resposta de P16 rodando a fixture no motor nativo, mas não confere `L.digestOf(oracle)` contra `fx.expected[step].answer` antes de comparar. O replay é determinístico, pela R2 e pelo oráculo, então o risco é baixo. Ainda assim, um ambiente de laboratório diferente produziria um "oráculo" sem aviso.

**Correção.** Quando os digests diferirem, sair com código 2 antes do diff.

**Observação, não achado.** O pico da vida do processo inclui as classes de teste anteriores no mesmo processo (ColdStart e Equivalence). Com `answer:true`, isso soma cerca de 18 MB de respostas (R7). O efeito é pequeno diante dos 350 MB e só erra para cima, como o relatório diz. Se o orçamento de pico reprovar por pouco, rodar `-only-testing:P0HostTests/PerformanceTests` antes de concluir.

## 4. Encerramento

Esta revisão vale para `5de68a7` e para o bundle `ad4d3fde…`. A P0 física continua PENDENTE e a decisão sobre o JavaScriptCore continua INCONCLUSIVA até rodar o `RUN.md` §2 no aparelho de entrada. Nenhum gate fica resolvido por esta revisão.
