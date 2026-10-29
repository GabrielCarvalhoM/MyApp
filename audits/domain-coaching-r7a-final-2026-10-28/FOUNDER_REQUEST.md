# DOMAIN_COACHING_R7-A — Final Closure — Founder request (verbatim)

Received 2026-10-28 in a new Claude Code session (clean context), as the whole user message. Preserved below without edits.

---

# DOMAIN_COACHING_R7-A — FINAL CLOSURE
## INTERRUPTION EPISODE IDENTITY & RETURN CONTINUITY

Você está iniciando uma NOVA sessão com contexto limpo.

Projeto:

`C:\Users\carva\Desktop\myApp\MyApp`

Esta é uma missão MICRO e FINAL de fechamento da fase R7-A.

Ela acontece depois de:

- DOMAIN_COACHING_R7-A;
- DOMAIN_COACHING_R7-A.1;
- DOMAIN_COACHING_R7-A.2.

R7-A.2 encerrou:

`R7A_EXIT_READINESS = NOT_READY`

mas com uma diferença importante:

- SSCTR aceitou o comportamento esportivo do retorno;
- D59 foi fechado;
- D56, D57 e D58 continuam fechados;
- composição semanal está estabilizada;
- o blocker restante é de identidade/continuidade de uma interrupção.

Esta missão NÃO deve reabrir a fase A inteira.

---

# 0. DECISÃO DO FOUNDER — AUTORIDADE DESTA MISSÃO

As seguintes decisões estão dadas.

NÃO rediscuta sua conveniência.

## 0.1 Uma interrupção é uma entidade com identidade estável

O domínio deve representar conceitualmente algo equivalente a:

```text
InterruptionEpisode
- episodeId
- startedAt
- endedAt / duration, quando conhecida
- reportedAt
- provenance/source
- revision/supersession relation
```

Os nomes concretos podem variar conforme a arquitetura atual.

O importante é:

> **uma pausa possui identidade própria e não pode ser identificada apenas pela semana, pela data mais recente ou por uma fotografia reutilizada de outro retorno.**

---

## 0.2 Correção da mesma pausa ≠ nova pausa

Quando um usuário/sistema corrige um registro existente de interrupção:

```text
episodeId = A
```

permanece:

```text
episodeId = A
```

Os fatos do episódio podem mudar:

- startedAt;
- endedAt;
- duração;
- metadados;

mas continua sendo a mesma interrupção.

---

## 0.3 Nova pausa = novo episódio

Se o atleta retorna/reentra e posteriormente sofre nova interrupção:

```text
pause A
→ re-entry/training
→ pause B
```

então:

```text
episodeId(A) != episodeId(B)
```

mesmo se:

- A e B ocorrerem na mesma semana;
- tiverem o mesmo motivo;
- tiverem a mesma duração;
- forem relatadas pelo mesmo handler.

---

## 0.4 Não usar proximidade temporal como identidade principal

NÃO adotar como regra geral:

> “se as datas encostam ou se sobrepõem, é a mesma pausa”.

Proximidade temporal pode ser evidência contextual, mas NÃO é identidade suficiente.

Prioridade semântica:

```text
explicit update/supersession of episode A
→ SAME EPISODE

same stable source/event identity
→ SAME EPISODE

demonstrable duplicate of same record
→ SAME EPISODE / DEDUPE

new interruption after re-entry/training
→ NEW EPISODE

insufficient evidence to know whether same or new
→ ASK / fail closed
```

NÃO adivinhar silenciosamente em caso realmente ambíguo.

---

## 0.5 Estado de retorno é temporal

O ponto de partida conceitual do retorno é:

```text
executedStateAt(interruption.startedAt)
```

ou operação semanticamente equivalente.

Significa:

> estado realmente executado pelo atleta até o instante em que aquela interrupção começou.

NÃO significa:

```text
stateAtStartOfWeek
```

nem:

```text
stateStoredByPreviousReturn
```

nem:

```text
stateAtReportTime
```

---

## 0.6 Correção da data da mesma pausa

Se o mesmo episódio A é corrigido:

```text
startedAt: T1 → T2
```

o estado pré-pausa deve ser recalculado conforme:

```text
executedStateAt(T2)
```

