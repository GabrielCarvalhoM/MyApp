# P0: CoachingCore no JavaScriptCore (iOS)

**Data:** 2026-11-17. **Branch:** `claude/v1-aif-p0-jsc`, a partir de `0f3d0a1` (AIF). Nada foi enviado nem mesclado.
**Fontes lidas:** ADR AIF-1, `APP_DATA_CONTRACTS.md`, `PERFORMANCE_FOUNDATION.md`, `INTEGRATION_READINESS_REPORT.md`, `harness/` (inclusive `portable/`), `results/`, `reviews/qre/QRE_AIF_R1.md`, todos em `audits/v1-app-integration-foundation-2026-11-16/`. Os freezes não foram editados. Só dados sintéticos.

## 0. Resultado em uma linha

**A prova física (P0 no aparelho) está PENDENTE, e a decisão sobre o JavaScriptCore está INCONCLUSIVA.**

- O que impede é o ambiente, não uma falha técnica: esta sessão roda em Windows, sem Mac, sem Xcode, sem Swift e sem iPhone.
- Tudo o que dá para provar fora do aparelho está provado e é reproduzível. Não há nenhum número de iPhone neste documento.
- O alvo iOS mínimo está pronto, **mas nunca foi compilado**. Ele mede as linhas "Motor" e "Memória" da Performance Foundation contra as metas sem afrouxá-las. Ver `RUN.md` §2.

## 1. Ambiente inspecionado

| Item | Encontrado |
|---|---|
| Sistema | Windows 11 Pro 10.0.26200, AMD Ryzen 7 5700X, Node 24.19.0 |
| Xcode, `xcodebuild`, `xcrun`, Swift, SDK iOS | **ausentes** (não há Mac) |
| iPhone físico ou simulador | **nenhum** |
| Host remoto com Xcode | nenhum configurado (`~/.ssh` sem hosts) |
| Engine JavaScriptCore local | nenhum. A instalação do esbuild (bundler) e do Bun (build do JavaScriptCore para Windows) pelo npm foi **recusada pelo controle de permissões da sessão**. Não tentei outro caminho de download |

**Consequência:** não houve execução em JavaScriptCore de verdade nem medição de aparelho. A equivalência de laboratório roda em V8, num contexto nu que tem só os quatro serviços do host. Ela prova o empacotamento e o contrato do host; não prova o engine da Apple.

## 2. O que foi entregue

| Entrega | Onde |
|---|---|
| Linker de build: o grafo ESM vira um único script clássico para `JSContext.evaluateScript`, sem carregador de módulos em runtime | `build/link.mjs`, `build/prelude.js`, `build/entry.mjs`, `build/compare.mjs` |
| Bundle, assets e manifestos (SHA-256) | `ios/Sources/P0Host/Resources/` |
| Alvo iOS mínimo: pacote Swift com biblioteca e testes, sem app e sem tela | `ios/Package.swift`, `ios/Sources/P0Host/*.swift`, `ios/Tests/P0HostTests/*.swift` |
| Oráculo Node e fixtures J5/P16 (entradas exatas e digests esperados) | `lab/oracle.mjs`, `ios/Tests/P0HostTests/Fixtures/` |
| Equivalência, restauração, sensibilidade a ULP e tempos de laboratório | `lab/replay-vm.mjs`, `results/lab-vm.json` |
| Piso de iOS do bundle | `lab/api-floor.mjs`, `results/api-floor.json` |
| Veredito de uma execução no aparelho (orçamentos, amostras frias, validade do ambiente) e diff campo a campo | `lab/device-budgets.mjs`, `lab/diff-answer.mjs` |
| Instruções de reprodução (laboratório e aparelho) | `RUN.md` |
| Mudança futura de contrato (turnos AM/PM) | `FUTURE_CONTRACT_CHANGE_DAY_AVAILABILITY.md` |

## 3. Carregamento do motor

