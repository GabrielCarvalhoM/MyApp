# QRE P0 R1: CoachingCore no JavaScriptCore (candidato `b04e79c`)

**Juiz:** Quality & Reliability Engineer, instância independente (worker != judge). **Data:** 2026-11-17.
**Escopo:** `audits/v1-aif-p0-jsc-2026-11-17/` em `b04e79c`, bundle SHA-256 `cd79afe8…a8504e5`. A AIF não foi revista.
**Ambiente:** Windows 11, Node 24.19.0, ICU 78.3, TZ America/Sao_Paulo, locale pt-BR. Não há Mac, Xcode, Swift nem iPhone. O Swift foi **lido, não compilado**.
**Não fiz:** correções, commit, push, `npm run verify`, edição de `CoachingCore/` ou de freezes. Só gravei este arquivo e sondas descartáveis no scratchpad da sessão.

## Veredito: **NOT_READY**

O bloqueio é um só e se corrige no Windows: QRE-P0-01. O linker publica, para um nome exportado, um binding que não é o do ESM, e a equivalência de laboratório não tem como ver isso. Hoje nenhuma resposta das jornadas muda. O defeito, porém, está no bundle que iria para o aparelho, e corrigi-lo troca o SHA. Rodar no aparelho antes da correção gastaria uma execução cara num bundle que já seria substituído.

Depois de corrigir a QRE-P0-01, regerar o bundle, incluir o gate de superfície de exports e repetir `link`, `oracle` e `replay-vm`, o estado esperado é **READY_FOR_DEVICE_RUN_WITH_CONDITIONS**. As condições são QRE-P0-02 a QRE-P0-08. Das que mudam o que o aparelho mede (02, 05, 06, 07 e 08), o ideal é aplicar antes da execução.

Duas afirmações do `P0_REPORT.md` foram contraditas pela reprodução. Isso aciona o `escalate_if` do despacho:
- §3: os exports seriam "conferidos contra a semântica real do ESM". Os nomes são; os bindings não (QRE-P0-01).
- §4.2 e §8.5: o aparelho "mostra" o efeito do `localeCompare` se rodar em pt-BR e em en-US. Só que J5 e P16 fazem zero chamadas de `localeCompare` (QRE-P0-04).

## 1. O que reproduzi

| # | Comando / sonda | Resultado |
|---|---|---|
| R1 | `node audits/v1-aif-p0-jsc-2026-11-17/build/link.mjs` | `linked 40 modules, 743 statements, 16 import.meta.url; bundle 1425092 B sha256 cd79afe8a105f978…; assets 16 (749989 B)`. É o SHA de `build-manifest.json`. `git status` continuou limpo |
| R2 | `node audits/v1-aif-p0-jsc-2026-11-17/lab/oracle.mjs` | J5: 5 passos, estados PROPOSED, KEEP ×3, CLINICAL_HUMAN_REQUIRED, envelope final `acc6fab3…`. P16: 33 passos e 95 linhas. `replayFromFixture: true` nos dois. **`git diff` vazio** |
| R3 | `node audits/v1-aif-p0-jsc-2026-11-17/lab/replay-vm.mjs` | Com JIT e com `--jitless`: J5 true, P16 true (0 falhas), restauração 4:true e 16:true, 0 ausentes, 0 recusas. ULP: pow 8108, exp 364, log 0; só `runForecast` mudou; `sansForecast` e `forecastCoarse` iguais em todos os passos. Booleanos e bloco `ulp` **idênticos** ao commit (comparação sem tempos). Os tempos não valem: rodei sondas ao mesmo tempo. Depois restaurei `results/lab-vm.json` com `git checkout --`, e a árvore voltou a ficar limpa |
| R4 | Sonda `exports`: cada namespace de módulo do bundle (`__req(id)` exposto numa cópia instrumentada) contra o `import()` nativo do Node, comparando chaves, ordem, `typeof`, código-fonte das funções e valores | 40 módulos e 684 nomes. Chaves e ordem iguais em todos. **3 bindings errados:** `admitted` em `v1-run-forecast-index.mjs` e em `v1-strength-index.mjs` lança `ReferenceError: admitted is not defined`, e por isso enumerar `S` em `harness/lib.mjs` também lança. Há 14 diferenças só de forma: as constantes `*_URL`, porque o shim de URL tem propriedades próprias (QRE-P0-11). Todas as outras funções exportadas têm fonte idêntica, ou seja, o linker não alterou corpo de função |
| R5 | Uso de shims e APIs em J5 e P16 (contadores dentro do contexto) | Shim `structuredClone` chamado 4.100 vezes em J5 e 45.982 em P16, só com objetos simples e arrays: 0 `Date`, 0 `Map`, 0 `Set`, 0 buracos, 0 protótipo nulo. Shim `URL` chamado 24 e 80 vezes. **`localeCompare`: 0. `toSorted`: 0.** `Date.parse`: 717.681. `new Date(string)`: 50. Comparador de `sort`: 106.300 chamadas. `pow` 8.108, `exp` 364, `log` 0 |
| R6 | Sensibilidade com o bundle no `node:vm` | Trocar o `localeCompare` por ordem de código, por `da` ou por `tr` não muda nada (nunca é chamado). Uma ordenação estável alternativa, merge sort de baixo para cima, deixa J5 e P16 idênticos, então os comparadores são consistentes nos dados exercitados. Toda data parseada é ISO estrita com offset ou só data: 0 formatos fora do padrão, 0 horas locais sem offset. `TZ=UTC`: idêntico. Outros fusos não foram aplicados pelo Node no Windows, então não afirmo nada sobre eles |
| R7 | Ponte na revisão fixa (passo 32, 95 linhas) | 1.934 `sha256` sobre 4.702.839 caracteres, 4 `readAsset`, 4 `existsAsset`, envelope de 1.098.000 caracteres. Confirma o §5.2 (23 ms de hash nativo aqui, contra os 28 ms do relatório) |
| R8 | `node --jitless --stack-size=150` sobre J5 e P16 | Idêntico. A recursão do motor cabe em 150 KB no interpretador do V8, um indício de folga para a pilha de 512 KB das threads do GCD no JSC. Não é prova |
| R9 | Fins de linha e BOM | `.gitattributes` tem `* -text`; índice e cópia de trabalho têm os mesmos bytes; nenhum asset tem BOM. Um clone no Mac reproduz os hashes do manifesto |
| R10 | Escopo: `git diff --name-only 0f3d0a1 b04e79c` | Os 41 arquivos estão dentro da pasta da missão. Nada em `CoachingCore/`, nos freezes ou na AIF. Sem UI, sem HealthKit, sem rede, sem infraestrutura de turnos |

