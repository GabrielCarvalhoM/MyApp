# V1 RWS — Linhagem de evidências e semântica de correção

**Diagnóstico focal de 2026-11-14, antes do próximo fix-forward.** Somente leitura: nenhum arquivo do runtime, nenhum teste e nenhum freeze foi alterado; nada foi implementado.

- Branch própria `claude/v1-rws-evidence-lineage`, criada de `a4a434f`. O worktree `v1-run-extensions`, onde o Fable implementa, não foi tocado.
- Runtime lido: `a4a434f`, igual em `CoachingCore/` ao candidato julgado `5289667`.
- Executado pelo Chief em Fable 5.2. O pedido nomeava Opus 5.5 High; a sessão recebida roda em Fable 5.2.
- Decisões esportivas dos itens L1 a L5: `SSCTR_RWS_LINEAGE_ITEMS.md` (r2), ao lado deste arquivo. O SSCTR aceitou os cinco, com condições (seção 7).

## 1. Resposta

**A menor mudança que fecha a classe: uma linha só vai a um leitor de ritmo com a sua distância quando carrega todos os relatos que ainda valem para a sessão.**

São três partes:

1. Todo relato de corrida recebido deixa um fato com **quem falou**: o atleta, ou uma atividade de aparelho.
2. Um relato vale até que **o seu próprio autor** o substitua por uma correção que o motor aplicou. Ninguém substitui o que outro autor disse.
3. Se algum relato em vigor não está entre os relatos de que a linha viva foi feita, a distância dessa linha é retida. Nada do que o relato disse precisa ser enumerado.

A mudança fica em `v1-run-format.mjs` (o fato de relato e a sua leitura) e em três chamadas de `v1-run-format-index.mjs`. Motor, calibração, valores e registros do motor não mudam. Nenhuma tolerância nova.

**O custo, dito de frente.** Com o motor como está congelado, depois que uma fonte corrige uma corrida que a outra também relatou, essa corrida sai da evidência de ritmo e não volta. A linha do motor passa a ter só o relato de quem corrigiu, e não existe operação que recoloque o da outra fonte. Só a evidência de ritmo dessa corrida é perdida: conclusão, crédito, carga e dose são os do motor, como hoje.

O que essa mudança **não** fecha, e de quem é: seção 2.4 (o motor congelado) e seção 8 (integração).

## 2. Diagnóstico

### 2.1 Reprodução

Sondas dos juízes da última rodada, sem mudança (sha256 conferido contra as originais), sobre uma cópia de `a4a434f`. Saídas em `probes/out/`.

| Sonda | Resultado | Confere com o parecer |
|---|---|---|
| `judges/q4-corr.mjs` | fundida: `SEVERAL_RECORDINGS`, EASY `[345,420]`, histórico 11. Depois da re-sincronização da importação com esforço: linha `dev-x-v2` sozinha, nada retido, **`[345,575]`**, histórico 6,6 | sim |
| `judges/q4-corr-disputed.mjs` | disputa e sem duração: `[345,420]` retido; depois da correção da importação **`[345,575]`**, nada retido | sim |
| `judges/q4-corr-race.mjs` | fundida: nenhum resultado; depois: **`plan-race:dev-race-v2`, 6 km em 3000 s** | sim |
| `judges/ssctr-m2-empty-merge.mjs` | sobreposição: `extentKm` **22**, CT-3 **24,2**, nas três ordens, com e sem a chave `segments` | sim (SSCTR-RWS-D-01) |
| `judges/sec-s1-signal.mjs`, V10 | fato reetiquetado como formato: triagem `NOT_RAISED`, 8 nativas | sim (SEC-RWS-D-01) |

### 2.2 Causa-raiz

O ponto exato são duas linhas de dois donos diferentes.

1. **Motor congelado, `src/r6-provenance.mjs:116-126` e `:150`.** Na fusão, `byEvent` aponta o id de cada relato fundido para a mesma linha. Uma correção (`correctionOf`) acha essa linha por qualquer um desses ids e a aposenta **inteira** (`retire`). A linha viva passa a ser só a observação da correção (`:152`), sem `mergedSourceIds`. Para o motor, corrigir é reafirmar a execução inteira: não existe correção de uma parte.
2. **Extensão, `src/v1-run-format.mjs:504` e `:519`.** `reportsVerdict` lê os fatos só de `sourcesOf(linha viva)`. Depois da correção essa lista é só o id da correção. O que os outros relatos disseram continua guardado, mas ninguém mais lê. E o que eles disseram e a extensão **não** guarda como fato (calor, pausas para caminhar, a resposta do atleta) some com a linha.

A linha aposentada segue no registro, com `supersededBy` e os seus `mergedSourceIds`. A informação para saber o que foi corrigido existe; falta saber quem falou cada relato.

### 2.3 É uma classe, não um caminho

`probes/d-matrix.mjs` (saídas `out/d-matrix-EASY.txt` e `-LONG.txt`; os números entre parênteses são os cenários), `d-other-statements.mjs` e `d-late-race.mjs`:

| Caminho | Hoje | Por quê |
|---|---|---|
| A importação corrige a sua parte (03 a 07): três ordens de chegada, nomeando o próprio relato ou o id da linha, correção de correção, tudo numa revisão, replay; e numa semana posterior | `[345,575]`, nada retido | o relato do atleta saiu de `sourcesOf` |
| A re-sincronização vem com outro id de atividade (20) | igual | igual |
| **Conflito (18):** a importação está no registro; o relato do atleta (outros minutos, lista o 2º arquivo) é recusado pelo motor; a importação se re-sincroniza e o conflito se resolve | `[345,575]`, nada retido | o relato recusado não está em linha nenhuma. **Ler a cadeia de correção da linha viva, como o parecer sugere, não fecharia este** |
| **O atleta disse outra coisa que desqualifica a corrida** (`d-other-statements`): calor, ou pausas para caminhar. Fundida: `[345,420]`. Depois que a importação se re-sincroniza | **`[345,575]`** | essas afirmações não são fato de relato. **Ler os fatos de distância de todos os relatos em vigor também não fecharia este** |
| **Parada por sintoma (21, longão; achado do SSCTR):** a importação diz que completou, o relato do atleta com a parada é recusado no conflito, a importação se re-sincroniza | a linha viva é a importação, 16 km completos, nada retido, histórico 16 | a triagem da extensão segue `REQUIRED`; a distância dessa corrida vai a ritmo e a histórico |
| **O resultado aceito "corrigida para uma medida inteira volta a ser evidência" (08)** | nada retido | o mesmo mecanismo: a correção do atleta tirou de `sourcesOf` a importação de 6,6 km |

Sobre o último. Os cenários 08, 09 e 10 são **as mesmas afirmações** (o atleta: 11 km numa medida inteira; a importação: 6,6 km nos 63 minutos inteiros):

| Cenário | Ordem | Hoje | Histórico |
|---|---|---|---|
| 08 | o atleta lista, a importação chega, o atleta se corrige | nada retido | 11 |
| 09 | o atleta lista, o atleta se corrige, a importação chega | `DISTANCE_DISPUTED` | 6,6 |
| 10 | sem correção nenhuma | `DISTANCE_DISPUTED` | 6,6 |

O resultado esperado dos testes `v1rws-fix-forward.test.mjs:94-97` e `v1rws-final-fix.test.mjs:128-131` é o do cenário 08. Ele depende da ordem de chegada e do próprio defeito. Qualquer regra que feche a classe muda esse resultado (item L1).

### 2.4 Quem possui o quê

| Fato | Dono | Depois de uma correção |
|---|---|---|
| Conclusão, minutos, carga, resposta do atleta (esforço, recuperação), formato citado, voltas, condições, pausas | motor, na linha viva | só o que a correção trouxe |
| Parada por sintoma | extensão: fato por relato, e toda linha do registro | nunca sai; só a triagem respondida depois dela |
| O que cada relato disse da distância (lista mais gravações; declarou com motivo de falha; mediu sem duração; os números) | extensão: fato por relato | guardado, mas lido só na linha viva |
| Distância entregue a ritmo, capacidade e prova | extensão (`admitted`) | a da linha viva, retida conforme o veredito: **o defeito está aqui** |
| Histórico de distância | extensão (`runHistory`) | a da linha viva |

**Achado no motor congelado (E-1), fora do alcance desta extensão.** `probes/d-engine-frozen.mjs`, pelos pontos de entrada `v1-index.mjs` e `v1-run-index.mjs` (`r6-provenance.mjs` é byte a byte o de `c8104c1`): o atleta relata a corrida com recuperação `ADVERSE`; a importação da mesma corrida se funde; a importação se re-sincroniza com `correctionOf`. A linha viva fica com as respostas da importação: recuperação e esforço `UNKNOWN`, e `adverseSessions` da semana vai de 1 para 0. Não é regressão nem é da RWS: é a regra do motor (corrigir é reafirmar tudo) encontrando uma correção feita pela outra fonte. Nesse cenário o status do motor foi `MODIFY` nos dois casos; não procurei um caso em que a decisão muda.

O SSCTR viu a mesma perda com a parada por sintoma (cenário 21, longão), e ela vem antes de qualquer correção: o relato do atleta com a parada já sai da linha do motor pela quarentena do conflito. Depois da re-sincronização o motor explica a semana como executada conforme o plano. Só a triagem da extensão guarda o sinal.

`probes/d-recompose.mjs`: reenviar o relato do atleta com um id novo numa revisão **posterior** recompõe a linha do motor (ADVERSE, a lista, o formato citado). Na mesma revisão, ou repetido com o id antigo, não recompõe.

## 3. Contrato de linhagem

### 3.1 Identidades