**Grafo resolvido no build.**
- 40 módulos: os 36 do motor, mais o cliente da AIF, `views.mjs`, a fachada e `compare.mjs`.
- 743 declarações `import`/`export` reescritas no lugar, sem mudar a contagem de linhas, e 16 `import.meta.url` trocados pela URL virtual `file:///p0/<caminho>`.
- Os nomes exportados e a origem de cada binding vêm do namespace real de cada módulo no Node. Ciclos são recusados, e não há nenhum.
- O texto das fontes não muda de nenhuma outra forma.

**Correção depois da revisão (QRE-P0-01).** Na primeira versão (`cd79afe8…`), um nome que chegava por `export *` era ligado a qualquer `const` de mesmo nome no arquivo. Por isso, `admitted` em `v1-run-forecast-index` e `v1-strength-index` lançava `ReferenceError` no bundle. Ler `L.S` inteiro também lançava. Nenhuma das jornadas lê esse nome; por isso a equivalência não acusou.
- **Agora:** a origem do binding vem da identidade dos valores nos namespaces do Node.
- **Gate de exports:** a cada build, os 684 bindings dos 40 módulos são conferidos contra o Node. Nomes, ordem, leitura, tipo, nome e aridade de função e valor JSON precisam bater; senão, o build falha.
- **Prova de que o gate funciona:** um linker mutante, com o defeito antigo de volta, foi recusado pelo gate nos três bindings afetados.

**Resultado do build.**
- Bundle de 1.425.100 B, SHA-256 `ad4d3fdefcab552dcee81016823e10e88053ee31a21f67d2e07f69250f7c1f84`, gravado em `build-manifest.json` com o resultado do gate.

**16 assets, não 20.**
- A AIF contou 20 porque o preload dela varria todos os arquivos de `src/`.
- O grafo do ponto de entrada lê 16, 749.989 B. Os registros r3/r4 não são lidos.
- Zero assets ausentes na execução.

**O que o JSContext não tem.** Tudo abaixo é resolvido no escopo do bundle, nunca no global, em `build/prelude.js`:

| Falta no JSContext | Como foi resolvido |
|---|---|
| Carregador ESM | Linker no build |
| `URL` | Só a forma `new URL(relativo, base file:)` |
| `structuredClone` | Cópia profunda para dados JSON, `Date`, `Map` e `Set`. Qualquer outro tipo é recusado e contado. Nas jornadas, só passam objetos simples e arrays (QRE R5) |
| `performance.now` | Função `now` do host |
| `Buffer.byteLength` | Usado só nas medições de tamanho do cliente; desligado por padrão |
| `console` | O bundle não usa |

**Host (Swift).** São quatro funções:
- `readAsset` e `existsAsset`, sobre os assets empacotados;
- `sha256`, com CryptoKit;
- `now`, só para medir tempo.

O motor não lê o relógio: a data vem de `asOf`, na entrada. O `Date.now()` de `v1-f08.mjs:268` só seria usado se `asOf` faltasse, e todas as entradas trazem `asOf`.

**"Recusa" quer dizer contador, não falha da chamada (QRE-P0-02).** O motor captura exceções e as devolve como resposta: HOLD ou "Malformed…" (`r6-adaptation.mjs:695`, `r6-legacy.mjs:143`). Por isso, uma recusa do prelude, um asset ausente ou uma API que falta podem virar uma resposta comum. O sinal confiável são os contadores `misses` e `unsupported`. Cada execução de equivalência, inclusive a P16 e os runtimes restaurados, precisa terminar com os dois vazios.

**Verificação dos assets.**
- Cada asset é conferido contra o SHA-256 do manifesto antes de o motor existir.
- Um asset alterado é recusado; o teste `testTamperedAssetRefused` cobre isso.
- O motor ainda faz as próprias conferências de hash do catálogo e dos registros.
- Não há código remoto nem atualização em runtime, e nenhuma regra esportiva foi escrita em Swift.

