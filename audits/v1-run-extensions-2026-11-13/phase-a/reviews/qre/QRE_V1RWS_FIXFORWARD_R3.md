# QRE: fix-forward da fase A do V1RWS, R3

**Veredito: `NOT_READY`.** Há 2 achados BLOCKING, os dois do critério de fechamento do QRE-RWS-B-01, que fica **PARTIAL**:

- **QRE-RWS-C-01:** quando um dos relatos fundidos traz a lista de arquivos vazia (`segments: []`), a fusão do motor apaga a lista do app, e a V1RC volta a ler o primeiro arquivo sobre os minutos inteiros. A faixa EASY vai de `[345,420]` para `[345,575]`, nas três ordens de chegada.
- **QRE-RWS-C-05** (o SEC-RWS-C-01, verificado por mim): a resposta `REVIEW_BEFORE_THE_RECORD` sobre uma decisão que o motor aceitou carrega a calibração do registro não admitido (`[345,575]`) e não nomeia a triagem que o registro exige. O caminho é novo deste ciclo: em `a8e9b05` a mesma sequência dava `ACTIVE` e `[345,420]`.

O caso do juiz e todas as variantes que ele e o autor testaram fecham. Pela regra da missão (uma correção, uma revisão, sem novo ciclo), a fase fecha `BLOCKED` de novo e volta ao Founder.

- **Juiz:** instância nova e independente de Quality & Reliability. Não escrevi o candidato, os relatórios anteriores nem a correção. No worktree escrevi só estes dois arquivos.
- **Data:** 2026-11-14.
- **Versões:** candidato `644cd8e` (HEAD, árvore limpa); fase A fechada `a8e9b05` (runtime igual a `d6381bb`); base congelada `c8104c1`.
- **Registro habilitador:** `reviews/ssctr/SSCTR_V1RWS_RUN_RECORDS.json` não existia antes nem depois da suíte. Todos os probes usaram a autoridade de desenvolvimento (`DEV`) dos helpers.

## 1. Reprodução do QRE-RWS-B-01 em `a8e9b05`, antes de olhar o candidato

`probe-a01-paths.mjs` da R2, sem mudança, numa extração de `a8e9b05` no meu scratch:

| Cenário | `a8e9b05` | `644cd8e` |
|---|---|---|
| controle, um arquivo (11 km) | `[345,420]` | `[345,420]` |
| fusão: app por tempo com `segments` + importação do 1º arquivo, mesma revisão | **`[345,575]`** | `[345,420]` |
| app por tempo, depois importação | **`[345,575]`** | `[345,420]` |
| importação, depois app por tempo | **`[345,575]`** | `[345,420]` |
| os outros 8 cenários da R2 | `[345,420]` | `[345,420]` |

Vi a falha original e vi o caso do juiz fechar. No candidato as três fusões saem com `paceEvidenceWithheld: SEVERAL_RECORDINGS` e a linha guardada intacta (`gpsQuality:'OK'`, `segments` com 1 item, sem `deviceGpsQuality`).

## 2. Achados anteriores no meu campo

