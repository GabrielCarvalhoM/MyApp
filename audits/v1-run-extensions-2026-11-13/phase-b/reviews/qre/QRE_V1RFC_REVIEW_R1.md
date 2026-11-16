# QRE: V1 Run Extensions, fase B (Race Forecast + Pace Insights), R1

**Veredito: `NOT_READY`.** Três achados BLOCKING, todos reproduzíveis por sonda minha e todos fecháveis só com arquivos desta fase (nenhum pede edição de arquivo congelado para o fechamento mínimo):

- **QRE-RFC-A-01:** a previsão e os insights de uma semana **mudam dentro da semana** por coisas registradas a partir do primeiro dia dela: um segundo relato (aparelho) de sessões passadas e uma correção do atleta. A faixa exibida passa de uma faixa `47:00–51:15` na segunda para `BOTH_RANGES` com a observada `48:30–51:15` na quinta. O T5 do autor só manda primeiros relatos novos.
- **QRE-RFC-A-02:** a checagem (a) do handoff (§9.1), estendida pelo R3 do preflight, **falha**: a faixa de uma semana passada relida depois de uma correção não é a que a semana mostrou. O ponto de parada S6 não foi aplicado, e o registro do autor diz "Confirmada".
- **QRE-RFC-A-03:** depois de um **restart**, as sessões do plano novo são creditadas como `COMPLETED` pelas linhas do plano anterior que têm o mesmo `sessionId` (os ids são relativos ao plano: `w0-run-d1`…). Duas semanas no plano novo sem relato nenhum: adesão média 1.

O que está sólido, com números meus (seções 2 a 8): os 43 casos da decisão reproduzidos por um oráculo meu e pela implementação; 6.000 casos aleatórios do oráculo contra as funções puras sem divergência; a admissão de evidência pelo ponto de entrada sem nenhum vazamento em 108 jornadas (E-01, C-01, C-05, D-01 e as combinações de motivos); a composição chave a chave em 285 comparações; a semana da prova nunca mostrada alterada em 21 mudanças tardias; o verificador do freeze ensaiado num clone.

- **Juiz:** instância nova e independente de Quality & Reliability (claude-opus-5-5, esforço high, como despachado). Não escrevi o candidato, o registro do autor, os testes nem nenhum parecer anterior. Não abri as pastas `reviews/ssctr/` e `reviews/security/` desta rodada (vi só que existem).
- **Data:** 2026-11-16.
- **Versões:** candidato `400edb77d35cb4a1234075c549bff54c9987824b` (HEAD conferido; `git diff --name-only f32a711 400edb7`: os 15 arquivos novos, nada emendado). Base `f32a711` (COACHINGCORE-V1-RUN-FORMAT-FREEZE-2). sha256: `v1-race-forecast.mjs 8ab1815b…`, `v1-pace-insights.mjs 7a9999e2…`, `v1-run-forecast-index.mjs 392b48ca…`, `RACE_FORECAST_EXTENSION_V1.json eae01117…e840` (= o `values` da r2, comparação profunda verdadeira), `v1rfc-freeze.mjs 108a016a…`, `v1rfc-simulate.mjs f5565b19…`, `PHASE_B_CANDIDATE.md f9ace182…`. Decisão r2 `51bec86b…1fe4`.
- **Autoridade nas sondas:** a de desenvolvimento (`devRunForecast`, só previsão e insights; com a revisão só onde digo `DEVR`), sobre a de desenvolvimento das fases anteriores; e a padrão, sem opções, onde digo "padrão". Só dados sintéticos.

## 1. Achados

| Id | Sev. | Resumo | Sonda |
|---|---|---|---|
| **QRE-RFC-A-01** | **BLOCKING** | Previsão e insights mudam dentro da semana por segundo relato e por correção registrados na semana | `q3d-second-source.mjs`, `q3b-temporal.mjs` (a) e (b), `q3-temporal.mjs` |
| **QRE-RFC-A-02** | **BLOCKING** | Checagem (a) + R3 falha; S6 não aplicado; registro do autor inexato | `q3b-temporal.mjs` (b) |
| **QRE-RFC-A-03** | **BLOCKING** | Restart: linhas do plano anterior creditam sessões do plano novo | `q10c-restart-ids.mjs` |
| QRE-RFC-A-04 | CONDITION | Revisão de ritmo: uma correção posterior apaga em silêncio um passo aceito, e uma oferta nova aparece 7 dias depois | `q8-revision-entry.mjs`, `q7-findings.mjs` |
| QRE-RFC-A-05 | CONDITION | Retirada "pausa declarada ≥ 14 dias" não é imediata; insights ativos durante a pausa | `q3c-break.mjs` |
| QRE-RFC-A-06 | NOTE | Sessão concluída e depois em conflito com o aparelho: `MISSING_REPORT` na semana em que o aparelho chega, `UNKNOWN_EXECUTION` depois | `q3d-second-source.mjs`, `q3-temporal.mjs` (3) |
| QRE-RFC-A-07 | NOTE | IC-1 regra 3 pelo ponto de entrada: extensão parcial de etapa WORK não repetida nunca chega (crédito 0) | leitura de `creditInput`; `q2-credit-insights.mjs` (pura) |
| QRE-RFC-A-08 | NOTE | Lacunas de teste mostradas pela mutação (sobreviventes que importam) | seção 7 |
| QRE-RFC-A-09 | NOTE | Simulação: o relato do autor é exato; duas leituras para o SSCTR | `scripts/v1rfc-simulate.mjs` |
| QRE-RFC-A-10 | NOTE | Verificador do freeze: amarra a pasta `phase-b/` inteira; não vê arquivo não rastreado; o registro habilitador amarra só os valores | ensaio, seção 8 |
| QRE-RFC-A-11 | NOTE | Registro de respostas da revisão selado por hash sem chave (para a Security) | leitura; teste do autor |

