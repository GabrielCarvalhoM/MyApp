# DOMAIN_COACHING_R7-A.2 — Founder request (verbatim)

Received 2026-10-28 in a new Claude Code session (clean context), as the whole user message. Preserved below without edits.

---

# DOMAIN_COACHING_R7-A.2
## INTERRUPTION IDENTITY & RETURN-STATE CLOSURE

Você está iniciando uma NOVA sessão, sem assumir contexto conversacional anterior.

Projeto:

`C:\Users\carva\Desktop\myApp\MyApp`

Esta é uma missão extraordinariamente estreita de fechamento da fase R7-A.

Ela existe exclusivamente porque:

`R7A_EXIT_READINESS = NOT_READY`

após R7-A e R7-A.1.

NÃO é:

- R7-B;
- R7-B0;
- uma nova rodada geral de Coaching Domain;
- uma oportunidade de melhorar o treinador;
- uma missão de expansão.

É a última tentativa bounded de fechar a fundação de estado/retorno antes da próxima fase.

---

# 0. PERGUNTA ÚNICA DA MISSÃO

Responder, com evidência:

> **Um retorno agora parte do estado que o atleta realmente possuía no instante em que AQUELA interrupção específica começou, distinguindo corretamente correções da mesma pausa de novas pausas independentes?**

A missão deve resolver somente a causa compartilhada de:

- `QE-R7A1-09`;
- `QE-R7A1-10`;
- `D59`;

e, por consequência, permitir o fechamento de:

- `QE-R7A-01`;
- `D53`.

Nada além disso justifica expansão da missão.

---

# 1. REIDRATAÇÃO MÍNIMA OBRIGATÓRIA

Antes de editar qualquer coisa, leia:

- `AGENTS.md`
- `CLAUDE.md`
- `CURRENT_MISSION.md`
- `MISSION_LEDGER.md`

Depois leia especificamente:

- `CoachingCore/r7/a1/FINAL_REPORT_R7A1.md`
- `CoachingCore/r7/a1/READINESS_R7A1.json`
- `CoachingCore/r7/a1/VERIFICATION_R7A1.json`
- `audits/domain-coaching-r7a1-2026-10-27/FINAL_DISPOSITION.json`
- `WEEK_COMPOSITION_CONTRACT.md`, no locator canônico vigente
- freeze manifest do `R7A1-FREEZE-A2`
- parecer final/re-check de engenharia da R7-A.1
- parecer final/re-check do SSCTR da R7-A.1
- probes P13/P14 e first-week grid que reproduzem os blockers
- policies/authorities estritamente necessárias para return/recovery.

Descubra os paths canônicos atuais pelos índices/ledger.

Se um arquivo citado aqui tiver successor oficialmente registrado, use o successor.

NÃO reidrate documentação ampla sem consumidor nesta missão.

---

# 2. HISTÓRIA É IMUTÁVEL

Preserve integralmente:

- R6;
- R7-A;
- R7-A.1;
- FREEZE-1/FREEZE-2 históricos;
- FREEZE-A1/FREEZE-A2 históricos;
- pareceres anteriores;
- hashes;
- holdouts;
- queues anteriores;
- resultados NOT_READY.

R7-A.2 gera evidência nova e aditiva.

NÃO altere o passado para fazê-lo parecer aprovado.

---

# 3. BASELINE OBRIGATÓRIO

Antes da implementação:

1. confirme o source digest vigente do `R7A1-FREEZE-A2`;
2. execute o verificador R7-A.1 em modo read-only;
3. confirme os testes atuais;
4. reproduza diretamente:

   - `QE-R7A1-09`;
   - `QE-R7A1-10`;
   - `D59`.

As saídas devem corresponder aos pareceres registrados.

Se qualquer baseline divergir materialmente, pare e diagnostique antes de editar.

---

# 4. ESTADO JÁ CONSIDERADO RESOLVIDO

R7-A.2 NÃO deve reabrir sem nova evidência material:

`WEEK_COMPOSITION_INTEGRITY = READY`

`EVENT_SUPERSESSION_INTEGRITY = READY`

`EXERCISE_MERGE_INTEGRITY = READY`

Também estão fechados no fechamento anterior:

- QE-R7A-02;
- QE-R7A-03;
- QE-R7A-05;
- QE-R7A-12;
- QE-R7A-19;
- D56;
- D57;
- D58.

Preserve seus comportamentos e regressões.

Se a implementação desta missão quebrar algum deles, isso é regressão bloqueante.

---

# 5. CAUSA RAIZ A SER TRATADA

Os dois revisores convergiram para a mesma deficiência.

Hoje, o retorno ainda depende de conceitos equivalentes a:

- fotografia do início da semana da pausa;
- `startBeforeReturn`;
- easy slot anteriormente registrado;

sem representar suficientemente:

1. QUAL interrupção está sendo relatada;
2. se o novo relato é correção da MESMA interrupção ou uma NOVA pausa;
3. qual era o estado REALMENTE EXECUTADO no instante em que a pausa começou.

Isso causa:

### QE-R7A1-09 — HIGH
Uma nova pausa separada pode ser interpretada como correção da pausa anterior e restaurar estado anterior à primeira pausa.

### QE-R7A1-10 — MEDIUM
Uma nova pausa curta pode reutilizar o easy slot já consumido pela pausa anterior.

### D59 — BLOCKING
Exercícios executados na semana antes da pausa, especialmente primeiras exposições, podem desaparecer do estado utilizado pelo retorno.

A correção deve atacar ESSA CAUSA.

Não faça três patches independentes.

---

# 6. MODELO CONCEITUAL MÍNIMO

Introduza somente o mínimo necessário para representar explicitamente o episódio de interrupção.

O conceito pode ter outro nome no código, mas semanticamente precisa existir algo equivalente a:

```text
InterruptionEpisode
- identity
- startedAt
- endedAt, when known
- reportedAt
- relationToPreviousReport
```

e uma representação de:

```text
ExecutedStateAtInterruption
```

que signifique:

> estado acumulado pelas exposições realmente executadas até `interruption.startedAt`, excluindo o que aconteceu depois.

NÃO transforme isso em sistema de event sourcing geral se o runtime não precisar.

Execution Proportionality.

---

# 7. INVARIANTES OBRIGATÓRIAS

Antes de implementar, materialize e teste as seguintes invariantes.

Os nomes podem mudar, o significado não.

## I1 — INTERRUPTION IDENTITY

Duas interrupções temporalmente distintas são episódios distintos.

Mesmo que:

- estejam na mesma semana;
- sejam do mesmo tamanho;
- tenham o mesmo motivo;
- sejam reportadas pelo mesmo handler.

---

## I2 — SAME-INTERRUPTION SUPERSESSION

Um relato mais novo sobre a MESMA interrupção pode superseder/corrigir o anterior.

Correção da mesma pausa NÃO cria uma nova pausa.

O estado correto previamente associado àquela interrupção pode ser reutilizado quando semanticamente apropriado.

---

## I3 — DISTINCT-INTERRUPTION INDEPENDENCE

Uma nova pausa, iniciada depois de uma reentrada, NÃO pode utilizar como ponto de partida o estado anterior à pausa passada.

Formalmente:

```text
break B starts after re-entry from break A
→ return(B) starts from athlete state accumulated after A
→ never from pre-A state
```

---

## I4 — TEMPORAL STATE CAUSALITY

O estado de retorno é reconstruído no instante da interrupção:

```text
executedStateAt(interruption.startedAt)
```

Não:

```text
stateAt(startOfWeek)
```

e não:

```text
stateAt(reportTime)
```

---

## I5 — INTRAWEEK EXECUTION PRESERVATION

Exposições realmente executadas antes da pausa na mesma semana pertencem ao estado pré-pausa.

Isso inclui:

- exercício já conhecido;
- primeira exposição daquele exercício;
- NONE;
- FAMILIAR;
- KNOWN.