| O quê | Identidade | Onde está |
|---|---|---|
| Relato | o `eventId` da observação recebida | `report.reportId` no fato |
| Atividade | o id da atividade do aparelho | `source.activityId` ou `canonicalActivityId` |
| Autor | o atleta (todo relato do app ou manual), ou uma atividade de aparelho | **novo no fato** |
| Execução | a sessão planejada (`session:<id>`, a identidade do motor) | `sessionId` |
| Linha | o `eventId` do primeiro relato fundido, com `mergedSourceIds` | registro do motor |

O id que uma correção nomeia é o da linha que o cliente viu. Numa linha fundida esse é o id do relato que chegou primeiro: **ele não diz qual autor está sendo corrigido**. Quem diz é o autor da própria correção.

### 3.2 Relações

- **Fusão.** Dois relatos que concordam viram uma linha, que carrega os dois. Nenhum sai de vigor.
- **Correção aplicada.** Uma correção que o registro do motor mostra aplicada: alguma linha aposentada a nomeia em `supersededBy`. Uma correção que o motor recusou não é aplicada e não substitui nada.
- **Linhagem de uma correção.** Os relatos das linhas que ela aposentou, e os das linhas que as correções entre esses relatos aposentaram, até o fim.
- **Substituição.** A regra 1 da seção 3.3.
- **Retração.** Uma correção que diz que a corrida não foi feita. Mesma regra; a linha viva fica sem distância e nada é entregue.
- **Duplicata e replay.** O mesmo relato de novo não muda nada e não acrescenta fato.
- **Conflito.** Um relato que o motor recusou por contradizer outro continua sendo um relato da sessão, em vigor, em linha nenhuma.

### 3.3 A regra

> **1. Em vigor.** Um relato está em vigor até que o seu próprio autor o substitua. Uma correção aplicada substitui todo relato da mesma sessão e do mesmo autor que esteja na linhagem dela, ou que o registro de relatos tenha guardado num instante anterior ao dela. Ela nunca substitui o que outro autor disse. O que não se consegue mostrar fica em vigor.
>
> **2. Linha inteira.** Uma linha só é entregue com a sua distância a um leitor de ritmo, de capacidade ou de prova quando carrega todos os relatos em vigor da sua sessão: cada um é um dos relatos de que a linha viva foi feita. Senão a distância é retida, com um motivo próprio.
>
> **3. Na linha inteira, a leitura de hoje.** Quando a linha carrega todos, vale a leitura atual, sem mudança: os fatos de distância dos relatos da própria linha.

- **Mesmo autor:** os dois são do atleta, ou os dois são da mesma atividade de aparelho, com id conhecido.
- **A parada por sintoma fica fora desta regra.** Nenhuma correção, fusão ou conflito a remove; só a triagem respondida depois dela, como hoje.
- **A linhagem só retém, nunca acrescenta.** A distância de uma linha vem sempre da linha viva.
- **Nada é enumerado na regra 2.** Ela não pergunta o que o relato que ficou de fora disse. Por isso cobre o calor, as pausas, a resposta do atleta e a marca POOR do aparelho, que não são fatos de relato.

`probes/oracle.mjs` é essa regra escrita fora do runtime. A coluna `contract` das saídas da matriz é o que ela dá em cada cenário; a linha `weaker reading` é o que daria ler só os fatos de distância de todos os relatos em vigor, a regra que a sonda `d-other-statements` mostra insuficiente. O oráculo é referência para conferir, não código a copiar.

### 3.4 As cinco perguntas do pedido

| Pergunta | Resposta |
|---|---|
| A. Correção de um relato individual (a importação corrige a sua medida) | Saem de vigor os relatos anteriores **daquela atividade**. Tudo o que o atleta disse continua em vigor. Como a linha do motor deixou de carregar o relato do atleta, a distância dela é retida. |
| B. Correção da execução inteira | Só existe quando a execução tem **um autor**: a correção dele substitui tudo o que ele disse (cenários 13 e 14). Com dois autores, ninguém tem autoridade para retirar o que o outro disse; só a custódia, por reparo auditado (seção 6). |
| C. Correção de uma linha fundida | A linha se aposenta inteira no motor. Na extensão, só os relatos do autor da correção saem de vigor; os do outro autor seguem em vigor e fora da linha. |
| D. Retração, duplicata, replay | Retração: como A, e a linha viva não tem distância. Duplicata e replay: nada muda. |
| E. Correção de correção | Cada correção aplicada substitui os relatos do mesmo autor na linhagem dela. O conjunto em vigor é o mesmo em qualquer ordem em que o motor aplique as mesmas correções (cenários 05, 06, 12). |

### 3.5 Admissão por consumidor

