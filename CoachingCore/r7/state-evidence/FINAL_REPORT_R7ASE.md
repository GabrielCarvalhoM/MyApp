# COACHING CORE — STATE EVIDENCE MODEL — Relatório final

**Resultado:** `STATE_EVIDENCE_MODEL = NOT_READY`, encerrado com blocker explícito (Founder §27, §32):
- `NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION`;
- `R7A_EXIT_READINESS = NOT_READY`.

**Estado dos blockers:**
- **QE-R7AB-01:** fechado no seu caminho registrado. No P40, nos quatro fusos, a primeira interrupção da célula não revisada começa onde o controle revisado começa: os 20 kg levantados. O plano continua projetando 22 kg.
- **O que segura o NOT_READY:** o juiz de engenharia achou duas manifestações materiais equivalentes (§28, §29):
  - **QE-R7ASE-01:** ao levantar uma carga projetada, a história leva junto o load tick que só a projeção contou;
  - **QE-R7ASE-02:** o predicado de restabelecimento D52 do planner lê uma data de última execução que só a projeção fez.
- **SSCTR: ACCEPT.** Aprova a carga e o alvo de repetições da dose levantada. Não aprova o tick como história (NF-R7ASE-3, o mesmo átomo do QE-R7ASE-01).

Não há ciclo de correção depois do freeze: a decisão volta ao Founder. O R7-B0 não começou.

| Item | Estado |
|---|---|
| Freeze único | STATE-EVIDENCE-FREEZE-1, digest de fonte `692483ce5147d90797441baf2ac73c9d433197bd40047f147202ca4e4bff2cc1`. Arquivo `CoachingCore/r7/state-evidence/RUNTIME_FREEZE_STATE_EVIDENCE.json` (`a8683cba…`, 82 arquivos) |
| Delta do R7A-BOUNDARY-FINAL-FREEZE | Mudaram `src/r6-adaptation.mjs`, `src/r6-composition.mjs`, `src/r6-program.mjs` e `test/r7ab-week-start-authority.test.mjs` (três casos marcados `State evidence`). Novo: `test/r7ase-state-evidence.test.mjs` |
| Política | R6-POLICY-5 `18ec48f3…`, inalterada |
| Testes | 555/555 (540 anteriores, 15 novos; Node v24.19.0). 10 dos 15 novos falham no R7A-BOUNDARY-FINAL-FREEZE |
| Mutação (só esta semântica) | 23 de 23 pegos |
| Self-challenge | 12 classes: 0 violações no freeze, 52 no R7A-BOUNDARY-FINAL-FREEZE |
| Regressão contra o R7A-BOUNDARY-FINAL-FREEZE | Idênticos: R5 24/24, perfis 16/16, simulações 14/14. R6 holdout 33/35 (H17 e H26 nomeados) |
| Evidência no freeze | 96 execuções, 0 falhas, digest igual antes e depois de cada uma. 75 de 95 saídas byte a byte iguais; 20 com diferença nomeada |
| Juízes no STATE-EVIDENCE-FREEZE-1 | Engenharia **NOT_READY** (QE-R7ASE-01 e QE-R7ASE-02: MEDIUM, materiais). SSCTR **ACCEPT** |
| Fila humana | 187 → 199 (12 itens HQ-R7ASE-SSCTR-*, append-only, funding NOT_DECLARED) |
| Próxima missão | `FOUNDER_ARCHITECTURAL_DECISION` (não iniciada) |

## 1. Baseline

Reproduzido antes de qualquer edição (Founder §4; `audits/domain-coaching-r7a-state-evidence-2026-10-28/probes/baseline/`):
- **R7A-BOUNDARY-FINAL-FREEZE:** digest recomputado `36a71ca8…`, 0 de 81 arquivos com drift. Política `18ec48f3…`.
- **Verificação e testes:** `verify-r7ab.mjs` read-only 17/17; `node --test` 540/540.
- **Proteção:** `BASELINE.json` liga 2.862 arquivos protegidos. `boundary-freeze-source/` guarda o runtime do R7A-BOUNDARY-FINAL-FREEZE byte a byte (81 arquivos).

Nenhum freeze, hash, veredito ou relatório anterior foi reescrito. Os verificadores históricos não rodaram em modo de escrita.

## 2. QE-R7AB-01

**Reprodução (antes):** o P40 do juiz sai byte-idêntico (`b76b8259…`). A célula U começa a primeira interrupção do programa na semana 4 (`WEEK_EVIDENCE`) com `db-rdl` e `db-split-squat` a 22 kg, nunca levantados; o controle R começa em 20. P40b, P40c, P41 e P47b também saem byte-idênticos.