| Id | Estado | Evidência executada |
|---|---|---|
| QRE-RWS-B-01 (era BLOCKING) | **PARTIAL** (o resto está no C-01) | Fechado: o caso do juiz nas 3 ordens (acima); duplicata, correção tardia, disputa de distância, importação sem duração, longão, prova, restart e `runCalibrationOf` exportado (testes do autor e meus probes). Aberto: a lista vazia num dos relatos fundidos (`p-merge-paths.mjs`, `p-wiring.mjs`). Ver C-01. |
| QRE-RWS-B-02 | **CLOSED** | `probe-r2 plaus`: pico de 40 km sem `minutes` (e sem `seconds`) dá UNKNOWN `DURATION_REQUIRED`, `paceEvidence:false`, histórico `null` e CT-3 máx. 18,084 (em `d6381bb` era DISTANCE/MEASURED, histórico 40, máx. 44). Linha de histórico da intake sem `durationMinutes`: `ref:null`. Bordas 119/121/899/901 s/km: UNKNOWN/DISTANCE/DISTANCE/UNKNOWN, como antes. |
| QRE-RWS-B-03 (nota) | **CLOSED** | O I10 e `--preserved` conferem o sha do arquivo emendado (`6cedcb72…6e50`, igual ao meu sha de `d6381bb`) e o sha do diff (`6675741d…e370`). Não sobra checagem lexical que decida sozinha. |
| QRE-RWS-B-04 | **CLOSED** | Li o `--write`: `passed`/`total` saem de `runSuite`, declarados antes do uso; a falha é conferida pelo nome. Num clone git meu de `644cd8e` (scratch), `--write 1 --commit 644cd8e` recusou: "no independent SSCTR record enables V1X-RUN-NATIVE…", exit 1, nenhum arquivo gravado. A leitura TAP do script, copiada sem mudança para `tap-parse.mjs`, aplicada à suíte conjunta do clone: 1409 / 1408 / 1, `failed` = só o teste histórico, `onlyHistorical:true`. O caminho de sucesso (com registro habilitador) não exercitei. |
| QRE-RWS-B-05 | **CLOSED** | Mutantes M04, M08a e M18 rodados por mim: os três mortos, cada um por um teste que nomeia o próprio mutante (seção 6). |
| QRE-RWS-B-06 (nota) | CLOSED no que foi pedido | N02 e N35 têm teste agora (ver o registro do autor; não remutei esses dois). |
| QRE-RWS-B-07 (nota) | Inalterado | `walkHeavy930` ainda dá UNKNOWN `MEASUREMENT_IMPLAUSIBLE`. Leitura do SSCTR. |

## 3. Achados novos

