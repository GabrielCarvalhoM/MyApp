# DOMAIN_COACHING_R7-B.1 — Founder request (verbatim)

Direct Founder request received in the session on 2026-10-31 (America/Sao_Paulo). Recorded verbatim below; it is the authority for this mission. Language: Portuguese, as given.

---

# DOMAIN_COACHING_R7-B.1 — RESIDUAL RUNTIME BLOCKER CLOSURE

Você está iniciando uma NOVA missão, deliberadamente estreita.

A R7-B terminou `NOT_READY` após consumir o ciclo máximo autorizado de review → correction → narrow recheck.

Não reabra a missão R7-B ampla.
Não reabra R7-B0.
Não inicie R7-C.

A finalidade desta missão é exclusivamente:

> corrigir os blockers residuais identificados no fechamento da R7-B, criar um novo freeze e submetê-lo a revisão independente por gate.

---

# 0. GIT EXECUTION OWNERSHIP

Você é responsável por TODO o lifecycle Git operacional normal desta missão.

O Founder NÃO deve precisar executar comandos Git rotineiros.

Você deve autonomamente:

- fazer `fetch` do remoto;
- inspecionar branches locais e remotas;
- confirmar commits e ancestry;
- localizar a baseline correta;
- preservar o working tree pessoal do Founder;
- preferir um worktree limpo e isolado para esta missão se houver arquivos locais/untracked não relacionados;
- publicar no remoto a branch encerrada da R7-B caso ela ainda exista apenas localmente;
- criar a branch da R7-B.1;
- executar commits da missão;
- fazer push da branch da missão;
- confirmar que a branch remota aponta para o HEAD final;
- reportar branch + SHA final.

Não peça ao Founder para fazer:

- fetch;
- checkout;
- branch creation;
- stash;
- commit;
- push;
- confirmação de HEAD.

## Operações que exigem aprovação explícita do Founder

NÃO faça autonomamente:

- merge em `main`;
- force push;
- reset destrutivo;
- rebase que reescreva histórico publicado;
- exclusão de branch/tag remoto;
- alteração de credenciais;
- remoção de arquivos pessoais/untracked do Founder.

Se o checkout pessoal tiver arquivos locais como `.agents/`, `.claude/`, `.instagram/`, `docs/`, `tools/`, `vendor/` ou outros não relacionados, NÃO os delete, NÃO os commit e NÃO os mova arbitrariamente.

Prefira criar um worktree limpo para a missão.

---

# 1. BASELINE DA R7-B

A branch encerrada é:

`claude/domain-coaching-r7-b`

Commit de closure esperado:

`4230034`

Confirme o SHA completo a partir do repositório.

A branch foi criada originalmente de:

`c66966e`

Antes de iniciar B.1:

1. confirme que `4230034` pertence à branch R7-B;
2. confirme que contém o closure handoff;
3. se a branch R7-B ainda não existir no remoto, publique-a sem alterar seu conteúdo;
4. confirme que o remoto aponta para o mesmo HEAD;
5. não faça merge.

Depois crie uma nova branch/worktree isolada:

`claude/domain-coaching-r7-b1`

a partir do commit de closure da R7-B.

---

# 2. PREDECESSOR FREEZE

O runtime predecessor oficial é:

`R7-B FREEZE-2`

Freeze commit:

`10b26d6`

Source digest:

`d2c73014…`

Manifest:

`d509452e…`

105 arquivos vinculados.

Estado:

```text
733/733 tests = PASS
verify-r7b --freeze 2 --tests = 20/20
catalog/runtime conformance = PASS
mutation = 24/25 killed
M13 = equivalent / documented
```

Mas:

```text
R7B_RUNTIME_REPERTOIRE_READY = NO
R7B_SSCTR_GATE = BLOCK
R7B_ENGINEERING_GATE = NOT_READY
R7B_QUALITY_GATE = READY
```

Testes verdes NÃO significam readiness.

---

# 3. HANDOFF OBRIGATÓRIO

Comece por:

`CoachingCore/r7/b/R7B_CLOSURE_HANDOFF.md`

Depois:

`audits/domain-coaching-r7-b-2026-10-31/FINAL_DISPOSITION.json`

Esses são os artefatos principais para esta missão.

Não faça reidratação ampla do repositório sem necessidade.

---

# 4. BLOCKERS DESTA MISSÃO

## B1 — QE-R7B-OBS-04 — Event/taper substitution

Problema:

uma substituição solicitada durante:

- taper;
- semana de prova;
- pós-prova;

pode introduzir um exercício nunca feito no programa.

Isso viola:

- R6-EVENT-TRANSITION C7;
- B0-C05 c1.

### Comportamento exigido

Durante essas fases, uma substituição não pode introduzir novidade incompatível com as restrições existentes.

Preservar:

- familiaridade;
- continuidade;
- equivalência admissível;
- limites de skill/equipment;
- event-transition constraints.

Não invente nova policy.

---

## B2 — QE-R7B-R2-01 — Novice reconstructed templates not persisted

Problema:

templates de novato reconstruídos durante adaptação não são persistidos corretamente no plano.

Na weekly review seguinte:

1. substituição pode ser revertida;
2. limite de densidade por mudança de agenda pode desaparecer;
3. transição para kettlebell-only pode virar `UNSUPPORTED`.

### Requisito

Estado reconstruído/adaptado que se tornou autoridade atual do programa deve sobreviver corretamente às revisões seguintes.

Não copie estado indiscriminadamente.

Preserve distinção entre:

```text
planned
released
executed
corrected
current program authority
```

e os invariantes da R7-A.

---

## B3 — QE-R7B-R2-02 — correction + block choice regression

Regressão introduzida na R7-B.

Quando uma revisão contém:

- correção factual;
- escolha de bloco;

o runtime pode devolver `ASK` sem carregar o re-plano factual.

Isso regride A5 da R7-A.

### Requisito

A pergunta pode permanecer pendente quando necessária.

Mas:

> ASK nunca pode apagar, ocultar ou invalidar o re-plano factual determinado pela correção.

Fechar completamente essa regressão.

---

## B4 — QE-R7B-R2-03 — skill mismatch fallback escalation

Quando o substituto de um `SKILL_MISMATCH` perde equipamento, o fallback pode subir para um degrau mais difícil da skill ladder.

Isso é inválido.

### Requisito

```text
fallback skill <= current admissible skill
```

Perda de equipamento nunca pode aumentar skill demand.

Use as ladders/relações B0 existentes.

---

# 5. QE-R7B-01 / QE-R7B-05

Reavalie esses resíduos somente pelos caminhos acima.

Não reabra suas classes inteiras se os quatro blockers eliminarem os resíduos.

---

# 6. PRESERVAÇÃO OBRIGATÓRIA

Não regredir:

## Running
- graduação;
- familiar intervals com validade de 28 dias;
- strides opcionais;
- eligibility gates.

## Hybrid
- CMP.I11;
- content-stage;
- rollover de semana.

## Cold start
- classificação;
- feasibility inicial;
- plano inicial válido.

## Feasibility
- protected stimuli;
- constrained composition;
- schedule negotiation.

## Program progression
- progressão week-to-week;
- bounded adaptation.

## Return
- F1 resolvido;
- F2 resolvido;
- invariantes R7-A.

## Taper
- planned taper;
- combined strength taper;
- event-transition semantics.

---

# 7. R7-A INVARIANTS

Não reabra R7-A.

Teste regressão contra:

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
- MAINTAIN;
- factual execution authority;
- correction/retraction authority;
- return factual ceiling.

QE-R7B-R2-02 merece atenção especial porque toca factual authority.

---

# 8. AUTORIDADES IMUTÁVEIS

Não modificar:

`R7B0-CATALOG-2`

Não modificar os 13 registros r2 aprovados pelo SSCTR.

Não modificar:

`R6-POLICY-5`

Esta missão corrige runtime/binding fidelity.

Se parecer necessária mudança de catálogo/policy, prove primeiro que há contradição real e não altere sem gate apropriado.

---

# 9. NÃO PUXAR BACKLOG

Não resolver nesta missão:

- F6 Product/Data;
- F7 recorded deviation;
- R18;
- unidades do running ceiling;
- F05 policy review;
- F07 Product/Data;
- F09 future catalog review;
- 5K;
- hills;
- novo VO2;
- plyometrics;
- Nordic;
- Copenhagen;
- loaded bodyweight.

Não iniciar:

- R7-C;
- R7-D;
- KMP;
- iOS;
- HealthKit;
- WorkoutKit;
- backend;
- Figma;
- Growth.

---

# 10. IMPLEMENTAÇÃO

Faça a menor mudança suficiente.

Para cada blocker registre:

```text
finding
→ root cause
→ authority
→ runtime path
→ fix
→ regression test
→ preservation validation
```

Evite refatoração ampla não necessária.

---

# 11. TESTES

## OBS-04

Cobrir:

- taper;
- race week;
- post-race;
- tentativa de introduzir exercício nunca realizado.

## R2-01

Cobrir:

- novice substitution survives weekly review;
- density constraint survives weekly review;
- kettlebell-only transition survives later review.

