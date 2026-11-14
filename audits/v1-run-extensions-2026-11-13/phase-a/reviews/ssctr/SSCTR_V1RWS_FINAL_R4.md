# SSCTR — fix-forward final de integração do V1RWS (fase A), r4 — 2026-11-14

**Veredito: ACCEPT_WITH_CONDITIONS.** Candidato sintético, sem atleta real e sem integração.

- **Nenhum BLOCKING no meu campo.** Os dois bloqueios do QRE reproduzem em `9aed5e2` e não reproduzem em `5289667`. No lado esportivo, a linha não chega mais à V1RC como evidência de ritmo, e a resposta inerte nomeia a triagem. Fechá-los como achados de confiabilidade é do juiz de Quality.
- **Sinal de segurança intacto, e mais fechado.** Uma linha de fato ilegível agora falha fechado, uma parada que não é objeto é parada, e toda resposta que não entrega sessão nomeia a triagem que o registro pede.
- **As oito leituras que me cabem: aceitas.** A 4 tem uma condição de integração.
- **Duas condições novas** (D-01, D-02) **e três notas** (D-03 a D-05). A D-01 é a contagem dupla da C-05, que agora também passa pelo caminho `segments: []`: a referência de histórico vai de 16 para 22 km e o teto CT-3 de 18,08 para 24,2, com a mesma dose.
- **Registro habilitador: não escrito nesta passagem** (o arquivo não existe). Eu o emitiria para `5289667`, com as condições da seção 6, depois dos vereditos de Quality e Security.

Dados da revisão:
- **Candidato:** `5289667` (HEAD, árvore limpa no início e no fim). Diff julgado: `9aed5e2..5289667` (o runtime de `9aed5e2` é igual ao de `644cd8e`). Diferencial contra `644cd8e`; base congelada `c8104c1`.
- **Hashes conferidos:**
  - r2 `daf3d7a2…2213`, r3 `6b96d769…08e2`, r3a `37047d21…d412`;
  - `RUN_FORMATS_V1.json` `26c6e3fbfeee864376643c485d64a616f1cf13ea49d82b2cc223c02d7a06353c`, sem mudança.
- **Revisor:** instância SSCTR nova (claude-opus-5-5), PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, sem credencial humana. Não escrevi o candidato, as decisões, as revisões anteriores nem a correção. Não houve revisão humana, validação empírica nem juízo clínico. Nenhuma delegação.

## 1. Reprodução antes do candidato (`9aed5e2`, extraído em rascunho)

As sondas do QRE r3 foram usadas sem mudança.

| Sonda | `9aed5e2` | `5289667` |
|---|---|---|
| `p-merge-paths` A1, A2, A3 (app por tempo + importação com `segments: []`, nas três ordens) | linha `segments: []`, nada retido, EASY **`[345,575]`** | a linha guarda a lista do app, `SEVERAL_RECORDINGS`, `[345,420]` |
| `p-merge-paths` B1, B2 (dois relatos do app) | `[345,575]` | `[345,420]`, `SEVERAL_RECORDINGS` |
| `p-merge-paths` A4 (nativa) | `[345,420]`, linha `partial: true` | `[345,420]`, `partial: false` |
| Controles D0, D1, C1 | `[345,575]`, `[345,420]`, `[345,420]` | iguais |
| `p-inert` revisão da fila depois do ASK | `REVIEW_BEFORE_THE_RECORD`, CALIBRATED **`[345,575]`**, triagem ausente | `[345,420]`, triagem `REQUIRED` |
| `p-inert` controle, retroativa, clínica, HOLD de integridade | — | iguais nos dois |

Vi as duas falhas e vi as duas fecharem.

## 2. Nada mais mudou (diferencial contra `644cd8e`)

Sonda própria `d2-differential.mjs`, derivada da `d1` do juiz anterior, com `644cd8e` extraído contra o worktree.

**Seletor:**
- 5.616 seleções de repetições e 10.368 de contínuos (grade reduzida; o seletor não está no diff), com triagem ligada e desligada e quatro estados do motor;
- 0 diferenças de padrão, blocos, estimativa, checagens, dimensionamento, instruções, hash ou `prescribed`.