**Causa:** a autoridade pertencia ao contêiner (o início da semana, por esporte), não ao valor. A revisão semanal, ou qualquer handler que aplica a regra dela, monta o início da semana seguinte sobre o início armazenado. Assim, copiava como evidência todo valor que sua evidência não moveu, mesmo quando esse início era uma projeção que o atleta não executou.

**No freeze:**
- **P40, nos quatro fusos:** U = R nas duas variantes (diff de entrada vazio). O plano continua prescrevendo 22 kg (histórico 20, projetado 22: §3, §18).
- **P40c:** o teto MODERATE é a carga levantada, 20.
- **P41:** sem contagens nunca executadas.
- **P44:** U = R; o agachamento entra com a última execução real.
- **P47b:** igual ao controle.
- **P40b:** toda diferença restante entre U e R deixa U atrás de R, ou vem de fatos diferentes (o atleta de U levantou os 22 kg que o plano de U prescreveu).

## 3. Modelo escolhido

`STATE_EVIDENCE_AUTHORITY = VALUE_SCOPED`, a decisão do Founder (§0), aplicada como dada. Contrato: `audits/domain-coaching-r7a-state-evidence-2026-10-28/STATE_EVIDENCE_CONTRACT.md` (R7ASE-STATE-EVIDENCE-1).

Um registro, duas visões:

| Visão | O que é | Quem lê |
|---|---|---|
| **Planejamento** | O início armazenado de cada semana (`stateTrace[k]`), como antes: estado, fatos e projeções juntos | O planner (inalterado): transição para a semana seguinte, composição, linhas, limiar de restabelecimento, contadores, caps, semana de prova |
| **Histórico** | `historicalView(ctx,{cut,…})(k)`: o estado do atleta no início da semana k, valor a valor, e por que cada valor vale | A história: o estado na interrupção (`stateAtBreak`) e, por ele, a entrada e os tetos de todo retorno, a checagem de evidência tardia (`staleReturn`) e o registro dos valores que uma revisão carregou de uma projeção (`projectedBaseOf`) |

Não houve novo planner, Adaptive Engine, event sourcing, banco temporal, graph state, política esportiva, repertório, pace, maratona, archetypes ou athlete learning (§7).

**Uma revisão antes do freeze.** A primeira construção fazia a revisão semanal montar a semana seguinte sobre o histórico. O holdout R6-H35 mostrou que isso muda o planejamento, que §15 e §16 excluem: o planner voltou a ser exatamente o anterior, e só a história passou a ser por valor.

**Granularidade:**
- um valor por exercício de força;
- um valor para todo o estado de corrida, que é uma máquina acoplada: um modo, e passos de longão, easy e qualidade que dividem a regra de um passo por semana e os caps.

Não houve associação mais fina que isso (§12).

## 4. State atoms afetados

- **Força, por exercício:** carga, repetições, séries, load ticks, return step, caps, data da última execução, última contagem executada.
- **Corrida:** o estado inteiro (modo, passos, contagens, longão), como um valor.
- **Contadores de esporte que nenhuma regra lê** (a contagem de desenvolvimento de força): seguem o início do seu esporte.
- **Registro novo (§10):**
  - `startAuthority.STRENGTH.values`: a premissa de cada exercício que a projeção assumiu;
  - `startAuthority.{RUN,STRENGTH}.projectedBase`: os valores que uma revisão carregou de uma projeção;
  - `interruption.stateAt.values`: base e semana de cada valor, com `rebuilt: true` quando reconstruído sobre a história.

Código alterado:
- `src/r6-adaptation.mjs`: `historicalView`, `stateAtBreak`, `projectedBaseOf`, `evidenceStart`;
- `src/r6-program.mjs`: `exercisePremiseOf`, `projectedStart`, `anchoredStart` e o fato de carga em `strengthAtBreak`;
- `src/r6-composition.mjs`: `composeWeeks`, que registra `projectedBase`.

## 5. Historical vs projected

O valor histórico de cada valor no início da semana k (contrato §4):

