# V1 Run Extensions — patch pós-freeze do QRE-RWS-E-01: registro do autor (2026-11-15)

**O que é:** a correção focal do QRE-RWS-E-01, sobre o candidato congelado em `COACHINGCORE-V1-RUN-FORMAT-FREEZE-1` (V1RWS-1). Candidato para a revisão independente; nada foi congelado nem aprovado por este registro.

- **Base:** `08d2dc8` (branch `claude/v1-run-extensions`, árvore limpa ao começar). O runtime ali é byte a byte o do candidato julgado `4b1622f`.
- **Mudança de runtime:** 2 arquivos, 12 linhas a mais e 5 a menos, das quais 3 linhas de código (seção 4).
- **Teste novo:** `CoachingCore/test/v1rws-e01.test.mjs`, 6 testes. Nenhum teste existente foi editado e nenhuma expectativa mudou.
- **Não tocados:** `r6-provenance.mjs`, `r6-adaptation.mjs`, `v1-run-calibration.mjs`, `v1-run-index.mjs`, `v1-index.mjs`, `v1-run-format-index.mjs`, os valores `RUN_FORMATS_V1.json`, o script e o registro do freeze V1RWS-1, e tudo sob `phase-a/`.
- **Race Forecast:** não iniciado.

## 1. Reprodução, antes de editar

As duas sondas do juiz de Quality da rodada R5, sem mudança, rodadas contra o worktree em `08d2dc8`. Cópias em `probes/judge/`, com os mesmos sha256 que o juiz registrou.

| Sonda | sha256 | Caso | Congelado | Patch |
|---|---|---|---|---|
| `q5-workpace2.mjs` | `8467d915…` | fundida, sem correção | nada retido, limiar `[300,335]`, `c65ab1fd…` | igual |
| | | correção simples | 4× `REPORT_NOT_CARRIED`, `[300,335]`, `c65ab1fd…` | igual |
| | | **correção que lista uma gravação** | **nada retido, `[290,325]`, `a7a23d20…`** | 4× `REPORT_NOT_CARRIED`, `[300,335]`, `c65ab1fd…` |
| `q5-workpace.mjs`, unidade | `9944228c…` | lista uma gravação | leitura `SEVERAL_RECORDINGS`, retenção `[]`, entregue sem POOR | retida `REPORT_NOT_CARRIED`, entregue POOR |
| | | declara com motivo de falha | leitura `CORRECTED_MEASUREMENT`, retenção `[]`, entregue sem POOR | retida `REPORT_NOT_CARRIED`, entregue POOR |

Os números do congelado são os que o juiz e o SSCTR registraram. Saídas em `probes/out/judge-*.json`.

## 2. O cenário, peça por peça

Sonda minha, `probes/p1-decompose.mjs`, pelo ponto de entrada, nas duas árvores (`probes/out/p1-decompose.*.json`). Sessões de qualidade das semanas 3 a 6; o atleta relata o ritmo de trabalho (255 s/km, esforço 7); a importação do relógio traz 9 km com `gpsQuality: POOR`; o atleta corrige o próprio relato.

| Peça | O que se vê no congelado (variante "lista uma gravação") |
|---|---|
| **Linha bruta** | A linha fundida `app-<sessão>` (9 km, POOR, ritmo de trabalho 255) fica aposentada por `app-<sessão>-v2`. A linha viva é a correção sozinha: `minutes`, `work.paceSecondsPerKm: 255`, `rpe: 7`, `segments`; **sem** `distanceKm`, **sem** `gpsQuality`, **sem** `mergedSourceIds` |
| **Relatos em vigor** | `app-<sessão>-v2` (atleta) e `dev-<sessão>` (o relógio, POOR). A linha viva é feita só do primeiro. O relato do relógio está em vigor e fora da linha |
| **Leitura** | Uma palavra só: `SEVERAL_RECORDINGS`. O `REPORT_NOT_CARRIED` não aparece |
| **Campos admitidos** | A linha vai à calibração como o próprio objeto do registro: `work`, `rpe`, `minutes`, `segments`, sem marca POOR |
| **Campos retidos** | Nenhum. `paceEvidenceWithheld` vazio; `execution.paceWithheld` nulo |
| **Calibração** | Limiar `[290,325]`. `capacity.trainingFactors.THRESHOLD_CONTROLLED`: fração `+0,03`, desde 2026-12-28, citando `app-w5-run-d1-v2` e `app-w6-run-d1-v2`, 255 s/km, esforço 7 |
| **Consumidores** | A resposta da semana seguinte, a calibração exportada (`runCalibrationOf`) e a execução da sessão leem a linha como não retida. O restart retira os fatores e dá `[300,335]`, mas também não nomeia as 4 linhas |
| **Origem da mudança** | O campo `actual.work.paceSecondsPerKm` das duas últimas linhas vivas. Tirando só esse campo do registro nu, a calibração congelada volta a `[300,335]`, o mesmo hash do controle |