## 4. Equivalência

### 4.1 Laboratório: V8, contexto `node:vm` nu, o mesmo bundle

| Verificação | JIT | Só interpretador |
|---|---|---|
| J5: as 5 respostas de referência do ADR (PROPOSED, KEEP ×3, CLINICAL_HUMAN_REQUIRED) | 5/5 idênticas | 5/5 |
| P16: plano de 16 semanas, 33 chamadas, registro com 95 linhas | 33/33 idênticas | 33/33 |
| Restauração: exportar, novo contexto, restaurar, continuar (J5 no passo 4; P16 no passo 16) | idêntica | idêntica |
| Contrato do host | 0 ausentes, 0 recusas | idem |

- "Idêntica" quer dizer: o digest canônico da resposta, o do envelope e o status iguais aos do oráculo Node nativo (`lab/oracle.mjs`).
- O oráculo regrava as fixtures a partir de JSON e reproduz os próprios digests, então as fixtures não perdem nada que o motor leia.
- As entradas ficam guardadas como o texto JSON exato que o host passa pela ponte. O Swift nunca as reserializa, o que mantém a ordem das chaves.
- Os digests não mudaram entre as reconstruções do bundle, inclusive depois da correção QRE-P0-01: envelope final de J5 `acc6fab3…`, de P16 `c59f2444…`. A revisão independente reproduziu tudo isso: `link`, `oracle` com `git diff` vazio e todos os resultados booleanos do `replay-vm`.

### 4.2 O risco real do JavaScriptCore: biblioteca matemática

Só o Race Forecast usa `Math.pow`, `Math.exp` e `Math.log`. O último bit desses resultados pode diferir entre V8 e JavaScriptCore.

**Teste de sensibilidade.** Em laboratório, empurrei em +1 ULP cada resultado: 8.108 chamadas de `pow` e 364 de `exp`. O efeito:
- Mudou **só `runForecast`**: `F_future`, `g_applied`, `unrounded.central` (na 16ª casa) e os próprios `hash` e `inputDigest`.
- Nenhum status mudou, nenhum outro campo da resposta, do registro ou do envelope.
- A previsão com 9 algarismos significativos ficou igual.

**Classificação no aparelho.** `build/compare.mjs` dá a cada passo um de três vereditos:
- **IDENTICAL:** tudo igual ao oráculo.
- **EXPLAINED_LIBM:** só a parte não arredondada da previsão difere; todo o resto está exato, e a previsão é igual com 9 algarismos.
- **DIVERGED:** qualquer outra diferença. Bloqueia.

**EXPLAINED_LIBM localiza a diferença; não prova a causa (QRE-P0-05).** O veredito diz que toda diferença cabe no `runForecast` e fica abaixo de 9 algarismos. Ele não diz por quê: pode ser a libm, a ordem de uma soma ou outra coisa.
- Cada passo que não sai IDENTICAL, de J5, de P16 ou da restauração, deixa a resposta inteira anexada.
- `lab/diff-answer.mjs` só confirma o veredito se toda folha diferente estiver no `runForecast` e for um dos hashes dele ou um número a até 1e-12 relativo do oráculo. Fora disso, o veredito é DIVERGED.

**EXPLAINED_LIBM não é aprovação automática.** O ADR §6 diz que falha de identidade é bloqueio. Se esse veredito aparecer no aparelho, ele vai para decisão, nunca para ajuste. As opções são:
- aceitar, porque é uma diferença de serialização abaixo de qualquer valor mostrado;
- arredondar antes de calcular o hash, num freeze sucessor.