## 2. Achados

### QRE-P0-01 · bloqueante · O linker liga um nome de `export *` a qualquer `const` ou função de mesmo nome no arquivo

**Evidência.**
- `build/link.mjs:105`: `local(n)` testa uma regex contra o arquivo inteiro. Ela casa `const …n=` em qualquer profundidade, exportado ou não.
- `build/link.mjs:109`: quando `local(n)` é verdadeiro, o nome deixa de ir para o `export *`.
- O ESM manda o contrário: um binding local que não foi exportado nunca esconde um nome que vem por `export *`.
- Em `CoachingCore/src/v1-run-forecast-index.mjs:45` há `export * from './v1-run-format-index.mjs'`, que exporta `function admitted` (`v1-run-format-index.mjs:180`).
- A linha 332 do mesmo arquivo tem um `admitted=` local, dentro de uma função. O resultado é o getter `"admitted": … get: () => admitted` no bundle, linha 11710, que lança `ReferenceError` (R4).
- O defeito se propaga para `v1-strength-index.mjs`, que faz `export *` do índice acima, e daí para `L.S`, que vem de `import * as S` em `harness/lib.mjs:10`. Ler `S.admitted`, ou fazer `Object.keys(S)`, `{...S}` ou `JSON.stringify(S)`, lança no bundle e funciona no Node.

**Por que a equivalência não vê.**
- J5 e P16 nunca leem esse nome. A busca no código não acha nenhum acesso hoje.
- Se um caminho futuro, ou não exercitado, chegar a ele durante uma revisão, o `catch` genérico de `r6-adaptation.mjs:695` transforma o `ReferenceError` numa resposta HOLD plausível ("Malformed review facts: admitted is not defined"), não num crash.

**Correção.**
1. Em `transform()`, tratar um nome como local só quando o módulo o declara por `export function` ou `export const` (inclusive `const` com vários declaradores) ou por `export {…}`. Qualquer outro nome de `m.names` sem getter explícito vem do `export *`. Retirar a regex `local()`.
2. Pôr em `lab/replay-vm.mjs` um gate de superfície de exports, igual à sonda R4. O gate falha em qualquer diferença de chave, `typeof`, fonte de função ou valor, exceto a forma de URL documentada.
3. Regerar o bundle (SHA novo) e repetir R1 a R3 e o gate.

### QRE-P0-02 · condição · "Recusa em voz alta" do prelude vira resposta válida no motor

