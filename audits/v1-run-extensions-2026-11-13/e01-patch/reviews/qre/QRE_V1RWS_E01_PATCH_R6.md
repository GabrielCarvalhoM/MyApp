# QRE: patch pós-freeze do QRE-RWS-E-01 (V1RWS), R6

**Veredito: `READY_WITH_CONDITIONS`.** Nenhum achado BLOCKING.

- **QRE-RWS-E-01: CLOSED.** As três sondas do meu papel, sem mudança, reproduzem o defeito no candidato congelado e o mostram fechado no patch. Pelo ponto de entrada, a variante `CORRECTED_MEASUREMENT` (que na R5 ficou só em unidade) move a faixa de limiar no congelado (`[290,325]`, fração `+0,03`, nada retido) e fica retida no patch (4× `REPORT_NOT_CARRIED`, `[300,335]`, o mesmo hash do controle `c65ab1fd…`). Numa tabela de 96 combinações montadas à mão, os quatro motivos de distância por cinco formas de motivo de linha inteira mudam exatamente como a condição do SSCTR diz, e nada mais. Numa diferencial estrita com oráculo (2.133 chamadas por condutor, dois condutores), o patch é byte a byte igual ao meu oráculo em toda chamada, e nada que o congelado retém é entregue.
- **Uma condição nova, antes de integração ou de atleta real:** QRE-RWS-F-01. A fusão do motor guarda um valor por campo, e os fatos de relato guardam só os fatos de distância e a parada; assim um fato de comparabilidade que um relato diz e que não é de distância (`gpsQuality: POOR`, `conditions: HEAT`, `walkBreaks`, `measurement: TREADMILL`) pode sumir na fusão, e a linha chega aos leitores de ritmo como comparável. A faixa de limiar se move 10 s/km. Já existia, é igual no congelado e no patch, e não é o E-01.
- Cinco NOTEs.
- O freeze sucessor do patch depende ainda da verificação independente do SSCTR sobre os bytes novos (o registro habilitador amarra, por texto, o runtime de `4b1622f`; F-05).

Por que nenhum é BLOCKING está dito em cada achado (seção 6).

- **Juiz:** instância nova e independente de Quality & Reliability (claude-opus-5-5, esforço xhigh, como despachado). Não escrevi o patch, o registro do autor, os testes novos nem os pareceres anteriores. No worktree escrevi só estes dois arquivos. Não li o parecer do SSCTR desta rodada: vi só que existe a pasta `e01-patch/reviews/ssctr/` (não rastreada) e não a abri.
- **Data:** 2026-11-15.
- **Versões:** candidato `f8b08aaf4516f5376a31a67b43e72ec9a2d64f29` (HEAD conferido antes e depois, nenhuma mudança rastreada; a única coisa não rastreada é a pasta do SSCTR, e agora a minha). Anterior: o runtime de `4b1622f55e3d66e6e381bf33cc659fbed1f1713a`, o mesmo em `08d2dc8998386e3eca97df2d32cb2ed19f169e23` (conferi). Freeze: `COACHINGCORE-V1-RUN-FORMAT-FREEZE-1`, registro `CoachingCore/v1/RUNTIME_FREEZE_V1RWS_1.json` (sha256 `a3ca14a5…`, igual em `08d2dc8` e `f8b08aa`), amarra `f1177c8950d495dd46469eb56a9f34061e1aff65`.
- **Autoridade usada nas sondas:** a de desenvolvimento (`DEV`) dos helpers, salvo onde digo `FORMATS_OFF`. Conferi também que a autoridade padrão (sem opções) liga a fronteira nas duas árvores (F-05).

## 1. Reprodução no candidato anterior, antes de julgar

**A cópia.** `git archive 08d2dc8 CoachingCore audits | tar -x` num diretório novo do meu scratch, mais `node_modules` do worktree. Conferi byte a byte contra `git show`: os 63 arquivos de `src/` e `v1/` são os de `4b1622f` (63/63), e os 289 de `src/`, `v1/`, `test/` e `scripts/` são os de `08d2dc8` (289/289). Do mesmo jeito, a cópia do patch confere 290/290 com `f8b08aa`.

**As sondas do meu papel, sem mudança.** sha256 conferidos nos originais da R5 e nas cópias em `e01-patch/probes/judge/`: `lib.mjs 4aca94c3…`, `q5-workpace.mjs 9944228c…`, `q5-workpace2.mjs 8467d915…` (iguais). Rodei os originais da R5, apontados para a minha cópia do congelado e para o worktree.

| Sonda, caso | Congelado | Patch (worktree) |
|---|---|---|
| `q5-workpace2`, fundida sem correção | nada retido, limiar `[300,335]`, `c65ab1fd…` | igual |
| `q5-workpace2`, correção simples | 4× `REPORT_NOT_CARRIED`, `[300,335]`, `c65ab1fd…` | igual |
| `q5-workpace2`, **correção que lista uma gravação** | **nada retido, `[290,325]`, `a7a23d20…`** | 4× `REPORT_NOT_CARRIED`, `[300,335]`, `c65ab1fd…` |
| `q5-workpace`, unidade, lista uma gravação | leitura `SEVERAL_RECORDINGS`, retenção `[]`, entregue sem POOR, `work 270` | leitura `SEVERAL_RECORDINGS` + `wholeRow: REPORT_NOT_CARRIED`, retida `REPORT_NOT_CARRIED`, entregue POOR |
| `q5-workpace`, unidade, declara com motivo de falha | leitura `CORRECTED_MEASUREMENT`, retenção `[]`, entregue sem POOR | `wholeRow: REPORT_NOT_CARRIED`, retida, entregue POOR |
| `q5-workpace`, ponto de entrada, uma sessão só | as quatro variantes `[290,310]`, iguais à calibração do registro nu | igual (uma sessão não move a faixa: o fator pede duas) |