A variante "declara com motivo de falha" (`CORRECTED_MEASUREMENT`) dá o mesmo pelo ponto de entrada: `[290,325]`, fração `+0,03`. O juiz e o SSCTR tinham mostrado essa variante só em unidade.

## 3. Causa

Dois trechos que só falham juntos:

1. `reportsReading` (`v1-run-format.mjs`) devolvia **uma palavra**, pela precedência aceita: os motivos de distância dos relatos da própria linha, depois `REPORT_NOT_CARRIED`, depois `REPORTS_UNREADABLE`.
2. `distanceFacts` (`v1-run-history.mjs`), numa linha sem distância, só retém por motivo de linha inteira.

Quando um relato da própria linha diz qualquer motivo de distância, a palavra é esse motivo. Numa linha sem distância ele não retém nada, e o motivo de linha inteira nunca chega ao leitor. O estado tem duas informações de natureza diferente (o que a distância da linha é; se a linha diz tudo o que foi dito da corrida) e a leitura só carregava uma.

## 4. A correção

A leitura passa a dar o motivo de linha inteira à parte, e o leitor da linha o usa onde não há distância. A palavra, a precedência e a regra não mudam.

```
v1-run-format.mjs, reportsReading
- const lowest=…;
- return {withheld:several?…:disputed?'DISTANCE_DISPUTED':missing?'REPORT_NOT_CARRIED':facts.unreadable.length?'REPORTS_UNREADABLE':null, …};
+ const lowest=…,wholeRow=missing?'REPORT_NOT_CARRIED':facts.unreadable.length?'REPORTS_UNREADABLE':null;
+ return {withheld:several?…:disputed?'DISTANCE_DISPUTED':wholeRow,wholeRow, …};

v1-run-history.mjs, distanceFacts
- const paceWithheld=!has?(WHOLE_ROW_WITHHELD.includes(told)?told:null):several?…:disputed?'DISTANCE_DISPUTED':told;
+ const ofRow=[reading?.wholeRow,told].find(w=>WHOLE_ROW_WITHHELD.includes(w))??null;
+ const paceWithheld=!has?ofRow:several?…:disputed?'DISTANCE_DISPUTED':told??ofRow;
```

O resto do diff são comentários dos dois trechos. `git diff 08d2dc8 -- CoachingCore/src` mostra só esses dois arquivos.

- **Um ponto só.** `admitted`, `executionOf`, `runHistory`, a calibração exportada, as respostas que não entregam sessão e o restart já passavam a leitura inteira ao mesmo `distanceFacts`. Nenhum deles foi editado.
- **Linha com distância:** nada muda. Qualquer motivo já a retinha, e a palavra mostrada é a que era.
- **Nada novo é decidido:** nenhuma tolerância, limiar, palavra ou critério esportivo. A lista `PACE_WITHHELD` é a mesma, na mesma ordem.

## 5. O que mais o mesmo defeito alcançava

O achado do juiz era o ritmo de trabalho. Procurei os outros leitores da mesma decisão e os outros motivos que mascaram.