### QRE-RFC-A-01 — BLOCKING: a semana muda dentro da semana

**O contrato.** `values.forecast.recompute`: "At the week boundary only; withdrawal applies at once". `values.paceInsights.computedAt`: `WEEK_BOUNDARY`. Handoff §4: "Atualização: só na virada da semana". T5 e I9: "linhas com data ou `firstRecordedAt` ≥ corte não mudam a saída da semana". A missão: proteger a correção tardia, e nada datado ou registrado a partir do primeiro dia da semana move a previsão ou os insights dela.

**O que observei** (plano de 10 km, 16 semanas, semanas 1 a 5 como prescritas, olhada na segunda e na quinta da semana 6, índice 5):

| Sonda | O que é registrado na quarta | Segunda | Quinta |
|---|---|---|---|
| `q3d-second-source.mjs` | relato do aparelho (12 min) de cada uma das 12 corridas das semanas 2 a 5 | uma faixa, `[2820, 2940, 3075]`, adesão média 1 | `BOTH_RANGES`: observada `[2910, 3000, 3075]`, cenário `[2835, 2955, 3075]`, adesão média **0** |
| `q3b-temporal.mjs` (a) | correção do atleta (5 min, não concluída) dessas mesmas 12 corridas | `[2820, 2940, 3075]` | `BOTH_RANGES`: `[2910, 3000, 3075]`, média 0,11 |
| `q3-temporal.mjs` (1) | uma correção só | `inputDigest b582901a…`, média 1 | `inputDigest 4a1b5dd4…`, média 0,916 (a faixa não muda só porque f satura) |
| `q3b-temporal.mjs` (b), insights | correção do ritmo de trabalho (325 → 268) de 4 sessões de limiar passadas | limiar `STABLE`, ação `NONE` | `IMPROVING`, ação `EXPLAIN_ONLY` |

**O mecanismo.** `weeksAt`/`plannedRuns` (`v1-run-forecast-index.mjs`) e `insightOf` (`v1-pace-insights.mjs`) leem a linha em vigor **agora** e decidem se ela estava "no registro antes do corte" por `provenance.firstRecordedAt`.
- Uma correção mantém o primeiro instante da cadeia no motor congelado: o conteúdo novo é lido como se estivesse lá na segunda.
- No segundo relato, o motor substitui a linha do app por uma linha em conflito com `firstRecordedAt` = quarta (`2027-02-10T11:00Z`). O app some do registro (`rowsOfSession` só tem `dev-w2-run-d1`), então a sessão, relatada e concluída na segunda, passa a ser lida como `MISSING_REPORT`. **É o T5 ao pé da letra:** uma linha com `firstRecordedAt` ≥ corte muda a saída da semana.

**Por que os testes não pegam.** O T5 do autor (`test/v1rfc-properties.test.mjs:78`, 500 casos) só manda primeiros relatos (`report(...)` sem `correctionOf` e sem segundo autor). O teste de estabilidade da semana (`v1rfc-evidence.test.mjs:134`) faz o mesmo. O caminho da semana da prova já tem a proteção certa (`REPORTS_CHANGED_SINCE_FROZEN`, fatos de relato antes e depois do corte); a semana corrente não tem nenhuma.

**Também observado, e congelado:** a própria calibração V1RC da semana corrente se move dentro da semana com essas correções. Na sonda (b), o limiar vai de `[325,360]` com fator 0 na segunda para `[315,350]` com +0,03 na quinta. É comportamento do V1RC (arquivo congelado), herdado pela fase B pelo `q8Down` da previsão e pelas faixas dos insights. Mudar isso pede arquivo congelado: **escalar ao Founder**. Não é pré-condição do fechamento abaixo.

**O que fecha.**
- A previsão e os insights da semana j leem só o que estava em vigor no corte. Ou, quando os relatos de uma sessão mudaram desde o corte (o mesmo teste que a semana da prova já faz: fato de relato antes e outro depois), a semana mostra uma retirada com motivo até a próxima virada, nunca um número mudado.
- Testes de resultado pelo ponto de entrada, dentro da semana, para correção, segundo relato e conflito, na previsão e nos insights. O T5 estendido a essas formas.
- Escolher entre "manter a leitura anterior" e "retirar até a virada" é uma leitura de produto. Qualquer uma das duas fecha o achado.

### QRE-RFC-A-02 — BLOCKING: a checagem (a) falha com uma correção, e S6 não foi aplicado

**O contrato.** Preflight R3: "o `runCalibrationOf` por semana sem futuro precisa incluir o caso de uma correção gravada depois do início da semana […] Se a faixa passada se mover, a RFC usa o valor registrado ou para (S6)". S6: parada material se alguma checagem (a)–(d) falhar.

**O que observei** (`q3b-temporal.mjs` (b)). Atleta de limiar, semanas 1 a 9 com ritmo de trabalho 325 em pista. Na quarta da semana 10, ele corrige quatro sessões passadas para 268. O `runCalibrationOf` exportado, relido para semanas passadas:

| Semana | Antes da correção | Depois |
|---|---|---|
| índice 6 | `[310,330]`, fator 0 | igual |
| índice 7 | `[310,330]`, fator 0 | **`[305,325]`, +0,015** |
| índice 8 | `[325,360]`, fator 0 | **`[320,355]`, +0,015** |

A semana passada relida não é a que a semana mostrou. O teste do autor para (a) (`v1rfc-entry.test.mjs:231`) relê semanas passadas num registro sem correção nenhuma. O registro do autor (seção 3) diz "(a) Confirmada".

