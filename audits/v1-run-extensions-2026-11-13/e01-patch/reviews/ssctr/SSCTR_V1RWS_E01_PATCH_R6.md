# SSCTR — revisão focal R6 do patch pós-freeze do QRE-RWS-E-01 (V1RWS, CoachingCore V1) — 2026-11-15

**Decisão: ACCEPT_WITH_CONDITIONS.** O escopo é o candidato sintético `f8b08aaf4516f5376a31a67b43e72ec9a2d64f29`, sem atleta real e sem integração.

- **Achados bloqueantes:** nenhum.
- **A condição do QRE-RWS-E-01 no registro habilitador:** **cumprida no Core** em `f8b08aa`. Conferi pela minha execução, pelo ponto de entrada, nas duas variantes (a correção que lista uma gravação e a que declara falha), contra `08d2dc8` (seção 2).
- **Decisões esportivas, dose e performance:** preservadas. Nenhuma tolerância, limiar ou critério novo. A única mudança de expressão é a leitura 2, e ela é a regra L1 aplicada à fonte S3 (seção 3).
- **Leituras do autor:** 1, 2 e 6 têm a minha palavra expressa (seção 4). Todas aceitas; a 1 e a 2 geram uma condição de integração cada.
- **Condições novas:** três, de SSCTR-RWS-F-01 a F-03. Nenhuma pesa no candidato sintético.
- **Registro habilitador:** eu o **confirmaria** para os bytes do patch, com as condições da seção 6. **Não emito a confirmação agora**, como pedido.
- **Contrato iOS:** não contradiz L1 a L5 e não apresenta o hard gate E-1 como atendido (seção 7).

## 1. Revisor, autoridade, acesso e independência

- **Instância:** SSCTR nova (claude-opus-5-5), agente SSCTR-1.0.0, constituição SSCTR-CONST-1.0.0 (`9de27b4d…`), skill `sports-science-review` 1.0.0 (`67374297…`).
  - Autoridade: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, só para decisões esportivas internas, delimitadas e não clínicas. Não tenho credencial humana.
  - Não houve revisão humana, validação empírica nem juízo clínico. Não deleguei nada.
  - Despacho: as instruções que recebi são as do adaptador do projeto (`.claude/agents/sports-science-concurrent-training-reviewer.md`). Não consigo verificar sozinho o mecanismo do despacho.
- **O que não escrevi:** o patch, o teste novo, o registro do autor, o contrato iOS, as sondas do autor e as do juiz de Quality.
- **Independência:** não sou independente das decisões anteriores do mesmo papel: L1 a L5 (r1 e r2), r4, r5, o adendo e o registro habilitador são deste papel, escritos por outras instâncias. Aqui julgo se o patch cumpre essas decisões. Não as reabro.
- **Runtime:** worktree `v1-run-extensions`, HEAD `f8b08aaf…`, `git status --porcelain` vazio no início e antes de escrever estes dois arquivos.
- **Literatura:** nenhuma afirmação científica nova é pedida nem feita. WebSearch e WebFetch existem como ferramentas adiadas e não foram carregados. Tudo aqui são regras de admissão de evidência sobre valores já amarrados (as exclusões de S3, CT-1 a CT-3, a regra de histórico da r3a, a V1RC congelada). Não reverifiquei as fontes de `sourceIds`.
- **Não li** `e01-patch/reviews/qre/`, como pedido.

## 2. Pergunta 1: a condição está cumprida?

**Bytes conferidos.**
- `git diff --stat 4b1622f f8b08aa -- CoachingCore/src CoachingCore/v1 CoachingCore/scripts`: só `src/v1-run-format.mjs`, `src/v1-run-history.mjs` e o registro do freeze `v1/RUNTIME_FREEZE_V1RWS_1.json` (que `08d2dc8` acrescentou).
- No candidato: `v1-run-format.mjs` `e8f364e3…`, `v1-run-history.mjs` `06deb84c…`. Em `08d2dc8`: `419cac2d…` e `50f178e2…`, os do registro.
- `RUN_FORMATS_V1.json` `26c6e3fb…` nas duas árvores. Os outros seis arquivos que o registro amarra têm, no candidato, os sha256 do registro: `v1-run-format-index` `fd38ebb0…`, `v1-run-calibration` `0eae6521…`, `v1-run-index` `a86b6f1e…`, `v1-index` `8a9bdd50…`, `r6-adaptation` `6cedcb72…`, `r6-provenance` `2b9c5ccc…`.
- **Cópia do anterior:** `git archive 08d2dc8` de `CoachingCore` e dos registros de autoridade que o runtime lê, mais `node_modules` do worktree, em `…/scratchpad/judges/ssctr-r6/base-08d2dc8/`. Os arquivos de `src/` e `v1/` são iguais em sha256 a `git show 4b1622f:`, um a um.

