# QRE: fix-forward final da fase A do V1RWS, R4

**Veredito: `NOT_READY`.** Há 1 achado BLOCKING novo, de um caminho equivalente que o autor não cobriu:

- **QRE-RWS-D-01:** quando a outra fonte corrige a sua parte de uma linha fundida (a re-sincronização do relógio, `correctionOf` da importação), o motor congelado aposenta a linha fundida inteira e a linha viva passa a ser só a correção. O leitor de fatos lê só os relatos da linha viva (`sourcesOf`), então o que o relato do app disse (que havia um segundo arquivo, ou uma distância que disputa a da importação) deixa de ser lido. A V1RC volta a ler o primeiro arquivo sobre os minutos inteiros: EASY `[345,420]` vira **`[345,575]`** numa corrida leve (com esforço na re-sincronização), e uma prova em dois arquivos vira um **resultado de prova de 6 km em 50 min** (sem esforço nenhum). Já era assim em `9aed5e2`: não é regressão, é o B-01 por mais um caminho.

Os dois bloqueios da rodada anterior fecham: **QRE-RWS-C-01 e QRE-RWS-C-05 estão CLOSED**, cada um visto falhar em `9aed5e2` e fechar no candidato, em todas as variantes que montei. O QRE-RWS-B-01, que os dois detalhavam, continua **PARTIAL** pelo D-01. Pela regra da missão (uma correção, uma revisão), a fase fecha com esta evidência e nenhuma correção nova começa.

- **Juiz:** instância nova e independente de Quality & Reliability. Não escrevi o candidato, os relatórios anteriores nem a correção. No worktree escrevi só estes dois arquivos.
- **Data:** 2026-11-14.
- **Versões:** candidato `5289667` (HEAD; árvore sem mudança rastreada; havia três arquivos não rastreados de outros juízes em `reviews/security` e `reviews/ssctr`, que não li); fechamento anterior `9aed5e2` (runtime igual a `644cd8e`); base congelada `c8104c1`.
- **Registro habilitador:** não existe. Todos os probes usaram a autoridade de desenvolvimento (`DEV`) dos helpers; com a fronteira desligada (o padrão de hoje) a saída é a congelada (seção 4).

## 1. Reprodução em `9aed5e2`, antes de olhar o candidato

Extraí `9aed5e2` (`git archive`) no meu scratch e rodei os probes do meu antecessor sem mudança.

| Probe, cenário | `9aed5e2` | `5289667` |
|---|---|---|
| `p-merge-paths` A1 (app por tempo + importação com `segments: []`, mesma revisão) | **`[345,575]`**, linha `segments: []`, nada retido | `[345,420]`, linha guarda `[{4.4}]`, `SEVERAL_RECORDINGS` |
| A2 (app, depois importação) e A3 (importação, depois app) | **`[345,575]`** | `[345,420]`, `SEVERAL_RECORDINGS` |
| B1, B2 (dois relatos do app, um com lista vazia, nas duas ordens) | **`[345,575]`** | `[345,420]`, `SEVERAL_RECORDINGS` |
| A0, A4, C1, D1 (controles e variantes já fechadas) | `[345,420]` | `[345,420]` |
| D0 (um relato só, 6,6 km nos minutos inteiros: entrada legítima, igual por fora) | `[345,575]` | `[345,575]` (não foi desligado) |
| `p-inert` revisão da fila depois do ASK com parada | **`REVIEW_BEFORE_THE_RECORD`, `CALIBRATED`, `[345,575]`, sem triagem** | `CALIBRATED`, `[345,420]`, triagem `REQUIRED` |
| `p-inert` controle, HOLD retroativo, rota clínica, HOLD de integridade | `[345,420]` ou `WITHHELD_HOLD` | igual |

Vi as duas falhas e vi as duas fecharem.

## 2. Achados anteriores no meu campo

