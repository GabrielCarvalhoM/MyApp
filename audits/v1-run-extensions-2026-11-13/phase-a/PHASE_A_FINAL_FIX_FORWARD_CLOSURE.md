# V1 Run Extensions — Fase A: encerramento do fix-forward final (2026-11-14)

**Estado final: `BLOCKED`.** Não é `APPROVED_SYNTHETIC_CANDIDATE`.

- A missão do Founder de 2026-11-14 permitia uma correção delimitada e uma revisão independente. As duas foram feitas. A revisão em `5289667` fechou os dois bloqueios da rodada anterior e achou um bloqueio novo. Pela regra da missão a fase fecha com ele demonstrado, sem nova correção.
- **Não existe** freeze `COACHINGCORE-V1-RUN-FORMAT-FREEZE-1` (V1RWS-1).
- **Não existe** registro habilitador. O SSCTR não foi chamado de volta para emiti-lo, porque o Quality não liberou. `V1X-RUN-NATIVE` continua desligado por padrão: toda sessão sai na expressão por tempo, o comportamento congelado.
- A fase B não foi iniciada. Nada foi enviado (push) nem mesclado.

## 1. Vereditos (como recebidos, em `reviews/`)

| Juiz | Veredito | Arquivo |
|---|---|---|
| Quality & Reliability | **`NOT_READY`**, 1 BLOCKING | `qre/QRE_V1RWS_FINAL_R4.md` e `.json` |
| Security (focal) | `PASS_WITH_CONDITIONS`, nenhum BLOCKING | `security/SEC_V1RWS_FOCAL_R3.md` |
| SSCTR | `ACCEPT_WITH_CONDITIONS`, nenhum BLOCKING; emitiria o registro depois dos outros dois vereditos | `ssctr/SSCTR_V1RWS_FINAL_R4.md` e `.json` |

Os três reproduziram C-01 e C-05 em `9aed5e2` antes de julgar o candidato.

## 2. O bloqueio

**QRE-RWS-D-01: correção de uma parte de uma linha fundida.**

O relato do app e a importação da mesma corrida viram uma linha. Depois a importação se re-sincroniza como correção da própria parte (`correctionOf`). O motor congelado aposenta a linha fundida inteira e a linha viva passa a ser só a correção. O leitor de fatos lê só os relatos da linha viva (`sourcesOf`), então o que o relato do app disse deixa de ser lido: que havia um segundo arquivo, ou uma distância que disputa a da importação.

| Caso (sondas do juiz) | Linha fundida | Depois da correção da importação |
|---|---|---|
| Corrida leve em dois arquivos, correção com esforço (`rpe`) | `SEVERAL_RECORDINGS`, EASY `[345,420]` | linha `dev-x-v2` sozinha, 6,6 km em 63 min, nada retido, EASY **`[345,575]`** |
| A mesma, correção sem esforço | idem | a faixa não muda (a P1 não lê sem esforço), mas o histórico lê 6,6 km sem retenção |
| Distância disputada (app mediu 11 km, importação 6,6 km) | `DISTANCE_DISPUTED`, `[345,420]` | **`[345,575]`**, nada retido |
| Importação sem duração | `DURATION_REQUIRED`, `[345,420]` | **`[345,575]`**, nada retido |
| Prova em dois arquivos | nenhum resultado lido | **6 km em 3000 s lido como resultado de prova**, sem precisar de esforço |

Já era assim em `9aed5e2`: não é regressão deste ciclo, é o B-01 por mais um caminho. O autor reproduziu os casos depois do veredito, com as sondas do juiz sem mudança (`q4-corr.mjs`, `q4-corr-disputed.mjs`, `q4-corr-race.mjs`).

- **Por que bloqueia (palavras do juiz):** é cliente conforme; a missão pede exatamente a correção de parte de uma linha fundida e que nenhum caminho use distância parcial para recalibrar ritmo; o critério do B-01 é que a linha não chegue à V1RC como evidência de ritmo, e aqui chega.
- **O que atenua (do juiz):** pede a mesma premissa do C-01 (a importação do primeiro arquivo com os minutos inteiros) e, na corrida leve, um esforço na correção. O caso da prova foi mostrado na calibração com linhas montadas como o motor as guarda, não por uma jornada inteira até a semana da prova.
- **O que fecha (do juiz):** ler os fatos de todo relato da cadeia de correção de uma linha viva (as fontes das linhas que ela aposenta, por `correctionOf` e `supersededBy`), com teste da re-sincronização da importação numa corrida leve, num longão e numa prova, nas três ordens.

