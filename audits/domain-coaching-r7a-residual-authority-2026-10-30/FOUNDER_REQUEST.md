# Founder request — DOMAIN_COACHING_R7-A RESIDUAL AUTHORITY CLOSURE (2026-10-30)

The direct request that opened this Cloud session, recorded verbatim below. It is the authority for this mission; the
[task contract](TASK_CONTRACT.md) and the [residual authority contract](RESIDUAL_AUTHORITY_CONTRACT.md) cite its sections (§).

````text
DOMAIN_COACHING_R7-A — RESIDUAL AUTHORITY CLOSURE
FINAL BOUNDED IMPLEMENTATION MISSION
Você está iniciando uma NOVA Cloud Session.
Esta missão é deliberadamente PEQUENA e FINITA.
Há orçamento computacional limitado. Use Execution Proportionality rigorosamente.
NÃO reabra a arquitetura geral.
NÃO reavalie todo o treinador.
NÃO faça nova pesquisa científica.
NÃO execute reviewers.
NÃO inicie R7-B0.
0. BASELINE
A branch-base de autoridade é:
`claude/trusting-euler-04la8t`
Ela contém:
`R7A-DECISION-AUTHORITY-FREEZE-1`
Runtime freeze commit:
`d4631cd03fb27bbc1857532500748476ab764987`
Handoff/docs commit:
`5434b3265f5634d1e7c796426cd9d8415b3b1af2`
Source digest:
`3a7166b25aaf550f7692cc058f0e582b42e9eb7f74b9e361f23733b5e74ab244`
Manifest:
`a500cdd94b8a4994a718029d4ee6efdc703e4f54de59d0855b5598c0d1afb224`
Policy:
`18ec48f3…`
A Cloud Session pode criar sua própria branch a partir dessa baseline.
Permaneça na branch Cloud criada pela infraestrutura.
NÃO faça merge em:

* `claude/trusting-euler-04la8t`;
* `r7/decision-authority-closure-base`;
* `main`.

1. REVIEWS INDEPENDENTES — AUTORIDADES
Existem dois reviews independentes concluídos em branches separadas.
Engineering
Branch:
`review/r7ada-decision-authority-engineering`
Commit:
`17e7285`
Parecer:
`R7A_DECISION_AUTHORITY_ENGINEERING_REVIEW = NOT_READY`
SSCTR
Branch:
`review/r7ada-decision-authority-ssctr`
Commit:
`6f5d40c`
Parecer:
`R7A_DECISION_AUTHORITY_SCIENTIFIC_REGRESSION = NOT_READY`
Faça `git fetch origin` se necessário.
Leia esses pareceres por `git show`, refs remotas ou mecanismo equivalente.
NÃO faça merge dessas branches na baseline apenas para lê-las.
Use somente os findings pertinentes abaixo.
2. O QUE JÁ ESTÁ FECHADO
Não reabra:

```
QE-R7ASC-01 = CLOSED nos caminhos previamente julgados
QE-R7ASC-02 = CLOSED
QE-R7ASC-03 = CLOSED
QE-R7ASC-04 = CLOSED

F1 = CLOSED
F2 = CLOSED
F3 = CLOSED

D53 = VALID
D56 = VALID
D57 = VALID
D58 = VALID
D59 = VALID

HOLD = VALID
MAINTAIN = VALID
```

Também estão aceitos:

```
R2 = ACCEPT_WITH_REASON
R3 = ACCEPT_WITH_REASON
R6-H35 = EXPECTED_CORRECTION
```

Não reabra essas decisões sem uma regressão diretamente causada pela implementação desta missão.
3. R1 — DECISÃO DO FOUNDER
R1 NÃO bloqueia esta fase A.
Registrar:

```
R1_R7A_BLOCKER = NO
R1_PRE_TESTFLIGHT_GATE = YES
```

