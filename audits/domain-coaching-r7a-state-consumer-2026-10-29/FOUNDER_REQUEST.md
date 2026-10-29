# COACHING CORE — STATE MODEL CONSUMER CLOSURE
## HISTORY INGRESS, SEMANTIC PLANNING VIEW & TEMPORAL EVIDENCE

Você está iniciando uma NOVA sessão com contexto limpo.

Projeto:

`C:\Users\carva\Desktop\myApp\MyApp`

Esta missão sucede diretamente a revisão independente do freeze:

`HISTORICAL-PROJECTION-FREEZE-1`

A arquitetura fundamental permanece:

```text
HistoricalState
!=
PlanningProjection
```

e:

```text
PlanningView
=
HistoricalState
+
PlanningProjection
+
constraints / policy
```

A revisão independente mostrou que essa direção arquitetural é válida, mas alguns consumidores ainda atravessam incorretamente essa fronteira.

Esta missão NÃO redesenha o state model.

Ela fecha SOMENTE os consumidores restantes.

---

# 0. AUTORIDADE DA MISSÃO

Decisão do Founder:

## MANTER

```text
HistoricalState
PlanningProjection
PlanningView
```

Não voltar a:

- mixed state;
- authority somente por semana;
- copy rules ad hoc;
- recursive week fallback como solução principal.

O problema atual não é mais a separação dos states.

O problema é:

> alguns consumers ainda usam history/projection/evidence de forma semanticamente incorreta.

---

# 1. OBJETIVO ÚNICO

Responder com evidência:

> **Todos os consumidores materiais agora respeitam corretamente a fronteira entre HistoricalState, PlanningProjection e factual evidence, produzindo prescrições semanticamente coerentes?**

Para isso, fechar obrigatoriamente:

```text
QE-R7ASM-01
QE-R7ASM-02
QE-R7ASM-03
QE-R7ASM-04

SSCTR-F1
SSCTR-F2
SSCTR-F3
```

e preservar todos os blockers anteriormente fechados.

---

# 2. REIDRATAÇÃO MÍNIMA

Leia primeiro:

- `AGENTS.md`
- `CLAUDE.md`
- `CURRENT_MISSION.md`
- `MISSION_LEDGER.md`

Depois:

`audits/domain-coaching-r7a-state-model-2026-10-28/REVIEW_HANDOFF.md`

e obrigatoriamente os dois pareceres independentes:

- `audits/domain-coaching-r7a-state-model-2026-10-28/reviews/quality-engineering-r7asm-review.md`
- `audits/domain-coaching-r7a-state-model-2026-10-28/reviews/ssctr-r7asm-regression.md`

Leia também:

- `STATE_MODEL_CONTRACT.md` vigente;
- freeze manifest do `HISTORICAL-PROJECTION-FREEZE-1`;
- probes criados pelos dois reviewers;
- tests T1–T17;
- properties P1–P7;
- apenas as policies esportivas consumidas diretamente por F1/F2/F3.

Não reidrate o R6 inteiro.

---

# 3. BASELINE

Antes de editar:

1. confirme o digest exato do `HISTORICAL-PROJECTION-FREEZE-1`;
2. execute verificadores read-only;
3. confirme a suíte;
4. reproduza independentemente:

```text
QE-R7ASM-01
QE-R7ASM-02
QE-R7ASM-03
QE-R7ASM-04
F1
F2
F3
```

Os resultados precisam bater semanticamente com os dois reviewers.

Se não baterem:

pare e diagnostique antes de alterar runtime.

---

# 4. NÃO REABRIR O STATE MODEL

A seguinte arquitetura está FIXA nesta missão:

```text
Canonical Evidence
        ↓
HistoricalState

HistoricalState
        +
PlanningProjection
        +
constraints / policy
        ↓
PlanningView / resolved prescription
```

Não criar:

- HistoricalState v2;
- novo provenance framework;
- event sourcing;
- temporal database;
- novo planner;
- novo reducer geral.

Corrigir consumers e boundaries.

---

# 5. QUATRO FRENTES EXATAS DA MISSÃO

## A — HISTORY INGRESS

Problema central:

`QE-R7ASM-01`

Hoje existe caminho em que uma linha prescrita KNOWN pode estabelecer carga no histórico sem carga factual utilizável.

