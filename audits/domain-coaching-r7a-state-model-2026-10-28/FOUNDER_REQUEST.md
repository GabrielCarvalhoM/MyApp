# COACHING CORE — STATE MODEL CLOSURE
## HISTORICAL STATE vs PLANNING PROJECTION

Você está iniciando uma NOVA sessão com contexto limpo.

Projeto:

`C:\Users\carva\Desktop\myApp\MyApp`

Esta missão nasce de uma decisão arquitetural explícita do Founder após o fechamento da missão:

`STATE EVIDENCE MODEL — VALUE-SCOPED FACT vs PROJECTION`

A missão anterior:

- fechou `QE-R7AB-01`;
- manteve o SSCTR em `ACCEPT`;
- preservou D53 e D56–D59;
- demonstrou que value-scoped evidence melhorou a semântica;
- mas encerrou `NOT_READY` porque o juiz de engenharia encontrou:

`QE-R7ASE-01`

e

`QE-R7ASE-02`.

Esses dois findings demonstram que regras de provenance dentro de um único state object ainda permitem vazamento entre:

```text
o que realmente aconteceu
```

e

```text
o que o planner apenas projetou.
```

Esta missão NÃO deve criar novos patches de cópia.

Ela altera explicitamente o modelo.

---

# 0. DECISÃO DO FOUNDER — BINDING

A decisão arquitetural está tomada.

NÃO rediscuta alternativas.

## MODELO ESCOLHIDO

O Coaching Core deve separar semanticamente — e na implementação, em estruturas ou APIs inequivocamente distintas —:

```text
HistoricalState
```

de:

```text
PlanningProjection
```

e permitir uma visão derivada:

```text
PlanningView
```

quando o treinador precisar combinar ambos para decidir o futuro.

---

# 1. PRINCÍPIO FUNDAMENTAL

```text
HistoricalState
=
o que realmente sabemos que aconteceu
```

```text
PlanningProjection
=
o que o treinador espera/recomenda que aconteça
```

```text
PlanningView
=
HistoricalState + PlanningProjection + constraints
```

`PlanningView` é derivada.

Ela NÃO possui autoridade histórica própria.

---

# 2. REGRA CENTRAL

A partir desta missão:

> **Planning nunca escreve diretamente HistoricalState.**

Somente evidência factual autorizada pode alterar HistoricalState.

Fluxo conceitual:

```text
Canonical Evidence
        ↓
HistoricalState
        │
        │ + goals / constraints / policy
        ↓
Coaching Intelligence
        ↓
PlanningProjection
        ↓
Plan / prescription
        ↓
athlete executes
        ↓
Canonical Evidence
        ↺
```

---

# 3. EXEMPLO CANÔNICO

O atleta realmente executou:

```text
Back Squat
20 kg × 6
```

Então:

```text
HistoricalState.lastExecutedLoad = 20
```

O planner recomenda:

```text
Next target = 22 kg
```

Então:

```text
PlanningProjection.targetLoad = 22
```

Se 22 kg NÃO forem executados:

```text
HistoricalState.lastExecutedLoad continua 20
```

Mesmo se:

- semana virar;
- review acontecer;
- plano for salvo;
- return acontecer;
- schedule mudar;
- outro esporte for revisado.

Se depois houver evidência:

```text
executed load = 22
```

então:

```text
HistoricalState.lastExecutedLoad = 22
```

---

# 4. QE-R7ASE-01 — BLOCKER

Reproduzir antes de editar.

Finding:

um atleta executa uma carga que antes era projetada, mas o histórico também herda um `loadTick` que somente a projeção havia conquistado.

Dois ledgers semanticamente diferentes acabam com estado histórico equivalente onde não deveriam.

Isso demonstra que:

```text
execution of value X
```

está promovendo também:

```text
planner metadata related to X
```

sem evidência suficiente.

Corrigir estruturalmente.

Não aplicar:

```text
if load executed then remove copied tick
```

como patch.

---

# 5. QE-R7ASE-02 — BLOCKER

Reproduzir antes de editar.

Finding:

uma regra de reestabelecimento lê como:

```text
lastPerformed
```

uma data que foi criada apenas pela projeção/planning.

Resultado:

um exercício não realmente executado aparece historicamente como realizado.

Regra definitiva:

```text
HistoricalState.lastPerformedAt
```

só pode vir de:

- workout executado;
- imported factual workout;
- valid historical correction;
- outra factual observation autorizada.

Nunca de:

- planned session;
- projected session;
- future progression;
- generated week.

---

# 6. R42 — RESOLVER NESTA MISSÃO