Semanas sem revisão/execução que mantêm linhas projetadas poderão ser tratadas antes de TestFlight caso necessário.
Nesta missão:
NÃO implementar uma solução geral para R1.
NÃO deixar R1 expandir o escopo.
4. OBJETIVO ÚNICO
Fechar DOIS root causes residuais.
ROOT CAUSE A
Canonical factual corrections must apply before every material decision handler.
Finding principal:
`QE-R7ADA-01`
ROOT CAUSE B
Return baseline must never exceed factual tolerated running dose/state.
Findings:
`QE-R7ADA-02`
`F4-X`
incluindo EASY return acima da última dose executada.
Só isso.
5. ROOT CAUSE A — QE-R7ADA-01
O problema:
uma factual correction/retraction/conflict é aplicada corretamente em alguns caminhos, especialmente weekly review, mas outros handlers ainda podem decidir usando uma linha antiga.
Exemplo material:

```
original factual/load context = 24 kg
correction = 20 kg

event arriving with correction:
schedule change / goal change / unavailable day /
local fatigue / turn conflict / wearable conflict

WRONG:
handler still sees/plans 24 kg
execution/log later adopts 24 kg
HistoricalState becomes KNOWN 24
```

Com os mesmos fatos via weekly review:

```
HistoricalState = KNOWN 20
+ appropriate confirmation/question when required
```

Isso precisa ser globalmente consistente.
6. FACTUAL AUTHORITY — REGRA FINAL
Antes de QUALQUER material decision handler:

```
raw evidence
↓
dedupe
↓
corrections / retractions / conflicts
↓
canonical factual state
↓
decision handler
```

Não:

```
handler
↓
later correction reconciliation
```

Todo handler material deve enxergar a mesma factual truth vigente para o mesmo conjunto de evidências.
7. NÃO CORRIGIR HANDLER POR HANDLER
Não resolver com vários patches como:

```
if scheduleChange...
if goalChange...
if fatigue...
```

se existe um ponto comum onde factual evidence pode ser canonicalizada antes do dispatch.
Implemente a menor abstração suficiente.
Não redesenhe HistoricalState.
Não crie novo event-sourcing/provenance framework.
8. QE-R7ADA-01 — CASOS OBRIGATÓRIOS
Reproduza exatamente os probes do Engineering Reviewer e cubra pelo menos:

1. correction 24 → 20 + schedule change;
2. correction + goal change;
3. correction + unavailable day;
4. correction + local fatigue/reduction;
5. correction + turn conflict;
6. wearable/conflicting evidence;
7. removed/retracted load;
8. correction upward, para verificar direção conservadora.

Com fatos equivalentes:

```
weeklyReview
scheduleChange
goalChange
fatigue
etc.
```

não podem produzir factual histories diferentes apenas por handler de entrada.
9. PROPERTY A1 — HANDLER INDEPENDENCE
Para o mesmo canonical factual evidence:

```
handler A
handler B
handler C
```

devem começar da mesma factual truth.
10. PROPERTY A2 — PLANNED DATA CANNOT RESURRECT RETRACTED FACT
Depois de:

```
24 kg retracted/corrected → 20 kg
```

uma prescribed/planned line de 24 kg não pode reconstruir 24 como factual sem nova factual execution válida.
11. PROPERTY A3 — CONFIRMATION SEMANTICS
Preserve a regra existente de confirmação/pergunta quando aplicável.
Não transforme:

```
factual correction
```

em:

```
automatic adoption of stale planned value
```

só para evitar ASK.
12. ROOT CAUSE B — UNIVERSAL RUN RETURN CEILING
Engineering e SSCTR convergiram.
Problema conceitual:

```
released/projected next running step
!=
factual tolerated running step
```

Return precisa partir do último estado/dose factual elegível conforme policy.
13. F4-X — WALK/JOG → CONTINUOUS
Cenário obrigatório:

```
walk/jog step 8 executed
= 1 × 20 min continuous jog

next continuous-running step becomes AVAILABLE/PROJECTED
but is NEVER executed

pause occurs
RETURN SHORT
```

WRONG:

```
3 × 25 min continuous runs/week
```

O atleta nunca executou essa saída.
O retorno deve usar o último running state factual/tolerado.
14. EASY RETURN CEILING
Engineering encontrou também exemplos como:

```
last factual long/easy dose = 70 min
next projected = 75 min
pause
RETURN
```

WRONG:

```
return starts from 75
```

A mesma propriedade deve valer.
Não criar fix exclusivo para walk/jog.
15. UNIVERSAL RETURN PROPERTY
Para qualquer running state V1 suportado:

```
return baseline
<=
applicable factual tolerated running dose/state
```

salvo exceção explicitamente existente na policy.
Isso deve cobrir de forma bounded:

* WALK_JOG → WALK_JOG;
* WALK_JOG → CONTINUOUS;
* EASY → EASY;
* long run;
* short return;
* moderate return;
* repeated pause.

Não expandir para catálogo inteiro de corrida.
16. RELEASED != EXECUTED
Uma sessão pode estar:

```
eligible
released
planned
scheduled
```

sem estar:

```
executed
tolerated
earned
```

Return só pode usar como autoridade aquilo que a policy reconhece como factual/tolerado.
17. F4-X TEST
Obrigatório:

```
F4-X fails on predecessor
F4-X passes on candidate
```

Use o probe real do SSCTR, não uma versão simplificada.
18. EASY RETURN TEST
Obrigatório:

```
70 factual
75 projected only
pause
→ return must not use 75 as earned baseline
```

Teste equivalentes mínimos.
19. PRESERVAR F1–F4 / D53–D59
Depois do fix:

```
F1 = CLOSED
F2 = CLOSED
F3 = CLOSED
F4 = CLOSED incluindo F4-X
```

e:

```
D53
D56
D57
D58
D59
```

continuam válidos.
20. PRESERVAR HOLD / MAINTAIN
Não alterar suas semantics.
HOLD continua:

* sem progression credit futuro;
* sem projected progression adquirida;
* podendo repetir current prescribed line aprovada conforme policy.

MAINTAIN continua preservando o comportamento já aprovado.
21. NÃO CORRIGIR NF-R7ADA-2
O SSCTR registrou como não bloqueante:
RETURN pode transformar walking days em running days em determinado caminho.
Isso é backlog.
NÃO expandir esta missão para isso.
22. TARGETED TEST-FIRST FLOW
Por custo de Cloud:
primeiro rode apenas:

* probes QE-R7ADA-01;
* probes QE-R7ADA-02;
* F4-X;
* EASY return ceiling;
* testes diretos afetados.

Implemente.
Rode novamente esses testes.
Somente depois rode a suíte/regressões maiores.
Evite executar repetidamente a suíte completa durante edição.
23. TESTS OBRIGATÓRIOS
Adicionar regressions para:

```
QE-R7ADA-01
QE-R7ADA-02
F4-X
EASY return factual ceiling
```

Cada um deve:

```
FAIL predecessor
PASS candidate
```

24. PROPERTY TESTS — SOMENTE ESTES
P1 — FACTUAL CORRECTION GLOBALITY
Mesma factual evidence corrigida + handlers diferentes:
→ mesma factual state inicial.
P2 — RETRACTED TARGET CANNOT RESURRECT
Retracted/corrected value:
→ planned stale value não volta para History.
P3 — RETURN FACTUAL CEILING
Projected/released run state acima do factual:
→ return usa factual tolerated state.
P4 — EXECUTION PROMOTES
Se o atleta realmente executar o próximo state:
→ ele passa a poder ser autoridade de retorno.
Somente esses property clusters.
25. BOUNDED SELF-CHALLENGE
Ataque somente:
Factual correction

* weekly review;
* schedule;
* goal;
* unavailable;
* fatigue;
* conflict;
* wearable correction.

Return ceiling

* walk/jog;
* walk/jog → continuous;
* EASY;
* long run;
* short/moderate return;
* repeated pause.

Não procurar novas áreas do treinador.
26. MUTATION — MÍNIMA
Somente mutantes diretamente relacionados:

1. bypass canonical correction before handler;
2. stale planned load resurrects corrected load;
3. walk/jog projected exit used as return baseline;
4. EASY projected dose used as return baseline.

Não executar campanha geral de mutation.
27. REGRESSÕES
Depois dos fixes e targeted tests:
rode uma única rodada adequada de:

* full test suite;
* relevant R7-A regression suites;
* F1–F4 kit;
* D53/D56/D57/D58/D59;
* HOLD;
* MAINTAIN.

