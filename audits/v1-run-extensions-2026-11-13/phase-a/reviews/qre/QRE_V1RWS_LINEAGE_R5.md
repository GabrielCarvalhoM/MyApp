# QRE: fix-forward da linhagem de evidências da fase A do V1RWS, R5

**Veredito: `READY_WITH_CONDITIONS`.** Nenhum achado BLOCKING.

- **QRE-RWS-D-01: CLOSED.** As três sondas do meu papel, sem mudança, reproduzem o defeito em `a4a434f` e o mostram fechado no candidato. A classe (correção cruzada sobre uma linha fundida, relato recusado em conflito, correção recusada, retração, outra atividade, três autores, calor, pausas, resposta adversa, parada por sintoma; corrida leve, longão e prova; as três ordens; respostas normais, antecipadas, reconstruídas, restart, exportada; JSON; registros embaralhados; fronteira desligada e depois ligada) não entrega distância parcial a leitor de ritmo em nenhuma das minhas sondas.
- **Duas condições antes de integração ou de atleta real:** QRE-RWS-E-01 (o motivo da linha inteira é mascarado numa linha sem distância quando a própria linha tem um motivo de distância; o ritmo de trabalho dessa linha move a faixa de limiar) e QRE-RWS-E-02 (quando duas vozes chegam como um autor só, a regra do autor não as separa; o limite que o autor declara, mais três vizinhos que ele não nomeia).
- Cinco NOTEs.

Por que nenhum é BLOCKING está dito em cada achado (seção 5). Em resumo: a regra que o Founder autorizou (contrato, seção 3.3, regra 2; V4; tabela 3.5) é escrita para a **distância** de uma linha, e essa está fechada; E-01 é sobre o ritmo de trabalho de uma linha sem distância, já existia em `a4a434f` e o candidato o reduz; E-02 é o que o contrato atribui à integração (seção 8, I-1, I-2, I-4) e o Core não consegue distinguir.

- **Juiz:** instância nova e independente de Quality & Reliability. Não escrevi o candidato, o contrato, as decisões do SSCTR nem o registro do autor. No worktree escrevi só estes dois arquivos. Não li os pareceres dos outros juízes desta rodada (havia três arquivos não rastreados de Security e SSCTR no worktree; não os abri).
- **Data:** 2026-11-15.
- **Versões:** candidato `4b1622f55e3d66e6e381bf33cc659fbed1f1713a` (HEAD conferido, árvore sem mudança rastreada antes e depois); antes `a4a434f`; base congelada `c8104c1`.
- **Registro habilitador:** não existe. Todas as sondas usam a autoridade de desenvolvimento (`DEV`) dos helpers; a fronteira desligada aparece só onde está dito.

## 1. Reprodução em `a4a434f`, antes de julgar

Cópia do autor em `scratchpad/before-a4a434f/CoachingCore`: conferi byte a byte contra `git show a4a434f:` os 159 arquivos de `src/`, `v1/` e `test/`. Todo `src/`, `v1/` e `test/v1rws-helpers.mjs` são iguais; os 86 que diferem são testes que a cópia mínima não traz (ausentes, não diferentes). Sondas do meu papel, sem mudança (sha256: `q4-corr.mjs a6de9478…`, `q4-corr-disputed.mjs 13322cbd…`, `q4-corr-race.mjs 05ec5aec…`):

| Sonda, caso | `a4a434f` | `4b1622f` |
|---|---|---|
| `q4-corr`, re-sincronização com esforço (EASY) | linha `dev-x-v2` sozinha, nada retido, **`[345,575]`** semanas 4 e 5, histórico 6,6 sem retenção | `REPORT_NOT_CARRIED`, `[345,420]`, histórico 6,6 retido |
| `q4-corr`, sem esforço; LONG com esforço | `[345,420]`, nada retido | `REPORT_NOT_CARRIED`, `[345,420]` |
| `q4-corr`, fundida (controle) | `SEVERAL_RECORDINGS`, `[345,420]` | igual |
| `q4-corr-disputed`, disputa + correção da importação | **`[345,575]`**, nada retido | `REPORT_NOT_CARRIED`, `[345,420]` |
| `q4-corr-disputed`, sem duração + correção | **`[345,575]`**, nada retido | `REPORT_NOT_CARRIED`, `[345,420]` |
| `q4-corr-race`, depois da correção, pelo ponto de entrada (`runCalibrationOf` com o registro de fatos) | **`plan-race:dev-race-v2`, 6 km em 3000 s** lido como prova | nenhum resultado de prova |
| `q4-corr-race`, calibração congelada sobre o registro nu | 6 km em 3000 s | 6 km em 3000 s (o defeito continua no registro nu; só a leitura pelo ponto de entrada fecha) |