A recomendação `R42`, relativa a tick/progress credit derivado da história, entra no escopo.

Definir semanticamente o ownership do progression/tick.

Pergunta obrigatória:

> O tick representa algo REALMENTE conquistado por execução/evidência ou apenas o próximo passo que o planner deseja usar?

Se representa evidência conquistada:

→ pertence ao `HistoricalState`, mas só pode ser atualizado pela evidência que o conquistou.

Se representa planejamento:

→ pertence ao `PlanningProjection`.

Se houver ambos os conceitos:

→ separá-los.

NÃO manter um único campo ambíguo.

---

# 7. R41 — FORA DO ESCOPO

A recomendação sobre semanas não reportadas antes de um retorno (`R41`) NÃO deve expandir esta missão, salvo se for inevitavelmente afetada pela separação estrutural.

Caso contrário:

registrar para fase posterior.

---

# 8. REIDRATAÇÃO MÍNIMA

Leia:

- `AGENTS.md`
- `CLAUDE.md`
- `CURRENT_MISSION.md`
- `MISSION_LEDGER.md`

Depois localize e leia somente o necessário da missão imediatamente anterior:

- final report;
- readiness;
- final disposition;
- freeze manifest;
- engineering review;
- SSCTR review;
- reproduções `QE-R7ASE-01` e `QE-R7ASE-02`;
- `QE-R7AB-01`;
- state-evidence contracts vigentes.

Leia também apenas as autoridades necessárias de:

- interruption identity;
- week composition;
- return state;
- progression/tick;
- provenance.

Não reidrate o R6 inteiro.

---

# 9. HISTÓRIA É IMUTÁVEL

NÃO reescreva:

- R6;
- R7-A anteriores;
- freezes;
- hashes;
- reports;
- verdicts históricos.

Esta missão cria nova evidência append-only.

---

# 10. NÃO REESCREVER O MOTOR

Esta missão NÃO autoriza redesign de:

- run programming;
- strength programming;
- hybrid coordinator;
- planner;
- return policy;
- phase policy;
- pace;
- archetypes;
- cold start;
- athlete learning;
- Figma;
- KMP;
- HealthKit.

A mudança deve ser estrutural e bounded:

> separar fato de projeção.

---

# 11. MODELO MÍNIMO DESEJADO

A implementação pode assumir várias formas.

Exemplo conceitual:

```text
HistoricalState {
    strengthHistory
    runHistory
    executedExposure
    confirmedCapacity
    factualTimestamps
    earnedEvidence
}
```

```text
PlanningProjection {
    targetLoad
    targetSets
    targetReps
    targetPace
    plannedSessions
    futureProgression
    projectedState
}
```

```text
PlanningView =
    combine(HistoricalState, PlanningProjection, Constraints)
```

NÃO force exatamente essa estrutura se outra divisão menor ficar melhor no runtime atual.

Mas os consumidores precisam saber explicitamente qual visão estão usando.

---

# 12. WRITE OWNERSHIP

Deve existir uma fronteira clara.

Idealmente conceitualmente equivalente a:

```text
HistoricalState applyEvidence(
    HistoricalState current,
    CanonicalEvidence evidence
)
```

Planner:

```text
PlanningProjection plan(
    HistoricalState history,
    Goals goals,
    Constraints constraints
)
```

O planner NÃO recebe permissão semântica para escrever fatos.

Não precisa obrigatoriamente existir exatamente nessas funções.

Mas o ownership deve ser verificável.

---

# 13. HISTORICAL STATE — O QUE PODE ENTRAR

Somente fatos.

Exemplos materiais:

- actual executed load;
- actual executed sets;
- actual reps;
- actual RIR observation;
- factual workout completion;
- actual performed date;
- canonical imported execution;
- historical correction;
- evidence-earned progression state.

Não colocar automaticamente:

- next target;
- planned session;
- future load;
- planned date;
- projected return step;
- future progression.

---

# 14. PLANNING PROJECTION — O QUE PODE ENTRAR

Pode livremente conter futuro:

- target load;
- target reps;
- target sets;
- target pace;
- planned workout;
- expected progression;
- tentative schedule;
- candidate substitution;
- future session state.

Essa liberdade deve permanecer.

A missão NÃO pode deixar o trainer excessivamente conservador.

---

# 15. PLANNING VIEW

Quando o coach decide:

```text
historical load = 20
target load = 22
```

ele deve conseguir enxergar os dois.

O planner precisa saber:

> último fato = 20

e:

> próximo target = 22

sem transformar um no outro.

---