| Id | Sev. | Evidência | O que fecha |
|---|---|---|---|
| QRE-RWS-C-01 | **BLOCKING** | O dado "vários arquivos" só é lido na linha canônica. O fato de relato (`reportFactOf`) guarda só parada e distância medida, então o relato do app com `segments` e sem distância não deixa fato nenhum. Na fusão (`mergeActual`, congelado), a fonte de rank maior vence campo a campo: se a importação do relógio traz `segments: []`, a lista do app some. A linha fica com 6,6 km, 63 min, `segments:[]`, `partial:false`, e nada é retido. `p-merge-paths.mjs`, versão por tempo, 11 km em 63 min: mesma revisão **`[345,575]`**; app e depois importação **`[345,575]`**; importação e depois app **`[345,575]`**; `paceEvidenceWithheld: []` nos três. Dois relatos do próprio app (o primeiro com `segments:[]`, o segundo com o 2º arquivo), nas duas ordens: **`[345,575]`**. `p-wiring.mjs`: o mesmo no `restartProgram` e no `runCalibrationOf` exportado (com e sem os fatos). Na versão nativa a linha sai `partial:true` e fica fora (`[345,420]`). Em `a8e9b05` esses casos também davam `[345,575]`: não é regressão, é o B-01 por outra fusão. `[]` é um valor válido do campo (o próprio código o lê como "nenhum arquivo a mais"), e nem o contrato ADF nem a r3a proíbem que uma importação o envie. | Guardar também, como fato de cada relato recebido, que ele lista mais de um arquivo, e retê-lo em `reportsVerdict` como `SEVERAL_RECORDINGS`, com teste nas três ordens e com dois relatos do app. |
| QRE-RWS-C-02 | CONDITION | Um fato de parada alterado no `runFormatRecord` (data ilegível, motivo trocado para FATIGUE, chave a mais, outro atleta) fica ilegível, é nomeado em `unreadableReports`, e a triagem **não** é pedida: `warningSignScreen` NOT_RAISED e 6 sessões nativas (`p-facts.mjs alter`). Um fato apagado também some sem rastro (o teste do próprio autor afirma isso). Um formato ilegível já citado dá HOLD; um fato de relato ilegível não falha fechado. Só acontece com registro corrompido ou adulterado, sem cliente conforme, e cai na integração da custódia já aberta (Security A-01). | Antes da integração: tratar um fato `RUN_REPORT_RECEIVED` ilegível como triagem pedida (ou HOLD), e a cadeia com chave da custódia para o apagamento. Decisão de Security e SSCTR. É o mesmo achado que a Security registrou como SEC-RWS-C-06; achei-o antes de ler o relatório dela. |
| QRE-RWS-C-07 | NOTE | **SEC-RWS-C-05, verificado** (`p-sec.mjs shape`): uma chave a mais no topo da linha de fato e uma chave a mais dentro de `stop` (com o hash refeito) são lidas, e a triagem sai REQUIRED; `recordedAt` recuado 7 dias, fora do hash, faz a triagem antiga limpar a parada (`NOT_RAISED`). O registro do autor diz "cinco campos fechados": vale para o `report`, não para a linha nem para `stop`. Fora da custódia o cliente já controla a elegibilidade, então não há ganho novo. | Conjunto exato de chaves na linha e em `stop`; `recordedAt` sob o hash ou sob a cadeia. |
| QRE-RWS-C-03 | NOTE | Mutantes que sobrevivem (seção 6). | Opcional. |
| QRE-RWS-C-05 | **BLOCKING** | **Minha decisão sobre o SEC-RWS-C-01, roteado pela Security.** Verifiquei com um probe meu (`p-inert.mjs`): semana 3 com a corrida em dois arquivos num relato (que o candidato retém); revisão aceita em 4/2 às 20:00; em 4/4 um relato de formato desconhecido com parada SYMPTOM dá ASK, que grava 1 fato de parada sob o instante dele e devolve a triagem REQUIRED; depois chega a revisão de 4/3, que estava na fila, com o estado de referência da última aceita. O motor decide `KEEP` e a extensão responde `REVIEW_BEFORE_THE_RECORD`, com `runCalibration` CALIBRATED e EASY **`[345,575]`** e `warningSignScreen` ausente. Em `a8e9b05` a mesma sequência dá `ACTIVE`, `[345,420]` (o ASK não guardava fato). A causa é a de B-01: `inert(base, …)` devolve a calibração que o `v1-run-index.mjs` fez sobre o registro cru, e `notice` sai só do pedido, não do registro. As outras respostas inertes sobre decisão aceita: HOLD e rota clínica saem `WITHHELD_HOLD` com as faixas `UNAVAILABLE` (sem dano); ASK/HOLD de formato desconhecido ou perdido saem com calibração `NOT_APPLICABLE` (sem dano); `FORMAT_ERROR` (o `catch` de `finish`) e `REVIEW_TIME_REQUIRED` devolvem `base0`, a calibração crua, pelo mesmo código, mas não consegui acioná-los (nenhum dos 169 casos malformados caiu no `catch`; o `asOf` já chega validado). **Por que BLOCKING e não CONDITION:** é cliente conforme (revisão offline na fila), o critério do B-01 é que a linha não chegue à V1RC como evidência de ritmo, e esta resposta mostra a faixa movida. O que atenua: a resposta não entrega sessões, não é gravada, e a próxima revisão aceita volta a `[345,420]`; sob a custódia, com `asOf` do servidor e monotônico, o caminho só abre com o relógio regredindo (leitura da Security, que não verifiquei). | Toda resposta inerte sobre uma decisão aceita pelo motor (`REVIEW_BEFORE_THE_RECORD`, `FORMAT_ERROR`, `REVIEW_TIME_REQUIRED`) leva a calibração refeita sobre `admitted`, ou nenhuma, e nomeia a triagem que o registro exige; teste com o ASK seguido de revisão anterior. |
| QRE-RWS-C-06 | CONDITION | **SEC-RWS-C-02, verificado:** `sourcesOf` não deduplica `mergedSourceIds`, e cada id percorre todos os fatos do mesmo `reportId`. `p-sec.mjs`, uma linha com n ids iguais e n fatos com o mesmo `reportId`: n=1000 68 ms, 3000 368 ms, 10000 **2270 ms** (3,4 MB), contra 39, 65 e 132 ms com ids distintos. Quadrático. Pede registro hostil; dentro da custódia os ids são do servidor. | Deduplicar `sourcesOf` e limitar fatos por `reportId` e ids lidos por linha, com teste de custo. |
| QRE-RWS-C-04 | NOTE | O teste I3/I4/SC-3 (`v1rws-execution`) agora calcula `used` sobre `F.admitted(...)`, a própria função sob teste. A asserção nova sobre `paceEvidenceWithheld` e a linha intacta compensa, mas a parte de `used` ficou circular. | Opcional: comparar com o registro cru e uma regra escrita no teste. |