Vi as três falhas e vi as três fecharem.

## 2. A classe (sondas minhas, pelo ponto de entrada, nos dois commits)

`q5-classes.mjs`, EASY e LONG, 42 cenários cada, cada um seguido da revisão da semana seguinte como prescrita. A coluna "antes" é `a4a434f`.

| Cenário (três ordens onde marcado) | EASY antes → candidato | LONG antes → candidato |
|---|---|---|
| A1 re-sincronização nomeando o próprio relato (3 ordens) | `[345,575]` nada retido → `[345,420]` `REPORT_NOT_CARRIED` | nada retido, histórico 9,6 → `REPORT_NOT_CARRIED`, 9,6 |
| A2 re-sincronização nomeando o id da linha (`app-x`) (3 ordens) | idem | idem |
| A3 re-sincronização com resposta da importação (3 ordens) | idem | idem |
| B1 o atleta diz `HEAT`, a importação mede inteiro e se re-sincroniza (3 ordens) | nada retido → `REPORT_NOT_CARRIED` | idem |
| B2 pausas para caminhar (3 ordens); B3 recuperação `ADVERSE` (3 ordens) | nada retido → `REPORT_NOT_CARRIED` | idem |
| C1 três autores (app, HealthKit, Garmin), HealthKit se re-sincroniza | `[345,575]` → retido; em vigor `app-x, dev-x-v2, gar-x` | retido |
| C2 três autores, cada aparelho se re-sincroniza | `[345,575]` → retido; em vigor `app-x, dev-x-v2, gar-x, gar-x-v2` | retido |
| D1 re-sincronização sem `quality`; D2 com `quality: MANUAL`; D3 provedor renomeado | `[345,575]` → retido (D2: autor não identificado, nada substituído) | retido |
| F1 o atleta reenvia sem mudança com id novo; F2 reenvia como `correctionOf: app-x` (linha já aposentada) | `SEVERAL_RECORDINGS` nos dois commits (o motor recompõe ou funde) | igual |
| F4 o atleta corrige a linha viva da re-sincronização para uma medida inteira | nada retido, histórico 11 → `REPORT_NOT_CARRIED`, 6,6 (L4) | 16 → 9,6, `REPORT_NOT_CARRIED` |
| F5 tudo reenviado depois da re-sincronização (replay) | `[345,575]` → retido | retido |
| G1 relato do app com id de 140 caracteres; G3 sem id | `[345,575]` → retido | retido |
| H1 retração pela importação | nada retido → `REPORT_NOT_CARRIED` (linha sem distância) | idem |
| H2 correção recusada pelo motor (`INVALID_CORRECTION_CHAIN`) | `SEVERAL_RECORDINGS` nos dois; histórico 11 → 6,6 | 16 → 9,6 (ver E-03) |
| H3 conflito, relato do app recusado, re-sincronização resolve | `[345,575]` → retido | retido |
| H5 parada por sintoma no app, a importação diz completa, re-sincronização | nada retido → `REPORT_NOT_CARRIED` | idem |
| I1 só a importação e a sua re-sincronização; I2 só o app, lista e se corrige | admitida nos dois commits (um autor tem caminho de volta) | igual |
| A0 controle | `[345,420]`, admitida, nos dois | igual |

Em todos os 84 casos, a decisão do motor, o estado do motor, a triagem e a leitura da execução (status, base, conclusão, `measuredKm`, minutos) são iguais nos dois commits; o que muda é só retenção, `paceEvidence`, `paceWithheld` e a referência de histórico, sempre para baixo. As duas exceções de "resposta do motor diferente" (LONG F4 e H2) eu expliquei com `q5-corediff.mjs`: a resposta do motor à **mesma** revisão é idêntica (`954f714a…`, `003c8cf8…`); na revisão seguinte o longão da semana 2 foi entregue por tempo no candidato (L4 baixou a referência de 16 para 9,6) e o cliente o relatou por tempo, então a entrada do motor é outra.

**Caminhos de leitura** (`q5-paths.mjs`, `q5-paths2.mjs`, cenário D-01, EASY e LONG, nos dois commits):

