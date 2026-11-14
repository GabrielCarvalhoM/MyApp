**Veredito: PASS_WITH_CONDITIONS** (candidato sintético, sem integração real). Escopo focal: só o que `git diff a8e9b05 644cd8e` muda na fusão de observações, na admissão de evidência e na leitura de sinais de segurança.

# SEC-V1RWS-FOCAL-R2 — Security, Privacy & Data, juiz independente do fix-forward da Fase A

- **Juiz:** Security, Privacy & Abuse Architect 1.1.0. Instância que não escreveu o candidato, a R1 nem a correção. Avaliei; não corrigi nada.
- **Candidato:** worktree `v1-run-extensions`, branch `claude/v1-run-extensions`, HEAD `644cd8e38ffb…` conferido, árvore limpa antes deste arquivo. Base de comparação: `a8e9b05` (extraído por `git archive` no meu scratch).
- **Data:** 2026-11-14.
- **Contexto injetado pelo host** (não usado como evidência):

| Arquivo | sha256 |
|---|---|
| CLAUDE.md global | `c75718d0d2fe2cce1332cf7240ef0b8013ca2901d52b4d6778480c1c333709c6` |
| CLAUDE.md do projeto (`MyApp/CLAUDE.md`) | `e657d059e06fd1a21613250753a8c79ac605b69d955191d634966b3c8fc922e6` |
| MEMORY.md | `afd187467bec0da84e92007bd03cb902a4c0039f6b9e41f0927ace7ff7c349a8` |

## Resumo

Nenhum achado bloqueia no meu campo. Pelo modelo da R1, fora da custódia o cliente já controla `actualLedger`, as observações e os registros que carrega. Nenhuma entrada nova dá a ele um poder que ele já não tinha: apagar um fato equivale a não mandar a parada; forjar um fato equivale a forjar a linha.

As duas falhas originais reproduzem em `a8e9b05` e não reproduzem em `644cd8e` (tabela abaixo). Não há entrada nova que suprima, atrase ou limpe a triagem de um jeito que antes não existia.

Ficam sete achados novos. Nenhum é bloqueante:

- **Quatro condições.** Uma resposta de revisão "anterior ao registro" ainda entrega a calibração sobre o registro não admitido (C-01). Há um custo quadrático na leitura de fatos hostis (C-02). Um fato de relato ilegível perde o sinal sem avisar (C-06). A custódia de hoje fecha em erro no fluxo real "app + importação", que é exatamente o fluxo do SSCTR-RWS-B-01 (C-03).
- **Uma condição de integração com escalonamento ao G07** (C-04): os dados novos.
- **Duas notas** (C-05, C-07).

A C-01 toca o critério de fechamento do QRE-RWS-B-01. Quem decide se ela reabre o bloqueio é o QRE, não eu.

## Falhas originais: reprodução e estado

| Falha | Sonda (minha cópia, raiz por argumento) | `a8e9b05` | `644cd8e` |
|---|---|---|---|
| SSCTR-RWS-B-01 | `probes/p1c.mjs` (18 casos) | 6 casos `NOT_RAISED_BY_THIS_EXTENSION`, com 1 a 4 sessões nativas na semana 2 (`deviceCompletedTrue/*`) | 18/18 `REQUIRED`, 0 nativas. Em `deviceFirst` a linha `dev-1` não tem parada e o sinal vem do fato do relato |
| QRE-RWS-B-01 | `probes/probe-a01-paths.mjs` (12 cenários) | 3 fusões com EASY `[345,575]` | 12/12 `[345,420]` |

## Achados anteriores no meu campo