Não reutilizar cegamente uma snapshot calculada para T1.

---

## 0.7 Evidência histórica tardia

Se uma sessão foi realmente executada ANTES de `interruption.startedAt`, mas só foi registrada/sincronizada posteriormente:

ela pertence semanticamente ao estado pré-pausa.

Portanto, se essa evidência nova alterar materialmente:

```text
executedStateAt(interruption.startedAt)
```

o retorno pode precisar ser recalculado.

Isso deve respeitar:

- provenance;
- dedupe;
- corrections;
- temporal causality;
- confirmation-first quando houver alteração material apresentada ao usuário.

---

## 0.8 Sessão e pausa no mesmo dia

Se timestamps permitem ordenar:

```text
session.completedAt < interruption.startedAt
```

→ sessão pertence ao estado pré-pausa.

Se:

```text
session.completedAt > interruption.startedAt
```

→ não pertence.

Se só existe granularidade de dia e a ordem é material para a prescrição:

```text
ASK
```

Não inventar ordem.

---

# 1. PERGUNTA ÚNICA DA MISSÃO

Responder com evidência:

> **O runtime consegue distinguir consistentemente uma correção da mesma interrupção de uma interrupção nova e preservar o estado correto de retorno para cada episódio?**

Nada além disso deve expandir esta missão.

---

# 2. REIDRATAÇÃO MÍNIMA

Antes de editar, leia:

- `AGENTS.md`
- `CLAUDE.md`
- `CURRENT_MISSION.md`
- `MISSION_LEDGER.md`

Depois localize e leia apenas as autoridades atuais necessárias de:

### R7-A.1
- final report;
- WEEK_COMPOSITION_CONTRACT;
- readiness;
- engineering re-check;
- SSCTR re-check.

### R7-A.2
- final report;
- readiness;
- final disposition;
- freeze manifest;
- engineering re-check;
- SSCTR re-check;
- probes do blocker restante;
- arquivos de runtime afetados.

Descubra pelos índices/ledger os paths canônicos.

Não carregue auditorias antigas sem necessidade.

---

# 3. PRESERVAÇÃO HISTÓRICA

R6, R7-A, R7-A.1 e R7-A.2 estão encerrados historicamente.

NÃO:

- editar pareceres antigos;
- reclassificar resultados;
- alterar freezes;
- reescrever hashes;
- fazer parecer que esta solução existia anteriormente.

Esta missão produz nova evidência append-only.

---

# 4. BASELINE

Antes da implementação:

1. confirme o freeze final R7-A.2;
2. execute o verificador atual em read-only;
3. confirme a suíte atual;
4. reproduza o blocker de engenharia atual.

No mínimo reproduzir:

### Segunda pausa após reentrada

```text
pause A
→ reduced return
→ athlete performs re-entry
→ pause B
→ report B
```

Estado incorreto atual:

B é tratada como A e ressuscita dose pré-A.

### Variante same-week

Reproduzir também o caso já registrado.

### Variante cross-week

Reproduzir também.

Se os resultados divergirem materialmente do fechamento oficial, parar antes de editar.

---

# 5. O QUE JÁ ESTÁ FECHADO

NÃO reabra sem regressão nova demonstrada:

- WEEK_COMPOSITION_INTEGRITY;
- EVENT_SUPERSESSION_INTEGRITY;
- EXERCISE_MERGE_INTEGRITY;
- D56;
- D57;
- D58;
- D59;
- comportamento científico do return entry;
- recovery/restoration ceilings aprovados pelo SSCTR.

O SSCTR já aceitou o freeze R7-A.2 no seu escopo.

Esta missão deve preservar esse resultado.

---

# 6. BLOCKERS QUE ESTA MISSÃO DEVE FECHAR

Principal:

`QE-R7A-01`

através da manifestação atual de:

`QE-R7A1-09`

e qualquer residual diretamente equivalente de interruption identity.

Também deve impedir o reaparecimento semântico de:

`QE-R7A1-10`

mesmo que a versão atual já tenha mudado sua manifestação.

Objetivo final:

```text
QE-R7A-01 = CLOSED
QE-R7A1-09 = CLOSED
QE-R7A1-10 = CLOSED
D53 = CLOSED
```