**O que a equivalência não cobre:**
- **`**` com expoente não inteiro.** Exemplo: `(w0+w1)**-0.5`. Não dá para interceptar no laboratório; no aparelho entra na mesma classificação.
- **`localeCompare` e `toSorted` (QRE-P0-04).** J5 e P16 chamam cada um **zero vezes**. Rodar no aparelho em pt-BR e em en-US não testaria nada.
  - O efeito do idioma nas 7 ordenações com `localeCompare` segue **não testado**, e também as janelas de `r5-contract.mjs`, de onde vem o piso de iOS 16.
  - Para testar, é preciso uma fixture que exercite esses caminhos.
  - Até lá, é uma lacuna registrada. **Owner:** Engineering, com o SSCTR se a fixture exigir um cenário esportivo novo.
  - O `.iOS(.v16)` do `Package.swift` precisa ficar. Abaixo dele, o `TypeError` desse caminho poderia ser capturado pelo motor e virar resposta.
- **Texto de erro do engine nas respostas (QRE-P0-03).** Nos caminhos de fatos malformados, a resposta grava a `message` do erro nativo (`r6-adaptation.mjs:695`, `r6-legacy.mjs:143`/`:332`). O V8 e o JavaScriptCore escrevem essas mensagens de forma diferente. Nesses caminhos, uma resposta do aparelho nunca é idêntica à do Node, e uma HOLD gravada no aparelho não se reproduz numa auditoria em Node.
  - As jornadas não passam por aí.
  - A correção é no motor, num freeze sucessor, por decisão do owner. **Fora da P0.**

### 4.3 No aparelho: PENDENTE

`EquivalenceTests` (J5, P16, restauração com gravação atômica e proteção de arquivo, contrato do host, asset adulterado) roda os mesmos oráculos.

## 5. Desempenho

### 5.1 Laboratório (Ryzen 7 5700X, V8 `--jitless`; não é JavaScriptCore nem iPhone)

Números de `results/lab-vm.json`, bundle `ad4d3fde…`, uma execução (n = 32 revisões, 13 com 60 linhas ou mais, onde o p95 é o máximo). Variam alguns por cento entre execuções:

| P16, mesmas entradas | Carga | Primeiro plano | Revisão, mediana / p95 | Revisão com 60 linhas ou mais, mediana / p95 |
|---|---|---|---|---|
| ESM nativo (Node `fs` e `crypto`, `structuredClone` nativo) | 93 ms | 143 ms | 263 / 409 ms | 332 / 428 ms |
| **Bundle P0**, contexto principal | 64 ms | 134 ms | 265 / 398 ms | 334 / 417 ms |
| Bundle P0 em contexto `node:vm` | 67 ms | 186 ms | 474 / 721 ms | 567 / 736 ms |

O que a tabela mostra:
- **O bundle fica perto do motor nativo no V8 sem JIT** (QRE-P0-10):
  - nesta execução, a mediana ficou igual e o histórico longo ficou dentro de 1 %;
  - na execução anterior, o histórico longo saiu cerca de 13 % acima;
  - não há sobrecusto grande do linker nem do prelude, mas a diferença fina não foi resolvida com essas amostras.
- **A lentidão de cerca de 1,7× no `vm` é artefato do V8:** a busca de globais pelo interceptor do contexto. O `canonical()` dobra de custo lá.
  - O perfil (`node --jitless --cpu-prof lab/replay-vm.mjs --child perf-bundle`, e o mesmo com `perf-native`) não foi commitado. É reproduzível com esses dois comandos.
- **Perfil do motor.**
  - `canonical()`, de `value.mjs`, tem cerca de 50 % da CPU.
  - O `structuredClone` nativo tem 13 %.
  - A cópia do prelude em JS interpretado tem cerca de 18 % do tempo do bundle em V8. **No JavaScriptCore sem JIT, esse custo não foi medido.**

### 5.2 Ponte (análise; o aparelho mede)

Uma revisão com o plano inteiro registrado (95 linhas) fez, no laboratório:
- **1.934 chamadas de `sha256`**, sobre **4,7 milhões de caracteres**. O hash nativo levou 28 ms no desktop.
- 4 `readAsset`, porque as políticas R5/R6 são relidas a cada chamada.