**Onde isso entra na fase B:**
- os insights classificam cada sessão contra "a faixa em vigor na própria semana" refeita agora (`K.viewOf`);
- a elegibilidade da referência A do par é lida da visão da última semana dela;
- a revisão refaz faixa e fator por semana (A-04);
- a semana da prova refaz a semana anterior. Esta está protegida só pelo teste dos fatos de relato, e na seção 5 ela se mostrou robusta.

**O que fecha.** Ou a fase B lê o valor registrado: a faixa como foi entregue, que o registro de formatos já guarda em cada formato emitido, ou um registro por semana. Ou fica escrita uma decisão do Founder com o SSCTR que aceite a releitura (a causa está no V1RC congelado). Nos dois casos, o registro do autor corrigido e um teste da checagem (a) com correção.

### QRE-RFC-A-03 — BLOCKING: restart credita sessões que ninguém fez

**O que observei** (`q10c-restart-ids.mjs`). Plano de 10 km, semanas 1 a 6 como prescritas. `restartProgram` com o registro carregado (pausa declarada, plano novo de 8 semanas a partir de `2027-02-22`): resposta igual à das formas de corrida, previsão da semana 0 com U = 0 (correto). Depois, nenhum relato no plano novo:

- Semana 1 do plano novo: as três corridas da semana 0 (`w0-run-d1`, `w0-run-d3`, `w0-run-d6`), cujos ids coincidem com os do plano anterior, têm crédito 1 `COMPLETED`. A execução que a fase B lê é a de janeiro (`rc-done-w0-run-d1`, do plano anterior).
- Semana 2: as semanas 0 e 1 com `COMPLETED/COMPLETED/COMPLETED`, adesão média 1. Ganho creditado por treino não feito (H_eff 2), na direção otimista da previsão.

**O mecanismo.** `readingOf` faz `bySession` de toda linha viva do atleta, sem conferir que a linha pertence ao plano em vigor (data dentro da semana da sessão, ou depois do início do plano). As formas de corrida congeladas também prendem a execução antiga à sessão nova (`done` por `sessionId`), e a conferência `execution.eventId === row.eventId` da fase B passa. Os insights leem do mesmo jeito: uma sessão de limiar do plano anterior vira sessão do plano novo e é classificada contra a faixa de uma semana do plano novo pelo índice de semana antigo.

**O que fecha.** A fase B só lê, para crédito e para ritmo, a linha cuja data cai na semana da própria sessão do plano em vigor (e nunca antes do início dele). Teste de resultado de restart com ids que coincidem, na previsão e nos insights. A colisão nas formas de corrida congeladas é anterior e fica registrada como condição delas, para o Founder (arquivo congelado).

### QRE-RFC-A-04 — CONDITION: a revisão de ritmo não é estável sob correção

**O que observei** (`q8-revision-entry.mjs`, pelo ponto de entrada, `DEVR`):
- Oferta na semana 9, passo 0,02, aceita. Semanas 10 e 11 dimensionadas a `[305,340]`.
- Na semana 11, o atleta corrige o ritmo de uma sessão que votou (268 → 330).
- Resultado: status `OFFERED`, sem `ENDED`; o `ACCEPT` gravado vira `ignored: NO_SUCH_OFFER_THIS_WEEK`; faixa mostrada `[310,345]`; uma **oferta nova 7 dias depois** do passo anterior (a regra dos 28 dias se perde junto com o passo).

Na função pura (`q7-findings.mjs`), a mesma coisa com uma correção que deixa a sessão excepcional. Com uma correção pequena (288 → 296), o passo se mantém.

**O mecanismo.** O estado é refeito a partir de ids de oferta recalculados, e uma resposta só vale para o id que nomeia. Os formatos já entregues com a faixa efetiva ficam no registro de formatos, e a história passa a dizer que não houve revisão.

**Por que não é BLOCKING.** `V1X-PACE-REVISION` nasce desligado, não entra no freeze (o verificador recusa com ela ligada) e só liga depois da IC-2 e de registro próprio.

**O que fecha, antes de qualquer registro habilitador dela.** Um passo aceito preso ao que foi aceito (a resposta guarda a oferta, ou o estado é chaveado pela resposta e não pela oferta refeita), com teste de resultado de correção e de segundo relato depois da aceitação.

### QRE-RFC-A-05 — CONDITION: a pausa de 14 dias não retira na hora

**O que observei** (`q3c-break.mjs`). Pausa de 14 dias declarada na terça da semana 4 (índice 3), a partir daquele dia:
- a previsão continua `SHOWN` na terça e na quinta;
- só na semana seguinte vira `UNAVAILABLE` (pela estimativa V1RC), e o modo `RETURN` vem depois;
- os insights ficam `ACTIVE` nas semanas 4 e 5, durante a pausa.

**O mecanismo.** A fase B não tem leitura própria da pausa. Ela depende do modo do motor e de o V1RC reter a estimativa.

**O contrato.** `values.forecast.withdrawal` inclui "declared break of 14 days or more", e "withdrawal applies at once". Para os insights, L-9 diz "as mesmas condições". O teste do autor (`v1rfc-entry.test.mjs:172`) cobre só a pausa declarada depois do fato.

**O que fecha.** A retirada lida dos `breaks` do registro (o `breaksOf` já existe) na previsão e, se o SSCTR confirmar L-9, nos insights. Teste de pausa declarada antes e em curso.

### Os NOTEs

