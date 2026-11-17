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
| Instruções de reprodução (laboratório e aparelho) | `RUN.md` |
| Mudança futura de contrato (turnos AM/PM) | `FUTURE_CONTRACT_CHANGE_DAY_AVAILABILITY.md` |

## 3. Carregamento do motor

**Grafo resolvido no build.**
- 40 módulos: os 36 do motor, mais o cliente da AIF, `views.mjs`, a fachada e `compare.mjs`.
- 743 declarações `import`/`export` reescritas no lugar, sem mudar a contagem de linhas, e 16 `import.meta.url` trocados pela URL virtual `file:///p0/<caminho>`.
- Os nomes exportados vêm do namespace real de cada módulo no Node. Ciclos são recusados, e não há nenhum.
- O texto das fontes não muda de nenhuma outra forma.

**Resultado do build.**
- Bundle de 1.425.092 B (442.853 B com gzip), SHA-256 `cd79afe8a105f978dfeeb4871d61bbc29b22084d31e0547d5eb206907a8504e5`, gravado em `build-manifest.json`.

**16 assets, não 20.**
- A AIF contou 20 porque o preload dela varria todos os arquivos de `src/`.
- O grafo do ponto de entrada lê 16, 749.989 B. Os registros r3/r4 não são lidos.
- Zero assets ausentes na execução.

**O que o JSContext não tem.** Tudo abaixo é resolvido no escopo do bundle, nunca no global, em `build/prelude.js`:

| Falta no JSContext | Como foi resolvido |
|---|---|
| Carregador ESM | Linker no build |
| `URL` | Só a forma `new URL(relativo, base file:)` |
| `structuredClone` | Cópia profunda para dados JSON, `Date`, `Map` e `Set`. Qualquer outro tipo é recusado em voz alta |
| `performance.now` | Função `now` do host |
| `Buffer.byteLength` | Usado só nas medições de tamanho do cliente; desligado por padrão |
| `console` | O bundle não usa |

**Host (Swift).** São quatro funções:
- `readAsset` e `existsAsset`, sobre os assets empacotados;
- `sha256`, com CryptoKit;
- `now`, só para medir tempo.

O motor não lê o relógio: a data vem de `asOf`, na entrada. O `Date.now()` de `v1-f08.mjs:268` só seria usado se `asOf` faltasse, e todas as entradas trazem `asOf`.

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
- Os digests não mudaram entre as reconstruções do bundle: envelope final de J5 `acc6fab3…`, de P16 `c59f2444…`.

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

**EXPLAINED_LIBM não é aprovação automática.** O ADR §6 diz que falha de identidade é bloqueio. Se esse veredito aparecer no aparelho, ele vai para decisão, nunca para ajuste. As opções são:
- aceitar, porque é uma diferença de serialização abaixo de qualquer valor mostrado;
- arredondar antes de calcular o hash, num freeze sucessor.

**O que o teste de sensibilidade não cobre:**
- `**` com expoente não inteiro, por exemplo `(w0+w1)**-0.5`, que não dá para interceptar;
- `localeCompare` em 7 ordenações (ids ASCII; a ordem pode depender do idioma do aparelho).

O aparelho mostra os dois. Rodar a equivalência com a região em pt-BR e em en-US.

### 4.3 No aparelho: PENDENTE

`EquivalenceTests` (J5, P16, restauração com gravação atômica e proteção de arquivo, contrato do host, asset adulterado) roda os mesmos oráculos.

## 5. Desempenho

### 5.1 Laboratório (Ryzen 7 5700X, V8 `--jitless`; não é JavaScriptCore nem iPhone)

| P16, mesmas entradas | Carga | Primeiro plano | Revisão, mediana / p95 | Revisão com 60 linhas ou mais, mediana / p95 |
|---|---|---|---|---|
| ESM nativo (Node `fs` e `crypto`, `structuredClone` nativo) | 101 ms | 150 ms | 253 / 363 ms | 286 / 364 ms |
| **Bundle P0**, contexto principal | 63 ms | 143 ms | 248 / 366 ms | 322 / 416 ms |
| Bundle P0 em contexto `node:vm` | 71 ms | 198 ms | 422 / 604 ms | 529 / 619 ms |

O que a tabela mostra:
- **O bundle custa o mesmo que o motor nativo.** O linker e o prelude não trazem custo material.
- **A lentidão de 1,6× no `vm` é artefato do V8:** a busca de globais pelo interceptor do contexto. Isso foi confirmado por perfil, porque o `canonical()` dobra de custo lá.
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

O resultado inclui o aparelho, a versão do iOS, a configuração, o estado térmico e o Modo de Pouco Consumo. Também compara com as metas da PF-0 §3, sem ajustá-las:

| Meta da PF-0 | Valor |
|---|---|
| Carga | ≤ 1,0 s p95 |
| Primeiro plano | ≤ 2,0 s p95 |
| Revisão com o plano inteiro | ≤ 1,5 s p95; pior caso ≤ 3 s |
| Memória estável | ≤ 150 MB |
| Pico de memória | ≤ 350 MB |

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
5. **Idioma do aparelho.** Rodar a equivalência com a região em pt-BR e em en-US, por causa do `localeCompare`.
6. **D3, versão mínima do iOS.** O piso medido do bundle é 16.0.

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

Ver `reviews/qre/QRE_P0_R1.md`.