| Caminho | `a4a434f` | `4b1622f` |
|---|---|---|
| Resposta da semana seguinte | `[345,575]`, nada retido | `[345,420]`, `REPORT_NOT_CARRIED` |
| `runCalibrationOf` exportado: como guardado; JSON + embaralhado; sem as linhas aposentadas; sem o fato do app; sem os dois; sem o registro de fatos | `[345,575]` em todos | `[345,420]` em todos, o mesmo hash `65ce4359…` da resposta |
| `restartProgram` do registro guardado (JSON, fatos embaralhados) | `PROPOSED`, `[345,575]`, nada retido | `PROPOSED`, `[345,420]`, `REPORT_NOT_CARRIED` |
| Fronteira desligada nas duas primeiras revisões, ligada na re-sincronização; e ligada só depois de tudo | `[345,575]` | retido; em vigor `app-x, dev-x, dev-x-v2` (relatos que o motor nomeia sem fato, leitura 3 do autor) |
| Revisão da fila anterior ao registro que traz a re-sincronização | `REVIEW_BEFORE_THE_RECORD`, calibração igual à do registro nu, nada retido; semana seguinte `[345,575]` | `REVIEW_BEFORE_THE_RECORD`, retida na própria resposta, calibração refeita sobre o admitido; semana seguinte `[345,420]` |
| `historicalStateOf` | `8aff5fd5…` (EASY), `bf8fa691…` (LONG) | igual nos dois commits |
| Histórico (`runHistory`): a corrida conta uma vez (`q5-history.mjs`, 5 cenários × 2 famílias) | 1 | 1; linhas aposentadas no registro (2 ou 3) |

**Ordem de chegada.** Não exijo independência da ordem, e ela não existe (o contrato, seção 3.8, diz o limite). O que conferi: nenhuma ordem que testei entrega uma linha que outra ordem retém. As três ordens de A1, A2, A3, B1, B2, B3 dão a mesma palavra; 08, 09 e 10 do autor dão palavras diferentes (`REPORT_NOT_CARRIED` / `DISTANCE_DISPUTED`) mas todas retêm.

## 3. Diferencial estrito (meu) e o classificador do autor

`q5-diff.mjs`: 25 clientes (12 cenários × 2 famílias, cada um com três semanas depois, e uma jornada de 12 semanas como prescrita), 134 revisões, `a4a434f` contra o candidato. Regras sem classificador de "consequência": a resposta do motor tem de ser igual sempre que a requisição ao motor (a revisão sem os registros da extensão) é igual; triagem, perguntas, ofertas e pausa contínua iguais em toda revisão; execução lida igual quando os relatos da sessão são iguais; nada retido passa a ser entregue; nenhum motivo muda.

| Medida | Resultado |
|---|---|
| Revisões com a mesma requisição ao motor | 128; resposta do motor diferente: **0** |
| Revisões com requisição diferente | 6 (todas depois de o longão seguinte ser entregue por tempo; o cliente relata por tempo) |
| Triagem, perguntas, ofertas, pausa contínua diferentes | **0, 0, 0, 0** |
| Retido antes e entregue agora; motivo mudado | **0; 0** |
| Recém-retidas | 68, todas `REPORT_NOT_CARRIED` |
| Referência de histórico | 16 para baixo (11 → 6,6; 16 → 9,6); 6 "para cima" (16 → 16,44), todas do longão da semana 2 relatado por tempo pelo cliente porque foi entregue por tempo: outra corrida, não a mesma lida mais alta |
| Dose planejada diferente com a mesma resposta do motor | 0 |
| Jornada de 12 semanas como prescrita | idêntica |

**O classificador `FOLLOWS` do autor** (`fix-forward/probes/differential.mjs`, linhas 100 a 118): depois da primeira retenção nova num cliente, toda diferença da resposta do motor, do estado da extensão (que inclui `warningSignScreen`, `asks`, `pausedContinuous`), da calibração e das linhas de formato passa a ser `FOLLOWS`, inclusive na mesma revisão em que a retenção apareceu, quando a entrada do motor ainda é a mesma. Ele esconderia uma mudança de triagem ou do motor num cliente "contaminado". Não encontrei nenhuma (tabela acima), mas a contagem "nenhuma diferença inesperada" do autor não a provaria. NOTE (E-04).

## 4. Suítes (formalmente)