## 4. Motor e calibração congelados

- `v1-run-calibration.mjs`, `v1-run-index.mjs`, `v1-index.mjs`: sha256 iguais ao blob de `c8104c1` (`0eae6521…`, `a86b6f1e…`, `8a9bdd50…`). `r6-adaptation.mjs` igual a `d6381bb` (`6cedcb72…`).
- Sem leitor, contra o worktree `v1-run-calibration` (`c8104c1`): `old-probe-identity` **194/194** hashes iguais; `probe-identity2` **82/82**.
- Fronteira nativa desligada (`p-off.mjs`, jornada com digitada, dois arquivos, fusão com lista vazia, parada, rota clínica e restart): composto contra `v1-run-index.mjs`, **8/8 passos idênticos** fora das quatro chaves da extensão.
- Ligada, sem nada retido: a calibração é a do `v1-run-index.mjs` (`r2-compare`, jornada só com GPS: 0 chaves diferentes em 10 passos; controle de um arquivo igual ao congelado).
- Ligada, com algo retido: um oráculo meu (a V1RC congelada com os argumentos do `v1-run-index.mjs`, sobre um registro admitido por regra minha) dá o mesmo hash que o composto em `evaluateProgram`, em `restartProgram` e no `runCalibrationOf` exportado (`p-wiring.mjs`, 4 cenários). Conferi os argumentos linha a linha: programa em vigor, registro, `runEvidenceRecord`, `asOf`, `weekIndex`, `hold`, `engineStatus`, `eligibility`. No restart o `hold` passa como `false` onde o `v1-run-index.mjs` o omite; a V1RC tem `hold=false` por padrão, então é o mesmo.

## 5. Registro guardado, replay, determinismo, robustez

- **Custódia** (`probe-custody2`): 6/6 submissões ok, `verify:null`, linhas guardadas 5/5, 9/10 (a anotação de correção do próprio motor, como na R2), 16/16, 21/21, 26/26. Nenhum "a stored row changed". A marca POOR não é mais escrita na linha (`gps:'OK'` guardado).
- **Replay** (`probe-r2 replay`, `probe-replay-x`): mesma entrada, mesma saída; com os registros atualizados, `runSessions`, ledger e calibração iguais; `proposal` vira `null` igual ao `v1-run-index.mjs`.
- **Ordem**: registros embaralhados mudam só `inputHash`, `trace` e a ordem de `runFormatRecord` (igual como conjunto).
- **Recusadas** (`probe-r2 refused`): HOLD, UNSUPPORTED e retroativas deixam o registro com o mesmo tamanho e hash.
- **Não lança**: `probe-r2 throws` 154 entradas, 0 exceções; `p-facts.mjs` mais 15 fatos e relatos malformados, 0 exceções.
- **Custo**: `repeat:2e6` 28 ms; 50 linhas assim 31 ms; `steps` 1e5 958 ms (contra 914 ms do `v1-run-index`); `segments` 1e5 758 ms (668); 1e5 fatos de relato forjados 1,1 s, 1e4 válidos 133 ms. Linear e no nível do motor congelado.

