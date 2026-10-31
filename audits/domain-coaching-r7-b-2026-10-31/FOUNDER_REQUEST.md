# DOMAIN_COACHING_R7-B — Founder request (verbatim)

Received 2026-10-31 (America/Sao_Paulo) as the direct Founder instruction of this session, pasted in full. It is the separate explicit authorization that the [R7-B0 handoff](../../CoachingCore/r7/b0/B0_HANDOFF.md) required before R7-B could start. Recorded below the rule; nothing was added to it.

---

# DOMAIN_COACHING_R7-B — RUNTIME REPERTOIRE INTEGRATION

Você está iniciando uma NOVA missão.

A R7-A está formalmente encerrada.

A R7-B0 também está encerrada como especificação.

Não reabra nenhuma das duas sem uma regressão concreta e reproduzível.

---

# 0. BASELINE

Crie uma nova branch a partir da branch final da B0:

`claude/domain-coaching-r7-b0`

Commit de fechamento:

`c66966e`

Crie:

`claude/domain-coaching-r7-b`

Não trabalhe em `main`.

Não altere a branch B0.

---

# 1. AUTORIDADES HERDADAS

## R7-A

```text
R7A_EXIT_READINESS = READY
R7A_FORMAL_CLOSURE = COMPLETE
```

Freeze:

`R7A-RESIDUAL-AUTHORITY-FREEZE-1`

Runtime freeze:

`7d2da3603e224124696a2290766ec448080f3264`

Preservar integralmente os invariantes já fechados:

- QE-R7ADA-01;
- QE-R7ADA-02;
- F1–F4;
- F4-X;
- R7ARA-SELF-01;
- D53;
- D56;
- D57;
- D58;
- D59;
- HOLD;
- MAINTAIN.

---

## R7-B0

Estado:

```text
R7B0_STATUS = CLOSED
SPECIFICATION_READY = YES_WITH_CONDITIONS
RUNTIME_IMPLEMENTATION_READY = NO
V1_COACHING_AUTHORITY_READY = NO
R7B0_SSCTR_GATE = ACCEPT_WITH_CONDITIONS
FOUNDER_BLOCKER = NONE
```

Ponto de entrada:

`CoachingCore/r7/b0/B0_HANDOFF.md`

Catálogo:

`R7B0-CATALOG-2`

Use os artefatos B0 como autoridade de especificação.

Não recrie o repertório.

Não faça nova pesquisa ampla sem gap concreto.

---

# 2. OBJETIVO DA R7-B

A missão é:

> ligar o repertório aprovado da B0 ao runtime real do Coaching Core.

A R7-B deve transformar:

```text
classification
→ archetype
→ repertoire eligibility
→ session configuration
→ hybrid composition
→ progression/regression
```

em comportamento executável.

A missão NÃO é:

- redesenhar o produto;
- criar KMP;
- criar app iOS;
- integrar HealthKit;
- criar backend;
- alterar Figma;
- fazer Growth;
- declarar produção pronta.

---

# 3. PRINCÍPIO CENTRAL

O runtime não deve gerar planos arbitrários.

A sequência deve permanecer:

```text
athlete/context evidence
↓
classification
↓
eligible archetype/repertoire
↓
parameterization
↓
hybrid composition
↓
bounded adaptation
```

O motor deve operar dentro dos envelopes aprovados.

---

# 4. R7-B0 CONDITIONS SÃO AUTORIDADE

O SSCTR aprovou a B0 com condições.

Quando uma condição do SSCTR for mais restritiva do que o catálogo-base:

> a condição prevalece.

Materialize essas condições no runtime e nos testes.

Não trate `ACCEPT_WITH_CONDITIONS` como aprovação irrestrita.

---

# 5. GATES DE QUALIDADE DE CORRIDA

Preservar explicitamente o defeito encontrado e corrigido durante B0.

Sessões de qualidade não podem ser liberadas apenas por capacidade física aparente.

Os gates incluem, conforme autoridade B0:

- objetivo compatível com RACE/PERFORMANCE;
- frequência mínima de corrida aplicável;
- demais eligibility requirements do catálogo.

Não permita regressão dessa correção.

---

# 6. RUNNING REPERTOIRE

Ligue as famílias aprovadas ao runtime.

As famílias incluem, conforme o catálogo:

- easy;
- recovery;
- long;
- steady;
- threshold/tempo;
- intervals;
- VO2-like maintained exposure;
- strides;
- walk/jog;
- return/re-entry;
- taper/event-specific paths quando aprovados.

Não introduza VO2 do zero além do que B0 permite.

O caminho tipo VO2 aprovado é limitado ao trabalho que o atleta já executa e tolera, sem progressão além da autoridade existente.

---

# 7. STRENGTH REPERTOIRE

Integre as configurações aprovadas.

Preserve os metadados necessários:

- movement pattern;
- muscle emphasis;
- axial demand;
- eccentric demand;
- unilateral/bilateral;
- skill demand;
- equipment;
- load convention;
- recovery/interference;
- substitution relations.

Não transforme cada configuração em lógica hardcoded independente se um modelo parametrizado for suficiente.

---

# 8. CONTEXTUAL ROLES