| Id | Estado | Evidência executada |
|---|---|---|
| SEC-RWS-A-01 | **OPEN** (integração), ampliado | Os fatos de relato agora sustentam a segurança e a evidência de ritmo. No conflito "importação primeiro", **apagar os fatos** faz a próxima revisão sair `NOT_RAISED` (`facts2` A2), e numa fusão "importação sem duração + app" a faixa volta a `[345,575]` (`factsonly`: `withFacts [345,420]`, `factsDropped [345,575]`). Não é ganho novo: o cliente que tira o fato é o mesmo que podia mandar o relato sem parada. Mas os fatos passam a ser registro do motor e precisam da cadeia com chave da custódia, como o `runFormatRecord` inteiro. |
| SEC-RWS-A-02 | **Mantido** | Sonda P2 da R1 reexecutada: a sessão forjada não é entregue (`delivered … false`). O teste `QRE-RWS-A-03, SEC-RWS-A-02` passa. `readableFormat`, `settledOf` e `textsPass` não estão no diff. |
| SEC-RWS-A-03 | **Mantido** para formatos | `repeat=2e6`: 986 bytes, 44 ms, `ASK`, 21 MB de heap (era 13 s e cerca de 1 GB na R1). Teste `SEC-RWS-A-03` passa. Caminho novo de custo: C-02. |
| SEC-RWS-A-04 | **Inalterado** (integração) | O `runCalibrationOf` exportado agora passa por `internal()`, que remove `READS_COMPLETION`. `admitted` é função pura de visão, sem autoridade. Nenhuma opção ou caminho privilegiado novo. `optionsKeyIgnored` dá a mesma faixa. |
| SEC-RWS-A-05 | **Parte do Core: CLOSED. Integração: OPEN**, agora demonstrada | Uma parada por tempo dá `REQUIRED` (`probe-timestop`). Com formato desconhecido, o ASK nomeia e guarda (`facts2` D4: fato `app-stop SYMPTOM` sob `2026-11-22T23:00:00.000Z`, o instante da revisão; a revisão seguinte, com triagem do mesmo dia, segue `REQUIRED`). Uma correção não limpa o sinal (D1: linha substituída lida, `REQUIRED`). Na custódia de hoje, o fluxo real falha fechado e a triagem não chega ao app (C-03). |
| SEC-RWS-A-06 | **OPEN**, reforçado | No harness de custódia, com o ponto de entrada composto, a custódia recusou a decisão (`ENGINE_CONTRACT_VIOLATION`, versão ficou em 2), mas o `runFormatRecord` guardado ao lado ganhou o fato da parada (`ob_99119`). Gravar fora do mesmo commit selado dessincroniza os registros. |
| SEC-RWS-A-07 | **OPEN**, ampliado | Ver C-04. A sonda S5 da R1 continua: o canário `NEVER_OUTBOUND` não cobre `SYMPTOM` nem `WARNING_SIGN`. |
| SEC-RWS-A-08 | **OPEN** | O fato guarda `reportId`, que é o `eventId` do relato. Fora da custódia, o app escolhe esse valor e pode usar o UUID do HealthKit. Ver C-04. |
| SEC-RWS-A-09 | Inalterado (nota) | Os fatos só retiram evidência (`distanceFacts`: `paceWithheld` só acrescenta motivos). `forgedUntimedFactOnACleanRow` não mudou a faixa de controle. |

## Achados novos

