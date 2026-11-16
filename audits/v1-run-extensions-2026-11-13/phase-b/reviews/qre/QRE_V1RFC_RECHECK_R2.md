# QRE: V1RFC fase B, reverificação R2 (única) do ciclo corretivo `0d3015b`

**Veredito: `READY_WITH_CONDITIONS`.** Nenhum achado BLOCKING sobrevive.
- QRE-RFC-A-01, A-02 e A-05 estão fechados por resultado nas minhas sondas, sem mudança, e em formas novas.
- QRE-RFC-A-03 está fechado na forma que bloqueava. Resta um caso estreito (restart no mesmo dia, com o plano novo começando nesse dia), que registro como **CONDITION** QRE-RFC-B-02.
- Nada regrediu:
  - composição: 285 comparações, 0 diferenças;
  - oráculo: os 43 exemplos e 6.000 casos aleatórios, 0 divergências;
  - admissão: 108 jornadas, 0 violações;
  - semana da prova: nunca mostrada alterada;
  - suíte conjunta: uma falha, a esperada, por nome.

As condições valem só para dados sintéticos, como antes. Este veredito cobre a previsão e os insights. **Não cobre a revisão de ritmo** (`V1X-PACE-REVISION`), que continua não aprovada: seção 5.

- **Juiz:** a mesma instância de Quality & Reliability da R1 (claude-opus-5-5). Não escrevi o ciclo. Não editei meus arquivos da R1. Não li os pareceres do SSCTR nem da Security.
- **Data:** 2026-11-16.
- **Versões:** `0d3015bc1486667f3428777087a469db5da4dd0f` (HEAD conferido). Julguei só `git diff 400edb7 0d3015b -- CoachingCore`: `src/v1-run-forecast-index.mjs`, uma linha de `src/v1-pace-insights.mjs`, `test/v1rfc-helpers.mjs`, o T5 e o novo `test/v1rfc-cycle.test.mjs`. O registro do autor, `PHASE_B_CORRECTIVE_CYCLE.md`, foi tratado como lista de afirmações.
- **Sondas:** as da R1 sem mudança, apontadas para o worktree; as novas em `probes/r2/`.

## 1. Estado dos achados da R1

| Id | R1 | R2 | Evidência |
|---|---|---|---|
| QRE-RFC-A-01 | BLOCKING | **CLOSED** (resta B-01, NOTE, de custódia) | `r2/b1-week-stability.mjs`, abaixo |
| QRE-RFC-A-02 | BLOCKING | **CLOSED** para a previsão e os insights (resta B-03, para a revisão desligada) | `r2/b2-delivered-band.mjs`, `r2/b3-pair.mjs` |
| QRE-RFC-A-03 | BLOCKING | **PARTIAL**: fechado na forma da R1 e sem intervalo entre os planos; resta B-02 (CONDITION) | `q10c-restart-ids.mjs` (R1), `r2/b4-restart.mjs` |
| QRE-RFC-A-04 | CONDITION | **OPEN**, por escolha declarada (a revisão está desligada); `q8-revision-entry.mjs` dá o mesmo que na R1 | `q8` |
| QRE-RFC-A-05 | CONDITION | **CLOSED** | `q3c-break.mjs` (R1) |
| QRE-RFC-A-06 | NOTE | Dentro da semana, virou retirada (A-01). Resta a leitura V5 de uma sessão em conflito nas semanas seguintes, para o SSCTR | — |
| QRE-RFC-A-07 | NOTE | OPEN, não tratado (o autor diz isso) | — |
| QRE-RFC-A-08 | NOTE | E08 morto agora; E03, E15, E16 e P11 seguem sem teste (seção 4) | `r2/tools/` |
| QRE-RFC-A-09, A-10, A-11 | NOTE | sem mudança | — |

### QRE-RFC-A-01: fechado

`r2/b1-week-stability.mjs` monta o plano de 10 km da R1 e um atleta de limiar. Cada caso faz a olhada na segunda, depois a ação na quarta, e depois as olhadas de quinta e domingo. O juízo é mecânico: número igual ao da segunda, ou retirada com motivo **e sem número**.

