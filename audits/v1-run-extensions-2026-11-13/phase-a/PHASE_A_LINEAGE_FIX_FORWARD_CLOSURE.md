# V1 Run Extensions — Fase A: encerramento do fix-forward da linhagem de evidências (2026-11-15)

**Estado final: `APPROVED_SYNTHETIC_CANDIDATE`, com condições.**

- Os três juízes liberaram o candidato `4b1622f`, com condições e sem bloqueio. A missão permitia uma revisão; ela foi feita, e não houve correção depois dela.
- O registro habilitador de `V1X-RUN-NATIVE` foi emitido pelo SSCTR, não pelo autor. Com ele a fronteira passa a ligada por padrão nesta linha.
- O freeze aditivo `COACHINGCORE-V1-RUN-FORMAT-FREEZE-1` (V1RWS-1) é escrito a partir do commit que contém este arquivo. O registro do freeze, com hashes e o resultado de `--check`, fica em `audits/v1-run-extensions-2026-11-13/PHASE_A_FREEZE_V1RWS_1.md`, fora de `phase-a/`, porque o freeze amarra todo arquivo desta pasta.
- **Isto é um candidato sintético aprovado.** Não autoriza atleta real, integração nem produção. A fase B (Race Forecast + Pace Insights) não foi iniciada. Nada foi enviado (push) nem mesclado.

## 1. Vereditos (como recebidos, em `reviews/`)

| Juiz | Veredito | Arquivo |
|---|---|---|
| Quality & Reliability | `READY_WITH_CONDITIONS`, nenhum BLOCKING. **QRE-RWS-D-01: CLOSED** | `qre/QRE_V1RWS_LINEAGE_R5.md` e `.json` |
| Security (focal) | `PASS_WITH_CONDITIONS`, nenhum BLOCKING. **SEC-RWS-D-01: CLOSED no Core** | `security/SEC_V1RWS_FOCAL_R4.md` |
| SSCTR | `ACCEPT_WITH_CONDITIONS`, nenhum BLOCKING | `ssctr/SSCTR_V1RWS_LINEAGE_R5.md` e `.json`; adendo `ssctr/SSCTR_V1RWS_LINEAGE_R5_ADDENDUM.md` |

Os três reproduziram as falhas anteriores no código de `a4a434f` antes de julgar, com as sondas sem mudança, e conferiram por conta própria que a cópia usada era a de `a4a434f`.

**Registro habilitador:** `reviews/ssctr/SSCTR_V1RWS_RUN_RECORDS.json`, sha256 `a5b915c66f942e17e5e3eb39ef187921e4e65684866c7687af4f6997d44cbf02`.

- `APPROVE_WITH_CONDITIONS`, `SUPPORTED_WITH_LIMITS`, revisão `SSCTR-V1RWS-LINEAGE-R5`.
- Amarrado aos bytes dos valores (`26c6e3fb…353c`) e ao runtime de `4b1622f`, arquivo por arquivo. Uma mudança em qualquer deles pede nova revisão.
- 14 condições. A primeira: só dados sintéticos.
- Emitido só depois de o SSCTR ler os pareceres de Quality e Security.

## 2. O que fechou (evidência executada pelos juízes em `4b1622f`)

- **QRE-RWS-D-01: fechado, como classe.**
  - As três sondas do Quality, sem mudança: em `a4a434f` a faixa leve vai a `[345,575]` e a prova de 6 km em 3000 s é lida; no candidato a linha é retida (`REPORT_NOT_CARRIED`), a faixa fica em `[345,420]` e nenhuma prova é lida.
  - Sondas próprias do Quality nos dois commits: 84 cenários, corrida leve e longão, três ordens; restart; calibração exportada com JSON, registros embaralhados, linhas e fatos perdidos; revisão da fila anterior ao registro; fronteira desligada e depois ligada.
  - Diferencial estrita do Quality, sem o classificador do autor: 134 revisões; com a mesma entrada o motor respondeu igual em 128 de 128; triagem, perguntas, ofertas e pausa não mudaram em nenhuma. Nada que era retido passou a ser entregue, e nenhum motivo mudou.
