# DOMAIN_COACHING_R7-A — Fechamento final de fronteira — Relatório

**Resultado:** `R7A_EXIT_READINESS = NOT_READY`, encerrado com blocker explícito (Founder §22, §26).

- **QE-R7AF-01:** fechado no seu caminho. Depois de uma semana de reentrada inacabada e não revisada, nenhuma decisão posterior faz o início projetado virar histórico.
- **§11:** a correção nomeada que contradiz a própria reentrada executada agora é perguntada (fecha o QE-R7AF-02).
- **SSCTR:** ACCEPT.
- **O que segura o NOT_READY:** o juiz de engenharia achou um blocker material novo da mesma família, o **QE-R7AB-01**. Fora de um retorno, a revisão semanal grava o início da semana seguinte como evidência, mas carrega do início da própria semana os valores que a evidência não moveu, mesmo quando esse início era uma projeção não verificada.

Não há ciclo de correção depois do freeze: a decisão volta ao Founder.

| Item | Estado |
|---|---|
| Freeze único | R7A-BOUNDARY-FINAL-FREEZE, digest de fonte `36a71ca84fb87789d8623e2050ac9e308a963400af86a3ba73a373043bbf186c` (arquivo `CoachingCore/r7/boundary/RUNTIME_FREEZE_R7A_BOUNDARY.json`, `3ebc9b02…`, 81 arquivos) |
| Delta do R7A-FINAL-FREEZE | mudaram `src/r6-adaptation.mjs`, `src/r6-composition.mjs`, `src/r6-program.mjs` e `test/r6-adaptation.test.mjs`; novo `test/r7ab-week-start-authority.test.mjs` |
| Política | R6-POLICY-5 `18ec48f3…`, inalterada |
| Testes | 540/540 (528 anteriores, 12 novos; Node v24.19.0). 10 dos 12 novos falham no R7A-FINAL-FREEZE |
| Mutação (só esta semântica) | 20 de 21 pegos e 1 documentado |
| Self-challenge | 9 classes: 0 violações no freeze, 56 no R7A-FINAL-FREEZE |
| Regressão contra o R7A-FINAL-FREEZE | R6 holdout 35/35, R5 24/24, perfis 16/16, simulações 14/14 idênticos |
| Evidência no freeze | 78 execuções, 0 falhas, digest igual antes e depois de cada uma: 68 saídas byte a byte iguais, 9 com diferença nomeada, 0 sem nome |
| Juízes no R7A-BOUNDARY-FINAL-FREEZE | engenharia **NOT_READY** (QE-R7AB-01, MEDIUM, material); SSCTR **ACCEPT** |
| Fila humana | 175 → 187 (12 itens HQ-R7AB-SSCTR-*, append-only, funding NOT_DECLARED) |
| Próxima missão | `FOUNDER_ARCHITECTURAL_DECISION` (não iniciada) |

Escopo: só a referência offline sintética em Node 24. Sem UI, Figma, KMP, HealthKit, Android, integrações, produção, efeito em plano real, commit, merge ou deploy. Não declarado: coach autônomo pronto, qualidade de coaching global, KMP, produção, validação humana ou clínica.

## 1. Baseline

Antes de qualquer edição, sobre o R7A-FINAL-FREEZE:
- digest recalculado `ec2debe7…`, com 0 de 80 arquivos divergentes; política `18ec48f3…`;
- `verify-r7af.mjs` em modo leitura deu 18/18, e `node --test` deu 528/528;
- o blocker foi reproduzido byte a byte contra as saídas do juiz: P30c `8dfa53db…` e P30b `db28ce3d…` (no P30b, 13 de 15 células mudam o início de B e 7 adiantam o passo de retorno da corrida);
- o SSCTR anterior (R7AF-SSCTR-r1) continua ACCEPT sobre o freeze histórico.

O `BASELINE.json` vincula 2.366 arquivos, e `final-freeze-source/` guarda o runtime do R7A-FINAL-FREEZE byte a byte (80 arquivos). Saídas em `audits/domain-coaching-r7a-boundary-2026-10-28/probes/baseline/`.