| Parte do início | O valor é histórico quando | Senão |
|---|---|---|
| INTAKE (semana 0) | sempre | — |
| RETURN_ENTRY definido antes do corte | sempre (a entrada é calculada da história) | — |
| WEEK_EVIDENCE definido antes do corte | o início anterior tinha esse valor como armazenado (`held`: da semana k−1 e não reconstruído) | **reconstruído**: a mesma regra da revisão, com a mesma evidência da semana, aplicada ao valor histórico |
| CONDITIONAL_PLAN definido antes do corte | a base do próprio valor era histórica em k−1 **e** a semana anterior executou o esporte como a projeção assumiu | o valor histórico de k−1 com os fatos da semana k−1; um valor de corrida mantém o estado |
| qualquer parte definida no corte ou depois | nunca (B11) | como acima |

O planner continua lendo o início armazenado. A história nunca lê uma projeção como fato, quem quer que a tenha armazenado.

## 6. Promotion rules

Uma projeção só vira fato por uma origem autorizada (§11):
- **Execução completa (COMPLETED_SESSIONS), por esporte:** a semana anterior executou todas as linhas do esporte como assumido. Para força, isso vale por exercício: a premissa de cada exercício, inclusive um que uma adaptação removeu depois; o gate ADVANCE ou EARNED; o log decisivo, sem carga que a revisão adotaria abaixo da assumida. Cada valor precisa ainda da própria base histórica (SSCTR S-A; R7-A final P5).
- **A regra da revisão semanal aplicada a evidência:** WEEK_EVIDENCE, reconstruída sobre a história quando a revisão carregou uma projeção.
- **Uma dose projetada que o atleta levantou exatamente** (§5 do contrato): a dose é fato.
- **Uma correção histórica:** ver o item 8.

Nunca promovem (§11, I1, I3, I8): passagem do tempo, virada de semana, persistência, criação de fronteira, revisão não relacionada, revisão de outro esporte, ou o valor apenas existir numa base projetada. Evidência sobre um exercício ou esporte não promove outro (I4, P3).

Fronteiras declaradas (contrato §7):
- **E1:** o planner lê a visão de planejamento.
- **E2:** um valor de corrida lido através de uma semana não revisada não é re-gateado.
- **E3:** execução completa verifica o esporte só com a semana inteira.
- **E4:** um valor reconstruído lê a evidência no corte.
- **E5:** semanas nunca reportadas não são história.
- **E6:** um handler que aplica a regra da revisão no último dia da semana é a revisão desse esporte.

## 7. Partial evidence

Evidência parcial permanece parcial (§13; contrato §5):
- **Carga ilegível:** uma carga em unidade desconhecida não é carga. Fica a última conhecida, nunca a planejada. Um gate que avançou sem log utilizável não verifica a projeção.
- **Repetições não logadas:** deixam o alvo.
- **Contagem não executada:** nunca é contada.
- **Carga conhecida levantada é a carga (P5):** mais leve (alvo 22, executado 21: histórico 21), ou mais pesada com o alvo da linha cumprido (regra de adoção D44). Uma linha guiada por esforço, cujo valor conhecido é um teto, não adota nada (SSCTR S-B).
- **Dose projetada levantada exatamente:** carga, repetições e ticks dessa dose, sem misturar um tick contado em outra carga (P41: 85 kg, não 87,5). Com repetições não logadas, a carga levantada continua sendo o fato, e as repetições ficam o alvo dessa carga.
- **Data da última execução:** sempre a data executada, nunca a planejada.

## 8. Corrections

Uma correção é fato (I6, P6). O relato corrigido substitui o que ele corrige em toda leitura posterior. Uma projeção que ele deixa de sustentar deixa de ser verificada, e ele não promove mais nada (teste "family J"; self-challenge C8: rebaixar é permitido, promover não).

## 9. Invariants (I1–I11)

| Invariante | Testes (`test/r7ase-state-evidence.test.mjs`, e casos marcados `State evidence` em `test/r7ab-week-start-authority.test.mjs`) | Self-challenge |
|---|---|---|
| I1 projeção não é evidência; I2 sem promoção por contêiner; I9 a revisão não promove valores intocados | "§18 P40"; "I9 (two steps)" | C1 (16 células), C7, C12 |
| I3 promoção pertinente ao valor | "I2, I3"; "I3 (a gate is evidence)"; "family C, completed sessions"; "family C unreviewed" | C3, C7 |
| I4 evidência não relacionada isolada | "families D, E"; boundary "I4" | C4, C5 |
| I5 parcial permanece parcial | "family C"; "family C unreviewed" | C3 |
| I6 correção histórica | "family J" | C8 |
| I7 o planejamento projeta livremente | "I7, I10"; todas as suítes R7-A | C1 (início de planejamento mantido) |
| I8 a virada de semana não promove | "families G, K" | C2, C6, C11 |
| I10 semântica de retorno preservada | "I7, I10"; todas as suítes R7-A; D53, D56–D59 | C10 |
| I11 nada de aprendizado a partir de projeção | "I11" (o modelo do atleta só lê observações reportadas) | — |

