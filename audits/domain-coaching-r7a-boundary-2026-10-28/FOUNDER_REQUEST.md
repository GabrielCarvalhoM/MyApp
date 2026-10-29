# DOMAIN_COACHING_R7-A — Final Boundary Closure — Founder request (verbatim)

Received 2026-10-28 in a new Claude Code session (clean context), as the whole user message. Preserved below without edits.

---

# DOMAIN_COACHING_R7-A — FINAL BOUNDARY CLOSURE
## WEEK-START STATE AUTHORITY & RETURN CONTINUITY

Você está iniciando uma NOVA sessão, sem assumir contexto conversacional anterior.

Projeto:

`C:\Users\carva\Desktop\myApp\MyApp`

Esta é uma MICRO-MISSÃO FINAL de fechamento da fase R7-A.

Ela ocorre depois de:

- DOMAIN_COACHING_R7-A;
- R7-A.1;
- R7-A.2;
- R7-A FINAL CLOSURE — Interruption Episode Identity.

A última missão encerrou:

`R7A_EXIT_READINESS = NOT_READY`

por UM finding material novo de engenharia:

`QE-R7AF-01`

O SSCTR aceitou o mesmo freeze.

Todos os blockers nomeados pela missão anterior foram fechados.

Esta missão NÃO deve reabrir a fase A inteira.

---

# 0. DECISÃO ARQUITETURAL DO FOUNDER

Esta decisão está dada e NÃO deve ser rediscutida.

## 0.1 Estado planejado não é automaticamente estado histórico

O runtime deve distinguir semanticamente entre:

### PROJECTED / REPLANNED STATE

Estado criado porque o treinador:

- replanejou;
- adaptou;
- aplicou retorno;
- reconstruiu uma semana;
- projetou a próxima semana.

Esse estado representa:

> o plano que deveria acontecer.

Ele NÃO é automaticamente evidência de que aquilo aconteceu.

---

### EVIDENCE-ANCHORED STATE

Estado derivado de:

- execução observada;
- evidência válida;
- revisão consolidada;
- corrections/provenance aplicáveis;

representando:

> o que o atleta efetivamente acumulou até aquele boundary temporal.

Somente esse tipo de estado pode ser tratado como verdade histórica para reconstruções posteriores.

Os nomes concretos no código podem ser diferentes.

A semântica é obrigatória.

---

# 1. BLOCKER ÚNICO

Resolver:

`QE-R7AF-01`

Comportamento reproduzido no freeze anterior:

1. atleta entra em retorno;
2. semana de reentrada é replanejada;
3. essa semana ainda não terminou e não foi consolidada por evidência/revisão;
4. ocorre uma nova decisão posterior;
5. o sistema utiliza um início de semana gravado pela replanificação como se fosse estado histórico confirmado;
6. dose/estado pode regressar ou se desalinhar do retorno real.

A correção deve impedir que:

> **um state boundary meramente projetado adquira autoridade histórica apenas porque foi armazenado.**

---

# 2. PERGUNTA ÚNICA DA MISSÃO

Responder com evidência:

> **Todo início de semana reutilizado como base histórica agora possui autoridade derivada de evidência real da semana anterior, em vez de ser apenas uma projeção criada por replanejamento?**

Se SIM:

R7-A pode fechar.

Se NÃO:

pare.

---

# 3. REIDRATAÇÃO MÍNIMA

Antes de editar:

- `AGENTS.md`
- `CLAUDE.md`
- `CURRENT_MISSION.md`
- `MISSION_LEDGER.md`

Depois localize e leia somente o necessário das últimas fases:

### R7-A.1
- WEEK_COMPOSITION_CONTRACT;
- handoff/relatório pertinente à composição.

### R7-A.2
- final report;
- return-state semantics.

### R7-A FINAL CLOSURE
- final report;
- readiness;
- final disposition;
- freeze manifest;
- engineering re-check;
- SSCTR re-check;
- reprodução de `QE-R7AF-01`.

Use locators/índices vigentes.

Não carregue toda a história do R6/R7 se não houver consumidor.

---

# 4. HISTÓRIA IMUTÁVEL

NÃO alterar:

- freezes anteriores;
- reviews anteriores;
- hashes;
- relatórios históricos;
- verdicts NOT_READY;
- filas antigas;
- evidências passadas.

Esta missão gera apenas evidência nova append-only.

---

# 5. BASELINE

Antes da implementação:

1. confirme exatamente o último freeze;
2. execute o verificador read-only;
3. confirme a suíte atual;
4. reproduza `QE-R7AF-01` byte-for-byte ou semanticamente igual ao judge probe;
5. confirme que o SSCTR anterior continua ACCEPT no freeze histórico.

Se o blocker não for reproduzível:

pare e investigue o baseline.

---

# 6. NÃO REABRIR O QUE JÁ FECHOU

Preservar obrigatoriamente:

- interruption episode identity;
- same-pause correction;
- distinct-pause behavior;
- temporal state at interruption;
- late evidence behavior;
- D53;
- D56;
- D57;
- D58;
- D59;
- QE-R7A-01;
- QE-R7A1-09;
- QE-R7A1-10;
- WEEK_COMPOSITION_INTEGRITY;
- EVENT_SUPERSESSION_INTEGRITY;
- EXERCISE_MERGE_INTEGRITY.

Qualquer regressão nesses itens bloqueia esta missão.

---

# 7. MODELO MÍNIMO DE AUTORIDADE DO STATE BOUNDARY

A solução deve introduzir uma semântica explícita equivalente a:

```text
WeekStartState {
    state
    provenance
    evidenceThrough
    authority
}
```

onde `authority` conceitualmente distingue pelo menos:

```text
PROJECTED
EVIDENCE_ANCHORED
```

Os nomes concretos podem ser diferentes.

Não é obrigatório criar exatamente essa struct.

O requisito é:

> qualquer código que pretenda reutilizar um week-start como fato histórico deve conseguir saber POR QUE aquele state tem autoridade histórica.

---

# 8. REGRA CANÔNICA

Um início de semana pode ser usado como histórico consolidado somente se for derivado de:

```text
executed state of previous period
+
valid evidence/review/correction
```

NÃO apenas porque:

```text
a return replanned that week
```

ou:

```text
another handler stored a start state
```

ou:

```text
the field exists
```

---

# 9. NÃO CONFUNDIR PLANEJAMENTO COM EXECUÇÃO

Exemplo proibido:

```text
return proposes:
Week 6 start = RETURN step 1

nothing has been executed yet

later handler:
"there is a Week 6 start, therefore this is factual history"
```

Isso está errado.

O planner pode utilizar aquele estado para compor o plano.

Mas ele não pode virar automaticamente:

```text
historical athlete state
```

até ser legitimado por evidência.

---

# 10. EVIDENCE-ANCHORED NÃO PRECISA SIGNIFICAR SOMENTE WEEKLY REVIEW

Não hardcode:

```text
reviewExists == historicalAuthority
```

se o domínio já possuir outras fontes válidas de consolidação.

Investigue o modelo atual.

A autoridade pode derivar de:

- completed sessions;
- valid historical correction;
- canonical review;
- other currently authorized evidence.

O princípio é:

> evidência factual, não existência de uma projeção.

---

# 11. TEMPORAL CONTRADICTION — DECISÃO DO FOUNDER

Há uma questão menor já identificada:

uma correção nomeada da mesma interrupção pode alterar `startedAt` para uma data que contradiz temporalmente uma reentrada já atribuída àquela pausa.

Regra:

```text
same episode correction
+
new facts contradict already-attributed re-entry/execution
+
material effect on prescription
→ ASK / fail closed
```

Não resolver automaticamente escolhendo uma narrativa.

Exemplo:

```text
pause A originalmente termina antes da re-entry
↓
correction move pause A para depois da própria re-entry
```

Se ambas não podem ser verdade simultaneamente:

→ ASK.

Não reconstruir silenciosamente uma história impossível.

---

# 12. OBJETIVO DE IMPLEMENTAÇÃO

Preferir uma correção pequena e estrutural.

Algo conceitualmente como:

```text
getHistoricalWeekStart(...)
```

ou:

```text
authoritativeStateAtBoundary(...)
```

que rejeite/proíba projected-only state para consumidores históricos.

NÃO é obrigatório usar essas APIs.

Mas evite espalhar:

```text
if return && not reviewed ...
```

em handlers individuais.

O consumidor deve perguntar:

> **este state possui autoridade histórica?**

---

# 13. INVARIANTES

Formalizar/testar no mínimo:

## I1 — PROJECTED ≠ HISTORICAL

Um state criado apenas por replanificação não é factual.

---

## I2 — EVIDENCE ANCHOR

Todo state utilizado como histórico possui provenance/evidence suficiente para explicar sua autoridade.

