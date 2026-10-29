# Founder request — COACHING CORE — STATE EVIDENCE MODEL (2026-10-28)

Preserved verbatim from the direct Founder request that opened this mission in a new Claude Code session on 2026-10-28. It is the architectural decision that the R7-A Final Boundary Closure routed to (`NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION`, QE-R7AB-01). Everything below the line is the Founder's text, unedited.

---

# COACHING CORE — STATE EVIDENCE MODEL
## VALUE-SCOPED FACT vs PROJECTION CLOSURE

Você está iniciando uma NOVA sessão, sem assumir contexto conversacional anterior.

Projeto:

`C:\Users\carva\Desktop\myApp\MyApp`

Esta missão nasce de uma decisão arquitetural explícita do Founder após o fechamento do:

`DOMAIN_COACHING_R7-A — FINAL BOUNDARY CLOSURE`

O último freeze fechou `QE-R7AF-01`, preservou a aprovação científica do SSCTR, mas o juiz de engenharia encontrou:

`QE-R7AB-01`

A causa não é mais específica de return/pause.

O problema demonstrado é:

> **o runtime consegue ter valores factual/executados e valores apenas projetados dentro do mesmo estado, mas em alguns caminhos a autoridade é atribuída ao container/state inteiro. Com isso, uma projeção não executada pode virar histórico apenas porque uma revisão ou boundary foi persistido.**

Esta missão corrige essa deficiência arquitetural.

---

# 0. DECISÃO DO FOUNDER — BINDING

A decisão arquitetural está tomada.

NÃO rediscuta opção (a) versus opção (b).

## ESCOLHA

```text
STATE_EVIDENCE_AUTHORITY = VALUE_SCOPED
```

A opção:

```text
recursive whole-week authority
```

está REJEITADA como solução principal.

Motivo:

ela pode evitar uma promoção falsa voltando para semanas verificadas anteriores, mas também pode apagar progresso real adquirido posteriormente.

A granularidade correta é o **valor relevante**, não a semana inteira.

---

# 1. PRINCÍPIO CENTRAL

A partir desta missão:

```text
PLANNED / PROJECTED VALUE
!=
HISTORICAL FACT
```

Persistir um plano, uma semana, um state object ou uma revisão NÃO transforma automaticamente os valores projetados naquele container em fatos históricos.

Somente evidência pertinente ao valor pode:

- confirmá-lo;
- promovê-lo;
- substituí-lo;
- corrigi-lo.

---

# 2. DISTINÇÃO FUNDAMENTAL

O sistema deve conseguir representar conceitualmente:

```text
Historical Athlete State
+
Planning Projection
↓
Planning View / Candidate State
```

O treinador precisa dos dois.

## Historical Athlete State

Representa:

> o que sabemos que realmente aconteceu ou foi validamente observado/corrigido.

## Planning Projection

Representa:

> o que o treinador espera, recomenda ou projeta que aconteça.

O planner pode livremente usar projeções para montar o futuro.

Mas uma projeção NÃO pode voltar para o histórico como fato sem evidência pertinente.

---

# 3. EXEMPLO CANÔNICO

Estado factual:

```text
Back Squat
last executed load = 20 kg
```

Planner decide:

```text
next prescribed load = 22 kg
```

Então:

```text
historical = 20 kg
projected = 22 kg
```

Se o atleta NÃO executa 22 kg:

```text
historical continua 20 kg
```

Mesmo que:

- uma weekly review ocorra;
- outro esporte seja revisado;
- uma semana nova seja criada;
- um return aconteça;
- uma schedule change aconteça;
- algum state container seja persistido.

Somente evidência que sustente os 22 kg pode transformar:

```text
projected 22
```

em:

```text
historical 22
```

---

# 4. PROBLEMA A REPRODUZIR — QE-R7AB-01

Antes de editar:

reproduza exatamente o finding oficial.

Caso registrado:

- registro factual mostra 20 kg;
- 22 kg foram projetados, mas nunca levantados;
- uma revisão semanal grava o início da semana seguinte como evidence-backed;
- ela copia valores da base que a evidência não alterou;
- os 22 kg projetados acabam chegando como se fossem históricos.

O judge reproduziu isso no P40.

Reproduza a mesma saída no baseline.

Se o baseline atual divergir do fechamento oficial:

pare antes de editar.

---

# 5. REIDRATAÇÃO MÍNIMA

Leia primeiro:

- `AGENTS.md`
- `CLAUDE.md`
- `CURRENT_MISSION.md`
- `MISSION_LEDGER.md`