Os números do congelado são os da R5. Vi a falha e a vi fechar.

## 2. O fechamento pelo ponto de entrada (sondas minhas)

`r6-entry.mjs`: cada árvore conduz o seu próprio cliente conforme, como na `q5-workpace2`. Sessões de qualidade das semanas 3 a 6; o atleta relata ritmo de trabalho 255 s/km, esforço 7; a importação do relógio varia; depois o atleta corrige o próprio relato (variante); semana 7 como prescrita.

| Relógio | Correção do atleta | Congelado: limiar, fração, retidas | Patch |
|---|---|---|---|
| POOR (9 km) | nenhuma (fundida) | `[300,335]`, 0, nenhuma | igual |
| POOR | simples | `[300,335]`, 0, 4× `REPORT_NOT_CARRIED` | igual |
| POOR | lista uma gravação | **`[290,325]`, +0,03, nenhuma** | `[300,335]`, 0, 4× `REPORT_NOT_CARRIED` |
| POOR | **declara 9 km com `SIGNAL_LOSS` (`CORRECTED_MEASUREMENT`)** | **`[290,325]`, +0,03, nenhuma** (`a7a23d20…`) | `[300,335]`, 0, 4× `REPORT_NOT_CARRIED` (`c65ab1fd…`) |
| POOR | lista e declara | `[290,325]`, +0,03, nenhuma | `[300,335]`, 0, 4× |
| POOR | declara sem motivo | `[300,335]`, 0, 4× (já fechado) | igual |
| OK (9 km) | nenhuma | `[290,325]`, +0,03 (evidência legítima) | igual |
| OK | lista / declara / as duas | `[290,325]`, +0,03, nenhuma | `[300,335]`, 0, 4× (leitura 6) |
| só minutos | nenhuma | `[290,325]`, +0,03 (linha fundida sem distância que carrega tudo) | igual |
| só minutos | lista / declara / as duas | `[290,325]`, +0,03, nenhuma | `[300,335]`, 0, 4× |
| nenhum (um autor) | as seis variantes | `[290,325]`, +0,03, nenhuma | igual (leitura 1) |
| POOR, voltas de sessão nativa | lista / declara | `[290,325]`, +0,03 | `[300,335]`, 0, 4× |
| POOR, trabalho em `work.distanceKm` + `work.seconds` | lista / declara | `[290,325]`, +0,03 | `[300,335]`, 0, 4× |
| POOR, correção no meio da semana seguinte, até a semana 8 | lista / declara | `[290,325]`, +0,03 (`f1e7add5…`) | `[300,335]`, 0, 4× (`8305827f…`) |

A variante `CORRECTED_MEASUREMENT` fecha pelo ponto de entrada. O que o congelado já retinha continua retido com o mesmo motivo; o que era evidência legítima (relógio OK sem correção, fundida que carrega todos os relatos, um autor só) continua lida.

**Ordem e armazenamento** (`r6-order.mjs`). A revisão da semana 7, com o registro do motor e o de relatos por JSON e embaralhados (três sementes), em cinco cenários mascarados (inclusive importação antes do app e app antes da importação): as mesmas retenções, a mesma calibração e as mesmas sessões que na ordem guardada, nas duas árvores.

## 3. A regra em registros montados à mão (sonda minha)

`r6-table.mjs`: 16 formas da linha viva × 6 formas do resto do registro, nas duas árvores, contra a regra como a condição do SSCTR a escreve (linha com distância: como o congelado; linha sem distância: `REPORT_NOT_CARRIED` se um relato em vigor não está nela ou a linhagem não cabe no teto, senão `REPORTS_UNREADABLE` se o registro de relatos não é legível inteiro, senão nada).

- Formas da linha: com distância (nada, lista, declara com falha, disputa, sem duração); sem distância (nada, lista, declara com falha, declara sem motivo, número manual, fundida em disputa, fundida com relato sem duração, trabalho por distância e segundos, `seconds` em vez de `minutes`); distância fora da faixa (`1e6`) e distância em texto (`'9'`), que nenhum leitor lê como distância.
- Formas do registro: tudo na linha; um relato em vigor fora dela; registro de relatos ilegível; os dois; 65 relatos (acima do teto de 64); uma linha de **formato** ilegível.
- **96 combinações, 0 fora da regra.** 40 mudam do congelado para o patch, e são exatamente as linhas sem distância com um motivo de distância próprio (os quatro: `SEVERAL_RECORDINGS`, `CORRECTED_MEASUREMENT`, `DURATION_REQUIRED`, `DISTANCE_DISPUTED`) com um motivo de linha inteira (cinco formas): `null` → `REPORT_NOT_CARRIED` ou `REPORTS_UNREADABLE`. A palavra única (`withheld`) é a mesma nas duas árvores nas 96. As 30 linhas com distância dão o mesmo motivo nas duas. Toda linha retida é entregue sem distância e POOR.

## 4. Outros caminhos que poderiam contornar a admissão

Li o código de cada leitor e exercitei cada um (seção 5 tem os números da diferencial).