| Id | Estado | Evidência executada |
|---|---|---|
| **QRE-RWS-C-01** (era BLOCKING) | **CLOSED** | `q4-c01-matrix.mjs`: 2 versões (por tempo, nativa) × 9 formas da lista da importação (ausente, `[]`, `null`, `false`, `{}`, `0`, `''`, `[null]`, `[{}]`) × 4 ordens (mesma revisão app primeiro, mesma revisão importação primeiro, app e depois importação, importação e depois app). Em `9aed5e2`: **20 de 72** casos em `[345,575]` (`[]`, `false`, `{}`, `0`, `''` na versão por tempo, nas 4 ordens). No candidato: **0 de 72**; nos 72 sai `SEVERAL_RECORDINGS` e a linha guarda a lista do app (ou, com `false`/`''`/`[null]`, um valor que o leitor lê como arquivo ilegível). Controles: um arquivo inteiro `[345,420]`; um relato de 6,6 km nos minutos inteiros `[345,575]`. `q4-c01-paths.mjs`: três relatos (importação `[]`, segundo relato do app com 6,6 km e `[]`, app com a lista) `[345,575]` → `[345,420]`; duplicata da importação → `[345,420]`; registros por JSON a cada revisão, releitura na semana 6, `restartProgram` (`PROPOSED`, `SEVERAL_RECORDINGS` listado) e `runCalibrationOf` exportado → retido; fatos de relato apagados do registro → ainda retido (a linha guarda a lista); id de relato com 140 caracteres e importação `segments:false` → retido. `p-wiring.mjs` (oráculo meu: V1RC congelada com os argumentos do `v1-run-index.mjs` sobre registro admitido por regra minha): devolvido, restart e exportado iguais ao oráculo em 4 cenários, incluindo longão. **Nenhum destes caminhos entrega distância parcial a leitor de ritmo. O caminho da correção, sim: D-01.** |
| **QRE-RWS-C-05** (era BLOCKING) | **CLOSED** | `q4-c05.mjs`: 14 respostas × 2 registros (A: corrida em dois arquivos retida; B: o mesmo com uma parada por sintoma sem triagem posterior). Respostas: controle, anterior ao registro, anterior ao registro depois de ASK com parada, recusada (HOLD, versão não suportada, inválida), formato perdido, formato desconhecido, linha de fato ilegível, ASK de elegibilidade, rota clínica, observação em conflito, correção fora da janela, instante ilegível. No candidato: toda calibração devolvida é igual ao meu oráculo ou é nenhuma (`NOT_APPLICABLE`), menos com a linha de fato ilegível, onde é mais estrita que o oráculo por desenho (toda distância retida, `REPORTS_UNREADABLE`); a EASY nunca sai `[345,575]`; em B todas as 14 nomeiam a triagem (`REQUIRED`, com as sessões); nenhuma resposta inerte entrega sessão; recusadas, anteriores e formato desconhecido não mudam o registro de formatos; a mesma resposta depois de ida e volta por JSON em 28 de 28. Em `9aed5e2`: A "anterior ao registro", A e B "anterior depois de ASK" saem **`[345,575]`**, e em B nenhuma resposta inerte nomeia a triagem que o registro pede. Enumeração dos `return` na seção 3. |
| QRE-RWS-B-01 (BLOCKING na R2) | **PARTIAL** | Fechado por fusão em todas as ordens, formas e famílias que testei (C-01 acima). Aberto pela correção de uma parte da linha fundida (D-01). |
| QRE-RWS-C-02 (CONDITION) | **CLOSED** (parte de runtime) | `q4-robust.mjs c02`: fato de parada com motivo trocado → triagem `REQUIRED` com motivo `RUN_REPORT_UNREADABLE`, 0 nativas, toda distância retida (`REPORTS_UNREADABLE`); linha lixo no registro → o mesmo; a triagem respondida na revisão não libera. O apagamento de um fato continua silencioso (8 nativas, nada retido): só a cadeia com chave da custódia o distingue (Security A-01, integração). |
| QRE-RWS-C-06 (CONDITION) | **CLOSED** | `sourcesOf` deduplica; os fatos são somados numa passada. Linha com 1e5 ids fundidos (metade repetida): 364 ms. Ver o custo absoluto na D-04. |
| QRE-RWS-C-07 (NOTE) | **CLOSED** | Chave a mais no topo, no relato e em `stop`: ilegível. `recordedAt` recuado sem refazer o selo: ilegível; `recordedAt` fora da forma canônica: ilegível; de outro atleta: ilegível. Recuado com o selo refeito: lido (o selo é hash sem chave; um cliente hostil o refaz). Isto é da Security (cadeia com chave), não da forma da linha. |
| QRE-RWS-C-03 (NOTE) | **CLOSED** | K14 (N38) e K32 (N33) remutados por mim: mortos, cada um por um teste; K29 (N34) também morre agora (seção 7). |
| QRE-RWS-C-04 (NOTE) | **OPEN** | O teste I3/I4/SC-3 de `v1rws-execution` não mudou neste ciclo: a parte de `used` segue calculada pela função sob teste. Opcional. |