Exemplo:

```text
projection:
db-rdl = 20 kg

evidence establishing that load is later retracted/corrected

athlete executes without readable load

WRONG:
HistoricalState.db-rdl = KNOWN 20 kg
```

Isso deve ser impossível.

### Regra

```text
PlanningProjection
NEVER establishes HistoricalState
```

Um HistoricalState só pode receber carga/exposição através de:

- factual completed execution;
- valid imported execution;
- valid historical correction;
- canonical factual report;
- other explicitly authorized evidence.

### Proibido

Não fazer patch:

```text
if exercise == db-rdl ...
```

Corrigir a classe.

---

# 6. B — CORRECTION / RETRACTION BOUNDARY

Problema:

`QE-R7ASM-04`

O reducer factual interno consegue ficar correto, mas `historicalStateOf()` ou API equivalente ainda enxerga linhas:

```text
superseded
retracted
corrected-away
```

como se fossem evidence viva.

### Regra

Toda leitura pública de HistoricalState deve consumir:

> **o resultado factual canônico APÓS dedupe / corrections / supersession / retraction.**

Não reconstruir History revarrendo raw ledger indiscriminadamente.

Exemplo:

```text
original = 22 kg
correction = 20 kg
```

Esperado:

```text
HistoricalState = 20 kg
```

em TODAS as APIs públicas.

Nunca:

```text
internal reducer = 20
public historicalStateOf = 22
```

---

# 7. C — SEMANTIC PLANNING VIEW

Este é o ponto mais importante.

Os findings:

```text
QE-R7ASM-02
QE-R7ASM-03
F2
F3
```

demonstram que combinar state atoms independentemente pode criar uma dose incoerente.

NÃO assumir:

```text
load = history.load
reps = projection.reps
sets = projection.sets
tick = ...
```

apenas porque cada campo isoladamente parece válido.

Uma prescrição de força é uma decisão semanticamente composta.

---

# 8. RESOLVED EXERCISE PRESCRIPTION

Introduza a menor abstração suficiente equivalente a:

```text
resolveExercisePrescription(
    HistoricalExerciseState,
    PlanningProjection,
    Goal,
    ProgressionPolicy,
    CurrentPhase,
    ReturnState
)
```

Não force este nome/API.

Mas deve existir UM lugar semanticamente responsável por resolver:

- load;
- sets;
- reps;
- RIR;
- progression state;
- HOLD;
- MAINTAIN;
- return/reestablishment;

como uma dose coerente.

Não espalhar resolução átomo por átomo entre consumers.

---

# 9. HOLD — REGRA BINDING

F2 mostrou regressão material.

A policy já aprovada estabelece:

> **HOLD repete a dose pertinente; não concede progressão.**

Exemplo:

```text
target range = 4–6
performed = 82.5 kg × 3
gate = HOLD
```

NÃO produzir silenciosamente:

```text
82.5 × 5
```

ou:

```text
82.5 × 6
```

porque PlanningProjection tinha reps futuras.

Resolver a dose conforme a policy vigente.

Não criar ciência nova.

---

# 10. MAINTAIN — REGRA BINDING

F3:

última execução factual:

```text
70 kg × 10
```

novo objetivo:

```text
MAINTAIN
rep range = 8–8
```

Não carregar uma projeção antiga e produzir:

```text
70 × 12
```

por semanas.

A resolução precisa respeitar:

- factual execution;
- target range do objetivo atual;
- policy de MAINTAIN.

Esse caso entra obrigatoriamente na suite pré-freeze.

---

# 11. RESTART / RETURN — PLANNING BASE

`QE-R7ASM-02` demonstrou que:

```text
RETURN
```

e:

```text
RESTART
```

estão lendo fontes diferentes.

Com o mesmo histórico factual, não pode existir aceleração indevida apenas porque um caminho lê Projection e outro History.

A fonte factual deve ser consistente com o contrato de cada modo.

Não force os dois modos a serem idênticos se policy disser o contrário.

Mas qualquer diferença deve vir da policy, não de source contamination.

---

# 12. D — TEMPORAL EVIDENCE CREDIT

F1 mostrou que a implementação ainda consegue creditar sessões futuras da mesma semana como passos já executados.

Exemplo:

```text
quinta:
return reported

sexta:
planned sessions
```