| Campo ou caminho | O que achei | Evidência |
|---|---|---|
| `actual.work.paceSecondsPerKm`, `work.distanceKm`/`seconds` | Fechado: a calibração (V1RC `hardExecution`) só lê o ritmo de trabalho como comparável sem `gpsQuality: POOR`, e a admissão marca POOR toda linha retida | seção 2 (as duas formas); M01 a M04 |
| `execution.paceEvidence` e `paceWithheld`, voltas de sessão nativa | Fechado: `executionOf` recebe a leitura inteira; nas voltas, `paceEvidence` `true` → `false` | diferencial: as execuções só diferem em `paceWithheld` e `paceEvidence`; M15 |
| `declared`, `manualDistanceKm`, `segments` | Não são lidos pela calibração. Entram só no histórico (referência, L30, S2, S3). Sem mudança fora da S3 | código; diferencial |
| Fonte S3 (`latestClassRun`) | Fechado: exclui linha retida e recebe a leitura inteira. Leve: as quatro sessões leves das semanas 4 e 5 passam de tempo a distância (leitura 2). Longão: S3 360 → 365 s/km, longão segue 16 km | `S3 easy how=declares`; `r6-s3long.mjs`; M16 |
| Longão comparável (S2) | Lê a linha retida, como antes (S2 = 360 nas duas árvores, da corrida corrigida, 95 min sobre os 16 km declarados). É a tabela 3.5 do contrato de linhagem: S2 é histórico de distância, que só os itens L3 e L4 rebaixam. Não é um contorno da regra de ritmo | `r6-s3long.mjs`; contrato, seção 3.5 |
| L30, `extentKm` | Sem mudança (não dependem da palavra) | diferencial (nenhuma diferença fora das linhas mascaradas) |
| Prova e frequência cardíaca | Uma linha sem distância nunca é resultado de prova, nos dois; a FC só sai de resultado de prova. Patch: a linha passa a ser nomeada como retida | `RACE lists no distance`, `RACE declares no distance` (5 chamadas cada, só nomeação) |
| EASY (P1) e THRESHOLD, capacidade, fatores de treino | P1 pede distância (que a admissão tira); os fatores pedem `comparable` (que POOR nega). Capacidade só de prova, teste ou âncora | seções 2 e 5 |
| `runCalibrationOf` exportado | Mesma admissão: como guardado, JSON embaralhado, sem as linhas aposentadas, sem os fatos de relato, sem o registro, semana anterior | 582 chamadas: 463 iguais ao congelado, 119 diferentes, e as 119 iguais ao oráculo |
| `historicalStateOf` | Igual ao congelado nas 97 chamadas (não lê ritmo) | diferencial |
| Respostas sem sessão (recusada, anterior ao registro, formato desconhecido) e `restartProgram` | Mesma leitura; retidas nomeadas | diferencial: iguais ao oráculo |
| Linha em conflito sem distância | Nomeada agora; a calibração já não a lia (`conflicted`) | `r6-conflict.mjs`: 4 linhas nomeadas, calibração `c65ab1fd…` nas duas (leitura 5) |
| Registro de relatos ilegível | Fechado: `REPORTS_UNREADABLE` retém a linha sem distância de um autor só que lista ou declara | tabela; `Q unreadable record, one speaker lists/declares` |
| `reportsVerdict` (exportado) | Continua dando a palavra única, que numa linha sem distância pode ser um motivo de distância. Nenhum ponto do runtime o usa | `grep`; F-03 |
| **Fatos de comparabilidade que não são de distância, perdidos na fusão** | **Aberto, anterior ao patch:** F-01 | `r6-bypass.mjs`, `r6-bypass2.mjs` |

## 5. Diferencial estrita, candidato anterior × patch (sonda minha)

**Desenho.** `r6-diff.mjs` com `r6lib.mjs` e `r6-scenarios.mjs`. Um cliente só; **toda chamada é feita, com os mesmos bytes (clones estruturados), nas três árvores**: o congelado, o patch e um **oráculo meu** (`tools/make-oracle.mjs`): a cópia do congelado em que só os dois pontos do ponto de entrada que chamam `reportsReading` passam a trocar a palavra por `REPORT_NOT_CARRIED` / `REPORTS_UNREADABLE` numa linha viva sem distância que não carrega um relato em vigor (ou com registro ilegível). É outro mecanismo (o patch separa a leitura; o oráculo troca a palavra na chamada), escrito a partir do texto da condição. Como o pedido é o mesmo em toda chamada, os clientes nunca divergem e não há classificador de "decorrência". Rodei duas vezes, com o cliente conduzido pelo patch e depois pelo congelado.

**Corpus.** 98 clientes: os 17 cenários de classe (leve e longão: os 12 da R5 e 5 novos de linha sem distância com autocorreção), cada um seguido de três semanas como prescritas; 30 de sessão de qualidade (seis correções × cinco relógios), 6 de ordem, 3 de voltas, 2 de correção tardia, 3 de trabalho por distância e segundos, fundida parcial e o seu controle, disputa sem distância e o seu controle, 4 de registro ilegível, 4 de prova (plano de 10 km até a semana da prova), 3 de S3, jornada de 12 semanas ligada e desligada, 3 com a fronteira desligada. No fim de cada um: seis leituras pela calibração exportada, estado histórico, restart, revisão recusada, formato desconhecido e revisão anterior ao registro.

**Regras e resultado** (iguais nos dois condutores):

