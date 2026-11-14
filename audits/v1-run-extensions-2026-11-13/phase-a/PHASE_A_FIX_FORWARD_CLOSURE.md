# V1 Run Extensions — Fase A: encerramento do fix-forward (2026-11-14)

**Estado final: `BLOCKED`.** Não é `APPROVED_SYNTHETIC_CANDIDATE`.

- O fix-forward autorizado pelo Founder em 2026-11-14 permitia uma correção e uma revisão independente. As duas foram feitas. A revisão em `644cd8e` achou dois bloqueios; pela regra da missão a fase fecha com eles nomeados, sem nova correção.
- **Não existe** freeze `COACHINGCORE-V1-RUN-FORMAT-FREEZE-1`.
- **Não existe** registro habilitador. `V1X-RUN-NATIVE` continua desligado por padrão: toda sessão sai na expressão por tempo, o comportamento congelado.
- A fase B não foi iniciada. Nada foi enviado (push) nem mesclado.

## 1. Vereditos (como recebidos, em `reviews/`)

| Juiz | Veredito | Arquivo |
|---|---|---|
| Quality & Reliability | **`NOT_READY`**, 2 BLOCKING | `qre/QRE_V1RWS_FIXFORWARD_R3.md` |
| SSCTR | `ACCEPT_WITH_CONDITIONS`, nenhum BLOCKING; emitiria o registro depois dos outros dois vereditos | `ssctr/SSCTR_V1RWS_FIXFORWARD_R3.md` |
| Security (focal) | `PASS_WITH_CONDITIONS` | `security/SEC_V1RWS_FOCAL_R2.md` |

O SSCTR não foi chamado de volta para o registro, porque o QRE não liberou.

## 2. Os dois bloqueios

Os dois são do critério de fechamento do QRE-RWS-B-01, que fica **parcial**: o caso do juiz e todas as variantes que ele e o autor testaram fecham; estes dois caminhos não.

| Id | O que acontece | O que fecha (palavras do juiz) |
|---|---|---|
| **QRE-RWS-C-01** | Quando um dos relatos fundidos traz a lista de arquivos vazia (`segments: []`), a fusão do motor mantém a lista vazia e apaga a do app. O relato do app também não deixa fato, porque o fato de relato só guarda parada e distância medida. A V1RC volta a ler 6,6 km sobre 63 min: EASY `[345,575]`, nas três ordens, e também no restart e no `runCalibrationOf` exportado. Só a versão por tempo. Já existia em `a8e9b05`: é o B-01 por outra fusão, não regressão. O autor reproduziu depois do veredito. | Guardar também, como fato de cada relato recebido, que ele lista mais de um arquivo, e retê-lo como `SEVERAL_RECORDINGS`; teste nas três ordens e com dois relatos do app. |
| **QRE-RWS-C-05** (é o SEC-RWS-C-01) | Uma revisão que estava na fila chega depois de um ASK de formato desconhecido com parada. O ASK guardou o fato da parada sob o instante dele, então a revisão da fila fica "anterior ao registro". A resposta (`REVIEW_BEFORE_THE_RECORD`) devolve a calibração feita sobre o registro não admitido, EASY `[345,575]`, e não nomeia a triagem que o registro exige. **É regressão deste ciclo**: em `a8e9b05` a mesma sequência dava `ACTIVE` e `[345,420]`. Atenuantes do juiz: a resposta não entrega sessões e nada é gravado; sob o relógio do servidor da custódia o caminho pediria o relógio regredir. | Toda resposta inerte sobre uma decisão aceita pelo motor (`REVIEW_BEFORE_THE_RECORD`, `FORMAT_ERROR`, `REVIEW_TIME_REQUIRED`) leva a calibração refeita sobre o registro admitido, ou nenhuma, e nomeia a triagem que o registro exige; teste com o ASK seguido de revisão anterior. |

Os dois têm a mesma lição: a proteção saiu de uma marca gravada e foi para uma leitura, e a leitura tem de cobrir **todo** fato que a fusão pode apagar e **toda** resposta que devolve a calibração, não só o caminho principal.

## 3. O que fechou (evidência executada pelos juízes em `644cd8e`)

- **SSCTR-RWS-B-01: fechado.** Em `a8e9b05`, 6 de 6 casos sem triagem e com 1 a 4 sessões nativas; no candidato, 18 de 18 com triagem `REQUIRED` e 0 nativas. Vale com três relatos em 6 ordens, correções, duplicatas, registro por JSON e restart. O sinal fica separado da evidência: sem crédito, sem contagem de pausa, sem histórico, sem dimensionamento. Nenhuma classificação clínica nova.
- **SSCTR-RWS-B-02: fechado** como decidido. **QRE-RWS-B-02, B-03, B-04 e B-05: fechados** (M04, M08a e M18 morrem cada um pelo teste que leva o seu nome; o `--write` recusa sem registro habilitador).
- **As cinco leituras da seção 4 do registro do autor: aceitas pelo SSCTR** (tolerância 0,91; prova em vários arquivos; fusão lida como um relato só; sinal monótono; parada em relato de formato desconhecido).
- **Nada mais mudou** (SSCTR, diferencial contra `d6381bb`): 758.160 seleções, 0 diferenças; no leitor de execução só diferem corridas sem duração e disputas, nenhuma ganhando crédito, evidência de ritmo ou histórico; 135 revisões pelo ponto de entrada, 0 diferenças.
- **Motor congelado** (QRE): os três arquivos da V1RC iguais a `c8104c1`, `r6-adaptation.mjs` igual a `d6381bb`; identidade de saída 194/194 e 82/82; nenhuma linha guardada reescrita.
- **Testes históricos** (decisão de governança do Founder): o QRE **confirma formalmente** que a única falha da execução conjunta é o teste histórico `V1RC COACHINGCORE-V1-FREEZE-1 is preserved`, acusando só `src/r6-adaptation.mjs`. Três resultados, separados: verificação histórica no seu snapshot `c8104c1`, 30 de 30 e `--check` 198/198 e 30/30; suíte da extensão, 74 de 74; execução conjunta, 1408 de 1409. Nenhum teste de `c8104c1` foi editado. A suíte não é anunciada como verde.