Essas sessões de sexta NÃO são factual evidence na quinta.

### Regra

Evidence credit é temporal:

```text
session executed at T
→ evidence exists at/after T
```

Nunca:

```text
week contains planned Friday session
→ Thursday historical state gets Friday credit
```

---

# 13. EVIDENCE THROUGH TIME

Para consumers de return/recovery/reestablishment, deve existir uma semântica equivalente a:

```text
HistoricalState through timestamp T
```

Ela contém somente fatos válidos até T.

Não precisa criar temporal database.

Use o menor mecanismo já suportado pelo reducer atual.

---

# 14. D53 / D57

F1 reabriu materialmente:

- D53;
- D57.

Esta missão precisa restaurá-los.

D53/D57 só podem voltar a CLOSED se:

- sessões futuras não ganham return credit;
- restauração não salta steps;
- exercício não sai prematuramente da proteção;
- grade SSCTR volta aos limites previamente aprovados.

---

# 15. R42

A parte de progression credit já havia sido tratada.

Agora F2 mostrou que:

```text
earned progression
```

e:

```text
projected reps
```

ainda podem se misturar.

Formalize claramente:

```text
EarnedProgress
```

versus:

```text
ProjectedProgress
```

se o runtime ainda não distingue semanticamente.

Não criar metadata redundante se os conceitos existentes já forem suficientes.

---

# 16. FINDINGS NÃO BLOQUEANTES

Os seguintes NÃO expandem automaticamente a missão:

```text
NF-1
NF-2
NF-3
R41
QE-R7ASM-05
QE-R7ASM-06
QE-R7ASM-07
```

Tratamento:

### Se desaparecerem naturalmente
registre como collateral closure.

### Se permanecerem
registre no backlog.

NÃO ampliar a missão para resolvê-los, salvo se indicarem violação direta de uma das quatro propriedades centrais:

1. history ingress;
2. correction boundary;
3. semantic prescription resolution;
4. temporal evidence.

---

# 17. TESTES OBRIGATÓRIOS — FINDINGS DOS REVIEWERS

Importe/recrie como regressões obrigatórias:

```text
QE-R7ASM-01
QE-R7ASM-02
QE-R7ASM-03
QE-R7ASM-04

F1
F2
F3
```

Os probes criados pelos reviewers devem ser preservados ou transformados em tests equivalentes.

Todos precisam falhar no predecessor e passar no candidate.

---

# 18. TESTES DE HISTORY INGRESS

## H1

Projected KNOWN load sem factual load:

→ History não ganha load.

## H2

Valid factual load:

→ History ganha exatamente o factual.

## H3

Projection = 20, execution = 18:

→ History = 18.

## H4

Projection = 20, unreadable execution load:

→ History não inventa 20.

## H5

Correction retracts original evidence:

→ retracted value desaparece de toda Historical API.

---

# 19. TESTES DE SEMANTIC DOSE

## S1 — HOLD

Não progride reps/load.

## S2 — MAINTAIN

Resolved prescription respeita range atual.

## S3 — Projection above history

Não cria progressão não conquistada.

## S4 — Partial execution

Resolve somente com factual atoms disponíveis.

## S5 — Return/restart

Mesmos fatos + diferenças de policy controladas.

## S6 — Goal change

Projection anterior não sobrevive se contradiz novo goal contract.

---

# 20. TESTES TEMPORAIS

## T1

Return quinta + sessão sexta não executada:

→ sexta não influencia quinta.

## T2

Depois de executar sexta:

→ sexta pode influenciar History conforme policy.

## T3

Late sync com execution timestamp anterior:

→ entra retroativamente quando provenance permite.

## T4

Report timestamp posterior sem execution anterior:

→ não antecipa evidence.

## T5

Week boundary:

→ não concede crédito por sessões futuras.

---

# 21. PROPERTY TESTS

## P1 — PLAN CANNOT ESTABLISH HISTORY

Alterar somente PlanningProjection:

→ HistoricalState idêntico.

---

## P2 — RETRACTION REMOVES AUTHORITY

Evidence factual corrigida/retratada:

→ nenhum consumer público devolve o valor antigo como factual.

---

## P3 — SEMANTIC DOSE COHERENCE

Nenhuma ResolvedPrescription pode combinar atoms produzindo dose inválida segundo current goal/policy/gate.

