**Veredito: PASS_WITH_CONDITIONS** (candidato sintético, sem integração real). Escopo focal: só o que `git diff 9aed5e2 5289667` muda na preservação dos sinais de segurança, na integridade dos fatos de relato, nos limites do leitor e na custódia dos registros. Nenhum achado BLOCKING.

# SEC-V1RWS-FOCAL-R3 — Security, Privacy & Data, juiz independente do fix-forward final da Fase A

- **Juiz:** Security, Privacy & Abuse Architect 1.1.0. Instância que não escreveu o candidato, os relatórios anteriores nem a correção. Avaliei; não corrigi nada.
- **Candidato:** worktree `v1-run-extensions`, branch `claude/v1-run-extensions`, HEAD `52896679d455…` conferido, árvore limpa antes e depois dos meus testes. Base: `9aed5e2`, extraída por `git archive` no meu scratch.
- **Data:** 2026-11-14.
- **Contexto injetado pelo host** (não usado como evidência; o MEMORY.md nomeia achados anteriores e a visão do autor):

| Arquivo | sha256 |
|---|---|
| CLAUDE.md global | `c75718d0d2fe2cce1332cf7240ef0b8013ca2901d52b4d6778480c1c333709c6` |
| CLAUDE.md do projeto (`MyApp/CLAUDE.md`) | `e657d059e06fd1a21613250753a8c79ac605b69d955191d634966b3c8fc922e6` |
| MEMORY.md | `76baefc6c32d7e247d5a2b3efd0153a9857e28d4dba493bb79081587e3496afc` |

## Resumo

O candidato faz o que a mission pedia no meu campo, com uma lacuna. Um fato de relato alterado, ressignado de forma incoerente, de outro atleta, de tipo desconhecido, sem uma chave, de formato antigo ou que nem é linha agora falha fechado: a triagem é pedida, as corridas saem por tempo e nenhuma distância vai a leitor de ritmo. Em `9aed5e2` todos esses casos davam triagem `NOT_RAISED` e 8 sessões nativas. Uma `stop` que não é objeto é parada. A triagem datada depois da própria revisão não limpa mais. O leitor ficou linear.

A lacuna: um fato cujo campo `fact` foi trocado para `RUN_FORMAT_EMITTED` some em silêncio. Ele só aparece em `unreadableFormats`, e as nativas voltam (D-01). O poder que isso dá é o mesmo de apagar a linha, que só a cadeia com chave da custódia fecha. Por isso é CONDITION e não BLOCKING.

O estado de retenção novo é seguro: um cliente não consegue limpá-lo, e só consegue levantá-lo contra si mesmo. Mas ele é permanente num registro só de acréscimo, e nada além de restaurar o registro o desfaz. Isso pesa na integração, principalmente no apagamento de dado de saúde (D-02).

As leituras 4, 5, 8, 9 e 10 do autor estão aceitas, a 4 com condições. As condições de integração seguem registradas como abertas, e nada no candidato as substitui.

## Reprodução antes do candidato

Sondas do QRE R3, sem mudança, na minha extração de `9aed5e2` e depois no worktree:

| Falha | `9aed5e2` | `5289667` |
|---|---|---|
| QRE-RWS-C-01 (`p-merge-paths.mjs`) | A1, A2, A3, B1, B2: EASY **`[345,575]`**, `paceEvidenceWithheld: []`, linha com `segments:"[]"` | as cinco `[345,420]`, `SEVERAL_RECORDINGS`, linha com a lista do app. Controles iguais nos dois (D0 `[345,575]`, D1 e C1 `[345,420]`) |
| QRE-RWS-C-05 / SEC-RWS-C-01 (`p-inert.mjs`, revisão da fila depois do ASK) | `REVIEW_BEFORE_THE_RECORD`, `CALIBRATED`, **`[345,575]`**, triagem `null` | `REVIEW_BEFORE_THE_RECORD`, `CALIBRATED`, `[345,420]`, triagem `REQUIRED` |

Vi as duas falharem e vi as duas fecharem. O fechamento delas é do QRE.

## Achados anteriores no meu campo