- **QRE-RFC-A-06 (V5/L-1).** Sessão relatada e concluída, depois contradita pelo aparelho: `MISSING_REPORT` na semana em que o aparelho chega (a linha nova tem o instante dele) e `UNKNOWN_EXECUTION` depois. Com `unknownSessionCredit = 'ZERO'` as duas dão 0. Com `'EXCLUDED'` divergiriam: a ausente fica no denominador, a desconhecida sai. Some com o fechamento de A-01. A leitura "conflito = V5" fica para o SSCTR.
- **QRE-RFC-A-07 (IC-1, regra 3).** `creditInput` só passa `target`/`measured` quando a sessão inteira é contínua, e marca como "repetição" todo WORK de uma sessão com mais de um WORK. Uma etapa WORK contínua não cumprida (a forma do S4-timeStep), ou uma etapa de pirâmide, ganha 0 em vez de min(1, medido/alvo). O S4 só reproduz na função pura. A direção é conservadora (menos crédito, menos ganho). Leitura de fidelidade para o autor e para o SSCTR.
- **QRE-RFC-A-08 (mutação).** Sobreviventes que importam, seção 7. Nenhum indica defeito de comportamento: em cada um, conferi por sonda que o candidato faz o certo. Mas nada nos testes do autor prende o certo.
- **QRE-RFC-A-09 (simulação).** Rodei `scripts/v1rfc-simulate.mjs` nos dois modos: as saídas são **byte a byte** os arquivos de `audits/v1-race-forecast-2026-11-13/evidence/`. O relato B-3 do autor é exato:
  - `EACH`: 63,8 % no envelope (pedido ≥ 80 %); braço acima do teto 56,6 % (pedido ≥ 60 %; os outros cinco ≥ 62,8 %); verdade mais rápida que a borda rápida no braço sem resposta 14,7 % (pedido ≤ 10 %); os dois critérios de MAPE atendidos.
  - `TOTAL`: 77,55 %, os demais atendidos.
  - A explicação aritmética confere: sem ganho, a cobertura esperada de duas fontes com o desvio de uma é ≈ P(|Z| < 0,906) ≈ 0,64.

  Duas leituras vão para o SSCTR: (i) "borda rápida mais rápida que a verdade ≤ 10 %" foi implementado como "verdade mais rápida que a borda rápida" (a leitura literal é inatingível com cobertura de 80 %); (ii) a cobertura é medida no envelope não arredondado (o mostrado é arredondado para fora, um pouco mais largo) e numa única configuração (dois resultados, semana 7, HIGH, 10K). A simulação roda a função pura, não o ponto de entrada.
- **QRE-RFC-A-10 (freeze).** Seção 8.
- **QRE-RFC-A-11 (Security).** `paceRevisionRecord` é selado por `inputHash` sem chave, como os outros registros: quem conhece o formato forja um `ACCEPT` legível. A custódia está registrada como aberta; isto vai para a revisão de Security em curso, não é achado novo deste diff.

## 2. Cálculos: oráculo meu (`probes/oracle.mjs`, `q1-examples.mjs`, `q2-credit-insights.mjs`, `q11-random-differential.mjs`)

O oráculo lê o `values` da decisão e as fórmulas do handoff. Não importa nada dos testes nem do código do candidato (só o JSON de valores V1RC para os k da lei de potência e o arredondamento). O mecanismo é outro: semanas numeradas pelo calendário, H somado por número de semana, g calculado direto como Γ(RW) − Γ(ref) e conferido contra U + F. As entradas de cada exemplo foram transcritas por mim do texto `inputs` da decisão.

| Grupo | Casos | Resultado |
|---|---|---|
| Previsão a, b, c, d, d2, e1, e2, f, g, h, A1-1, A1-2, A2-1, A2-2, A2-3, A4-1 | 16 | decisão = oráculo = candidato em `forecastSeconds` das duas faixas, `status` de cada faixa, `display`, `flags`, `status` (e2 `WITHHELD_R11_CENTRAL_ABOVE_6H`); R_c, R_hi e g dentro de 6e-6 da decisão; g = U + F exato; classe de confiança |
| A4-1, a exibição da semana da prova | (o mesmo caso) | `SHOWN_FROZEN`, `2820–3075`, rótulo "Forecast of 2027-04-12; not updated in race week", mostrado no sábado, `NOT_SHOWN` no dia da prova |
| A4-2, A4-3 | 2 | `REFERENCE_CHANGED_SINCE_FROZEN`; semana 15 de (h) `TOO_UNCERTAIN_TO_SHOW` → `LAST_FORECAST_NOT_SHOWN` |
| i | 1 | `NOT_YET_IN_WINDOW`, "174 days > 112", `availableFrom 2027-03-08`; semana 10 dentro, semana 9 (118 dias) fora |
| A5 (meta × faixa) | 9 | os 9, inclusivos nas bordas, nunca contra o central |
| AD-1 S1–S6 | 10 + a semana | `c` e regra de cada um (inclusive `S4-timeStep` 0,75, `S5-noWorkSteps` 0,28, `S3-completedFast` 1); semana a 0,8172, f 0,7930, 186/152 min |
| PI-1 (r1) | 1 | `IMPROVING`, mediana 0,0513, MAD 0,00494, nenhuma excepcional, `EXPLAIN_ONLY` |
| PR-1 | 1 | oferta na semana 9, 0,02, a partir de 2027-03-08; faixa 295–315 na semana 10; segundo passo 0,01 na semana 14 (total 0,03), faixa igual 295–315 (o arredondamento absorve); termina em 2027-04-21 `HARDER_THAN_CUE_EXECUTION`, faixa volta a 300–320; nenhuma oferta nas semanas 18 a 21. (Com uma revisão em vigor e uma oferta aberta, o status é `ACTIVE` com `offer`; minha expectativa de `OFFERED` na semana 14 era minha, não da decisão) |
| PR-2, PR-3 | 2 | repetições de 4 min: `INSUFFICIENT_DATA`, `INFORMATIVE_ONLY`; com ≥ 5 min e `IMPROVING`, nunca revisão (`SUGGEST_REPORTING_A_RACE` / `OFFER_V1RC_FIELD_TEST` sem alternativa); meia na trava: `SUGGEST_REPORTING_A_RACE` |
| **Total** | **43** | os 43 reproduzidos |
| Diferencial aleatória semeada (`q11`) | 6.000 | **0 divergências** oráculo × `forecastOf` em `forecastSeconds`, status, `display`, `flags`; 456 casos a ±0,5 p.p. do `wMax`, 227 com o par atualizando R, 114 com desaceleração ≥ 3 %, 2.065 `BOTH_RANGES`, 1.603 coincidentes; g = U + F em todos |