**As sondas do Quality da R5**, sem mudança (`q5-workpace.mjs` `9944228c…`, `q5-workpace2.mjs` `8467d915…`, `lib.mjs` `4aca94c3…`), nas duas árvores. Minhas saídas são iguais byte a byte às guardadas em `e01-patch/probes/out/judge-*.json`.

| Caso (`q5-workpace2`, semanas 3 a 6, ritmo 255, esforço 7, relógio POOR) | `08d2dc8` | `f8b08aa` |
|---|---|---|
| fundida, sem correção | nada retido, `THRESHOLD_CONTROLLED [300,335]`, `c65ab1fd…` | igual |
| correção simples | 4× `REPORT_NOT_CARRIED`, `[300,335]`, `c65ab1fd…` | igual |
| **correção que lista uma gravação** | **nada retido, `[290,325]`, `a7a23d20…`** | **4× `REPORT_NOT_CARRIED`, `[300,335]`, `c65ab1fd…`** |

Em unidade (`q5-workpace`): a correção que lista e a que declara falha davam leitura `SEVERAL_RECORDINGS` / `CORRECTED_MEASUREMENT` e retenção `[]`; no candidato a leitura traz `wholeRow: REPORT_NOT_CARRIED`, a linha é retida e entregue marcada POOR.

**A variante que declara falha pelo ponto de entrada**, que a R5 só mostrou em unidade. Sonda minha `r6-quality.mjs` (`e8be2bc6…`), o mesmo cenário de quatro semanas, mais o atleta sozinho como controle, e as semanas 7 e 8 como prescritas:

| Variante | `08d2dc8` | `f8b08aa` |
|---|---|---|
| relógio + sem correção | `[300,335]`, fatores `{}` | igual |
| relógio + correção simples | 4× `REPORT_NOT_CARRIED`, `[300,335]` | igual |
| relógio + correção que lista | nada retido, **`[290,325]`**, `THRESHOLD_CONTROLLED +0,03` | 4× `REPORT_NOT_CARRIED`, `[300,335]`, `{}`, hash do controle |
| **relógio + correção que declara falha** | nada retido, **`[290,325]`**, `+0,03` | **4× `REPORT_NOT_CARRIED`, `[300,335]`, `{}`, hash do controle** |
| atleta sozinho: sem correção, lista, declara | `[290,325]`, `+0,03` | igual (leitura 1) |

Em todas as 14 execuções: motor `KEEP` nas semanas 7 e 8, triagem `NOT_RAISED_BY_THIS_EXTENSION`, a execução das sessões de qualidade `TIME`, concluída. A dose das semanas 7 e 8 (id, esporte, status, minutos e hash da prescrição de cada sessão, força incluída) e a expressão das corridas são idênticas nas duas árvores e em todas as variantes.

**O teste novo.** `node --test test/v1rws-e01.test.mjs`: 6 de 6 no candidato; 0 de 6 na cópia de `08d2dc8`. `node --test test/v1rws-*.test.mjs` no candidato: 114 de 114. São testes do autor: os rodei como conferência, não como evidência principal.

**A regra, por leitura do código.** Em `distanceFacts`:
- numa linha **com** distância, `told??ofRow` só difere de `told` quando a palavra é nula, e então `wholeRow` também é nulo (a palavra termina em `wholeRow`). Nada muda, por construção;
- numa linha **sem** distância, o resultado só muda quando `wholeRow` é um motivo de linha inteira e a palavra é um motivo de distância. Aí a linha passa a ser retida. Nenhum caso deixa de reter.

A condição está **cumprida no Core**: numa linha sem distância, um motivo de linha inteira retém mesmo quando o relato da própria linha dá um motivo só de distância, e o teste de resultado da sessão de qualidade existe nas duas variantes.

## 3. Pergunta 2: decisões esportivas, dose e performance