| Execução | Onde | Resultado |
|---|---|---|
| Conjunta, `node --test` em `CoachingCore/` | worktree, `4b1622f` | **1443 entradas, 1442 passam, 1 falha**: `V1RC COACHINGCORE-V1-FREEZE-1 is preserved: every file it binds is byte-identical here` (`test/v1rc-calibration.test.mjs:325`), `actual: ['CoachingCore/src/r6-adaptation.mjs']` e nada mais. 127 s. **A suíte conjunta não é verde nesta linha.** |
| Extensão, `node --test "test/v1rws-*.test.mjs"` | worktree | **108 de 108** |
| `node scripts/v1rws-freeze.mjs --preserved` | worktree | exit 0: `COACHINGCORE-V1-FREEZE-1` 197/197 byte a byte, 1 emendado (`r6-adaptation.mjs`, base e diff autorizados, 22+/10−); `COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1` 30/30 |
| Teste histórico no seu snapshot | `scratchpad/snap-c8104c1` (conferi 273 arquivos de `src/`, `test/`, `v1/`, `scripts/` contra `git show c8104c1:`: 0 diferem) | `node --test test/v1rc-calibration.test.mjs`: **30 de 30**, o teste histórico passa. O arquivo do teste é byte a byte o mesmo nesta linha (`55b47329…`) |
| Testes e verificadores históricos | `git diff --name-status c8104c1 4b1622f` (repositório inteiro) | só `M CoachingCore/src/r6-adaptation.mjs`; todo o resto `A`. `git diff a4a434f 4b1622f`: só os três `src/` e os dois testes da extensão modificados |
| Motor e calibração congelados | blobs | `r6-provenance.mjs 6216cbfc…`, `v1-run-calibration.mjs 125079f6…`, `v1-run-index.mjs ba21c193…`, `v1-index.mjs 92d5a116…` iguais em `c8104c1`, `a4a434f` e `4b1622f`; `r6-adaptation.mjs 75d26d5a…` igual em `a4a434f` e `4b1622f`; `v1/RUN_FORMATS_V1.json 53dc6d76…` igual |

Nenhum teste ou verificador histórico foi editado. Depois de tudo, `git status` do worktree segue sem mudança rastreada.

## 5. Achados