## 10. Properties (P1–P7)

| Propriedade | Onde |
|---|---|
| P1 persistência; P2 passagem do tempo | "families G, K"; self-challenge C2, C6 |
| P3 evidência não relacionada | "families D, E"; C4, C5 |
| P4 execução relevante | "families B, I"; "§8 last performed date" |
| P5 execução diferente (alvo 22, executado 21: histórico 21) | "P5"; C9 |
| P6 correção | "family J"; C8 |
| P7 independência de ordem | "families G, K"; C11 |

**Auditoria de consumidores (§21):** `dossier/CONSUMER_AUDIT_R7ASE.md`. Nenhum consumidor histórico lê a visão de planejamento a não ser por `historicalView`. O mesmo padrão apareceu em quatro pontos, e os quatro foram corrigidos antes do freeze:
- `historicalWeekStart`;
- o fato de carga em `strengthAtBreak`;
- a data da última execução;
- um log em unidade desconhecida que verificava a projeção.

**Self-challenge (§22):** `probes/r7ase-self-challenge.mjs`, 12 classes com o oráculo SAME-FACTS (U não pode estar mais adiantado que o controle revisado R onde os ledgers coincidem). Dá 0 violações no freeze e 52 na cópia do R7A-BOUNDARY-FINAL-FREEZE.

## 11. Regressions

Comparação com o R7A-BOUNDARY-FINAL-FREEZE (`CoachingCore/r7/state-evidence/REGRESSION_R7ASE.json`):
- **Idênticos:** R5 24/24, perfis 16/16, simulações 14/14.
- **R6 holdout 33/35.** R6-H17 e R6-H26 diferem só na entrada de um retorno e nas semanas que ele planeja. A causa: semanas nunca reportadas deixaram de contar como executadas (E5; §13 para cargas não logadas). Ambos estão nomeados em `probes/REGRESSION_R7ASE_NAMED.json`.

Os corpora conhecidos não foram reclassificados como evidência de generalização.

**Suítes:** `node --test` 555/555. O arquivo novo tem 15 testes, e 10 deles falham na cópia do R7A-BOUNDARY-FINAL-FREEZE.

**Execuções de evidência** (as grades e probes de todos os juízes e autores anteriores): 96 execuções, 0 falhas, digest igual antes e depois de cada uma. Das 95 comparadas com o R7A-BOUNDARY-FINAL-FREEZE, 75 são idênticas; as 20 diferentes estão nomeadas em `probes/COMPARE_R7ASE_NAMED.json`:
- os probes do QE-R7AB-01, agora fechados;
- a autoridade por esporte (SE-E);
- os handlers de domingo que aplicam a regra da revisão (E6);
- campos novos de registro.

Identidade de interrupção, composição, supersessão e merge de exercício: idênticos. D53, D56–D59 e QE-R7AF-01: as checagens do verificador passam.

**Encontrado e corrigido antes do freeze pela comparação:** a ordem de chaves dos exercícios. A história ordenava as chaves, e o mesmo estado virava outro registro de cada lado da fronteira de semana: os valores eram iguais e o `hash` canônico também, mas três oráculos byte a byte anteriores falhavam. A história agora mantém a ordem do início que lê.

## 12. Mutation

Mutação só desta semântica (`probes/mutation-check-r7ase.mjs`), com 23 mutantes, incluindo os exemplos do §23:
- projetado tratado como histórico;
- revisão promovendo valores intocados;
- evidência irrelevante promovendo;
- planner lendo o histórico;
- consumidor histórico lendo projeção;
- parcial preenchida com o alvo;
- execução ignorada.

Nas rodadas 1 a 3, os sobreviventes viraram testes. No source final: **23 de 23 pegos**, todos aplicados, 0 documentados; a execução limpa passa 71/71.

## 13. Engineering review (R7ASE-QE-r1)

Juiz de engenharia independente: um `quality-reliability-engineer` novo (claude-opus-5-5, effort max), que não escreveu o runtime e não alterou nada em `CoachingCore/`. Revisão: `audits/domain-coaching-r7a-state-evidence-2026-10-28/reviews/quality-engineering-r7ase-review.{md,json}`. O digest foi `692483ce…` no início e no fim. **Veredito: NOT_READY.**