- **SEC-RWS-D-01: fechado no Core.** O fato reetiquetado como formato passa de triagem não pedida e 8 nativas para `RUN_REPORT_UNREADABLE`, 0 nativas, 12 corridas retidas; a triagem respondida depois não limpa. Dado inválido continua distinto de dado ausente. 1259 revisões aleatórias legítimas em cinco planos, sem linha ilegível nem formato não guardado.
- **L1 a L4 implementados como decididos** (SSCTR): cada condição conferida com execução dele. A matriz bate com o oráculo; nenhuma violação de L1-a. A grade `m2`: referência de 22 para 16 km, teto de 24,2 para 18,084, o longão seguinte em 16 km e 100 min. A dose é idêntica nas 912 sessões de 36 cenários; só a expressão muda.
- **Segurança preservada** (SSCTR e Security): a triagem é pedida do mesmo jeito; nenhuma sessão nativa sob triagem pedida; o sinal de sintoma não se perde em nenhuma variante.
- **Custo** (Quality e Security): linear. 40.000 sessões em 2,9 s; 50.000 em 2,3 s; o teto de 64 por sessão corta os casos hostis.
- **Suítes, formalmente** (Quality): conjunta 1443 entradas, 1442 passam, 1 falha, o teste histórico `V1RC COACHINGCORE-V1-FREEZE-1 is preserved…`, que acusa só `r6-adaptation.mjs`. Extensão 108 de 108. `--preserved` exit 0. O teste histórico passa 30 de 30 no seu snapshot `c8104c1`. Nenhum teste ou verificador histórico foi editado. **A suíte conjunta não é verde nesta linha.**
- **Mudanças de expectativa em testes existentes** (Quality): nenhuma enfraquece um teste nem esconde um achado. Os dois casos `whole` mudaram nos termos aceitos pelo SSCTR.
- **Mutação do Quality:** 18 mutantes em memória, controle 108 de 108; 16 mortos, 2 sobrevivem, equivalentes ou que só fazem reter mais (QRE-RWS-E-07).

## 3. Condições abertas

Nenhuma bloqueia o candidato sintético. Todas estão no registro habilitador.

### 3.1 A que é do Core: QRE-RWS-E-01

**Uma linha sem distância ainda escapa da retenção quando os relatos dela mesma dão um motivo que é só de distância.**

- O que acontece: a leitura devolve uma palavra só, pela precedência. Se os relatos da própria linha dizem `SEVERAL_RECORDINGS` ou `CORRECTED_MEASUREMENT`, essa palavra ganha e esconde o `REPORT_NOT_CARRIED`. Numa linha sem distância, a palavra de distância não retém nada, e o ritmo de trabalho da linha segue para a calibração.
- Efeito medido pelo Quality: sessões de qualidade a 255 s/km, relógio com GPS POOR, o atleta corrige o próprio relato listando uma gravação. A faixa de limiar sai `[290,325]`; com a correção simples, que o candidato retém, sai `[300,335]`.
- Já era assim em `a4a434f`. O candidato fecha a metade em que a correção não traz um motivo de distância.
- Por que não bloqueia (Quality): a regra autorizada fala da distância da linha, e essa parte fechou.
- **Palavra do SSCTR (adendo):** o ritmo de trabalho de uma linha sem distância está **dentro** da regra L1; ele não o declara fora. É condição antes de integração ou de atleta real, **a corrigir no Core**, com teste de resultado da sessão de qualidade. Não precisa de decisão do Founder sobre a regra.
- Não corrigi: o candidato julgado é o que se congela, e a missão não previa correção depois da revisão.

### 3.2 HARD GATE DE INTEGRAÇÃO REAL — não atendido (achado E-1, item L5)

> Uma re-sincronização do HealthKit de uma execução que o atleta também relatou não pode apagar as respostas do atleta no CoachingCore.