## 2. Causa raiz

O `stateAtBreak` reusava um início de semana gravado como o estado que o atleta tinha executado sempre que o predicado `earned` aceitava. O predicado perguntava **quando** uma decisão tinha sido tomada, e não **o que** tinha produzido aquele início:
- qualquer decisão datada depois do fim da semana anterior "conquistava" o início que um retorno tinha projetado (QE-R7AF-01);
- a terceira cláusula ("a semana anterior foi executada como planejada") contava como executada qualquer sessão com algum relato, inclusive uma relatada como não feita, parcial ou pulada. E ignorava:
  - resposta adversa;
  - série sem registro;
  - carga menor que a do plano;
  - adaptação feita na semana depois da projeção;
- antes de qualquer retorno, o início planejado de uma semana não revisada valia como histórico (fronteira 3 da R7-A.2).

Uma causa só: projeção e histórico compartilhavam a mesma estrutura de estado, e nenhum consumidor tinha como distinguir um do outro (Founder 0.1, §7).

## 3. Modelo de autoridade do estado (WeekStartState)

Contrato: `audits/domain-coaching-r7a-boundary-2026-10-28/WEEK_START_AUTHORITY_CONTRACT.md` (R7AB-WEEKSTART-1).

**O registro.** Cada semana grava, por esporte, por que o seu início tem o estado que tem (`weeks[k].startAuthority`). O estado continua em `stateTrace[k]`.

| Campo do Founder | No runtime |
|---|---|
| state | `stateTrace[k]` |
| authority | `EVIDENCE_ANCHORED` quando corrida e força são evidência, senão `PROJECTED` |
| provenance | `INTAKE`, `RETURN_ENTRY`, `WEEK_EVIDENCE` ou `CONDITIONAL_PLAN`, com a decisão que o fixou |
| evidenceThrough | o relógio da decisão que leu a evidência; uma parte projetada grava `premise` (o digest das linhas da semana anterior que a projeção supôs executadas) |

**Quem grava.**
- O gerador grava a semana 0 como INTAKE e as demais como CONDITIONAL_PLAN.
- A composição única que todo handler usa (`composeWeeks`) grava, em cada semana que coloca:
  - a autoridade do início que o chamador fixou: revisão semanal, retorno ou `rebuild`;
  - a do início mantido;
  - WEEK_EVIDENCE quando aplica a regra da revisão a uma semana completa;
  - CONDITIONAL_PLAN para toda transição condicional;
  - e mantém a parte do esporte que não replaneja.
- Um retorno da própria semana guarda a autoridade do início que substituiu.

**O consumidor único (`historicalWeekStart`).** Só o `stateAtBreak` reusa início de semana como histórico, e pergunta uma coisa: este início tem autoridade histórica no corte?
- **INTAKE:** sempre.
- **RETURN_ENTRY e WEEK_EVIDENCE:** quando fixados antes do corte. Dentro de um retorno, um valor que a revisão manteve vem do início da semana anterior, que também tem de ter autoridade, salvo se aquela semana foi toda executada.
- **CONDITIONAL_PLAN:** só quando a semana anterior executou o que a projeção supôs, lida como a revisão a lê: as mesmas linhas, todo gate do esporte em ADVANCE ou EARNED, e nenhuma carga que a revisão adotaria abaixo da que a projeção supôs levantada (sessões concluídas, §10).

Nada mais transforma projeção em histórico: nem a data de uma decisão, nem um handler, nem um campo gravado, nem a passagem do tempo.

**O ponto.** Sem autoridade, o ponto recua semana a semana, até o retorno em vigor ou a semana 0, e as execuções dessas semanas entram como fatos. Vale também antes de qualquer retorno: a fronteira 3 fica superada pelo 0.1. A decisão grava por que o ponto vale (`interruption.stateAt.authority`).

**Contradição temporal (§11).** Uma correção nomeada da mesma interrupção pode pôr o seu fim em ou depois de treino registrado depois que o seu retorno começou. Quando muda uma prescrição, é perguntada (`interruption.startDate`, `interruption.endDate`).