**Resposta ao §28: sim.** Dois caminhos normais de V1 consomem como fato histórico um valor que só uma projeção fez, sem evidência pertinente a ele.

| Achado | Severidade | O que é | Reprodução |
|---|---|---|---|
| **QE-R7ASE-01** | MEDIUM, **material** | Quando o atleta levanta uma carga projetada, `atDose` (`src/r6-adaptation.mjs:714-720`) promove a dose inteira do início armazenado, inclusive o load tick. A carga tem evidência, o tick não. Quando a projeção estava duas semanas à frente da história, o tick na carga nova conta uma exposição nunca executada. Com ledgers idênticos, U tem `db-rdl` e `db-split-squat` em KNOWN 24 com tick 1, num valor marcado `rebuilt`, enquanto o controle R6 tem tick 0. A única exposição a 24 kg errou o alvo (3 de 5 repetições) ou teve repetições não logadas. Depois de um retorno SHORT, U sobe para 26 kg em 2027-01-09 e R6 em 2027-01-16: uma semana antes | `reviews/qe-r7ase-P51d-identical-ledgers.mjs` (ledgers idênticos); `qe-r7ase-P51c-…` (quatro fusos e a cópia do boundary); `qe-r7ase-P51b-…` |
| **QE-R7ASE-02** | MEDIUM, **material** | O predicado D52 do planner (`needsReestablishment`, `src/r6-program.mjs:335`, usado em `:362`: "dias corridos desde a última exposição executada") lê `lastPerformed` do início de planejamento. Uma revisão só atualiza essa data para um exercício feito na semana, então a data planejada de uma semana não revisada sobrevive a toda revisão seguinte em que o exercício falta. No P40, em U: planejamento 2026-11-21 (nunca executado), história 2026-11-14. Em 2026-12-19, 35 dias depois da última exposição, U prescreve `db-rdl` 3x5@3 KNOWN 22 e `db-split-squat` 2x6@3 KNOWN 22, nunca levantados; R prescreve o restabelecimento D52 por esforço. Mesma classe no P52: doses de return step planejadas a partir de um return step projetado | `reviews/qe-r7ase-P50-reestablish-projected-date.mjs` (quatro fusos e a cópia do boundary); `qe-r7ase-I02-same-facts.mjs`; `qe-r7ase-P52-fresh-exercise-entryweek.mjs` |
| QE-R7ASE-03 | LOW, não material | E2 deixa um passo revisado à frente do controle sobreviver a uma semana não revisada (longão 70 contra 65). É passo de uma revisão, não de uma projeção. Para o SSCTR: um retorno SHORT retoma um longão de 70 minutos nunca executado | `reviews/qe-r7ase-I01-sundaylong-trace.mjs` |
| QE-R7ASE-04 | LOW, não material | Um exercício substituto novo herda o flag de semana de entrada da visão de planejamento (cross-exercise, família E). Seus valores coincidem com a linha que o atleta fez | `reviews/qe-r7ase-P52-fresh-exercise-entryweek.mjs` |

O autor (o Chief) reproduziu P51d e P50 em modo só leitura no freeze. As saídas são byte-idênticas às do juiz.

**Fronteiras:**
- **E1 rejeitada em parte.** Vale para projeções do futuro e para contadores que um plano fez antes dos fatos. Não vale para predicados do planner definidos sobre a história executada e avaliados depois de os fatos chegarem: "a próxima revisão lê os fatos" é falso para átomos que uma revisão não move.
- **E2 a E6 aceitas.** Ressalvas: QE-R7ASE-03 em E2; o mecanismo do QE-R7ASE-01 em E5.

**Blockers anteriores:**
- **QE-R7AB-01:** fechado no seu caminho registrado. A classe continua aberta pelo QE-R7ASE-01, uma manifestação material equivalente (§29).
- **QE-R7AF-01, QE-R7AF-02, QE-R7A-01, QE-R7A1-09, QE-R7A1-10, QE-R7A2-01, QE-R7A2-02 (engenharia) e QE-R7A2-03:** fechados. Seus probes saem byte-idênticos ao R7A-BOUNDARY-FINAL-FREEZE.

**Recomendações:**
- **NOT_READY:**
  - VALUE_SCOPED_EVIDENCE_AUTHORITY;
  - HISTORICAL_STATE_INTEGRITY;
  - PLANNING_PROJECTION_INTEGRITY;
  - STATE_PRESERVATION_INTEGRITY;
  - WEEK_START_STATE_AUTHORITY;
  - RETURN_RECOVERY_CEILING_INTEGRITY (parte de engenharia).