f nas bordas: 0,4999999 → 0; 0,5 → 0; 0,9 → 1; 0,8999999 → 0,99999975 (oráculo e candidato iguais). V5: `ZERO` 0,6, `EXCLUDED` 1, no caso de duas sessões.

## 3. Dependência temporal e reprodutibilidade

- **Falha:** A-01 e A-02.
- **Sólido:**
  - mesmo registro duas vezes, ida e volta por JSON, `actualLedger` e `runFormatRecord` invertidos: `runForecast`, `paceInsights` e `paceRevision` byte a byte iguais (`q3-temporal.mjs` (6));
  - primeiro relato tardio de sessão passada: não move a semana (o teste do autor e as minhas olhadas concordam);
  - semana da prova (seção 5).
- A resposta inteira com os registros invertidos difere: é a ordem do registro de formatos devolvido pelas formas de corrida, não chave desta fase.

## 4. Admissão de evidência (o risco principal): `q4-admission.mjs`

**Desenho.** Atleta de limiar, plano de 16 semanas, limiar das semanas 4 a 9 por tempo com ritmo de trabalho 255 (bem mais rápido que a faixa), esforço 7, `DEVR` (revisão ligada). Todas as combinações de:
- relógio: nenhum, POOR 9 km, OK 6,2 km, OK com `segments: []` (a forma do C-01), parcial;
- correção do próprio atleta: nenhuma, simples, lista gravações, declara com motivo, declara sem motivo, só minutos;
- primeiro relato: simples, ou listando duas gravações;
- re-sincronização do aparelho (a forma do D-01).

São 108 jornadas, e cada resposta passa por três invariantes:

| Invariante | Resultado |
|---|---|
| I-A: nenhuma sessão que vota num insight, e nenhuma sessão de oferta de revisão, é linha retida (`paceWithheld` não nulo, nomeada em `paceEvidenceWithheld`, `paceEvidence === false`) ou de outra linha | **0 violações** em ~756 respostas |
| I-B: toda execução concluída de semana contada terminada tem crédito 1 `COMPLETED` (a admissão nunca tira adesão) | **0 violações** |
| I-C: resposta que não entrega sessões não traz número de previsão, domínio de insight nem oferta | **0 violações** em 6 formas: anterior ao registro, sem `asOf`, formato desconhecido citado (ASK), revisão inválida, e mais duas que entregam sessões e retiram: parada por sintoma (`WARNING_SIGN_SCREEN_REQUIRED`) e elegibilidade clínica (`HOLD`) |

- **A armadilha do E-01:** sessão por tempo, `paceEvidence: null`, `paceWithheld` não nulo, ritmo de trabalho no `actual.work` cru. Excluída em toda combinação: `PACE_EVIDENCE_WITHHELD` com o motivo (`REPORT_NOT_CARRIED`, `SEVERAL_RECORDINGS`, `CORRECTED_MEASUREMENT`, `DISTANCE_DISPUTED`). Nenhuma votou, nenhuma ofertou, a faixa ficou `[325,360]`.
- **Os controles preservam evidência legítima:** atleta só, 6 votos; relógio OK fundido sem correção, `OFFERED`. A exclusão não é por excesso.
- **Execução com `paceEvidence === false` e sem retenção** (`q9-pace-evidence-false.mjs`): uma sessão nativa de limiar com voltas cumpridas e distância total implausível (45 km) tem `paceEvidence: false`, `paceWithheld: null` e não é nomeada. A fase B a exclui (`PACE_EVIDENCE_WITHHELD`, motivo `NOT_PACE_EVIDENCE`). Nenhum teste prende isso (mutante E03, seção 7). O V1RC congelado lê o ritmo dela para o Q8 (anterior, fora desta fase).
- **Calibrações de outras semanas** (`calibrations.calAt`): todas por `F.runCalibrationOf` com `runFormatRecord`. Nenhum caminho da fase B chama `v1-run-calibration.mjs` sobre o registro cru (leitura de código; `grep` só acha `powerLawTime`, `allowsRun` e a autoridade importados de lá).
- **Linhas de relato ilegíveis:** já são retenção de linha inteira das formas de corrida (`REPORTS_UNREADABLE`) e, na fase B, retirada por triagem pedida. Não exercitei à parte.

## 5. Composição (`q5-composition.mjs`, `q10-restart.mjs`, `q8-revision-entry.mjs`)

| Comparação | Resultado |
|---|---|
| Sem opções (autoridade padrão) × `v1-run-format-index` sem opções, toda resposta de duas jornadas (56 revisões: correção, segundo relato, semana perdida, doença, parada por sintoma, nativas, prova de preparação, até o dia da prova) | iguais chave a chave; as três chaves novas `DISABLED`/`EXTENSION_NOT_ENABLED`; `paceRevisionRecord` devolvido como veio |
| Previsão e insights ligados | iguais chave a chave |
| Revisão ligada, sem revisão em vigor | iguais |
| Gancho `BAND_OF` passado pelo chamador (faixas absurdas) | iguais: o gancho é retirado (mas nenhum teste do autor o prova: E08) |
| `paceRevisionResponse` e `paceRevisionRecord` na revisão | o motor nunca os vê (`inputHash` igual) |
| `generateProgram`, `restartProgram` (com plano, nos três modos) | iguais; previsão do restart na semana 0, U = 0, observada `NOT_ENOUGH_HISTORY`; respostas carregadas devolvidas |
| **Total** | **285 comparações, 0 diferenças** |