## 3. O que fechou (evidência executada pelos juízes em `5289667`)

- **QRE-RWS-C-01: fechado.** Matriz do Quality: versão por tempo e nativa × 9 formas da lista da importação × 4 ordens, 72 casos. Em `9aed5e2`, 20 de 72 dão EASY `[345,575]`; no candidato, 0 de 72, todos retidos como `SEVERAL_RECORDINGS`. Vale com três relatos, duplicata, ida e volta por JSON, releitura na semana 6, restart, `runCalibrationOf` exportado e registro sem os fatos. Os controles não mudaram (um arquivo: `[345,420]`; um relato de 6,6 km: `[345,575]`): fecha lendo os fatos, não desligando uma leitura.
- **QRE-RWS-C-05: fechado.** 14 tipos de resposta × 2 registros. Toda calibração devolvida é a do oráculo do juiz ou nenhuma; a triagem que o registro pede é nomeada nas 14; nenhuma resposta sem sessão prescreve ou grava; as 28 voltam iguais depois de ida e volta por JSON. Nenhum `return` do ponto de entrada devolve a calibração crua com a fronteira ligada.
- **Condições da rodada anterior no Quality:** C-02 (parte de runtime), C-06, C-07 e C-03 fechadas (K14, K32 e K29 morrem cada um por um teste). C-04 segue nota.
- **Security:** SEC-RWS-C-01 (no campo dela), C-02 (30.000 linhas em 1,39 s), C-05 e C-07 fechadas no Core. C-06 parcial (ver seção 4). A-02, A-03 e A-05 se mantêm.
- **SSCTR:** as oito leituras do autor aceitas (a 4 com condição). C-07 fechada. Diferencial contra `644cd8e`: 15.984 seleções, 0 diferenças; 725.760 leituras de execução, nenhuma ganhando crédito, evidência de ritmo ou histórico maior fora dos caminhos de fusão pedidos; 270 revisões por jornada, 0 diferenças nas cinco formas comuns de relato. Sinal de segurança mantido em conflito, quarentena, correção, duplicata, JSON e restart; nenhuma nativa sob hold, rota clínica, triagem pedida, ASK de elegibilidade ou registro ilegível.
- **A leitura que mudava um resultado aceito (revisão anterior ao registro grava os fatos dos relatos):** o Quality diz que é coerente com o QRE-RWS-A-05 e não o reabre; SSCTR e Security aceitam.
- **Motor congelado e testes históricos (Quality, formal):** a única falha da execução conjunta (1423 entradas, 1422 passam) é `V1RC COACHINGCORE-V1-FREEZE-1 is preserved`, acusando só `CoachingCore/src/r6-adaptation.mjs`. No snapshot dela, `c8104c1`, a verificação histórica passa (30 de 30; `--check` 198 de 198). Testes da extensão: 88 de 88. `--preserved`: exit 0. Arquivos congelados byte a byte; nenhum teste de `c8104c1` editado. A suíte não é anunciada como verde.

## 4. Condições abertas, não bloqueantes