- **READY:** WEEK_COMPOSITION_INTEGRITY, EVENT_SUPERSESSION_INTEGRITY e EXERCISE_MERGE_INTEGRITY.

**Evidência do autor conferida pelo juiz:**
- as 64 execuções de engenharia foram reproduzidas byte a byte;
- 555/555 testes;
- verificador 15/17, e 16/17 com a revisão.

**Lacunas que o juiz apontou na evidência do autor:**
- `atDose` só foi testado com a projeção uma semana à frente (tick armazenado 0);
- nenhum mutante promove um tick projetado na carga nova;
- a justificativa de E1 não foi testada contra um átomo que a revisão não move.

**Correção a um registro do autor:** a nota do P40b em `probes/COMPARE_R7ASE_NAMED.json` diz que toda diferença restante deixa U atrás de R. Ela omite as células 8 e 9, em que U está à frente num átomo: o alvo de repetições 7 de uma semana executada exatamente como projetada, contra o 6 que a revisão adota. É um valor histórico anterior, não uma projeção (classe do QE-R7AB-02). O arquivo fica como foi revisado; a correção fica registrada aqui.

**Observação do juiz para o Founder:** depois que uma revisão sobe uma carga por evidência (20 kg com alvo cumprido → 22), a carga histórica do runtime é a próxima carga liberada pela evidência, mesmo nunca levantada. Isso segue o contrato §4 e todo controle anterior. O §3 chama "next prescribed load = 22 kg" de projeção: se carga histórica tem de significar a última carga levantada, o átomo de carga confunde dois significados.

## 14. SSCTR regression (R7ASE-SSCTR-r1)

- **Revisor:** o SSCTR nativo do projeto (effort xhigh), só regressão (§25).
- **Revisão:** `audits/domain-coaching-r7a-state-evidence-2026-10-28/reviews/ssctr-r7ase-regression.{md,json}`.
- **Digest:** `692483ce…` no início e no fim.
- **Veredito: ACCEPT.** Logo, STATE_EVIDENCE_SCIENTIFIC_REGRESSION = READY.

| Item | Decisão |
|---|---|
| SE-A: nenhuma prescrição muda antes de um retorno | Aprovado. Comparação própria, com a entrada do retorno incluída: R6 33/35, R5 24/24, perfis 16/16, simulações 14/14. Nada muda fora de um retorno |
| SE-B: o retorno parte do executado | Aprovado com condição (NF-R7ASE-1, R41). Depois de semanas nunca reportadas, a corrida recomeça abaixo do que semanas reportadas executaram (H17: longão 85 depois de 95; H26: 50 contra 65 no boundary). Conservador |
| SE-C: carga conhecida levantada é a carga | Aprovado. Só pela regra D44 da revisão; o caso não revisado iguala o controle revisado em toda célula |
| SE-D: dose projetada levantada | Aprovado com condição: a carga e o alvo de repetições sim, o tick armazenado não (NF-R7ASE-3, R42) |
| SE-E: por esporte (R40) | Aprovado. NF-R7AB-1 resolvido |
| SE-F: valores carregados reconstruídos; o handler de domingo é a revisão do esporte (E6) | Aprovado |
| SE-G: a última execução é a data executada | Aprovado |
| SE-H: fronteiras E1–E6 | Aprovadas como declaradas. NF-R7ASE-2 registrado para E2, inalterado desde o boundary |

**Blockers do SSCTR:** D53 fechado (vale); D56, D57 e D58 valem; D59 fechado (vale). Todas as grades do seu escopo saem byte-idênticas.

**NF-R7ASE-3.** O tick que só a projeção contou chega à história e sobe a carga uma exposição bem-sucedida antes, como o planner inalterado faz sem pausa. O SSCTR não aprova esse tick como história e deixou a materialidade com o juiz de engenharia, que a classificou como material (QE-R7ASE-01).

**Recomendações:**
- **R41:** dono, o autor do runtime com Product/UX e Data; decisão do Founder se for mudança de modelo de estado.
  1. Pedir ao atleta que confirme as semanas não reportadas antes de um retorno.
  2. Fazer uma revisão KEEP de uma semana completa registrar sua evidência como uma revisão MODIFY.
  3. Considerar a promoção por valor da corrida a partir de execuções completas, com revisão do SSCTR.
- **R42:** dono, o Chief com o juiz de engenharia, numa missão posterior e nunca como correção deste freeze. O tick de uma dose projetada levantada vem da história.