**Leitor de execução, linha crua:** 725.760 casos, com as formas que este ciclo toca:
- listas vazias, `declared: {}`, distância 0;
- `segments` que não é lista;
- `stop` que não é objeto.

Resultado:
- 241.056 idênticos.
- **Toda** diferença vem de duas causas só, as leituras 5 e 6: `stop` que não é objeto (290.304 casos) e `segments` que não é lista (194.400 casos).
- **0 casos com mais crédito, 0 com mais evidência de ritmo, 0 com extensão maior, 0 com referência de histórico maior.**
- Lista vazia, `declared: {}`, `conditions: []` e distância 0 leem igual a ausentes.

**Pelo ponto de entrada:** 3 planos × 10 formas × 9 semanas = 270 revisões.
- **As cinco formas comuns** (como prescrito, só tempo, parada por fadiga, sessão perdida, parada por sintoma) dão 0 diferenças em motor, sessões, execuções, `runFormat` e calibração, nos três planos.
- **Listas vazias, `steps: []` e `manualDistanceKm: 0` em todos os relatos:**
  - mesma decisão, sessões, execuções e calibração;
  - a linha guardada é a de `644cd8e` menos exatamente a chave vazia (225 + 180 linhas conferidas, 0 divergências, `d3-detail.mjs`, `d3b-steps.mjs`).
- **`stop: 'tired'`:** a semana pede a triagem e sai com 0 nativas. É a leitura 5, e o efeito em cascata segue dela.
- **`segments: 'x'` no longão da semana 3:**
  - o longão sai UNKNOWN, sem crédito, `SEVERAL_RECORDINGS`, e o motor segura o passo (`GATED_NEXT_STEP`);
  - na semana 5, uma corrida fácil de 70 min passa de TIME para NATIVE. A dose é a mesma (70 min) e a calibração tem menos evidência. Não é crédito nem evidência ganha.

**Caminhos de fusão** (o que muda de propósito):
- **r3a com a importação mandando `segments: []`** (`m2-empty-merge.mjs`):
  - em `644cd8e`: PARTIAL, 10 km;
  - no candidato: DISTANCE/MEASURED, 16 km, nunca ritmo.
  - **Ganha crédito e referência**, mas só até a leitura do mesmo relato enviado de uma vez (a WE3A-10 da r3a). Próximo longão: 16 km, 100 min, igual.
- **Sobreposição** (o relógio mediu a corrida inteira, 16 km com `[]`; o app, 10 km mais um segundo arquivo de 6): a referência sobe de 16 para **22** e o CT-3 de 18,08 para **24,2**. É a D-01.

**Prova (leitura 2, `r2-race.mjs`):**
- Só mudam a prova digitada ou MANUAL contra uma importação que mediu além de 0,91 dela (8,8, 9,0 e 11,2 km contra 10). Nesses casos a V1RC deixa de ler o resultado.
- Nada mais muda: crédito, motor, faixas e triagem iguais.

**Congelados:**
- `v1-run-calibration.mjs`, `v1-run-index.mjs` e `v1-index.mjs` sem diff desde `c8104c1`;
- `r6-adaptation.mjs` e `v1/` sem diff desde `d6381bb`;
- `git diff --name-status c8104c1 5289667 -- CoachingCore`: só `M src/r6-adaptation.mjs`;
- `node scripts/v1rws-freeze.mjs --preserved`: 197/197 + 1 emendado autorizado (22+/10−); 30/30; exit 0.

**Exemplos r2, r3 e r3a:** `v1rws-ssctr-examples.test.mjs` e `v1rws-helpers.mjs` sem diff desde `644cd8e`. `node --test test/v1rws-*.test.mjs`: **88/88**, incluindo WE3-01 a WE3-23 e WE3A-01 a WE3A-11. Nenhum resultado esperado mudou.

Sobre o resto do que o pedido lista, o diferencial não mostrou nenhuma diferença nas formas comuns:
- dose e progressão do motor, seleção RWS e longão de 16 km pela distância executada;
- declaração nunca promovida, L30 e longão comparável;
- deduplicação, formato histórico persistente e holds clínicos;
- coordenação com força.

As únicas mudanças são as descritas acima.

## 3. O sinal de segurança no candidato

