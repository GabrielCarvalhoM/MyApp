# P0 no aparelho: CoachingCore no JavaScriptCore de um iPhone real

**Data:** 2026-11-18. **Branch:** `claude/v1-aif-p0-jsc`, a partir de `2beea1b`. Nada foi enviado nem mesclado.
**Continua:** `P0_REPORT.md` (Windows, 2026-11-17). Este relatório substitui os estados "PENDENTE" daquele §4.3 e §5.3. O restante dele continua valendo.
**Revisão independente:** `reviews/qre/QRE_P0_DEVICE_R1.md`, recebida sem edição: **READY_WITH_CONDITIONS**, sem bloqueios. O §8 diz o que foi feito com cada achado.
**Evidência:** `results/device/`, com Team ID, UDID, Apple ID e caminhos pessoais removidos. A reprodução está em `RUN.md` §2A.

## 0. Resultado

**Decisão: PASS_WITH_CONDITIONS.**

- **No iPhone 17 Pro Max**, o CoachingCore:
  - compila e roda no JavaScriptCore real, só no interpretador;
  - dá as mesmas decisões que o Node;
  - cumpre os 10 orçamentos da PF-0 com folga de 5× a 20×, em duas execuções independentes.
- **Não houve nenhuma incompatibilidade do runtime.**
- **Por que não é PASS_ON_TESTED_DEVICE:**
  - 4 dos 33 passos da P16 não são idênticos byte a byte (`EXPLAINED_LIBM`). A causa está provada, mas aceitar a diferença é decisão explícita, que não tomo aqui.
  - A cobertura de locale achou um defeito de determinismo do motor, que vale nos dois engines.
- **A matriz de aparelhos da V1 continua não medida.** Nada aqui demonstra desempenho num iPhone modesto (C-1).

## 1. Ambiente

| Item | Valor |
|---|---|
| Mac | Mac mini M4 (arm64), macOS 27.0, Xcode 27.2 (27B52), Swift 6.4.2, Node 24.19.0. Nada foi instalado |
| Aparelho | iPhone 17 Pro Max (`iPhone18,2`), iOS 27.2 (24B119), 6 núcleos, 11,4 GB |
| Configuração | Release, `-O` com otimização de módulo inteiro, sem cobertura de código, `debuggerAttached: false` em todas as execuções, fora do Modo de Pouco Consumo |
| Condições | Modo avião ligado e tela desbloqueada, declarados pelo Founder. **Carregando pelo cabo, com 75–80 %.** Estado térmico **fair** em todas as medições de orçamento: em 12 minutos de espera não voltou a nominal com o cabo ligado. O estresse sobe para **serious** |
| Nível de execução | **Só interpretador (sem JIT)**, como num app distribuído. A sonda `testExecutionTierProbe` levou 407–465 ms no aparelho. No `jsc` do Mac, a mesma sonda leva 66–72 ms com JIT, cerca de 85 ms sem DFG e 381–390 ms com `--useJIT=false`. A conclusão é uma inferência entre máquinas, confirmada pela QRE |

## A. Compilação

**Compilou no Mac (macOS), no simulador iOS e no aparelho.** O único aviso restante é a captura não `Sendable` de `CoachingCoreRuntime`:
- a classe está confinada à sua fila serial, o que o `dispatchPrecondition` garante;
- não foi silenciado.

| Arquivo | Mudança | Por quê |
|---|---|---|
| `ios/Package.swift` | Os 4 itens de `Resources/` são copiados um a um, não a pasta | O `codesign` do iOS recusa um bundle raso com uma pasta `Resources` de primeiro nível ("bundle format unrecognized"). Os bytes são os mesmos; a QRE conferiu com `diff -r` |
| `CoachingCoreRuntime.swift` | Os recursos passam a ser lidos de `Bundle.module.resourceURL` | Consequência da linha acima |
| `CoachingCoreRuntime.swift` | `exposeModules` e `callGlobal`, só para teste | A cobertura focal precisa de funções do motor que a fachada não expõe. É a mesma troca de uma linha no fim do bundle que o gate do linker já faz. O código dos módulos não muda e o app não usa isso (M-6) |
| `Metrics.swift` | Nível e estado da bateria no `DeviceInfo` | Condições do ambiente registradas em cada `P0RESULT` |
| `ios/DeviceHost/` (novo) | Plano B do `RUN.md`: app hospedeiro com uma cena vazia e o alvo `P0DeviceTests` com os **mesmos** testes e fixtures | O Xcode não roda teste de pacote no aparelho ("Tool-hosted testing is unavailable on device destinations"). Sem a cena, o iOS 27 recusa abrir o app (exigência de UIScene) |
| `FocalTests.swift`, `lab/focal-driver.js`, `lab/focal-oracle.mjs`, `Fixtures/focal.json` (novos) | Cobertura focal, libm, nível de execução, ponte agregada, estresse | §B e §C |
| `RUN.md`, `.gitignore` | §2A (o caminho que rodou); estado local de build ignorado | Reprodutibilidade |