Depois localize pelas autoridades atuais:

### Última missão R7-A Boundary
- final report;
- readiness;
- final disposition;
- único freeze;
- quality engineering re-check;
- SSCTR re-check;
- P40 / reprodução de QE-R7AB-01.

### Estado anterior necessário
- WEEK_COMPOSITION_CONTRACT vigente;
- interruption identity semantics;
- executed-state-at-interruption semantics;
- week-start-state authority implementada na missão anterior.

Leia somente outros arquivos quando houver consumidor claro.

Não reidrate o R6 inteiro.

---

# 6. HISTÓRIA IMUTÁVEL

R6 e todas as missões R7-A anteriores são evidência histórica.

NÃO:

- reescreva reports antigos;
- altere freezes;
- altere hashes;
- mude verdicts;
- transforme NOT_READY histórico em READY retroativamente.

Esta é uma nova missão arquitetural aditiva.

---

# 7. NÃO REDESENHAR O COACHING CORE

Esta missão NÃO autoriza:

- novo planner;
- novo Adaptive Engine;
- event sourcing geral;
- banco temporal;
- graph state;
- nova policy esportiva;
- mudança de repertório;
- pace;
- marathon;
- archetypes;
- athlete learning;
- UI;
- Figma;
- KMP;
- HealthKit.

Objetivo único:

> **separar autoridade factual de projeção na granularidade mínima necessária.**

---

# 8. NÃO COLOCAR PROVENANCE EM TUDO

Evite:

```text
every Boolean
every String
every field
→ giant provenance wrapper
```

Aplique value-scoped authority somente a state atoms onde existe semanticamente a possibilidade de:

```text
current factual value
vs
future/projected value
```

e onde confundi-los pode mudar coaching.

Descubra no runtime atual os consumidores materiais.

Exemplos candidatos em strength:

- load;
- reps;
- sets;
- performed exposure;
- relevant RIR evidence;
- last performed date;
- recovery/return count quando factual.

Não trate essa lista como obrigatória/exaustiva.

Derive a menor superfície necessária do código.

---

# 9. MODELO CONCEITUAL

Pode existir algo semanticamente equivalente a:

```text
StateValue<T> {
    historicalValue
    projectedValue
    historicalAuthority
    evidenceThrough
}
```

OU:

```text
HistoricalState
PlanningProjection
```

OU outro modelo menor e mais coerente com o runtime existente.

Não force esta estrutura textual.

O contrato é:

1. consumidor histórico consegue pedir fato;
2. planner consegue pedir projeção;
3. ambos podem ser combinados para planejamento;
4. projeção não vira fato por acidente.

---

# 10. AUTORIDADE POR VALOR

Para cada state atom afetado, o runtime precisa conseguir responder:

> **qual é o valor factual atual?**

e:

> **qual é o valor planejado/projetado?**

sem usar a autoridade do container inteiro como resposta.

Exemplo:

```text
weekStart authority = WEEK_EVIDENCE
```

NÃO significa automaticamente:

```text
every field copied into weekStart
= historical evidence
```

A evidência só autoriza aquilo que efetivamente sustenta.

---

# 11. REGRA DE PROMOÇÃO

Uma projeção só pode ser promovida a fato por uma origem autorizada.

Exemplos conceituais:

- completed execution;
- valid imported execution;
- explicit historical correction;
- canonical observation;
- confirmed factual report.

NÃO por:

- passagem do tempo;
- mudança de semana;
- persistência;
- criação de boundary;
- weekly review não relacionada;
- outro esporte ter sido revisado;
- o valor simplesmente existir numa base projetada.

---

# 12. UNRELATED EVIDENCE

Regra obrigatória:

> evidência sobre X não promove silenciosamente projeção Y.

Exemplo:

```text
Running review confirms completed run.
```

Isso não transforma automaticamente:

```text
projected strength load = 22 kg
```

em:

```text
historical strength load = 22 kg
```

A autoridade deve respeitar:

- valor;
- exercício;
- modalidade;
- temporalidade;
- contexto factual pertinente.

Não criar associação ultraespecífica desnecessária se uma granularidade menor resolver.

---

# 13. PARTIAL EVIDENCE

Evidência parcial permanece parcial.

Exemplo:

sabemos:

```text
3 sets
6 reps
```

mas não existe carga legível.

Resultado:

```text
sets = historical
reps = historical
load = previous known / unknown according to existing provenance contract
```

NÃO inventar:

```text
load = projected load
```

apenas porque era o valor planejado.

Preservar:

```text
unknown != zero
```

---

