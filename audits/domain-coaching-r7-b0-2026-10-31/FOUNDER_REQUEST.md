# DOMAIN_COACHING_R7-B0 — Founder request (verbatim)

Received 2026-10-31 (America/Sao_Paulo) as the direct Founder instruction of this session, pasted in full. It is the separate explicit authorization that the [baseline handoff](../r7-b0-baseline-2026-10-31/BASELINE_HANDOFF.md) and the [readiness pack](../domain-coaching-r7-b0-readiness-2026-10-30/CLAUDE_HANDOFF.md) required before B0 could start. Recorded byte-faithfully below the rule; nothing was added to it.

---

# DOMAIN_COACHING_R7-B0 — V1 COACHING REPERTOIRE FOUNDATION

Você está iniciando uma NOVA missão.

A R7-A está formalmente encerrada.

Não reabra R7-A.
Não faça nova auditoria geral do motor.
Não reavalie decisões já aprovadas sem evidência concreta de contradição.

---

# 0. BASELINE AUTORIZADA

Use exclusivamente a baseline consolidada:

`baseline/r7-b0`

A baseline já foi verificada e publicada.

Estado:

```text
R7A_EXIT_READINESS = READY
R7A_FORMAL_CLOSURE = COMPLETE
R7_B0_BASELINE_READY = YES
NEXT_MISSION = DOMAIN_COACHING_R7-B0
```

A baseline contém e reconcilia:

- R7-A formal closure;
- Growth canonical sync;
- R7-B0 readiness/context-compression pack;
- política canonizada de rotação de exercícios;
- autoridades de produto, treinamento e segurança necessárias para B0.

O freeze R7-A continua imutável.

Não derive a missão de `main`.

Crie uma branch própria a partir de `baseline/r7-b0`, por exemplo:

`claude/domain-coaching-r7-b0`

---

# 1. OBJETIVO DA B0

A missão da R7-B0 é fechar a:

> **V1 Coaching Repertoire Foundation**

para Corrida + Força + composição híbrida.

O objetivo NÃO é construir ainda todo o runtime final.

O objetivo é transformar as autoridades esportivas já existentes em um repertório operacional suficientemente explícito para que o futuro Coaching Core possa:

```text
classificar atleta/contexto
↓
selecionar repertório/arquetipo admissível
↓
parametrizar
↓
compor semana híbrida
↓
adaptar dentro de envelopes definidos
```

Em vez de:

```text
inventar arbitrariamente um plano do zero
```

---

# 2. FILOSOFIA CENTRAL

O produto deve ser adaptativo, mas não combinatoriamente irrestrito.

A inteligência vem de:

- classificação correta;
- escolha correta do repertório;
- parametrização;
- composição;
- adaptação;
- trade-offs explícitos;
- proteção dos estímulos prioritários;
- limites de segurança e evidência.

Não de liberdade infinita do motor.

---

# 3. ESCOPO V1

Modalidades V1:

```text
RUNNING
STRENGTH
HYBRID RUNNING + STRENGTH
```

Não expandir B0 para:

- ciclismo;
- natação;
- Crew/social;
- nutrição;
- KMP;
- UI;
- HealthKit/WorkoutKit implementation;
- backend;
- Growth implementation;
- TestFlight;
- Post-V1 sports.

---

# 4. REIDRATAÇÃO

Siga a ordem canônica definida no handoff da baseline.

Comece por:

1. missão / closure R7-A;
2. baseline handoff B0;
3. readiness pack / authority index;
4. Canonical Index;
5. Product Decision Register;
6. Product Truth Map;
7. tese e V1 scope;
8. R6 policy;
9. contratos do motor/adaptive engine;
10. Run Intelligence;
11. Strength Intelligence;
12. Sports Domain specifications;
13. emendas R7-A;
14. gaps classificados como pertinentes à B0.

Não leia o repositório inteiro indiscriminadamente.

Use o context-compression pack.

---

# 5. NÃO REABRIR

Considere encerrados, salvo regressão concreta:

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

Também não transforme automaticamente backlog de TestFlight/policy em blocker de B0.

---

# 6. PRINCIPAIS GAPS DA B0

Use o readiness pack como fonte de verdade para a lista completa.

A missão deve fechar, no mínimo, as famílias abaixo.

## A. RUNNING REPERTOIRE

Materializar repertório suficiente para V1:

- easy;
- recovery;
- long run;
- steady;
- threshold/tempo;
- intervalado;
- VO2-oriented quando admissível;
- strides;
- hills quando aplicável;
- walk/jog e return-to-running;
- race-specific work quando suportado;
- taper;
- recovery trajectories;
- progression/regression;
- novice pathways;
- event-distance specialization.

Não invente modalidades de sessão sem necessidade.

Cada família precisa de:

- objetivo;
- eligibility;
- contraindications/boundaries;
- parâmetros;
- progressões;
- regressões;
- recovery cost;
- interference implications;
- relationships com outras famílias;
- evidence requirements.

---

# 7. STRENGTH REPERTOIRE