## 4. Condições abertas, não bloqueantes

| Id | O quê |
|---|---|
| QRE-RWS-C-02, SEC-RWS-C-06, SSCTR-RWS-C-01 | Um fato de parada ilegível, alterado ou apagado perde o sinal em silêncio (só é listado), e as nativas voltam; um formato perdido vai a HOLD. Deve falhar fechado. |
| QRE-RWS-C-06, SEC-RWS-C-02 | `sourcesOf` não deduplica ids repetidos: custo quadrático com registro hostil (10,1 MB em 23,4 s). |
| SEC-RWS-C-05, QRE-RWS-C-07 | A linha de fato aceita chaves a mais no topo e dentro de `stop`; `recordedAt` fica fora do hash (recuado, deixa uma triagem antiga limpar a parada). |
| SSCTR-RWS-C-02, SEC-RWS-C-07 | Uma triagem com instante posterior ao da própria revisão limpa a parada na hora. Já existia. |
| SSCTR-RWS-C-03 | Sob ASK de elegibilidade, `prescribing` é falso mas cada sessão diz `prescribed: true`. Product: não oferecer como treino a fazer. |
| SSCTR-RWS-C-04 | Parada por sintoma numa corrida fora do plano não é lida. Já existia; fora do contrato de dados de hoje. |
| SSCTR-RWS-C-08, SEC-RWS-C-03 | **Integração, anterior a este ciclo:** a custódia falha fechada quando o relato do app e a importação da mesma corrida chegam em duas requisições (`a stored row changed`), e não guarda o `runFormatRecord`. Com a importação primeiro, a parada não fica em lugar nenhum. O SSCTR faz disto condição do registro habilitador para integrar. |
| SEC-RWS-C-04 | Os fatos de relato são um registro novo de dado derivado de saúde (o motivo da parada sobrevive a correção e recusa): inventário, apagamento, egress, e a base legal com o Founder (G07). |
| Notas | QRE-RWS-C-03 (mutantes K14 e K32 sem teste), C-04 (um teste ficou circular); SSCTR-RWS-C-05 (arquivo listado duas vezes conta duas), C-06. Seguem abertas as da fase A: SSCTR-RWS-A-04, B-03, QRE-RWS-A-07, Security A-01, A-04, A-06 a A-08. |

## 5. Correções ao registro do autor (`PHASE_A_FIX_FORWARD.md`)

O registro fica como foi julgado. Três afirmações dele não se sustentaram:

1. **"Sem registro novo"** (seção 4, item 6): não procede. É um tipo e um local de registro novos, com dado derivado de saúde (SEC-RWS-C-04).
2. **"Cinco campos fechados, sem texto livre"**: vale para o `report`, não para a linha nem para `stop` (SEC-RWS-C-05).
3. **Mutantes "equivalentes"**: o do `hold` continua declarado equivalente; o QRE achou outro, que o autor não rodou, e que não é equivalente (a calibração refeita sem o registro de evidência não é pega por teste nenhum).

## 6. Commits deste ciclo (linha `claude/v1-run-extensions`)

| Commit | O quê |
|---|---|
| `8dc849c` | Candidato do fix-forward |
| `644cd8e` | Endurecimento depois da mutação do autor; é o commit julgado |
| (este) | Pareceres como recebidos e este encerramento |

Valores: `CoachingCore/v1/RUN_FORMATS_V1.json`, sha256 `26c6e3fbfeee864376643c485d64a616f1cf13ea49d82b2cc223c02d7a06353c`, sem mudança.

## 7. Próximo passo (não iniciado)

Decisão do Founder. O caminho que os pareceres apontam é um novo fix-forward, estreito, com reverificação pelo QRE (e confirmação curta de SSCTR e Security no que tocar o sinal e os fatos):

1. QRE-RWS-C-01: o fato de cada relato passa a guardar que ele lista mais de um arquivo.
2. QRE-RWS-C-05: toda resposta que devolve a calibração a devolve sobre o registro admitido, ou não a devolve, e nomeia a triagem que o registro exige.
3. Das condições da seção 4, as que tocam o runtime e são baratas no mesmo passo: fato de parada ilegível falha fechado; `sourcesOf` deduplicado e limitado; chaves exatas na linha de fato.

Só depois: registro habilitador (pelo SSCTR, que já disse as condições), freeze e fase B.

Itens de fila humana propostos pelos juízes, **não anexados** (fila em 235): HQ-V1RWS-A-SSCTR-F1-MIXED-ORDER, HQ-V1RWS-A-SSCTR-R2-ELIGIBILITY-ASK, HQ-V1RWS-A-SSCTR-R3-SYMPTOM-SIGNAL.

`CURRENT_MISSION.md` e `MISSION_LEDGER.md` não foram alterados neste ciclo.