| Consumidor | Lê | O que muda |
|---|---|---|
| Conclusão e crédito | motor e `readCompletion`, na linha viva | **nada** (regra de dose; o leitor não recebe os relatos) |
| Carga | minutos da linha viva, no motor | nada |
| Ritmo: P1, Q8, fonte S3 (`latestClassRun`), `paceEvidence` | registro admitido (`admitted`) | a linha que não carrega todos os relatos em vigor chega sem distância |
| Capacidade (V1RC) | registro admitido | igual |
| Prova | linha RACE viva, pelo registro admitido | igual: só é lida de uma linha inteira que nenhum relato dela retém |
| Histórico de distância (L30, longão comparável, `extentKm`) | `distanceFacts` da linha viva | o motivo de retenção; e os itens L3 e L4 (seção 7): a referência só é rebaixada, nunca criada |
| Sinal de sintoma | fatos de relato e toda linha | nada |

### 3.6 Soma de gravações (SSCTR-RWS-D-01)

A soma indevida nasce em `src/v1-run-history.mjs:72`: `distanceFacts` soma a distância da linha com a lista da linha. Depois de uma fusão, a distância pode ser de um relato e a lista de outro.

| Situação | O que a distingue | Quem consegue |
|---|---|---|
| Dois arquivos que são partes diferentes | cada gravação com a sua identidade, todas diferentes | só a integração |
| Duas fontes que gravaram a corrida inteira | a mesma gravação aparece nas duas, ou os intervalos de tempo coincidem | só a integração |
| Sobreposição parcial | nada no Core a demonstra | ninguém, sem identidade |

Nenhum número resolve identidade. O que o Core sabe sozinho, pelos fatos de relato, é **se quem listou as gravações também disse a sua própria primeira distância**. Daí a guarda do item L3, só para o histórico: a lista é somada à menor entre a distância da linha e a que o próprio relato que a listou disse. Não muda nenhum resultado aceito.

O que continua precisando do contrato de dados: um relato sem distância própria que lista uma gravação que a importação também traz (a forma da SSCTR-RWS-C-05, 26 km), e o lado do crédito da contagem dupla.

### 3.7 Quando a proveniência não basta

Em todos estes casos a correção **não substitui nada**. Mais relatos ficam em vigor, e por isso mais distância é retida:

- o registro de relatos não tem fato legível da correção, ou o autor dela não é conhecido;
- nenhuma linha aposentada a nomeia (o motor a recusou, ou o registro carregado perdeu a história);
- um aparelho sem id de atividade (nunca é "o mesmo autor" de nada);
- uma re-sincronização com outro id de atividade (cenário 20);
- um relato sem linha, guardado no mesmo instante da correção.

Uma linha de fato ilegível continua retendo tudo (`REPORTS_UNREADABLE`), como hoje.

### 3.8 O que o QRE pode verificar

| # | Propriedade | Invariante do pedido |
|---|---|---|
| V1 | Para os mesmos relatos e as mesmas correções aplicadas, o conjunto em vigor é o mesmo em qualquer ordem de chegada, numa revisão ou em várias. Ver o limite abaixo | 1 |
| V2 | Depois de uma correção de um autor, todo relato de outro autor segue em vigor | 2 |
| V3 | Depois de uma correção aplicada de um autor, nenhum relato anterior dele na sessão segue em vigor | 3 |
| V4 | Nenhuma linha que deixa de carregar um relato em vigor chega com distância à V1RC, à S3 ou a `paceEvidence`. Nos cenários da matriz em que hoje sai `[345,575]` por esse caminho, deixa de sair | 4 |
| V5 | Uma prova só é lida de uma linha inteira que nenhum relato dela retém | 5 |
| V6 | A triagem pedida por uma parada é a mesma antes e depois de qualquer fusão, conflito ou correção | 6 |
| V7 | A linhagem nunca acrescenta distância, crédito nem fonte medida. A retenção do contrato contém a de hoje: nada que hoje é retido passa a ser entregue | 7 |
| V8 | Uma corrida entra uma vez no histórico, antes e depois de correção, com as linhas aposentadas no registro | 8 |
| V9 | Mesma leitura depois de ida e volta por JSON, registros embaralhados, restart, `historicalStateOf` e `runCalibrationOf` exportado | 9 |
| V10 | Uma passada por registro, mais as linhas da própria sessão; a caminhada da linhagem não repete linha (registro hostil com ciclo em `supersededBy`) | 10 |
| V11 | Perder evidência de linhagem (linha aposentada, fato da correção, autor) só deixa mais relatos em vigor | fallback |

**O limite do invariante 1.** O conjunto em vigor não depende da ordem. Mas o que a linha do motor carrega depende: as mesmas afirmações podem chegar a uma linha que carrega os dois relatos (09) ou só um (08). O contrato retém na segunda. A diferença só vai para o lado de reter: nenhuma ordem entrega uma distância que uma linha inteira reteria. Igualar as duas ordens exigiria o motor recompor a linha a partir dos relatos em vigor, o que esta missão não propõe.

Na saída da matriz, a marca `!! NOT STABLE` apareceria se o oráculo desse outro resultado depois de JSON e de embaralhar os registros: não aparece em nenhum cenário.

## 4. Plano mínimo

### 4.1 O que muda