**É a maior travessia da ponte.**
- Cada chamada converte uma string JS para Swift e depois para UTF-8.
- Fora isso, só cruzam JSON pequenos: estado, hashes, tempos e projeções APP-VIEW-0.
- Exceções: o envelope (cerca de 1,1 MB) sai para a gravação atômica e volta na restauração.

O teste mede, em `bridge`:
- o custo por chamada de `sha256` em quatro tamanhos, separando o tempo visto pelo JS do tempo dentro do Swift;
- uma travessia vazia;
- o envelope nos dois sentidos, contra o mesmo trabalho feito só dentro do JS;
- as três projeções;
- a gravação atômica.

**Se o custo da ponte estourar a meta:**
- a única alavanca sem mexer no motor é a conversão de string no host;
- a alavanca grande é reduzir o hash repetido, que já está no ADR §8 e pede um freeze sucessor, decisão do Founder.

### 5.3 No aparelho: PENDENTE

`PerformanceTests.testP0Measurements` mede no aparelho:
- a criação do contexto e a carga do bundle, em 10 runtimes novos, por fase: assets e hash, VM, host, avaliação;
- o primeiro plano, frio e quente;
- a jornada P16 passo a passo: tempo de parede, CPU da thread e tempo do motor;
- a revisão fixa com o plano inteiro, 30 vezes;
- a memória: `phys_footprint` amostrado a cada 2 ms, o pico do processo e o valor depois de GC;
- a ponte;
- a thread principal: a maior pausa de um timer de 8 ms enquanto a revisão roda fora dela, contra o controle com a revisão na thread principal.

`ColdStartTests` mede o primeiro contexto de um processo novo, uma amostra por execução.

O resultado inclui o aparelho, a versão do iOS, a configuração, o estado térmico, o Modo de Pouco Consumo e se havia depurador anexado. Também compara com as metas da PF-0 §3, sem ajustá-las. `lab/device-budgets.mjs` dá o veredito (QRE-P0-06/07):

| Meta da PF-0 | Valor | Como é medida |
|---|---|---|
| Carga | ≤ 1,0 s p95 | **A frio**, sobre as 10 amostras de processo novo. A medida em processo quente também é registrada |
| Primeiro plano | ≤ 2,0 s p95 | A frio, sobre as mesmas amostras, e em contexto novo |
| Revisão com o plano inteiro | ≤ 1,5 s p95; pior caso ≤ 3 s | 30 repetições sobre o mesmo estado |
| Memória estável | ≤ 150 MB | Depois de um `JSGarbageCollect`, que é só uma dica ao GC. Erra para cima |
| Pico de memória | ≤ 350 MB | Pico da vida do processo: inclui a carga, a ponte, as gravações e o próprio harness. Erra para cima |
| Gravação atômica do envelope | ≤ 50 ms p95 | 10 gravações |
| Thread principal | maior pausa ≤ 100 ms enquanto a revisão roda fora dela | Derivada da meta de toque ≤ 100 ms e de "Hangs em zero" (PF-0 §1.2) |

Funcionamento offline:
- O host não tem rede e o JSContext não tem `fetch`.
- O `RUN.md` pede a execução em modo avião.

## 6. Compatibilidade

- **Piso do iOS do bundle sem modificação: 16.0.** O piso vem do `Array.prototype.toSorted`, usado uma vez, em `r5-contract.mjs`, para ordenar janelas de disponibilidade por `startMinute`. Vários recursos exigem 15.4: `at`, `findLast` e `Object.hasOwn`. É dado de entrada para a decisão D3. A varredura é por padrão de texto, um piso e não uma prova (`results/api-floor.json`).
- **JavaScriptCore sem JIT no app.** O laboratório só aproxima isso com `--jitless`. A razão entre um A13 e o desktop continua desconhecida.
- **WKWebView:** nenhuma incompatibilidade demonstrada pede essa alternativa. Pelo ADR, ela só entra se o aparelho estourar as metas. Nada foi construído em antecipação.
- **Não houve port para Swift nem backend.**