**Não mudaram:**
- `CoachingCore/`;
- `build/` (o bundle `ad4d3fde…` reproduz idêntico);
- `lab/oracle.mjs` e as fixtures J5/P16;
- `PerformanceTests.swift`;
- `lab/device-budgets.mjs`.

## B. Equivalência no JavaScriptCore do aparelho

| Verificação | Resultado |
|---|---|
| J5 (as 5 respostas de referência, inclusive CLINICAL_HUMAN_REQUIRED) | **5/5 IDENTICAL** |
| P16 (33 passos, registro com 95 linhas) | **29 IDENTICAL, 4 EXPLAINED_LIBM** (passos 13, 14, 25, 26), 0 DIVERGED |
| Restauração (exportar, gravação atômica com proteção de arquivo, novo VM/contexto, restaurar, continuar) | J5 no passo 4: idêntica. P16 no passo 16: idêntica, menos 25 e 26 (EXPLAINED_LIBM) |
| Cadeia com reinício a cada passo (33 reinícios da P16, cada passo num runtime restaurado do disco) | Mesmos vereditos: 29 + 4 nos mesmos passos. **A persistência é determinística** |
| Contrato do host | 0 ausentes, 0 recusas; 3.187 `sha256` e 12,4 milhões de caracteres em J5; tudo pelo CryptoKit |
| Asset adulterado | Recusado antes de o motor existir |

**As diferenças, campo a campo** (`lab/diff-answer.mjs`; saídas em `results/device/diff-answer/`; respostas brutas comprimidas, com SHA-256, em `raw/`):
- Nos 6 passos não idênticos, só mudam 6 folhas, todas dentro de `runForecast`:
  - `decomposition.U`;
  - `decomposition.F.{planScenario,observedForecast}`;
  - `{planScenario,observedForecast}.F_future`;
  - o `hash` do próprio bloco.
- A diferença relativa máxima é 2,1e-15. Nenhum status, nenhum outro campo e nenhuma previsão mostrada muda. O passo seguinte volta a IDENTICAL, ou seja, a diferença não entra no estado.

**A causa está provada, não só localizada:**
- A P16 faz 31 chamadas únicas de libm: 17 `exp` e 14 `pow`. O aparelho recalculou todas, bit a bit (`testLibmBits`).
- As 14 `pow` saem iguais. Só três `exp` diferem, cada uma por 1 ULP:
  - `exp(-0.6)` (passos 13 e 14);
  - `exp(-1.1)` (23 e 24, absorvida, que sai IDENTICAL);
  - `exp(-1.2)` (25 e 26).
- Em aritmética de 60 dígitos, **o JavaScriptCore é que arredonda corretamente**: erro de 0,48 a 0,499 ULP, contra 0,501 a 0,521 ULP do V8.
- A QRE substituiu esses três valores no V8 e reproduziu exatamente os hashes do aparelho.
- O macOS e o simulador dão os mesmos 4 passos.
- **Alcance (C-4):** isto vale para a previsão de prova **sem par de provas**. `Math.log` (0 chamadas) e `(w0+w1)**-0.5` (o ramo do par) não rodam em J5 nem P16, e ali V8 e JSC divergem com frequência.

**Cobertura complementar de `localeCompare` e `toSorted` (QRE-P0-04):**
- Um condutor único (`lab/focal-driver.js`) roda igual no Node e no JSC. Ele chama as funções reais do motor sobre entradas congeladas:
  - os 24 casos do holdout R5, com hash conferido contra o manifesto, e a autoridade de desenvolvimento;
  - as observações no formato do teste `r5-learning`.
- **Resultados do motor idênticos ao Node**, com o aparelho em en-US e em pt-BR. O idioma padrão registrado foi `en-US` e `pt-BR`, respectivamente.
- **Sites alcançados, 5 de 8:**
  - os dois de `r5-contract` (o único `toSorted` e o hash das âncoras);
  - `r5-learning:98` e `:129`;
  - o `toSorted` dentro de `r5-schedule`.