| Arquivo | Função | Mudança |
|---|---|---|
| `src/v1-run-format.mjs` | `reportFactOf` | o fato ganha o autor. **Todo** relato de corrida de uma sessão planejada deixa fato, também o que não diz nada sobre distância nem parada |
| | `REPORT_KEYS`, `readableReport`, `stopOnly` | a forma fechada com o campo novo, dentro do selo; cai a exigência de o fato dizer alguma coisa |
| | `readReportFacts` | recebe também o registro do motor; indexa por sessão; calcula os relatos em vigor (uma vez por sessão). Sem o registro do motor, nada é substituído |
| | `reportsVerdict` | os motivos de hoje vêm primeiro, lidos nos relatos da linha como hoje. Depois deles: se algum relato em vigor da sessão não está em `sourcesOf(row)`, retém com o motivo novo |
| | `readReportFacts` (SEC-RWS-D-01) | linha etiquetada como formato que `readableFormat` recusa entra em `unreadable` |
| `src/v1-run-history.mjs` | `PACE_WITHHELD` | uma palavra fechada a mais, o motivo novo |
| `src/v1-run-format-index.mjs` | `evaluateProgram` (`received`) | passa o id da atividade ao fato |
| | `readingOf`, `runCalibrationOf` | passam o registro do motor a `readReportFacts` |

**O autor no fato:** forma fechada, sem texto livre: o atleta; uma atividade (um derivado fixo do id, nunca o id cru); ou aparelho sem id. Gravado na recepção, nunca inferido depois. Fica dentro do selo.

**Reaproveitar sem mudar:** `sourcesOf` (agora também para a linhagem), `admitted`, `admittedCalibration`, `heldAnswer`, `screenOf`, `distanceFacts`, `appendReportFacts`, a leitura de paradas em `readingOf`.

**Itens L3 e L4**, aceitos com condições (seção 7): em `distanceFacts` e `historyReference` (`src/v1-run-history.mjs`), que recebem dos relatos em vigor a menor primeira distância de quem listou (L3) e o menor valor utilizável que um relato declarou para a corrida inteira (L4). Só para a referência de histórico.

### 4.2 O que não pode mudar

- `src/r6-provenance.mjs`, `src/v1-run-calibration.mjs`, `src/v1-run-index.mjs`, `src/v1-index.mjs`: byte a byte.
- `src/r6-adaptation.mjs`: nenhuma emenda além da já autorizada.
- `v1/RUN_FORMATS_V1.json`: nenhum valor novo.
- Verificadores e testes dos freezes históricos; o teste histórico da V1RC continua falhando nesta linha por desenho e verde em `c8104c1`.
- A conclusão e o crédito (`readCompletion` pelo leitor do motor não recebe os relatos).
- A leitura das paradas.

### 4.3 Testes

- Um arquivo novo, `test/v1rws-lineage.test.mjs`, com a matriz da seção 5 pelo ponto de entrada. Pelas condições do SSCTR:
  - as três ordens para corrida leve, longão, prova, e para o atleta que diz calor ou pausas (L1-e);
  - os cenários 03, 08, 09, 10, 18 e 19 em leve e longão, com a referência de histórico e a expressão do próximo longão (L4-e);
  - a grade `m2` com a mesma dose e expressão do próximo longão, e o teto de 24,2 para 18,084 (L3-d).
- Em toda a matriz, nada que hoje é retido passa a ser entregue (L1-a).
- **Dois resultados esperados mudam, e só eles:** o caso `whole` em `v1rws-fix-forward.test.mjs:94-97` e em `v1rws-final-fix.test.mjs:128-131`.
  - Passam a: `withheld` com a sessão e o motivo novo; `paceEvidence` falso; `paceWithheld` o motivo novo.
  - Ficam como hoje: `merged`, `row.eventId`, status e crédito da execução, as bordas das faixas.
  - Caem as duas asserções de hash igual à calibração congelada, porque agora há retenção.
  - Entra no lugar: 08, 09 e 10 retidos, com as mesmas bordas e a mesma referência de histórico.
- O caso `late` de `v1rws-final-fix.test.mjs:124-127` **não** muda, pela precedência da seção 4.1: a própria correção lista o segundo arquivo, e o motivo continua `SEVERAL_RECORDINGS`.
- Qualquer outro teste existente que mude de resultado é achado a relatar, não expectativa a ajustar. O fix-forward confere todo teste com correção sobre linha fundida.
- Os testes que montam fatos à mão seguem a forma nova.

### 4.4 Registros existentes

Não há migração. A fronteira nunca foi ligada fora de testes, então não existe registro real com fatos. Um fato da forma anterior fica ilegível e retém tudo, o que a Security já aceitou para o candidato sintético (leitura 10).

## 5. Matriz de aceitação

"Admitida" quer dizer: a distância da linha viva chega aos leitores de ritmo, capacidade e prova. Conclusão e crédito são sempre os do motor na linha viva. Os números entre parênteses são os cenários das sondas.