**Evidência.**
- O prelude recusa com `throw` (`prelude.js:48`, `:68`, `:83`, `:86`, `:87`; o shim de URL lança `TypeError` em `:17`, `:19`, `:25`).
- O motor captura exceções e devolve resposta:
  - `r6-adaptation.mjs:695` captura **qualquer** exceção da revisão e responde HOLD com `e.message`;
  - `r6-legacy.mjs:143` e `:332`, além de `r5-program.mjs:37` e `r5-adaptation.mjs:34`, capturam `TypeError` e respondem "Malformed …".
- Então uma recusa do shim, um `TypeError` de API ausente ou um `RangeError` de pilha viram resposta. O sinal "alto" fica só em `__p0.unsupported` e `__p0.misses`.
- No aparelho, `testHostContract` (`EquivalenceTests.swift:66-76`) confere esses contadores só depois de J5. P16 e o runtime restaurado não são conferidos.

**Correção.**
- Conferir `hostCalls` (`unsupported` e `misses` vazios) ao fim de `testP16Journey` e de cada runtime `b` de `testRestoreContinuity`.
- No §3 do relatório, dizer que "em voz alta" significa contador, não falha da chamada.
- Registrar como requisito de integração que o host confira os contadores depois de cada chamada.

### QRE-P0-03 · condição · Texto de erro do engine dentro das respostas

**Evidência.** `r6-adaptation.mjs:695` grava `'Malformed review facts: '+e.message` e `e.constructor.name`. `r6-legacy.mjs:143` e `:332` gravam a `message` de `TypeError` nativo. V8 e JavaScriptCore escrevem essas mensagens de forma diferente. Nesses caminhos, uma resposta do JSC nunca é idêntica à do oráculo Node. E uma HOLD gravada no aparelho não se reproduz numa auditoria em Node. Nem J5 nem P16 exercitam esses caminhos, e o §4.2 não os cita.

**Correção.**
- Na P0, sem editar o motor: listar o caso em "o que a equivalência não cobre" no §4.2.
- Opcional: um passo com fatos malformados numa fixture, para observar no aparelho.
- Fora da P0: o conserto é no motor, num freeze sucessor, por decisão do owner.

### QRE-P0-04 · condição · `localeCompare` e `toSorted` nunca rodam nas jornadas

**Evidência.**
- R5: zero chamadas de cada um em J5 e P16.
- A recomendação "rodar em pt-BR e en-US" (§4.2, §8.5, `P0_REPORT.md:115-117` e `:211`) não testa nada.
- O piso de iOS 16.0 vem de `r5-contract.mjs:25`, um caminho que as jornadas não exercitam. Abaixo do iOS 16, o `TypeError` desse caminho pode ser capturado pelos `catch` de `TypeError` (QRE-P0-02) e virar resposta. Portanto o `.iOS(.v16)` de `Package.swift:9` sustenta o resultado e precisa ficar.

**Correção.**
- Corrigir o §4.2 e o §8.5.
- Duas saídas possíveis:
  - pôr numa fixture passos que exercitem as ordenações com `localeCompare` (`r5-learning`, `r5-schedule`, `r4-candidates` e `r6-program:960`, onde estiverem no grafo) e as janelas de disponibilidade de `r5-contract`, e só então rodar com dois idiomas no aparelho;
  - registrar a lacuna com owner.

### QRE-P0-05 · condição · EXPLAINED_LIBM localiza a diferença, mas não prova a causa

**Evidência.**
- `build/compare.mjs:9-13` apaga `hash` e `inputDigest` do `runForecast` e arredonda **todo** número não inteiro do bloco para 9 algarismos, não só `unrounded` como diz o §4.2.
- `Support.swift:34-38` classifica como EXPLAINED_LIBM qualquer diferença restrita ao `runForecast` e abaixo de 9 algarismos, venha ela da libm, da ordem de uma soma ou de uma seleção diferente de entradas que só aparece nos hashes. O `**` com expoente não inteiro (bundle, linhas 11362-11363) também não foi perturbado no laboratório.
- O veredito vai para decisão, o que mitiga o risco. Mas só J5 anexa a resposta inteira (`EquivalenceTests.swift:20-24`). Em P16 e na restauração, um EXPLAINED_LIBM não deixa prova campo a campo, e `diff-answer.mjs` só lê J5.

**Correção.**
- Em todo passo não IDENTICAL de J5, P16 ou restauração, anexar resposta e envelope.
- O `diff-answer` (estendido a P16, regerando a resposta do oráculo sob demanda) só aceita EXPLAINED_LIBM se toda folha diferente for numérica, estiver dentro de `runForecast` e tiver diferença relativa de até cerca de 1e-12. Fora disso, o veredito é DIVERGED.
- No relatório, descrever o veredito como localização, não como causa.