- **Sites não alcançados:**
  - o desempate `localeCompare` de `r5-schedule:26`, inalcançável com entradas válidas (uma sessão por janela);
  - `r6-program:960`, que só ocorre na semana de prova com substituição;
  - o desempate por `reason` em `r5-learning:99`.
- O teste agora fixa explicitamente o conjunto esperado (C-2).
- O JSC faz menos comparações que o V8 para chegar à mesma ordem: 477 contra 567, por usar outro algoritmo de ordenação. Por isso o teste compara os resultados e rejulga no JSC os pares do Node; não compara contagens.
- Todos os 62 pares que o motor comparou têm o mesmo sinal em en-US, em pt-BR e por unidades de código.
- **Defeito encontrado pela QRE e confirmado (C-3):** fora de en-US e pt-BR, a ordem depende do idioma, **nos dois engines**.
  - Em `da` e `nb`, "aa" vai depois de "b"; em `cs`, "ch" vai depois de "h".
  - Então, num aparelho com esses idiomas, `anchorConfigurationHash` e as listas ordenadas por hash hexadecimal podem sair diferentes para a mesma entrada.
  - A correção é no motor (comparação por unidades de código), num freeze sucessor. **Owner: Engineering.** Não foi corrigido aqui.

## C. Desempenho físico (iPhone 17 Pro Max, interpretador, fair, carregando)

Execuções válidas para o `device-budgets.mjs`:
- **A** e **B**: `PerformanceTests` sozinho num processo, cada uma com as mesmas 10 amostras frias;
- **run 1**: a primeira medição, também em fair.

Nearest-rank: com n < 20, o p95 é o máximo.

| Medida | Resultado |
|---|---|
| **Carga a frio** (processo novo, n = 10: assets e SHA, VM, contexto, host, avaliação do bundle) | mediana 42,1 ms, **p95 43,3 ms**, pior 43,3. Fases: assets 3,0–3,6, VM e contexto 1,1–1,9, avaliação 36,5–38,2 |
| Carga com processo já aquecido (n = 10) | mediana 28,7–31,8 ms, p95 42,0–42,7 |
| **Primeiro plano a frio** (n = 10) | mediana 109,5 ms, **p95 113,8**, pior 113,8 |
| Primeiro plano em contexto novo, processo aquecido; e gerações repetidas | p95 101–115 ms; quente 72–95 ms |
| Revisão com histórico curto (< 60 linhas, n = 19) | mediana 170–185 ms, p95 246–259 |
| Revisão com histórico longo (≥ 60 linhas, até 95, n = 13) | mediana 283–296 ms, p95 352–405 |
| **Revisão com o plano inteiro** (passo fixo, 30 repetições) | mediana 275–282 ms, **p95 289,6–291,4**, **pior 292,8–303,0**. Variação entre execuções de 2 % |
| 200 revisões seguidas (estresse) | memória plana. A mediana sobe de 285 para 303 ms numa rodada (fair → serious) e fica em 347 ms (pior 381) numa segunda rodada mais quente: **cerca de +20 % sob calor sustentado** |
| Restaurar o estado de um snapshot interno | 10–15 ms |

**Memória (`phys_footprint`, a medida do jetsam):**
- antes do runtime: 12,1 MB;
- depois da P16 completa: pico amostrado de 18,3–19,0 MB;
- depois da dica de GC: **14,6–14,8 MB**;
- pico do processo: **33,2–33,7 MB**, ou 35,1 MB no estresse;
- processo frio depois do primeiro plano, antes de GC: 32,4–33,4 MB.

O valor logo depois da carga do bundle não foi isolado. Também não há crescimento de memória:
- 30 contextos criados e descartados: 17,8 → 13,6 MB;
- 33 reinícios: no máximo 17,8 MB;
- 200 revisões: 13,5 MB constantes.

**Ponte Swift–JavaScript:**
- **Por revisão com o plano inteiro:**
  - 1.934 `sha256` sobre 4,70 MB de UTF-8;
  - **dentro do Swift (conversão para UTF-8, CryptoKit e hex): 7,3–8,4 ms, 2,7–2,8 % da revisão**;
  - visto pelo JavaScript, que inclui a conversão da string e a travessia: 14–19 ms, **5–6 %**. É uma aproximação (M-1).
  - **A ponte não é gargalo**: mais de 94 % do tempo é o próprio motor no interpretador.
- **Por chamada:**
  - travessia vazia: 0,4 µs;
  - `sha256` de 64 caracteres: 1,4 µs; de 2 milhões: 1,2 ms, dos quais 0,22 ms são travessia e conversão.