- O defeito está no motor congelado e continua: recuperação `ADVERSE` → `UNKNOWN`, `adverseSessions` 1 → 0.
- A extensão só retém a evidência de ritmo dessa corrida. **E-1 não está resolvido**, e os três juízes conferiram que o registro, o cabeçalho do ponto de entrada e o teste o fixam como não atendido.
- Antes de qualquer integração ou atleta real, a integração mostra por teste de resultado (ADVERSE, SYMPTOM, FATIGUE, HEAT) que a revisão que aplica a re-sincronização lê o que o atleta declarou por último, que a triagem segue pedida e que as declarações do atleta seguem em vigor. Vale também na forma de um relato só.
- Se isso pedir mudança no motor, a decisão é do Founder.

### 3.3 Duas vozes lidas como um autor (QRE-RWS-E-02, SEC-RWS-E-01, SSCTR-RWS-E-01)

O Core sabe quem falou pelos campos de origem que o cliente afirma. Em quatro formas a re-sincronização devolve a corrida à evidência de ritmo (`[345,575]`), como em `a4a434f`:

| Forma | Por quê |
|---|---|
| Um relato só, com a medida do aparelho e o acréscimo do atleta; a re-sincronização não repete o acréscimo | um autor substituindo o próprio relato (o limite que o autor declarou) |
| O relato do app traz o id da atividade | lido como o aparelho |
| A importação chega sem nenhum campo de origem | lida como o atleta |
| `provider: 'MANUAL'` com id de atividade | lido como aparelho identificado |

- A parada por sintoma não se perde em nenhuma delas: a triagem segue pedida.
- Fecha na integração: a custódia ou o adaptador grava a origem pelo canal de entrada, nunca pelo que o corpo do relato diz; I-1, I-2, I-4 e I-8; testes de resultado dessas formas no adaptador.
- **O contrato de dados precisa ser reconciliado com a I-2:** `ATHLETE_DATA_FOUNDATION.md`, seção 2.2, descreve uma observação de origem de aparelho que também leva campos do atleta.

### 3.4 Demais condições

| Id | O quê |
|---|---|
| L1-f | Antes de integração ou atleta real, a integração declara que fração das corridas fica retida para sempre, incluídas as autocorreções do atleta retidas por rótulo de provedor (SSCTR-RWS-E-04); se for material, dá o caminho de volta |
| SEC-RWS-E-04 (amplia a C-04) | O autor gravado é um pseudônimo estável e sem chave do id da atividade: ligável e, para id de baixa entropia, reversível. Todo relato de corrida deixa fato, com `wholeKm`. Inventário, apagamento e retenção pelo caminho de reparo; a custódia decide se usa um derivado com chave |
| SEC-RWS-D-02 (ampliada) | Uma linha de formato danificada, ou um fato da forma anterior, agora também tranca o registro de forma permanente. O reparo auditado é da custódia e não existe |
| SSCTR-RWS-D-01 com B-03 (L3-c) | Segue aberta, na forma de 26 km e no lado do crédito |
| SSCTR-RWS-E-03, com A-04 | Antes da fase B: `extentFraction` é descrição, nunca crédito nem conclusão; ele agora pode ser rebaixado pela L4 |
| Seguem abertas | SSCTR-RWS-C-01 a C-04, C-08; QRE-RWS-A-07; Security A-01, A-04, A-06 a A-08, C-03 |

Integração, registrada e não construída: cadeia de custódia com chave; persistência atômica; identidade confiável das atividades do HealthKit; contrato de reenvio e correção entre fontes; reparo auditado de registros ilegíveis; apagamento e retenção de dados de saúde; decisões de privacidade e base legal. A Security confirmou que nada no candidato apresenta qualquer delas como feita.

### 3.5 Notas