| Id | Estado | Evidência executada |
|---|---|---|
| SEC-RWS-C-01 | **CLOSED** no meu campo (o QRE decide o QRE-RWS-C-05) | Acima. Respostas sem sessão sobre registro com parada nomeiam a triagem: revisão da fila `REQUIRED` (`s3-early`), revisão recusada por `asOf` ilegível `REQUIRED` (`s1` W2), HOLD de revisão retroativa `REQUIRED` (`s2` EARLY). `FORMAT_ERROR` e `REVIEW_TIME_REQUIRED` não acionei (o autor diz que não têm acesso por JSON com plano válido; li que usam o mesmo `heldAnswer`). |
| SEC-RWS-C-02 | **CLOSED** | `cost3.mjs`, formato novo de linha. `product` (a forma da R2: uma linha com n ids iguais, n fatos do mesmo nome): n=30000, 11,5 MB, **1,39 s** (em `9aed5e2`, `cost.mjs`: n=10000 3,8 s). `names` (n nomes numa linha): 30000, 11,9 MB, 1,30 s. `bigrows` (linhas grandes ilegíveis, 1 KB cada): 30000, 61,8 MB, 0,31 s. `bighash` (linhas com as chaves exatas que precisam de hash para serem recusadas): 30000, 68,5 MB, 0,97 s. Leitura dos fatos e vereditos lineares em todas. `manyrows` (n cópias de uma linha que citam o mesmo relato): 1000 0,38 s, 3000 2,2 s, 10000 **24,8 s**, mas com a extensão desligada dá 2,3 s e 24,7 s: o custo é do motor congelado, não do leitor (D-05). As chaves de identidade são verificáveis: recomputei `eventId` e `inputHash` com a regra do módulo, e o motor leu as linhas que recompus. |
| SEC-RWS-C-03 | **OPEN** (integração), inalterado | `custody-merge.mjs` e `custody-stop.mjs` da R2 no candidato: a segunda requisição dá `ok:false`, "a stored row changed", nos dois pontos de entrada e nas duas ordens. Na parada, a resposta tem só `ok` e `error`. `custody.mjs` não está no diff. Não piorou. |
| SEC-RWS-C-04 | **OPEN** (integração), escopo um pouco maior | A linha de fato agora guarda também `several`, `corrected` e `ownKm` (o número do próprio atleta). Relatos que só listam arquivos ou só trazem o número do atleta também deixam fato. Revisões anteriores ao registro passam a guardar fatos (leitura 8). O motivo da parada continua lá. Nada no diff trata inventário, apagamento ou retenção. Ver D-02: qualquer redação no lugar torna a linha ilegível. |
| SEC-RWS-C-05 | **CLOSED** no Core; resíduo como nota | `s1-signal.mjs`: chave a mais no topo (V5), em `report` (V7) e em `stop` (V6), as duas últimas ressignadas, dão ilegível. `recordedAt` recuado sem ressignar dá ilegível (V4), e com texto não canônico do mesmo instante também (V14). O nome vem do conteúdo. Uma linha do formato de `644cd8e` dá ilegível (V13). O teste do autor cobre mais 21 formas. Resíduo: `reportId` continua texto livre até 128 caracteres (D-03). E o que o cliente faz ao recomputar todo hash fica para a cadeia com chave (D-04). |
| SEC-RWS-C-06 | **PARTIAL** | `s1-signal.mjs`, cenário "importação primeiro, parada só no fato", revisão seguinte. Candidato: V2 (motivo trocado), V4, V5, V6, V7, V8 e V8b (outro atleta, com e sem novo selo), V9 (tipo `X`), V11 a V11d (texto, `null`, número, lista), V12 (sem `fact`) e V13 dão todos `REQUIRED(RUN_REPORT_UNREADABLE)`, 0 nativas e 12 distâncias `REPORTS_UNREADABLE`. Uma triagem respondida depois não limpa. Em `9aed5e2`, V2, V4, V9 e V12 davam `NOT_RAISED` com 8 nativas. Com uma parada legível ao lado de uma linha ilegível, o motivo nomeado é o sintoma, com a sessão. Registro inteiro ausente ou que não é lista (V15, V15b): HOLD. No reinício, igual (`s5-restart`). **Aberto:** V10, fato reetiquetado como formato: `NOT_RAISED`, 8 nativas, só `unreadableFormats:9`. Também no reinício (D-01). Apagar o fato (V1) ou ressigná-lo coerente (V3 FATIGUE, V4b recuado) dá `NOT_RAISED`: limite declarado, ver D-04. |
| SEC-RWS-C-07 | **CLOSED** no Core | `s2-stop-screen.mjs`. Na mesma requisição, triagem em T+1 ms e T+4 min: `REQUIRED` (em `9aed5e2`: `NOT_RAISED`, 7 nativas). Na revisão seguinte: triagem em T não limpa; T+1 ms, R−1 ms e R limpam; R+1 ms e R+4 min não limpam. Por dia: o dia da parada não limpa; o dia seguinte e o dia da revisão limpam; o dia depois da revisão não limpa (o motor também pergunta). Na integração vale comparar com o instante do servidor que gravou a parada; com o `asOf` do servidor, é o que o código faz. A parte da corrida avulsa segue na SSCTR-RWS-C-04. |
| SEC-RWS-A-02 | **Mantido** | Teste `QRE-RWS-A-03, SEC-RWS-A-02` passa. `readableFormat`, `settledOf` e `textsPass` não estão no diff. |
| SEC-RWS-A-03 | **Mantido** | Teste `SEC-RWS-A-03` passa, e os limites de formato não estão no diff. O caminho novo de custo, os fatos, é linear (C-02 acima). |
| SEC-RWS-A-05 | **Mantido** no Core | `p1c.mjs` da R2: 18 de 18 `REQUIRED`, 0 nativas na semana 2. Parada num relato por tempo: `REQUIRED` (`s2`). Teste `SSCTR-RWS-A-01, SEC-RWS-A-05` passa. |
| SEC-RWS-A-01, A-06 | **OPEN** (integração), inalterados | Os três registros continuam fora da custódia. O cabeçalho do módulo diz que a integração "does not exist yet and nothing here stands for it". |
| SEC-RWS-A-07, A-08 | **OPEN**, inalterados | Canário e classificação sem mudança; `reportId` segue sendo o `eventId` do cliente (D-03). |