| O que | Preservado? | Evidência |
|---|---|---|
| Dose e progressão do motor; coordenação corrida e força; carga | **sim** | `r6-quality`: dose das semanas 7 e 8 idêntica em 14 execuções, motor `KEEP`. Os arquivos do motor têm os hashes do registro. |
| Seleção e expressão dos formatos | **sim, salvo a leitura 2** | `r6-quality`: expressões idênticas. `r6-s3`: só o caso mascarado muda (seção 4). |
| Conclusão por distância, crédito de adesão | **sim** | `readCompletion` não lê `paceWithheld` (grep: só `executionOf`, linhas 694 e 698, e os leitores de admissão). Execução `TIME`, concluída, igual nas duas árvores. |
| Referência de histórico, L30, longão comparável (S2) | **sim** | `historyReference`, `L30` e `comparableLongRun` não leem `paceWithheld` (código). `r6-s3`: `extentKm` 8 nas duas; o longão da semana 4 fica em 14 km, S2 360, nas duas. |
| Triagem e holds clínicos | **sim** | `r6-symptom.mjs` (`7e9f5ea9…`): a correção que lista ou declara com parada por sintoma dá `REQUIRED` com 0 nativas na resposta da correção, nas duas árvores. Na semana seguinte, `NOT_RAISED` com 1 nativa nas duas: é idêntico e anterior a este patch (já anotado nos itens L, seção 5). Só a lista de retidos difere. |
| Calibração V1RC | **sim** | `v1-run-calibration.mjs` `0eae6521…`, sem diff. No candidato, a calibração das variantes mascaradas tem o hash do controle (`c65ab1fd…`), que é a calibração congelada lendo a linha fundida. O modelo matemático não mudou. |
| Tolerância, limiar ou critério novo | **nenhum** | O diff acrescenta um campo de leitura em memória (`wholeRow`). `PACE_WITHHELD` e `WHOLE_ROW_WITHHELD` iguais, na mesma ordem. Nenhum número entra. |

## 4. Pergunta 3: as seis leituras do autor