Sondas do juiz anterior, com a raiz trocada (`prev-*.mjs`), e sondas minhas (`s2-readings`, `s3-reading8`, `s4-signal-more`).

| Cenário | `644cd8e` | `5289667` |
|---|---|---|
| `s1`: três relatos, 6 ordens × 2 expressões | 12/12 `REQUIRED`, 0 nativas | igual |
| `s1`: identidade em quarentena; parada vinda na importação, nas duas ordens; motivo FATIGUE, PACING, CHOICE ou TIME em conflito | `REQUIRED`; `REQUIRED`; não pede triagem | igual |
| `s1`/`x1`: fato **alterado** sem rehash ou de outro atleta | `NOT_RAISED`, 6 nativas | **`REQUIRED`, 0 nativas** |
| `s1`/`x1`: fato **retirado** | `NOT_RAISED`, 6 nativas | igual (limite declarado, ver C-01) |
| Rota clínica com a parada | `CLINICAL_HUMAN_REQUIRED`, `prescribing:false`, tudo por tempo, `prescribed:false` | igual |
| ASK de elegibilidade com a parada | `REQUIRED`, 0 nativas, `prescribing:false` | igual (`prescribed:true` segue, C-03) |
| Duplicata, correção que tira a parada, correção para FATIGUE, ida e volta por JSON | `REQUIRED`, 0 nativas | igual |
| Restart com registro ilegível | `NOT_RAISED`, 2 nativas | **`REQUIRED` `RUN_REPORT_UNREADABLE`, 0 nativas** |
| Respostas inertes com parada pendente no registro: HOLD de integridade, anterior ao registro, formato desconhecido, formato perdido, instante ilegível | triagem `null` | **`REQUIRED` com a sessão nomeada**, 0 sessões entregues |
| Corrida avulsa com parada (`u1`) | `NOT_RAISED`, 11 nativas | igual (C-04) |
| Custódia, duas requisições (`x1` p4) | `ok:false`, a parada se perde com a importação primeiro | igual (C-08) |

Separação entre sinal e evidência:
- a parada não dá crédito nem dimensiona nada;
- a triagem é a existente, com `decidedByThisExtension:false`;
- não há classificação clínica nova;
- uma linha ilegível nunca é nomeada como sintoma (`sessionIds: []`, motivo próprio).

## 4. Condições anteriores (r3)

| Id | Estado | Evidência |
|---|---|---|
| SSCTR-RWS-C-01 | **PARCIAL**; o resto é condição do registro (integração) | Fato ilegível, alterado ou de outro atleta: falha fechado (`x1` p1: `REQUIRED`, 0 nativas; `s2` reading4: linha lixo, `null`, texto ou formato anterior dão `REQUIRED`, `RUN_REPORT_UNREADABLE`, tudo por tempo). Fato **retirado** do registro: segue `NOT_RAISED`, 6 nativas. Não se distingue de relato nunca enviado. Fecha só com a cadeia com chave da custódia (Security A-01, A-06). |
| SSCTR-RWS-C-02 | **PARCIAL**; o resto é condição de integração | Na mesma revisão fecha: triagem com +1, +60 ou +180 min sobre o `asOf` dá `REQUIRED`, 0 nativas (em `644cd8e`: 7 nativas). Resíduo: o **mesmo** objeto de triagem futura, levado pelo cliente à revisão seguinte, libera nela (6 e 11 nativas). Ele não foi respondido depois da parada. Pede relógio do cliente adiantado. Fecha com a custódia carimbando o instante da triagem ao recebê-la. |
| SSCTR-RWS-C-03 | ABERTA, inalterada | Sob ASK de elegibilidade, 12 sessões por tempo com `prescribed:true` e `prescribing:false`. |
| SSCTR-RWS-C-04 | ABERTA, inalterada | `u1`: 11 nativas, triagem não pedida. |
| SSCTR-RWS-C-07 | **FECHADA** | Todas as respostas inertes nomeiam a triagem que o registro pede. `REVIEW_BEFORE_THE_RECORD` leva a calibração admitida (`[345,420]`). |
| SSCTR-RWS-C-08 | ABERTA, inalterada; trava a integração | `x1` p4 igual nos dois commits. |
| SSCTR-RWS-A-04 | ABERTA, inalterada | O diff não toca a regra do passo planejado nem o seletor. |
| SSCTR-RWS-B-03 | ABERTA, inalterada (Data/iOS) | Ganha peso com a D-01. |
| SSCTR-RWS-C-05 (nota) | Vira **condição** pela D-01 | — |
| SSCTR-RWS-C-06 (nota) | **Corrigida** | A premissa ("o motor também não grava") vale para a revisão recusada, não para a anterior ao registro que o motor aceita. O motor guarda as linhas dessa revisão, também a de conflito (`s3`: `app-b SYMPTOM conflicted:true` nos dois commits). Ver leitura 8. |