| Id | Severidade | O quê | Evidência | O que fecha |
|---|---|---|---|---|
| SEC-RWS-C-01 | **CONDITION** (roteado ao QRE, ver abaixo) | **A resposta `REVIEW_BEFORE_THE_RECORD` dada sobre uma decisão que o motor aceitou carrega a calibração da V1RC sobre o registro não admitido.** `inert(base…)` devolve o `runCalibration` do `v1-run-index` como ele veio. Antes, a marca POOR gravada protegia esse caminho para dois arquivos. Agora nada protege. O gatilho é um cliente conforme: o ASK de formato desconhecido grava o fato da parada sob o seu instante, sem devolver estado de referência, e depois chega uma revisão que estava na fila, mais antiga que o ASK e mais nova que a última aceita. Essa resposta também não nomeia a triagem que o registro exige. | `early-queued`, caso dois arquivos: o motor dá `MODIFY` e a extensão dá `REVIEW_BEFORE_THE_RECORD`, com EASY **`[345,575]`** e triagem `null`. Em `a8e9b05` o mesmo caso dá `ACTIVE` e `[345,420]`. Com fusão: `[345,575]` nos dois commits. `early-accepted`, com uma linha do registro de instante posterior: o mesmo `[345,575]`. Sob a custódia, o `asOf` é o relógio do servidor (monotônico), então o caminho só se abre com o relógio regredindo. | Toda resposta inerte sobre decisão aceita pelo motor entrega a calibração refeita sobre `admitted` (ou nenhuma) e nomeia a triagem que o registro exige. Teste com o ASK seguido de revisão anterior. |
| SEC-RWS-C-02 | **CONDITION** | **Custo quadrático ao ler fatos hostis.** `reportsVerdict` percorre `sourcesOf(row)`, que é `provenance.mergedSourceIds` sem deduplicar, e para cada id percorre `facts.of(id)`. Muitos fatos podem dividir um `reportId`, porque a chave inclui o hash. Isso roda três vezes por linha: em `admitted`, no laço `done` e em `runHistory`. | `cost.mjs`, uma linha com n ids `'x'` e n fatos com `reportId 'x'`: n=1000 dá 84 ms; n=3000, 312 ms; n=10000 (3,4 MB), 2,7 s; **n=30000 (10,1 MB), 23,4 s**. O controle linear com os mesmos bytes dá 0,37 s, e só os ids dão 51 ms. Dentro da custódia os ids são do servidor (`ob_…`, únicos), então ali o custo é linear. | Deduplicar `sourcesOf` e limitar os fatos por `reportId` e o tamanho de `mergedSourceIds` lido (o excedente fica ilegível). Os limites de tamanho de requisição e de registro da A-03 continuam valendo. |
| SEC-RWS-C-03 | **CONDITION_FOR_INTEGRATION** (dono: engenharia da fronteira/custódia; revisão Security; SSCTR informado) | **Pergunta do autor, verificada: sim, a custódia falha fechada.** Uma fusão em duas requisições muda `actual` e `provenance` de uma linha guardada. O mesmo vale para a marca de conflito que o motor põe na linha guardada. `reconcile` só aceita linha igual ou a anotação de uma correção. Isso é anterior a este ciclo: o motor congelado `v1-index` falha igual. Importa aqui porque o relato do app mais a importação do relógio são dois relatos da mesma corrida, e a ordem "importação, depois parada no app" é o caso do SSCTR-RWS-B-01. | `custody-merge`: app e depois importação, e importação e depois app, dão as duas na segunda requisição `ok:false`, "a stored row changed", nada gravado, `verify:null`. Na mesma requisição fica `ok`, com `merged:2`. `custody-stop`: importação e depois a parada SYMPTOM no app dá `ok:false`, a resposta tem só `ok` e `error`, a parada não fica em lugar nenhum da custódia e nenhuma triagem chega ao app. Vale para o `v1-index` e para o composto. | A custódia aceita, como entrada encadeada (do tipo `of`), a fusão e a marca de conflito que o motor faz numa linha guardada, conferindo que o resto da linha não mudou. Os fatos e os formatos vão no mesmo commit selado. A resposta leva a triagem exigida. Teste nas duas ordens e com a parada. |
| SEC-RWS-C-04 | **CONDITION_FOR_INTEGRATION** (+ G07) | **Os fatos de relato são um registro novo de dado derivado de saúde, com vida mais longa que a linha.** `report.stop.reason` (SYMPTOM, FATIGUE…) fica gravado em `runFormatRecord` mesmo depois de correção, quarentena ou recusa do relato, e o atleta não pode retirá-lo: só a triagem neutraliza o efeito. Junto vão a distância medida por relato e o `reportId`. A triagem nomeada passa a sair também nas respostas ASK, HOLD e "anterior". O item 6 da §4 do autor ("sem registro novo") não procede: é um local e um tipo de registro novos. | `facts.mjs` A0: as linhas `RUN_REPORT_RECEIVED` com `stop:{reason:'SYMPTOM',stated:true}`. D1: a correção mantém a parada lida. D3 e D3b: a triagem sai na resposta recusada e na anterior. `inventory.mjs` não muda no diff e não classifica nada disso. A custódia não guarda o `runFormatRecord`, então `eraseHealthFacts` não alcança esses fatos. | Inventário: `report.stop` como HEALTH_DERIVED; distância e `timed` como TRAINING; `reportId` como id opaco do servidor, nunca o UUID do HealthKit. Egress NONE. Canário com SYMPTOM e WARNING_SIGN. Apagamento por redação, que preserva o "triagem devida ou respondida". Um caminho de correção pelo atleta. **G07:** base legal, retenção e o direito de correção sobre um sinal que o motor não deixa retirar. |
| SEC-RWS-C-05 | NOTE | **A integridade de uma linha de fato não é fechada como o registro afirma** ("cinco campos fechados, sem texto livre"). Isso vale para o que o motor escreve, não para o que ele aceita: chaves extras dentro de `report.stop` (com rehash) e no topo da linha passam; `recordedAt` fica fora do hash; `reportId` aceita qualquer texto de até 128 caracteres. | `facts2` A5 e A6: com texto `<img …>` a linha é lida (`REQUIRED`) e carregada adiante. A7: com `recordedAt` recuado 7 dias, uma triagem antiga limpa a parada (`NOT_RAISED`); o controle A7c dá `REQUIRED`. A10: `reportId` `<script>alert(1)</script>` fica guardado como está. Fora da custódia não há ganho novo: o cliente já controla elegibilidade e registro. | Conjunto exato de chaves na linha e em `stop`; padrão fechado para `reportId`; `recordedAt` no payload com hash ou sob a cadeia (C-04 e A-01). |
| SEC-RWS-C-06 | **CONDITION** | **Um fato ilegível perde o sinal de segurança em silêncio.** Um registro de formatos que perdeu um formato citado vai a HOLD (fecha). Um fato de parada que falha a integridade só é listado em `unreadableReports`, e a revisão segue entregando nativo. Uma corrupção não maliciosa (migração, serialização) apaga a triagem. | `facts2` A3: fato alterado sem rehash dá `unreadableReports:[report|app-stop|…]` e triagem `NOT_RAISED_BY_THIS_EXTENSION`. A8 (outro atleta) dá 9 ilegíveis, também sem triagem. | Linha `RUN_REPORT_RECEIVED` ilegível do atleta (ou de atleta trocado) mantém as corridas por tempo com a triagem pedida, ou faz a revisão ir a HOLD como o formato perdido. Teste. |
| SEC-RWS-C-07 | NOTE (anterior a este ciclo) | A triagem enviada **na mesma requisição** da parada, com `assessedAt` alguns minutos depois do `asOf`, já limpa a parada. A custódia aceita até 5 minutos no futuro. Também anterior: uma corrida avulsa importada (`UNPLANNED`, `sport:'RUN'`) com parada SYMPTOM não é lida. | `facts2` D5: +4 min dá `NOT_RAISED`; D5c, no `asOf`, dá `REQUIRED`. D6: `NOT_RAISED`, com a linha guardada. | Integração: comparar `assessedAt` com o instante do servidor que gravou a parada. A avulsa: escopo da R3 C4, com o SSCTR. |