| # | Leitura | Posição | Por quê |
|---|---|---|---|
| **1** | linha sem distância que carrega todos os relatos em vigor segue entregue, mesmo com motivo de distância do próprio relato | **ACEITA: dentro do que foi decidido.** Não é lacuna da regra L1. Gera a condição F-02 de integração | L1 é sobre linhagem: a linha carregar todos os relatos em vigor. Os motivos de distância são, por decisão (r3a A1 fato 3; QRE-RWS-B-01), sobre a **distância medida** da linha: dizem que a primeira gravação não é a corrida inteira. Numa linha sem distância medida não há o que marcar. A execução mostra o ponto: o atleta sozinho dá `[290,325]` e `+0,03` **também sem correção nenhuma** (`r6-quality`, atleta sozinho), igual nas duas árvores e com a lista e a declaração. Não é a lista nem a declaração que move a faixa: é a V1RC congelada lendo o ritmo de trabalho declarado com esforço 7. Tornar "declarou falha de medição" um motivo para não ler o ritmo de trabalho seria um critério novo da V1RC. Não o crio: não tenho evidência de que esse ritmo veio da medida que falhou, e a V1RC não se reabre aqui. O risco real está na integração: um ritmo **medido pelo aparelho** e posto no relato do atleta perderia a marca POOR do aparelho. A F-02 aplica a exclusão já decidida (`devicePoor`), sem regra nova. |
| **2** | a corrida retida deixa de ser fonte S3; corridas leves passam de tempo a distância na mesma dose | **ACEITA EXPRESSAMENTE. É o que a regra L1 manda.** Gera a condição F-03 | Executei (`r6-s3.mjs`, `1f2515dc…`). A fonte S3 (`latestClassRun`) já excluía por decisão toda corrida retida de leitores de ritmo, e L1 diz que a linha que não carrega todos os relatos em vigor não vai a leitor de ritmo. A corrida mascarada era a fonte a 442,5 s/km (59 min sobre os 8 km que o atleta declarou com falha de sinal). Com ela, as leves da semana 4 saíam `TIME` (`NO_DISTANCE_WITHIN_CONTINUOUS_ENVELOPE`). Sem ela, saem `NATIVE` 11 km em 70 min e 9 km em 65 min, fontes S1 370 e S3 345; CT-1 67,83 ≤ 70 e 62,83 ≤ 65; CT-2 63,25 ≥ 63 e 59,08 ≥ 58,5; CT-3 11 e 9 ≤ 18,084. Os minutos são idênticos. **É o mesmo resultado** de três irmãos que o congelado já dava: a corrida fundida (8 km POOR, excluída por POOR), a correção sem motivo (excluída por `REPORT_NOT_CARRIED`) e o atleta que relata só os minutos. **"Reter" aqui não é só mais conservador**, e o autor tem razão em dizer isso: a observação retida era mais lenta e empurrava para TIME. Mas uma regra de admissão não pode depender da direção para onde aponta a evidência inadmissível. Isso seria escolher a evidência pelo resultado. A observação tem a proveniência incompleta, e a única medida que a acompanha é do aparelho, marcada POOR. O risco que sobra é o atleta estar de fato mais lento que a última corrida admissível: a distância levaria mais tempo que os minutos prescritos. Esse risco existe igual para toda corrida cuja última observação não é admissível. É limitado pela janela de 28 dias da S3, pelo envelope CT-1 a CT-3 e pela condição V1RC de que o esforço governa e o atleta desacelera. Fica medido pela F-03. O atleta sozinho que declara 8 km com falha **continua** fonte S3, e as leves saem `TIME` nas duas árvores (é a leitura 1). |
| 3 | a palavra mostrada numa linha mascarada é o motivo de linha inteira; `reportsVerdict` continua dando a palavra única | **ACEITA**, com a condição F-01 | É rótulo. Dose e crédito não mudam. A palavra única, numa linha sem distância, pode ser um motivo de distância que nada retém. O teste do autor mostra que, pela palavra sozinha, as voltas de uma sessão nativa ainda leriam como evidência de ritmo. Um leitor futuro (fase B, Race Forecast) que usasse a palavra sozinha reabriria o E-01. |
| 4 | com os dois motivos de linha inteira juntos, mostra-se `REPORT_NOT_CARRIED` | **ACEITA** | Precedência aceita na R5, só de rótulo. Os dois retêm. |
| 5 | linha em conflito mascarada passa a ser nomeada como retida | **ACEITA**, por leitura do código | `factsFromLedger` pula linha em conflito, e a calibração nunca a leu. Só o nome muda. Não rodei esse cliente (L19). |
| **6** | o custo L1-f aumenta | **ACEITA. É o custo da mesma classe** que aceitei em L1 (r2, seção 3) para a correção simples | O que se perde é a observação de ritmo de uma corrida, nunca dose, crédito ou conclusão (`r6-quality`, `r6-s3`). Os casos novos são `REPORT_NOT_CARRIED` e já entram, pelo texto, na fração da condição L1-f. A F-03 pede que a integração os conte à parte, com as quedas da fonte S3, porque são o caso em que reter também muda a expressão. O cliente Q20 (relógio sem POOR) é a mesma perda de evidência legítima que L1 já aceitou. |

**As perguntas da constituição (SSCTR-07)** para a única mudança com efeito na prescrição, a leitura 2:
- O plano segue adequado e o motor responde `KEEP`.
- O fato material com proveniência é que a linha não carrega um relato em vigor. A mudança necessária é só deixar de ler essa observação, que é a menor intervenção possível.
- A alternativa menor seria manter a observação como fonte. Ela é insuficiente porque contraria L1.
- A dose e a progressão ficam iguais. A incerteza que sobra é a fração real (F-03).
- Não há ASK, HOLD nem rota clínica nova.

## 5. Condições novas