## 7. Decisão recomendada

**INCONCLUSIVO.** O JavaScriptCore não é aprovado nem reprovado.

- Nenhuma incompatibilidade técnica foi encontrada: o motor, empacotado, roda num contexto nu só com os quatro serviços do host e dá respostas idênticas.
- A viabilidade física e as metas continuam não medidas. Pela PF-0 §6: "sem medição, o estado é 'não medido', nunca 'aprovado'".
- Para fechar, basta executar o `RUN.md` §2 num Mac com o aparelho de entrada.

## 8. Próximos bloqueios de integração

1. **A P0 física.** Executar o `RUN.md` §2 no aparelho de entrada, em Release, e guardar os resultados em `results/device/`. Precisa de Mac e iPhone, recursos do Founder.
2. **Compilar o alvo Swift.** Ele nunca foi compilado; a primeira compilação pode pedir correções pequenas, que não mudam o que se mede.
3. **Bundler de produção.** Trocar o linker da P0 por um bundler padrão com versão fixa (esbuild). O gate de troca é esta mesma equivalência. A instalação foi recusada nesta sessão.
4. **Se aparecer EXPLAINED_LIBM.** Decidir a política (§4.2) antes de aprovar.
5. **Caminhos que a equivalência não exercita (QRE-P0-04).** Uma fixture que exercite o `localeCompare` e as janelas de `r5-contract.mjs`, e só então o teste em dois idiomas. **Owner:** Engineering.
6. **D3, versão mínima do iOS.** O piso medido do bundle é 16.0.
7. **Texto de erro do engine nas respostas (QRE-P0-03).** Correção num freeze sucessor, por decisão do owner.
8. **Forma do objeto `URL` do prelude (QRE-P0-11, menor).** O objeto tem `href`, `protocol` e `pathname` como propriedades próprias. Nenhuma resposta das jornadas serializa uma URL. Fica registrado para o bundler de produção, que traz a mesma questão.

**Continuam fora da P0, sem mudança:**
- QRE-AIF-01: vencimento da autoridade na rota de alerta;
- QRE-AIF-02: colisão de sessões depois de um reinício;
- E-1;
- QRE-RWS-F-01;
- custódia e integridade de dados;
- migração entre versões de plano;
- dados de saúde e backups;
- calibração externa do Race Forecast;
- revisão focal de segurança da integração;
- contrato de disponibilidade com múltiplos turnos.

**A P0 não resolve nenhum deles.** O último foi substituído pela decisão do Founder de planejar por dia, registrada em `FUTURE_CONTRACT_CHANGE_DAY_AVAILABILITY.md` e não implementada.

## 9. Verificação independente

**QRE R1 sobre `b04e79c`** (`reviews/qre/QRE_P0_R1.md`, recebida sem edição): NOT_READY, com um bloqueio (QRE-P0-01), sete condições (02–08) e três menores (09–11).

O único ciclo de correção aplicou:
- **01:** correção do linker e gate de exports;
- **02:** contadores do host conferidos ao fim de toda execução de equivalência;
- **03 e 04:** lacunas registradas no relatório, com owner;
- **05:** resposta anexada em todo passo não idêntico e regra de aceitação no `diff-answer`;
- **06 e 07:** orçamentos com o que cada um mede de fato, carga e primeiro plano julgados a frio, gravação atômica e thread principal orçadas;
- **08:** passo de interface removido do `RUN.md`, plano B documentado e `debuggerAttached` registrado;
- **09:** o signpost fecha mesmo quando a chamada lança;
- **10:** texto e números do §5.1;
- **11:** registrado no §8.

A rechecagem estreita do delta está em `reviews/qre/QRE_P0_R2.md`.