| Onde | Congelado | Patch |
|---|---|---|
| **Os quatro motivos de distância mascaram**, não só dois: `SEVERAL_RECORDINGS`, `CORRECTED_MEASUREMENT`, `DURATION_REQUIRED`, `DISTANCE_DISPUTED` | linha entregue inteira | retida |
| **Os dois motivos de linha inteira eram mascarados:** também `REPORTS_UNREADABLE` (registro de relatos ilegível, numa linha sem distância cujo relato lista uma gravação) | linha entregue inteira | retida |
| **Voltas de sessão nativa** (`execution.paceEvidence`, o contrato que o Race Forecast lê): sessão por voltas, relógio POOR, correção que declara falha | `paceEvidence: true`, `paceWithheld: null` em 2 sessões; a sessão da semana 6 saiu por tempo, porque a faixa se moveu | `false`, `REPORT_NOT_CARRIED`; formatos iguais aos do controle |
| **Fonte de dimensionamento S3** (`latestClassRun`): a corrida leve mais recente, por tempo, corrigida com declaração de 8 km e motivo de falha | a corrida retida era a fonte, a 442,5 s/km; as leves da semana seguinte saíram **por tempo** | a fonte é a corrida medida anterior; as leves saem por distância (11 e 9 km), como na correção sem motivo |
| **Linha fundida que não carrega um relato** (o atleta lista, o relógio só tem minutos, a correção do relógio é recusada pelo motor) | `[290,325]` | 4× retida, `[300,335]` |
| **Linha em conflito** (cliente L19 da diferencial anterior, na revisão em que a importação é recusada) | não nomeada; a calibração já não a lia | nomeada em `paceEvidenceWithheld` |
| **Prova** | uma linha sem distância nunca foi resultado de prova | igual; agora nomeada como retida |

O que **não** é alcançado: a referência de histórico (`historyReference`, L3 e L4) não depende da palavra; a conclusão e o crédito (`readCompletion`) não leem `paceWithheld`; `comparableLongRun` (S2) não exclui linha retida, como antes (decidido pelo SSCTR em L3 e L4: só baixa a referência).

## 6. Testes

**Arquivo novo: `test/v1rws-e01.test.mjs`.** Pelo ponto de entrada, salvo onde diz que monta um registro.

| Teste | O que cobre |
|---|---|
| Reproduzido e fechado | O cenário do juiz nas três variantes mascaradas. A linha como o juiz a achou; a palavra e o motivo à parte; o defeito no registro nu (`[290,325]`, fração `+0,03`, as duas sessões citadas); as 4 linhas retidas; a calibração com o **mesmo hash** do controle; a calibração da resposta igual à calibração congelada sobre o registro admitido; o registro guardado não reescrito; crédito, status e plano iguais aos do controle |
| A regra em registros montados à mão | Cada motivo de distância que o relato da linha pode dar, mais disputa e sem duração em linha fundida; registro ilegível; os dois motivos juntos; **evidência legítima preservada** (linha sem distância que carrega todos os relatos); linha com distância como antes; o leitor `distanceFacts` com palavra, com leitura antiga e com leitura nova; lista de motivos inalterada |
| Ordens, correção tardia, linha fundida parcial | Quatro ordens de chegada; correção no meio da semana seguinte (até a semana 8); linha fundida que não carrega a correção recusada; a mesma linha quando carrega tudo (nada retido, hash igual ao da calibração congelada sobre o registro como está); um autor só que lista ou declara |
| Os outros leitores | Voltas de sessão nativa; a fonte S3 e as sessões da semana seguinte; o que a palavra sozinha escondia, em cada um |
| Registros guardados e respostas sem sessão | JSON e ordem embaralhada; calibração exportada; perder linhagem só retém mais; estado histórico do motor; calibração de uma semana anterior; restart; revisão recusada; revisão da fila anterior ao registro; fronteira desligada (calibração congelada sobre o registro nu, como sempre foi) |
| Prova | Linha sem distância; linha com distância que não é tudo o que foi dito; o controle de um autor |

**Resultados** (saídas em `probes/out/` e no scratch da sessão):