| Id | O quê |
|---|---|
| SEC-RWS-D-01 | Um fato cujo campo `fact` é trocado para `RUN_FORMAT_EMITTED` some em silêncio: só aparece em `unreadableFormats`, a triagem deixa de ser pedida e as nativas voltam. Fecha pondo toda linha que não é formato legível nem fato legível sob `RUN_REPORT_UNREADABLE`. Não dá poder além de apagar a linha. |
| SEC-RWS-D-02, SSCTR-RWS-D-02 | **Integração.** O estado de linha ilegível é permanente: a triagem respondida não o limpa, só restaurar o registro. Colide com apagamento e redação (SEC-RWS-C-04), com registros de clientes antigos e com um app que mostraria uma triagem que nunca sai. Pede um caminho de reparo auditado na custódia e que o app o mostre como retenção de dados, não como triagem pendente. |
| SSCTR-RWS-D-01 | Com `segments: []` na importação, a lista do app agora soma à distância da importação. Se as duas fontes mediram a corrida inteira, a referência de histórico sobe de 16 para 22 km e o teto CT-3 de 18,08 para 24,2. Dose, próximo longão e evidência de ritmo não mudam; o mesmo já acontecia sem a chave. Fecha no contrato de dados (uma gravação por relato, deduplicada por id de atividade; é a B-03). |
| SSCTR-RWS-C-01, SEC-RWS-D-04 | Parcial: fato alterado, lixo ou de outro atleta falha fechado; fato removido ou ressignado ainda some. Só a cadeia com chave da custódia fecha. |
| SSCTR-RWS-C-02 | Parcial: fechada na mesma revisão; uma triagem com data futura carregada para a revisão seguinte libera a parada lá. Fecha com a custódia carimbando o instante da triagem. |
| QRE-RWS-D-02 | Nota: com a fronteira desligada, a entrada do C-01 dá o `[345,575]` congelado; registros feitos antes de ligar ficam assim. |
| QRE-RWS-D-03 | Nota: tirar campos vazios muda a observação que o motor guarda; o mesmo relato reenviado na passagem de desligada para ligada é marcado como conflito. |
| QRE-RWS-D-04, SEC-RWS-D-05 | Notas de custo: leitura dos fatos linear, cerca de 6 s para 100 mil linhas; o motor congelado é quadrático em muitas linhas da mesma sessão, com a extensão ligada ou não. |
| QRE-RWS-D-05 | Nota: o caminho defensivo `ok: false` não tem teste (dois mutantes do juiz sobrevivem) e não foi alcançado por entrada nenhuma. |
| SEC-RWS-D-03, SSCTR-RWS-D-03 a D-05 | Notas: texto do cliente ecoado nas respostas; `segments` igual a `{}` ou `0` lê diferente num relato novo e numa linha feita fora; parada de revisão da fila guardada sob o instante dela. |
| Seguem abertas | SSCTR-RWS-C-03, C-04, C-08 (trava a integração do ponto de entrada composto), A-04, B-03; QRE-RWS-A-07, C-04; SEC-RWS-C-03, C-04 (cresce um pouco: os fatos guardam também `ownKm`, `several` e `corrected`). |

Integração, registrada e não construída: custódia com chave e gravação atômica dos registros; reconciliação do app e do HealthKit em requisições separadas; apagamento e retenção dos dados derivados de saúde; base legal e decisões de privacidade (G07). A Security confirmou que o registro do autor as declara abertas e que nada no candidato as substitui.

## 5. Correções ao registro do autor (`PHASE_A_FINAL_FIX_FORWARD.md`)

O registro fica como foi julgado. Três pontos dele não se sustentaram:

1. **A correção de parte de uma linha fundida não foi declarada nem testada.** O autor considerou a re-sincronização da importação, leu-a como o relato da própria importação e seguiu. Não a listou entre os limites da seção 4, não a testou com esforço na correção nem numa prova, e os testes cobrem só correções do próprio app. A "exploração adversarial" da seção 8 não incluía esse caminho.
2. **"Nenhum caminho entrega distância parcial a leitor de ritmo"** (seção 8): não procede. QRE-RWS-D-01 é um caminho que entrega.
3. **Mutação:** os dois caminhos defensivos declarados sem teste têm mutantes que sobrevivem na mutação do juiz (QRE-RWS-D-05).

## 6. Commits deste ciclo (linha `claude/v1-run-extensions`)

| Commit | O quê |
|---|---|
| `5289667` | Candidato do fix-forward final; é o commit julgado |
| (este) | Pareceres como recebidos e este encerramento |

Valores: `CoachingCore/v1/RUN_FORMATS_V1.json`, sha256 `26c6e3fbfeee864376643c485d64a616f1cf13ea49d82b2cc223c02d7a06353c`, sem mudança.

## 7. Próximo passo (não iniciado)

Decisão do Founder. O que os pareceres apontam:

1. **QRE-RWS-D-01:** os fatos de relato lidos pela cadeia de correção da linha viva. Observação do autor, não de juiz: o teste já aceito "a linha fundida corrigida para uma medida inteira volta a ser evidência" depende de a correção do relato do app apagar o que esse mesmo relato disse; a regra nova precisa distinguir a correção do relato que disse o fato da correção de outro relato.
2. No mesmo passo, se o Founder quiser, o que é barato e de runtime: SEC-RWS-D-01.
3. Reverificação pelo Quality, com confirmação curta de SSCTR e Security no que tocar.

Só depois: registro habilitador (pelo SSCTR, com as condições que ele já escreveu), freeze e fase B.

O freeze foi ensaiado pelo autor num clone de rascunho com um registro habilitador de teste que só existe lá (`--write` e `--check` passam). Isso não é freeze e não vale como aprovação.

Item de fila humana proposto pelo SSCTR, **não anexado**: HQ-V1RWS-A-SSCTR-R4-EMPTY-FIELD-MERGE. Seguem não anexados os três da rodada anterior.

`CURRENT_MISSION.md` e `MISSION_LEDGER.md` não foram alterados neste ciclo.