| Regra | Resultado |
|---|---|
| Chamadas | 2.133 (98 `generateProgram`, 1.259 `evaluateProgram`, 582 `runCalibrationOf`, 97 `historicalStateOf`, 97 `restartProgram`); nenhuma lançou |
| R1: a parte do motor de toda resposta (plano, decisão, registro do motor, estado de referência, motivos) é igual | **0 diferenças** em 1.454 respostas de plano |
| R2: triagem, perguntas, ofertas, pausa contínua, listas de ilegíveis, histórico, status, motivo, `prescribing` iguais | **0 diferenças** |
| R3: nada que o congelado retém é entregue; nenhum motivo muda | **0; 0** |
| R4: toda resposta de plano que difere tem ao menos uma linha recém-retida, e todo motivo novo é de linha inteira; a calibração exportada só difere como o oráculo; o estado histórico nunca difere | **0 violações** |
| R5: patch e oráculo byte a byte iguais | **2.133 de 2.133** |
| Iguais ao congelado | 1.617; diferentes 516 (397 respostas de plano, todas com linha recém-retida, e 119 calibrações exportadas, todas iguais ao oráculo) |
| Linhas recém-retidas (somadas por resposta) | 1.093: `REPORT_NOT_CARRIED` (e `REPORTS_UNREADABLE` nos 2 clientes de registro ilegível de um autor só) |
| Clientes | 59 idênticos do começo ao fim; 39 com diferença. Três deles (um autor só que lista, declara ou faz as duas) diferem numa chamada só: a calibração exportada sobre o registro do motor **sem as linhas aposentadas**, onde nada mostra que o relato original foi substituído e ele fica em vigor; o patch retém, igual ao oráculo (perder linhagem só retém mais) |
| O que difere numa resposta de plano | só `runCalibration`, `runFormat.paceEvidenceWithheld`, `native`/`time`, `runSessions` (execuções: só `paceWithheld` e `paceEvidence`; prescrições: as sessões que a faixa ou a fonte S3 mudou) e `runFormatRecord` (os formatos dessas sessões) |
| Controles idênticos | fundida sem correção, correção simples, declaração sem motivo, fundida que carrega tudo, disputa sem relato recusado, registro ilegível sem correção, prova sem correção, S3 sem correção ou com correção simples, todos os 12 cenários da R5 (re-sincronização, calor, `ADVERSE`, parada por sintoma, conflito, retração, um autor, duas medidas que concordam), jornada de 12 semanas ligada e desligada, fronteira desligada |
| Registros devolvidos (terceira passada, condutor patch, os mesmos 2.133 resultados) | em 1.454 respostas de plano: fatos de relato (`RUN_REPORT_RECEIVED`) iguais em **todas**; `runHistoryRecord`, `runEvidenceRecord` e o registro do motor iguais em todas; linhas de formato diferentes em 186, **sempre** numa resposta cujas sessões entregues diferem (0 com as sessões iguais) |

Dose e progressão, coordenação híbrida, carga, crédito de adesão e conclusão por distância são do motor ou leem a execução sem `paceWithheld`: R1 e a regra das execuções mostram que não mudam. Seleção de formatos só muda onde a calibração ou a S3 muda, e lá o patch é o oráculo. Triagem e holds clínicos: R2. Linhagem e proveniência: a palavra única e os relatos em vigor são os mesmos (tabela, seção 3; `readReportFacts` não mudou). Com a fronteira desligada (jornada, dois clientes de qualidade) tudo é igual, e o legado é `v1-run-index.mjs`, que não mudou.

Um cliente não rodou: `EASY off self-correction lists` (com a fronteira desligada não há sessão leve nativa para o cenário escolher; erro da minha sonda, não do runtime). A fronteira desligada está coberta pelos outros três.

## 6. Achados

