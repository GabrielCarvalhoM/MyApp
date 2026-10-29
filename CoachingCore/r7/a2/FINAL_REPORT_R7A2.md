# DOMAIN_COACHING_R7-A.2 — Relatório final

**Resultado:** `R7A_EXIT_READINESS = NOT_READY`, encerrada com blocker explícito (Founder request §26). O SSCTR aceitou e fechou D59. O juiz de engenharia achou um blocker material da mesma classe, QE-R7A2-01. Não há ciclo de correção depois do freeze: a decisão volta ao Founder.

| Item | Estado |
|---|---|
| Freeze único | R7A2-FREEZE-1, digest de fonte `e0637ec2613acde1132d70fc64a5a6f0f1062b74d6c5cfafb6654dc1a54c7a28` (79 arquivos; arquivo do freeze `14fd8efe…`) |
| Política | R6-POLICY-5 `18ec48f3…`, inalterada |
| Testes | 519/519 (505 anteriores e 14 novos; Node v24.19.0) |
| Mutação (só as invariantes novas) | 19/19 pegos |
| Juízes no R7A2-FREEZE-1 | engenharia NOT_READY (QE-R7A2-01, HIGH); SSCTR ACCEPT |
| Ciclo de correção | nenhum (Founder §19) |
| Próxima missão | `FOUNDER_ARCHITECTURAL_DECISION` (não iniciada) |

Escopo: só a referência offline sintética em Node 24. Sem UI, Figma, KMP, HealthKit, Android, integrações, produção, efeito em plano real, commit, merge ou deploy.

## 1. Baseline

Antes de qualquer edição, sobre o R7A1-FREEZE-A2:
- digest recalculado `71edc245…`, com 0 de 78 arquivos divergentes;
- `verify-r7a1.mjs` em modo leitura deu 17/17, e `node --test` deu 505/505;
- os três blockers foram reproduzidos byte a byte contra as saídas registradas pelos juízes:
  - P13 (QE-R7A1-09);
  - P14 (QE-R7A1-10);
  - a grade de primeira semana (D59): NONE E 264, O 561, B 109; FAMILIAR E 408, O 1.021, B 117; KNOWN O 72.

As cópias estão em `audits/domain-coaching-r7a2-2026-10-28/probes/baseline/`. O `BASELINE.json` vincula 1.674 arquivos, e `freezeA2-source/` guarda o runtime do FREEZE-A2 byte a byte.

## 2. Causa raiz: confirmada

Os três blockers tinham uma só causa:
- o retorno partia de uma fotografia de fronteira de semana: `stateTrace[pauseWeek]`, ou `startBeforeReturn` quando a pausa começava numa semana já replanejada por outro retorno;
- o easy slot era achado pelo texto da explicação.

Nada dizia **qual** pausa um relato descrevia, se ele **corrigia** um relato anterior ou relatava uma **nova** pausa, nem **o que o atleta tinha executado** quando a pausa começou.

## 3. Modelo implementado

A mudança cobre três arquivos do runtime: `r6-adaptation.mjs`, `r6-program.mjs` e `r6-composition.mjs`. O contrato `INTERRUPTION_CONTRACT.md` (R7A2-COMPOSITION-3) sucede as frases de retorno da cláusula C5 do contrato de composição da R7-A.1. Não há event sourcing, banco de eventos, planner nem política nova.

## 4. Identidade da pausa (InterruptionEpisode)

Cada decisão de retorno registra a sua pausa:
- as datas e a identidade (`episode`);
- a relação com o relato anterior (`NEW` ou `SAME_BREAK`) e o relato que ela substitui;
- o ponto de onde veio o seu estado e o início que ela fixou.

A relação é decidida contra o último retorno em vigor:
- **NEW:** a pausa começa no dia do relato daquele retorno ou depois, ou seja, depois da reentrada.
- **SAME_BREAK:** começa antes daquele relato e não termina antes de aquela pausa começar. Substitui o relato anterior e mantém a identidade.
- **ASK:** termina antes de a última pausa relatada começar, ou atravessa a reentrada do retorno anterior. Nunca é adivinhada.

## 5. Estado na interrupção (ExecutedStateAtInterruption)

`stateAtBreak` parte do ponto mais recente que fixou estado até o primeiro dia da pausa:
- o início da semana da pausa, antes de qualquer retorno daquela semana; ou
- o início fixado por um retorno em vigor, relatado naquela semana até aquele dia.

Depois aplica, só como fatos (`strengthAtBreak`), as exposições executadas depois desse ponto e antes da pausa:
- o exercício passa a estar em uso, com a data da última execução;
- fora de um retorno, a última contagem inteira executada vira o teto de um retorno, quando o alvo registrado foi cumprido;
- nada que só a revisão da semana decide: nenhuma adoção de carga, passo, subida ou fim de cap, passo de retorno ou set de bloco.