## 3. Respostas que não entregam sessão: todos os `return` de `src/v1-run-format-index.mjs`

| Linha | Resposta | Calibração que pode levar |
|---|---|---|
| 179 | `runCalibrationOf`, fronteira desligada ou entrada sem `program` objeto | a da V1RC, crua (congelada por desenho) |
| 181 | `runCalibrationOf` | sobre o registro admitido |
| 206 | `finish` com a fronteira desligada | a do `v1-run-index.mjs` (congelada) |
| 209 | `FORMAT_ERROR`, a leitura do registro lançou | `UNAVAILABLE`/`RECORD_NOT_ADMITTED`, ou nenhuma |
| 210 | `REVIEW_TIME_REQUIRED` | sobre o admitido, ou nenhuma |
| 274 | resposta ativa | sobre o admitido |
| 279 | `FORMAT_ERROR` do `catch` | sobre o admitido (a leitura já foi feita) |
| 285, 380 | sem plano (gerar, reiniciar) | `NOT_APPLICABLE`/`NO_PLAN` do `v1-run-index.mjs` |
| 288, 384 | plano novo, reinício | sobre o admitido (`finish`) |
| 307 | fronteira desligada, revisão não objeto, programa ilegível | desligada: congelada; ligada: `NOT_APPLICABLE` (o `v1-run-index.mjs` não calibra programa ilegível nem instante ilegível, linha 70) |
| 361 | ASK de formato desconhecido, HOLD de formato perdido | `NOT_APPLICABLE` (a casca não calibra) |
| 369 | recusada (HOLD, `UNSUPPORTED`, `INVALID_INPUT`) | sobre o admitido: `WITHHELD_HOLD` ou `NOT_APPLICABLE` |
| 370 | anterior ao registro | sobre o admitido |
| 374 | ativa | sobre o admitido |
| 392, 393 | `historicalStateOf` | nenhuma (estado do motor) |

Não consegui acionar 209 nem 279 por entrada JSON com plano válido (o autor diz o mesmo); 210 só é alcançável por `generateProgram`/`restartProgram` com um `canonical.asOf` que o motor já recusaria. Nenhum caminho devolve a calibração crua com a fronteira ligada.

## 4. Motor e calibração congelados

- `v1-run-calibration.mjs`, `v1-run-index.mjs`, `v1-index.mjs`: blobs iguais a `c8104c1` (`125079f6…`, `ba21c193…`, `92d5a116…`; sha256 `0eae6521…`, `a86b6f1e…`, `8a9bdd50…`). `r6-adaptation.mjs` igual a `d6381bb` (blob `75d26d5a…`, sha256 `6cedcb72…6e50`). `r6-provenance.mjs` igual a `c8104c1`.
- Sem leitor, contra o worktree `v1-run-calibration` (`c8104c1`): `old-probe-identity` **194/194** e `probe-identity2` **82/82** hashes iguais.
- Fronteira nativa desligada (`p-off.mjs`): 8/8 passos idênticos ao `v1-run-index.mjs` fora das chaves da extensão. `q4-off-c01.mjs`: com a fronteira desligada, a entrada do C-01 dá o mesmo hash de calibração que o `v1-run-index.mjs`, EASY `[345,575]` (ver D-02).
- Ligada, nada retido: a calibração é a do `v1-run-index.mjs` byte a byte (`probe-r2 compare`, jornada só com GPS: 0 chaves diferentes em 10 passos).
- Ligada, algo retido: refeita com os argumentos do `v1-run-index.mjs` (programa em vigor, registro, `runEvidenceRecord` devolvido, `asOf`, `weekIndex`, `hold` = HOLD ou rota clínica, `engineStatus`, `eligibility`), igual ao meu oráculo em `evaluateProgram`, `restartProgram`, `runCalibrationOf` e nas 14 respostas do `q4-c05`.