| Execução | Resultado |
|---|---|
| Testes novos no candidato | 6 de 6 |
| **Testes novos no congelado** (cópia de `08d2dc8`, runtime conferido byte a byte contra `4b1622f`) | **0 de 6**: cada um falha na asserção do motivo mascarado ou da faixa movida, nenhum por erro do teste |
| Testes da extensão, `node --test "test/v1rws-*.test.mjs"` | 114 de 114 (108 + 6) |
| Suíte conjunta, `node --test` em `CoachingCore/` | 1449 entradas, 1448 passam, **1 falha**: `V1RC COACHINGCORE-V1-FREEZE-1 is preserved: every file it binds is byte-identical here`, que acusa só `CoachingCore/src/r6-adaptation.mjs`. É a falha histórica, por desenho; o teste não foi editado. **A suíte conjunta não é verde nesta linha** |
| `node scripts/v1rws-freeze.mjs --preserved` | exit 0: `COACHINGCORE-V1-FREEZE-1` 197 de 197, o arquivo emendado com a base e o diff autorizados; `COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1` 30 de 30 |
| `--check 1` no snapshot do próprio V1RWS-1 (clone em `08d2dc8`) | exit 0: 97 arquivos conferem |
| `--check 1` nesta árvore | exit 1, `DRIFT`, e nomeia exatamente os arquivos do patch. É o esperado: o V1RWS-1 amarra os bytes de `4b1622f` e não é flexibilizado |

**Diferencial contra o congelado** (`probes/differential.mjs`, saída `probes/out/differential.txt`). Sem classificador de "decorrência".

| Camada | Medida | Resultado |
|---|---|---|
| A. Respostas | 137 clientes, 1003 revisões nas duas versões | 866 respostas byte a byte iguais; 117 clientes idênticos do começo ao fim; 20 divergem |
| | Os 20 que divergem | em todos, a primeira resposta diferente recebeu a **mesma requisição** nas duas versões e tem linha mascarada nos registros; motor, triagem, perguntas, ofertas, pausa e histórico iguais nessa resposta |
| | Os 102 clientes da diferencial anterior | 100 idênticos; 2 divergem numa revisão só (L19, leve e longão: a linha em conflito da seção 5) |
| B. Mesmos registros | Os leitores puros das duas versões sobre os registros de cada resposta: 18.474 leituras de linha | idênticos, salvo na linha mascarada; lá o patch retém pelo motivo de linha inteira e nada mais da linha muda |
| | A calibração exportada do patch | igual, em toda resposta, à **calibração congelada sobre a admissão congelada com as linhas mascaradas entregues como linha retida**: um oráculo que não usa nenhuma linha do patch |
| C. Tabela | 480 combinações de linha e fatos montadas à mão | 36 diferem, todas e só as mascaradas |
| | Inesperadas | **0** |

"Linha mascarada" é julgada pelo código **congelado**: linha viva de corrida, sem distância, cuja palavra congelada é um motivo de distância, com um relato em vigor fora da linha ou o registro ilegível.

Consequências contadas, nenhuma escondida:
- 170 leituras da camada B em que a calibração exportada congelada, sobre os mesmos registros, difere por ler linha mascarada;
- 27 leituras de linha em que o congelado dava `paceEvidence` verdadeiro;
- 6 sessões com outra fonte S3 na primeira resposta diferente: em 4 a expressão passa de tempo a distância (seção 7, leitura 2); em 2 o longão segue em 16 km e só o valor da fonte muda (360 para 365 s/km);
- 117 respostas depois da primeira divergência, onde os dois clientes já não são o mesmo cliente (cada um relata as sessões como lhe foram prescritas). Nelas confiro só duas coisas: o motor responde igual quando recebe a mesma requisição, e nada que o congelado retém é entregue.

**Mutação** (`probes/mutation.mjs`, `probes/out/mutation.json`). Em cópias no scratch, nunca no worktree. O controle roda antes: 114 testes, 113 passam, e a única falha é `I10, V6`, que a cópia mínima não consegue rodar. Um mutante só morre por teste que o controle passa.

- 19 mutantes nas linhas do patch e nos três pontos que passam a leitura adiante: **19 mortos**. Nenhum morto só pelo teste de custo.
- O mutante `E01` é a linha congelada de volta: morto por 6 testes, todos do arquivo novo. Nenhum teste anterior o matava: é a lacuna que o juiz apontou.
- Cobertura fina, dita: `E05`, `E08` e `E11` morrem por um teste só (o de registros montados à mão).