## 4. Invariantes

| Invariante | Evidência |
|---|---|
| I1 projetado ≠ histórico | testes "QE-R7AF-01" e "time alone"; self-challenge C1, C5 |
| I2 âncora de evidência | `stateAt.authority` em todo retorno; teste "I2" |
| I3 sem promoção | o início da semana 6 continua PROJECTED depois de equipamento, KEEP gravado e fadiga; testes "I8/P1/P2" e "families A, C" |
| I4 continuidade do retorno | B parte da reentrada; valor mantido de projeção dentro do retorno não vale (teste "I4", C4) |
| I5 execução promove | semana executada exatamente como projetada, sem revisão: COMPLETED_SESSIONS, igual à revisada (teste "I5/P3", C2) |
| I6 evidência tardia | relato atrasado conta pela hora da execução (teste "I6") |
| I7 contradição temporal | atravessar a própria reentrada executada: ASK; consistente: aplica (teste "I7", C7; P37 E1, E2, E7) |
| I8 independência de handler | equipamento, agenda, meta, evento, fadiga e dia indisponível dão a mesma base (testes "I8/P1/P2", "families A, C"; C1, C9) |
| P1–P5 | P1 e P2 nos testes acima; P3 "I5/P3"; P4 "P4"; P5 "time alone" |

**Limite que o juiz achou (QE-R7AB-01):** o I2 e o I3 só valem dentro de um retorno para os valores que uma revisão manteve (§8).

## 5. QE-R7AF-01

| Sonda do juiz | R7A-FINAL-FREEZE | R7A-BOUNDARY-FINAL-FREEZE |
|---|---|---|
| P30c, com equipamento, KEEP gravado ou fadiga | B parte do início guardado por A: passo de retorno 1 nunca executado; semana 6 com corridas de 30 e 45; semana 7 `back-squat 2x5@3 KNOWN 82.5` | B parte da reentrada (`RETURN/w5`), passo 0; semana 6 com corridas de 15 e 20; semana 7 `back-squat 1x5@4 ESTABLISH RETURN_ENTRY`, igual ao controle |
| P30b, 15 células | 13 mudam o início de B; 7 adiantam a corrida | 6 diferem do controle, nenhuma adianta a corrida |

As 6 que diferem são as de domingo (agenda, meta e fadiga). O handler aplicou ali a regra da revisão à semana completa:
- a corrida fica, porque a de quinta foi perdida;
- só os exercícios executados na quarta avançam, com as cargas que a revisão adotou.

As de equipamento, em qualquer horário, e todas as de segunda são iguais ao controle. O juiz de engenharia confirmou nas suas próprias execuções, e o SSCTR aprovou (S-A).

## 6. Regressões

**Contra o R7A-FINAL-FREEZE** (`CoachingCore/r7/boundary/REGRESSION_R7AB.json`): R6 holdout 35/35, R5 24/24, perfis 16/16 e simulações 14/14, idênticos.

**Evidência no freeze** (`probes/EVIDENCE_RUNS_R7AB.json`, `probes/COMPARE_R7AB.json`): 78 execuções, 0 falhas, todas em `36a71ca8…`. Das 77 comparáveis, 68 são idênticas byte a byte, entre elas:
- a grade de primeira semana D59 (E = O = B = 0);
- as de restauração, caps e curta, as leituras D58 e a extensão de primeira semana;
- P13, P14, P17–P21 e P31 nos quatro fusos (V1, V2, V4, V5 = 0 em 216 células), P33–P36 e P38;
- P09 (5.000 sequências, O1–O7 = 0).

As 9 diferenças estão nomeadas em `probes/COMPARE_R7AB_NAMED.json`:
- o QE-R7AF-01 corrigido: P30, P30b e P30c;
- o §11: P37 E1, E2 e E7 perguntam;
- o 0.1:
  - P32 L4 não revisado: o ponto vira a intake, e um relato atrasado da semana 0 pede confirmação;
  - o caso `pauseInWeek3_14d` do instrumento do round 12: num programa sem registro, o agachamento volta com os 80 kg relatados, não com os 82,5 kg que o plano supôs;