## R2-02

Cobrir:

```text
correction + block choice
→ ASK if required
AND
→ factual replan preserved
```

Cobrir também stale-state resurrection.

## R2-03

Cobrir:

- previous SKILL_MISMATCH;
- equipment loss;
- fallback;
- skill demand never rises.

---

# 12. ADVERSARIAL PROBES

Use probes pequenos e proporcionais:

- event phase × substitution reason × familiarity;
- novice × weekly review × reconstructed state;
- correction × ASK × block choice;
- skill mismatch × equipment loss × ladder.

Não criar mega-suite nova.

---

# 13. NEW FREEZE

Após fechar os blockers:

crie um novo freeze com identidade própria, preferencialmente:

`R7B1-FREEZE-1`

Registrar:

- predecessor = `R7-B FREEZE-2`;
- predecessor commit = `10b26d6`;
- runtime delta;
- tests delta;
- source digest;
- manifest;
- policy identity;
- catalog identity.

Não sobrescrever FREEZE-2.

---

# 14. SSCTR REVIEW

Após o freeze, revisão independente e estreita:

- QE-R7B-OBS-04;
- event/taper substitution fidelity;
- F1/F2 preservation;
- taper;
- novice/strength implications apenas onde tocadas;
- dose/progression regressions relacionadas ao delta.

Resultado:

```text
R7B1_SSCTR_GATE = ACCEPT | ACCEPT_WITH_CONDITIONS | BLOCK
```

---

# 15. ENGINEERING REVIEW

Escopo:

- QE-R7B-R2-01;
- QE-R7B-R2-02;
- QE-R7B-R2-03;
- QE-R7B-01/-05 residuals;
- persistence;
- state transitions;
- factual authority;
- stale-state resurrection;
- catalog/runtime binding;
- relevant R7-A invariants.

Resultado:

```text
R7B1_ENGINEERING_GATE = READY | NOT_READY
```

---

# 16. QUALITY

Quality da R7-B já terminou `READY`.

Não repita automaticamente.

Se o delta não tocar materialmente suas propriedades:

```text
R7B1_QUALITY_GATE = INHERITED_READY
```

com justificativa.

Se tocar, despache narrow review.

---

# 17. FINITE REVIEW LIMIT

Fluxo:

```text
implementation
→ freeze
→ one review per required gate
```

Se aparecer blocker estreito criado pela própria correção:

no máximo um ciclo:

```text
correction
→ new freeze
→ narrow recheck
```

Depois pare.

Se ainda houver blocker:

```text
R7B_RUNTIME_REPERTOIRE_READY = NO
```

Não force READY.

---

# 18. EXIT

READY somente se:

1. OBS-04 fechado;
2. R2-01 fechado;
3. R2-02 fechado;
4. R2-03 fechado;
5. QE-R7B-01/-05 sem resíduos materiais;
6. SSCTR aceitar;
7. Engineering READY;
8. Quality válida;
9. R7-A sem regressão;
10. catálogo/policy intactos;
11. nenhum novo blocker material dentro do gate.

---

# 19. NÃO DECLARAR

Mesmo com sucesso:

NÃO declarar automaticamente:

`V1_COACHING_AUTHORITY_READY = YES`

R7-C/R7-D e outros gates continuam existindo.

O alvo desta missão é:

```text
R7B_RUNTIME_REPERTOIRE_READY = YES
```

---

# 20. GIT NO ENCERRAMENTO

Antes de terminar:

- commit de todos os artefatos pertencentes à missão;
- working tree da missão limpo;
- push de `claude/domain-coaching-r7-b1`;
- confirmar remote HEAD = local HEAD;
- não mergear em `main`;
- não alterar branches anteriores.

O fechamento não pode terminar com:

> "não fiz push porque não foi pedido".

Push da branch da própria missão faz parte do protocolo operacional normal.

---

# 21. FINAL REPORT

Reportar:

- branch;
- SHA final local;
- SHA remoto;
- baseline closure;
- predecessor freeze;
- arquivos runtime alterados;
- testes;
- status dos quatro blockers;
- QE-R7B-01/-05;
- R7-A preservation;
- B0 catalog integrity;
- policy integrity;
- novo freeze;
- SSCTR;
- Engineering;
- Quality;
- ciclos consumidos;
- blockers restantes;
- próximo gate recomendado.

Final:

```text
R7B_RUNTIME_REPERTOIRE_READY = YES|NO
R7B1_SSCTR_GATE = ...
R7B1_ENGINEERING_GATE = ...
R7B1_QUALITY_GATE = ...
```

Não iniciar R7-C.

STOP.