## 5. As leituras 1 a 8 da seção 3 do registro do autor

1. **Campo vazio não vai à fusão: ACEITA** (com Quality).
   - Um relato sozinho lê igual com o campo vazio e sem ele: 0 diferenças no leitor; linhas e decisões iguais em 405 linhas.
   - Numa fusão, a linha passa a guardar o que a outra fonte disse. O caso r3a fecha pela leitura do relato único (WE3A-10: distância, nunca ritmo). É a regra do Founder: o que uma fonte não diz não apaga o que a outra disse.
   - Efeito colateral, condição D-01: a contagem dupla da C-05 passa a valer também quando a importação manda `[]`.
   - Nota D-03: `segments: {}` e `segments: 0` também são retirados na recepção, mas lidos como gravação ilegível numa linha que veio de fora.
2. **Disputa com o número do próprio atleta: ACEITA.**
   - Só retira o resultado de prova da V1RC (`r2-race`): digitada ou MANUAL de 10 km contra 8,8, 9,0 ou 11,2 km medidos.
   - Não muda crédito, motor, faixas nem triagem.
   - Alinha a digitada e a MANUAL com OFFICIAL e GPS, que já disputavam em `644cd8e`. Não cria número novo: usa o 0,91 já amarrado.
   - Perder um resultado de prova que não se sustenta é melhor que calibrar com ele. O atleta tem a via própria para declarar o resultado.
   - Limite herdado, sem mudança: dentro da tolerância, a V1RC lê a distância que a fusão guardou, que é a do relógio, também contra uma OFFICIAL (10 contra 9,15 dá prova de 9,15 km em 50 min). O efeito é faixas mais lentas, o lado conservador. Fica para a fase B, que lê prova.
3. **Linha que perdeu a lista num registro feito fora: ACEITA.**
   - O ritmo é retido. Conclusão e histórico leem o que a linha tem (`s2`: longão PARTIAL, 10 km, `countsForPause:true`, `SEVERAL_RECORDINGS`).
   - O efeito é conservador: menos crédito, referência menor, pode contar para a pausa X-2 (que leva a tempo).
   - Não reconstruir a lista a partir de um booleano está certo. Só acontece com registro feito fora deste ponto de entrada.
4. **Linha de fato ilegível: ACEITA COM CONDIÇÃO (D-02).**
   - É compatível com a r3 C4:
     - usa a triagem existente;
     - não há classificação clínica;
     - o motivo é próprio (`RUN_REPORT_UNREADABLE`), sem sessão nomeada como sintoma;
     - `decidedByThisExtension:false`;
     - um "sim" vai à rota clínica (`s2`: `CLINICAL_HUMAN_REQUIRED`, 0 oferecidas como prescrição);
     - as corridas saem por tempo, a dose canônica do motor congelado. É o que o atleta receberia com a extensão desligada.
   - Um estado que a resposta do atleta não limpa (`s2`: triagem respondida dois dias depois, ainda `REQUIRED`; restart com intake novo, ainda `REQUIRED`) é aceitável no candidato sintético: não tira treino, só a expressão nativa e a evidência de ritmo.
   - Mas a triagem pedida de novo depois de respondida não é a triagem da C4. Na integração, o estado deve ir para o reparo da custódia, e o atleta não pode ficar preso num pedido que a resposta dele não atende.