---

## I6 — NO FUTURE LEAKAGE

Eventos/exposições posteriores ao início da pausa não podem contaminar o estado usado para definir o retorno daquela pausa.

---

## I7 — NO PROGRESSION LAUNDERING

Preservar uma exposição executada antes da pausa NÃO significa conceder automaticamente:

- progressão futura;
- block set ainda não conquistado;
- desenvolvimento que exigia conclusão posterior.

Preservar:

> fato executado.

Não inventar:

> progressão não realizada.

---

## I8 — RETURN ENTRY / CEILING CONTINUITY

O return recipe vigente continua valendo.

Quando aplicável:

- entry;
- return step;
- RIR;
- ceiling;
- regain progression;

não podem ser bypassados porque a primeira exposição ocorreu na semana da pausa.

Nenhum novo caminho conhecido pode reintroduzir saltos equivalentes aos que bloquearam:

- D53;
- D55;
- D56;
- D57;
- D59.

---

## I9 — EASY SLOT OWNERSHIP

O easy slot criado por um short return pertence àquela interrupção específica.

Uma nova pausa curta:

- não reutiliza slot histórico já consumido;
- recebe sua própria decisão/slot conforme policy vigente.

---

# 8. NÃO CRIAR POLICY ESPORTIVA NOVA

A correção deve ser runtime/state semantics.

NÃO altere R6-POLICY-5 apenas para fazer os testes passarem.

Se surgir uma decisão esportiva realmente nova necessária:

- documente;
- envie ao SSCTR;
- não invente silenciosamente.

A expectativa inicial é que D59 possa ser corrigido sem mudança de policy, aplicando corretamente as regras já existentes.

---

# 9. OPERAÇÃO CANÔNICA DE ESTADO

Investigue se a solução mais simples é criar uma operação conceitualmente equivalente a:

```text
stateAt(timestamp)
```

ou:

```text
executedStateBefore(interruption.startedAt)
```

Ela deve reconstruir apenas fatos executados/autorizados até aquele instante.

Não force exatamente essa API.

Mas evite continuar espalhando lógica como:

```text
stateTrace[pauseWeek]
startBeforeReturn ?? ...
```

se isso reproduzir a mesma ambiguidade.

O objetivo é uma única semântica para:

> “qual era o estado real do atleta quando esta pausa começou?”

---

# 10. CASOS DE TESTE — IDENTIDADE DA PAUSA

No mínimo:

### SAME BREAK / CORRECTION

- relato inicial;
- correção posterior da mesma pausa;
- correção na mesma semana;
- correção em semana posterior.

Esperado:

uma única interrupção sem duplicação.

---

### DISTINCT BREAK — SAME WEEK

- pausa A;
- retorno/reentrada;
- pausa B distinta na mesma semana.

Esperado:

B parte do estado após A/reentrada.

---

### DISTINCT BREAK — CROSS WEEK

- pausa A;
- reentrada;
- progressão/execução válida;
- pausa B em semana posterior.

Esperado:

nenhum estado anterior à A reaparece.

---

### SHORT + SHORT

- short pause A;
- easy slot A executado;
- short pause B.

Esperado:

B não reutiliza o slot A.

---

# 11. CASOS — STATE AT INTERRUPTION

Criar famílias equivalentes cobrindo:

### First loaded week

Atleta inicia força.

Executa exercício.

Depois entra em pausa.

Retorno deve reconhecer que o exercício foi executado.

---

### NONE

Primeira exposição antes da pausa.

---

### FAMILIAR

Exposição antes da pausa sem carga plenamente conhecida.

---

### KNOWN

Carga/count conhecidos antes da pausa.

---

### Multiple exposures

Mais de uma exposição antes da pausa.

---

### Exercise not yet executed

Exercício planejado, mas não executado antes da pausa.

NÃO deve aparecer artificialmente no executed state.

---

### After pause starts

Sessão com timestamp posterior a `pause.startedAt`.

NÃO pode entrar no estado pré-pausa.