- **QRE-RWS-E-03, respondida pelo SSCTR:** vale a L4 como decidida. Uma correção que o motor recusou continua em vigor e pode baixar a referência (16 para 9,6 no longão). A célula "histórico: o mesmo" da linha 16 da matriz do contrato lê-se "o mesmo, ou menor pela L4". O contrato não foi editado; esta é a errata.
- **QRE-RWS-E-05:** um relato com id de mais de 128 caracteres fica retido para sempre, mesmo sozinho. Conservador.
- **SSCTR-RWS-E-02:** em 08 e 19 do longão, os longões à frente saem por tempo, na mesma dose de 100 min. Entra na fração de L1-f.
- **SSCTR-RWS-E-05:** quando o atleta corrige o próprio relato que tinha uma parada, a corrida volta à evidência de ritmo; a triagem continua pedida. Igual em `a4a434f`.
- **SEC-RWS-E-03:** o poder de quem forja, medido. Ressignar o autor do fato tira a corrida da retenção, não a parada. Forjar dá menos do que apagar; apagar os dois registros é o limite já declarado. Nada se apresenta como autenticação.

## 4. Correções ao registro do autor (`PHASE_A_LINEAGE_FIX_FORWARD.md`)

O registro fica como foi julgado. Cinco pontos dele não se sustentaram ou estavam incompletos:

1. **"A retenção é da linha inteira" (leitura 1): incompleta.** Não vale quando os relatos da própria linha dão um motivo só de distância. É o QRE-RWS-E-01. Testei a linha sem distância só com a correção simples.
2. **A tabela de quem falou diz "id num relato que diz fonte manual" como não identificado.** O código só faz isso para `quality` manual. `provider: 'MANUAL'` com id e sem `quality` sai como aparelho identificado (SEC-RWS-E-02).
3. **Não disse com todas as letras que uma importação sem nenhum campo de origem é lida como o atleta.** Declarei a I-1, mas não essa forma, nem a do relato do app que traz o id da atividade. Só declarei uma das quatro formas da seção 3.3.
4. **O classificador `FOLLOWS` da diferencial é largo demais** (QRE-RWS-E-04): depois da primeira retenção nova num cliente, ele aceitaria como decorrência uma mudança do motor ou da triagem na mesma revisão. A diferencial estrita do Quality não achou nenhuma. A minha frase "nenhuma diferença inesperada" valia menos do que parecia.
5. **Não declarei que a L4 difere da linha 16 da matriz** quando a correção recusada traz um valor menor. O meu cenário 22 usava o mesmo valor nos dois relatos.

A falha na primeira passada da mutação já estava dita na seção 9 do registro.

## 5. Commits deste ciclo (linha `claude/v1-run-extensions`)

| Commit | O quê |
|---|---|
| `5bd8c2d` | O diagnóstico de linhagem, incorporado por fast-forward (o mesmo commit do branch `claude/v1-rws-evidence-lineage`, que continua onde estava) |
| `4b1622f` | O candidato; é o commit julgado |
| `b624189` | Os três pareceres, como recebidos |
| (este) | O registro habilitador e o adendo do SSCTR, como recebidos, e este encerramento. `CoachingCore/` é byte a byte o de `4b1622f` |
| (o seguinte) | O registro do freeze e `PHASE_A_FREEZE_V1RWS_1.md` |

Valores: `CoachingCore/v1/RUN_FORMATS_V1.json`, sha256 `26c6e3fbfeee864376643c485d64a616f1cf13ea49d82b2cc223c02d7a06353c`, sem mudança.

## 6. O que fica para o Founder

1. **QRE-RWS-E-01.** É do Core, pequena, e o SSCTR a quer corrigida antes de integração. Qualquer correção muda o runtime julgado: pede nova revisão e um freeze novo. Não a iniciei.
2. **O hard gate E-1.** A integração o atende, ou pede decisão sua sobre o motor.
3. **A reconciliação do contrato de dados com a I-2** (seção 3.3).
4. **A fase B**, que não foi iniciada.
5. **Itens de fila humana propostos pelo SSCTR, não anexados:** HQ-V1RWS-A-SSCTR-LINEAGE-L1L2, HQ-V1RWS-A-SSCTR-LINEAGE-L3L4, HQ-V1RWS-A-SSCTR-R5-TWO-VOICES, e os quatro das rodadas anteriores.

`CURRENT_MISSION.md`, `MISSION_LEDGER.md` e a fila humana não foram alterados neste ciclo.