---

## I3 — NO PROJECTION PROMOTION

Persistência em um campo não transforma projeção em fato.

---

## I4 — RETURN CONTINUITY

Uma nova decisão depois do retorno não pode apagar/reverter a reentrada apenas porque encontra um boundary projetado.

---

## I5 — EXECUTION PROMOTES AUTHORITY

Quando execução/evidência válida ocorre, o state correspondente pode tornar-se historical/evidence-anchored conforme os contratos vigentes.

---

## I6 — LATE EVIDENCE

Correção histórica válida pode alterar state factual quando o timestamp executado pertence ao período pertinente.

---

## I7 — TEMPORAL CONTRADICTION FAIL-CLOSED

Se uma correction torna a história temporalmente contraditória e isso altera prescrição:

→ ASK.

---

## I8 — HANDLER INDEPENDENCE

Equipment, schedule, goal, event ou outros handlers não podem obter comportamento diferente apenas porque um deles leu projected state como factual.

---

# 14. TESTE DIRETO DO QE-R7AF-01

O judge probe original deve falhar no baseline e passar no candidato.

Cobrir especificamente:

```text
return
→ re-entry week planned
→ week not yet completed/reviewed
→ later change
```

Esperado:

- não voltar a dose pré-pausa;
- não apagar return state;
- não fabricar evidência;
- não usar projected state como histórico.

---

# 15. FAMÍLIAS DE TESTE

Além do probe original:

### A. Return + equipment statement
Inclusive no-op equipment statement.

### B. Return + schedule change

### C. Return + goal/event change

### D. Return + completed session

Depois da execução real, verificar se autoridade factual evolui corretamente.

### E. Return + weekly review

Verificar consolidação normal.

### F. Return + correction of historical execution

### G. Return + another interruption episode

Preservar identity semantics já fechadas.

### H. Return week with no execution

Projected state nunca deve virar factual apenas pela passagem do tempo.

---

# 16. PROPERTY / METAMORPHIC TESTS

## P1 — No-op handler invariance

Aplicar uma mudança sem efeito real:

→ não pode promover projected state a historical.

---

## P2 — Equivalent handler independence

Duas mudanças equivalentes executadas por handlers diferentes:

→ mesma base factual.

---

## P3 — Evidence promotion

Adicionar execução válida:

```text
projected → evidence anchored
```

somente pelo mecanismo autorizado.

---

## P4 — Remove evidence

Remover/corrigir uma observação que sustentava o state:

→ autoridade histórica deve ser recalculável conforme provenance contract.

---

## P5 — Boundary crossing

Virar semana sem nova evidência:

→ não transforma automaticamente projected em factual.

---

# 17. SELF-CHALLENGE ANTES DO FREEZE

ANTES do único freeze:

tente quebrar a solução com:

- return + no-op change;
- return + equipment;
- return + schedule;
- return + event;
- return + review;
- return + no review;
- return + partial execution;
- return + late evidence;
- return + new pause;
- cross-week;
- correction temporal contraditória.

Use equivalence classes.

Não gerar uma exploração infinita.

Se encontrar bug, corrigir ANTES do freeze.

---

# 18. MUTATION

Criar mutantes somente para esta semântica.

Exemplos:

- tratar PROJECTED como HISTORICAL;
- remover evidence check;
- considerar qualquer stored state authoritative;
- promover estado na virada da semana sem evidência;
- ignorar contradição temporal.

Cada mutante material:

- deve ser capturado;
- ou ter justificativa explícita.

---

# 19. PROCESSO — UM ÚNICO FREEZE

## BUILD

Implementar e testar.

## SELF-CHALLENGE

Autor tenta quebrar.

## FREEZE

Criar:

`R7A-BOUNDARY-FINAL-FREEZE`

ou nome canônico equivalente.

Depois desse ponto:

NÃO editar runtime.

---

# 20. RE-CHECK DE ENGENHARIA

Instância nova.

É o gate principal.

Reexecutar:

- probe original QE-R7AF-01;
- relevant previous return probes;
- interruption-identity regression;
- no-op handler;
- cross-week;
- evidence promotion;
- temporal contradiction.

Pergunta central:

> **Existe algum caminho V1 comum em que um state projetado/replanejado seja reutilizado como histórico sem evidência que lhe dê essa autoridade?**

Se SIM:

NOT_READY.

---

# 21. SSCTR

SSCTR é apenas regression sanity check.