| Id | Sev. | Evidência | O que fecha |
|---|---|---|---|
| **QRE-RWS-F-01** | **CONDITION** | **Fatos de comparabilidade que não são de distância somem na fusão.** A fusão congelada (`r6-provenance.mjs`, `mergeActual`) guarda um valor por campo: o da fonte de rank maior, ou o primeiro num empate. Os fatos de relato (`reportFactOf`) guardam a parada e os fatos de distância, não `gpsQuality`, `conditions`, `walkBreaks` nem `measurement`. A linha fundida carrega os dois relatos, então nenhum motivo de linha inteira existe. `r6-bypass2.mjs`, sessões de qualidade das semanas 3 a 6 (ritmo 255, esforço 7), semana 7: o atleta diz `HEAT` e o relógio não diz condição → `[300,335]`, fração 0; **o atleta diz `HEAT` e o relógio diz `conditions: ['RAIN']` → a linha fica com `RAIN`, `[290,325]`, +0,03** (`534083…`). App com `gpsQuality: 'OK'` sem distância e relógio `WEARABLE_PARTIAL` com 9 km POOR → a linha fica com os 9 km do relógio marcados OK, **`[290,325]`, +0,03**. `r6-bypass.mjs`, na linha: `walkBreaks: true` do atleta vira `false` quando o relógio manda `false`; `TREADMILL` do atleta vira `GPS` diante de um relógio `WEARABLE_FULL`. Tudo igual no congelado e no patch. **Por que não é BLOCKING:** não é o E-01 (não há motivo de linha inteira escondido), o patch não o cria nem o piora, a missão só autoriza o E-01, e pede uma integração que mande do relógio o que é do atleta (ou do app o que é do aparelho). **Por que é CONDITION e não NOTE:** é a mesma classe que o Founder fixou para este patch (um fato que torna a observação não comparável não pode ser contornado por outro campo da mesma observação), move a faixa 10 s/km, e o contrato iOS só o evita por omissão (a coluna do relógio não lista condições; nada diz "nunca", e não há teste). | Antes de integração ou de atleta real, um dos dois: (a) o contrato de integração diz expressamente que o relato do aparelho nunca leva `conditions`, `walkBreaks` nem o que o atleta disse da superfície, e que o relato do atleta nunca leva `gpsQuality` nem `measurement` de aparelho, com teste de resultado do adaptador nas quatro formas acima; ou (b) o SSCTR e o Founder decidem que o Core guarda esses fatos por relato e os lê como a distância (mudança de runtime fora deste patch, com autorização e revisão próprias). |
| QRE-RWS-F-02 | NOTE | **Dois testes novos ficam vermelhos no congelado primeiro pela forma da leitura, não pelo comportamento.** No congelado (`frozen-e01`, runtime conferido 63/63 com `4b1622f`) os 6 falham, todos `ERR_ASSERTION`. Os testes 1, 3, 4 e 6 falham em asserção de comportamento (palavra mascarada com `paceWithheld` `null`; faixa `[290,325]`; a sessão da semana 6 entregue por tempo, `2 !== 3`; a linha não nomeada). O **teste 2** falha no primeiro caso, `plain`, que o congelado já retinha, só porque `reading.wholeRow` é `undefined`; o **teste 5** falha na linha 217, na presença de `wholeRow`. A afirmação do registro do autor (seção 6: "cada um falha na asserção do motivo mascarado ou da faixa movida") é inexata para esses dois. Com o leitor congelado e a chave `wholeRow` presente (mutante M01), os seis testes caem, os dois também: eles provam o comportamento, mas no congelado a primeira asserção que cai é a de forma. No teste 4, a asserção "pela palavra sozinha as voltas seriam evidência" fica dentro de `if(format)`: se o formato não fosse achado, passaria calada (na minha reconstrução o formato é achado nas 3 sessões nativas). | Opcional: separar a asserção de forma da de comportamento; trocar o `if(format)` por uma asserção de que o formato existe. |
| QRE-RWS-F-03 | NOTE | **`reportsVerdict` continua exportado e dá a palavra única.** Numa linha sem distância essa palavra pode ser um motivo de distância, que é exatamente o que escondia o E-01 (o teste 4 o mostra: pela palavra sozinha, as voltas seriam evidência de ritmo e a corrida seria a fonte S3 a 442,5 s/km). Nenhum ponto do runtime o usa (`grep` em `src/`); os três pontos que passam a leitura adiante estão cobertos por M14, M15 e M16. | Antes da fase B: o Race Forecast lê `execution.paceEvidence` / `paceWithheld` ou a leitura inteira, nunca `reportsVerdict` (preflight ou handoff da fase B). |
| QRE-RWS-F-04 | NOTE | **A seção 9 do autor diz mais do que é.** "Nada muda no que é gravado" não é literal: quando a retenção muda a calibração ou a fonte S3, as sessões entregues mudam e o `runFormatRecord` devolvido guarda outros formatos. Na diferencial (seção 5), em 1.454 respostas de plano, as linhas de formato diferem em 186, sempre junto com as sessões entregues; os fatos de relato, o registro de histórico, o de evidência e o do motor são iguais em todas. Não entra chave nova em registro; selo, legibilidade e autor não mudam; os fatos de relato são os mesmos. | Corrigir a frase (o conteúdo dos formatos entregues muda como consequência; a forma, o selo, a legibilidade, o autor e os fatos de relato não). Não pede revisão de Security (seção 8). |
| QRE-RWS-F-05 | NOTE | **O registro habilitador amarra o runtime só por texto.** A condição 2 do registro (`SSCTR_V1RWS_RUN_RECORDS.json`, sha256 `a5b915c6…`) diz que ele vale para o runtime de `4b1622f` (cita `v1-run-format.mjs 419cac2d…`), e o adendo diz que qualquer mudança pede nova verificação SSCTR. A máquina confere só o hash dos valores: `runFormatAuthority()` no patch dá `approved['V1X-RUN-NATIVE'] === true`, `source: CURRENT_INDEPENDENT_REVIEW`, `allowsFormat` verdadeiro, com `v1-run-format.mjs e8f364e3…` e `v1-run-history.mjs 06deb84c…`. Nada impede o runtime novo de rodar com a fronteira ligada antes da reverificação. É o desenho anterior, não do patch. | O freeze sucessor só depois da verificação SSCTR independente dos bytes novos (a rodada paralela). Opcional, depois: o registro amarrar também os hashes de runtime de forma verificável. |
| QRE-RWS-F-06 | NOTE | **O custo L1-f, medido.** No meu corpus o patch retém, além da correção simples que já era retida: correção do atleta que lista, declara falha ou as duas, com relógio POOR, OK, `WEARABLE_PARTIAL` ou só minutos (27 clientes de qualidade, entre eles a fundida parcial e a disputa com correção recusada; 4 de classe; 2 de prova; 1 de S3; mais os 2 de registro ilegível de um autor só, que são `REPORTS_UNREADABLE` e não L1-f). Nos casos de relógio OK e só minutos, a faixa que se movia no congelado (`[290,325]`) deixa de se mover (`[300,335]`): a sessão sai da evidência de ritmo para sempre por uma correção do próprio atleta. É o custo que o Founder e o SSCTR aceitaram para a correção simples (leitura 6). | Nenhum no Core; a integração diz a fração (condição L1-f do registro). |

### Achados anteriores no meu campo

| Id | Estado | Evidência |
|---|---|---|
| **QRE-RWS-E-01** (CONDITION na R5) | **CLOSED** | Seções 1 a 5. A condição do registro habilitador ("numa linha sem distância, um motivo de linha inteira retém mesmo quando a própria linha tem um motivo só de distância, com teste de resultado da sessão de qualidade") está cumprida, e o teste 1 do arquivo novo é esse teste de resultado. |
| QRE-RWS-B-01 | **CLOSED** também no ritmo de trabalho de uma linha sem distância | O resto que a R5 apontou era a E-01. |
| QRE-RWS-E-02 (CONDITION, integração) | sem mudança | Não reexercitei. O contrato iOS a reúne como gate de integração (não atendido). |
| QRE-RWS-E-03 a E-07, D-02 a D-05, C-04 (NOTE) | sem mudança | Não reexercitei. |

## 7. As seis leituras do autor (`E01_PATCH.md`, seção 7)