## Leituras da seção 3 do autor que me nomeiam

| # | Decisão | Por quê |
|---|---|---|
| 4 | **ACEITA, com D-01 e D-02** | Falha fechado e é dita à parte (`RUN_REPORT_UNREADABLE`, `sessionIds: []`, nunca `RUN_STOPPED_FOR_A_SYMPTOM`). A triagem não limpa, o que está certo: ela não pode responder por um dado que ninguém sabe o que dizia. Quem pode levantar o estado é quem escreve no registro. Fora da custódia, esse é o próprio cliente, contra si mesmo, e ele já podia declarar uma parada. Ninguém mantém o estado contra a vontade do atleta. Só restaurar o registro desfaz, e é o mesmo poder de apagar. O motor nunca escreve uma linha que ele mesmo não lê: `s4-selfread`, 2 sementes, 1200 revisões aleatórias, 9582 linhas de fato escritas, 0 ilegíveis, 0 exceções. A frase "conta qualquer linha que não seja formato nem fato íntegro" não vale para uma linha etiquetada como formato (D-01). |
| 5 | **ACEITA** | `s2`: `{}`, `"x"`, `""`, `true`, `1`, `0` e `[]` dão parada `SYMPTOM` e `REQUIRED`, na resposta e na seguinte. Num relato nativo dá `STOPPED`. `false`, `null` e ausente dão sem parada. Em `9aed5e2`, todos os não-objeto davam sem parada. Ler `false` como "sem parada" é razoável. |
| 8 | **ACEITA** | `s3-early`, revisão da fila depois do ASK, trazendo parada própria. O fato fica sob `2026-12-10T23:00:00.000Z`, o mesmo `firstRecordedAt` que o motor dá à linha dessa revisão. Não é instante novo. Nada some: a parada do ASK, de instante posterior, continua pedindo a triagem com uma triagem entre os dois instantes (`nextScreenDay3_21h`: `w4-run-d0` segue). O conteúdo nomeia a linha, então reenviar o mesmo relato não volta o instante para trás. Revisão recusada não grava nada (`s1` W2, `admitted.mjs` `refusedHold`). Sob a custódia, o `asOf` é o relógio do servidor; fora dela o cliente sempre escolheu o instante. Não abre caminho para suprimir, atrasar, limpar ou forjar. |
| 9 | **ACEITA** | `s2`: o ASK de formato desconhecido com parada, distância e lista guarda só `{stop:SYMPTOM, distanceKm:null, timed:false, several:false, corrected:false, ownKm:null}`. Sem parada, não guarda nenhum fato. A distância de um relato não gravado não está em linha nenhuma, então não há retenção perdida. |
| 10 | **ACEITA** para o candidato sintético | Não existe registro real. Uma linha do formato anterior fica ilegível e retém tudo (V13): falha fechado, não aberto. Digo com clareza: fora da custódia, um cliente que recomputa todos os hashes ainda troca o motivo (V3) e recua o instante (V4b), e assim a triagem antiga limpa a parada. O selo sem chave não impede isso. Só a cadeia com chave da custódia fecha (D-04). |

## Achados novos