---

# 12. PROPERTY / METAMORPHIC TESTS

Além dos exemplos, prove propriedades.

## P1 — Same interruption idempotence

Corrigir os metadados de uma mesma pausa sem alterar sua semântica material:

→ não cria novo episódio.

---

## P2 — Distinct interruption isolation

Adicionar uma segunda pausa válida:

→ nunca restaura estado anterior à primeira.

---

## P3 — Knowledge monotonicity before pause

Adicionar uma exposição válida antes da pausa:

→ não pode tornar o estado de retorno menos informado.

---

## P4 — Temporal boundary

Mover uma exposição:

```text
before pause.startedAt
→ after pause.startedAt
```

deve remover sua influência no estado pré-pausa.

O inverso deve adicioná-la quando válida.

---

## P5 — Same-week boundary invariance

O significado da pausa não muda apenas porque:

```text
Sunday 23:xx → Monday 00:xx
```

atravessou uma semana, quando os demais fatos são semanticamente equivalentes.

---

## P6 — Report-time invariance

Alterar somente o momento em que a mesma interrupção é relatada não deve transformar a pausa em outra entidade.

---

# 13. D59 — CRITÉRIO ESPECÍFICO

D59 só fecha se a grade pertinente demonstrar:

Para NONE e FAMILIAR:

```text
E = 0
O = 0
B = 0
```

e para KNOWN:

```text
O = 0
```

usando a nomenclatura do instrumento SSCTR vigente.

Além disso:

- entry do retorno deve ocorrer;
- block-in-progress não ganha progressão indevida;
- ceiling usa o último count executado pertinente antes da interrupção;
- nenhuma contagem sobe mais que o permitido pelas regras já vigentes.

Preserve as grades de:

- restauração;
- caps;
- short return.

---

# 14. QE-R7A1-09 — CRITÉRIO ESPECÍFICO

Reproduza os casos P13 existentes.

Depois da correção:

- primeira reentrada continua presente;
- segunda pausa parte do estado atual;
- `returnStep` não desaparece indevidamente;
- run `RETURN` não vira EASY por ressuscitar contexto pré-pausa;
- strength não volta diretamente para dose pré-primeira-pausa.

Testar:

- mesma semana;
- cross-week.

---

# 15. QE-R7A1-10 — CRITÉRIO ESPECÍFICO

Reproduza P14.

Depois:

- cada short return tem identidade própria;
- slot da pausa A não satisfaz a obrigação da pausa B;
- primeira quality elegível após B recebe o comportamento previsto pelo D58 vigente;
- exatamente o efeito autorizado ocorre.

---

# 16. REGRESSÕES OBRIGATÓRIAS

Preserve:

- 505 testes existentes;
- R5 corpus;
- R6 regression corpus;
- R7-A regressions;
- R7-A.1 tests;
- WEEK_COMPOSITION_CONTRACT;
- D56;
- D57;
- D58;
- event supersession;
- exercise merge;
- equipment/date composition;
- same-day composition.

Não usar quantidade de testes como headline de sucesso.

---

# 17. MUTATION TESTING

Adicionar mutantes somente para as novas invariantes materiais:

exemplos:

- ignorar interruption identity;
- tratar toda pausa posterior como same-pause correction;
- usar start-of-week no lugar de state-at-interruption;
- ignorar primeira exposição pré-pausa;
- permitir easy slot de outra pausa.

Não expandir mutation testing para áreas não tocadas.

Cada mutante material deve:

- ser pego;
- ou ter justificativa explícita convincente.

---

# 18. ENGINEERING SELF-CHALLENGE ANTES DO FREEZE

Antes de congelar, o AUTOR deve tentar quebrar sua própria implementação.

Não dependa dos juízes para descobrir casos óbvios.

Procure especialmente:

- duas pausas;
- três pausas;
- pausa corrigida + pausa nova;
- report atrasado;
- first exposure;
- week boundary;
- pause start no mesmo dia de uma sessão;
- timestamp order;
- missed/unreported session;
- equipamento/adaptação ocorrendo entre duas pausas.