| # | Cenário | Em vigor | A linha carrega todos? | Ritmo, capacidade, prova | Histórico |
|---|---|---|---|---|---|
| 1 | Corrida leve, um relato, uma medida inteira (01) | o relato | sim | admitida | a medida |
| 2 | Longão por distância, um relato, uma medida inteira | o relato | sim | admitida | a medida |
| 3 | Dois arquivos complementares: o atleta lista o 2º, a importação traz o 1º (02), três ordens | os dois | sim | **retida**, `SEVERAL_RECORDINGS` | a soma, como aceito |
| 4 | Prova em uma medida que atende às regras de prova | o relato | sim | lida | a medida |
| 5 | Prova em dois arquivos; e depois a importação se corrige (`d-late-race`) | o do atleta e a correção | antes sim, depois não | **não lida**, antes e depois | a da linha viva |
| 6 | Correção da importação sobre a linha fundida (03 a 07): três ordens, nomeando o próprio relato ou o id da linha, correção de correção, numa revisão só, numa semana posterior | o do atleta e a última correção da importação | não | **retida** | a da linha viva; nunca maior que antes |
| 7 | Correção do atleta; a importação continua em vigor (08, 11) | a correção e a importação | não | **retida**, concordem ou não os números | o menor entre a linha e o que a importação mediu (L4): 6,6 no 08 |
| 8 | As mesmas afirmações, a importação chegando depois da correção (09) | a correção e a importação | sim | pela leitura de hoje: retida se disputam, admitida se concordam | o mesmo valor do 08 (L4) |
| 9 | Os dois autores corrigidos (12) | as duas correções | não | **retida** | a da linha viva |
| 10 | Correção da execução inteira, um autor: lista e depois se corrige (13); só a importação e a sua re-sincronização (14) | a correção | sim | admitida | a medida |
| 11 | Duas fontes completas que concordam (15), três ordens | as duas | sim | admitida; a corrida conta uma vez | a medida |
| 12 | Duas fontes completas, e o atleta lista mais um arquivo (sobreposição) | as duas | sim | retida, `SEVERAL_RECORDINGS` | 16, não 22 (L3) |
| 13 | Duas fontes que disputam, sem correção (10) | as duas | sim | **retida**, `DISTANCE_DISPUTED` | o menor valor utilizável (L4) |
| 14 | Duplicata e replay de qualquer relato ou correção (07) | o mesmo de antes | o mesmo | o mesmo; nenhum fato novo | o mesmo |
| 15 | Retração pela importação ou pelo atleta (16, 17) | o outro autor e a retração | não | nada entregue: a linha viva não tem distância | nenhum |
| 16 | Correção que o motor recusa: fora da janela, cadeia inválida (06 no longão) | tudo, e ela também | como antes dela | o mesmo de antes, ou mais retido | o mesmo |
| 17 | Conflito, e a correção de um autor o resolve (18, 19) | o relato recusado do outro autor continua | não | **retida** | o menor entre a linha e o valor do relato recusado, quando ele declarou um para a corrida inteira (L4) |
| 18 | Re-sincronização com outro id de atividade (20) | tudo | não | **retida** | a da linha viva |
| 19 | O atleta diz calor ou pausas, e a importação se corrige (`d-other-statements`) | o do atleta e a correção | não | **retida** | a da linha viva |
| 20 | Histórico reconstruído: JSON, registros embaralhados, restart, `historicalStateOf`, `runCalibrationOf` | o mesmo | o mesmo | a mesma leitura | o mesmo |
| 21 | Parada por sintoma num relato, a outra fonte diz que completou, e depois qualquer correção (21) | o relato com a parada continua | não | **retida**; a triagem segue pedida | a da linha viva |

Linha 21: a triagem é pedida até ser respondida depois da parada, antes e depois de conflito, fusão ou correção. Isso já é assim hoje e nada nesta mudança o toca. O que muda é que a distância dessa corrida deixa de ir a ritmo.

O controle que mostra o custo: em `d-other-statements`, o atleta que não disse nada de especial tem a corrida lida como evidência antes da re-sincronização e retida depois.

## 6. Security e custódia

