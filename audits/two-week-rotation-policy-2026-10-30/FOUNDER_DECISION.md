# FOUNDER DECISION — TWO-WEEK EXERCISE ROTATION POLICY

A proposta desta missão foi revisada pelo Founder.

## DECISION

```text
FOUNDER_DECISION = APPROVED
```

A direção estrutural proposta está aprovada e deve agora ser registrada nas autoridades adequadas do projeto.

Não faça nova pesquisa.
Não reabra a decisão.
Não inicie R7-B0.
Não altere Coaching Core runtime.
Não altere sports policy congelada da R7-A.
Não altere Figma.

---

# 1. POLICY APROVADA

A opção de preferência:

`A cada 2 semanas`

deve operar segundo estas regras.

## MAIN

Exercícios/configurações que ocupam papel principal/anchor no programa:

```text
MAIN
→ stable within block
→ no automatic two-week rotation
→ broad review around the block boundary (~6 weeks)
→ may change earlier only for an explicit justified reason
```

A estabilidade faz parte da continuidade, aprendizado técnico, mensuração de progressão e consistência do estímulo.

---

## ACCESSORY

Exercícios/configurações que ocupam papel acessório:

```text
ACCESSORY
→ may be TWO_WEEK_ELIGIBLE
→ rotation is allowed, not mandatory
→ only rotate when an admissible/equivalent alternative exists
```

A rotação deve preservar:

- objetivo;
- padrão/necessidade coberta;
- estímulo pretendido;
- constraints do atleta;
- equipamento;
- interferência;
- recovery cost;
- segurança/policy.

Não variar apenas por variedade estética.

---

## PRACTICE

Configurações cujo papel principal é aprendizado/skill/technical practice:

```text
PRACTICE
→ no calendar-driven automatic rotation
```

A estabilidade deve ser preservada enquanto a continuidade técnica for parte importante do propósito.

---

# 2. ROLE != ROTATION ELIGIBILITY

Esta distinção é vinculante.

`exercise role`

e

`rotation eligibility`

são conceitos diferentes.

Manter uma taxonomia pequena para role:

```text
MAIN
ACCESSORY
PRACTICE
```

Não criar categorias adicionais sem consumidor real.

A elegibilidade de rotação deve ser representada separadamente, usando a menor taxonomia suficiente.

A direção aprovada é:

```text
REASON_ONLY
BLOCK_BOUNDARY_ELIGIBLE
TWO_WEEK_ELIGIBLE
```

A nomenclatura pode ser refinada apenas se necessário por consistência técnica, preservando exatamente esta semântica.

---

# 3. ROLE IS CONTEXTUAL

Não canonizar regras globais como:

```text
Squat = always MAIN
Split squat = always ACCESSORY
Hip thrust = always ACCESSORY
```

O papel pertence à configuração dentro do programa/contexto.

Exemplo conceitual:

```text
Exercise
+
Configuration
+
Program Context
→ Role
→ Rotation Eligibility
```

Portanto:

```text
same exercise
may occupy different roles
in different valid programs
```

B0 deverá materializar essas relações.

---

# 4. CLOSE VARIATION

Não criar `CLOSE_VARIATION` como um novo exercise role.

“Close variation” deve ser modelado como uma relação entre configurações/exercícios.

Exemplo conceitual:

```text
configuration A
-- close_variation_of -->
configuration B
```

Essa relação pode ser usada para encontrar substituições/rotações admissíveis.

A permissão efetiva continua dependendo do contexto e de:

```text
REASON_ONLY
BLOCK_BOUNDARY_ELIGIBLE
TWO_WEEK_ELIGIBLE
```

---

# 5. SPORT/RUN-SPECIFIC STRENGTH

“Running-specific strength” / “sport-specific strengthening” permanece um PURPOSE/CONTEXT, não precisa virar automaticamente um quarto exercise role.

A configuração ainda pode assumir:

```text
MAIN
ACCESSORY
PRACTICE
```

dependendo de sua função concreta dentro da prescrição.

Não criar taxonomia extra sem necessidade demonstrada no B0.

---

# 6. REASON-BASED SUBSTITUTION OVERRIDES CADENCE

Regra transversal aprovada:

```text
justified reason-based substitution
>
nominal rotation cadence
```

Razões válidas conforme policies/metadata existentes podem incluir:

- discomfort/pain signal dentro dos limites não clínicos do produto;
- equipamento indisponível;
- incompatibilidade de skill;
- intolerance/recovery issue;
- conflito/interferência com protected run stimulus;
- mudança contextual válida;
- stagnation/plateau quando suportado pela futura policy;
- block transition.