Não transforme isso em exploração ilimitada.

Use equivalence classes.

---

# 19. PROCESSO DESTA MISSÃO — SEM CORRECTION CYCLE

Esta missão tem deliberadamente um processo menor que A.1.

## ETAPA 1 — BUILD

- implementar causa raiz;
- criar invariantes;
- testes;
- properties;
- probes;
- mutation pertinente;
- self-challenge.

## ETAPA 2 — CANDIDATE

Executar regressões e evidência pertinente.

Se o autor conhece blocker:

NÃO congelar como READY candidate.

Corrija ANTES do freeze.

## ETAPA 3 — ÚNICO FREEZE

Criar:

`R7A2-FREEZE-1`

ou nome equivalente canônico.

A partir daqui:

runtime congelado.

## ETAPA 4 — DOIS RE-CHECKS EM PARALELO

- Quality & Reliability Engineering;
- SSCTR.

Ambos revisam EXATAMENTE os mesmos bytes.

## ETAPA 5 — FIM

Se os dois aprovarem:

READY.

Se qualquer um encontrar blocker material da classe:

NOT_READY.

**NÃO existe correction cycle depois do freeze.**

NÃO criar automaticamente:

- FREEZE-2;
- A.2.1;
- terceiro juiz;
- nova rodada.

Nesse caso retornar ao Founder para decisão arquitetural.

---

# 20. ENGINEERING RE-CHECK

O juiz de engenharia deve ser uma instância nova.

Escopo prioritário:

- P13;
- P14;
- P02;
- P09;
- nova interruption identity;
- state-at-interruption;
- same-pause vs distinct-pause;
- temporal causality;
- preservação dos READY anteriores.

Pergunta:

> “Existe qualquer caminho normal V1 em que uma interrupção seja confundida com outra ou em que retorno parta de um estado temporalmente incorreto?”

Não ampliar para cold start/program quality.

---

# 21. SSCTR RE-CHECK

SSCTR revisa somente o conteúdo esportivo pertinente:

- D59;
- D53;
- return entry;
- recovery/restoration ceiling;
- short-return easy slot;
- regressões D56/D57/D58.

Reexecutar:

- first-week grid;
- restoration grid;
- cap grid;
- short-return grid;

nos limites necessários.

Não reabrir decisões científicas não afetadas.

---

# 22. GATES DE SAÍDA

Para autorizar o fechamento da fase A:

### Blockers

`QE-R7A1-09 = CLOSED`

`QE-R7A1-10 = CLOSED`

`D59 = CLOSED`

e, por consequência:

`QE-R7A-01 = CLOSED`

`D53 = CLOSED`

### Readiness

`WEEK_COMPOSITION_INTEGRITY = READY`

`STATE_PRESERVATION_INTEGRITY = READY`

`EVENT_SUPERSESSION_INTEGRITY = READY`

`EXERCISE_MERGE_INTEGRITY = READY`

`RETURN_RECOVERY_CEILING_INTEGRITY = READY`

`R7A2_ENGINEERING_RECHECK = READY`

`R7A2_SCIENTIFIC_RECHECK = READY`

`R7A_EXIT_READINESS = READY`

---

# 23. O QUE NÃO É EXIGIDO

NÃO exigir nesta missão:

`AUTONOMOUS_COACHING_READY`

`COACHING_DECISION_QUALITY = READY`

`KMP_READY`

`PRODUCTION_READY`

`REAL_USER_VALIDATION`

Essas conclusões não pertencem à fase A.

---

# 24. SE READY

Se e somente se:

`R7A_EXIT_READINESS = READY`

criar:

`CoachingCore/r7/R7A_FINAL_HANDOFF.md`

O handoff deve ser CURTO.

Incluir:

## Freeze identity
- runtime/hash;
- tests;
- reviewers.

## State semantics
- interruption identity;
- executed-state-at-interruption;
- same-pause supersession;
- distinct-pause behavior;
- easy-slot ownership.

