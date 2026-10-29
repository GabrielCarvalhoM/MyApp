# DOMAIN_COACHING_R7-A.1 — Founder request (verbatim)

Received 2026-10-27 in a new Claude Code session (clean context), as the whole user message. Preserved below without edits.

---

# DOMAIN_COACHING_R7-A.1
## WEEKLY COMPOSITION CLOSURE — BLOCKER-ONLY MISSION

Você está iniciando uma NOVA sessão com contexto limpo.

Projeto:

`C:\Users\carva\Desktop\myApp\MyApp`

Esta missão é uma continuação estritamente limitada da DOMAIN_COACHING_R7-A.

Ela NÃO é R7-B.

Ela existe exclusivamente porque:

`R7A_EXIT_READINESS = NOT_READY`

com sete blockers reproduzíveis após o limite de dois ciclos da R7-A.

---

# 0. REGRA PRINCIPAL

NÃO tente tornar o treinador mais completo.

NÃO expanda:

- cold start;
- catálogo;
- novos perfis;
- aprendizado;
- programação;
- novas modalidades;
- novas heurísticas;
- novos objetivos.

Resolva apenas a classe estrutural que impede a R7-A de fechar.

A missão termina quando:

1. os sete blockers forem resolvidos pela causa correta;
2. nenhum blocker equivalente material for encontrado;
3. os dois juízes aprovarem a MESMA versão congelada;
4. `R7A_EXIT_READINESS = READY`.

Depois disso, pare.

NÃO inicie R7-B.

---

# 1. REIDRATAÇÃO

Leia primeiro:

- `AGENTS.md`
- `CLAUDE.md`
- `CURRENT_MISSION.md`
- `MISSION_LEDGER.md`
- `CoachingCore/r7/FINAL_REPORT_R7A.md`
- `CoachingCore/r7/READINESS_R7A.json`
- `audits/domain-coaching-r7a-2026-10-27/FINAL_DISPOSITION.json`
- R7A FREEZE-1/FREEZE-2 manifests e reviews pertinentes
- probes dos dois juízes
- policies/authority diretamente consumidas pelos blockers

Leia também o handoff/locator pós-R6 de V1 iOS/HealthKit apenas para preservar scope.

Não releia documentação não relacionada sem necessidade.

---

# 2. PRESERVAÇÃO

R6 permanece histórico.

R7-A permanece histórico.

NÃO reescreva:

- resultados R6;
- FREEZE-1/FREEZE-2 da R7-A;
- pareceres anteriores;
- hashes;
- classificações históricas.

R7-A.1 deve produzir nova evidência aditiva.

---

# 3. BLOCKERS A FECHAR

A missão começa com exatamente estes sete blockers.

## QE-R7A-01 — HIGH

Mudança de equipamento na semana atual apaga um retorno que começa na semana seguinte.

Esperado:

uma modificação localizada na semana atual não destrói estado futuro válido não relacionado.

Investigar composição/reconciliação semanal e ownership do future state.

---

## QE-R7A-03 — HIGH

Retorno na semana de prova + adiamento da prova resulta em duas provas.

Esperado:

alteração válida de evento substitui/reconcilia a representação anterior em vez de duplicá-la.

Investigar event identity, supersession e weekly rebuild.

---

## QE-R7A-02

Retorno curto informado de manhã mantém sessão de qualidade do mesmo dia.

Investigar:

- temporal ordering;
- same-day eligibility;
- retorno;
- sessão já planejada;
- quando preservar versus modificar.

Qualquer mudança de dose/treino precisa de revisão SSCTR.

---

## QE-R7A-05

Fusão por exercício pode perder carga conhecida.

Investigar semantic merge.

Known data NÃO pode virar unknown ou ser descartado simplesmente porque outra representação incompleta chegou.

Não inventar prioridade universal entre fontes.

Seguir provenance/recency/correction contracts.

---

## QE-R7A-12

Uma série curta registrada com carga mais leve passa a ser usada como meta.

Uma execução parcial/curta não deve automaticamente redefinir target futuro sem evidência/policy que autorize isso.

Separar:

- observation;
- completed exposure;
- establishment evidence;
- progression evidence;
- target.

---

## QE-R7A-19 — HIGH

Mudança de prova que alcança a semana atual descarta adaptações anteriores dessa semana.

Esse blocker foi criado pelo ciclo 2.

Isso é evidência de que os patches atuais ainda recompõem a semana de forma destrutiva.

Não resolver apenas recolocando manualmente a adaptação.

A causa deve ser tratada na composição da semana.

---

## D56 — SSCTR BLOCKER

Semanas completamente reduzidas por disponibilidade de tempo alteram ou encerram o teto de recuperação.

Quando o tempo disponível aumenta novamente:

agachamento pode saltar 2 → 4 séries.

Isso é um caminho semanticamente equivalente ao D53.

D53 NÃO fecha enquanto D56 permanecer.

Resolver a classe:

**recovery/return restoration ceiling must not be reset or bypassed by temporary schedule/time constraints.**