# 16. STATE ATOMS PRIORITÁRIOS

Auditar pelo menos os state atoms ligados aos findings.

## Strength

- load;
- load tick / progression credit;
- reps;
- sets;
- RIR evidence;
- last performed date;
- last executed exposure;
- return/recovery evidence.

## Running

Verificar apenas se há fields equivalentes com risco material de:

```text
planned capability
→ factual capability
```

Não ampliar para pace implementation.

Se nenhuma vulnerabilidade equivalente existir, documente e pare.

---

# 17. INVARIANTES

## I1 — HISTORY ONLY FROM FACT

HistoricalState nunca recebe valor somente porque foi planejado.

---

## I2 — PROJECTION CAN BE DIFFERENT

```text
history = 20
projection = 22
```

é estado perfeitamente válido.

---

## I3 — EXECUTION PROMOTES THE EXECUTED VALUE

Se target = 22 e executed = 22:

```text
historical = 22
```

---

## I4 — EXECUTION DOES NOT PROMOTE UNPROVEN METADATA

Executar 22 não promove automaticamente:

- tick;
- progression credit;
- other fields;

a menos que aquela própria evidência realmente os conquiste.

---

## I5 — DIFFERENT EXECUTION WINS

Se target = 22 e executed = 21:

```text
historical = 21
```

Não 22.

---

## I6 — LAST_PERFORMED IS FACTUAL

Somente execução factual altera `lastPerformed`.

---

## I7 — PARTIAL EXECUTION IS PARTIAL FACT

Se conhecemos sets/reps mas não load:

não preencher load com projected target.

---

## I8 — REVIEW DOES NOT PROMOTE PROJECTION

Weekly review não transforma automaticamente targets não executados em história.

---

## I9 — WEEK BOUNDARY DOES NOT PROMOTE

Virar semana não transforma projeção em fato.

---

## I10 — CROSS-SPORT ISOLATION

Running evidence não promove strength projection e vice-versa.

---

## I11 — CROSS-EXERCISE ISOLATION

Execution de exercício A não promove projection de exercício B.

---

## I12 — HISTORICAL CORRECTIONS ARE VALID

Correções factual/provenance autorizadas podem substituir fato.

---

## I13 — RETURN READS HISTORY

Return usa HistoricalState como verdade factual.

PlanningProjection pode influenciar futuro somente depois da aplicação correta das regras de return.

---

## I14 — LEARNING CONTRACT

Prediction/projection nunca pode ser tratada futuramente como observation no Athlete Learning.

Ainda que learning profundo pertença à R7-C, este contrato deve ser protegido agora.

---

# 18. TESTES OBRIGATÓRIOS

## T1 — Original QE-R7ASE-01

Baseline falha.

Candidate passa.

---

## T2 — Original QE-R7ASE-02

Baseline falha.

Candidate passa.

---

## T3 — 20 planned 22, not executed

Historical:

```text
20
```

Projection:

```text
22
```

---

## T4 — 22 executed

Depois:

```text
historical = 22
```

---

## T5 — 21 executed when 22 planned

Depois:

```text
historical = 21
```

---

## T6 — Load executed but tick not earned

Historical load avança.

Tick não.

---

## T7 — Tick genuinely earned

Evidence satisfaz regra.

Historical progression/tick avança.

---

## T8 — Planned date without execution

`lastPerformed` não muda.

---

## T9 — Actual execution

`lastPerformed` muda.

---

## T10 — Partial execution

Somente facts conhecidos avançam.

---

## T11 — Unrelated weekly review

Não promove target.

---

## T12 — Week boundary

Não promove target.

---

## T13 — Return after unexecuted target

Return usa factual.

---

## T14 — Return after executed target

Return usa execução promovida.

---

## T15 — Historical correction

Corrige factual state.

---

## T16 — Running evidence vs strength target

Sem cross-promotion.

---

## T17 — Exercise A vs exercise B

Sem cross-promotion.

---

# 19. PROPERTY / METAMORPHIC TESTS

## P1 — Persistence

Salvar PlanningProjection múltiplas vezes:

→ HistoricalState inalterado.

---

## P2 — Time

Passagem do tempo sem evidence:

→ history inalterada.

---

## P3 — Projection mutation

Alterar apenas target futuro:

→ history inalterada.

---

## P4 — Relevant execution

Adicionar factual execution:

→ somente facts sustentados mudam.

---

## P5 — Order independence

Projection → unrelated evidence

versus

unrelated evidence → projection

→ mesmo HistoricalState.

---

## P6 — Projection removal

Apagar plano futuro:

→ history permanece intacta.