sem quebrar D59 ou outros retornos já aprovados.

---

# 7. MODELO MÍNIMO — NÃO OVERENGINEER

Introduza apenas o mínimo necessário para dar identidade à interrupção.

É aceitável:

- adicionar um `episodeId`;
- adicionar referência de supersession/update;
- vincular return metadata ao episode;
- vincular easy-slot/return state ao episode;
- reconstruir estado temporal quando fatos do episódio mudam.

NÃO criar sem necessidade:

- event sourcing global;
- framework genérico de eventos;
- banco temporal novo;
- graph engine;
- nova camada distribuída;
- abstração multiplataforma;
- nova policy esportiva.

---

# 8. IDENTIDADE DE EPISÓDIO

A implementação precisa responder inequivocamente:

```text
isSameInterruption(A, B)
```

sem depender primariamente de:

- `pauseWeek`;
- “último retorno”;
- `startBeforeReturn` global da semana;
- easy slot existente;
- proximidade temporal isolada.

Quando o fluxo produz uma interrupção nova, deve existir um novo identity token.

Quando corrige uma interrupção existente, deve referenciar explicitamente o identity token existente.

---

# 9. LEGACY / INPUT SEM IDENTIDADE

Pode existir input anterior que não possua `episodeId`.

Não invente migração gigantesca.

Defina uma estratégia bounded.

Por exemplo:

### Quando for possível demonstrar equivalência

- source stable id;
- explicit correction relation;
- duplicate provenance;

→ vincular ao episódio existente.

### Quando estiver claro que houve treinamento/reentrada entre eles

→ novo episódio.

### Quando houver ambiguidade material

→ ASK/fail-closed.

Documente a estratégia escolhida.

---

# 10. EXECUTED STATE AT INTERRUPTION

A implementação deve oferecer uma única semântica para:

```text
executedStateAt(interruption.startedAt)
```

Ela precisa considerar:

- sessões efetivamente executadas;
- timestamps;
- corrections;
- provenance;
- dedupe;
- primeiras exposições;
- cargas/counts conhecidos;
- informações relevantes antes da pausa.

Não considerar:

- sessão futura;
- progresso não conquistado;
- adaptação ocorrida depois da pausa;
- treino planejado mas não executado.

---

# 11. NÃO DESFAZER D59

D59 já foi fechado pelo R7-A.2.

Portanto a nova implementação precisa preservar:

- primeiras exposições feitas antes da pausa;
- NONE;
- FAMILIAR;
- KNOWN;
- return entry;
- ceiling correto;
- sem salto indevido;
- sem block-set laundering.

Reexecutar a grade D59 como regressão obrigatória.

---

# 12. INVARIANTES

Formalize/teste no mínimo:

## I1 — Stable Episode Identity

O mesmo episódio mantém identidade através de revisões.

---

## I2 — Distinct Episode Identity

Uma interrupção nova depois de reentrada recebe identidade nova.

---

## I3 — Same-Episode Supersession

Correção de episódio A substitui fatos antigos de A sem criar B.

---

## I4 — Distinct-Episode Independence

B nunca reutiliza estado pré-A apenas porque ambos ocorreram na mesma semana.

---

## I5 — Temporal State

Return state deriva de:

```text
executedStateAt(startedAt)
```

---

## I6 — Late Evidence Reconciliation

Novo fato histórico com execution timestamp anterior à pausa pode alterar o estado pré-pausa.

Report timestamp sozinho não decide causalidade.

---

## I7 — No Future Leakage

Nada ocorrido depois de `startedAt` entra no estado pré-pausa.

---

## I8 — Easy-Slot Ownership

Qualquer easy slot/short-return marker pertence ao episode que o criou.

---

## I9 — Ambiguity Fail-Closed

Quando não houver evidência suficiente para saber se é:

```text
same episode
```

ou:

```text
new episode
```

e a diferença mudar a prescrição:

→ ASK.

---

# 13. TESTES MÍNIMOS

## Same episode

1. pausa A;
2. relatório A;
3. correção posterior de startedAt/end;
4. confirmar que continua episode A;
5. recalcular state quando necessário.

---

## Distinct episode — same week

```text
pause A
→ return/re-entry
→ pause B
```

B é novo episódio.

---