## Respostas às perguntas da missão

**1. Fatos de relato.**

- **O que o motor escreve é fechado:** `appendReportFacts` monta exatamente as cinco chaves de `reportFactOf`, com `stop` só `{reason, stated}`, o motivo como palavra da lista, `distanceKm` limitado e `timed` booleano. O `reportId` vem do `eventId` (até 128 caracteres) ou do conteúdo (`unidentified:<16 hex>`).
- **O que o motor aceita é mais largo** (C-05).
- **Reenvio:** reenviar o mesmo relato, ou o mesmo id com o mesmo conteúdo lido, não acrescenta linha (A11: 9 → 9 → 9).
- **O que um cliente fora da custódia consegue:**
  - forjar um fato: levanta a própria triagem (A9: `REQUIRED`) ou retira evidência de ritmo;
  - apagar ou alterar um fato: tira a triagem no conflito "importação primeiro" e devolve a distância de uma fusão sem duração.

  Tudo isso já era possível pelo próprio relato. Dentro da custódia, depende de C-04, C-03 e A-01.
- **Custo:** C-02.
- **Classificação:** C-04. A-07 e A-08 ganham o novo local.

**2. Registro admitido.**

- **Nada guardado é reescrito.** A linha de dois arquivos fica `distanceKm 6.6`, `gpsQuality OK`, sem `deviceGpsQuality`. O `actualLedger` devolvido é igual ao carregado (`admitted`: `acceptedLedgerSameAsCarried:true`). A custódia aceita a primeira requisição (`custody-merge`, `first.ok`).
- **A V1RC recebe uma visão e não é tocada.** O `runCalibrationOf` exportado, com ou sem o registro, dá `[345,420]` para dois arquivos, e o reinício também (`withheld:1`).
- **A chave do leitor continua retirada.**
- **Caminho que escapa à admissão:** a resposta inerte "anterior ao registro" (C-01).