| Forma | Previsão quinta / domingo | Insights | Igual à segunda? |
|---|---|---|---|
| R1 q3d: 12 relatos de aparelho de corridas passadas | `REPORTS_CHANGED_SINCE_THE_WEEK_STARTED` | idem | retirada sem número |
| R1 q3b(a): 12 correções | idem | idem | retirada |
| R1 q3(1): uma correção | idem | idem | retirada |
| R1 q3b(b): 4 ritmos de limiar corrigidos | (sem prova no plano) | `REPORTS_CHANGED_SINCE_THE_WEEK_STARTED` | retirada |
| **nova:** relato de aparelho que concorda (mesmos minutos) | retirada | retirada | retirada (conservador) |
| **nova:** mesmo `eventId` reenviado com outro conteúdo, sem `correctionOf` | retirada | retirada | retirada |
| **nova:** relato de aparelho de limiar passado com `conditions: RAIN` | — | retirada | retirada |
| **nova:** pausa de 3 dias na semana passada, declarada na quarta | `BREAK_DECLARED_SINCE_THE_WEEK_STARTED` | idem | retirada |
| **nova:** correção de sessão de força passada | números da segunda | números da segunda | **igual** |
| **nova:** resultado de prova datado da semana passada, declarado na quarta | números da segunda | números da segunda | **igual** (a V1RC lê a partir da semana seguinte) |
| **nova:** cliente edita uma linha passada no `actualLedger` que envia, sem relato | números | números | **digest muda** (B-01) |

São 24 casos, 2 violações, e as duas são a mesma forma (B-01). Nenhuma retirada traz número. A semana seguinte volta a mostrar números lidos do registro reescrito, que é a virada.

**O T5 do autor** agora manda correções e segundas fontes (500 casos). Na minha cópia ele passa (85 de 85), e os mutantes N01 e N10 (a semana nunca retira) morrem por ele e pelo teste do ciclo (seção 4).

**QRE-RFC-B-01 (NOTE, custódia).** Um cliente que reescreve uma linha passada do registro do motor que ele mesmo devolve (sem relato nenhum) muda o `inputDigest` da semana. Na sonda a faixa não muda, porque f satura. O motor aceita a linha alterada: não há fato de relato para a regra do ciclo ver. É a mesma classe da custódia aberta (selos sem chave, registro guardado pelo cliente; SEC-RFC-A-04 a A-07). Fecha com a custódia e a integridade com chave, não nesta fase. Para a Security.

**Fica para o Founder, sem mudança:** a calibração V1RC congelada da semana corrente ainda se move dentro da semana com uma correção. A fase B agora retira a semana nesses casos, e por isso não mostra o número movido.

### QRE-RFC-A-02: fechado para a previsão e os insights

**Leitor da faixa entregue** (`r2/b2-delivered-band.mjs`, atleta de limiar, 10 semanas):
- Cada sessão que vota leu a faixa que o cliente recebeu para ela na própria semana (`runSessions` da olhada daquela semana): **6 de 6 iguais**, sessões por tempo e nativas (`[310,330]` e `[325,360]`).
- Depois de 4 correções de ritmo na semana 10:
  - `runCalibrationOf` das semanas passadas ainda se move (o fato): índice 7 `[310,330]` f0 → `[305,325]` +0,015; índice 8 `[325,360]` → `[320,355]` +0,015;
  - o insight da semana seguinte classifica contra as faixas **entregues**, `[310,330]` e `[325,360]`, todas iguais às mostradas.
- Registro de formatos invertido: insight idêntico (o leitor ordena por `recordedAt` e depois `eventId`).
- Sessão cujas linhas de formato foram tiradas do registro: `NO_BAND_IN_ITS_WEEK`, não vota.
- Linha de formato forjada com hash do conteúdo correto e `eventId` fora do padrão (faixa absurda 360–380):
  - as formas de corrida a nomeiam ilegível;
  - a triagem passa a ser pedida;
  - os insights são retirados (`WARNING_SIGN_SCREEN_REQUIRED`).
  - Uma linha forjada **com** o padrão das formas de corrida é custódia (selo sem chave): B-01 e A-11.
- Qual linha o leitor toma: a última linha de formato daquela sessão registrada **até o dia** em que ela foi corrida. O registro de formatos guarda uma linha por (sessão, formato, settled). Um formato que volta a um valor anterior (A → B → A, sem settled) não ganha linha nova, e aí o leitor leria B. Não consegui produzir esse caso. Fica nas coisas não verificadas, como NOTE.

**Par da resposta** (`r2/b3-pair.mjs`, ponta a ponta, worktree × a cópia do R1):