---

## P4 — HOLD STABILITY

HOLD + ausência de nova evidence:

→ resolved dose não progride.

---

## P5 — TIME MONOTONICITY

HistoricalState(T1) não contém evidence executada apenas após T1.

---

## P6 — EXECUTION PROMOTES ONLY AFTER EXECUTION

Mover execution timestamp de após T para antes de T:

→ somente então passa a influenciar HistoricalState(T).

---

## P7 — CORRECTION API CONSISTENCY

Reducer factual e APIs públicas devem devolver o mesmo HistoricalState.

---

# 22. CONSUMER AUDIT

Audite somente consumidores materiais ligados a:

- `setUp`;
- `historicalStateOf`;
- `planningBase`;
- `PlanningView`;
- progression;
- weekly review;
- return;
- restart;
- reestablishment;
- goal change.

Perguntas:

1. Este consumer está pedindo History ou Projection?
2. Ele recebe a view correta?
3. Ele está resolvendo uma dose semanticamente?
4. Ele usa evidence futura?
5. Ele lê linhas retratadas?

Não fazer audit infinito do repo.

---

# 23. TEST QUALITY AUDIT

O reviewer descobriu que alguns testes usavam:

```text
supersedes:
```

de forma que não exercitava correction real.

Portanto:

audite especificamente os tests de:

- correction;
- retraction;
- supersession;
- conflict.

Confirme que os fixtures passam pelos mesmos normalizers/paths do runtime real.

Um teste não conta como cobertura de correction se estiver exercitando apenas conflito.

---

# 24. SELF-CHALLENGE ANTES DO FREEZE

O autor deve tentar quebrar:

### History contamination
- prescribed KNOWN without factual load;
- retracted evidence;
- conflicting report;
- late wearable data.

### Semantic dose
- HOLD;
- MAINTAIN;
- HYPERTROPHY;
- GENERAL;
- RUNNING_SUPPORT;
- goal change;
- partial reps;
- partial load.

### Temporal evidence
- return midweek;
- future same-week session;
- cross-week;
- late sync;
- same-day ordering.

### Public API
- reducer vs historicalStateOf;
- PlanningView vs History.

Se encontrar finding:

corrigir antes do freeze.

---

# 25. MUTATION

Adicionar mutantes especificamente para:

- projection establishes load;
- retracted evidence remains public;
- HOLD uses projected reps;
- MAINTAIN keeps old projected reps;
- future session earns return credit;
- RESTART reads projection instead of factual base;
- public Historical API reads superseded line.

Cada mutante material deve ser capturado ou justificado.

---

# 26. REGRESSÕES

Preservar:

- R5;
- R6 holdout;
- profiles;
- simulations;
- previous R7-A suites;
- week composition;
- event supersession;
- exercise merge;
- interruption identity;
- state-at-interruption;
- week-start authority;
- HistoricalState/PlanningProjection separation;
- D56;
- D58;
- D59;
- R40;
- blockers anteriores fechados.

Restaurar:

```text
D53 = CLOSED
D57 = CLOSED
```

Se qualquer regressão material nova surgir:

corrigir antes do freeze.

---

# 27. PRE-FREEZE EXIT CONDITIONS

NÃO congelar enquanto qualquer um destes falhar:

```text
QE-R7ASM-01
QE-R7ASM-02
QE-R7ASM-03
QE-R7ASM-04

F1
F2
F3
```

Além disso:

- full suite green;
- properties green;
- self-challenge sem blocker conhecido;
- mutation pertinente executada;
- consumer audit concluído;
- correction fixtures validados;
- regressões classificadas;
- D53/D57 restaurados;
- D56/D58/D59 preservados.

---

# 28. UM ÚNICO FREEZE

Quando todos os gates pré-freeze estiverem satisfeitos:

criar:

```text
STATE-MODEL-CONSUMER-FREEZE-1
```

ou nome canônico equivalente.

Registrar:

- digest;
- manifest;
- source revision;
- runtime files;
- tests;
- probes;
- mutation;
- regressions.

Depois:

**NÃO alterar runtime.**

---

# 29. PARAR NO FREEZE

IMPORTANTE:

Nesta sessão de implementação:

NÃO executar reviewers depois do freeze.