# 14. HISTORICAL CORRECTION

Uma correção histórica válida PODE alterar fato.

Exemplo:

registro original:

```text
20 kg
```

correção factual posterior:

```text
22 kg
```

Se provenance/correction semantics autorizarem:

```text
historical 20
→ historical 22
```

Isso é diferente de:

```text
planned 22
→ historical 22
```

sem execução.

---

# 15. PLANNING CONTINUA PODENDO PROGREDIR

Esta mudança NÃO deve deixar o treinador burro ou excessivamente conservador.

O planner pode continuar propondo:

```text
historical = 20
next target = 22
future target = 24
```

O que muda é apenas:

> projeções futuras não contaminam fatos históricos.

Não reduzir capacidade de progressão para passar no teste.

---

# 16. HISTORICAL VIEW vs PLANNING VIEW

Idealmente o runtime deve ter uma distinção explícita equivalente a:

```text
historicalView(state)
```

e:

```text
planningView(state)
```

ou APIs menores equivalentes.

### Historical view

Nunca usa projeção como fato.

### Planning view

Pode combinar:

```text
historical facts
+
valid projections
+
current constraints
```

para decidir futuro.

Não é obrigatório criar exatamente essas funções.

Mas os consumidores precisam deixar de depender de um `state` semanticamente ambíguo.

---

# 17. INVARIANTES OBRIGATÓRIAS

## I1 — PROJECTION IS NOT EVIDENCE

```text
planned X != executed X
```

---

## I2 — NO CONTAINER-LEVEL PROMOTION

Marcar semana/review/boundary como evidence-backed não promove automaticamente todos os valores copiados para dentro dela.

---

## I3 — VALUE-RELEVANT PROMOTION

Só evidência pertinente ao valor pode promovê-lo ou substituí-lo.

---

## I4 — UNRELATED EVIDENCE ISOLATION

Evidência sobre outro valor/modalidade/exercício não promove projeção não relacionada.

---

## I5 — PARTIAL EVIDENCE REMAINS PARTIAL

Ausência de evidência para um campo não é preenchida automaticamente pelo target projetado.

---

## I6 — HISTORICAL CORRECTION IS ALLOWED

Correção factual válida pode substituir fato histórico.

---

## I7 — PLANNING MAY PROJECT FREELY

Separar fato de projeção não reduz indevidamente a capacidade de progressão do planner.

---

## I8 — WEEK BOUNDARY DOES NOT PROMOTE

Virar semana não transforma projeção em fato.

---

## I9 — REVIEW DOES NOT PROMOTE UNTOUCHED VALUES

Review promove somente fatos que seus inputs/evidence realmente suportam.

---

## I10 — RETURN SEMANTICS PRESERVED

A nova modelagem não quebra:

- executed state at interruption;
- interruption identity;
- return entry;
- ceilings;
- recovery.

---

## I11 — NO SELF-LEARNING FROM PROJECTION

Qualquer infraestrutura futura ou existente de athlete learning não pode consumir projeção como evidência observada.

Mesmo que learning profundo ainda não esteja implementado, preserve essa separação no contrato.

---

# 18. TESTE DIRETO DO P40

O caso original deve:

```text
fail on previous freeze
pass on candidate
```

Esperado:

```text
historical load = 20 kg
projected load = 22 kg
```

até que exista execução/correção factual para 22.

A interrupção posterior deve enxergar:

```text
20 kg factual
```

não:

```text
22 kg projected
```

---

# 19. FAMÍLIAS DE TESTE

Cobrir no mínimo:

### A — Projection not executed

Factual 20 → planned 22 → no execution → review.

Histórico permanece 20.

---

### B — Projection executed

Factual 20 → planned 22 → execution valid 22.

Histórico torna-se 22.

---

### C — Projection partially executed

Target contém vários campos.

Somente aqueles efetivamente observados são promovidos.

---

### D — Running evidence + strength projection

Running evidence não promove strength value.

---

### E — Strength exercise A + exercise B

Execução de A não promove target futuro de B.

---

### F — Weekly review with untouched projected field

Não promove.

---

### G — Week boundary without execution

Não promove.

---

### H — Return after unexecuted projection

Return usa factual.

---

### I — Return after executed projection

Return usa o valor factual promovido.

---

### J — Late historical correction

Corrige fato conforme existing provenance rules.

---

### K — Equipment/schedule/event change

Nenhum desses handlers promove projection inadvertidamente.

---

# 20. PROPERTY / METAMORPHIC TESTS

## P1 — Persist invariance

Persistir o mesmo planning state novamente:

→ historical state não muda.

---

## P2 — Time passage

Avançar relógio/semana sem nova evidence:

→ projected value continua projected.

---

## P3 — Unrelated evidence

Adicionar evidence irrelevante ao valor:

→ historical value desse state atom não muda.

---

## P4 — Relevant execution

Adicionar execução válida exatamente do target:

→ promove o valor apropriado.

---

## P5 — Different execution

Target = 22.

Executado = 21.

→ historical = 21, não 22.

---

## P6 — Correction

Correção factual substitui fato anterior sem promover outras projeções.

---

## P7 — Order independence when semantically equivalent

Projection then unrelated evidence

vs

unrelated evidence then projection

→ mesmo histórico factual.

---

# 21. AUDITAR CONSUMIDORES

Antes do freeze, procure consumidores que tratem:

```text
state.*
weekStart.*
stateTrace.*
review evidence
```

como se qualquer valor presente fosse factual.

Não faça busca infinita.

Foque nos consumidores do state path que alimentam:

- progression;
- return;
- weekly review;
- planning;
- historical reconciliation.

Se encontrar o mesmo padrão material, corrija dentro desta missão ANTES do freeze.

---

# 22. SELF-CHALLENGE

O autor deve atacar a implementação ANTES do freeze.

Classes mínimas:

- factual + projection;
- projection sem execução;
- partial execution;
- unrelated review;
- cross-sport;
- cross-exercise;
- week boundary;
- return;
- correction;
- late evidence;
- no-op adaptation.

Use equivalence classes.

Se encontrar falha:

corrija antes do freeze.

---

# 23. MUTATION

Mutation testing somente para esta nova semântica.

Exemplos:

- projected treated as historical;
- week review promotes untouched values;
- irrelevant evidence promotes value;
- planner reads historical when it needs projection;
- historical consumer reads projection;
- partial evidence fills missing field from target;
- execution ignored during promotion.

Cada mutante material deve:

- ser pego;
- ou ser explicitamente equivalente/irrelevante.

---

# 24. REGRESSÕES

Preservar obrigatoriamente:

- R5 corpus;
- R6 holdout/regressions;
- profiles;
- simulations;
- todas as R7-A regression suites;
- interruption identity;
- week composition;
- event supersession;
- exercise merge;
- D53;
- D56;
- D57;
- D58;
- D59;
- QE-R7AF-01.

Diferenças precisam de causa nomeada.

Não reclassificar corpora conhecidos como generalization evidence.

---

# 25. SSCTR

Esta é predominantemente uma missão de engenharia de estado.

SSCTR deve fazer apenas regression sanity check quando necessário.

Confirmar que a mudança NÃO alterou indevidamente:

- prescriptions;
- return entry;
- restoration;
- progression rules;
- ceilings;
- phase behavior.

NÃO abrir nova pesquisa esportiva se não houver mudança esportiva.

---

# 26. PROCESSO

Esta missão NÃO deve virar outra sequência longa.

## BUILD

- implementar modelo;
- testes;
- properties;
- self-challenge;
- mutation;
- regressions.

Enquanto não houver freeze, corrigir findings próprios.

## FREEZE ÚNICO

Quando o autor considerar a arquitetura consistente:

```text
STATE-EVIDENCE-FREEZE-1
```

ou nome canônico equivalente.

A partir daí:

NÃO editar runtime.

## REVIEWS

Despachar em paralelo:

### Quality & Reliability Engineer
gate principal.

### SSCTR
regression-only.

## RESULTADO

READY ou NOT_READY.

---

# 27. SEM CORRECTION CYCLE DEPOIS DO FREEZE

Se o judge encontrar nova manifestação material de:

```text
projection → historical without evidence
```

depois do freeze:

NÃO corrigir.

Isso indicará que a separação arquitetural continua insuficiente.

Encerrar:

```text
STATE_EVIDENCE_MODEL = NOT_READY
NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION
```

Não criar nova micro-missão automaticamente.

---

# 28. ENGINEERING REVIEW

Instância nova.

Pergunta central:

> **Existe algum caminho normal da V1 em que um valor apenas planejado/projetado passe a ser consumido como fato histórico sem evidência pertinente a esse valor?**

O juiz deve tentar quebrar especialmente:

- weekly review;
- next-week start;
- return;
- partial evidence;
- cross-sport;
- cross-exercise;
- corrections;
- progression;
- week boundary.

Não revisar cold start/program quality.

---

# 29. CRITÉRIO DE READY

Para READY:

```text
QE-R7AB-01 = CLOSED
```