| Caso | R1 (`400edb7`) | R2 (`0d3015b`) |
|---|---|---|
| A oficial, B oficial (44 dias) | par usado, R_c 0,5225 | **igual** |
| A por GPS (entra MODERATE), B oficial | par usado, R_c 0,5129 | **sem par**, prior 0,5, `NO_ELIGIBLE_EARLIER_REFERENCE` (a leitura mais estrita que o autor declara: vai para o SSCTR) |
| A oficial, B 4 % mais lento | g = 0, `NO_GAIN_LATEST_RESULT_SLOWER` | igual |
| A por GPS, B 4 % mais lento | g = 0 | g = 0 (a desaceleração ainda lê A) |
| A com esforço desconhecido | sem par | igual |

A previsão não relê mais nenhuma calibração de semana passada, a não ser a semana congelada na semana da prova, sob a guarda dela. Conferi por leitura: `K.calAt` só em `raceWeekAt`.

**QRE-RFC-B-03 (NOTE).** A afirmação "a fase B não relê calibração de semana passada" só vale **com a revisão desligada**. `revisionOf` ainda chama `K.warm`/`K.viewOf` (linhas 362–363) para a faixa derivada, o fator e a referência de cada semana; é delas que saem as condições da oferta (fator no teto, faixa derivada). É a classe do A-02 dentro da revisão. Entra na lista de condições dela, antes de qualquer registro habilitador.

### QRE-RFC-A-03: parcial

**Fechado:**
- `q10c-restart-ids.mjs` sem mudança: as sessões `w0-run-d1/d3/d6` do plano novo agora `MISSING_REPORT`, média 0.
- `r2/b4-restart.mjs` (1), restart sem intervalo (depois da revisão de domingo à noite, plano novo na segunda): semanas 0 e 1 só `MISSING_REPORT`, nenhum voto de insight.
- `q10-restart.mjs`: resposta igual às formas de corrida chave a chave; previsão da semana 0 com U = 0.

**QRE-RFC-B-02 (CONDITION): restart no mesmo dia.** `r2/b4-restart.mjs` (2):
1. Plano antigo a partir de 2027-01-04. No domingo 2027-01-10, às 09:00, o atleta relata a semana 0, incluindo a corrida de domingo, `w0-run-d6@2027-01-10`.
2. Às 12:00 faz um restart com o plano novo começando naquele domingo. A semana 0 nova vai de 10 a 16 de janeiro, com `w0-run-d6@2027-01-16`.
3. Na semana 1 do plano novo, sem relato nenhum nele, a semana 0 tem `w0-run-d6: COMPLETED`, a = 0,43 (deveria ser 0).

A causa é que `own()` compara o **dia** do primeiro registro com o **dia** de `canonical.asOf` (`recordedDay(o) >= created`), não instantes. A regra que o autor afirma ("gravada depois de o plano existir") não vale dentro do dia da criação. O alcance é limitado: uma linha gravada no dia da criação, antes dela, e datada na semana 0. A credita uma sessão do plano novo com outra data e outra prescrição. O leitor da faixa entregue tem a mesma granularidade (`day<created`).

**O que fecha:** comparar o instante `provenance.firstRecordedAt` (e o `recordedAt` dos formatos) com o instante da criação do plano. Teste do restart no mesmo dia. Como a previsão é afetada só numa semana e num caso estreito, é CONDITION: antes de integração ou atleta real. Se o Founder quiser fechar antes do freeze, isso pede um sucessor do freeze.

### QRE-RFC-A-05: fechado

`q3c-break.mjs`, sem mudança, para uma pausa de 14 dias declarada na terça da semana índice 3:
- a previsão e os insights ficam `UNAVAILABLE` com `DECLARED_BREAK_OF_14_DAYS_OR_MORE` na própria resposta que declara;
- o mesmo na quinta, nas semanas índice 4 e na segunda da índice 5 (o último dia da pausa);
- depois, `MODE_WALK_JOG_RESTART_RETURN`.

A pausa declarada depois do fato continua coberta pelo modo de retorno.

## 2. Nada regrediu (sondas da R1, sem mudança, no worktree `0d3015b`)

`q3d`, `q3` e `q3b` da R1, sem mudança, agora param com `TypeError`: leem a adesão e os domínios da resposta de quinta, e essa resposta agora é uma retirada sem esses campos. As saídas estão em `probes/r2/out/`. As mesmas formas estão reproduzidas sem essa dependência em `b1-week-stability.mjs` (seção 1).