| Id | Sev. | Evidência | O que fecha |
|---|---|---|---|
| **QRE-RWS-E-01** | **CONDITION** | **O motivo da linha inteira é mascarado numa linha sem distância.** `reportsReading` devolve um motivo só, com a precedência da leitura 6 do autor (os da própria linha, depois `REPORT_NOT_CARRIED`, depois `REPORTS_UNREADABLE`). Em `distanceFacts`, numa linha sem distância (`!has`), só `WHOLE_ROW_WITHHELD` retém (`v1-run-history.mjs`, `paceWithheld=!has?(WHOLE_ROW_WITHHELD.includes(told)?told:null):…`). Quando um relato da própria linha diz um motivo de distância (`SEVERAL_RECORDINGS`: lista outra gravação; `CORRECTED_MEASUREMENT`: declara com motivo de falha), esse motivo vence, é descartado por não haver distância, e o `REPORT_NOT_CARRIED` some. A linha vai à calibração inteira, sem a marca POOR. `q5-workpace.mjs` (o próprio fixture do teste "the whole row is withheld" do autor, só a correção variada): correção simples → `REPORT_NOT_CARRIED`, entregue POOR; a mesma correção **listando uma gravação** → leitura `SEVERAL_RECORDINGS`, retenção `[]`, entregue sem POOR com `work.paceSecondsPerKm 270`; **declarando falha** → `CORRECTED_MEASUREMENT`, `[]`, idem. Pelo ponto de entrada (`q5-workpace2.mjs`): as sessões de qualidade das semanas 3 a 6 relatadas pelo app com ritmo de trabalho de 255 s/km, a importação do relógio com `gpsQuality: POOR` (fundidas), e o atleta corrige o próprio relato. Semana 7: fundida sem correção, `THRESHOLD_CONTROLLED [300,335]`; correção simples, retida 4 vezes, **`[300,335]`**; correção que lista uma gravação, nada retido, **`[290,325]`** (hash `a7a23d20…` contra `c65ab1fd…`). Em `a4a434f` as duas correções dão `[290,325]`: **já existia**, e o candidato fecha metade. **Por que não é BLOCKING:** a regra autorizada (seção 3.3, regra 2: "entregue com a sua distância"; V4: "chega com distância"; tabela 3.5: "chega sem distância" para P1, Q8, S3) é sobre a distância, e essa está fechada; o que vaza aqui é o ritmo de trabalho de uma linha sem distância, coberto só pela leitura 1 do autor, que vai além do contrato; e pede uma combinação específica (sessão de qualidade, relógio POOR, correção do atleta que lista uma gravação ou declara falha). **Por que é CONDITION e não NOTE:** o Founder aceitou que a corrida cuja linha não representa todos os relatos em vigor saia da evidência de ritmo, a leitura 1 do autor afirma cobrir isto, e a faixa de limiar se move 10 s/km. Nenhum teste tem a combinação (a linha 285 do teste novo usa uma linha com distância; a 433 afirma `SEVERAL_RECORDINGS` sem distância → `null`, que é a peça do mascaramento). | Antes de integração ou de atleta real: numa linha sem distância, um motivo de linha inteira retém mesmo quando a linha tem um motivo de distância próprio (por exemplo, a leitura devolve os dois, ou a precedência se inverte só para `!has`), com teste da sessão de qualidade acima; ou o SSCTR e o Founder dizem expressamente que o ritmo de trabalho de uma linha sem distância fica fora da regra. |
| **QRE-RWS-E-02** | **CONDITION** | **Duas vozes lidas como um autor.** `q5-collapse.mjs`, EASY, nos dois commits: K1, um relato só com a medida do aparelho e o 2º arquivo que o atleta acrescentou, depois a re-sincronização que não o repete → **`[345,575]`**, em vigor só `one-x-v2` (o limite que o autor declara, reproduzido); K2, a re-sincronização repete a lista (I-4 cumprido) → `SEVERAL_RECORDINGS`, `[345,420]`; K5, o relato do app traz o `canonicalActivityId` da importação (vinculado) → os dois são `DEVICE:<hash>` e a re-sincronização substitui o do app → **`[345,575]`**; K4, a importação chega sem nenhum campo de origem (lida como o atleta) e se re-sincroniza igual → **`[345,575]`**; E3 de `q5-classes`, relato do app com `source: {provider: 'MANUAL', activityId}` → `DEVICE` (coerente com o motor, que lê `activityId` sem `quality` como `WEARABLE_FULL`), **`[345,575]`**. LONG: a mesma linha viva, histórico 9,6 sem retenção. O Core não distingue duas vozes num relato nem uma voz com a identidade da outra; o oráculo do contrato dá o mesmo. **Por que não é BLOCKING:** é o que o contrato autorizado atribui à integração (seção 8: I-1, I-2, I-4; e a I-8 nova do autor), e o motor congelado lê toda correção como reafirmação inteira, então só a integração fecha. **O que a integração precisa reconciliar:** o contrato de dados (`ATHLETE_DATA_FOUNDATION.md`, seção 2.2, linha "Sessão do plano feita") deixa uma observação com `source{provider, activityId}` levar também os campos RWS do atleta (`steps`, `declared`), que é a forma de K1; isso conflita com a I-2 ("uma edição do atleta nunca é enviada sob o id de uma atividade") e só é seguro com a I-4. | Antes de integração: o contrato de dados e o adaptador adotam I-1, I-2, I-4 e I-8 de forma verificável (um relato do atleta nunca leva id de atividade; uma importação sempre leva o seu id e a sua origem; uma re-sincronização repete tudo o que o seu autor disse), com teste de resultado de K1, K4 e K5 no adaptador. |
| QRE-RWS-E-03 | NOTE | **L4 por uma correção recusada.** `q5-classes` H2: a importação manda uma correção que o motor recusa (`INVALID_CORRECTION_CHAIN`); ela fica em vigor (contrato, 3.2) e fora da linha, e o seu valor para a corrida inteira (o 1º arquivo) baixa a referência: EASY 11 → 6,6, LONG 16 → 9,6, e o longão da semana 2 sai por tempo, na mesma dose (100 min). A matriz do contrato, linha 16, diz "histórico: o mesmo"; a L4 literal (o menor valor de um relato em vigor fora da linha) diz o que o runtime faz. Lado conservador. | SSCTR: confirmar L4 literal ou a linha 16 da matriz. |
| QRE-RWS-E-04 | NOTE | **O classificador `FOLLOWS` da diferencial do autor é largo demais** (seção 3). Na minha diferencial estrita não há diferença escondida. | Opcional: só classificar como consequência o que vem de uma requisição ao motor diferente. |
| QRE-RWS-E-05 | NOTE | **Leitura 7 (id longo ou ausente):** o relato do app com id de 140 caracteres, **sozinho**, sem importação nenhuma, fica retido para sempre (`q5-classes` G2: `REPORT_NOT_CARRIED`, em vigor o id cru e o `unidentified:…`). Lado conservador; um cliente conforme manda até 128. | Nenhum no Core; a custódia limita o id (Security). |
| QRE-RWS-E-06 | NOTE | **Volume** (`q5-cost.mjs`, leitor e admissão): 1.000 / 10.000 / 40.000 sessões honestas (3 fatos, 2 linhas cada) 121 / 1.104 / 2.933 ms; uma sessão com 1.000 / 4.000 / 16.000 linhas vivas 28 / 79 / 334 ms; 200 linhas que nomeiam 1.000 / 4.000 / 16.000 ids 38 / 129 / 585 ms. Linear; o teto de 64 corta o caminho hostil antes da caminhada (`bounded` falso → `missing` direto). Medido com dois outros juízes rodando na máquina. | Nenhum. |
| QRE-RWS-E-07 | NOTE | **Mutação, dois sobreviventes meus** (seção 7): J03 (a linhagem não passa das linhas que a própria correção aposentou) e J15 (um id visto duas vezes fica com o instante mais tarde). J03 é equivalente quando cada correção da cadeia tem fato e autor identificado (`q5-j03.mjs`: em vigor só `d3`, com e sem J03, num instante e em três), e só muda para o lado de reter quando uma correção do meio é de outro autor ou não tem fato. J15 só muda resultado quando o mesmo id de correção volta com outro conteúdo (o motor já marca `EVENT_ID_REUSED_WITH_DIFFERENT_FACTS`). | Opcional: um teste de cadeia de três correções de autores alternados numa revisão; um de id de correção reenviado com outro conteúdo. |