Nada a partir do primeiro dia da pausa conta: nenhuma execução observada nesse dia ou depois, nenhuma decisão tomada nesse dia ou depois. A receita de retorno vigente segue inalterada.

## 6. Invariantes

I1 a I9 e P1 a P6 estão em `test/r7a2-interruption.test.mjs`: 14 testes, e os 14 falham numa cópia byte a byte do FREEZE-A2.

O self-challenge do autor cobre 42 casos em 13 classes, com 0 violações no freeze e 16 no FREEZE-A2. As classes incluem:
- duas e três pausas; correção e pausa nova; relato atrasado;
- primeira exposição;
- fronteira de semana em três fusos;
- pausa no dia de uma sessão;
- mudanças entre duas pausas;
- re-estabelecimento antes da pausa.

Antes do freeze, o autor achou e tratou mais quatro pontos da classe:
- a janela seguia a data planejada em vez da data executada;
- uma correção da mesma pausa curta numa semana posterior facilitava um segundo slot;
- um relato conflitado puxava uma sessão para a janela;
- uma exclusão redundante (mutante equivalente) foi removida.

## 7. Blockers

| Blocker | Estado | Base |
|---|---|---|
| QE-R7A1-09 | **OPEN** | Os caminhos do P13 (X, X2, S) estão fechados; o enunciado volta por QE-R7A2-01 |
| QE-R7A1-10 | **OPEN** | O P14 está fechado; o resultado volta por QE-R7A2-01 (P20: terça da semana 4 em THRESHOLD 41, em vez de EASY 34) |
| D59 | **CLOSED** | SSCTR: grade de primeira semana E = O = B = 0 em NONE, FAMILIAR e KNOWN; a entrada acontece, o bloco não ganha set, o teto é a última contagem inteira executada |
| QE-R7A-01 | **OPEN** | Por QE-R7A1-09 e QE-R7A1-10 |
| D53 | **OPEN** (consolidado) | O SSCTR o fechou no seu escopo. O caminho do QE-R7A2-01 restaura a dose pré-pausa de uma vez, e o §22 fecha D53 só por consequência de QE-R7A1-09 e D59 |

**O blocker novo, QE-R7A2-01 (HIGH, material, engenharia).**

O caminho (P17):
1. A pausa A, de 16 dias, é relatada. O atleta executa a reentrada (agachamento 1x5 @RIR4, corridas de 15 a 20 minutos) e relata essas sessões.
2. Uma pausa separada B, de 4 dias (curta), começa e termina.
3. Antes de relatar B, o atleta relata A de novo: as mesmas datas, ou o primeiro dia um dia antes. O registro marca SAME_BREAK de A, corretamente.
4. B é relatada. O runtime a lê como a mesma pausa de A: SAME_BREAK, com a identidade de A, substituindo o novo relato. B parte do início da semana anterior a A.

**Resultado:** na semana seguinte, seis linhas de força na dose pré-pausa (por exemplo `back-squat 3x5 @RIR3` com a carga conhecida de 82,5) e um longão de 70 minutos. A reentrada dava 1x5 @RIR4 e 20 minutos.

**Controles:** com B relatada antes do novo relato de A, ou sem o novo relato, B é NEW e parte da reentrada (1x5 @RIR4, longão de 20), como esperado.

**Alcance:** a grade P19 (48 células) lê B como SAME_BREAK em 12 de 12 células em que o novo relato de A cai depois do fim de B e antes do relato de B.
- Com B na semana da reentrada, as linhas voltam à dose pré-pausa (6 de 6).
- Com B na semana seguinte, só a identidade está errada (6 de 6).
- O P20 (curta e curta) devolve o resultado do QE-R7A1-10.

**Reprodução:** os scripts estão em `audits/domain-coaching-r7a2-2026-10-28/reviews/`:
- `qe-r7a2-P17-late-correction-then-separate-break.mjs` (L1–L4 contra os controles C1 e C2);
- `qe-r7a2-P19-identity-interleaving-grid.mjs`;
- `qe-r7a2-P20-late-correction-easy-slot.mjs`.

O autor reproduziu o P17 byte a byte, e a cópia do FREEZE-A2 dá as mesmas linhas: o caminho é herdado.

**Causa raiz:** a identidade (`interruptionEpisode`) e o ponto de partida (`stateAtBreak`) são decididos contra a superseção atual do registro, isto é, o relato vigente mais recente e o seu relógio. Deveriam ser decididos contra o registro como estava no primeiro dia da pausa. O novo relato de A, feito depois que B começou, faz duas coisas:
- empurra o relógio do último relato para depois de B;
- substitui o relato cuja reentrada o atleta executou, que deixa de ser um ponto de partida.