| Sonda | R1 | R2 |
|---|---|---|
| `q1-examples.mjs` (decisão × oráculo × candidato) | 16 + A4-1/2/3 + i + 9 metas, 0 divergências | **igual** |
| `q2-credit-insights.mjs` (AD-1, PI-1, PR-1..3) | tudo confere | **igual** |
| `q11-random-differential.mjs` | 6.000, 0 divergências | **6.000, 0** |
| `q13`, `q12` (L-4) | — | iguais |
| `q5-composition.mjs`: padrão, previsão e insights, revisão sem revisão, gancho do chamador, desligado | 285 comparações, 0 diferenças | **285, 0**; chaves `DISABLED`/`EXTENSION_NOT_ENABLED` |
| `q10-restart.mjs` | igual às formas de corrida | **igual** |
| `q4-admission.mjs`: 108 jornadas E-01, C-01, C-05, D-01 | 0 violações I-A/I-B/I-C | **0**; controles legítimos votam como antes (6 votos; OK fundido `OFFERED`) |
| `q6-raceweek.mjs`, `q6b` | congelado = semana anterior (2835–3015); 21 mudanças tardias, 0 mostradas alteradas | **igual** |
| `q8-revision-entry.mjs` (revisão ligada) | só formatos de limiar a partir da semana seguinte diferem; A-04 reproduzido | **igual**, inclusive A-04 |
| `q9` | `paceEvidence:false` fora | igual |

**Suítes, uma vez cada:**
- conjunta: **1.535 entradas, 1.534 passam, 1 falha**: `V1RC COACHINGCORE-V1-FREEZE-1 is preserved: every file it binds is byte-identical here`, e nada mais;
- extensão: **85 de 85**;
- `v1rfc-freeze.mjs --preserved`: exit 0 ("nothing outside this extension changed since 3ce14d4").

## 3. O verificador do freeze

Não mudou. O novo `test/v1rfc-cycle.test.mjs` cai no padrão `/v1rfc-*.test.mjs` que `testFiles()` e `isMine` usam, então entra na suíte própria, conta nos arquivos amarrados e não aparece como "fora da extensão". Não vi razão para ensaiar o `--write` de novo: os caminhos e a lógica são os mesmos do ensaio da R1.

Duas observações continuam valendo (A-10):
- os pareceres agora commitados em `phase-b/reviews/` (e estes arquivos meus, quando commitados) passam a ser amarrados pelo freeze;
- um arquivo commitado ali depois do freeze dá DRIFT.

## 4. Mutação dirigida às linhas novas (`r2/tools/`)

Uma cópia `git archive 0d3015b CoachingCore audits`, com os arquivos do diff conferidos byte a byte. Controle verde: 85 de 85. Um mutante morre só por teste que passa no controle.

**18 mutantes: 12 das linhas novas, mais o combinado N13 (rodado à parte), mais 5 sobreviventes da R1. 8 mortos, 10 sobreviventes.**

| Mutante | Resultado | Quem mata |
|---|---|---|
| N01: a semana nunca retira com relatos mudados | morto (4) | teste do ciclo A-01, T5 |
| N09: os insights nunca retiram | morto (3) | ciclo A-01 |
| N10: a previsão nunca retira | morto (2) | ciclo A-01 |
| N06: a pausa só retira antes de começar | morto | ciclo SSCTR-A-01 |
| N07: par de qualquer confiança | morto | teste do par |
| N08: semana de hold creditada | morto | ciclo SSCTR-A-02 |
| N13: as duas guardas do restart tiradas (o comportamento da R1) | morto | ciclo A-03 |
| E08 (R1): gancho do chamador passa | **morto agora** | teste do gancho |
| N02: só a guarda "gravada depois do plano" tirada | sobrevive | — |
| N03: só a guarda "dentro da semana da sessão" tirada | sobrevive | — |
| N04: faixa entregue lida de formato gravado depois da corrida | sobrevive | — |
| N05: domínio da faixa entregue não conferido | sobrevive | — |
| N11: linhas de formato sem selo lidas | sobrevive | — |
| N12: sessão sem faixa entregue vota | sobrevive | — |
| E03, E15, E16, P11 (R1) | sobrevivem | — |

**QRE-RFC-B-04 (NOTE).** As duas guardas do restart só estão provadas juntas (N13 morre; N02 e N03 sobrevivem, cada um sozinho). As regras do leitor da faixa entregue (N04, N05, N11, N12) não têm teste. Nas minhas sondas o candidato faz o certo:
- N03, por `q10c`;
- N12, pela sessão sem formato (`NO_BAND_IN_ITS_WEEK`), em `b2`;
- os 6 de 6 iguais, em `b2`.