## 5. Registro guardado, replay, determinismo, robustez

- **Custódia** (`probe-custody2`): 6/6 submissões ok, `verify:null`, linhas guardadas 5/5, 9/10 (a anotação de correção do próprio motor, como na R2 e na R3), 16/16, 21/21, 26/26. Nenhum "a stored row changed".
- **Replay e ordem** (`probe-r2 replay`, `probe-replay-x`): mesma entrada, mesma saída; registros embaralhados mudam só `inputHash`, `trace` e a ordem de `runFormatRecord` (igual como conjunto). O `proposal` vira `null` no replay igual ao `v1-run-index.mjs`.
- **Recusadas** (`probe-r2 refused`): HOLD, `UNSUPPORTED` e versão inválida deixam o registro com o mesmo hash. Retroativa aceita pelo motor: ver leitura 8.
- **Não lança**: `probe-r2 throws` 154 entradas, 0 exceções; `q4-robust` mais 27 relatos novos malformados (`segments` de 1 MB de texto, 1e5 nulos, `stop` texto/número/lista/`true`, `declared` lista, distâncias negativas, `Infinity`, `NaN`, `formatHash` objeto…), 0 exceções.
- **Custo**: ver D-04.

## 6. Leituras da seção 3 do registro do autor que me cabem

| # | Decisão | Evidência |
|---|---|---|
| 1 (campo vazio não vai à fusão; com SSCTR) | **Aceita**, com a nota D-03. Fecha o C-01 na origem: a linha guarda a lista do outro relato (72/72). O motor não lê nenhum desses campos e a V1RC lê `conditions` como lista e distância só a partir de 0,5 km, então para cada leitor o campo vazio e o ausente são o mesmo (os 154 + 27 casos não mudam de status por isso). Efeito colateral: o motor passa a guardar e a fazer o hash da observação sem a chave vazia (D-03). |
| 8 (fatos de revisão anterior aceita; com SSCTR e Security) | **Não reabre o QRE-RWS-A-05; é consistente com ele**, e muda a letra do critério de fechamento dele só para fatos de relato. `q4-early.mjs` (revisão da fila aceita pelo motor depois de um ASK com parada): `KEEP`, `REVIEW_BEFORE_THE_RECORD`, 0 sessões, **0 linhas de formato** anexadas, 1 linha de fato por relato com `recordedAt` = instante da própria revisão, que é o mesmo instante (`firstRecordedAt`) sob o qual o motor guardou a linha dela; o replay da mesma revisão não anexa nada; revisão recusada (HOLD) não anexa nada. O A-05 protegia contra o registro da extensão ganhar o que o motor não aceitou; aqui o motor aceitou e guardou as linhas, e sem os fatos a linha ficava sem o que seus relatos disseram. Em `9aed5e2`, uma parada de um relato recusado por conflito nessa revisão **sumia** na revisão seguinte (triagem `NOT_RAISED`, 3 nativas); no candidato segue `REQUIRED`, 0 nativas. Para o SSCTR (não decido): nos dois commits, uma triagem datada entre o instante da revisão da fila e a chegada dela (4/5 para uma parada sob 4/3) libera a parada, porque o instante lido é o da revisão; o mesmo vale para a linha do motor. |
| 11 (palavras novas) | **Aceita.** `REPORTS_UNREADABLE` em `PACE_WITHHELD`, `RUN_REPORT_UNREADABLE` na triagem e `RECORD_NOT_ADMITTED` aparecem só onde o registro diz; as respostas inertes passam a trazer `warningSignScreen`, `paceEvidenceWithheld` e `unreadableReports` (visto no `q4-c05`). `RECORD_NOT_ADMITTED` não é alcançável por entrada JSON (seção 3); ver o mutante N12. |
| 12 (`runCalibrationOf` admite para qualquer plano objeto) | **Aceita.** Só retém mais, nunca acrescenta; com plano que não é objeto ou fronteira desligada é a V1RC crua, como antes. |