## Resolved blockers
IDs.

## Preserved readiness
READYs da fase A.

## Remaining scope
Apenas B0/B/C/D/post-V1.

## Rehydration
Lista mínima da próxima sessão.

## Exact next mission

IMPORTANTE:

A próxima missão NÃO é o antigo R7-B imediatamente.

Registrar como:

`R7-B0 — V1 COACHING REPERTOIRE FOUNDATION`

NÃO iniciar B0 nesta sessão.

---

# 25. SOBRE R7-B0

Apenas registrar o nome/ponto de retomada.

NÃO desenvolver ainda:

- archetypes;
- pace;
- marathon;
- run calibration;
- strength repertoire;
- hybrid-week patterns;
- confirmation-first;
- V1 boundaries;
- learning.

Esses itens serão objeto da próxima missão em nova sessão.

---

# 26. SE NOT_READY

Se qualquer juiz bloquear o freeze:

- encerre `R7-A.2 = NOT_READY`;
- documente o blocker;
- root cause;
- reprodução;
- se representa falha desta mesma arquitetura ou uma nova classe;
- menor decisão arquitetural necessária.

NÃO:

- corrigir depois do freeze;
- iniciar A.2.1;
- iniciar R7-B0;
- iniciar R7-B.

A decisão volta ao Founder.

---

# 27. CURRENT_MISSION E LEDGER

Ao finalizar:

- atualizar `CURRENT_MISSION.md` de forma aditiva;
- atualizar `MISSION_LEDGER.md`;
- preservar histórico;
- registrar freeze e reviews;
- registrar disposition.

Se READY:

`NEXT_MISSION = DOMAIN_COACHING_R7-B0`

Se NOT_READY:

`NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION`

Não iniciar nenhuma delas.

---

# 28. RELATÓRIO FINAL

Produzir um relatório curto e objetivo com:

1. baseline;
2. causa raiz confirmada ou refutada;
3. modelo implementado;
4. interruption identity;
5. state-at-interruption;
6. invariantes;
7. blockers;
8. regressões;
9. mutation;
10. engenharia;
11. SSCTR;
12. readiness;
13. próxima missão exata.

Separar:

- COMPROVADO;
- INFERIDO;
- NÃO TESTADO.

---

# 29. ANTI-OVERENGINEERING

Não criar:

- event sourcing geral;
- banco de eventos novo;
- abstração multiplataforma;
- framework de timeline genérico;
- novo planner;
- nova policy;
- nova family de workouts;

a menos que seja impossível fechar a causa demonstrada sem isso.

O objetivo não é construir a arquitetura histórica perfeita.

É representar corretamente:

> **esta interrupção específica começou neste instante, e este era o estado realmente executado do atleta naquele momento.**

---

# 30. PRINCÍPIO FINAL

Esta missão deve conseguir distinguir corretamente:

```text
“estou corrigindo o que aconteceu naquela mesma pausa”
```

de:

```text
“o atleta teve outra pausa depois”
```

e deve saber responder:

```text
“o que ele realmente havia executado quando essa pausa começou?”
```

Se essas três perguntas tiverem resposta única, consistente e demonstrada:

R7-A pode fechar.

Se ainda houver ambiguidade estrutural depois do único freeze:

pare.

Não persiga indefinidamente.

---

# EXECUTE

Reidrate somente o necessário.

Confirme o baseline.

Reproduza os três blockers.

Formalize as invariantes.

Implemente a menor correção estrutural suficiente.

Ataque você mesmo os equivalentes antes do freeze.

Congele UMA vez.

Despache os dois re-checks estreitos sobre os mesmos bytes.

Se ambos aprovarem:

`R7A_EXIT_READINESS = READY`

gere o handoff curto e pare.

Se qualquer um bloquear:

`R7A_EXIT_READINESS = NOT_READY`

registre a decisão necessária e pare.

NÃO inicie R7-B0 nem R7-B nesta sessão.