e nenhuma manifestação equivalente material permanece conhecida.

Além disso:

```text
VALUE_SCOPED_EVIDENCE_AUTHORITY = READY

HISTORICAL_STATE_INTEGRITY = READY

PLANNING_PROJECTION_INTEGRITY = READY

STATE_PRESERVATION_INTEGRITY = READY

WEEK_START_STATE_AUTHORITY = READY

RETURN_RECOVERY_CEILING_INTEGRITY = READY

STATE_EVIDENCE_ENGINEERING_REVIEW = READY

STATE_EVIDENCE_SCIENTIFIC_REGRESSION = READY
```

Todos os blockers anteriores devem continuar fechados.

---

# 30. R7-A EXIT

Se a missão ficar READY:

registre:

```text
R7A_EXIT_READINESS = READY
```

Porque a deficiência estrutural que impedia o fechamento da fase A foi resolvida.

Isso NÃO significa:

```text
AUTONOMOUS_COACH_READY
```

ou:

```text
COACHING_DECISION_QUALITY = READY
```

Ainda faltam B0/B/C/D.

---

# 31. HANDOFF

Se READY, criar:

`CoachingCore/r7/R7A_FINAL_HANDOFF.md`

CURTO.

Incluir somente:

## Freeze identity
hash/tests/reviews.

## Canonical state model
- historical facts;
- projections;
- value-scoped evidence;
- promotion rules;
- partial evidence;
- correction;
- week-start authority;
- interruption identity.

## Closed blockers

## Preserved readiness

## Nonblocking known gaps

## Minimum rehydration

## Next mission

```text
DOMAIN_COACHING_R7-B0
V1 COACHING REPERTOIRE FOUNDATION
```

NÃO iniciar B0.

---

# 32. SE NOT_READY

Se o freeze falhar:

não corrigir.

Registrar claramente:

- finding;
- reprodução;
- qual state atom perdeu provenance;
- se a falha é da granularidade escolhida;
- se seria necessário separar fisicamente HistoricalState e PlanningProjection em estruturas distintas.

Depois:

```text
NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION
```

e pare.

---

# 33. NÃO IMPLEMENTAR B0

Mesmo que a sessão termine cedo:

NÃO começar:

- run repertoire;
- strength repertoire;
- hybrid archetypes;
- pace;
- marathon;
- confirmation-first;
- learning.

Esses itens pertencem à próxima sessão.

---

# 34. CURRENT_MISSION / LEDGER

Atualizar append-only.

Se READY:

```text
CURRENT_MISSION = STATE_EVIDENCE_MODEL_CLOSED
NEXT_MISSION = DOMAIN_COACHING_R7-B0
```

Se NOT_READY:

```text
NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION
```

Preservar toda a cadeia histórica.

---

# 35. RELATÓRIO FINAL

Entregar objetivamente:

1. baseline;
2. QE-R7AB-01;
3. modelo escolhido;
4. state atoms afetados;
5. historical vs projected;
6. promotion rules;
7. partial evidence;
8. corrections;
9. invariants;
10. properties;
11. regressions;
12. mutation;
13. engineering review;
14. SSCTR regression;
15. readiness;
16. next mission.

Separar:

- COMPROVADO;
- INFERIDO;
- NÃO TESTADO.

---

# 36. PRINCÍPIO FINAL

O treinador precisa ser livre para pensar:

> “na próxima semana, provavelmente 22 kg.”

Mas o Athlete State só pode afirmar:

> “este atleta levantou 22 kg”

quando existir evidência de que isso realmente aconteceu.

Nunca permita que:

```text
prediction
→ persisted state
→ historical evidence
```

se transforme num ciclo de confirmação da própria previsão.

A regra central desta missão é:

> **o plano pode projetar o futuro; somente a realidade escreve o passado.**

---

# EXECUTE

Reidrate somente o necessário.

Reproduza QE-R7AB-01.

Implemente autoridade por valor com o menor impacto estrutural suficiente.

Não use fallback recursivo por semana como solução principal.

Separe semanticamente factual de projected.

Ataque consumidores equivalentes antes do freeze.

Preserve toda a ciência esportiva e todos os blockers já fechados.

Faça UM freeze.

Despache engenharia + SSCTR sobre os mesmos bytes.

Se ambos aprovarem:

```text
R7A_EXIT_READINESS = READY
```

gere o handoff curto e pare.

Se qualquer um bloquear:

```text
STATE_EVIDENCE_MODEL = NOT_READY
```

documente e pare.

NÃO inicie R7-B0 nesta sessão.