**Mesma arquitetura ou classe nova:** é a mesma arquitetura e a mesma classe de QE-R7A1-09 e QE-R7A1-10 (identidade da pausa). É um entrelaçamento residual que o modelo da R7-A.2 não previu, herdado do FREEZE-A2, e não uma classe nova.

**Por que escapou:**
- nos testes, no self-challenge e no P09, todo novo relato da mesma pausa vinha antes do início da pausa seguinte;
- os retornos do P09 sempre terminam na véspera do relato;
- a mutação não mede uma condição que não está escrita.

## 8. Regressões

Contra o R7A1-FREEZE-A2 (`CoachingCore/r7/a2/REGRESSION_R7A2.json`):

| Corpus | Idênticos |
|---|---|
| R5 | 24/24 |
| Perfis | 16/16 |
| Simulações | 14/14 |
| Holdout R6 | 34/35 (R6-H17: só fatos de estado; nenhuma linha e nenhum status) |

As provas e grades da R7-A.1 ficaram iguais byte a byte:
- probes de composição, três passos e combinações D58;
- P01–P05, P07–P10, P15, P16 e P09 (as duas seeds);
- grade curta, leituras D58, probe e instrumento do SSCTR.

Diferenças nomeadas, todas sem violação:
- **P06 e o par esperado da grade de segunda:** guardam a repetição executada de um acessório na entrada (7 em vez de 5), consequência de D59.
- **Grade noturna:** dois pares em que um retorno e o relato das sessões anteriores da semana, em ordens opostas, diferem só no que o retorno leu. As linhas são iguais; é uma fronteira declarada.
- **Grades D56 e de restauração:** deslocam contagens de cap-weeks, com 0 violações.

Estado já READY preservado:
- WEEK_COMPOSITION, EVENT_SUPERSESSION e EXERCISE_MERGE;
- QE-R7A-02, 03, 05, 12 e 19;
- D56, D57 e D58.

## 9. Mutação

Foram 19 mutantes, só das invariantes novas: identidade, superseção, ponto do estado, janela temporal, primeira exposição, gate do teto, progressão e propriedade do easy slot. Os 19 foram pegos. A primeira rodada pegou 11 de 15; os quatro sobreviventes viraram uma correção e três testes antes do freeze.

## 10. Engenharia

Juiz: `quality-reliability-engineer` em instância nova (claude-opus-5-5, xhigh). Revisão R7A2-QE-r1, ligada ao R7A2-FREEZE-1, com o digest recalculado no início e no fim: 0 de 79 arquivos divergentes.

**Veredito: NOT_READY.** A resposta ao §20 é sim: existe um caminho normal de V1 em que uma interrupção é confundida com outra (QE-R7A2-01).

**Preservado:**
- P01–P16 e P09 iguais às execuções do autor;
- iguais também ao FREEZE-A2, exceto P13 e P14 (fechados) e a linha declarada do P06;
- P09 sem violação de O1–O7 em 5.000 sequências.

**Recomendações:**
- WEEK_COMPOSITION, EVENT_SUPERSESSION e EXERCISE_MERGE: READY;
- STATE_PRESERVATION e o lado de engenharia de RETURN_RECOVERY_CEILING: NOT_READY.

**Fronteiras declaradas:** as seis foram aceitas. A primeira, o registro como relatado, tem efeito maior do que o brief dizia; isso é o QE-R7A2-02 (MEDIUM, não material).
- Se as sessões antes da pausa forem registradas uma hora depois do retorno, as linhas saem mais altas no cenário de primeira semana.
- Um novo relato da mesma pausa restaura as linhas.

**Outro achado:** QE-R7A2-03 (LOW, não material), uma variante do mesmo janelamento.

## 11. SSCTR

Juiz: `sports-science-concurrent-training-reviewer` nativo (claude-opus-5-5, xhigh). Revisão R7A2-SSCTR-r1, ligada ao R7A2-FREEZE-1, com o digest conferido no início e no fim: 79 de 79 arquivos.

**Veredito: ACCEPT**, sem achado bloqueante no seu escopo.
- **D59: CLOSED** pelo critério do §13. O teto é igual à última contagem pertinente executada em 3.240 exercícios de primeira semana e 1.090 de semanas posteriores, com 0 divergências.
- **D56, D57 e D58** se mantêm.
- As grades de restauração, de caps, curta e D58, e o instrumento do round 12, são iguais às do autor e não têm violação.

**S-A a S-H aprovados:**
- S-C como a leitura declarada;
- S-D com custo registrado;
- S-H como fronteira declarada.