R5/R6/profiles/simulations somente conforme necessário pelos verificadores existentes; não criar nova avaliação ampla.
Qualquer diferença deve ter causa nomeada.
28. NÃO TESTADO / FORA DO GATE
Não tente resolver:

* atletas reais;
* clinical;
* fresh generalization;
* repertoire;
* marathon;
* pace;
* KMP;
* HealthKit;
* B0;
* R1/TestFlight gate;
* NF-R7ADA-2.

29. PRE-FREEZE GATE
Somente congele se:

```
QE-R7ADA-01 = CLOSED
QE-R7ADA-02 = CLOSED
F4-X = CLOSED
EASY_RETURN_FACTUAL_CEILING = CLOSED
```

e:

```
F1/F2/F3 remain CLOSED
D53/D56/D57/D58/D59 remain valid
HOLD preserved
MAINTAIN preserved
```

e:

* targeted properties pass;
* targeted mutation pass/justified;
* full suite green;
* no known blocker in these two root causes.

30. UM ÚNICO FREEZE
Quando todos os gates passarem:
crie:
`R7A-RESIDUAL-AUTHORITY-FREEZE-1`
ou nome canônico equivalente.
Registre:

* source digest;
* manifest;
* branch;
* commit;
* runtime delta;
* targeted tests;
* properties;
* mutation;
* regressions.

31. GIT / CLOUD
Permaneça na branch Cloud criada para esta sessão.
Faça commit/push do freeze.
NÃO faça merge.
NÃO altere as branches de review anteriores.
NÃO altere a baseline original.
32. PARAR NO FREEZE
NÃO execute reviewers nesta sessão.
Prepare somente:

```
REVIEW_HANDOFF.md
ENGINEERING_RECHECK_BRIEF.md
SSCTR_RECHECK_BRIEF.md
```

33. ENGINEERING RECHECK — ESCOPO FUTURO
Somente:

1. QE-R7ADA-01 / factual correction globality;
2. QE-R7ADA-02 structural return ceiling;
3. preservation das properties A/B/E diretamente afetadas.

Não será uma revisão aberta.
34. SSCTR RECHECK — ESCOPO FUTURO
Somente:

1. F4-X;
2. EASY return factual ceiling;
3. F1–F4;
4. D53/D56/D57/D58/D59;
5. HOLD/MAINTAIN preservation.

Não reabrir ciência.
35. STOP CONDITION FINAL DA R7-A
Se este freeze passar nas duas rechecks estreitas:

```
R7A_EXIT_READINESS = READY
```

deverá poder ser emitido pela futura closure session.
Findings fora dos dois root causes desta missão NÃO reabrem A automaticamente.
R1 permanece:

```
PRE_TESTFLIGHT_GATE
```

e não bloqueia B0.
36. GROWTH LAYER
Não aplique:
`audits/growth-layer-2026-10-29/PENDING_CANON_SYNC.patch`
nesta missão.
37. OUTPUT
Se congelar com sucesso:
reporte:

```
R7A_RESIDUAL_AUTHORITY_FREEZE_READY_FOR_RECHECK = YES
```

mais:

* freeze;
* branch;
* commit;
* digest;
* QE-R7ADA-01 status;
* QE-R7ADA-02 status;
* F4-X status;
* EASY return status;
* F1–F4;
* D53–D59;
* HOLD;
* MAINTAIN;
* test count;
* targeted mutation;
* reviewer recheck brief paths.

Depois:
PARE.
38. SE NÃO CONSEGUIR FECHAR
Se um dos DOIS root causes continuar estruturalmente aberto:
NÃO expanda a missão.
NÃO crie uma nova arquitetura por conta própria.
NÃO congele artificialmente.
Reporte:

```
R7A_RESIDUAL_AUTHORITY_PRE_FREEZE = BLOCKED
```

com reprodução e a decisão arquitetural mínima necessária do Founder.
PRINCÍPIO FINAL
Esta missão possui somente duas perguntas:

```
1. Todos os handlers enxergam a factual correction vigente antes de decidir?

2. Todo return começa de uma dose/state factual realmente tolerada,
   e nunca apenas liberada/projetada?
```

Se as duas respostas forem demonstravelmente SIM, pare.
Não procure uma terceira pergunta.
EXECUTE.
````