5. **`stop` que não é objeto é parada sem motivo (SYMPTOM): ACEITA.**
   - Falha fechado: texto, `true`, número, `''`, lista e `{}` pedem a triagem e saem com 0 nativas; `false`, `null` e a ausência seguem sem parada (`s2` reading5).
   - O texto `'FATIGUE'` vira SYMPTOM, não FATIGUE: conservador e respondível.
   - Não zera a contagem de pausa. É a regra V1RC R-01 já existente.
6. **`segments` que não é lista: ACEITA.**
   - Texto, objeto com chaves e `true` dão UNKNOWN, sem crédito, nunca ritmo, POOR. O motor segura o passo. `UNKNOWN` não conta para a X-2 (WE3A-03).
   - Ver a nota D-03 para `{}` e `0`.
7. **Triagem com instante posterior ao da revisão: ACEITA.**
   - Fecha a C-02 na mesma revisão.
   - O resíduo de uma revisão adiante continua condição de integração (C-02 parcial).
   - Datas só de dia: a do dia da parada não libera; a do dia seguinte libera.
8. **Revisão anterior ao registro que o motor aceita guarda os fatos: ACEITA** (com Quality e Security).
   - **Conferi:** o motor guarda as linhas dessa revisão (`s3`, os três casos), também a linha de conflito com a parada.
   - A premissa da minha leitura 5 da r3 e da nota C-06 estava errada para este caminho: só vale para a revisão recusada.
   - Agora os fatos ficam sob o instante que o motor aceitou. A resposta nomeia as duas paradas e não entrega sessão. A revisão seguinte segue `REQUIRED`.
   - Ver a nota D-04.

## 6. Registro habilitador

Não escrito: `SSCTR_V1RWS_RUN_RECORDS.json` não existe.

**Eu o emitiria para `5289667`**, depois dos vereditos de Quality e Security, com estas condições:
- **Antes de a fase B ler `paceEvidence`:** A-04.
- **Antes de integração ou de atleta real:**
  - C-01 (o fato retirado), C-02 (o resíduo), C-03 e C-04;
  - B-03 com a D-01;
  - D-02;
  - QRE-RWS-A-07.
- **C-08:** o composto não entra em custódia nem em integração enquanto três coisas faltarem. A custódia aceita a fusão e a marca de conflito, guarda fatos e formatos no mesmo commit e devolve a triagem.
- **Security:** A-01, A-04 e A-06 a A-08, e as condições da revisão focal que o juiz de Security mantiver.

Se Quality ou Security pedirem mudança no runtime, o registro só vale para o commit que eu julgar.

Itens de fila humana **propostos, não anexados**: os três da r2 e da r3, e HQ-V1RWS-A-SSCTR-R4-EMPTY-FIELD-MERGE, sobre ler um campo vazio como silêncio na fusão de duas fontes (D-01).

## 7. Achados novos

| id | severidade | o quê | evidência | fecha com |
|---|---|---|---|---|
| SSCTR-RWS-D-01 | **CONDITION** (Data/Product, antes de integração; junto da B-03; estende a C-05) | Com a importação mandando `segments: []`, a lista do app agora soma à distância da importação. Quando as duas fontes mediram a mesma corrida (o relógio a inteira, o app em dois arquivos), a referência de histórico sobe de 16 para **22 km**, e o teto CT-3 do próximo longão de 18,08 para **24,2**. O próximo longão segue 16 km e 100 min: a dose é a mesma, nunca vira ritmo, e não ganha crédito (já era DISTANCE). O caminho com a chave ausente já dava 22 em `644cd8e`. O que é novo é o alcance. | `m2-empty-merge.mjs`, `overlapEmptyList` nas três ordens contra `overlapNoKey` | Contrato Data: cada gravação em um relato só, deduplicada por id de atividade (B-03). Ou a soma da lista de uma fonte não vale como histórico quando outra fonte mediu a corrida inteira com diferença além de 0,91. |
| SSCTR-RWS-D-02 | **CONDITION** (integração; Product e engenharia da custódia) | Uma linha ilegível no registro de relatos mantém a triagem `REQUIRED` mesmo depois de respondida, e também no restart. O atleta não tem como sair. Hoje é seguro, porque por tempo é a dose canônica, e na integração vira pedido em laço. | `s2` reading4, `s4` `restartRecordUnreadable` | O estado ilegível vai para o reparo do registro na custódia (A-01, A-06). Depois que o atleta responde, a interface o mostra como retenção de dados, não como triagem pendente. |
| SSCTR-RWS-D-03 | NOTE | `segments: {}` e `segments: 0` são retirados na recepção (lidos como nada), mas numa linha vinda de fora são lidos como gravação ilegível (UNKNOWN). O mesmo valor malformado lê diferente conforme o caminho. | `d2` (leitor cru: `SEGMENTS_NOT_LIST` inclui `{}` e `0`), `s2` reading6 | Ler `{}` e `0` da mesma forma nos dois caminhos. |
| SSCTR-RWS-D-04 | NOTE (já existia para paradas em linha) | A parada de uma revisão da fila fica guardada sob o instante dela, não sob o de chegada. Uma triagem respondida entre os dois instantes a libera (`s3`: a triagem das 08:00 do dia 4 libera a parada do dia 3, que chegou depois). Fisicamente, a triagem foi respondida depois da parada. Sob a custódia, o `asOf` do servidor é monotônico e o caminho não abre. | `s3-reading8.mjs`, `nextWithScreenOfDay4`, igual nos dois commits | Nada no Core. Na integração, o `asOf` do servidor. |
| SSCTR-RWS-D-05 | NOTE | O teste do autor afirma que uma linha de fato retirada fica `NOT_RAISED` ("o limite, declarado"). Eu também vi. É a parte aberta da C-01, não um defeito novo. | `x1` p1 `dropped` | Custódia com cadeia com chave. |