- **Envelope (1,1 MB):**
  - exportar para o Swift: 3,4–3,7 ms;
  - restaurar a partir do Swift: 12,6–14,3 ms, contra 10,6–12,4 dentro do JS;
  - gravação atômica: p95 3,1–3,6 ms.
- **Projeções:** 0,05–0,45 ms, com 487–1.136 caracteres.

**CPU e energia:**
- A revisão é limitada por CPU numa thread: o tempo de CPU da thread fica em 98–99 % do tempo de parede.
- O Time Profiler mostra as threads auxiliares do coletor do JSC com cerca de 35 % a mais de amostras que a thread do motor.
- **A energia não foi medida diretamente:**
  - o Power Profiler não aceita "todos os processos";
  - o anexo a um processo lançado pelo `xcodebuild` falhou, por PID e por nome.
- O que existe são esses sinais indiretos e o estado térmico.

**Responsividade:**
- **Pausa máxima da thread principal com o motor fora dela: 9,0–9,1 ms**, contra 288–301 ms no controle com o motor nela.
- **Time Profiler:** das 305 amostras do JSC na thread principal, **294 caem na janela do controle proposital**. As outras 11 são a destruição da VM, cerca de 1 ms cada, porque o último dono a solta na thread principal. A ferramenta de travamentos vê só o controle (294 ms); o "Severe Hang" de 54 s é o intervalo depois do fim do processo.
- **Isolamento:** uma revisão descartada, seguida de restauração do snapshot, devolve o envelope exato.
- **Uma projeção pedida durante uma revisão espera a revisão inteira** (282–329 ms, contra 0,5 ms com o motor livre), porque o motor tem uma única fila serial. Para mostrar dados locais válidos enquanto o motor trabalha, o app precisa manter no Swift a última projeção (até cerca de 1 KB de JSON) e não consultá-la no motor (C-5).
- **Cancelamento:** a API pública do JavaScriptCore não interrompe uma avaliação em curso. O cancelamento seguro é descartar o resultado e restaurar.

**Orçamentos da PF-0, sem alteração** (`device-budgets.mjs`: código 0 nas execuções A e B; ambiente válido: um aparelho, Release, sem simulador, sem depurador, fora do Pouco Consumo):

| Meta | Medido (A / B) | Folga |
|---|---|---|
| Carga **a frio** p95 ≤ 1,0 s | 43,3 / 43,3 ms | 23× |
| Primeiro plano **a frio** p95 ≤ 2,0 s | 113,8 / 113,8 ms | 17× |
| Carga em processo aquecido p95 ≤ 1,0 s | 42,7 / 42,0 ms | 23× |
| Primeiro plano em contexto novo p95 ≤ 2,0 s | 113,3 / 115,3 ms | 17× |
| Revisão com o plano inteiro p95 ≤ 1,5 s | 289,6 / 291,4 ms | 5,1× |
| Pior revisão ≤ 3 s | 292,8 / 303,0 ms | 9,9× |
| Memória depois de GC ≤ 150 MB | 14,8 / 14,6 MB | 10× |
| Pico ≤ 350 MB | 33,2 / 33,7 MB | 10× |
| Gravação atômica p95 ≤ 50 ms | 3,2 / 3,6 ms | 14× |
| Pausa da thread principal ≤ 100 ms | 9,1 / 9,0 ms | 11× |

**O que isto não diz:**
- A folga só é aritmética. Um aparelho que fosse mais de 5× mais lento por núcleo, no interpretador, estouraria a revisão p95.
- Não há medida de que um A13 ou um A15 fique dentro desse fator, e o calor já custa cerca de 20 % neste aparelho.
- **A PF-0 no aparelho de entrada continua NÃO MEDIDA.**
- A partida do processo do futuro app também não foi medida: o processo de teste do `xcodebuild` não representa isso.

## Riscos e limitações que permanecem

1. **EXPLAINED_LIBM.** Pede decisão de política para um freeze sucessor:
   - aceitar a diferença;
   - ou arredondar antes de calcular os hashes do `runForecast`.
   - Um oráculo Node não reproduz o hash de previsão gravado num iPhone. Hoje o efeito se limita à previsão sem par (C-4).