## 7. Mutação (cópia `make-copy.mjs` do candidato no meu scratch, os 88 testes v1rws, arquivo restaurado e conferido por sha)

39 mutantes escritos por mim sobre as linhas que este fix-forward acrescentou ou mudou, todos aplicados (cada texto casou uma vez). **37 mortos, 2 sobrevivem.** Os três arquivos das duas cópias (`mut/`, `mut2/`) conferem com o sha de antes no fim. A falha `I10, V6` da cópia (sem git) foi descontada.

| # | Mutação | Resultado (teste que mata) |
|---|---|---|
| N01, N02, N28 | nenhum campo vazio retido da fusão; `segments` vazio vai à fusão; distância zero vai à fusão | mortos (C-01 "reproduced and closed", "a field ... states nothing") |
| N03, N04, N06, N07 | o fato nunca diz `several`; `several` não somado; relato só com a lista não deixa fato; `lists` só com distância | mortos |
| N05, N30, N31 | `corrected`, `untimed` e o número do atleta não somados | mortos |
| N08, N09, N10, N29 | linha ilegível não retém, lixo ignorado, não pede triagem, linha ilegível com nome de fato bloqueia o real | mortos (SEC-RWS-C-06) |
| N11 | a calibração nunca é refeita | morto (16) |
| **N12** | `ok:false` devolve a calibração crua | **sobrevive** |
| N13, N14 | respostas inertes com a calibração crua; sem triagem (o C-05 como era) | mortos |
| N15, N16, N32 | leitura 8 revertida; respostas inertes sem os fatos do pedido; fatos do pedido nunca lidos | mortos |
| N17, N37 | relato de formato desconhecido guarda o fato inteiro (nos dois caminhos) | mortos |
| N18, N19 | triagem datada depois da própria revisão responde (dia, instante) | mortos (SSCTR-RWS-C-02) |
| N20, N21, N22, N23 | chave a mais no topo, chave a mais em `stop`, selo não conferido, `recordedAt` não canônico | mortos |
| N24, N25 | `segments` que não é lista lido como nenhum arquivo; `stop` que não é objeto lido como sem parada | mortos |
| N26 | leitura 12 revertida | morto |
| N27 | parada declarada no próprio pedido não nomeada | morto |
| N33 (o K32) | calibração refeita sem o registro de evidência | **morto** (C-05 "a refused review ... keeps the declared results") |
| N34 (o K29) | `hold:false` na calibração refeita | **morto** (C-05 "every answer on a record ...") |
| N35 | `sourcesOf` sem deduplicar | morto (teste de custo) |
| **N36** | `ok:false` não pede triagem | **sobrevive** |
| N38 (o K14) | triagem no mesmo instante da parada responde (`>=`) | **morto** (SSCTR-RWS-C-02) |
| N39 | triagem do mesmo dia da parada responde (`>=` por dia) | morto (9) |

Os dois sobreviventes estão no caminho `ok:false` (a leitura do registro lançou), que não consegui acionar por entrada nenhuma e que o autor declara sem teste (seção 4 dele). Não são equivalentes no código; são inalcançáveis pelas entradas que montei. Ver D-05.

**QRE-RWS-C-03: CLOSED.** K14 (N38) e K32 (N33) morrem cada um por um teste; o K29 (N34), que a R3 deixou como equivalente declarado, agora também morre.

## 8. Achados novos