## 8. O que rodei, onde, e o que não verifiquei

**Rascunho:** `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/f7907645-2532-4d04-8be4-fa62a06fa225/scratchpad/ssctr-r4-1794674197/`
- `old-9aed5e2/` e `old-644cd8e/`: `git archive` + `node_modules`;
- `probes/`:
  - as do QRE r3, sem mudança: `p-merge-paths`, `p-inert`;
  - as do SSCTR r3 com a raiz trocada (`reroot.mjs`, `prev-*.mjs`): `s1-signal`, `x1-security-points`, `b2-ask`, `u1-unplanned`, `m1-merge`, `p1c`, `r1-race`;
  - as minhas: `d2-differential`, `d3-detail`, `d3b-steps`, `r2-race`, `s2-readings`, `s3-reading8`, `s4-signal-more`, `m2-empty-merge`, `summ.mjs`;
  - saídas `out-*.txt` e `*.out`;
- `v1rws-suite.tap` e `preserved.txt`.

**No worktree:** só `node --test test/v1rws-*.test.mjs` (88/88) e `node scripts/v1rws-freeze.mjs --preserved` (exit 0), além de leitura e `git diff`/`git status`. Não rodei `npm run verify`, `verify-r*`, `*-freeze --write`, `v1rc-journeys`, `v1rc-fuzz` nem `validate_records.py`. Escrevi só estes dois arquivos.

**Não verifiquei:**
- a suíte inteira (1423 entradas, afirmada pelo autor);
- `v1rc-freeze --check 1`;
- mutação;
- QRE-RWS-C-01 e C-05 como confiabilidade;
- custódia, cadeia com chave e classificação de dados (Security);
- o hold F08 em execução;
- a leitura que lança (`ok:false`) e `REVIEW_TIME_REQUIRED`, sem acesso por entrada válida: li o código, que passa por `heldAnswer`;
- o caminho de sucesso do `--write`;
- cobertura fora das grades;
- se um importador real do Saúde manda `segments: []` (o contrato ADF não fala de `segments`);
- a fase B.

**Literatura:** nenhuma afirmação científica nova. WebSearch e WebFetch estavam disponíveis como ferramentas adiadas e não foram usados.

**Contexto injetado pelo host (divulgado):**
- CLAUDE.md global (`c75718d0d2fe2cce1332cf7240ef0b8013ca2901d52b4d6778480c1c333709c6`);
- CLAUDE.md do projeto em `MyApp/` (`e657d059e06fd1a21613250753a8c79ac605b69d955191d634966b3c8fc922e6`);
- MEMORY.md (`76baefc6c32d7e247d5a2b3efd0153a9857e28d4dba493bb79081587e3496afc`).

Lidos só como contexto. Nada deles serviu de evidência.