Prepare:

- `REVIEW_HANDOFF.md`
- `ENGINEERING_REVIEW_BRIEF.md`
- `SSCTR_REGRESSION_REVIEW_BRIEF.md`

ambos apontando para exatamente o mesmo freeze.

Depois reporte:

```text
STATE_MODEL_CONSUMER_FREEZE_READY_FOR_INDEPENDENT_REVIEW = YES
```

e PARE.

---

# 30. ENGINEERING BRIEF

A pergunta central da revisão independente futura será:

> **Existe algum caminho V1 material em que PlanningProjection, prescribed lines, retracted evidence ou future evidence consigam contaminar HistoricalState ou produzir uma dose semanticamente incoerente?**

O reviewer deve atacar especialmente os sete findings desta missão.

---

# 31. SSCTR BRIEF

Regression-only.

Verificar:

- F1;
- F2;
- F3;
- D53;
- D56;
- D57;
- D58;
- D59;
- HOLD;
- MAINTAIN;
- return;
- restart;
- restoration;
- progression.

Não reabrir literatura geral.

---

# 32. SEM NOVA EXPANSÃO

NÃO implementar nesta missão:

- B0;
- archetypes;
- pace;
- marathon;
- run repertoire;
- strength repertoire;
- hybrid patterns;
- athlete learning;
- Figma;
- KMP;
- HealthKit;
- Admin.

---

# 33. CRITÉRIO ARQUITETURAL FINAL

As quatro propriedades que esta missão precisa provar são:

## PROPERTY A

```text
Only factual evidence writes HistoricalState.
```

## PROPERTY B

```text
Retracted/superseded evidence cannot remain factual through another API.
```

## PROPERTY C

```text
PlanningView resolves coherent prescriptions,
not arbitrary atom mixtures.
```

## PROPERTY D

```text
Evidence only affects history after the evidence actually exists in time.
```

Se essas quatro propriedades estiverem preservadas no freeze, a implementação está pronta para revisão independente.

---

# 34. STOP CONDITION GLOBAL

Esta missão NÃO tenta provar que nenhum bug futuro existe.

Depois das revisões independentes, somente violações materiais das quatro propriedades acima, ou regressões esportivas diretas F1/F2/F3/D53–D59, podem bloquear o fechamento desta fundação.

Findings fora dessas classes vão para backlog/B/C/TestFlight conforme o caso.

Esta regra existe para impedir expansão indefinida da fase A.

---

# 35. CURRENT_MISSION / LEDGER

Atualizar append-only.

Antes das revisões:

```text
CURRENT_MISSION = STATE_MODEL_CONSUMER_CLOSURE_FROZEN
NEXT_STEP = INDEPENDENT_REVIEWS
```

Não emitir ainda:

```text
R7A_EXIT_READINESS
```

---

# 36. RELATÓRIO PRE-FREEZE

Produzir:

1. baseline;
2. sete findings;
3. root causes;
4. history ingress;
5. correction boundary;
6. semantic PlanningView;
7. temporal evidence;
8. HOLD;
9. MAINTAIN;
10. D53/D57;
11. tests;
12. properties;
13. test-quality audit;
14. consumer audit;
15. mutation;
16. regressions;
17. freeze identity;
18. reviewer entry points.

Separar:

- COMPROVADO;
- INFERIDO;
- NÃO TESTADO.

---

# PRINCÍPIO FINAL

HistoricalState responde:

> **o que realmente aconteceu?**

PlanningProjection responde:

> **o que queremos que aconteça?**

ResolvedPrescription responde:

> **dado o que aconteceu, o que devemos prescrever agora?**

Nenhuma dessas três perguntas deve ser respondida usando dados pertencentes à outra camada sem uma transformação semântica explícita.

---

# EXECUTE

Reidrate somente o necessário.

Reproduza os sete findings.

Não redesenhe HistoricalState/PlanningProjection.

Feche history ingress.

Feche correction/retraction boundary.

Implemente semantic dose resolution.

Feche temporal evidence credit.

Restaure D53/D57.

Preserve D56/D58/D59 e todos os blockers anteriores.

Execute todos os gates pré-freeze.

Crie UM freeze.

Prepare os dois briefs independentes.

PARE.

NÃO execute reviewers.

NÃO inicie R7-B0.