**Com a revisão aceita** (`q8`): só diferem `runSessions`, `runFormatRecord` e `runFormat.native`/`time`, e só nas sessões de limiar a partir da semana seguinte à aceitação (`w10`, `w11` na resposta da aceitação; `w10` a `w12` depois). A calibração e o motor são iguais em todas, e a faixa mostrada (`[305,340]`) é a do seletor. Uma resposta sob instante anterior ao registro não é gravada.

## 6. A revisão de ritmo (`paceRevisionOf`)

**Conferi:**
- PR-1 inteiro (seção 2);
- cada fim que a PR-1 e as sondas exercitam: mais dura que a dica, taper, revogação (teste do autor);
- os 28 dias entre passos e a trava de 3 %;
- o passo limitado a 2 %, e a sobra até 3 %;
- recusa de resposta que não nomeia a oferta da semana;
- uma resposta lida uma vez só (teste do autor);
- nada vaza para calibração, estimativas ou previsão (a calibração é igual com e sem revisão em todas as respostas de `q8`; a previsão não lê a revisão).

**Falha:** A-04 (replay sob correção). Leituras que vão para o SSCTR: L-11, L-12, L-13.

## 7. Mutação (`tools/mutants.mjs`, `tools/mutate.mjs`)

Três cópias por `git archive 400edb7 CoachingCore audits` no meu scratch, mais `node_modules`; os 15 arquivos conferidos byte a byte contra o worktree. Cada mutante troca um texto que aparece uma vez só (o script confere), roda os 78 testes da extensão e devolve os bytes originais, conferidos por sha256. Um mutante morre só por teste que passa no controle. **Controle verde nas três cópias: 78 de 78.**

**67 mutantes, 46 mortos, 21 sobreviventes, 0 erros.** Por arquivo:

| Arquivo | Mutantes | Mortos |
|---|---|---|
| `v1-race-forecast.mjs` | 25 | 17 |
| `v1-pace-insights.mjs` | 19 | 16 |
| `v1-run-forecast-index.mjs` | 23 | 13 |

**Mortos (os que importam ao risco principal):**
- E01: a admissão ignora toda retenção (o E-01 reaberto);
- E05: crédito pelo `actual.completed` cru (o C-01/I5);
- E06: UNKNOWN e conflito creditados;
- E07: adesão lê primeiro relato tardio;
- E09: chaves da revisão chegam ao motor;
- E10 e R17: a semana da prova ignora mudanças;
- E13: respostas inertes lidas (o C-05);
- E14: linha de resposta sem selo lida;
- E22 e E23: a IC-2;
- P01: os insights ignoram a admissão;
- P16: os insights leem linha registrada depois do corte;
- R01, R02, R25: AD-1;
- R04 e R15: a regra A1;
- R06, R07, R08: as bordas;
- R14: O contado duas vezes.

**Sobreviventes:**

| Grupo | Mutantes | Juízo |
|---|---|---|
| Equivalentes (para entradas reais) | R03 (f(0,9) já é 1 pela reta), R12 (com f = 1 os triplos são idênticos), E02 (a lista e `paceWithheld` dão o mesmo motivo), E04 (uma linha viva por sessão no motor) | sem ação |
| **Guardas da fronteira de evidência sem teste** (o candidato está certo por sonda minha) | **E03** (`paceEvidence === false` admitido: forma alcançável, `q9`), **E08** (gancho `BAND_OF` do chamador passa: `q5`), **P11** (ritmo retido chega à regra "duas sessões mais lentas" da revisão), **E15** (resposta sob instante anterior ao registro gravada) | **importam**: uma mudança futura reabriria a fronteira calada |
| Regras de valor sem teste (o candidato está certo por leitura ou sonda) | **E16** (NOVICE gravado lido como declarado, L-4: certo por `q12-experience.mjs`, que dá `UNKNOWN_READ_AS_EXPERIENCED` e faixa `[2865,2970,3075]`), E17 e E18 (elegibilidade do par: margem; pausa entre A e B), R21 (par com menos de 28 dias: `q13`, não usado), E21 (sessão movida ou opcional contada como planejada, L-2), P10 (resposta adversa a 4–7 dias da oferta), E11 (reconstrução da estimativa não conferida, falha fechada) | importam para o freeze: a SSCTR e o autor devem saber que esses valores não têm teste |
| Fronteiras sem exemplo | R09 (largura +1 p.p.: a diferencial `q11` cobre 456 casos a ±0,5 p.p. e concorda), R16 (meta igual à borda: `INSIDE_RANGE` nas duas bordas, `q13`), R18 (semana da prova com g = 0: `LAST_FORECAST_HAD_NO_GAIN`, `q13`), R20 (R-11 em 6:01 em vez de 6:00), R22 (R_c sem corte: difícil de alcançar), P12 (largura mínima nunca atua nos testes) | NOTE |

R20 mostra uma leitura para o SSCTR. O R-11 é testado no central **arredondado**: um central de maratona de 6:00:29 não arredondado aparece (`q13`: 21.629 s → `SHOWN`; 21.631 s → `WITHHELD_R11_CENTRAL_ABOVE_6H`). O valor diz "marathon central above 6:00:00".

## 8. O verificador do freeze (`scripts/v1rfc-freeze.mjs`)