NÃO reabrir literatura/domain inteiro.

Confirmar que nenhuma alteração de state authority quebrou:

- D53;
- D56;
- D57;
- D58;
- D59;
- return entry;
- recovery ceilings;
- restoration semantics.

Se outputs esportivos continuam dentro das regras aprovadas:

ACCEPT.

---

# 22. SEM CORRECTION CYCLE

Após o freeze:

```text
reviews
↓
READY ou NOT_READY
```

Não existe:

- segundo freeze;
- correction cycle;
- nova subfase automática.

Se o judge encontrar outro blocker estrutural material:

pare e retorne ao Founder.

Isso será evidência suficiente para reconsiderar o modelo de history/state, e não continuar corrigindo indefinidamente.

---

# 23. GATE FINAL

Para fechar R7-A:

```text
QE-R7AF-01 = CLOSED
```

e todos os blockers anteriores permanecem CLOSED.

Readiness necessária:

```text
WEEK_COMPOSITION_INTEGRITY = READY
STATE_PRESERVATION_INTEGRITY = READY
EVENT_SUPERSESSION_INTEGRITY = READY
EXERCISE_MERGE_INTEGRITY = READY
RETURN_RECOVERY_CEILING_INTEGRITY = READY
WEEK_START_STATE_AUTHORITY = READY

R7A_FINAL_ENGINEERING_RECHECK = READY
R7A_FINAL_SCIENTIFIC_RECHECK = READY

R7A_EXIT_READINESS = READY
```

---

# 24. NÃO DECLARAR

Ainda NÃO declarar:

- AUTONOMOUS_COACH_READY;
- global coaching quality ready;
- KMP ready;
- production ready;
- human validated.

Apenas:

> semantic/state foundation R7-A closed.

---

# 25. SE READY

Criar finalmente:

`CoachingCore/r7/R7A_FINAL_HANDOFF.md`

CURTO.

Incluir:

### Frozen identity
hash/tests/reviews.

### Canonical state semantics
- composition;
- interruption identity;
- executed state at interruption;
- projected vs evidence-anchored state;
- week boundary authority;
- temporal contradiction → ASK.

### Closed blockers
lista.

### Remaining domain work
B0/B/C/D.

### Minimum rehydration

### Exact next mission

```text
DOMAIN_COACHING_R7-B0
V1 COACHING REPERTOIRE FOUNDATION
```

NÃO iniciar B0.

---

# 26. SE NOT_READY

Se engenharia ou SSCTR bloquear:

```text
R7A_EXIT_READINESS = NOT_READY
NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION
```

Documentar:

- finding;
- reproduction;
- se ele representa nova manifestação de projected-vs-historical;
- se exige revisão do modelo de history/state;
- por que a solução atual foi insuficiente.

NÃO corrigir.

NÃO iniciar outra R7-A.x.

NÃO iniciar B0.

---

# 27. CURRENT_MISSION / LEDGER

Atualizar append-only.

Se READY:

```text
NEXT_MISSION = DOMAIN_COACHING_R7-B0
```

Se NOT_READY:

```text
NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION
```

---

# 28. RELATÓRIO FINAL

Entregar apenas:

1. baseline;
2. root cause;
3. state-authority model;
4. invariants;
5. QE-R7AF-01;
6. regressions;
7. mutation;
8. engineering re-check;
9. SSCTR regression;
10. readiness;
11. next step.

Separar:

- COMPROVADO;
- INFERIDO;
- NÃO TESTADO.

---

# 29. PRINCÍPIO FINAL

Planejamento responde:

> **o que deveria acontecer?**

Histórico responde:

> **o que realmente aconteceu?**

Essas duas coisas nunca devem compartilhar autoridade apenas porque usam a mesma estrutura de state.

Esta missão fecha quando o runtime consegue distinguir as duas de forma consistente.

---

# EXECUTE

Reidrate apenas o necessário.

Reproduza QE-R7AF-01.

Introduza autoridade explícita para state boundaries.

Não faça patch por handler.

Preserve todos os returns já aprovados.

Ataque equivalentes antes do freeze.

Congele uma única vez.

Despache engenharia + SSCTR nos mesmos bytes.

Se ambos aprovarem:

`R7A_EXIT_READINESS = READY`

gere o handoff curto e pare.

Se qualquer um bloquear:

`R7A_EXIT_READINESS = NOT_READY`

documente e pare.

NÃO inicie R7-B0 nesta sessão.