- registro: dois probes imprimem o campo novo;
- o self-challenge desta missão.

O juiz de engenharia reexecutou as 47 execuções de engenharia com o seu próprio harness, todas byte a byte iguais.

## 7. Mutação

21 mutantes, só desta semântica: os cinco exemplos do §18 e as peças em que se apoiam. Resultado: 20 pegos e 1 documentado. O documentado é o relógio da decisão, uma proteção sem caminho alcançável: nenhum início que o ponto lê é fixado no corte ou depois dele.

A primeira rodada pegou 16 de 21. Os sobreviventes viraram testes antes do freeze:
- sessão parcial no caso de valor mantido;
- equipamento no domingo;
- mudança só de força depois de uma revisão de domingo;
- evento que replaneja a semana corrente.

**Defeitos achados e corrigidos antes do freeze:**
- A checagem de carga comparava com a carga planejada da linha. Num retorno as linhas são guiadas por esforço, com a carga conhecida como teto, e por isso a projeção mantinha 82,5 kg onde a revisão adotaria os 20 kg levantados.
- Um cenário do self-challenge relatava a corrida de domingo no domingo, o que já é uma revisão.

## 8. Re-check de engenharia (R7AB-QE-r1)

Juiz: `quality-reliability-engineer` em instância nova (claude-opus-5-5, xhigh). Digest `36a71ca8…` no início e no fim, com 0 de 81 arquivos divergentes. Testes 540/540; o verificador em leitura deu 15/17 e, com as duas revisões gravadas, 16/17.

**Veredito: NOT_READY.** A resposta ao §20 é **sim**: um estado projetado ainda é reusado como histórico num caminho V1 comum.

**QE-R7AB-01 (MEDIUM, material, manifestação nova de projetado-vs-histórico).**
- **O mecanismo:**
  - uma revisão semanal, ou um handler que aplica a sua regra, grava o início da semana seguinte como WEEK_EVIDENCE;
  - ela copia sem mudança, do início da própria semana, todo valor que a evidência não moveu (`evidenceStart`), mesmo quando esse início era uma projeção não verificada;
  - o `historicalWeekStart` só confere essa base enquanto há passos de retorno em curso.
- **Onde vale:** nas primeiras semanas do programa, depois de um retorno SHORT e depois de um retorno concluído. Ali um valor que só o plano supôs vira histórico.
- **Reprodução** (`audits/domain-coaching-r7a-boundary-2026-10-28/reviews/qe-r7ab-P40-held-outside-return.mjs`):
  1. Semana 2: o treino de força de sábado não é feito, e a semana não é revisada.
  2. Semana 3: falta de novo, e a semana é revisada.
  3. B, a primeira interrupção do programa, é uma viagem de terça a quarta na semana 4.
  4. Resultado: o ponto de B é a semana 4 (WEEK_EVIDENCE), com `db-rdl` e `db-split-squat` em 22 kg. O registro mostra 20 kg; os 22 kg vêm de um incremento que o plano supôs e nunca foi levantado. O controle, com a semana 2 revisada e os mesmos fatos, dá 20.
- **Variantes:**
  - P40b: 9 de 9 células;
  - P40c: um retorno moderado leva os 22 kg como teto;
  - P41: depois de um retorno curto;
  - P47b: por uma fadiga local de domingo que roda a revisão.
- **Confirmação:** o autor reproduziu o P40 byte a byte (`b76b8259…`). No R7A-FINAL-FREEZE o mesmo valor aparece: o caminho é anterior a esta missão, que não o alcançou.
- **Por que é material:** contradiz o Founder 0.1, §8 e §9, o I2, o I3, o I8 e o item S-F do próprio contrato.
- **Por que a solução atual foi insuficiente:**
  - o WEEK_EVIDENCE certifica o passo da revisão, não a base a que ele foi aplicado;
  - o autor limitou a conferência da base aos retornos, onde a absorção por semana é precisa (fronteira B8);
  - fora deles, essa absorção deixaria fora do histórico, por tempo indefinido, um atleta que perde uma sessão toda semana.