- **SEC-RWS-D-01, no Core.** Causa: `src/v1-run-format.mjs:493` pula toda linha etiquetada `RUN_FORMAT_EMITTED`, legível ou não. Fecha com a linha que não é formato legível entrando em `unreadable`. `probes/d-formats-selfread.mjs`: em 20 revisões de duas jornadas o ponto de entrada não escreveu nenhuma linha de formato que ele mesmo não lê (o último registro tinha 76 linhas de formato, todas legíveis, também depois de ida e volta por JSON). Duas jornadas é pouco: o fix-forward repete essa conferência com mais entradas antes de falhar fechado, para um registro honesto nunca se trancar.
- **O que a linhagem acrescenta à superfície.** Para um relato sair de vigor é preciso um fato legível da correção, do mesmo autor, e uma linha aposentada que a nomeie. Os dois são registros que o cliente guarda, com selo sem chave. Um cliente que os forja tira um relato de vigor. É o mesmo poder de apagar a linha do fato, que já é o limite declarado. Não é poder novo, e nada aqui o apresenta como autenticação. A confiança no autor gravado é da Security, antes de integração.
- **O que só a custódia fecha, sem mudança:** fato apagado ou ressignado, linha aposentada inventada, instante recuado. Cadeia com chave e gravação atômica dos registros (A-01, A-06).
- **Reparo de linha ilegível (SEC-RWS-D-02, SSCTR-RWS-D-02).** O leitor do Core continua falhando fechado e não aceita reparo vindo do cliente. O reparo é da custódia, antes de o registro chegar ao Core:
  1. Restaurar a linha da cópia selada, quando existe.
  2. Quando não existe, trocá-la por um fato legível que diga o mínimo seguro: uma parada sem motivo declarado, naquela sessão, sob o instante do reparo. O leitor de hoje já lê isso como parada por sintoma, e a triagem respondida **depois** do reparo a libera. Ausência de registro nunca vira ausência de sintoma, e o atleta tem saída.
  3. Apagamento e redação de dado de saúde (SEC-RWS-C-04) seguem o mesmo caminho: troca por esse fato, nunca edição no lugar.
  4. Todo reparo fica auditado na custódia: quem, quando, por quê.

  O app mostra `RUN_REPORT_UNREADABLE` como retenção de dados em reparo, não como triagem pendente.

## 7. Decisões do SSCTR

Registro: `SSCTR_RWS_LINEAGE_ITEMS.md`, r2. É decisão de itens, não rodada de revisão: nenhum candidato foi julgado. Autoridade interna provisória, sem credencial humana. Nenhum número novo, nenhum juízo clínico, nenhuma regra de dose ou crédito mudada.

| Item | Decisão | Condições que amarram o fix-forward |
|---|---|---|
| **L1** A regra do autor e a entrega só da linha inteira (seção 3.3) | `ACCEPT_WITH_CONDITIONS` | a: só retém, nunca acrescenta. b: a retração deixa fato e substitui os relatos anteriores do próprio autor. c: o autor é gravado na recepção. d: a confiança no autor e a guarda do fato novo são da Security, antes de integração. e: os testes nas três ordens. f: antes de integração, a integração declara que fração das corridas fica retida para sempre; se for material, o contrato de integração dá o caminho de volta |
| **L2** Relato recusado num conflito | `ACCEPT`, como consequência de L1 | as de L1; a parada segue a regra de triagem existente |
| **L3** A soma de gravações, no Core, só para o histórico (seção 3.6) | `ACCEPT_WITH_CONDITIONS` | a: não toca o `measuredKm` da conclusão. b: nunca cria histórico. c: **não fecha** a SSCTR-RWS-D-01, que segue condição de integração com a B-03, na forma de 26 km e no lado do crédito. d: a grade `m2` no fix-forward |
| **L4** Referência de histórico com relato em vigor fora da linha, ou disputa dentro dela: o menor entre o que a linha lê e os valores desses relatos | `ACCEPT_WITH_CONDITIONS` | a: só valores utilizáveis pela regra de histórico da r3a (POOR do aparelho, implausível ou sem duração não contam). b: se a linha não dá histórico, a L4 também não dá. c: um valor é o que o relato declara para a corrida inteira, nunca uma gravação listada sozinha. d: só a referência. e: os testes |
| **L5** O achado E-1 no motor congelado | `CONDITION` antes de integração e de atleta real; não pesa no candidato sintético | o mínimo abaixo; decisão do Founder sobre o motor só se a integração não o atender |

**O mínimo da integração (L5).** Em toda re-sincronização de importação de uma sessão que o atleta também relatou, um teste de resultado mostra três coisas:

1. A revisão que a aplica lê o que o atleta declarou por último: recuperação, esforço, função no dia seguinte, parada, dor, condições, pausas. Casos de teste: ADVERSE, SYMPTOM, FATIGUE e HEAT.
2. A triagem segue pedida para a parada por sintoma.
3. As declarações do atleta seguem em vigor.

Reenviar o relato do atleta não basta sozinho: só recompõe a linha numa revisão seguinte, e a revisão do meio não pode entregar prescrição calculada sem as respostas do atleta. O conteúdo clínico de qualquer rota de dor ou sintoma segue `CLINICAL_HUMAN_REQUIRED`.

**O que o SSCTR corrigiu neste diagnóstico**, já incorporado:

- A primeira regra que enviei (ler os fatos de distância de todos os relatos em vigor) foi aceita em r1. Depois da sonda `d-other-statements` eu a troquei pela da seção 3.3, e a r2 decide essa.
- "Só pode baixar o valor de hoje" tinha dois furos em L4: daí L4-b e L4-c.
- A prova não estava na matriz. Está agora em `d-late-race`, com as linhas da sonda do juiz; pelo motor numa jornada inteira, não.
- `out/q4-corr.json` estava condensada; agora é a saída crua.
- O oráculo que o SSCTR leu era o da primeira regra. O que está na pasta foi reescrito para a regra da seção 3.3, e as saídas da matriz foram refeitas com ele **depois** da decisão. Os resultados são os que a decisão descreve: 03 a 08, 11, 12 e 16 a 21 retidos; 09 e 10 retidos por disputa, como hoje; 13, 14 e 15 entregues.

Itens de fila humana **propostos pelo SSCTR, não anexados**: HQ-V1RWS-A-SSCTR-LINEAGE-L1L2 e HQ-V1RWS-A-SSCTR-LINEAGE-L3L4.

## 8. O que a integração precisa fornecer

O Core garante sozinho a regra da seção 3.3. Estas partes ele não consegue garantir:

| # | O quê | Por quê |
|---|---|---|
| I-1 | Toda importação traz o id da atividade, e ele é o mesmo em toda re-sincronização da mesma atividade | é a identidade do autor; com outro id a correção não substitui nada |
| I-2 | Uma edição do atleta nunca é enviada sob o id de uma atividade de aparelho | seria uma declaração manual lida como medida do aparelho (SSCTR-RWS-B-03) |
| I-3 | Cada gravação em um relato só, e cada gravação listada com a sua identidade | a soma de gravações (SSCTR-RWS-D-01, C-05) |
| I-4 | Uma correção reafirma tudo o que o seu autor diz da execução | o motor aposenta a linha inteira; o que a correção não repete, a linha perde |
| I-5 | A re-sincronização de uma importação, numa sessão que o atleta também relatou, não chega ao motor como `correctionOf` sozinho | achado E-1: a linha do motor perde a resposta do atleta. O mínimo exigido está no item L5 |
| I-6 | O registro do motor é guardado com as linhas aposentadas | sem elas nenhuma correção aparece como aplicada (o efeito é reter mais) |
| I-7 | Custódia com chave, gravação atômica, `asOf` do servidor, e o reparo da seção 6 | já abertos: A-01, A-06, C-08, SEC-RWS-C-03, C-04, D-02 |

**Um passo que fica para depois, de propósito.** A evidência de ritmo poderia voltar quando a outra fonte reenvia o seu relato sem mudança, com id novo (o caminho de `d-recompose`): o fato guardaria um resumo do que o relato afirma, e um relato em vigor contaria como carregado por outro igual, do mesmo autor, que esteja na linha. Não proponho agora. Depende de a integração adotar esse reenvio, e hoje não existe adaptador.

## 9. O que não verifiquei

- Nenhuma implementação: a regra foi conferida por um oráculo fora do runtime, não por código no Core.
- A prova pelo motor numa jornada inteira até a semana da prova: usei as linhas da sonda do juiz, como o motor as guarda.
- Se o HealthKit re-sincroniza com o mesmo id de atividade, e se o adaptador mandaria a re-sincronização como `correctionOf`.
- Um caso em que o achado E-1 muda a decisão do motor.
- A suíte inteira não foi rodada; nenhum teste foi rodado além das sondas.
- Outros testes existentes que possam mudar com a regra: só o fix-forward mostra.
- O custo da leitura por sessão num registro grande: é pelo desenho, sem medida.
- Com que frequência uma correção cruzada acontece com atletas reais, e portanto quanto de evidência de ritmo a regra custa.

Duas diferenças entre corrida leve e longão na matriz, explicadas:

- **Cenário 06.** No longão a corrida é do próprio dia da revisão. O instante que dei à correção fica antes do instante que o motor deu aos relatos, e o motor a recusa (`INVALID_CORRECTION_CHAIN`). É do horário da minha sonda; serve de caso de correção recusada (linha 16 da matriz).
- **Cenário 21.** Num conflito, qual relato fica como linha e qual é recusado depende do instante e, no empate, da ordem dos ids. Na corrida leve fica o relato do atleta, e a re-sincronização da importação é recusada. No longão fica a importação, e a re-sincronização resolve o conflito.

## 10. Como reproduzir

```
node probes/make-copy.mjs <worktree>/CoachingCore <diretório novo sob um scratchpad>
node probes/judges/q4-corr.mjs <cópia>/CoachingCore
node probes/d-matrix.mjs <cópia>/CoachingCore EASY > m.json && node probes/summ.mjs m.json
node probes/d-other-statements.mjs <cópia>/CoachingCore
node probes/d-engine-frozen.mjs <cópia>/CoachingCore
```

`make-copy.mjs` recusa um destino que já existe e não apaga nada. `judges/ssctr-m2-empty-merge.mjs` recebe a cópia como URL `file:///…/CoachingCore/`.

`out/sec-s1-relabel.json` é um extrato da saída de `judges/sec-s1-signal.mjs` (os casos V1, V4c e V10); a saída inteira não foi guardada.