**3. Sinal de segurança.**

- Nenhuma entrada nova suprime, atrasa ou limpa a triagem além do que o cliente já podia.
- Um relato com outro `athleteId` é recusado pelo motor (`ATHLETE_MISMATCH`) e ignorado pelos fatos (D2). Equivale a não mandar o relato.
- Uma correção não limpa (D1).
- Apagar fatos, ou recuar `recordedAt`, limpa (A2, A7). É o mesmo poder que o cliente tem sobre a elegibilidade.
- **Revisão recusada, ou anterior ao registro:** a resposta nomeia a parada a partir do próprio pedido e não grava nada (D3 e D3b: fatos 36 → 36 e 24 → 24). Não vejo problema de integridade nisso: o nome sai só do pedido e não entra em registro. O aviso, porém, não é durável: a revisão seguinte sai `NOT_RAISED` (D3), e o app precisa apresentar o aviso e reenviar o relato (A-05 e A-06 na integração).
- **Formato desconhecido:** o fato fica sob o `asOf` da revisão que o motor aceitou (D4). É o mesmo instante que cria o gatilho da C-01.

**4. Mitigações anteriores.** A-02 e A-03 se mantêm. A-05 fecha no Core.

**5. Contrato da custódia.**

- O cabeçalho de `v1-run-format-index.mjs` diz que a integração "does not exist yet and nothing here stands for it". O registro do autor (§3) diz o mesmo.
- Nenhum teste ou registro apresenta a custódia como feita. Os testes T3 e "custody's own rule" guardam os registros ao lado e dizem isso.
- A pergunta do autor está respondida e virou a C-03.

**Itens da §4 do autor no meu campo.**

- **Item 5:** aceito para o candidato sintético, com C-01 e C-03.
- **Item 6:** ver C-04. É um registro novo, não "a mesma classe sem registro novo".

## O que rodei

Scratch: `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/c10c7f19-99c9-449b-b28b-312cccb82112/scratchpad/sec-focal-r2-20261114/`, com `base-a8e9b05/` (o `git archive` mais `node_modules`), `probes/`, `r1-probes/` e as saídas `out-*`.

- `p1c.mjs` e `probe-a01-paths.mjs` nos dois commits.
- `facts.mjs` e `facts2.mjs` (integridade e sinal, A0–A11 e D1–D6).
- `admitted.mjs` nos dois commits.
- `factsonly.mjs`.
- `cost.mjs` (ids, facts, product; n até 30000).
- `custody-merge.mjs` e `custody-stop.mjs`.
- `early-accepted.mjs` e `early-queued.mjs` nos dois commits.
- As sondas da R1 `probe-f3`, `probe-safety safety`, `probe-safety 2000000` e `probe-timestop` contra o worktree.
- No worktree: `node --test test/v1rws-*.test.mjs`, **74/74**.
- Leitura: o diff inteiro de `src/`, `custody.mjs` (`reconcile`, `submit`), `inventory.mjs`, `r6-provenance.mjs` (fusão e conflito), `v1-run-index.mjs` e o registro do autor.

Não rodei `npm run verify`, `verify-r*`, `*-freeze.mjs`, `v1rc-journeys` nem `v1rc-fuzz`. Não escrevi nada no worktree além deste arquivo.

## O que não verifiquei

- A suíte inteira, `--preserved` e `--check`. São do QRE.
- Os valores esportivos (0,91, janela, RACE). São do SSCTR.
- O comportamento com o registro habilitador presente (ele não existe).
- O caminho "anterior" da C-01 em fusos positivos, por reinício com `asOf` só de dia. Só o li no código, não executei.
- A custódia real, a autenticação, as chaves e a retenção (G07). O adaptador iOS e o HealthKit real.
- A fase B.