## Distinct episode — cross week

Mesmo caso atravessando fronteira semanal.

Resultado semanticamente equivalente.

---

## Short + short

```text
short pause A
→ easy slot A consumed
→ short pause B
```

B não reutiliza slot A.

---

## Late historical session

```text
session executed Monday
pause starts Wednesday
session sync arrives Friday
```

State at Wednesday deve incorporar Monday.

---

## Same-day ordered

Sessão antes da pausa no mesmo dia.

Sessão depois da pausa no mesmo dia.

---

## Same-day ambiguous

Apenas datas, sem horário suficiente.

Se impactar a decisão:

ASK.

---

## First loaded week

Preservar os casos de D59.

---

# 14. METAMORPHIC / PROPERTY TESTS

## P1 — Report time independence

Mover apenas:

```text
reportedAt
```

sem mudar fatos reais da mesma pausa:

→ não cria nova pausa.

---

## P2 — Episode correction

Mudar fatos da mesma pausa mantendo seu identity:

→ substitui versão anterior.

---

## P3 — Second episode isolation

Adicionar uma nova pausa depois da reentrada:

→ não altera retroativamente a identidade nem o state snapshot da primeira.

---

## P4 — Temporal boundary

Mover execução de:

```text
T < startedAt
```

para:

```text
T > startedAt
```

remove sua influência no estado pré-pausa.

---

## P5 — Week-boundary independence

Mesma semântica temporal não muda apenas porque o calendário virou semana.

---

## P6 — Duplicate input

Duplicar o mesmo interruption record:

→ não cria episódio extra.

---

# 15. SELF-CHALLENGE ANTES DO FREEZE

O autor deve tentar quebrar a solução ANTES do único freeze.

Cobrir com equivalence classes, sem exploração infinita:

- duas pausas;
- três pausas;
- mesma pausa corrigida várias vezes;
- correção + nova pausa;
- nova pausa + correção da antiga chegando atrasada;
- late session evidence;
- same-day;
- week boundary;
- first loaded week;
- short returns repetidos;
- equipamento/adaptação entre episódios;
- duplicate reports.

Se descobrir bug:

corrija ANTES do freeze.

---

# 16. MUTATION

Mutation testing limitado às novas invariantes:

- remover episode identity;
- tratar qualquer pausa posterior como mesma pausa;
- tratar toda correção como nova pausa;
- usar report time em vez de execution/start time;
- compartilhar easy slot entre episodes;
- ignorar late pre-pause execution.

Não expandir para runtime inteiro.

---

# 17. PROCESSO — UM FREEZE, SEM CORREÇÃO DEPOIS

Esta é a regra mais importante.

## BUILD

Implementar + testar + self-challenge.

Enquanto ainda não congelou, corrija qualquer finding próprio.

## FREEZE

Criar UM freeze:

`R7A-FINAL-FREEZE`

ou nomenclatura equivalente vigente.

## RE-CHECKS

Despachar sobre os mesmos bytes:

### Engineering
re-check principal.

### SSCTR
regression-only / scope affected.

## RESULTADO

Se ambos aceitarem:

`R7A_EXIT_READINESS = READY`

Se qualquer um encontrar blocker material:

`R7A_EXIT_READINESS = NOT_READY`

e parar.

NÃO existe:

- segundo freeze;
- correction cycle;
- A.3.1;
- terceiro reviewer.

Decisão volta ao Founder se falhar.

---

# 18. ENGINEERING RE-CHECK

Instância nova.

Deve reexecutar ao menos os probes correspondentes a:

- segunda pausa same-week;
- segunda pausa cross-week;
- P13/P14 ou successors;
- P02;
- P09;
- late evidence;
- same-day ambiguity;
- duplicate identity.

Pergunta:

> **Existe qualquer caminho normal V1 em que duas interrupções diferentes compartilhem identidade/estado ou uma correção da mesma interrupção seja tratada como episódio novo?**

---

# 19. SSCTR RE-CHECK

O SSCTR NÃO deve reabrir a ciência inteira.

Objetivo:

garantir que a mudança de identidade/estado não quebrou:

- D53;
- D56;
- D57;
- D58;
- D59;
- return entry;
- recovery ceiling;
- restoration;
- short-return semantics.