## 7. Leituras do autor que pedem a palavra do juiz

| # | Leitura | Por quê, e o pior caso que testei |
|---|---|---|
| 1 | **Uma linha sem distância que carrega todos os relatos em vigor continua entregue inteira, mesmo quando o próprio relato dá um motivo de distância.** Não mudei isso | É o que o SSCTR condicionou ("um motivo de linha inteira retém…"), e ir além seria critério novo. Pior caso: o atleta relata ritmo de trabalho e lista uma gravação, o relógio só tem minutos, tudo na linha: nada retido, limiar `[290,325]`, igual no congelado e com a fronteira desligada. Se o SSCTR quiser que um relato com declaração de falha de medição não seja sessão comparável, é decisão dele, não deste patch |
| 2 | **A corrida retida deixa de ser fonte S3, e isso pode trocar uma sessão de tempo para distância.** No cenário da seção 5, quatro corridas leves que o congelado entregava por tempo saem por distância (11 e 9 km), com a mesma dose em minutos e dentro de CT-1 a CT-3 | Não é só "reter mais é mais conservador". É a regra L1 aplicada à fonte S3 (que já excluía linha retida), e o resultado é o mesmo da correção sem motivo, que o congelado já dava. Peço confirmação expressa do SSCTR |
| 3 | **A palavra mostrada numa linha mascarada é o motivo de linha inteira** (`paceEvidenceWithheld[].reason`, `execution.paceWithheld`). `reportsVerdict` continua devolvendo a palavra única, que numa linha sem distância pode ser um motivo de distância | Quem retém tem de passar a leitura inteira, não a palavra. Está dito no comentário e fixado em teste (o que a palavra sozinha esconde). Nenhum ponto do runtime passa a palavra sozinha; mutantes `E17` e `E18` |
| 4 | **Com os dois motivos de linha inteira juntos, mostra-se `REPORT_NOT_CARRIED`**, como já era em linha com distância | Precedência aceita na R5; mutante `E14` |
| 5 | **Linha em conflito mascarada passa a ser nomeada como retida** | O que já acontecia com linha em conflito com distância. A calibração nunca a leu |
| 6 | **O custo L1-f aumenta.** Mais corridas ficam fora da evidência de ritmo para sempre: as que o atleta corrige listando ou declarando depois de o relógio também as ter relatado. Vale também quando o relógio não marcou POOR (cliente Q20): a faixa que se moveria com a linha fundida deixa de se mover depois da correção | É o custo que o Founder e o SSCTR aceitaram para a correção simples. A fração real continua sendo da integração dizer |

## 8. O que não verifiquei

- Meia e maratona; a prova pelo motor numa jornada inteira com linha sem distância (usei as linhas como o motor as guarda).
- Sem duração e disputa numa linha sem distância pelo ponto de entrada: só em registro montado à mão. Não achei cliente conforme que as produza.
- A suíte inteira sob cada mutante: rodei os 114 testes da extensão.
- Valores e leituras esportivas, e a custódia: de outros donos.
- Com que frequência a combinação acontece com atletas reais, e o comportamento real do HealthKit.

## 9. Segurança

Não pedi revisão focal de Security. O diff não toca a fronteira de registros: nada muda no que é gravado, selado, lido como legível ou atribuído a um autor, e nenhuma chave nova entra num registro. A chave nova (`wholeRow`) vive na leitura em memória. O efeito é só reter mais; a camada B da diferencial mostra que nada retido passa a ser entregue. Se o juiz de Quality vir efeito na fronteira de registros, a revisão de Security é pedida antes de qualquer freeze.

## 10. Contrato de integração iOS

`IOS_RUN_REPORT_INTEGRATION_CONTRACT.md`, nesta pasta. É orientação documental vinculante para o adaptador; não é integração. O hard gate E-1 segue **não atendido**.

`CURRENT_MISSION.md`, `MISSION_LEDGER.md` e a fila humana não foram alterados.