**Fila:** 12 itens religam ao STATE-EVIDENCE-FREEZE-1 decisões já aprovadas (187 → 199; `audits/domain-coaching-r7a-state-evidence-2026-10-28/QUEUE_INTEGRATION_R7ASE.json`).

## 15. Readiness

| Veredito | Valor | Por quê |
|---|---|---|
| STATE_EVIDENCE_MODEL | **NOT_READY** | QE-R7ASE-01, QE-R7ASE-02 |
| VALUE_SCOPED_EVIDENCE_AUTHORITY | NOT_READY | QE-R7ASE-01 (promoção dentro de um valor); QE-R7ASE-02 (um predicado do planner lê um átomo projetado) |
| HISTORICAL_STATE_INTEGRITY | NOT_READY | QE-R7ASE-01 |
| PLANNING_PROJECTION_INTEGRITY | NOT_READY | QE-R7ASE-02 |
| STATE_PRESERVATION_INTEGRITY | NOT_READY | P51d: fatos idênticos dão estado diferente num retorno |
| WEEK_START_STATE_AUTHORITY | NOT_READY | Um valor WEEK_EVIDENCE reconstruído carrega um tick projetado |
| RETURN_RECOVERY_CEILING_INTEGRITY | NOT_READY | Engenharia: um retorno SHORT retoma um tick projetado; os tetos de carga valem (P40c: 20). SSCTR: sem alteração indevida |
| STATE_EVIDENCE_ENGINEERING_REVIEW | NOT_READY | R7ASE-QE-r1 |
| STATE_EVIDENCE_SCIENTIFIC_REGRESSION | READY | R7ASE-SSCTR-r1 ACCEPT |
| WEEK_COMPOSITION_INTEGRITY | READY | P01–P10, P15, P16, P09 e as grades R7-A.1 byte-idênticas |
| EVENT_SUPERSESSION_INTEGRITY | READY | P31 (quatro fusos), P34 |
| EXERCISE_MERGE_INTEGRITY | READY | P07 |
| R7A_EXIT_READINESS | **NOT_READY** | §29: QE-R7AB-01 está fechado, mas há duas manifestações materiais equivalentes conhecidas |

**Não emitido:**
- R7A_EXIT_READINESS = READY;
- AUTONOMOUS_COACH_READY;
- COACHING_DECISION_QUALITY = READY;
- KMP, produção, validação humana ou clínica.

**Registros:**
- `CoachingCore/r7/state-evidence/READINESS_R7ASE.json`;
- `audits/domain-coaching-r7a-state-evidence-2026-10-28/FINAL_DISPOSITION.json`;
- `CoachingCore/r7/state-evidence/VERIFICATION_R7ASE.json`: `verify-r7ase.mjs --write` na closure, 17/17. As checagens mecânicas mostram que a evidência e as duas revisões estão ligadas ao freeze e completas; não medem readiness. O veredito de engenharia é NOT_READY.

## 16. Next mission

`NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION` (não iniciada). Não há handoff: `CoachingCore/r7/R7A_FINAL_HANDOFF.md` não foi criado. O R7-B0 não começou (§33).

Registro do §32 para cada achado material:

| | QE-R7ASE-01 | QE-R7ASE-02 |
|---|---|---|
| Achado | `atDose` promove o tick da projeção junto com a carga levantada | O predicado D52 do planner lê a data projetada de última execução |
| Reprodução | `reviews/qe-r7ase-P51d-identical-ledgers.mjs`: ledgers idênticos dão tick 1 contra 0 e 26 kg uma semana antes. Também P51c (quatro fusos e a cópia do boundary), P51b e o probe do SSCTR `reviews/ssctr-r7ase-tick-probe.mjs`. O Chief reproduziu o P51d byte a byte | `reviews/qe-r7ase-P50-reestablish-projected-date.mjs` (quatro fusos e a cópia do boundary): 22 kg conhecidos e nunca levantados, contra o restabelecimento D52. Também I02 e P52. O Chief reproduziu o P50 byte a byte |
| State atom que perdeu provenance | O `loadTick` de um exercício de força. A base registrada é WEEK_EVIDENCE reconstruída; a origem real é a suposição de uma CONDITIONAL_PLAN sobre uma sessão perdida. Por inferência, também o alvo de repetições num objetivo de progressão por repetições | O `lastPerformed` de um exercício na visão de planejamento, lido como a última exposição executada. No P52, o `returnStep` lido pelo tipo de exposição da linha |
| Falha da granularidade escolhida? | Sim. Um exercício é um valor, e a evidência de um átomo (a carga) promove a tupla inteira da dose | Não. O valor está identificado (`projectedBase`) e a história está certa. O planner avalia um predicado definido sobre a história contra a visão de planejamento (E1 larga demais) |
| Separar fisicamente HistoricalState e PlanningProjection? | Não para este caso: promover só a carga e derivar o tick das exposições executadas fecharia o achado (R42). Mas o juiz lê o padrão como argumento para separar. A história é reconstruída copiando valores do registro de planejamento por regras por valor, e duas regras de cópia já vazaram: QE-R7AB-01 e depois esta, introduzida pela correção. Um HistoricalState avançado só por evidência executada eliminaria a classe | Caminhos de leitura separados são necessários: os predicados do planner definidos sobre a história precisam ler a visão histórica. Separação física é um jeito de garantir isso, não o único |