A formulação final precisa ser confirmada pelo SSCTR.

---

# 4. HIPÓTESE ESTRUTURAL A INVESTIGAR

O relatório R7-A sugere que vários handlers recompõem a semana de maneiras diferentes.

Investigue explicitamente se existe comportamento semelhante a:

`event change`
→ rebuild week

`equipment change`
→ rebuild week

`return`
→ rebuild week

`schedule change`
→ rebuild week

e cada rebuild preserva subconjuntos diferentes do estado.

Se isso estiver acontecendo, NÃO criar sete regras de preservação independentes.

Preferir um modelo central bounded de:

# WEEK COMPOSITION / RECONCILIATION

O conceito deve distinguir, quando aplicável:

### Stable commitments
itens ainda válidos que devem sobreviver.

### Superseded facts
itens substituídos por informação mais nova.

### Historical execution
o que já aconteceu e não pode ser apagado.

### Current adaptations
mudanças já aceitas/aplicáveis na semana.

### Future commitments
itens futuros válidos que não devem desaparecer por mudança local.

### New change
a alteração que motivou recomposição.

### Applicable policy transformations
return, phase, schedule, equipment etc.

### Final validation
invariants antes da emissão.

Não adote estes nomes obrigatoriamente.

Derive o modelo correto do runtime atual.

---

# 5. EVITAR PATCH CHAINS

Sinal de solução ruim:

```
if equipmentChange && returnNextWeek ...
if eventMoved && adaptationExists ...
if timeBudgetChanged && recovery ...
```

Solução preferível:

uma regra de composição que faça essas propriedades emergirem de maneira consistente.

Não force grande refactor se uma abstração pequena resolver a classe.

Mas não aceite patch específico quando o mesmo problema existir em outro handler.

---

# 6. COMPOSITION CONTRACT

Se a hipótese estrutural for confirmada, materialize um contrato explícito de composição semanal.

Ele deve responder:

1. O que é fato histórico imutável?
2. O que pode ser superseded?
3. O que é alteração local?
4. O que é commitment futuro?
5. O que deve sobreviver a rebuild?
6. Qual dado vence quando duas representações coexistem?
7. Como preservar adaptações já aplicadas?
8. Como eventos são identificados/reconciliados?
9. Como return/recovery ceilings persistem através de schedule/time changes?
10. Quando um observation pode alterar future target?

Não criar policy esportiva nova para responder questão de engenharia.

Onde houver conteúdo esportivo, usar autoridade/SSCTR.

---

# 7. INVARIANTS MÍNIMAS A PROVAR

Confirme e formalize apenas se sustentadas pelas autoridades.

## I1 — Historical preservation

Uma recomposição não apaga execução histórica válida.

## I2 — Locality

Mudança localizada não deve destruir estado independente fora do seu escopo.

## I3 — Supersession

Fato/evento explicitamente substituído não permanece ativo em paralelo.

## I4 — Known-information preservation

Merge incompleto não degrada automaticamente informação conhecida válida.

## I5 — Observation ≠ target

Uma observação parcial não redefine automaticamente prescrição futura.

## I6 — Recovery ceiling persistence

Limitação temporária de agenda/tempo não encerra teto fisiológico/retorno sem evidência pertinente.

## I7 — Applied-adaptation preservation

Rebuild de semana não apaga adaptações anteriores ainda válidas.

Esses são objetivos de verificação.

Não os canonize sem confirmar consistência com as autoridades existentes.

---

# 8. TESTES

Não buscar crescimento de count.

Adicionar testes com poder estrutural.

## Metamorphic / property tests

### Local change
Aplicar equipment change localizado.

Verificar que:

future return não relacionado permanece.

### Event supersession
Alterar data da mesma prova.

Verificar:

uma única prova ativa.

### Adaptation preservation
Aplicar adaptação semanal.

Depois alterar evento.

Verificar:

adaptação ainda válida permanece.

### Merge monotonicity of knowledge
Adicionar observação incompleta após carga conhecida válida.

Verificar:

known não vira unknown sem razão.

### Partial execution
Adicionar série curta/lighter execution.

Verificar:

não redefine target sem regra explícita.

### Time constraint reversibility
Aplicar semana limitada por tempo.

Depois restaurar disponibilidade.

Verificar:

recovery ceiling permanece e progressão respeita step permitido.

### Handler equivalence
Mudanças equivalentes por handlers diferentes não devem reconstruir estados semanticamente incompatíveis.

---

# 9. MUTATION TESTING

A R7-A terminou com:

33/34 reversões capturadas.

A lacuna restante precisa ser entendida.

Não basta aumentar mutation count.

Identifique qual invariant aquela mutação representa.

Se ela corresponde a comportamento material desta missão:

adicione teste que a capture.

Se não corresponde:

documente por que não bloqueia.

Meta:

nenhuma mutação material relacionada aos sete blockers sobreviver silenciosamente.

---

# 10. D53 / D56