Materializar força com profundidade suficiente para competir com apps especializados, sem perder integração híbrida.

Precisamos representar:

- movement patterns;
- muscle emphasis;
- stimulus;
- local fatigue;
- axial demand;
- eccentric demand;
- unilateral/bilateral;
- skill demand;
- equipment;
- substitutions;
- objective;
- running interference;
- recovery cost.

E famílias/programming roles suficientes para:

- strength development;
- hypertrophy-supporting work quando aplicável;
- running-supportive strength;
- durability;
- tissue capacity;
- accessory work;
- practice/skill work;
- main lifts;
- substitutions.

---

# 8. ROLE TAXONOMY CANÔNICA

Preserve DR-134.

Roles contextuais:

```text
MAIN
ACCESSORY
PRACTICE
```

Rotation eligibility é um eixo separado:

```text
REASON_ONLY
BLOCK_BOUNDARY_ELIGIBLE
TWO_WEEK_ELIGIBLE
```

Regras:

- MAIN permanece estável dentro do bloco;
- revisão ampla aproximadamente a cada 6 semanas;
- troca antecipada somente com motivo válido;
- ACCESSORY pode rotacionar a cada 2 semanas quando houver alternativa admissível/equivalente;
- rotação de ACCESSORY é permitida, não obrigatória;
- PRACTICE não deve rotacionar automaticamente por calendário;
- close variation é uma relação entre configurações, não um quarto role;
- reason-based substitution prevalece sobre cadence;
- o mesmo exercício pode ter roles diferentes em programas diferentes.

B0 deve materializar as relações/configurações necessárias sem contradizer isso.

---

# 9. HYBRID COMPOSITION

Fechar regras operacionais para composição de semana híbrida.

O motor precisa saber:

- quais sessões podem coexistir;
- quais sessões competem por recuperação;
- quais estímulos devem ser protegidos;
- spacing;
- ordering;
- same-day combinations quando admissíveis;
- AM/PM considerations;
- running-quality × lower-body strength;
- long run × lower-body strength;
- high eccentric load;
- axial fatigue;
- novice constraints;
- event proximity;
- taper combinado;
- recovery weeks;
- return states.

A composição não deve ser baseada em uma prioridade fixa "running-first" ou "strength-first".

A prioridade deve continuar derivada de:

- goals;
- phase;
- event proximity;
- current capacity;
- history;
- response;
- protected stimuli;
- recovery;
- schedule;
- interference.

---

# 10. ARCHETYPES

Avalie e materialize somente os archetypes realmente necessários.

Exemplos conceituais:

```text
RUN_DOMINANT
STRENGTH_DOMINANT
BALANCED_HYBRID
RETURNING_RUNNER
NOVICE_RUNNER
NOVICE_STRENGTH
EVENT_PREP
```

Esses nomes NÃO são obrigatórios.

Não crie uma taxonomia artificial só porque o prompt os exemplifica.

Derive os archetypes do domínio real.

Um archetype só deve existir se tiver consumidor operacional.

---

# 11. CLASSIFICATION / ELIGIBILITY

Defina quais sinais o sistema usa para escolher repertório e archetype.

Exemplos:

- training age;
- recent consistency;
- recent volume;
- longest tolerated run;
- recent quality exposure;
- strength exposure;
- technical competence;
- availability;
- schedule;
- goals;
- event;
- event distance;
- time to event;
- recovery;
- interruptions;
- adverse responses;
- incomplete evidence;
- return state.

Não diagnostique condições clínicas.

---

# 12. PARAMETERIZATION

Diferencie claramente:

```text
SESSION FAMILY
SESSION CONFIGURATION
DOSE
PROGRESSION STATE
```

Evite catálogo com dezenas de sessões quase idênticas apenas para representar números diferentes.

Exemplo conceitual:

```text
THRESHOLD_INTERVALS
+
repetitions
duration
recovery
intensity target
warmup
cooldown
```

é preferível a criar dezenas de tipos diferentes sem necessidade.

O mesmo princípio vale para força.

---

# 13. SAFETY & BOUNDARIES

Preserve o produto como sistema não clínico.

Defina:

- produto pode adaptar;
- produto pode reduzir;
- produto pode perguntar;
- produto pode excluir evidência;
- produto pode recomendar cautela;

mas não deve:

- diagnosticar;
- tratar lesão;
- inferir doença;
- substituir profissional clínico quando há sinais fora do limite do produto.

Use as autoridades existentes.

Não invente medicina esportiva.

---

# 14. BEGINNER PATHS

B0 deve resolver explicitamente novatos.

Não trate "novato" apenas como versão com números menores.

Considere:

- skill exposure;
- recovery;
- consistency;
- walk/jog;
- exercise learning;
- session density;
- frequency;
- progression rate;
- tolerance before specialization.

---

# 15. POSITIVE PRESCRIPTIVE PATHS

O Sports Domain Closure anterior apontou falta de positivos prescritivos suficientes.

Feche isso.

Para cada família central, precisamos de exemplos válidos de:

```text
eligible athlete/context
→ selected family
→ valid configuration
→ expected progression
→ valid regression
```

Não apenas regras de proibição.

---

# 16. TRAJETÓRIAS COMPLETAS

Fechar trajetórias que antes estavam incompletas:

- recovery;
- return;
- progression;
- taper;
- combined taper;
- novice → regular training;
- interruption → return;
- event preparation;
- post-event recovery quando V1 exigir.

O repertório precisa ser navegável como sistema de estados, não apenas como catálogo estático.

---

# 17. CATALOG / SCHEMA

Materialize um catálogo legível por máquina ou schema equivalente apenas se isso tiver consumidor claro em B0/B1.

O catálogo deve representar sem ambiguidade:

- identity;
- family;
- modality;
- eligibility;
- parameters;
- progression;
- regression;
- recovery cost;
- interference;
- safety boundaries;
- evidence requirements;
- substitutions/relations quando pertinentes.

Evite premature runtime implementation.

B0 pode produzir uma specification/catalog candidate sem torná-lo autoridade runtime.

---

# 18. EVIDENCE

Toda decisão prescritiva relevante deve ser rastreável para:

1. autoridade já aprovada;
2. literatura robusta existente no projeto;
3. ou pesquisa nova quando realmente faltar base.

Não pesquise novamente tópicos já suficientemente estabelecidos.

Quando pesquisa nova for necessária:

- priorize systematic reviews;
- meta-analyses;
- consensus/position stands;
- guidelines;
- estudos primários fortes quando necessário.

Diferencie:

```text
EVIDENCE
PRODUCT POLICY
IMPLEMENTATION CHOICE
```

---

# 19. VALIDATION

Crie validações proporcionais.

Precisamos provar que o repertório:

- cobre V1;
- não cria combinações impossíveis;
- não deixa classes principais sem saída;
- possui positivos e negativos;
- preserva R7-A;
- suporta corrida + força;
- suporta novatos;
- suporta retorno;
- suporta taper quando no escopo;
- é parametrizável;
- é implementável posteriormente.

Não construa uma mega-infraestrutura de testes se uma matriz menor provar a propriedade.

Execution Proportionality continua valendo.

---

# 20. FOUNDER DECISIONS

Não pergunte ao Founder sobre detalhes que podem ser resolvidos por:

- ciência;
- autoridade existente;
- arquitetura;
- produto já aprovado.

Só abra Founder decision se houver uma escolha genuinamente estratégica sem autoridade existente.

Se houver, agrupe todas ao final.

Não interrompa a missão por perguntas pequenas.

---

# 21. DELIVERABLES

Produza somente artefatos com consumidor claro.

Prováveis entregáveis:

- repertoire specification;
- run repertoire;
- strength repertoire;
- hybrid composition rules;
- classification / eligibility;
- parameterization schema;
- progression/regression trajectories;
- safety boundaries;
- gap closure matrix;
- validation report;
- mission handoff.

Os nomes/caminhos devem seguir a estrutura atual do repositório.

Não crie documentos duplicados se autoridades existentes puderem ser atualizadas.

---

# 22. STATUS DE AUTORIDADE

B0 NÃO deve automaticamente declarar runtime autorizado.

Diferencie:

```text
SPECIFICATION_READY
```

de:

```text
RUNTIME_IMPLEMENTATION_READY
```

e de:

```text
V1_COACHING_AUTHORITY_READY
```

B0 está fechando repertório/fundação, não pulando os gates posteriores.

---

# 23. GIT / FREEZE

Não altere bytes congelados da R7-A.

Antes do fechamento da missão:

- valide integridade do freeze;
- valide que nenhuma regressão documental reabriu R7-A;
- mantenha branch própria;
- commit/push;
- não merge em main.

---

# 24. STOP CONDITION

B0 termina quando:

1. repertório V1 necessário está materializado;
2. corrida possui famílias e trajetórias suficientes;
3. força possui famílias e relações suficientes;
4. composição híbrida possui regras explícitas;
5. novatos são cobertos;
6. progressão/regressão/return/recovery/taper necessários estão cobertos;
7. classificação/eligibility está definida;
8. parametrização está implementável;
9. gaps B0 do readiness pack estão resolvidos ou explicitamente classificados para later gate com justificativa;
10. não há Founder blocker necessário para avançar.

Não continue refinando indefinidamente depois disso.

---

# 25. FINAL REPORT

No fechamento reporte:

- branch;
- commit;
- baseline consumida;
- artefatos criados/modificados;
- gaps B0 resolvidos;
- gaps remanescentes;
- Run readiness;
- Strength readiness;
- Hybrid composition readiness;
- Beginner readiness;
- Return/recovery readiness;
- Taper readiness;
- classification/eligibility readiness;
- parameterization readiness;
- safety/boundary readiness;
- validation result;
- freeze integrity;
- Founder decisions, se houver;
- próximo gate recomendado.

Use estados explícitos.

Não declare produção pronta se isso não estiver provado.

Inicie agora `DOMAIN_COACHING_R7-B0`.