### Achados anteriores no meu campo

| Id | Estado | Evidência |
|---|---|---|
| **QRE-RWS-D-01** (BLOCKING na R4) | **CLOSED** | Seções 1 e 2. |
| QRE-RWS-B-01 (BLOCKING na R2; PARTIAL na R4 pelo D-01) | **CLOSED** quanto à distância | Fusão (R4) e correção cruzada (aqui) fechadas pelo ponto de entrada. O ritmo de trabalho de uma linha sem distância é a E-01. |
| QRE-RWS-D-02 (NOTE) | atualizado | Com a fronteira desligada e depois ligada, uma linha fundida antes da habilitação e re-sincronizada depois fica retida (relatos que o motor nomeia sem fato ficam em vigor). Um relato que o motor recusou com a fronteira desligada não deixou fato e não está em linha nenhuma: continua invisível. Não sondei esse caso. Decisão de habilitação, como antes. |
| QRE-RWS-D-03, D-04, D-05, C-04 (NOTE) | sem mudança | Não reexercitei. |

## 6. As oito leituras do autor (seção 3 do registro)

| # | Leitura | Meu juízo | Evidência |
|---|---|---|---|
| 1 | Retenção da linha inteira, também sem distância | **Aceita na direção; incompleta.** Fecha a correção simples (`q5-workpace`: `REPORT_NOT_CARRIED`, POOR) e a retração (H1). Mascarada pela precedência quando a própria linha tem um motivo de distância: E-01. A mudança aceita (com o registro ilegível, linhas sem distância em `paceEvidenceWithheld`) é só retenção. |
| 2 | Relato não gravado não é relato em vigor (`standing: false`) | **Aceita.** A resposta diz `notRecorded` e pede o reenvio; o motor não guarda o relato. `q5-standing.mjs` (rota clínica, relato do app com formato desconhecido mais a importação): o motor não guardou linha nenhuma da sessão; o fato da importação ficou em vigor sem linha (mais retenção); reenviado, a linha do app nasce e a importação segue em vigor. Nada vazou. A mutação J21 (a parada do relato não gravado deixa de ser guardada) morre por 3 testes. |
| 3 | Relato que o motor nomeia e não tem fato fica em vigor | **Aceita.** Fronteira desligada e depois ligada: retido (seção 2). A mutação J05 morre por 2 testes. Custo conservador, dito pelo autor. |
| 4 | Provedor nomeado sem id não é o atleta | **Aceita.** D3, K4: o efeito é só reter mais, ou é o caso de integração da E-02. |
| 5 | Teto de 64 por sessão | **Aceita.** Não é valor esportivo; acima dele tudo é retido (o teste do autor e o meu custo). J36 (teto 1) morre. |
| 6 | Precedência: os da linha, depois `REPORT_NOT_CARRIED`, depois `REPORTS_UNREADABLE` | **Aceita para linhas com distância** (o caso `late` não muda, e para elas qualquer motivo retém). **É a causa da E-01** em linhas sem distância. |
| 7 | Id longo ou ausente nomeado pelo conteúdo | **Aceita**, com a E-05 (retenção permanente do relato sozinho). |
| 8 | `formatsNotKept` inalcançável | **Aceita como caminho defensivo declarado.** Não o exercitei; a guarda de `appendFormats` é testada direto pelo autor. |

## 7. Mutação (minha)

Os mutantes são aplicados **em memória**, por um hook de carregamento de módulo (`mut/hooks.mjs`, `mut/register.mjs`, via `NODE_OPTIONS=--import`), sobre o código do worktree como está: nenhum arquivo é escrito no worktree nem numa cópia. Cada mutante confere que o texto aparece uma vez só, e o hook lança se não o aplica. Rodados os 108 testes da extensão no worktree (por isso `I10, V6` passa no controle). Um mutante morre só por teste que o controle passa.