| Id | Sev. | Evidência | O que fecha |
|---|---|---|---|
| **QRE-RWS-D-01** | **BLOCKING** | **Correção de uma parte da linha fundida.** `q4-corr.mjs` (pelo ponto de entrada): app por tempo com a lista do 2º arquivo + importação do 1º (6,6 km, 63 min, `[]`), mesma revisão: linha fundida `app-x` com `mergedSourceIds [app-x, dev-x]`, `SEVERAL_RECORDINGS`, `[345,420]`. Depois a importação se re-sincroniza (`correctionOf: dev-x`, mesmos números): o motor congelado aposenta a linha fundida inteira, a linha viva é `dev-x-v2` sozinha (6,6 km, 63 min, sem lista, sem `mergedSourceIds`). `reportsVerdict` lê só `dev-x-v2`: `null`. Sem esforço na re-sincronização a P1 não a lê (`[345,420]`), mas o histórico já a lê como 6,6 km e sem retenção; **com esforço** (`rpe: 3`, que o contrato ADF permite numa observação importada, `rpe?`, e que a pergunta de esforço para importadas, G6/RUN-08, traria): **`[345,575]`** nas semanas 4 e 5, nada retido. O mesmo com disputa (`q4-corr-disputed.mjs`: app mediu 11 km, importação 6,6 km; fundida `DISTANCE_DISPUTED` `[345,420]`; depois da correção da importação **`[345,575]`**). Numa **prova** (`q4-corr-race.mjs`, linhas como o motor as guarda, como no teste do próprio autor): fundida, o ponto de entrada não lê resultado nenhum; depois da correção da importação, lê **`plan-race:dev-race-v2`, 6 km em 3000 s** como resultado de prova, sem precisar de esforço. Em `9aed5e2` o mesmo (`[345,575]` em E1; não é regressão). O autor testou só correções do próprio app (`final-fix` linhas 125 e 129). **Por que BLOCKING:** é cliente conforme (relato do app e importação da mesma corrida, depois uma re-sincronização da importação), a missão pede exatamente "uma correção de parte de uma linha fundida" e "mostrar que nenhum caminho usa distância parcial para recalibrar ritmo", e o critério do B-01 é que a linha não chegue à V1RC como evidência de ritmo; aqui chega. O que atenua: pede a mesma premissa do C-01 (a importação do 1º arquivo com os minutos inteiros) e, na corrida leve, um esforço na correção. | Ler os fatos de todo relato da cadeia de correção de uma linha viva (as fontes das linhas que ela aposenta, por `correctionOf`/`supersededBy`), não só as da linha viva, com teste da re-sincronização da importação numa corrida leve, num longão e numa prova, nas três ordens. |
| QRE-RWS-D-02 | NOTE | Com a fronteira nativa desligada (o padrão até haver registro habilitador), a entrada do C-01 sai `[345,575]`, com o mesmo hash de calibração do `v1-run-index.mjs` (`q4-off-c01.mjs`); um registro começado pelo ponto de entrada congelado e continuado por este também (`q4-c01-paths` E6, `[345,575]` nos dois commits). É o comportamento congelado de `c8104c1`, exigido byte a byte; o autor declara (seção 4). Consequência: a correção só vale para relatos recebidos com a fronteira ligada; as linhas fundidas antes da habilitação não têm fato nem lista. | Decisão na habilitação (SSCTR, Founder): aceitar, ou reler o registro anterior antes de ligar. |
| QRE-RWS-D-03 | NOTE | Tirar os campos vazios muda a observação que o motor guarda e cujo hash confere no replay. `q4-replay.mjs`: o mesmo relato (`segments: []`, mesmo `eventId`) mandado com a fronteira desligada e reenviado depois de ligada marca a linha guardada como conflito (`EVENT_ID_REUSED_WITH_DIFFERENT_FACTS`); em `9aed5e2` não. A mesma classe já existia para a distância digitada (os dois commits). Através de um restart, com a sessão ainda no plano, nada muda. | Na habilitação: comparar o reenvio pelo relato como recebido, ou declarar que reenvios atravessando a habilitação são conflito. |
| QRE-RWS-D-04 | NOTE | Custo linear, constante maior. `q4-robust.mjs` (com duas outras suítes rodando na máquina): 1e3 / 1e4 / 1e5 fatos válidos do mesmo relato 164 / 631 / 5952 ms; forjados com selo errado 115 / 684 / 6160 ms; linhas lixo 48 / 70 / 333 ms; 1e5 ids fundidos 364 ms. Cada linha de fato é conferida duas vezes por resposta (`appendReportFacts` e `readReportFacts`), dois hashes cada. Não há crescimento quadrático. | Opcional: limite de linhas de fato por requisição na custódia (Security). |