| # | Leitura | Meu juízo | Evidência |
|---|---|---|---|
| 1 | Linha sem distância que carrega todos os relatos em vigor continua entregue, mesmo com motivo de distância próprio | **Aceita.** É a letra da condição do SSCTR, e ir além seria critério esportivo novo. Ela vale também para S3 e L30: uma linha sem distância que declara 8 km com motivo de falha, de um autor só, é fonte S3 pelo número declarado, nas duas árvores. Se isso deve mudar é pergunta do SSCTR, não deste patch. | seção 2 (um autor só, as seis variantes; fundida de só minutos), tabela (`all carried`), M11 e M13 (ir além) mortos |
| 2 | A corrida retida deixa de ser fonte S3, e uma sessão pode passar de tempo a distância | **Aceita como efeito direto da regra**, que a S3 já aplicava a linha retida; o oráculo dá o mesmo byte a byte. Leve: as quatro leves das semanas 4 e 5 passam de tempo a distância. Longão: S3 360 → 365, o longão segue 16 km e 100 min de teto igual (CT-3 18,084). Concordo que precisa da palavra expressa do SSCTR: é leitura esportiva. | `S3 easy how=declares`; `r6-s3long.mjs` |
| 3 | A palavra mostrada numa linha mascarada é o motivo de linha inteira; `reportsVerdict` dá a palavra única | **Aceita**, com F-03 | M14 a M16; `grep` |
| 4 | Com os dois motivos de linha inteira, mostra-se `REPORT_NOT_CARRIED` | **Aceita.** Precedência aceita na R5; a tabela a confere nas formas `both` | tabela; M06 morto por 2 testes |
| 5 | Linha em conflito mascarada passa a ser nomeada | **Aceita.** Só nomeação: a calibração não lê linha em conflito | `r6-conflict.mjs` |
| 6 | O custo L1-f aumenta | **Aceita como dita**, com os números de F-06 | F-06 |

## 8. Security: é preciso revisão focal antes do freeze?

**Não, pelo que este diff faz.** O que conferi:

- **O que é gravado:** os fatos de relato são byte a byte os mesmos nas 1.454 respostas de plano da diferencial, e também o registro de histórico, o de evidência e o do motor. O que muda é o conteúdo das linhas de formato entregues (186 respostas), sempre e só quando as sessões entregues mudam: a mesma forma de linha, escrita pelo mesmo `appendFormats`, sob o mesmo selo. Nenhuma chave nova em registro.
- **O que é selado e lido como legível:** `readableReport`, `readableFormat`, `sealOf`, `reportKey`, `appendReportFacts`, `appendFormats` não mudaram (o diff de `v1-run-format.mjs` é só `reportsReading`, mais o comentário). A chave nova `wholeRow` vive no objeto da leitura em memória e não entra em registro nem em resposta (patch e oráculo, que não tem a chave, são byte a byte iguais em toda resposta).
- **Quem falou:** `speakerOf`, `identified` e a regra de substituição não mudaram; a palavra única é a mesma nas 96 combinações da tabela.
- **O que muda:** só leitura, para o lado de reter (R3: nada retido passa a ser entregue).

A frase da seção 9 do autor precisa da correção de F-04. F-01 é de custódia e contrato de dados também (a origem pelo canal, I-1 a I-8), mas é anterior ao patch e não pede revisão focal deste diff; pede que Security a veja junto com o resto da integração.

## 9. Suítes, freeze e testes históricos (formalmente)

| Execução | Onde | Resultado |
|---|---|---|
| Conjunta, `node --test` em `CoachingCore/` | worktree, `f8b08aa` | **1.449 entradas, 1.448 passam, 1 falha**: `V1RC COACHINGCORE-V1-FREEZE-1 is preserved: every file it binds is byte-identical here` (`test/v1rc-calibration.test.mjs:325`), `actual: ['CoachingCore/src/r6-adaptation.mjs']` e nada mais. 268 s. **A suíte conjunta não é verde nesta linha**, por desenho. |
| Extensão, `node --test "test/v1rws-*.test.mjs"` | worktree | **114 de 114** (76 s) |
| `node scripts/v1rws-freeze.mjs --preserved` | worktree | exit 0: `COACHINGCORE-V1-FREEZE-1` 197/197, 1 emendado (`r6-adaptation.mjs`: base registrada, bytes autorizados, diff do leitor só, 22+/10−); `COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1` 30/30 |
| `--check 1` | clone meu em `08d2dc8` (HEAD conferido, árvore limpa) | **exit 0**: 97 arquivos acrescentados conferem; o emendado confere com o diff registrado; 197/197 e 30/30. (Em `f1177c8` o registro ainda não existe; `git diff --name-status f1177c8 08d2dc8` dá só o registro e `PHASE_A_FREEZE_V1RWS_1.md`, então os bytes amarrados são os mesmos.) |
| `--check 1` | worktree | **exit 1, `DRIFT`**: `src/v1-run-format.mjs`, `src/v1-run-history.mjs`, `test/v1rws-e01.test.mjs`, e nada mais. Esperado: o V1RWS-1 amarra os bytes de `4b1622f` e não foi flexibilizado; um sucessor seria um registro novo. |
| Testes novos no congelado | `frozen-e01` (congelado + só o arquivo de teste novo, sha256 `0fb768e7…`, igual ao do worktree) | **0 de 6**, todos por asserção (F-02 diz quais por forma e quais por comportamento) |
| Testes novos no patch | worktree (na suíte da extensão) | 6 de 6 |
| Testes e verificadores históricos | `git diff --name-status 08d2dc8 f8b08aa` (repositório inteiro) | `M` só em `CoachingCore/src/v1-run-format.mjs` e `CoachingCore/src/v1-run-history.mjs`; todo o resto `A` (o teste novo e os arquivos de `e01-patch/`). Nenhum teste, verificador ou registro histórico editado; nada sob `phase-a/`. |
| Arquivos amarrados | sha256 em `4b1622f` e `f8b08aa` | iguais: `v1-run-format-index.mjs fd38ebb0…`, `r6-provenance.mjs 2b9c5ccc…`, `r6-adaptation.mjs 6cedcb72…`, `v1-run-calibration.mjs 0eae6521…`, `v1-run-index.mjs a86b6f1e…`, `v1-index.mjs 8a9bdd50…`, `RUN_FORMATS_V1.json 26c6e3fb…`. Mudam: `v1-run-format.mjs 419cac2d… → e8f364e3…`, `v1-run-history.mjs 50f178e2… → 06deb84c…`. Os blobs git de `r6-provenance` (`6216cbfc`), `v1-run-calibration` (`125079f6`), `v1-run-index` (`ba21c193`), `v1-index` (`92d5a116`) e `r6-adaptation` (`75d26d5a`) são os que a R5 registrou. |