### QRE-P0-06 · condição · Memória "estável depois de GC" e cobertura do pico

**Evidência.**
- "Estável" (`PerformanceTests.swift:52` e `:68`):
  - `collectGarbage()` (`CoachingCoreRuntime.swift:143-146`) chama `JSGarbageCollect`;
  - no código público atual do WebKit (`JSBase.cpp`), essa função só chama `reportAbandonedObjectGraph`, um aviso ao GC, e não faz coleta completa síncrona;
  - o `phys_footprint` cai devagar, conforme o alocador devolve páginas;
  - o "estável" medido erra para cima: pode reprovar à toa, nunca aprovar à toa. Mas o nome promete o que não mede.
- Pico (`PerformanceTests.swift:69`):
  - o orçamento só amostra a jornada e os 30 ciclos;
  - ficam de fora a carga, a ponte (o envelope de 1,1 MB indo e voltando) e a gravação atômica;
  - o `processLifetimePeak` é registrado, mas não entra em orçamento.

**Correção.**
- Medir "estável" depois de ociosidade: liberar os outros runtimes, esperar alguns segundos e tomar o mínimo de 1 s de amostras. Mudar o rótulo.
- Manter o amostrador ligado durante todo o `testP0Measurements`, ou orçar contra o pico vitalício de uma execução `-only-testing:P0HostTests/PerformanceTests`.
- Conferir no Allocations e no VM Tracker (`RUN.md` §2.6).

### QRE-P0-07 · condição · Cobertura dos orçamentos da PF-0 §3

**Evidência.**
- **Carga:**
  - o XCTest roda as classes em ordem alfabética (ColdStart, depois Equivalence, depois Performance);
  - as 10 cargas de `testP0Measurements` (`:20-25`) acontecem num processo já quente;
  - as amostras frias (`RUN.md` §2.5) não entram em nenhum orçamento, e o `RUN.md:57-59` aprova só pelas linhas `budgets`;
  - a PF-0 (`PERFORMANCE_FOUNDATION.md:62`) não diz "quente".
- **Persistência:** a linha da PF-0 (`:66`, gravação atômica ≤ 50 ms p95) é medida (`atomicWriteMs`) e não é orçada.
- **Thread principal:** a sonda só exige `gapOffMain < gapControl` (`:90`), sem limite absoluto, embora a PF-0 §1.2 peça "Hangs em zero".

**Correção.**
- Carga: p95 sobre as amostras frias, ou PerformanceTests rodado sozinho e primeiro.
- Persistência: uma linha de orçamento para a gravação atômica.
- Thread principal: um limite absoluto na sonda, por exemplo `gapOffMain` abaixo de 250 ms, o limiar de "hang", e o valor registrado contra 2 quadros.
- Nenhuma meta é afrouxada; confirmo que as cinco linhas atuais usam os valores da PF-0 sem ajuste.

### QRE-P0-08 · condição · Caminho de execução no aparelho não verificado

**Evidência.**
- `RUN.md:25` manda escolher o Team em "Signing" do esquema `P0Host`. Pacote Swift aberto no Xcode não tem editor de assinatura; só existe o override `DEVELOPMENT_TEAM=` de `:37`.
- Teste de pacote em aparelho físico, em Release, depende de o host de teste sintetizado assinar e abrir. Isso nunca foi tentado e não há plano B descrito.
- O `RUN.md` também não manda desligar "Debug executable" nem registrar se havia depurador anexado. Tempos medidos sob depurador não representam o app.

**Correção.**
- Tirar o passo de interface.
- Documentar o plano B: um projeto Xcode mínimo com app host, com as mesmas fontes, recursos e testes.
- Registrar no `P0RESULT` se havia depurador anexado.

### QRE-P0-09 · menor · Leitura do Swift sem compilador

Não achei erro de compilação provável. Os pontos pedidos parecem corretos:
- `@convention(block) (String) -> String?`: o `nil` chega ao JS como `undefined`, e o prelude trata em `prelude.js:73`;
- `(String) -> Bool` e `() -> Double`;
- `unsafeBitCast(…, to: AnyObject.self)` e `JSValue(newObjectIn:)`;
- `invokeMethod` e `exceptionHandler` com tipos IUO;
- `Bundle.module` com `.copy("Resources")` e `.copy("Fixtures")`, incluindo `subdirectory: "Fixtures"`;
- `task_vm_info_data_t.phys_footprint` e `ledger_phys_footprint_peak`;
- `OSSignposter(subsystem:category: .pointsOfInterest)` e `JSGarbageCollect(jsGlobalContextRef)`;
- os decodificadores `Reply` e `Fixture`, conferidos contra a saída real da fachada.