- **Exige revisar o modelo de histórico/estado?** Sim, segundo o juiz. No mínimo, autoridade de evidência recursiva em toda semana; de forma exata, proveniência por valor, que o contrato (B8) chama de modelo de estado novo.

**Não materiais:**
- **QE-R7AB-02 (LOW):** com linhas de estabelecimento, uma semana executada exatamente como planejada e não revisada dá um início um pouco menos avançado (20 kg pendente) que a revisada (20 kg confirmado).
- **QE-R7AB-03 (LOW):** uma correção nomeada que engloba treino registrado *antes* do primeiro relato da interrupção é aplicada em silêncio. É pergunta para o Founder: o "already-attributed execution" do §11 inclui isso?

**Fronteiras:**
- B1, B2, B4, B5, B6, B9, B10 e B11: aceitas.
- B3: a supersessão é aceita, mas a implementação está incompleta pelo QE-R7AB-01.
- B7: aceita, com nota sobre o QE-R7AB-02.
- B8: aceita dentro de um retorno; restringi-la aos retornos é o QE-R7AB-01.

**Recomendações:**
- WEEK_COMPOSITION, EVENT_SUPERSESSION e EXERCISE_MERGE: READY.
- WEEK_START_STATE_AUTHORITY, STATE_PRESERVATION e o lado de engenharia de RETURN_RECOVERY_CEILING: NOT_READY.

## 9. Regressão do SSCTR (R7AB-SSCTR-r1)

Juiz: `sports-science-concurrent-training-reviewer` nativo (claude-opus-5-5, xhigh). Digest `36a71ca8…` no início e no fim; 35 execuções próprias vinculadas. As funções de retorno (`strengthAtBreak`, `startStrengthReturn`, `advanceStrength`, `advanceRun`) são byte a byte iguais.

**Veredito: ACCEPT**, sem achado bloqueante.

| Item | Estado | Base |
|---|---|---|
| D53 | CLOSED | Em 22 caminhos: 0 passos de corrida não executados, 0 tetos acima do primeiro retorno, 0 linhas na dose pré-pausa numa reentrada moderada (o freeze anterior tinha 5 caminhos com passo não executado) |
| D56 | Mantido | 0 subidas ou fins de cap depois de semana não inteira (em 4.173) |
| D57 | Mantido | B 0, C 0 |
| D58 | Mantido | grade curta 0/315 |
| D59 | Mantido | grade de primeira semana E = O = B = 0; grade estendida (1.377) e igualdade de teto em 0 |

**Regras aprovadas:**
- **S-A:** QE-R7AF-01 fechado.
- **S-B:** carga mais leve deixa o início para a revisão ou para a reentrada.
- **S-C:** num programa sem registro, a intake. Exercícios nunca feitos entram pelo estabelecimento da semana 0; o longão-alvo é o relatado (60).
- **S-D:** valores mantidos de projeção voltam ao passo 0.
- **S-E:** o ASK do §11.
- **S-F:** 0 violações nos caminhos que provou.

**Não bloqueante, NF-R7AB-1 → R40.**
- **O efeito:** o início só é histórico quando os dois esportes valem. Numa semana de reentrada sem revisão, uma falha só de força leva a corrida de volta à entrada, mesmo com todas as corridas feitas. Custa até o progresso executado desde o retorno em vigor.
- **R40:** recuo por esporte, e garantir que uma semana de reentrada registrada tarde ainda receba a sua revisão.

**Registros e fila:**
- Os 13 registros foram revinculados como R7AB-SSCTR-r1.
- 12 itens HQ-R7AB-SSCTR-* foram integrados à fila: 175 → 187, append-only (`audits/domain-coaching-r7a-boundary-2026-10-28/QUEUE_INTEGRATION_R7AB.json`).

## 10. Readiness