Depois de tudo, `git status` do worktree: nenhuma mudança rastreada; não rastreadas só a pasta do SSCTR e a minha.

## 10. Mutação (minha)

`tools/mutate.mjs`, na minha cópia de `f8b08aa` (nunca no worktree). Cada mutante troca um texto que aparece uma vez só (o script confere), os 114 testes da extensão rodam, e o arquivo volta pelos bytes originais, conferidos por sha256. Um mutante morre só por teste que o controle passa.

- **Controle:** 114 entradas, 113 passam; a única falha é `I10, V6` (o verificador dos freezes, que pede git e a cópia não tem). Mesma condição em todos os mutantes.
- **17 mutantes, 17 mortos.** Nenhum morto só por teste de custo. M01 a M13 estão nas quatro linhas do patch; M14 a M16 nos três pontos que passam a leitura adiante; M17 é vizinho na mesma linha do patch (a parte de L4 que já existia), como controle.

| # | Mutação | Testes que matam (os primeiros) |
|---|---|---|
| M01 | o leitor congelado de linha sem distância de volta, com `wholeRow` presente na leitura | 6: os seis do arquivo novo |
| M02 | `ofRow` ignora `wholeRow` | 6: os seis do arquivo novo |
| M03 | `ofRow` ignora a palavra quando ela é de linha inteira | 2: o de registros à mão, e "the whole row is withheld" (fix-forward) |
| M04 | linha sem distância nunca retida | 12 |
| M05 | linha com distância ignora `wholeRow` quando a palavra é nula (equivalente para leituras reais) | 1: o de registros à mão |
| M06 | precedência dos dois motivos de linha inteira trocada | 2: o de registros à mão, SEC-RWS-D-01 |
| M07 | registro ilegível deixa de ser motivo de linha inteira | 3 (o de registros à mão, SEC-RWS-C-06, SEC-RWS-D-01) |
| M08 | relato não carregado deixa de ser motivo de linha inteira (o D-01 reaberto) | 25 |
| M09 | a leitura deixa de dar `wholeRow` à parte | 6: os seis do arquivo novo |
| M10 | `wholeRow` só quando não há motivo de distância (a palavra de novo) | 6: os seis do arquivo novo |
| M11 | um motivo de distância retém linha sem distância (ir além da regra) | 5 (inclusive o teste da evidência legítima preservada) |
| M12 | linha sem distância lida como linha com distância | 7 |
| M13 | linha sem distância retida também pela própria lista ou declaração de falha (ir além) | 4 |
| M14 | a admissão passa só a palavra | 6: os seis do arquivo novo |
| M15 | as execuções leem só a palavra | 8 (E-01 1 e 4, C-01, B-01, matriz de linhagem leve e longão) |
| M16 | o histórico (S2, S3, L30) lê só a palavra | 3 (E-01 4, L3-d, L4-e) |
| M17 | L4 lê sempre a distância inteira dos próprios relatos | 6 (C-01, matriz, L3/L4, L3-d) |

Cobertura fina, dita: M05 morre por um teste só (o de registros à mão), M03 e M06 por dois. M11 e M13, que vão além da regra, morrem: os testes guardam a evidência legítima, não só a retenção.

## 11. Os testes novos

- **Reproduzem o defeito?** Sim. Os seis ficam vermelhos no congelado e verdes no patch. Os testes 1, 3, 4 e 6 caem em asserção de comportamento; os testes 2 e 5 caem antes numa asserção de forma (F-02). Com a forma presente e o leitor congelado (M01), os seis caem por comportamento; M02, M09, M10 e M14 também são mortos pelos seis.
- **O teste de resultado que a condição do SSCTR pede** é o teste 1: sessão de qualidade, ritmo de trabalho, relógio POOR, correção do atleta que lista, declara ou faz as duas, faixa e fatores contra o controle por hash, a calibração da resposta igual à calibração congelada sobre o registro admitido, o registro guardado não reescrito, crédito e plano iguais.
- **Fracos ou que afirmam o que não provam:** o `if(format)` do teste 4 (F-02); o teste 6, de prova, não reproduz efeito de ritmo (uma linha sem distância nunca foi resultado de prova; ele prova a nomeação, e o título diz isso); a parte de "fronteira desligada" do teste 5 mostra só que a calibração é a do registro nu, como sempre foi. Nenhum enfraquece expectativa anterior: nenhum teste existente foi editado.
- **Lacuna que os testes não cobrem:** F-01 (não é do patch).