DR-134 permanece autoridade.

Roles:

```text
MAIN
ACCESSORY
PRACTICE
```

São definidos pelo contexto/slot do programa.

Não atribua role universal permanente ao exercício.

Rotation eligibility é eixo separado:

```text
REASON_ONLY
BLOCK_BOUNDARY_ELIGIBLE
TWO_WEEK_ELIGIBLE
```

Implementar:

- MAIN estável dentro do bloco;
- ACCESSORY pode rotacionar quando elegível;
- PRACTICE não gira automaticamente por calendário;
- reason-based substitution prevalece sobre cadence;
- close variation é relação, não role.

---

# 9. B0-F01 → B0-F09

Os findings de vínculo runtime identificados pelo B0 devem ser tratados explicitamente.

Incluem classes como:

- load conventions;
- contextual roles;
- rotation;
- optionality;
- catalog/runtime mismatch;
- eligibility binding.

Crie uma matriz:

```text
finding
→ current runtime behavior
→ target behavior
→ implementation change
→ test
→ status
```

Não permita que nenhum F01–F09 desapareça implicitamente.

---

# 10. HYBRID COMPOSITION

Ligue ao runtime as regras aprovadas de interferência.

Preservar:

- runtime congelado existente;
- extensão B0 aprovada;
- proteção de long run;
- proteção de quality session;
- lower-body eccentric/new work spacing;
- recovery cost;
- same-day rules;
- AM/PM ordering;
- event proximity;
- taper combined.

Prioridade continua dinâmica.

Não introduzir:

```text
RUN_FIRST
STRENGTH_FIRST
BALANCED
```

como preferência fixa obrigatória.

A prioridade deriva de:

- goals;
- phase;
- event proximity;
- history;
- current capacity;
- response;
- protected stimuli;
- recovery;
- schedule;
- interference.

---

# 11. CLASSIFICATION

Ligue a classificação B0 ao runtime.

Preserve os limiares atualmente aprovados.

Importante:

alguns thresholds ainda estão implícitos no código e foram classificados para futura policy declaration.

Não invente novos thresholds nessa missão.

Se necessário, faça o runtime consumir/expor os existentes de forma rastreável.

---

# 12. BEGINNER PATHS

Implemente os caminhos de iniciante aprovados.

Não trate iniciante apenas como:

> atleta avançado com volume menor.

Preserve:

- consistency gates;
- walk/jog;
- skill exposure;
- reduced density;
- controlled progression;
- optionality de estímulos avançados;
- evidence requirement antes de qualidade.

A condição SSCTR sobre graduação de iniciante deve ser aplicada.

---

# 13. PROGRESSION / REGRESSION

O runtime deve navegar:

```text
eligible
→ execute
→ observe
→ progress / maintain / regress
```

dentro do repertório.

Não crie aumentos fora dos envelopes B0/R7-A.

Preserve:

- factual execution authority;
- tolerance;
- correction/retraction authority;
- return ceilings;
- HOLD;
- MAINTAIN.

---

# 14. RETURN / RECOVERY

Não reescreva os mecanismos R7-A.

Integre o catálogo usando os mecanismos já aprovados.

A R7-B não pode reintroduzir:

- projected dose as factual dose;
- released-but-unexecuted progression as return baseline;
- stale planning resurrection;
- walk/jog → continuous skip.

---

# 15. EVENT / TAPER

Integre somente o que B0 aprovou.

Atualmente o escopo pronto inclui:

- 10K;
- half marathon;
- combined strength taper.

Não amplie silenciosamente para novas distâncias.

Suporte a 5K permanece decisão futura opcional.

---

# 16. OPTIONAL / DEFERRED FEATURES

Não introduzir nesta missão sem autoridade nova:

- novo VO2 exposure;
- hills como família nova quando não já materializada;
- plyometrics;
- Nordic;
- Copenhagen;
- bodyweight + external load semantics adicionais;
- outras distâncias/eventos.

Esses itens não bloqueiam R7-B.

---

# 17. COLD START

R7-B deve fechar o necessário para que um usuário válido consiga chegar a um plano inicial coerente.

Considere:

- incomplete history;
- incomplete evidence;
- no recent run history;
- no strength history;
- one modality experienced / other novice;
- limited availability;
- schedule constraints.

Mas não crie ainda aprendizado longitudinal R7-C.

---

# 18. FEASIBILITY NEGOTIATION

O plano deve respeitar disponibilidade real.

Quando o repertório ideal não cabe:

```text
ideal week
↓
feasibility negotiation
↓
protected stimuli
↓
reduced/modified composition
```

Evite simplesmente remover sessões aleatoriamente.

Defina prioridades e fallback usando autoridades existentes.

---

# 19. PROGRAM-LEVEL PROGRESSION

R7-B precisa ligar as sessões em um programa coerente.

Não basta escolher sessões individualmente.

Implemente a progressão necessária entre semanas usando:

- phase;
- archetype;
- evidence;
- tolerance;
- event proximity;
- recovery;
- prior execution.

Sem entrar ainda em longitudinal learning da R7-C.

---

# 20. TESTING

Crie testes proporcionais para provar:

## Classification

- equivalência com B0;
- boundaries;
- eligibility.

## Running

- family selection;
- quality gates;
- novice constraints;
- return paths;
- taper.

## Strength

- role assignment;
- load convention;
- rotation eligibility;
- substitutions;
- skill ladders.

## Hybrid

- interference;
- spacing;
- same-day;
- protected stimuli;
- taper.

## Regression protection

- R7-A invariants.

Não faça apenas happy paths.

---

# 21. CONFORMANCE

Crie uma suíte ou matriz de conformance entre:

```text
R7B0 catalog
↕
runtime behavior
```

Toda regra prescritiva importante do catálogo deve:

- ter consumidor;
- ser implementada;
- ou ser explicitamente deferida.

Não deixe campos “documentais” sem destino sem justificar.

---

# 22. MUTATION / ADVERSARIAL VALIDATION

Use apenas onde agrega confiança.

Priorize mutações/probes em:

- eligibility;
- quality gating;
- rotation;
- interference;
- return ceilings;
- progression.

Não crie uma infraestrutura enorme.

---

# 23. SSCTR GATE

Depois que o runtime estiver implementado e congelado:

execute uma revisão SSCTR independente focada em:

- fidelity ao catálogo;
- conditions B0;
- progression;
- regression;
- novice paths;
- hybrid interference;
- taper;
- return/recovery;
- dose boundaries.

O SSCTR não deve revisar a própria implementação antes do freeze.

---

# 24. ENGINEERING REVIEW

Depois do freeze:

uma revisão independente de Engineering deve testar:

- catalog/runtime conformance;
- state transitions;
- stale-state resurrection;
- correction/retraction;
- determinism;
- boundary behavior;
- impossible combinations;
- regression against R7-A.

---

# 25. QUALITY REVIEW

Use um terceiro juiz de qualidade somente para propriedades que não estejam já cobertas pelos dois anteriores.

Foco possível:

- completeness;
- reachability;
- dead repertoire;
- orphan configurations;
- unreachable archetypes;
- contradictions.

Não duplique Engineering/SSCTR.

---

# 26. FREEZE

Quando a implementação estiver pronta para review:

crie novo freeze específico da R7-B.

Não reutilize o freeze da R7-A como se representasse o novo runtime.

O novo freeze deve incluir:

- runtime;
- relevant tests;
- catalog binding;
- source digest;
- manifest;
- policy identity.

---

# 27. FOUNDER BLOCKERS

Não peça decisões sobre os cinco itens opcionais do B0.

Eles permanecem fora da missão.

Só abra Founder blocker se a implementação revelar uma escolha genuinamente estratégica que não possa ser resolvida por autoridade já existente.

---

# 28. NÃO FAZER

Não:

- iniciar KMP;
- implementar iOS;
- integrar HealthKit;
- integrar WorkoutKit;
- construir backend;
- alterar Figma;
- mexer em Growth;
- adicionar social/Crew;
- expandir para cycling/swimming;
- declarar V1 pronta.

---

# 29. EXIT CRITERIA

R7-B pode encerrar quando:

1. `R7B0-CATALOG-2` está ligado ao runtime;
2. F01–F09 têm disposição;
3. classificação e archetypes funcionam;
4. running repertoire funciona;
5. strength repertoire funciona;
6. hybrid composition funciona;
7. beginner paths funcionam;
8. cold start mínimo funciona;
9. program-level progression funciona;
10. feasibility negotiation funciona;
11. return/recovery permanece correto;
12. taper aprovado funciona;
13. B0 SSCTR conditions estão materializadas;
14. R7-A invariants permanecem íntegros;
15. conformance catálogo ↔ runtime está provada;
16. novo freeze existe;
17. SSCTR independente aceita;
18. Engineering independente aceita;
19. Quality review, se necessária, não encontra blocker;
20. nenhum Founder blocker permanece.

---

# 30. STATUS

Não declare automaticamente:

```text
V1_COACHING_AUTHORITY_READY = YES
```

A R7-B fecha a implementação do repertório.

R7-C/R7-D e gates posteriores ainda existem.

Estados esperados no final:

```text
R7B_RUNTIME_REPERTOIRE_READY = YES|NO
R7B_SSCTR_GATE = ACCEPT|ACCEPT_WITH_CONDITIONS|BLOCK
R7B_ENGINEERING_GATE = READY|NOT_READY
R7B_QUALITY_GATE = READY|NOT_REQUIRED|NOT_READY
```

---

# 31. FINAL REPORT

Reportar:

- branch;
- commits;
- baseline B0 consumida;
- arquivos runtime modificados;
- testes adicionados;
- catálogo ligado;
- F01–F09;
- running status;
- strength status;
- hybrid status;
- beginner status;
- cold-start status;
- feasibility status;
- program progression status;
- return/recovery status;
- taper status;
- SSCTR conditions;
- conformance result;
- freeze identity;
- SSCTR verdict;
- Engineering verdict;
- Quality verdict;
- remaining gaps;
- Founder blockers;
- next recommended mission.

Comece `DOMAIN_COACHING_R7-B`.

Não avance para R7-C automaticamente.