## 6. Mutação (cópia `git archive` de `644cd8e` no meu scratch, os 74 testes v1rws, arquivo restaurado e conferido por sha)

37 mutantes escritos; 36 aplicados (K36 não casou com o texto e não rodou). **33 mortos, 3 sobrevivem.** Os 3 arquivos da cópia conferem com o sha de antes no fim.

| # | Mutação | Resultado (teste que mata) |
|---|---|---|
| M04 | leitor ignora a igualdade de `plannedPrescriptionHash` | morto: "QRE-RWS-B-05 (M04)", só ele; agora a linha forjada é a NATIVA |
| M08a | `prior` de qualidade em vigor só pela data | morto: "QRE-RWS-B-05 (M08a, M18), through the entry point" |
| M18 | formato reselecionado dentro da semana | morto: o mesmo teste, pelo ponto de entrada |
| K01 | `admitted` ignora o veredito dos relatos | morto (2) |
| K02 | `admitted` devolve o registro cru | morto (8) |
| K03 | calibração não é refeita | morto (6) |
| K04 | P1 lê o registro cru | morto (1) |
| K05 | `runCalibrationOf` exportado sem admissão | morto (1) |
| K06–K09 | `SEVERAL_RECORDINGS`, `CORRECTED_MEASUREMENT`, `DURATION_REQUIRED`, `DISTANCE_DISPUTED` desligados | mortos |
| K10, K11 | tolerância 0,5 no lugar de 0,91; relato sem duração ignorado | mortos |
| K12, K13 | parada só em linha sem conflito; fatos de parada ignorados | mortos (os testes do SSCTR-RWS-B-01) |
| K14 | triagem respondida no mesmo instante da parada conta (`>=`) | **sobrevive**: falta a borda |
| K15–K17 | fatos não gravados na revisão aceita; gravados na recusada; parada não nomeada na resposta | mortos |
| K18, K19 | ASK de elegibilidade ignorado; `prescribing` sob ASK | mortos |
| K20–K22 | sem duração usável, no histórico e na intake | mortos |
| K23, K24, K27, K28 | integridade da linha de fato (cinco campos, hash, atleta, fonte medida) | mortos |
| K25, K26 | S3 e `paceEvidence` sem `paceWithheld` | mortos |
| K29 | `hold:false` na calibração refeita | **sobrevive** (o autor diz equivalente: o motor grava o hold no registro; não provei o contrário) |
| K30 | `sourcesOf` ignora `mergedSourceIds` | morto |
| K32 | calibração refeita com `evidenceRecord: []` | **sobrevive**: nenhum teste refaz a calibração com um resultado declarado no registro de evidência; não é equivalente (um teste de campo ou uma prova declarada sumiria da calibração refeita). Meu oráculo (`p-wiring`) confere esse argumento, mas sem resultado declarado. |
| K33 | `weekIndex:0` na calibração refeita | morto |
| K34, K35 | admitido mantém a distância (só POOR); tira a distância sem POOR | mortos |
| K37 | fato de parada nunca gravado no ASK de formato desconhecido | morto |

QRE-RWS-C-03 (NOTE): K14 e K32 pedem um teste cada; K29 fica como equivalente declarado.

## 7. Testes históricos (decisão de governança de 2026-11-14)

**Confirmo formalmente:** a única falha da execução conjunta nesta linha é o teste histórico `V1RC COACHINGCORE-V1-FREEZE-1 is preserved: every file it binds is byte-identical here`, com `actual: ['CoachingCore/src/r6-adaptation.mjs']` e nada mais.