---

## P7 — Historical correction

Correction factual modifica history sem alterar projections não relacionadas.

---

# 20. CONSUMER AUDIT

Antes do freeze:

procure consumidores materiais que leiam:

```text
stateTrace
weekStart
state.*
lastPerformed
load
loadTick
progression
```

sem distinguir history de projection.

Foque somente nos caminhos que alimentam:

- weekly review;
- progression;
- return;
- reestablishment;
- historical reconciliation;
- next-week planning.

Não fazer busca geral infinita no repo.

---

# 21. NÃO USAR COMPATIBILITY LAYER QUE RECRIE A AMBIGUIDADE

É aceitável criar adapters para reduzir o tamanho da refatoração.

Mas NÃO fazer algo como:

```text
getState()
```

que volte a fundir history + projection e seja usado indiscriminadamente por todos.

Se existir compatibility view:

ela deve declarar semanticamente que é:

```text
PlanningView
```

e não factual state.

---

# 22. R42 — CRITÉRIO DE FECHAMENTO

Ao fim da missão, deve estar explicitamente documentado:

```text
PROGRESSION_TICK_OWNERSHIP =
HISTORICAL
```

ou:

```text
PLANNING
```

ou, se são dois conceitos:

```text
EARNED_PROGRESS
vs
PROJECTED_PROGRESS
```

Sem ambiguidade.

O judge deve testar essa distinção.

---

# 23. SELF-CHALLENGE

ANTES do freeze, o autor deve tentar contaminar History através de:

- weekly review;
- return;
- reestablishment;
- progression;
- week boundary;
- equipment;
- schedule;
- event;
- partial workout;
- no workout;
- late historical correction;
- cross-sport;
- cross-exercise.

Use equivalence classes.

Não fazer exploração infinita.

Se encontrar bug:

corrigir ANTES do freeze.

---

# 24. MUTATION

Criar mutantes específicos:

- planner writes history;
- historical consumer reads projection;
- load execution copies tick;
- planned date populates lastPerformed;
- week review promotes target;
- week boundary promotes target;
- partial evidence fills projection;
- cross-exercise promotion;
- cross-sport promotion.

Cada mutante material deve ser detectado ou explicitamente justificado.

---

# 25. REGRESSÕES

Preservar:

- R5;
- R6 holdout;
- profiles;
- simulations;
- todas as suites R7-A;
- week composition;
- interruption identity;
- executed-state-at-interruption;
- week-start state authority;
- D53;
- D56;
- D57;
- D58;
- D59;
- QE-R7AF-01;
- QE-R7AB-01.

Diferenças precisam de causa nomeada.

---

# 26. SSCTR

Esta missão é predominantemente engenharia de domínio.

SSCTR executa apenas regression sanity check.

Verificar que separar HistoricalState/PlanningProjection não alterou indevidamente:

- dose;
- progression;
- return;
- reestablishment;
- ceilings;
- phase behavior.

NÃO abrir pesquisa científica nova sem mudança esportiva real.

---

# 27. PROCESSO

Esta missão deve terminar.

## BUILD

Implementar:

- separação;
- ownership;
- tests;
- properties;
- self-challenge;
- mutation;
- regressions.

Corrigir findings próprios ANTES do freeze.

---

## FREEZE ÚNICO

Quando estável:

```text
HISTORICAL-PROJECTION-FREEZE-1
```

ou nomenclatura equivalente.

Depois disso:

NÃO editar runtime.

---

## REVIEWS

Despachar em paralelo:

### Quality & Reliability Engineering
gate principal.

### SSCTR
regression-only.

Ambos revisam EXATAMENTE os mesmos bytes.

---

# 28. SEM CORRECTION CYCLE APÓS O FREEZE

Se engenharia encontrar qualquer novo caso material de:

```text
projection → history
```

depois do freeze:

NÃO corrigir.

Encerrar:

```text
STATE_MODEL_CLOSURE = NOT_READY
NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION
```

Isso indicará que a separação não foi realmente implementada no boundary certo.

Não criar outra micro-missão automaticamente.

---

# 29. ENGINEERING REVIEW

Pergunta central:

> **Existe algum caminho V1 material em que PlanningProjection possa alterar HistoricalState sem passar por factual evidence?**

Testar especialmente:

- QE-R7ASE-01;
- QE-R7ASE-02;
- QE-R7AB-01;
- load;
- tick;
- lastPerformed;
- partial evidence;
- weekly review;
- week boundary;
- return;
- progression;
- cross-exercise;
- cross-sport.

---

# 30. CRITÉRIO DE READY