A decisão do Founder precisa responder três perguntas (nem os juízes nem o autor decidem):
1. A história continua sendo reconstruída do registro único por regras por valor, ou passa a ser um HistoricalState separado, avançado só por evidência executada? A recomendação do juiz de engenharia é a segunda. A primeira exige corrigir QE-R7ASE-01 e QE-R7ASE-02 no modelo atual: só a carga promove, o tick vem das exposições executadas, e os predicados históricos do planner leem a visão histórica.
2. O que significa o átomo de carga histórica: a próxima carga liberada pela evidência (o que o runtime e todo controle anterior usam) ou a última carga levantada (a leitura literal do §3)?
3. As recomendações não bloqueantes R41 (semanas não reportadas antes de um retorno) e R42 (tick a partir da história) entram na mesma decisão ou numa missão posterior?

## Comprovado, inferido e não testado

### Comprovado

Executado no freeze, com saídas registradas:
- **Baseline:** reproduzido antes de qualquer edição (verify-r7ab 17/17, 540/540, P40 byte-idêntico).
- **QE-R7AB-01 fechado no seu caminho:** no P40, nos quatro fusos, U = R. O teto do P40c é 20. P41, P44 e P47b igualam os controles. O plano continua projetando 22 kg.
- **Testes:** 555/555. 10 dos 15 novos falham no R7A-BOUNDARY-FINAL-FREEZE.
- **Mutação e self-challenge:** mutação 23/23. Self-challenge com 0 violações no freeze e 52 no boundary.
- **Regressão:** R5, perfis e simulações idênticos; R6 33/35, com as duas diferenças nomeadas.
- **Execuções de evidência:** 96, 0 falhas, ligadas ao digest; 75 idênticas, 20 nomeadas. O juiz reproduziu byte a byte as 64 execuções de engenharia.
- **QE-R7ASE-01 e QE-R7ASE-02 reproduzidos:** pelo juiz, em quatro fusos e na cópia do boundary; pelo Chief, byte a byte.
- **Blockers anteriores** (QE-R7AF-01/02, QE-R7A-01, QE-R7A1-09/10, QE-R7A2-01/02/03) **e D53, D56–D59:** probes e grades byte-idênticos ao boundary.
- **Fila:** 187 → 199, com os itens anteriores byte-idênticos.
- **Nada mais alterado:** política inalterada; nenhum arquivo de produto, canon, Figma ou freeze anterior mudou.

### Inferido

- O mesmo mecanismo do QE-R7ASE-01 afeta o alvo de repetições num objetivo de progressão por repetições. O juiz o infere; não foi executado.
- A classe "cópia do registro de planejamento" pode reaparecer em outros átomos enquanto a história for reconstruída por cópia. É o argumento do juiz pela separação física.
- O alcance esportivo do tick (um incremento, uma exposição antes, como o planner sem pausa) é a avaliação do SSCTR, não validada por humanos.
- Nenhum outro consumidor histórico lê a visão de planejamento: a auditoria de consumidores foi uma busca limitada (§21), não uma prova. O juiz rejeitou em parte a justificativa de E1 dessa auditoria (QE-R7ASE-02).

### Não testado

- Dados reais, atletas reais, validação humana ou clínica, HealthKit, KMP, UI e produção.
- Janelas de tempo de gate (o excedente EARNED) entre o relógio da revisão e o corte (E4, segundo o juiz).
- O mecanismo do tick em semanas nunca reportadas (E5; o juiz o infere, mas não o executou).
- `atDose` além dos casos do juiz. Nenhum mutante promove um tick projetado na carga nova.
- Toda a família B0 (repertório, pace, maratona, archetypes, learning): fora do escopo e não começada.