| Resultado | Onde | O que deu |
|---|---|---|
| Verificação histórica | worktree `v1-run-calibration`, HEAD `c8104c1` | `node --test test/v1rc-calibration.test.mjs`: **30/30**, o teste histórico passa. `node scripts/v1rc-freeze.mjs --check 1`: "30 added files match; COACHINGCORE-V1-FREEZE-1 preserved 198/198", exit 0. |
| Testes da extensão | `test/v1rws-*.test.mjs` nesta linha | **74/74**. |
| Execução conjunta | `node --test` em `CoachingCore/` desta linha | **1409 entradas, 1408 passam, 1 falha** (a histórica acima). `v1rws-freeze --preserved`: 197/197 + 1 emendado com o sha e o diff autorizados (22+/10−) + 30/30, exit 0. `v1rc-freeze --check 1`: DRIFT só em `(FREEZE-1) CoachingCore/src/r6-adaptation.mjs`, exit 1, como esperado. |

`git diff c8104c1 644cd8e --name-status -- CoachingCore`: só `M src/r6-adaptation.mjs`; todo o resto é `A`. Nenhum teste de `c8104c1` foi editado, removido ou teve a expectativa mudada. Esta suíte conjunta não é verde e não deve ser anunciada como verde; a exceção histórica documentada não substitui a aprovação do candidato, que este parecer nega.

## 8. Testes anteriores que o autor mudou

| Teste | Leitura |
|---|---|
| `v1rws-engine` I7/T3 | Legítimo. Antes afirmava a marca gravada; agora afirma linha intacta, confiabilidade POOR e distância retida. Mesmo resultado, com uma asserção a mais. |
| `v1rws-engine` I10/V6 | Mais forte. A contagem virou exata (22/10) e entram os sha do arquivo e do diff, os mesmos do verificador. A checagem "linha removida volta com só o leitor" saiu, mas o sha do diff cobre mais que ela. O guard `r.format?` em `altered` só pula as linhas de fato de relato, que não têm formato. |
| `v1rws-execution` T7/T20 | Legítimo. Mesmo status, base e histórico; a qualidade agora é a do aparelho, e a confiabilidade POOR é afirmada pela leitura. |
| `v1rws-execution` I3/I4/SC-3 | Legítimo no resultado, com a circularidade da C-04. |
| `v1rws-review-fixes` A-01 | Legítimo e mais forte: a versão por tempo agora também confere as faixas contra o controle. |
| `v1rws-review-fixes` A-06 (M03) | **O resultado esperado mudou**: a correção fundida de duas fontes era UNKNOWN `CORRECTION_NOT_MARKED_POOR` (`partial:true`); agora é DISTANCE `CONFIRMED_CORRECTION` (`partial:false`), nunca ritmo, distância retida. Como teste não está mais fraco: continua afirmando que não vira evidência de ritmo, e ganhou a borda de 0,91 (WE3A-04). Mas o crédito novo é uma leitura esportiva (seção 4, item 3, do autor): cabe ao SSCTR. O M04 agora forja a linha NATIVA (morto, seção 6). |
| `v1rws-ssctr-examples` WE3A-02, WE3A-04, WE3A-10 | Legítimo. As três entradas voltam a ser o caso como a r3a o escreve (qualidade do aparelho, sem marca da extensão); nenhum status, base ou referência de histórico esperado mudou. A asserção `SEGMENTS_NOT_MARKED_POOR` saiu porque a regra mudou; entrou WE3A-10 com OK, UNKNOWN e POOR. O POOR do aparelho dar UNKNOWN é leitura do SSCTR. |

## 9. O que é de outros donos (vi, não decido)