| Id | Severidade | O quê | Evidência | O que fecha |
|---|---|---|---|---|
| SEC-RWS-D-01 | **CONDITION** | **Fato reetiquetado como formato some em silêncio.** `readReportFacts` pula toda linha com `fact === 'RUN_FORMAT_EMITTED'`. `readFormatRecord` só lista em `unreadableFormats` a que não é formato legível, e uma linha que nenhum relato cita não leva a HOLD. Trocar só o campo `fact` de um fato de parada tira o sinal: é um dado provadamente inválido lido como nada, ao contrário do que diz o cabeçalho do módulo. É anterior ao diff (em `9aed5e2` também), mas fica dentro do que a C-06 pedia. Não dá poder novo: apagar a linha faz o mesmo. | `s1` V10: `NOT_RAISED`, 8 nativas, `unreadableFormats: 9`, `withheld: 0`. Também com triagem anterior à parada. `s5-restart`, reetiquetado: `PROPOSED`, `NOT_RAISED`, 2 nativas. O teste do autor (`DAMAGED`) não tem este caso. | Uma linha que não é nem formato legível nem fato legível (incluindo a etiquetada como formato que `readFormatRecord` recusa) entra no mesmo estado `RUN_REPORT_UNREADABLE`, com teste. |
| SEC-RWS-D-02 | **CONDITION_FOR_INTEGRATION** (dono: engenharia da custódia; Security revisa; SSCTR e Product informados) | **O estado de linha ilegível é permanente e não tem caminho de saída além de restaurar o registro.** A triagem não limpa, e o registro só cresce: a linha ruim é levada adiante em toda resposta (W1). Três coisas da integração caem nisso: (a) o apagamento ou a redação de dado de saúde pedido na C-04, porque qualquer mudança no lugar torna a linha ilegível; (b) um registro guardado por cliente antigo, ou do formato anterior (leitura 10); (c) a tela do app, que hoje trata `REQUIRED` como "até responder a triagem" e, com `RUN_REPORT_UNREADABLE`, mostraria uma triagem que nunca libera. Não bloqueia o sintético: falha fechado, e não existe atleta nem registro real. | `s1` V2 a V14: com triagem respondida depois, segue `REQUIRED(RUN_REPORT_UNREADABLE)`. W1: a linha volta no `runFormatRecord` da resposta. O teste do autor afirma "until the record is sent as it was kept". | Antes de uso real: um caminho de reparo auditado pela custódia (quarentena da linha com registro de quem e por quê, ou uma linha de redação que este leitor aceite e que preserve "triagem devida ou respondida"), definido junto com o apagamento da C-04. E o contrato do app diz o que fazer com `RUN_REPORT_UNREADABLE`, que não é repetir a triagem. |
| SEC-RWS-D-03 | NOTE | **Texto do cliente volta na resposta, agora também nas respostas sem sessão.** `paceEvidenceWithheld[].eventId` e `unreadableReports[]` repetem `eventId` escolhidos pelo cliente. Em `unreadableReports` agora entram os de linha de qualquer tipo, sem limite de tamanho. `reportId` continua texto livre até 128 caracteres, e é guardado. Não sai nada que não tenha vindo no próprio pedido: o `runFormatRecord` inteiro já é devolvido, e não vi dado de outro atleta que o chamador não tenha mandado. | `s4b-selfread`: `<script>alert(1)</script>` volta em `paceEvidenceWithheld` (8 de 600 respostas). `cost3` `bigrows`: 30000 ids de 1 KB listados. | Na integração: `eventId` e `reportId` como id opaco do servidor, com padrão e tamanho fechados (A-08). O app trata esses campos como texto, nunca como marcação. |
| SEC-RWS-D-04 | NOTE (limite declarado, não defeito do diff) | **O que só a cadeia com chave fecha, reproduzido no candidato.** Apagar o fato (V1), ressigná-lo com outro motivo (V3) ou ressigná-lo com o instante recuado (V4b) dá `NOT_RAISED` com 8 nativas. O selo é um hash sem chave, que o cliente recomputa. O autor declara isso na seção 4 do registro e no teste. | `s1` V1, V3, V4b. | Custódia com chave e gravação atômica dos três registros junto com o do motor (A-01, A-06). |
| SEC-RWS-D-05 | NOTE (fora do diff) | **O motor congelado é quadrático em muitas linhas da mesma sessão.** 10000 cópias de uma linha levam 24,8 s, com a extensão ligada ou desligada. Não é deste ciclo nem da extensão. | `cost3` `manyrows` 3000/10000: 2,2 s / 24,8 s; desligada: 2,3 s / 24,7 s. | Na integração: limite de tamanho de requisição e de linhas por sessão na custódia (como na A-03). |

## Respostas às perguntas da missão