- **`--preserved` no worktree:** exit 0. "COACHINGCORE-V1-RUN-FORMAT-FREEZE-2: preserved (98 added files match; 1 amended file matches its recorded diff (22+/10-); FREEZE-1 197/197; RUN-CALIBRATION-FREEZE-1 30/30); nothing outside this extension changed since 3ce14d4". `v1rws-freeze.mjs --check 2`: exit 0.
- **Ensaio num clone meu** (`git -c core.longpaths=true clone`, checkout `400edb7`), com um registro habilitador **só de ensaio**, rotulado assim, para FORECAST e INSIGHTS, commitado no clone:

| Passo | Resultado |
|---|---|
| `--write 1 --commit HEAD` | exit 0; rodou a suíte conjunta (1.528, 1.527 passam, a única falha a histórica, por nome) e a da extensão (78/78); registro com 16 arquivos, fronteiras `FORECAST/INSIGHTS true`, `REVISION false`, sha do registro habilitador |
| `--check 1` logo depois | exit 0 |
| arquivo do runtime alterado | DRIFT, nomeia `v1-pace-insights.mjs` |
| arquivo congelado alterado (`v1-run-calibration.mjs`) | DRIFT: o V1RWS-2 não preservado e "(outside this extension)" |
| arquivo novo não rastreado em `phase-b/` | **exit 0** (não é visto) |
| o mesmo arquivo rastreado | DRIFT |
| `--write 1` de novo | recusa: "a freeze record is never rewritten" |

**QRE-RFC-A-10 (NOTE).** O verificador faz o que diz. Três observações:
- O `ADDED` amarra `audits/v1-run-extensions-2026-11-13/phase-b` inteiro. Pareceres, encerramento e qualquer arquivo commitado ali depois do freeze dão DRIFT no `--check`: commitar tudo antes do freeze ou amarrar só o registro habilitador.
- Arquivos não rastreados ficam invisíveis ao `--check` e ao `--preserved` (usam `git ls-files`/`git diff`).
- Como no V1RWS (QRE-RWS-F-05), o registro habilitador amarra só o hash dos valores: o runtime liga a fronteira com quaisquer bytes de código.

Para o ensaio usei `-c commit.gpgsign=false` no commit do clone de rascunho; nada foi commitado no worktree.

## 9. Os achados e as leituras do autor (`PHASE_B_CANDIDATE.md`), como fato

| Item | Meu juízo de fato | Evidência | Para o SSCTR? |
|---|---|---|---|
| B-1 | **Confirmado.** Só um resultado antes do plano: `SHOWN` nas semanas 1 a 8, estimativa `LOW` e `TOO_UNCERTAIN_TO_SHOW` da semana 9 (índice 8) até a 15; `RACE_WEEK` na 16 | `q7-findings.mjs` B1 | sim (consequência de produto) |
| B-2 | **Confirmado.** O motor gera 4, 8, 12 e 16 semanas; 18, 20, 24 e 26 dão `INVALID_INPUT`. `NOT_YET_IN_WINDOW` só existe na função pura | `q7` B2; exemplo i (seção 2) | não |
| B-3 | **Confirmado byte a byte** (A-09) | `scripts/v1rfc-simulate.mjs` nos dois modos | sim (se bloqueia, e as duas leituras de A-09) |
| B-4 | **Confirmado:** o termo só está nas razões de recusa; nenhuma saída minha o tem | `q7` B4; T13 do autor | não |
| B-5 | **Confirmado:** três sessões FASTER e a última a 350 s/km (excepcional, não vota) → `IMPROVING` | `q7` B5 | sim |
| V5 | **Confirmado** que `ZERO` está ativo e `EXCLUDED` implementado (0,6 × 1 no caso de duas sessões) | `q2` | sim (decide) |
| L-1 | **Parcial:** vale quando os dois relatos chegam juntos; quando o aparelho chega depois, a sessão é `MISSING_REPORT` naquela semana (A-06) | `q3`, `q3d` | sim |
| L-2 | Confirmado por leitura (`plannedRuns`, `creditInput`): sessão `SKIPPED` relatada lê o predicado SC-1 da linha do motor | código | sim |
| L-3 | Confirmado: `extentKm`/`targetKm`; `extentFraction` nunca lido | código; teste do autor | não |
| L-4 | Confirmado: sem classe declarada nem meses, lê `EXPERIENCED`; com classe declarada, a do plano (as jornadas INTERMEDIATE reproduzem o exemplo a) | código; `q3` | sim |
| L-5 | Confirmado (`authorityOf`) | código | não |
| L-6 | Confirmado (`WEEK_NOT_STARTED`) | código | não |
| L-7 | Confirmado por leitura; a elegibilidade de A é relida da semana dela, então herda A-02 | código | sim |
| L-8 | **Confirmado e robusto:** o congelado é o que a semana anterior à da prova (índice 14, TAPER) mostrou (2835–3015). Das 20 mudanças tardias isoladas: 18 `REPORTS_CHANGED_SINCE_FROZEN` (cada corrida dos índices 9 a 13 corrigida sozinha, por tempo e nativas, e um relato de aparelho para cada corrida do índice 13), 1 `BREAK_DECLARED_SINCE_FROZEN`, 1 mostrada sem mudança (resultado tardio, que só vale a partir da semana seguinte). O lote de correções também `NOT_SHOWN`. Nenhuma mostrada alterada (21 mudanças ao todo) | `q6-raceweek.mjs`, `q6b` | não |
| L-9 | Confirmado por leitura; falta a pausa (A-05) | código; `q3c` | sim |
| L-10 | Confirmado (`NONE`) | código | sim |
| L-11 | Confirmado por leitura (toda virada a partir de 56 dias) | código | sim |
| L-12 | Confirmado: `GOOD` ou `OK` aceitos; o valor diz "GOOD (not merely not poor)" | código | **sim** |
| L-13 | Confirmado: a regra lê o RPE de toda linha, retida ou não | código; I-A não é afetada (é uma restrição) | sim |
| L-14 | Confirmado. Efeito medido: as sessões nativas de limiar com voltas de 1.200 m (etapa < 300 s) saem dos insights por `WORK_BOUTS_SHORTER_THAN_5_MIN`, enquanto o V1RC as lê para o Q8 pelos `workMinutes` planejados | `q9` (`plainLaps`) | **sim** |
| L-15 | Confirmado (e2) | seção 2 | não |
| Seção 3 (a) | **Refutado** com correção: A-02 | `q3b` (b) | — |
| Seção 6 (revisão observacional) | Confirmado: sem registro dela, `INERT`, nada oferecido nem gravado, faixa V1RC (A-04 vale só com ela ligada) | `q5` modo `DEVF`; teste do autor | — |
| Seção 8 (T5 500 casos) | Os 500 casos passam, mas não cobrem correção nem segundo relato (A-01) | — | — |