- **Controle:** 108 passam, 0 falham. **Sanidade (S0, o módulo lança ao carregar):** morto, os 9 arquivos de teste falham. Isso prova que o hook chega aos processos filhos do `node --test`.
- **18 mutantes, 16 mortos, 2 sobrevivem** (J03, J15: E-07). Todos aplicados (o hook não lançou em nenhum).

| # | Mutação | Resultado (testes que matam; o primeiro) |
|---|---|---|
| J03 | a linhagem de uma correção não passa das linhas que ela mesma aposentou | **sobrevive** (equivalente com cadeia de um autor; só retém mais com cadeia mista: E-07) |
| J05 | relato que o motor nomeia sem fato não retém | morto, 2 (a regra do autor) |
| J06 | a admissão pula a linha viva sem distância (como antes) | morto, 5 (C-05, respostas) |
| J07 | a calibração exportada lê os fatos sem o registro do motor | morto, 2 (matriz) |
| J08 | toda resposta lê os fatos sem o registro do motor | morto, 4 (matriz) |
| J09 | relato que não diz nada de distância nem parada não deixa fato | morto, 5 (C-05) |
| J15 | id visto duas vezes fica com o instante mais tarde | **sobrevive** (E-07) |
| J16 | numa linha com distância, `REPORT_NOT_CARRIED` é descartado (o D-01 reaberto) | morto, 13 |
| J21 | a parada de um relato não gravado deixa de ser guardada | morto, 3 (C-05 reproduzido e fechado) |
| J26 | toda resposta lê o registro do motor sem as linhas aposentadas | morto, 4 (matriz) |
| J27 | fato com `standing: false` pode carregar distância | morto, 2 (selo e forma) |
| J29 | correção de autor não identificado substitui relatos não identificados | morto, 3 (matriz) |
| J32 | histórico e execuções recebem só a palavra, sem L3 e L4 | morto, 6 |
| J33 | linha de formato ilegível volta a ser pulada (SEC-RWS-D-01 revertido) | morto, 1 |
| J34 | o `canonicalActivityId` não entra no autor | morto, 1 (quem falou) |
| J35 | motivo de linha inteira nunca retém linha sem distância | morto, 6 |
| J36 | teto de 1 por sessão | morto, 18 |
| J37 | uma correção substitui relato do mesmo autor guardado em qualquer instante | morto, 4 (matriz) |

Cobertura fina: J33 e J34 morrem por um teste só, como o autor declara para os seus equivalentes.

**A mutação do autor.** Conferi o controle de `fix-forward/probes/mutation.mjs` (linhas 83 a 92): o controle roda antes, numa cópia sem mutação, e um mutante só morre por um teste que o controle passa; `out/mutation.json` registra o controle com 108 testes e só `I10, V6` falhando (o que a cópia mínima não roda). O desenho está certo agora. Não reexecutei os 53 mutantes dele; os meus 18 são outros (sobrepõem-se em 7 pontos: J06/I03, J07/I02, J08/I01, J27/M34, J32/I04, J33/M32, J35/H07), e morrem igual nesses.

## 8. Testes existentes com resultado esperado mudado

`git diff a4a434f 4b1622f -- test/v1rws-fix-forward.test.mjs test/v1rws-final-fix.test.mjs`. Nenhum teste foi removido.

| Mudança | Juízo |
|---|---|
| Os dois casos `whole` (retido `REPORT_NOT_CARRIED`; `paceEvidence` falso; caem as asserções de hash igual à calibração congelada) | Aceita pelo SSCTR. Não enfraquece: entram as bordas iguais às do controle, a conclusão por distância, `measuredKm` 11 e as três ordens (08, 09, 10) retidas com a mesma referência 6,6. |
| Fatos montados à mão e listas de chaves (8 → 11) | Forma. As listas continuam conferidas inteiras. |
| `reportFactOf` de relato que não diz nada; `said({segments: []})`, `said({declared: {}})`: `null` → fato que não diz nada | Consequência direta do contrato (todo relato deixa fato). Não enfraquece. |
| Fato sem parada e sem distância: ilegível → legível | Consequência direta. Saiu uma entrada da lista `BAD` e entraram oito (autor em texto livre, de outra forma, ausente, `standing` não booleano, `standing: false` com distância, `wholeKm` 0 e 1e9). Mais forte no total. |
| Veredito à mão com `r3` da mesma sessão fora da linha: `null` → `REPORT_NOT_CARRIED` | Consequência de L1/L2: sem o registro do motor, nada é substituído e `r3` está em vigor. Correto. |
| Respostas que entregam sessão: "dois relatos que se contradizem" e "correção fora da janela" retêm também a sessão do relato recusado, e as linhas acrescentadas são conferidas por id (`lineage.reports`) | Consequência de L2. Mais forte: antes só se conferia que eram formatos. |
| `PACE_WITHHELD` 5 → 6 | Palavra nova; lista fechada conferida inteira. |