D53 só pode finalmente ser marcado CLOSED se:

- caminhos originais continuam corrigidos;
- D56 é corrigido;
- nenhum state mode equivalente conhecido permite salto de restauração;
- SSCTR aprova a semântica final;
- juiz de engenharia não encontra novo equivalente.

Não tratar D56 como bug independente e deixar D53 “quase fechado”.

Eles representam a mesma família até prova contrária.

---

# 11. CICLOS

Esta missão deve ter processo bounded.

Permitir:

### Build
uma fase de implementação antes do freeze.

### FREEZE-A1
congelar candidato.

### Reviews
- engineering;
- SSCTR quando aplicável.

### Um único correction cycle
somente findings materiais dos reviews.

### FREEZE-A2
nova versão.

### Uma única re-verificação estreita

Se ainda existir blocker material após isso:

`R7A1_EXIT_READINESS = NOT_READY`

Pare.

NÃO faça terceiro ciclo.

Não transforme A.1 em outro R6.

---

# 12. REVISORES

## Engineering reviewer

Recebe:

- freeze;
- composition contract;
- invariants;
- sete blockers;
- tests;
- runtime affected.

Deve tentar descobrir **outros caminhos equivalentes**, não apenas reproduzir os sete.

Pergunta central:

> existe outro handler capaz de destruir ou reconstruir estado equivalente de forma diferente?

---

## SSCTR

Recebe somente itens esportivos:

- QE-R7A-02;
- QE-R7A-12 quando houver alteração de interpretação de dose;
- D56/D53;
- qualquer regra de return/recovery/progression afetada.

Não enviar merge/provenance puramente técnico sem implicação esportiva.

---

# 13. ACCEPTANCE CRITERIA

A missão só pode sair READY se:

### Blockers
QE-R7A-01 CLOSED  
QE-R7A-02 CLOSED  
QE-R7A-03 CLOSED  
QE-R7A-05 CLOSED  
QE-R7A-12 CLOSED  
QE-R7A-19 CLOSED  
D56 CLOSED  
D53 CLOSED

### Structure
weekly composition/reconciliation tem comportamento único ou semanticamente equivalente demonstrado.

### Regression
- R5 corpus preservado;
- R6 regressions preservadas;
- R7-A regressions preservadas.

### Mutation
nenhuma mutação material da classe permanece sem detecção/justificativa.

### Reviews
Engineering = ACCEPT  
SSCTR = ACCEPT no seu escopo.

### New blockers
zero HIGH novos pertencentes à R7-A.

---

# 14. READINESS

Emitir:

`WEEK_COMPOSITION_INTEGRITY`

`STATE_PRESERVATION_INTEGRITY`

`EVENT_SUPERSESSION_INTEGRITY`

`EXERCISE_MERGE_INTEGRITY`

`RETURN_RECOVERY_CEILING_INTEGRITY`

`R7A1_ENGINEERING_REVIEW`

`R7A1_SCIENTIFIC_REVIEW`

`R7A_EXIT_READINESS`

O último pode virar READY somente se esta missão realmente fechar a R7-A original.

---

# 15. HANDOFF PARA R7-B

Somente se:

`R7A_EXIT_READINESS = READY`

criar:

`CoachingCore/r7/R7A_FINAL_HANDOFF.md`

Agora sim.

Incluir apenas:

- frozen revision;
- invariants;
- semantic composition model;
- regressions;
- resolved blocker IDs;
- remaining B/C/D gaps;
- arquivos mínimos de reidratação;
- ponto exato de entrada da R7-B.

Não carregar o processo inteiro.

---

# 16. SE NOT_READY

Se após a única re-verificação ainda existir blocker:

NÃO criar handoff para R7-B.

Registrar claramente:

- blocker;
- root cause;
- evidência;
- por que não fechou;
- menor próxima missão possível.

Não iniciar B.

---

# 17. NÃO FAZER

NÃO:

- melhorar cold start;
- trabalhar nos 9 perfis do holdout;
- aumentar BEST_SUPPORTED;
- adicionar programação;
- melhorar athlete learning;
- adicionar novas progressões;
- fazer fresh holdout;
- tocar Figma;
- tocar HealthKit;
- tocar Android;
- tocar Garmin/COROS/Polar;
- portar para KMP;
- implementar iOS.

---

# PRINCÍPIO DE SAÍDA

A R7-A.1 deve responder:

> **“Existe agora uma única semântica confiável de composição e preservação da semana, independente do handler que causou a mudança?”**

Se SIM e os blockers estiverem fechados:

R7-A → READY.

Se NÃO:

pare com blocker explícito.

Não esconda a falha aumentando testes ou fazendo terceiro ciclo.

---

# EXECUTE

Reidrate apenas o necessário.

Estabeleça baseline.

Investigue primeiro a causa compartilhada.

Implemente a menor solução estrutural suficiente.

Congele.

Revise.

Permita no máximo um ciclo de correção.

Reverifique.

Se READY, produza o handoff para R7-B e pare.