| Veredito | Valor |
|---|---|
| WEEK_COMPOSITION_INTEGRITY | READY |
| STATE_PRESERVATION_INTEGRITY | NOT_READY (QE-R7AB-01) |
| EVENT_SUPERSESSION_INTEGRITY | READY |
| EXERCISE_MERGE_INTEGRITY | READY |
| RETURN_RECOVERY_CEILING_INTEGRITY | NOT_READY (lado de engenharia, QE-R7AB-01; lado esportivo ACCEPT) |
| WEEK_START_STATE_AUTHORITY | NOT_READY (QE-R7AB-01) |
| R7A_FINAL_ENGINEERING_RECHECK | NOT_READY |
| R7A_FINAL_SCIENTIFIC_RECHECK | READY (ACCEPT) |
| R7A_EXIT_READINESS | **NOT_READY** |

**Blockers:**
- **CLOSED:** QE-R7A-01, QE-R7A1-09, QE-R7A1-10, QE-R7A2-01, 02 e 03; QE-R7AF-01, no seu caminho; QE-R7AF-02; D53, D56, D57, D58 e D59.
- **OPEN:** QE-R7AB-01.

Detalhes em `CoachingCore/r7/boundary/READINESS_R7AB.json`.

## 11. Próximo passo

`NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION`. Nada foi iniciado:
- nem essa missão, nem R7-B0, nem R7-B;
- não há handoff (`CoachingCore/r7/R7A_FINAL_HANDOFF.md` não foi escrito);
- não há segundo freeze, ciclo de correção nem nova sub-fase.

**A decisão necessária, segundo o juiz:** a autoridade de evidência é recursiva em toda semana, ou gravada por valor?

**Leitura do autor, separada da do juiz.** As duas opções trocam cautela por precisão:
- **(a) Autoridade recursiva em toda semana:** uma revisão só vale quando a base a que se aplicou vale, ou quando a semana foi toda executada. É uma mudança pequena, mas descarta progresso revisado depois de uma semana não verificada até uma semana ser toda executada. O NF-R7AB-1 do SSCTR já mostra esse custo dentro de um retorno.
- **(b) Proveniência por valor:** por exercício e por dimensão da corrida, gravar se a evidência moveu o valor ou se ele veio de uma base com autoridade própria. É exata, mas acrescenta um registro por valor a cada início e à leitura do histórico, e por isso é uma decisão de modelo de estado.

**Decisões relacionadas, não bloqueantes:** QE-R7AB-03 (escopo do §11 para treino anterior ao primeiro relato), R40 do SSCTR (recuo por esporte), QE-R7AB-02, QE-R7AF-03/04, R38 e R39.

Ponto de retomada: `audits/domain-coaching-r7a-boundary-2026-10-28/CHECKPOINT.md` e `FINAL_DISPOSITION.json` (`notReadyRecord`).

## Comprovado, inferido e não testado

**Comprovado:** saídas registradas e ligadas ao digest, conferidas por `CoachingCore/scripts/verify-r7ab.mjs` (`CoachingCore/r7/boundary/VERIFICATION_R7AB.json`).
- o baseline e o blocker reproduzidos antes da edição;
- o caminho do QE-R7AF-01 fechado (P30, P30b, P30c), também nas execuções do juiz;
- a identidade sem falha nos quatro fusos;
- D53 e D56–D59 com as grades esportivas iguais byte a byte;
- testes 540/540, e 10 dos 12 novos falhando no R7A-FINAL-FREEZE;
- mutação 20/21 + 1 documentado, self-challenge 0 e 56 no freeze anterior, regressão idêntica;
- os dois vereditos ligados ao freeze;
- o QE-R7AB-01 reproduzido pelo autor byte a byte e presente também no R7A-FINAL-FREEZE.

**Inferido:** que (a) ou (b) fecham o QE-R7AB-01, e que (a) tem o custo de cautela descrito. Nenhuma correção foi escrita nem vista por um juiz.

**Não testado:**
- atletas reais e validação humana, empírica ou clínica;
- dados não sintéticos;
- proveniência por valor;
- a leitura de fatos tardios de semanas antes do ponto (fronteira B2);
- avaliação fora de ordem dos relógios dos relatos.