Fecha com um teste por regra. Não bloqueia: o comportamento está certo, falta só prendê-lo.

## 5. As condições que o autor deixa abertas

- **A revisão de ritmo não está aprovada e nada diz que falha fechada.** Conferi:
  - ela nasce desligada e sem registro;
  - `v1rfc-freeze.mjs --write` recusa com ela ligada, e `--check` acusa a fronteira mudada;
  - nos três arquivos de runtime, "fail closed" aparece só na ativação por registro e na reconstrução da estimativa, nunca na revisão.
  - O registro do ciclo (seção 4) diz exatamente isso. Os ids que ele lista são de outros juízes e não os reli. Os meus (A-04) estão certos.
- **O que um freeze da previsão e dos insights amarraria, e que o autor não diz:**
  1. O freeze amarra `v1-pace-insights.mjs` e `v1-run-forecast-index.mjs` **inteiros**, com o caminho da revisão dentro. Fechar A-04, as condições de Security e do SSCTR sobre a revisão, ou B-03, exige mudar esses bytes, ou seja, **um freeze sucessor**. Elas podem ficar abertas, mas não podem ser fechadas "dentro" desse freeze.
  2. O runtime liga a revisão com qualquer registro SSCTR independente para `V1X-PACE-REVISION` sobre o hash dos valores, sem conferir os bytes do código (A-10). Um registro desses, escrito sobre os bytes congelados, ligaria a revisão com os defeitos abertos. O freeze e o encerramento devem dizer, por escrito, que **nenhum registro habilitador da revisão pode ser escrito sobre esses bytes**; só sobre um sucessor que feche as condições dela. Com isso, elas podem continuar abertas.
  3. B-03 entra na lista de condições da revisão.
- **Os limites de integração** (QRE-RWS-F-01, hard gate E-1, duas vozes, custódia) estão descritos como abertos e não declarados atendidos. O custo do A-01 (§3 do registro do ciclo: toda segunda fonte depois da virada retira a semana) é exato. Ele aparece em toda a tabela da seção 1 (inclusive o relato que concorda) e deve ser medido na integração.

## 6. Condições deste veredito

| Id | Quando | O quê |
|---|---|---|
| QRE-RFC-B-02 | antes de integração ou atleta real (ou um sucessor do freeze, se o Founder quiser antes) | restart no mesmo dia: comparar instantes, não dias |
| QRE-RFC-A-04, B-03 e as condições da revisão dos outros juízes | antes de qualquer registro habilitador de `V1X-PACE-REVISION` | e nenhum registro dela sobre os bytes deste freeze |
| QRE-RFC-B-01, A-11, A-10 | integração (custódia, Security) | — |
| QRE-RFC-A-06, A-07, A-08 (E03, E15, E16, P11), A-09 | NOTEs | leituras para o SSCTR e testes que faltam |
| Para o Founder | — | a calibração V1RC da semana corrente se move com correção; a colisão de ids das formas de corrida no restart (congelados) |
| Para o SSCTR | — | a leitura nova do par (GPS não forma par), V5 de sessão em conflito, as leituras do ciclo §2 |

## 7. O que rodei; o que não verifiquei

- **Scratch:** `C:\Users\carva\AppData\Local\Temp\claude\858165ffefe5d744\d51449b4-81e7-4282-8dcc-977a9b54a947\scratchpad\judges-b\qre\r2\`.
  - Sondas em `probes/`, mutantes em `tools/`, saídas em `out/`.
  - Cópia de mutação em `mutR2/`; a cópia do R1 (`..\mutA`) serviu só para comparar o par.
  - Copiei sondas, ferramentas e saídas para `probes/r2/` ao lado deste parecer.
- **No worktree:** só leitura, as execuções permitidas e estes arquivos. Nenhum commit, push, stash ou remoção.
- **Não verifiquei:**
  - a volta A → B → A de um formato sem settled no leitor da faixa entregue;
  - uma linha de formato forjada no padrão das formas de corrida;
  - holds clínicos de crédito zero além da leitura de código (é SSCTR-RFC-A-02, de outro juiz);
  - a suíte inteira sob cada mutante;
  - o comportamento real de HealthKit.

## Contexto injetado pelo host

Recebi de novo o CLAUDE.md global, o CLAUDE.md do projeto e o MEMORY.md (os sha256 estão na R1). Não usei nada deles como evidência.