Isso não autoriza claims clínicos nem prescrição de reabilitação.

---

# 7. SIX-WEEK BLOCK REVIEW

A revisão ampla em aproximadamente seis semanas permanece.

Conceitualmente:

```text
2-week cadence
=
opportunity for eligible accessory/variation changes

~6-week block review
=
broader review of exercise configuration/program structure
```

Não interpretar a janela de duas semanas como mini-redesign do treino.

---

# 8. CONCRETE EXERCISE MAPPING

Não decidir agora uma classificação universal para:

- curl;
- tibialis;
- Copenhagen;
- plyometrics;
- split squat;
- hip thrust;
- calf raise;
- hamstring curl;
- core;
- runner-specific movements;
- outros exercícios concretos.

Essas decisões dependem da configuração e do repertoire.

Registrar:

```text
CONCRETE_CONFIGURATION_MAPPING
= DOMAIN_COACHING_R7-B0 responsibility
```

B0 deverá definir as configurações, relações e metadata necessárias.

Isso NÃO é um blocker pré-B0.

---

# 9. UI COPY

A label pode permanecer:

`A cada 2 semanas`

A descrição semântica aprovada é:

`Revisamos acessórios e variações próximas; os principais ficam.`

Não alterar Figma nesta missão.

Somente registrar a copy aprovada para futura reconciliação.

---

# 10. READINESS PACK

Atualize o R7-B0 Readiness / Context Compression Pack para refletir que esta questão deixou de ser Founder-dependent.

O estado esperado deve deixar de ser algo equivalente a:

```text
NEEDS_FOUNDER_DECISION
```

e passar para:

```text
FOUNDER_DECISION = APPROVED
OPEN_FOR_B0 = operational configuration mapping
```

O B0 pode definir:

- exercise configurations;
- role assignment by archetype/context;
- close-variation relations;
- eligibility metadata;
- concrete pairs/families;
- admissible rotation alternatives.

Mas NÃO deve reabrir a decisão estrutural acima.

---

# 11. CANON / DECISION REGISTER

Use a estrutura de governança já existente.

Registre a decisão na autoridade mínima apropriada, por exemplo:

- Product Decision Register / equivalent canonical decision authority;
- R7-B0 readiness authority/index;
- two-week rotation decision artifact.

Não invente um novo sistema documental.

Se existir uma decisão anterior ampla no OB-2, mantenha sua história e registre esta como sua operacionalização/refinamento, não como contradição.

---

# 12. DOCUMENT DRIFT

Se houver documentos relevantes que ainda afirmem algo incompatível, por exemplo:

- todos os exercícios trocam a cada duas semanas;
- MAIN pode rotacionar automaticamente;
- close variation é necessariamente um role;
- rotation depende apenas do nome do exercício;

não faça uma refatoração documental ampla.

Atualize apenas autoridades necessárias ou registre drift para cleanup posterior.

---

# 13. NO PRODUCT IMPLEMENTATION

Nesta missão:

DO NOT:

- start R7-B0;
- create repertoire;
- create archetypes;
- implement exercise catalog;
- implement rotation engine;
- modify Coaching Core;
- modify R7-A freeze;
- modify Figma;
- research more sports science.

Esta é somente a canonização da decisão do Founder.

---

# 14. INTEGRITY

Confirme novamente que todos os bytes congelados do:

`R7A-RESIDUAL-AUTHORITY-FREEZE-1`

permanecem inalterados em relação ao commit:

`7d2da3603e224124696a2290766ec448080f3264`

Não alterar runtime, policies, frozen tests ou freeze records.

---

# 15. GIT

Permaneça na branch atual da proposta:

`chore/two-week-rotation-policy`

ou use uma continuação segura dela se a infraestrutura exigir.

Commit/push somente:

- decisão canônica;
- readiness/index updates;
- documentação diretamente necessária.

Não faça merge.

---

# 16. FINAL OUTPUT

Reporte:

1. `FOUNDER_DECISION = APPROVED`;
2. branch;
3. commit SHA;
4. autoridades atualizadas;
5. policy final resumida;
6. role taxonomy;
7. rotation eligibility taxonomy;
8. close-variation semantics;
9. UI copy registrada;
10. o que permanece para B0;
11. confirmação de que não existe mais decisão Founder-dependent pré-B0 sobre a abrangência da rotação quinzenal;
12. confirmação de que B0 não foi iniciado;
13. confirmação de que os bytes congelados da R7-A permanecem intactos.

Ao final, declare:

```text
TWO_WEEK_ROTATION_POLICY_CANONICALIZED = YES
R7_B0_ROTATION_FOUNDER_BLOCKER = CLOSED
```

STOP.