## 10. Suítes (formalmente, uma vez cada)

| Execução | Resultado |
|---|---|
| Conjunta, `node --test` em `CoachingCore/`, worktree `400edb7` | **1.528 entradas, 1.527 passam, 1 falha**: `V1RC COACHINGCORE-V1-FREEZE-1 is preserved: every file it binds is byte-identical here` (`test/v1rc-calibration.test.mjs:325`), `actual: ['CoachingCore/src/r6-adaptation.mjs']` e nada mais. 178 s. **É como descrito**: a suíte conjunta não é verde nesta linha, e a única falha é a histórica, por nome |
| Extensão, `node --test test/v1rfc-*.test.mjs` | 78 de 78 (40 s) |

Não rodei `npm run verify`, nenhum `verify-r*`, nem `v1rc-journeys`/`v1rc-fuzz`.

## 11. Security e SSCTR

- **Security.** Não é preciso outra revisão focal além da que está em curso. Esta fase só grava `paceRevisionRecord`; a previsão e os insights não guardam nada (conferido: os registros devolvidos são os das formas de corrida em todas as 285 comparações). A revisão em curso deve cobrir:
  - a custódia desse registro (A-11);
  - a incoerência registro × história refeita (A-04);
  - o fato de o registro habilitador amarrar só os valores (A-10).
- **SSCTR**, por item:
  - V5 e L-1 (e A-06), L-2, L-4, L-7, L-9 (e se os insights retiram na pausa, A-05), L-10, L-11, L-12, L-13, L-14;
  - B-1, B-3 (se a simulação bloqueia, e as duas leituras de A-09), B-5;
  - a leitura de fidelidade de A-07;
  - o R-11 no central arredondado (seção 7, R20);
  - a escolha "manter a leitura anterior" ou "retirar até a virada" em A-01 (com o Product);
  - em A-02, se aceita a releitura de semanas passadas.
- **Founder:**
  - a calibração V1RC congelada se move dentro da semana com correções (A-01);
  - a colisão de ids de sessão no restart dentro das formas de corrida congeladas (A-03);
  - ambas pedem arquivo congelado.

## 12. O que rodei e onde; o que não verifiquei

- **Scratch:** `C:\Users\carva\AppData\Local\Temp\claude\858165ffefe5d744\d51449b4-81e7-4282-8dcc-977a9b54a947\scratchpad\judges-b\qre\`.
  - Sondas em `probes/`, ferramentas em `tools/`, saídas em `out/`.
  - Cópias de mutação `mutA/`, `mutB/`, `mutC/`. `mut1/` a `mut3/` são uma primeira tentativa de cópia que falhou e ficou como está, sem uso.
  - Clone de ensaio `clone1/`.
  - Copiei sondas, ferramentas e saídas pequenas para `probes/` ao lado deste parecer. As sondas leem o worktree por URL (`WT` no ambiente muda o alvo).
- **No worktree:** só leitura, as execuções permitidas e estes dois arquivos mais `probes/`. Nenhum commit, push, troca de branch ou stash. Nenhuma remoção.
- **Não verifiquei:**
  - meia e maratona ponta a ponta além do exemplo e2;
  - `TOO_UNCERTAIN` × semana da prova ponta a ponta além de A4-3 na função pura;
  - a revisão com segundo relato depois da aceitação (só a correção);
  - linhas de relato ilegíveis à parte;
  - a suíte inteira sob cada mutante (rodei os 78 da extensão);
  - o comportamento real de HealthKit;
  - os valores e as leituras esportivas, que são do SSCTR.

## Contexto injetado pelo host

O host injetou no meu contexto o CLAUDE.md global, o CLAUDE.md do projeto e o MEMORY.md, que resumem rodadas anteriores e nomes de achados. Nada disso foi usado como evidência.

| Arquivo | sha256 |
|---|---|
| CLAUDE.md global (`C:/Users/carva/.claude/CLAUDE.md`) | `c75718d0d2fe2cce1332cf7240ef0b8013ca2901d52b4d6778480c1c333709c6` |
| CLAUDE.md do projeto (`C:/Users/carva/Desktop/myApp/MyApp/CLAUDE.md`) | `e657d059e06fd1a21613250753a8c79ac605b69d955191d634966b3c8fc922e6` |
| MEMORY.md (`C:/Users/carva/.claude/projects/C--Users-carva-Desktop-myApp-MyApp/memory/MEMORY.md`) | `be12c509c2132683fa870a31ce030780201e36aac26617765e13da77478f3d9a` |