Nenhuma é achado disfarçado de ajuste de expectativa. Uma observação: `reportFactOf(…, {fromDevice: true})` sem campos de origem dá `speaker: 'ATHLETE'` (fix-forward, linha 228). Pelo ponto de entrada isso não acontece (`fromDevice` só é verdadeiro com `activityId` ou `quality` de aparelho, e então o autor é `DEVICE:` ou `DEVICE_UNIDENTIFIED`), mas a K4 da E-02 é o mesmo caso visto pelo lado da integração.

## 9. O que rodei e onde

- Scratch: `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/1b05889e-fc1c-402a-93ef-5134acd2c65e/scratchpad/judges/qre/r5-1794748569/`. Sondas: `lib.mjs`, `q5-classes.mjs`, `cmp.mjs`, `q5-h4.mjs`, `q5-workpace.mjs`, `q5-workpace2.mjs`, `q5-corediff.mjs`, `q5-paths.mjs`, `q5-paths2.mjs`, `q5-diff.mjs`, `q5-cost.mjs`, `q5-collapse.mjs`, `q5-standing.mjs`, `q5-history.mjs`, `q5-j03.mjs`; mutação em `mut/` (`hooks.mjs`, `register.mjs`, `run.mjs`). Saídas em `out/` (`*.a4a434f.json` e `*.4b1622f.json` de cada sonda; `joint-suite.tap`, `ext-suite.tap`, `hist-v1rc-c8104c1.tap`, `v1rws-preserved.txt`, `mutation-r5.json`, `mutation-r5.log`, `tests.diff`, `judge-probes.sha256`). Nada apagado, nada sobrescrito fora desse diretório.
- No worktree, só leitura e as execuções permitidas: `node --test` (inteira, uma vez), `node --test "test/v1rws-*.test.mjs"` (uma vez direto; uma vez como controle pelo hook, sem mutante; e 19 vezes sob mutantes em memória, S0 incluído), `node scripts/v1rws-freeze.mjs --preserved`. Sondas importam o código do worktree por URL, sem escrever nele. Nenhum comando git de escrita. Não rodei `npm run verify`, nenhum `verify-r*`, nem `v1rc-journeys` ou `v1rc-fuzz`.
- No snapshot `snap-c8104c1`: `node --test test/v1rc-calibration.test.mjs`. Na cópia `before-a4a434f`: só sondas (leitura).
- As sondas do autor não foram usadas como evidência, salvo as três do meu papel, sem mudança.

## 10. O que não verifiquei

- A prova pelo motor numa jornada inteira até a semana da prova: usei a sonda `q4-corr-race` (linhas como o motor as guarda) e o teste do autor, que passa na suíte; não escrevi a minha jornada de prova. Meia e maratona, não.
- Se a E-01 move uma faixa por `CORRECTED_MEASUREMENT` pelo ponto de entrada: mostrei o mascaramento em unidade e a faixa movida só pela variante que lista uma gravação.
- Um relato recusado pelo motor com a fronteira desligada (D-02).
- A suíte inteira sob cada mutante (rodei os 108 da extensão); os 53 mutantes do autor.
- Valores e leituras esportivas (L1 a L5, a E-03) e a segurança da custódia (selo sem chave, fato apagado): de outros donos.
- Com que frequência uma correção cruzada acontece com atletas reais (L1-f), e o comportamento real do HealthKit na re-sincronização.

## Contexto injetado pelo host

O host injetou no meu contexto o CLAUDE.md global, o CLAUDE.md do projeto e o MEMORY.md, que resumem rodadas anteriores e nomes de achados. Nada disso foi usado como evidência.

| Arquivo | sha256 |
|---|---|
| CLAUDE.md global (`C:/Users/carva/.claude/CLAUDE.md`) | `c75718d0d2fe2cce1332cf7240ef0b8013ca2901d52b4d6778480c1c333709c6` |
| CLAUDE.md do projeto (`C:/Users/carva/Desktop/myApp/MyApp/CLAUDE.md`) | `e657d059e06fd1a21613250753a8c79ac605b69d955191d634966b3c8fc922e6` |
| MEMORY.md (`C:/Users/carva/.claude/projects/C--Users-carva-Desktop-myApp-MyApp/memory/MEMORY.md`) | `407dd7b73228e9b19d25a64bcf8349d6ab3057ef381b25883c137bc814004e09` |