## 12. Contrato de integração iOS (`e01-patch/IOS_RUN_REPORT_INTEGRATION_CONTRACT.md`, sha256 `2e417347…`)

- **Não apresenta nada como feito.** Diz na linha 4 que nada foi implementado, nenhum HealthKit lido, nenhum teste de adaptador existe, e que os dois hard gates seguem não atendidos; a seção 6 se chama "Hard gates de uma integração real: não atendidos", com o E-1 e as duas vozes. O `E01_PATCH.md` (seção 10) diz o mesmo, e o cabeçalho do ponto de entrada, que não mudou, segue dizendo que o hard gate não é atendido por nada ali. **O hard gate E-1 consta como não atendido.**
- Ele não cobre F-01 de forma expressa: a coluna do relógio lista o que o aparelho mediu, a do atleta lista condições e pausas, mas não há um "nunca" para os campos que colidem na fusão, nem teste. É onde a opção (a) de F-01 caberia.
- A seção 3 se declara "leitura vinculante" de uma linha de `ATHLETE_DATA_FOUNDATION.md`, documento amarrado por hash e não editado. Se o autor tinha autoridade para fixar essa leitura é questão de governança do dono daquele contrato e do Founder; não a julgo.

## 13. O que rodei e onde

- Scratch: `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/cc877d93-9457-4c53-b263-90eed80e7399/scratchpad/judges/qre-r6/r6-1794767342/`. Cópias: `frozen/` (`08d2dc8`), `patch/` (`f8b08aa`, onde corri os mutantes), `oracle/` (o congelado mais a troca da palavra), `frozen-e01/` (congelado mais o teste novo), `snap2/` (clone em `08d2dc8`, com `core.longpaths`, só para o `--check 1`; um primeiro clone, `snap/`, falhou no checkout por caminho longo e ficou como está, sem uso). Sondas em `probes/` (`r6lib.mjs`, `r6-scenarios.mjs`, `r6-diff.mjs`, `r6-entry.mjs`, `r6-table.mjs`, `r6-order.mjs`, `r6-bypass.mjs`, `r6-bypass2.mjs`, `r6-conflict.mjs`, `r6-s3long.mjs`, `r6-t4check.mjs`, `r6-which.mjs`); ferramentas em `tools/` (`verify-copy.mjs`, `make-oracle.mjs`, `mutate.mjs`, `auth.mjs`). Saídas em `out/` (`q5-workpace*.{frozen,patch}.json`, `entry.json`, `table.json`, `order.json`, `bypass*.json`, `conflict.json`, `s3long.json`, `t4check.json`, `diff-driver-{patch,frozen,patch-records}.json`, `joint-suite.tap`, `ext-suite.tap`, `e01-tests-on-frozen.tap`, `v1rws-preserved.txt`, `v1rws-check1-worktree.txt`, `v1rws-check1-snap-08d2dc8.txt`, `mutation.json`, `mutation.log`, `verify-*.json`). Nada apagado; nenhum diretório sobrescrito; os arquivos mutados foram restaurados reescrevendo os bytes originais, conferidos por sha256.
- No worktree, só leitura e as execuções permitidas: `node --test` (inteira, uma vez), `node --test "test/v1rws-*.test.mjs"` (uma vez), `node scripts/v1rws-freeze.mjs --preserved` e `--check 1`. As sondas importam o código do worktree por URL, sem escrever nele. Os comandos git que usei no worktree foram de leitura (`rev-parse`, `status`, `log`, `diff`, `show`, `ls-tree`, `archive`, e `clone` com o worktree como origem, escrevendo só no scratch). Não rodei `npm run verify`, nenhum `verify-r*`, nem `v1rc-journeys` ou `v1rc-fuzz`.
- As sondas do autor (`e01-patch/probes/`) não foram usadas como evidência, salvo as três do meu papel, sem mudança.

## 14. O que não verifiquei

- Meia e maratona; a prova pelo motor numa jornada com correção de linha sem distância além do plano de 10 km.
- `DURATION_REQUIRED` numa linha sem distância pelo ponto de entrada: a fusão leva a distância do relato sem duração para a linha, então só a mostrei em registro montado à mão (tabela). Não achei cliente conforme que a produza, como o autor.
- O efeito de F-01 na faixa leve observada (um corredor sem resultado, faixa P1 própria): medi só a faixa de limiar.
- A suíte inteira sob cada mutante (rodei os 114 da extensão); os 19 mutantes e a diferencial do autor.
- Os achados da R5 que não são E-01 (E-02 a E-07), que não reexercitei.
- O canal de evidência declarada (`runEvidence`), que não é relato de sessão.
- Valores e leituras esportivas (leituras 1 e 2, F-01 opção b), a custódia e a segurança da integração: de outros donos. O comportamento real do HealthKit.

## Contexto injetado pelo host

O host injetou no meu contexto o CLAUDE.md global, o CLAUDE.md do projeto e o MEMORY.md, que resumem rodadas anteriores e nomes de achados. Nada disso foi usado como evidência.

| Arquivo | sha256 |
|---|---|
| CLAUDE.md global (`C:/Users/carva/.claude/CLAUDE.md`) | `c75718d0d2fe2cce1332cf7240ef0b8013ca2901d52b4d6778480c1c333709c6` |
| CLAUDE.md do projeto (`C:/Users/carva/Desktop/myApp/MyApp/CLAUDE.md`) | `e657d059e06fd1a21613250753a8c79ac605b69d955191d634966b3c8fc922e6` |
| MEMORY.md (`C:/Users/carva/.claude/projects/C--Users-carva-Desktop-myApp-MyApp/memory/MEMORY.md`) | `e1b1cd9a98c19f036b22dbc6dda4b13b69c41bfb011ac9b775d6f14527165538` |