Se outputs esportivos aprovados permanecem dentro das regras, aceitar regressão.

---

# 20. GATE FINAL DA FASE A

Para READY:

```text
QE-R7A-01 = CLOSED
QE-R7A1-09 = CLOSED
QE-R7A1-10 = CLOSED
D53 = CLOSED
D56 = CLOSED
D57 = CLOSED
D58 = CLOSED
D59 = CLOSED
```

e:

```text
WEEK_COMPOSITION_INTEGRITY = READY
STATE_PRESERVATION_INTEGRITY = READY
EVENT_SUPERSESSION_INTEGRITY = READY
EXERCISE_MERGE_INTEGRITY = READY
RETURN_RECOVERY_CEILING_INTEGRITY = READY

R7A_FINAL_ENGINEERING_RECHECK = READY
R7A_FINAL_SCIENTIFIC_RECHECK = READY

R7A_EXIT_READINESS = READY
```

---

# 21. NÃO EMITIR AINDA

NÃO declarar:

- autonomous coach ready;
- coaching decision quality globally ready;
- KMP ready;
- production ready;
- human validated;
- clinically validated.

Esta missão fecha somente a fundação semântica da fase A.

---

# 22. SE READY — HANDOFF FINAL

Se:

`R7A_EXIT_READINESS = READY`

criar finalmente:

`CoachingCore/r7/R7A_FINAL_HANDOFF.md`

CURTO.

Deve conter:

### Freeze
hash/revision/tests/reviews.

### Canonical semantics
- week composition;
- interruption identity;
- stateAtInterruption;
- same-episode correction;
- distinct episodes;
- late historical evidence;
- ASK on material ambiguity.

### Closed blockers
lista.

### Preserved invariants
lista curta.

### Known nonblocking gaps
somente os realmente restantes.

### Minimum rehydration
arquivos que a próxima sessão deve ler.

### Exact next mission

```text
DOMAIN_COACHING_R7-B0
V1 COACHING REPERTOIRE FOUNDATION
```

NÃO iniciar B0 nesta sessão.

---

# 23. SE NOT_READY

Se qualquer juiz bloquear:

documentar:

- finding;
- reprodução;
- se é mesma classe ou nova classe;
- por que stable episode identity não resolveu;
- qual decisão arquitetural seria necessária.

Depois:

`NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION`

Pare.

NÃO criar automaticamente nova missão A.

---

# 24. CURRENT_MISSION / LEDGER

Atualizar de forma append-only:

- `CURRENT_MISSION.md`
- `MISSION_LEDGER.md`

Preservar todo histórico.

Se READY:

```text
NEXT_MISSION = DOMAIN_COACHING_R7-B0
```

Se NOT_READY:

```text
NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION
```

---

# 25. RELATÓRIO FINAL

Entregar de forma objetiva:

1. baseline;
2. identity model;
3. temporal state model;
4. handling de corrections;
5. handling de distinct pauses;
6. late historical evidence;
7. ambiguity behavior;
8. regressions;
9. mutation;
10. engineering review;
11. SSCTR regression review;
12. readiness;
13. exact next step.

Separar explicitamente:

- COMPROVADO;
- INFERIDO;
- NÃO TESTADO.

---

# 26. ANTI-OVERENGINEERING

A missão não é criar o histórico perfeito de um atleta.

Ela precisa responder corretamente apenas:

> **qual interrupção é esta?**

> **é uma correção daquela interrupção ou uma nova?**

> **qual era o estado realmente executado quando ela começou?**

Se uma solução pequena e explícita responde essas três perguntas, pare.

---

# EXECUTE

Reidrate o mínimo.

Confirme baseline e blocker.

Materialize stable interruption identity.

Faça return state depender semanticamente do instante da interrupção.

Preserve D59 e todos os READY existentes.

Ataque equivalentes antes de congelar.

Faça UM freeze.

Despache engineering + SSCTR sobre exatamente os mesmos bytes.

Se ambos aprovarem:

`R7A_EXIT_READINESS = READY`

crie o handoff e pare.

Se qualquer um bloquear:

`R7A_EXIT_READINESS = NOT_READY`

documente e pare.

NÃO inicie R7-B0 nesta sessão.