| id | quando | o quê | dono |
|---|---|---|---|
| **SSCTR-RWS-F-01** | antes de a fase B ou o Race Forecast lerem `paceEvidence` ou as linhas (junto da A-04) | Todo leitor novo de ritmo, capacidade ou resultado de prova recebe a leitura inteira (`reportsReading`, com `wholeRow`), ou o `paceWithheld`/`paceEvidence` já calculados por `distanceFacts` com ela. Nunca a palavra de `reportsVerdict` sozinha como critério de admissão. O teste de resultado cobre uma linha sem distância mascarada. | Engenharia; conferência SSCTR na fase B |
| **SSCTR-RWS-F-02** | antes de integração ou atleta real | Um valor que o aparelho mediu (ritmo de trabalho, voltas, distância, gravações) chega ao Core **só** no relato do aparelho, com a qualidade que o aparelho deu (`gpsQuality`). O relato do atleta leva como ritmo de trabalho só o que o atleta declara, nunca um valor pré-preenchido do `HKWorkout`. Se o adaptador quiser mostrar ao atleta o ritmo medido para ele confirmar, a qualidade do aparelho viaja com o valor. Aplica a exclusão já decidida (`devicePoor`, r3a A1 fato 3); não cria critério novo. | Integração e Data (semântica de medida); Security para a origem pelo canal |
| **SSCTR-RWS-F-03** | antes de integração ou atleta real (parte da L1-f) | A fração que a integração declara inclui, à parte, as corridas retidas por este patch (correções do atleta que listam ou declaram depois de uma importação) e a frequência com que a fonte S3 cai para uma corrida anterior por retenção, com as sessões que passam de tempo a distância. Se for material, o caminho de volta é o da L1-f. | Integração; releitura SSCTR |

**A condição QRE-RWS-E-01 do registro:** a parte do Core está **cumprida** em `f8b08aa`. A leitura esportiva fica como estava: o ritmo de trabalho de uma linha que não carrega todos os relatos em vigor está dentro da regra L1.

## 6. Pergunta 4: o registro habilitador

**Eu confirmaria, do lado esportivo, o registro de `V1X-RUN-NATIVE` para os bytes de `f8b08aa`.** Não emito a confirmação agora. Emito ou recuso depois de ler o parecer de Quality desta rodada, quando você pedir.

Condições da confirmação:
1. **Amarração:** o runtime de `f8b08aa`: `src/v1-run-format.mjs` `e8f364e3c977d1127205a83a1bdae557dd503913a713b0df56dc8ad64cac6a99`, `src/v1-run-history.mjs` `06deb84c3bb22c5af99108d8169d58fde3c319887dab5404c308ed4537676902`, mais os outros seis arquivos com os hashes que o registro já lista, e os valores `26c6e3fb…`. Qualquer outra mudança pede nova verificação SSCTR.
2. **Todas as 14 condições do registro seguem.** A do QRE-RWS-E-01 passa de "corrigir no Core" a "cumprida no Core em `f8b08aa`", com a mesma leitura esportiva. Entram F-01 a F-03. O hard gate E-1 (L5), também na forma de um relato só, segue **não atendido**.
3. **Pré-requisito:** o parecer de Quality da R6 não pede mudança de runtime e não mostra efeito esportivo que eu não tenha visto: um caso em que algo antes retido passa a ser entregue, ou em que a dose, o crédito ou a triagem mudam.
4. **Onde fica:** a confirmação é um registro novo, fora de `phase-a/`, que nomeia o registro existente (`a5b915c6…`) e os bytes acima. O registro de `phase-a/` não é editado.
5. **Atenção do coordenador:** o runtime lê o registro de `phase-a/` amarrando só o hash dos valores, que não mudou. Ele já trata `V1X-RUN-NATIVE` como ligado com os bytes do patch. Isso **não é** a minha confirmação. A amarração aos bytes de runtime é documental e do freeze. O V1RWS-1 amarra os bytes de `4b1622f`, e o `--check` desta árvore dá `DRIFT` (relato do autor, não rodei). Nenhum freeze é emitido ou flexibilizado por este parecer.

Não vejo motivo esportivo para retirar o registro: o patch só retém mais, e o que muda de expressão é a regra L1 aplicada.

## 7. Pergunta 5: o contrato de integração iOS

**Não contradiz L1 a L5 e não apresenta o hard gate E-1 como atendido.**