2. **Ordem dependente do idioma** (C-3): defeito de determinismo do motor nos dois engines. Correção num freeze sucessor.
3. **Mensagens nativas de erro** gravadas em respostas (QRE-P0-03): continuam diferentes entre V8 e JSC; nenhuma jornada passa por esse caminho. Freeze sucessor.
4. **Aparelho modesto:** não medido. Riscos conhecidos:
   - o motor só no interpretador;
   - cerca de 35 % de CPU extra em GC;
   - perda térmica de cerca de 20 % sob carga contínua.
5. **Arquitetura:**
   - a fila única bloqueia leituras durante a revisão; o app precisa de um cache de projeção no Swift;
   - o runtime deve ser solto na fila do motor;
   - `exposeModules`, `callGlobal` e `evaluate` devem sair da superfície pública, ou ficar sob `#if DEBUG`, quando este host for promovido (M-6).
6. **Linker da P0:** funcionou sem ajuste. A troca por um bundler padrão continua uma etapa separada, guardada por esta equivalência.
7. **Não verificado:**
   - o SHA do bundle carregado em tempo de execução (M-2);
   - o modo avião, que é declarado, não lido;
   - a energia, de forma direta.
8. **Hard gates abertos, sem mudança:** QRE-AIF-01, QRE-AIF-02, E-1, QRE-RWS-F-01, custódia e integridade, migração, dados de saúde, revisão de segurança, calibração externa do Race Forecast, disponibilidade por dias (`FUTURE_CONTRACT_CHANGE_DAY_AVAILABILITY.md`, não implementada) e plataforma mínima (D3; o piso do bundle segue 16.0). **Esta P0 não autoriza uso com atletas reais.**

## D. Decisão arquitetural: PASS_WITH_CONDITIONS

**No aparelho testado:**
- o JavaScriptCore executa o CoachingCore congelado sem incompatibilidade;
- as decisões são as mesmas do Node, inclusive status, respostas clínicas, plano, registro e restauração;
- o desempenho cumpre todos os orçamentos com folga, mesmo sem JIT;
- a ponte é pequena, a memória é baixa e estável, e a thread principal fica livre.

**As condições:**
- decidir a política EXPLAINED_LIBM;
- tornar a ordenação do motor independente do idioma;
- medir a PF-0 num aparelho de entrada antes de aprovar a matriz da V1;
- cobrir o caminho da previsão com par.

**Nenhuma condição pede trocar o runtime.** Também não aparece nada que justifique WKWebView, port para Swift ou backend.

## E. Próxima ação

**Seguir para a Core Safety & Lifecycle Closure.** Nenhuma incompatibilidade do runtime precisa ser resolvida antes.

- O freeze sucessor dessa missão é o lugar natural das duas correções de determinismo do motor:
  - comparação por unidades de código em vez de `localeCompare`;
  - a política dos hashes do `runForecast`;
  - e, se o owner quiser, a mensagem de erro do QRE-P0-03.
- Essas correções devem ser validadas com esta mesma equivalência, que já roda em minutos no aparelho (`RUN.md` §2A).
- A medição num aparelho de entrada continua como gate da matriz de aparelhos e da D3. Não é gate da próxima missão.

## 8. Revisão independente (`reviews/qre/QRE_P0_DEVICE_R1.md`)

| Achado | Tratamento |
|---|---|
| C-1 aparelho ≠ aparelho de entrada | Adotado: §C "O que isto não diz" e §D |
| C-2 cobertura 5/8, "reached" vazio | Teste corrigido: conjunto esperado explícito. Sites não alcançados listados em §B |
| C-3 ordem dependente do idioma | Confirmado de forma independente (`da`, `nb`, `cs` no Node). Registrado para freeze sucessor, owner Engineering |
| C-4 libm só sem par de provas | Alcance da decisão restrito em §B e nos riscos. Cobertura do par fica como próxima lacuna |
| C-5 estresse e espera da projeção | Rotulados como evidência térmica e de arquitetura, não de orçamento |
| M-1 relógio contado em dobro | Corrigido (desconta meia dupla de `now()` e registra `nowPairMs`). O valor continua aproximado |
| M-2 SHA do bundle em execução | Registrado, não implementado |
| M-3 comentário "JIT no macOS" | Corrigido em `Package.swift` |
| M-4 piso 17.0 dos testes | Justificado no `RUN.md` §2A |
| M-5 respostas brutas | Guardadas em `results/device/diff-answer/raw/` com SHA-256 |
| M-6 superfície de teste e rótulos | Rótulos corrigidos. A superfície fica registrada para a promoção do host |

Depois da revisão, as correções de M-1, C-2 e dos rótulos rodaram de novo no aparelho e passaram (`results/device/focal-*.log`). Não houve segundo ciclo de revisão.