1. **Falhar fechado.** Ver C-06 e D-01. Dado provadamente inválido é dito à parte (`RUN_REPORT_UNREADABLE`, nunca sintoma) e não se confunde com dado ausente, exceto no reetiquetado como formato. Um relato forjado e ressignado de forma coerente ainda é lido como parada confirmada. É o mesmo poder de mandar o relato, e a extensão não decide clínica (`decidedByThisExtension:false`). O estado de retenção usa a triagem existente, não pode ser limpo por quem não deve, e não é abuso novo (leitura 4). A compatibilidade com o app fica em D-02 (c).
2. **Custo e limites.** Linear (C-02). As chaves se verificam. A ordem causal se mantém: os fatos entram antes da leitura (`read`), a revisão recusada não grava e a anterior ao registro grava sob o instante aceito. Não houve refatoração do armazenamento.
3. **Forma da linha.** Ver C-05. Fora da custódia, o cliente que recomputa os hashes ainda faz tudo o que fazia antes. Só a cadeia com chave fecha (D-04).
4. **Instante da triagem.** Ver C-07. As bordas foram conferidas.
5. **Leituras 8 e 9.** Aceitas. Nenhuma abre um jeito de suprimir, atrasar, limpar ou forjar o sinal, nem de gravar sob um instante que o motor não aceitou.
6. **Toda resposta.** Ver D-03. Nada é revelado além do que veio no pedido. Texto do cliente volta em dois campos.
7. **Integração.** A seção 5 do registro do autor e o cabeçalho do módulo dão como abertos: a custódia com chave e a gravação atômica, a C-03, a C-04 e o G07. Nenhum teste ou registro apresenta qualquer deles como feito. O diff não piora a C-03 e aumenta um pouco o escopo da C-04. A D-02 é a interação nova com o apagamento. Nenhum deles bloqueia o candidato sintético.
8. **Mitigações anteriores.** A-02, A-03 e A-05 se mantêm.

**De outros donos (vi, não decido):** C-01 e C-05 do QRE. Nas sondas dele, as cinco fusões e a revisão da fila fecham. A leitura 2 (número do atleta na disputa) e a 6 (`segments` que não é lista) são do SSCTR. Também vi que um ASK de formato desconhecido sem parada continua não deixando fato.

## O que rodei

Scratch: `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/f7907645-2532-4d04-8be4-fa62a06fa225/scratchpad/sec-focal-r3-20261114133630/`, com `base-9aed5e2/` (o `git archive` mais `node_modules`), `prev/` e `prev-ssctr/` (cópias das sondas anteriores), `probes/` (as minhas) e as saídas `out-*`.

- Em `9aed5e2` e no candidato: `p-merge-paths.mjs`, `p-inert.mjs`, `s1-signal.mjs`, `s2-stop-screen.mjs` e `s3-early.mjs`. `cost.mjs` (R2, formato antigo) só na base.
- Só no candidato: `cost3.mjs` (seis formas, n até 30000) e `cost3b.mjs` (a mesma, desligada); `s4-selfread.mjs` e `s4b-selfread.mjs` (1200 relatos aleatórios); `s5-restart.mjs`; da R2, `p1c.mjs`, `custody-merge.mjs`, `custody-stop.mjs` e `admitted.mjs`. Estas quatro só leem as linhas de fato, não as montam à mão. Não usei `facts2.mjs` nem `factsonly.mjs` no candidato, porque montam a linha no formato antigo; escrevi `s1-signal.mjs` com o selo novo.
- No worktree: `node --test test/v1rws-*.test.mjs`, **88/88**, uma execução.
- Leitura: o diff inteiro de `src/`; `v1-run-format-index.mjs` (`readingOf`, `heldAnswer`, `finish`, `evaluateProgram`, `restartProgram`); `readableReport`, `appendReportFacts`, `readReportFacts` e `reportsVerdict`; `distanceFacts` e `statedStop`; `utcTimestamp`; os testes 11 a 13 de `v1rws-final-fix.test.mjs`; o registro do autor.

Não rodei `npm run verify`, `verify-r*`, `*-freeze.mjs`, `v1rc-journeys` nem `v1rc-fuzz`. Não escrevi nada no worktree além deste arquivo. Nenhum comando git de escrita.

## O que não verifiquei

- A suíte inteira, `--preserved` e `--check`. São do QRE.
- `FORMAT_ERROR` e `REVIEW_TIME_REQUIRED` acionados de verdade: só li o código.
- A mutação do autor, que não refiz.
- Os valores esportivos e as leituras 1, 2, 3, 6 e 7. São do SSCTR e do QRE.
- O comportamento com o registro habilitador presente, que não existe.
- A custódia real, a autenticação, as chaves, a retenção e o G07. O adaptador iOS e o HealthKit real.
- A fase B.