**Registros:** 13 registros R7A2-SSCTR-r1, validados com 0 erros; o controle negativo foi pego (6 erros).
- 12 revinculados ao R7A2-FREEZE-1;
- o do D59 passou de REVISE a APPROVE_WITH_CONDITIONS;
- 1 novo: R7A2-SSCTR-INTERRUPTION-STATE.

**Não bloqueantes, roteados:**
- **NF-1:** uma sessão no primeiro dia declarado da pausa deveria gerar ASK.
- **R35 e R36:** tetos de estabelecimento e de alvo não cumprido, para a próxima revisão de política.
- **NF-4:** texto da linha UNLOGGED.
- **NF-5:** nenhuma ação.
- **R37:** pedir um novo relato da mesma pausa quando houver log tardio.

**Fila humana:** 151 → 163 itens, append-only, funding NOT_DECLARED (`QUEUE_INTEGRATION_R7A2.json`).

## 12. Readiness

| Veredito | Valor |
|---|---|
| WEEK_COMPOSITION_INTEGRITY | READY |
| STATE_PRESERVATION_INTEGRITY | NOT_READY (QE-R7A2-01) |
| EVENT_SUPERSESSION_INTEGRITY | READY |
| EXERCISE_MERGE_INTEGRITY | READY |
| RETURN_RECOVERY_CEILING_INTEGRITY | NOT_READY (QE-R7A2-01; o lado esportivo, D59 e D56–D58, está fechado) |
| R7A2_ENGINEERING_RECHECK | NOT_READY |
| R7A2_SCIENTIFIC_RECHECK | READY (ACCEPT) |
| R7A_EXIT_READINESS | NOT_READY |

Não emitidos (§23): AUTONOMOUS_COACHING_READY, COACHING_DECISION_QUALITY, KMP_READY, PRODUCTION_READY e REAL_USER_VALIDATION. Detalhes em `CoachingCore/r7/a2/READINESS_R7A2.json`.

## 13. Próxima missão

`NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION`. Nada foi iniciado:
- nem essa missão, nem R7-B0, nem R7-B;
- não há handoff (§24);
- não há FREEZE-2, A.2.1, terceiro juiz nem nova rodada (§19).

**A menor decisão arquitetural:** decidir a pausa de um relato, e o seu ponto de partida, a partir do registro como estava no primeiro dia da pausa.
1. **Mesma pausa ou pausa nova.** Um relato é a mesma pausa só quando:
   - os seus dias declarados se sobrepõem ou encostam nos dias daquela pausa; ou
   - ele começa antes do primeiro relato dela, isto é, da reentrada.

   Uma pausa que começa depois da reentrada e depois dos dias de uma pausa anterior é nova, mesmo que um relato posterior da anterior tenha sido feito.
2. **Ponto de partida.** É o retorno em vigor no primeiro dia da pausa, mesmo que um relato posterior o tenha substituído.

As duas partes são necessárias: o juiz testou uma mutação que corrige só a relação, e o ponto de partida continuou errado.

Uma variante mais estreita da parte 1, também apontada pelo juiz: perguntar (ASK), em vez de decidir NEW, quando um relato começa depois do primeiro relato da pausa que ele substituiria. A parte 2 continua necessária quando a resposta é uma pausa nova. A escolha é do Founder.

**Decisões relacionadas, do mesmo registro:**
- **QE-R7A2-02 e R37:** um log tardio da semana da pausa recalcula o retorno, ou pede um novo relato da mesma pausa?
- **NF-1:** uma sessão executada no primeiro dia declarado da pausa gera ASK?

Ponto de retomada: `audits/domain-coaching-r7a2-2026-10-28/CHECKPOINT.md` e `FINAL_DISPOSITION.json` (`notReadyRecord`).

## Comprovado, inferido e não testado

**Comprovado:** saídas registradas e ligadas ao digest, conferidas pelo verificador `CoachingCore/r7/a2/VERIFICATION_R7A2.json`.
- o baseline, e os três blockers reproduzidos antes da edição;
- P13 e P14 fechados;
- D59 fechado pela grade do SSCTR;
- testes 519/519, com os 14 novos falhando no FREEZE-A2;
- mutação 19/19, self-challenge 0/42 e as regressões;
- o veredito NOT_READY de engenharia, e a reprodução do QE-R7A2-01 (P17) byte a byte pelo autor.

**Inferido:** que a decisão do registro como no primeiro dia da pausa basta para fechar o QE-R7A2-01 e a sua variante QE-R7A2-03. Nenhuma correção foi escrita nem vista por um juiz.

**Não testado:**
- atletas reais e validação humana, empírica ou clínica;
- dados não sintéticos;
- o caso em que a semana anterior à pausa não foi revisada: o ponto de partida é o plano condicional dela (C3);
- avaliação fora de ordem dos relógios dos relatos.