- SSCTR: a parada lida em linhas em conflito, em relatos recusados e após correção (os testes do autor e o probe do SSCTR cobrem; não reexecutei o p1c). As leituras 1 a 6 da seção 4 do autor, em especial o crédito novo da correção fundida (A-06) e a prova em vários arquivos deixar de ser resultado.
- Security: a C-02 (fato ilegível ou apagado), a C-06 e a C-07 (limites e forma da linha de fato), o SEC-RWS-C-03 (a custódia recusa a fusão de dois relatos em duas requisições; meu `probe-custody2` não exercita esse caso, não o verifiquei) e o SEC-RWS-C-04 (inventário dos fatos de relato), os fatos de relato no `runFormatRecord` (motivo de parada e distância por relato) e a cadeia com chave (A-01, A-06), que segue inexistente.

## 10. O que rodei e onde

- Scratch: `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/c10c7f19-99c9-449b-b28b-312cccb82112/scratchpad/qre-r3-judge-1794656631/` (extrações `a8e9b05/`, `c644/` (mutação) e `c644b/` (probes); clone git `clone644/`; probes em `probes/`; saídas `out-*.json`, `r2-*-644.json`, `suite-*.tap`, `mutants-r3.json`).
- No worktree, só o permitido: `node --test` (inteira e `test/v1rws-*.test.mjs`), `v1rws-freeze --preserved`, `v1rc-freeze --check 1`. No worktree `v1-run-calibration`: `node --test test/v1rc-calibration.test.mjs` e `v1rc-freeze --check 1`. `git status` limpo nos dois depois.
- Probes da R2 copiados e rodados no candidato: `probe-a01-paths`, `old-probe-identity`, `probe-identity2`, `probe-r2` (cost, plaus, refused, throws, compare, replay), `probe-custody2`, `probe-replay-x`.
- Probes meus: `p-merge-paths.mjs` (fusões, lista vazia, dois relatos do app, correção de uma fonte, controles equivalentes), `p-wiring.mjs` (oráculo da calibração refeita, restart, exportado, longão), `p-off.mjs` (fronteira desligada), `p-facts.mjs` (fatos alterados, forjados, apagados, custo, malformados), `p-inert.mjs` (respostas inertes, para o SEC-RWS-C-01), `p-sec.mjs` (custo de ids repetidos e forma da linha de fato, para SEC-RWS-C-02 e C-05), `tap-parse.mjs`, `mutate-r3.mjs`.
- Do relatório da Security (`SEC_V1RWS_FOCAL_R2.md`) li só a tabela de achados, depois de ter escrito C-01 e C-02. Não rodei os probes dela; cada decisão acima vem dos meus.
- Não usei os testes do autor como evidência; rodei-os só como parte das suítes.

## 11. O que não verifiquei

- O `--write` com um registro habilitador presente (caminho de sucesso, `--check` depois). Li o código; o autor diz que ensaiou.
- Os números esportivos e as leituras do SSCTR (0,91 como tolerância de disputa, prova em vários arquivos, crédito da correção fundida, WE3A-10 com POOR).
- A suíte inteira sob cada mutante: rodei os 74 testes v1rws.
- As jornadas e o fuzz da V1RC (proibidos).
- HealthKit real, e se um importador real envia `segments: []`: o contrato ADF não fala de `segments`.
- A segurança da custódia.

## Contexto injetado pelo host

Nada disto foi usado como evidência.

| Arquivo | sha256 |
|---|---|
| CLAUDE.md global (`C:/Users/carva/.claude/CLAUDE.md`) | `c75718d0d2fe2cce1332cf7240ef0b8013ca2901d52b4d6778480c1c333709c6` |
| CLAUDE.md do projeto (`C:/Users/carva/Desktop/myApp/MyApp/CLAUDE.md`) | `e657d059e06fd1a21613250753a8c79ac605b69d955191d634966b3c8fc922e6` |
| MEMORY.md (`C:/Users/carva/.claude/projects/C--Users-carva-Desktop-myApp-MyApp/memory/MEMORY.md`) | `afd187467bec0da84e92007bd03cb902a4c0039f6b9e41f0927ace7ff7c349a8` |