| QRE-RWS-D-05 | NOTE | Mutantes N12 e N36 sobrevivem: o caminho `ok:false` de `readingOf` (calibração `RECORD_NOT_ADMITTED` e triagem `RUN_REPORT_UNREADABLE`) não tem teste e não é alcançável pelas entradas que montei (seção 3). | Opcional: um teste que force a leitura a lançar (por exemplo um `program` com getter que lança, chamado direto em `finish`), ou declarar o caminho como defensivo. |

## 9. Testes históricos (decisão de governança de 2026-11-14)

**Confirmo formalmente:** a única falha da execução conjunta nesta linha é o teste histórico `V1RC COACHINGCORE-V1-FREEZE-1 is preserved: every file it binds is byte-identical here` (`test/v1rc-calibration.test.mjs:325`), com `actual: ['CoachingCore/src/r6-adaptation.mjs']` e nada mais.

| Resultado | Onde | O que deu |
|---|---|---|
| Verificação histórica | worktree `v1-run-calibration`, HEAD `c8104c1` | `node --test test/v1rc-calibration.test.mjs`: **30/30**, o teste histórico passa. `node scripts/v1rc-freeze.mjs --check 1`: "30 added files match; COACHINGCORE-V1-FREEZE-1 preserved 198/198", exit 0. |
| Testes da extensão | `node --test test/v1rws-*.test.mjs` nesta linha | **88/88**. |
| Execução conjunta | `node --test` em `CoachingCore/` desta linha | **1423 entradas, 1422 passam, 1 falha** (a histórica). A leitura TAP do script de freeze (`tap-parse.mjs` do meu antecessor) dá `onlyHistorical: true`. `v1rws-freeze --preserved`: 197/197 + 1 emendado com o sha e o diff autorizados (22+/10−) + 30/30, exit 0. `v1rc-freeze --check 1` aqui: DRIFT só em `(FREEZE-1) CoachingCore/src/r6-adaptation.mjs`, exit 1, como esperado. |

`git diff c8104c1 5289667 --name-status -- CoachingCore`: só `M src/r6-adaptation.mjs`; todo o resto é `A`. Nenhum teste de `c8104c1` foi editado, removido ou teve a expectativa mudada. Esta suíte conjunta não é verde e não deve ser anunciada como verde.

## 10. Testes anteriores que o autor mudou (`v1rws-fix-forward.test.mjs`)

| Trecho | Leitura |
|---|---|
| Veredito dos relatos sozinho (`fact` com os três campos novos; `appendReportFacts` com os valores) | Reafirmação legítima; nenhum resultado esperado mudou. |
| `PACE_WITHHELD` com `REPORTS_UNREADABLE` | Resultado esperado mudou, pela leitura 4; não enfraquece (a lista é fechada e conferida inteira). |
| Chaves do fato de parada (cinco → oito) | Só a forma; continua conferindo a lista exata. |
| `itsFact` (assinatura nova) | Reafirmação. |
| Integridade da linha de fato (selo novo; `remade` refaz o selo com atleta e instante) | Legítimo e mais forte: as seis falsificações continuam ilegíveis com o selo novo. |
| `reportFactOf` de número digitado (`null` → fato com `ownKm`) | **Resultado esperado mudou** (leitura 2, do SSCTR). Não enfraquece: a mensagem e a asserção afirmam que não é distância medida. |
| Revisão anterior ao registro com parada (antes o registro voltava igual; agora volta com o fato da parada sob o instante da revisão) | **Resultado esperado mudou** (leitura 8). Não enfraquece: afirma o fato exato anexado, 0 sessões e a triagem; a parte da recusada (`malformed`, `notATime`) segue afirmando registro igual. |

## 11. O que é de outros donos (vi, não decido)