Obrigatório:

```text
QE-R7ASE-01 = CLOSED
QE-R7ASE-02 = CLOSED
QE-R7AB-01 = CLOSED
```

e:

```text
HISTORICAL_STATE_INTEGRITY = READY

PLANNING_PROJECTION_INTEGRITY = READY

FACT_PROJECTION_SEPARATION = READY

VALUE_SCOPED_EVIDENCE_AUTHORITY = READY

WEEK_START_STATE_AUTHORITY = READY

STATE_PRESERVATION_INTEGRITY = READY

RETURN_RECOVERY_CEILING_INTEGRITY = READY

STATE_MODEL_ENGINEERING_REVIEW = READY

STATE_MODEL_SCIENTIFIC_REGRESSION = READY
```

Sem novo blocker equivalente material.

---

# 31. R7-A EXIT

Se READY:

```text
R7A_EXIT_READINESS = READY
```

Isso significa apenas:

> semantic/history/state foundation closed.

NÃO significa:

- autonomous coaching ready;
- program quality ready;
- KMP ready;
- production ready;
- real-user validated.

---

# 32. HANDOFF

Se READY, criar finalmente:

`CoachingCore/r7/R7A_FINAL_HANDOFF.md`

CURTO.

Incluir:

### Freeze
hash/tests/reviews.

### Canonical state architecture
- HistoricalState;
- PlanningProjection;
- PlanningView;
- evidence reducer;
- progression/tick ownership;
- lastPerformed authority;
- interruption identity;
- week-start authority.

### Closed blockers

### Preserved invariants

### Known nonblocking gaps

### Minimum rehydration

### Exact next mission

```text
DOMAIN_COACHING_R7-B0
V1 COACHING REPERTOIRE FOUNDATION
```

NÃO iniciar B0.

---

# 33. SE NOT_READY

Se qualquer reviewer bloquear:

- não corrigir;
- não criar nova A.x;
- não criar novo freeze.

Documentar:

1. qual projection contaminou history;
2. por qual API/path;
3. se a separação estrutural era incompleta;
4. se será necessário substituir completamente o mixed legacy state.

Registrar:

```text
NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION
```

e parar.

---

# 34. CURRENT_MISSION / LEDGER

Atualizar append-only.

Se READY:

```text
CURRENT_MISSION = R7A_STATE_FOUNDATION_CLOSED
NEXT_MISSION = DOMAIN_COACHING_R7-B0
```

Se NOT_READY:

```text
NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION
```

---

# 35. RELATÓRIO FINAL

Entregar:

1. baseline;
2. QE-R7ASE-01;
3. QE-R7ASE-02;
4. architecture before;
5. architecture after;
6. HistoricalState;
7. PlanningProjection;
8. PlanningView;
9. write ownership;
10. R42 decision;
11. invariants;
12. properties;
13. consumer audit;
14. mutation;
15. regressions;
16. engineering review;
17. SSCTR regression;
18. readiness;
19. next mission.

Separar:

- COMPROVADO;
- INFERIDO;
- NÃO TESTADO.

---

# 36. ANTI-OVERENGINEERING

A missão NÃO precisa criar:

- event sourcing;
- CQRS;
- distributed state store;
- temporal database;
- generic provenance framework;
- huge metadata wrappers.

Precisamos somente impedir que:

```text
o que planejamos
```

se torne:

```text
o que aconteceu
```

sem passar por evidência.

---

# 37. PRINCÍPIO FINAL

O planner pode dizer:

> “na próxima sessão, 22 kg.”

History só pode dizer:

> “ele levantou 22 kg.”

depois que realmente existir evidência disso.

Architecture must enforce:

```text
PLAN
does not write
HISTORY
```

Somente:

```text
REALITY / CANONICAL EVIDENCE
```

escreve History.

---

# EXECUTE

Reidrate somente o necessário.

Reproduza QE-R7ASE-01 e QE-R7ASE-02.

Separe HistoricalState de PlanningProjection.

Defina PlanningView.

Defina write ownership.

Resolva R42.

Não expandir R41.

Audite somente consumers materiais.

Ataque equivalentes antes do freeze.

Preserve toda a semântica esportiva aprovada.

Faça UM freeze.

Despache engenharia + SSCTR nos mesmos bytes.

Se ambos aprovarem:

```text
R7A_EXIT_READINESS = READY
```

gere o handoff e pare.

Se qualquer um bloquear:

```text
STATE_MODEL_CLOSURE = NOT_READY
```

documente e pare.

NÃO inicie R7-B0 nesta sessão.