Avisos prováveis, nenhum obrigatório antes do aparelho:
- `@MainActor` em subclasses de `XCTestCase`: aviso no modo Swift 5, erro só no modo Swift 6. As tools 5.9 mantêm o modo 5;
- captura não `Sendable` no `queue.async` de `run` e o `static let signposter`: avisos com compilador Swift 6;
- `replaySteps` (`Support.swift:45-51`) não fecha o intervalo de signpost quando `call` lança; usar `defer`;
- `testTamperedAssetRefused` prova só a segunda conferência, depois do gancho. A primeira, sobre os bytes do arquivo, fica sem teste.

### QRE-P0-10 · menor · Afirmações de desempenho sem artefato

**Evidência.**
- O perfil do §5.1 (`P0_REPORT.md:134-139`: `canonical()` com 50 %, `structuredClone` com 13 %, cópia do prelude com 18 %, "1,6× confirmado por perfil") não tem perfil nem comando em `results/`.
- "O bundle custa o mesmo": nos números commitados, a revisão com 60 linhas ou mais tem mediana 13 % maior no bundle (322 ms contra 286 ms do nativo). É imaterial, mas não é "o mesmo".
- O gzip reproduzido no nível padrão dá 444.716 B, não 442.853 B.
- Nenhum número do relatório se lê como número de iPhone: todos estão rotulados como laboratório.

**Correção.** Guardar o perfil (`--cpu-prof`) e o comando, ou rebaixar a frase a observação, e trocar "o mesmo" por "sem custo material, até cerca de 13 % na mediana de histórico longo".

### QRE-P0-11 · menor · O shim de URL tem forma diferente do URL real

**Evidência.** `prelude.js:26` cria `href`, `protocol` e `pathname` como propriedades próprias e enumeráveis. O URL do WHATWG não tem nenhuma. As 14 constantes `*_URL` exportadas diferem na forma (R4). Nada disso chega às respostas de J5 e P16. Mas um URL canonizado, espalhado ou hasheado daria resultado diferente do nativo.

**Correção.** Mover os campos para getters no protótipo, ou documentar a diferença no prelude.

## 3. Itens conferidos sem achado

- **`structuredClone`:** fidelidade suficiente para os dados exercitados (R5). Os ramos de `Date`, `Map`, `Set`, buracos e protótipo nulo nunca rodam. Tipos fora da lista são recusados, com o efeito descrito na QRE-P0-02.
- **Ligação de imports por valor:** correta sem ciclos. `export let` e `var` não existem no grafo (busca), e os ciclos são recusados.
- **Ordem de avaliação, hoisting, `this` e modo estrito:** equivalentes. Os módulos ficam em funções `'use strict'` chamadas com `this` indefinido, e as dependências avaliam antes do corpo, na ordem das declarações.
- **Ordem do namespace:** igual em todos os 40 módulos (R4).
- **`import.meta.url`:** o novo caminho não aparece em nenhuma resposta (as jornadas são idênticas, e um caminho absoluto de máquina apareceria).
- **Fixtures e oráculo:**
  - 33 de 33 digests distintos em P16;
  - os digests reagem a 1 ULP (R3);
  - os shims são exercitados (R5);
  - o oráculo é Node nativo, independente do linker e do prelude.

  Não encontrei caminho para um "idêntico" falso nas jornadas.
- **Datas e fuso:** nenhum parse dependente do engine nem de hora local nas jornadas (R6).
- **Orçamentos:** os valores da PF-0 são usados sem afrouxar. As estatísticas são nearest-rank, coerentes com o `perf.mjs` da AIF; com n = 10, o p95 é o máximo.
- **CPU da thread:** lida antes e depois dentro do mesmo bloco da fila, portanto na mesma thread.
- **Sonda de thread principal:** o controle via `queue.sync` roda de fato bloqueando a main.
- **Escopo e honestidade:** P0 física PENDENTE e decisão INCONCLUSIVA estão corretas. A lista de bloqueios do §8 é honesta, com a ressalva da QRE-P0-04, e nenhum gate é declarado resolvido.

## 4. Próxima ação

1. O autor corrige a QRE-P0-01 e põe o gate de exports.
2. O autor regera o bundle e repete R1 a R3.
3. O autor aplica 02, 05, 06, 07 e 08 antes da execução no aparelho.
4. 03, 04 (texto do relatório), 09, 10 e 11 podem vir junto ou ficar registrados com owner.

Esta revisão vale só para `b04e79c` e o bundle `cd79afe8…`; um bundle novo pede reavaliação da parte que mudou.