- SSCTR: as leituras 2 a 7 e a parte esportiva da 8 (a triagem datada entre o instante da revisão da fila e a chegada dela libera a parada); o efeito da D-01 sobre o histórico e o S3 (a linha da correção entra no histórico com 6,6 km e sem retenção; não vi o S3 mudar uma sessão entregue nas semanas 5 a 7 do meu probe); a D-02 na habilitação.
- Security: o selo sem chave (um `recordedAt` recuado com o selo refeito é lido), o apagamento silencioso de um fato, a D-04 como limite da custódia, as leituras 4, 9 e 10, e o SEC-RWS-C-03/C-04, que não exercitei.
- Motor congelado (fora desta missão): uma observação nova em conflito com uma linha carregada do mesmo dia pode tomar o lugar dela por ordem de `eventId` (vi no cenário "conflito" do `q4-c05`: a linha `two-files` sai do registro devolvido e fica a `conflicting`, marcada em conflito). Nenhuma evidência de ritmo vem disso; registro aqui só como observação.

## 12. O que rodei e onde

- Scratch: `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/f7907645-2532-4d04-8be4-fa62a06fa225/scratchpad/qre-r4-judge-1794674195/` (extrações `x9aed/` e `x5289/`; cópias de mutação `mut/` e `mut2/` (`mutants-r4-k14.json` para N38 e N39); probes em `probes/`; saídas `probes/*-cand.*`, `probes/*-9aed.*`; `joint-suite.tap`, `ext-suite.tap`, `hist-v1rc.tap`, `hist-check.txt`, `v1rws-preserved.txt`, `v1rc-check-line.txt`, `mutants-r4.json`, `mutants-r4.log`). Nada apagado.
- No worktree, só o permitido: `node --test` (inteira, uma vez, e `test/v1rws-*.test.mjs`), `v1rws-freeze --preserved`, `v1rc-freeze --check 1`. No worktree `v1-run-calibration`: `node --test test/v1rc-calibration.test.mjs` e `v1rc-freeze --check 1`. Nenhum comando git de escrita.
- Probes do meu antecessor, sem mudança: `p-merge-paths`, `p-inert` (nos dois commits), `old-probe-identity`, `probe-identity2`, `p-off`, `p-wiring`, `probe-custody2`, `probe-replay-x`, `probe-r2` (cost, plaus, refused, throws, replay, compare, forge), `tap-parse`. Não usei `p-facts` nem `p-sec` como evidência: montam linhas de fato no formato de `644cd8e`; escrevi `q4-robust` no formato novo.
- Probes meus: `q4-c01-matrix`, `q4-c01-paths`, `q4-corr`, `q4-corr-disputed`, `q4-corr-race`, `q4-c05`, `q4-early`, `q4-robust`, `q4-replay`, `q4-off-c01`, `q4-conflict-row`, `q4-why-time`, `q4-mutate`.
- Os testes do autor só rodaram dentro das suítes; nenhuma conclusão acima vem deles. Os relatórios dos outros juízes desta rodada não foram lidos.

## 13. O que não verifiquei

- A D-01 pela prova passando pelo motor numa jornada inteira até a semana da prova: mostrei o caminho da correção pelo motor na corrida leve e a leitura da prova com as linhas como o motor as guarda.
- Se uma importação real do HealthKit re-sincroniza como `correctionOf` com os mesmos minutos, e se o app anexará o esforço perguntado à observação importada (G6/RUN-08, PD-1).
- O `--write` com um registro habilitador presente.
- Os valores e as leituras esportivas (SSCTR) e a segurança da custódia.
- A suíte inteira sob cada mutante: rodei os 88 testes v1rws.
- As jornadas e o fuzz da V1RC (proibidos).

## Contexto injetado pelo host

Nada disto foi usado como evidência.

| Arquivo | sha256 |
|---|---|
| CLAUDE.md global (`C:/Users/carva/.claude/CLAUDE.md`) | `c75718d0d2fe2cce1332cf7240ef0b8013ca2901d52b4d6778480c1c333709c6` |
| CLAUDE.md do projeto (`C:/Users/carva/Desktop/myApp/MyApp/CLAUDE.md`) | `e657d059e06fd1a21613250753a8c79ac605b69d955191d634966b3c8fc922e6` |
| MEMORY.md (`C:/Users/carva/.claude/projects/C--Users-carva-Desktop-myApp-MyApp/memory/MEMORY.md`) | `76baefc6c32d7e247d5a2b3efd0153a9857e28d4dba493bb79081587e3496afc` |