- **L1, regra do locutor:** a seção 1 a reproduz. A seção 2 (um relato por autor, origem pelo canal) é compatível com L1-c e mais estrita. A seção 5 (origem que não se demonstra vira aparelho não identificado, nunca atleta) só retém mais.
- **L2:** nada no contrato faz um relato recusado sair de vigor.
- **L3 e L4:** o contrato não toca a referência de histórico.
- **L5 / E-1:** a seção 6 o chama de "não atendidos". Diz que a separação das vozes "não resolve o E-1 sozinha". Repete o mínimo (ADVERSE, SYMPTOM, FATIGUE, HEAT; o que o atleta declarou por último; a triagem; as declarações em vigor; "nas duas formas de envio"). Repete que reapresentar não basta e que a mudança do motor é decisão do Founder. O cabeçalho repete "não atendidos".
- **A parada por sintoma:** fica fora das leituras de origem (seção 5), como em L1. O conteúdo clínico segue CLINICAL_HUMAN_REQUIRED.
- **Um ponto a apertar, sem contradição:** a tabela da seção 2 põe "ritmo de trabalho informado" e "as voltas que o atleta confirmou" na voz do atleta. Se o adaptador pré-preencher esses valores do `HKWorkout`, uma medida do aparelho chegaria sem a marca POOR do aparelho. A F-02 fecha isso.

O contrato diz que é orientação documental e não integração. Não o trato como evidência de comportamento do adaptador ou do HealthKit.

## 8. O que não verifiquei

- A suíte inteira, `v1rws-freeze` (`--preserved`, `--check`), `npm run verify`, `verify-r*`, `v1rc-journeys`, `v1rc-fuzz` e `validate_records.py`. Nenhum foi rodado.
- A diferencial e a mutação do autor (`differential.mjs`, `mutation.mjs`, `p1-decompose.mjs`): não as rodei e não as usei como evidência.
- Pelo ponto de entrada: `DURATION_REQUIRED` e `DISTANCE_DISPUTED` numa linha sem distância, `REPORTS_UNREADABLE`, a correção tardia, as voltas de sessão nativa e as quatro ordens. Só os vi nos testes do autor, que rodei e passam.
- A linha em conflito (leitura 5): só por leitura do código.
- Meia e maratona; a prova por jornada inteira.
- A fração real retida, o importador do HealthKit e a custódia. A origem pelo canal e a guarda são da Security.
- O parecer de Quality desta rodada (não lido, como pedido).

**Fila humana, proposta e não anexada:** HQ-V1RWS-E01-SSCTR-R6, sobre a fonte S3 depois de retenção (leitura 2) e sobre o ritmo de trabalho declarado com falha de medição (leitura 1, F-02). Ficam os itens propostos antes (r2 a r5).

**Expiração.** Revejo esta decisão até 2027-05-15, ou antes se surgir qualquer um destes:
- um pedido de mudança de runtime de qualquer juiz;
- o início da fase B ou do Race Forecast (F-01);
- uma mudança no contrato de dados ou no contrato iOS;
- dados do importador ou da fração retida (F-03);
- uma decisão do Founder sobre o motor.

## 9. Contexto injetado pelo host

O host pôs no meu contexto:
- o CLAUDE.md global (`c75718d0d2fe2cce1332cf7240ef0b8013ca2901d52b4d6778480c1c333709c6`);
- o CLAUDE.md do projeto em `MyApp/` (`e657d059e06fd1a21613250753a8c79ac605b69d955191d634966b3c8fc922e6`; o do worktree tem outro hash, `2b659f1c…`, e não foi o injetado);
- o MEMORY.md (`e1b1cd9a98c19f036b22dbc6dda4b13b69c41bfb011ac9b775d6f14527165538`).

Eles resumem rodadas anteriores e nomes de achados. Li-os só como contexto. Nada deles serviu de evidência.

**Arquivos julgados e lidos (sha256):**
- registro do autor `E01_PATCH.md` `06cac423…`;
- contrato iOS `2e417347…`;
- teste novo `v1rws-e01.test.mjs` `0fb768e7…`;
- registro habilitador `a5b915c6…` e adendo `dd174b53…`;
- itens L `6cb5d83c…`;
- r5 SSCTR `44f511c4…` e r5 QRE `be216a23…` (achado E-01 e seções 6 e 8).

**Sondas minhas e saídas**, em `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/cc877d93-9457-4c53-b263-90eed80e7399/scratchpad/judges/ssctr-r6/`:
- `r6-quality.mjs` `e8be2bc6…`, com saídas `1b7fd142…` (anterior) e `dbc7abcd…` (patch);
- `r6-s3.mjs` `1f2515dc…`, com saídas `36e60e28…` e `5bcc55fb…`;
- `r6-symptom.mjs` `7e9f5ea9…`, com saídas `336c7ff4…` e `ced76ca2…`.

Escrevi no worktree só estes dois arquivos. Não usei nenhum comando git de escrita.
