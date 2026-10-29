# DOMAIN_COACHING_R7-A — Founder request (verbatim)

Direct Founder message to a new Claude Code session, 2026-10-27. It defines and authorizes DOMAIN_COACHING_R7-A only, the first of four planned phases (R7-A, R7-B, R7-C, R7-D). Reproduced verbatim below; nothing is paraphrased.

---

# DOMAIN_COACHING_R7-A
## SEMANTIC CORE HARDENING & STATE-COMPOSITION STABILITY

Você está iniciando uma NOVA sessão.

NÃO assuma contexto conversacional anterior.

A fonte de verdade é exclusivamente o estado atual do repositório MyApp e as autoridades/checkpoints persistidos nele.

Projeto:

`C:\Users\carva\Desktop\myApp\MyApp`

Esta é a primeira de quatro fases planejadas:

- R7-A — Semantic Core Hardening
- R7-B — Cold Start & Whole Program Competence
- R7-C — Longitudinal Coaching
- R7-D — Fresh Generalization Gate

Esta missão executa **SOMENTE R7-A**.

NÃO antecipe B, C ou D.

---

# 0. OBJETIVO

O R6 expandiu significativamente o Coaching Core, mas encerrou:

`CLOSED_WITH_EXPLICIT_BLOCKER`

e manteve:

`COACHING_DECISION_QUALITY = NOT_READY`

`PRODUCTION_CORE_SEMANTIC_STABILITY = NOT_READY`

`KMP_PRODUCTION_CORE_PREP_READINESS = NOT_READY`

O parecer final não encontrou evidência de um buraco arquitetural fundamental, mas encontrou defeitos de semântica central e inconsistências entre:

- estados;
- fases;
- modos;
- retornos antecipados;
- modifiers;
- reconstrução de prescrição;
- histórico;
- provenance.

R7-A existe para eliminar **classes de inconsistência estrutural** antes que R7-B adicione ou refine competência de cold start.

A pergunta desta fase é:

> **Para o mesmo conceito esportivo, o Coaching Core produz comportamento semanticamente consistente em todos os estados/modos equivalentes e aplica corretamente as transformações relevantes antes de emitir uma prescrição?**

---

# 1. REIDRATAÇÃO OBRIGATÓRIA

Antes de editar qualquer coisa:

leia e reconcilie, no mínimo:

- `AGENTS.md`
- `CLAUDE.md`
- `CURRENT_MISSION.md`
- `MISSION_LEDGER.md`
- Product Truth / Decision Register pertinentes
- contratos vigentes do Coaching Core
- final disposition/report/readiness do DOMAIN_COACHING_R6
- `CoachingCore/r6/OPEN_GAPS_R6.md`, se ainda for o locator vigente
- holdout/reviews finais R6 pertinentes aos blockers
- decisão pós-R6 de escopo V1 iOS/HealthKit
- `audits/v1-wearable-scope-2026-10-27/RECORD.md`, se este continuar sendo o locator vigente
- registros DR-117–119 ou seus successors vigentes

Descubra pelos índices/ledger os caminhos canônicos atuais.

Não confie cegamente em filenames citados neste prompt se o repositório já registrar successor.

Use o repo como autoridade.

---

# 2. PRESERVAR HISTÓRIA DO R6

DOMAIN_COACHING_R6 está FECHADO.

NÃO:

- reabra R6;
- reescreva seu relatório;
- reclassifique seu holdout;
- modifique freezes históricos;
- altere hashes/evidências preservadas;
- faça parecer que correções R7 já existiam no R6.

R7 é uma nova missão.

R6 permanece evidência histórica.

---

# 3. NOVO ESCOPO DE PLATAFORMA

Reidrate também a decisão pós-R6:

V1 = iOS-first.

Para V1:

- HealthKit inbound pertence ao produto iOS;
- Garmin direto = POST_V1;
- COROS direto = POST_V1;
- Polar direto = POST_V1;
- WorkoutKit / structured delivery para Apple Watch = POST_V1;
- Android = POST_V1;
- HealthKit write-back é decisão técnica/produto separada e não blocker desta missão.

IMPORTANTE:

R7-A avalia apenas o Coaching Core sobre **canonical inputs**.

Não implemente:

- HealthKit;
- Apple APIs;
- Garmin;
- COROS;
- Polar;
- Android;
- adapters de produção.

O Core deve continuar platform/vendor-agnostic.

Dados podem variar semanticamente em:

- rich;
- partial;
- sparse;
- stale;
- duplicate;
- corrected;
- conflicting;
- manual;
- imported/external.

Mas vendor-specific behavior não pertence a R7-A.

---

# 4. NÃO EXPANDIR CAPABILITY

R7-A NÃO é uma missão para tornar o treinador mais completo.

Não adicione novas famílias de treino, novos objetivos, novas populações ou novas modalidades para melhorar métricas.

R7-A deve corrigir a **estrutura semântica do que já existe**.

Se encontrar uma lacuna real de competência pertencente ao cold start:

registrar para R7-B.

Se for longitudinal:

registrar para R7-C.

Se precisar de generalização:

registrar para R7-D.

Não resolva tudo nesta missão.

---

# 5. BLOCKERS R6 QUE DEVEM SER INVESTIGADOS PRIMEIRO

Comece pelos blockers/achados finais reais do R6.

No mínimo:

## D53 — SERIES RESTORATION

O R6 registrou que recuperação/restauração de séries funcionava em alguns estados com carga conhecida, mas não em todos os modos.

Em determinados caminhos, após reestabelecimento, uma exposição podia saltar de 2 para 4 séries.

Não faça patch só para o probe conhecido.

Descubra a classe estrutural responsável.

Verifique todos os state modes materialmente equivalentes.

---

## D54 — PHASE REDUCTION BYPASS

O R6 registrou caminho em que reestablishment retornava antes de aplicar redução pertinente à fase:

- taper;
- race week;
- post-race;

resultando em dose maior do que a fase permitia.

Não resolver com:

`if taper then ...`

em um caso isolado.

Investigue a ordem/composição das transformações do pipeline.

---

# 6. OUTRAS CLASSES DE INCONSISTÊNCIA A INVESTIGAR

Use o relatório/reviews R6 para confirmar a lista final.

Procure especialmente:

- `TOTAL` × `PER_HAND`;
- bodyweight rep restoration;
- establishment × progression;
- establishment × phase;
- return × phase;
- re-establishment × taper;
- inactive historical exercises alterando state atual;
- historical corrections perdidas;
- duplicate observations;
- contradictory observations;
- schedule facts persistindo indevidamente;
- stale evidence influenciando estado atual;
- source/provenance differences causando output diferente sem razão esportiva;
- unknown sendo tratado como zero;
- ausência de review sendo interpretada como sinal negativo;
- state transition que pula um modifier aplicável;
- early return que ignora validação posterior;
- reconstrução de prescription sem preservar semantics previamente estabelecidas.

Não presuma que todos existem.

Prove ou descarte cada classe.

---

# 7. OBJETIVO ARQUITETURAL

Investigue se a implementação atual possui uma classe de defeitos causada por:

- early returns;
- branches paralelos;
- modifiers aplicados em ordens diferentes;
- duplicação de lógica de dose;
- reconstruções independentes da mesma prescription.

Se SIM, prefira corrigir a causa estrutural.

Objetivo conceitual:

`base candidate`
→ `applicable transformations`
→ `constraints`
→ `phase/state modifiers`
→ `final invariant validation`
→ `disposition`

A ordem concreta NÃO deve ser inventada por este prompt.

Ela deve ser derivada das autoridades esportivas existentes e revisada quando materialmente esportiva.

Não faça refactor grande apenas por estética.

Refatore somente quando isso eliminar uma classe demonstrada de inconsistência.

---

# 8. FORMALIZAR INVARIANTS QUANDO JUSTIFICADO

Onde houver conceito que deve permanecer verdadeiro independentemente do branch, torne-o explícito.

Exemplos conceituais:

- redução de race/taper não pode ser ignorada por establishment;
- duplicate observation não altera dose;
- correção histórica substitui versão factual anterior conforme contrato;
- mudança apenas de representação de carga não altera significado físico;
- exercício histórico irrelevante não altera state atual;
- unknown não ganha valor fictício;
- mesma evidência canônica não muda decisão apenas por label de fornecedor.

Não transforme esses exemplos automaticamente em policy.

Confirme cada um contra as autoridades atuais.

---

# 9. PROPERTY / METAMORPHIC TESTING

R7-A deve reduzir dependência de fixtures específicas.

Adicionar property/metamorphic tests onde fizer sentido.

Exemplos de transformações úteis a investigar:

### Provenance equivalence
Mesmo dado canônico com fonte diferente, sem diferença material de confiança:

→ mesma decisão esportiva.

### Duplicate invariance
Adicionar cópia reconhecidamente duplicada de uma observação:

→ não altera prescrição.

### Correction supersession
Adicionar correção válida de um fato:

→ versão anterior não continua exercendo influência acumulada.

### Representation equivalence
TOTAL e PER_HAND representando fisicamente a mesma carga:

→ significado equivalente após canonicalização.

### Phase monotonicity quando aplicável
Mudar BUILD → TAPER, mantendo os demais fatos:

→ não pode resultar em violação da redução imposta pela policy de taper.

Não invente propriedades fisiológicas universais.

Cada property precisa estar sustentada por contrato/policy.

---

# 10. NÃO TESTAR SÓ O HAPPY PATH

Para cada state transition material alterada, cobrir quando aplicável:

- known load;
- unknown load;
- bodyweight;
- exercise with previous exposure;
- novel exercise;
- active exercise;
- inactive historical exercise;
- normal build;
- consolidation;
- taper;
- race week;
- post-race;
- return;
- re-establishment;
- complete evidence;
- partial evidence.

Não produza matriz cartesiana absurda.

Use equivalence classes e boundary cases.

Execution Proportionality.

---

# 11. SPORTS SCIENCE REVIEW

Chame SSCTR SOMENTE quando a correção mudar materialmente:

- dose;
- phase behavior;
- return;
- progression;
- establishment;
- taper;
- training policy.

SSCTR não revisa:

- naming;
- code style;
- parsing;
- hashes;
- purely technical dedupe.

Forneça ao SSCTR contexto mínimo:

- regra afetada;
- comportamento anterior;
- comportamento proposto;
- relevant authority;
- probes;
- diff semântico.

Não despeje o repo inteiro.

---

# 12. ENGINEERING REVIEW

Depois da implementação estabilizar, faça revisão independente focada nas classes de bugs R7-A.

Reviewer deve procurar:

- branch asymmetry;
- skipped modifiers;
- unexpected early return;
- duplicated semantic logic;
- inconsistent state transitions;
- stale state;
- order dependence;
- invalid state reconstruction;
- provenance leaks;
- hidden unit conversion errors.

Ele não deve simplesmente reler a lista de bugs corrigidos.

Deve tentar quebrar a solução.

---

# 13. REGRESSION

Preservar:

- R5 regression corpus;
- R6 known holdout;
- R6 fresh holdout;
- existing R6 tests.

Casos R6 agora são REGRESSION, não fresh generalization.

Não reclassificar antigos resultados para alegar melhora.

É permitido executar casos para detectar regressões.

---

# 14. TEST COUNT NÃO É KPI

Não otimizar:

`443 → número maior`

como métrica de sucesso.

Número de testes é informativo.

O headline desta fase deve ser:

> **classes de inconsistência eliminadas + invariants demonstradas.**

---

# 15. NÃO EXECUTAR NOVO FRESH HOLDOUT

Novo unseen holdout pertence à R7-D.

R7-A pode criar probes novos para engenharia e propriedades.

Eles NÃO devem ser apresentados como independent generalization evidence.

---

# 16. CRITÉRIO DE ACEITAÇÃO — D53

D53 só pode ser fechado se:

- a causa estrutural estiver identificada;
- todos os state modes materialmente relevantes estiverem cobertos;
- restoration não produzir salto indevido de dose;
- regressões cobrirem a classe;
- review independente não encontrar equivalente não corrigido.

Não fechar apenas porque o probe histórico passou.

---

# 17. CRITÉRIO DE ACEITAÇÃO — D54

D54 só pode ser fechado se:

- a composição entre establishment/re-establishment e phase modifiers estiver formalmente definida;
- taper/race/post-race aplicáveis não puderem ser pulados;
- não existir early-return equivalente ignorando modifier obrigatório;
- metamorphic/property tests relevantes passarem;
- SSCTR aprovar a semântica esportiva quando necessário;
- engineering reviewer tentar quebrar outras combinações de estado.

---

# 18. OUTROS ACHADOS R6

Para cada achado de severidade alta relacionado a consistência estrutural:

classificar:

`FIXED_R7A`

`PROVEN_NOT_APPLICABLE`

`R7B_COLD_START`

`R7C_LONGITUDINAL`

`R7D_GENERALIZATION`

`POST_V1`

`CLINICAL_OUT_OF_SCOPE`

Não deixar item em limbo.

---

# 19. STOP CONDITIONS

Pare R7-A quando:

1. D53 e D54 estiverem resolvidos ou houver blocker concreto externo;
2. classes equivalentes de inconsistência estrutural conhecidas estiverem tratadas;
3. invariants pertinentes estiverem materializadas/testadas;
4. regressões antigas continuarem passando;
5. SSCTR pertinente estiver concluído;
6. engineering review independente da versão candidata estiver concluído;
7. nenhuma falha estrutural HIGH conhecida desta fase permanecer aberta.

NÃO continue procurando melhorias de coaching depois disso.

---

# 20. NÃO FAZER NESTA MISSÃO

NÃO:

- melhorar cold start por amplitude;
- adicionar novos archetypes;
- melhorar programação apenas para aumentar BEST_SUPPORTED;
- criar novo holdout;
- implementar Athlete Learning avançado;
- expandir Run catalogue;
- expandir Strength catalogue;
- implementar integração;
- tocar Figma;
- implementar KMP;
- portar runtime;
- implementar app;
- adicionar modalidade;
- redesenhar onboarding;
- criar feature nova;
- tentar concluir readiness global do treinador.

---

# 21. READINESS DE R7-A

Emitir apenas readiness pertinente a esta fase:

`STATE_COMPOSITION_STABILITY`

`PHASE_MODIFIER_INTEGRITY`

`PRESCRIPTION_RECONSTRUCTION_INTEGRITY`

`CANONICAL_INPUT_SEMANTIC_STABILITY`

`R7A_ENGINEERING_REVIEW`

`R7A_SCIENTIFIC_REVIEW`

`R7A_EXIT_READINESS`

Valores:

- READY
- READY_WITH_EXPLICIT_NONBLOCKING_GAPS
- NOT_READY

Não emitir:

`AUTONOMOUS_COACHING_READY`

ou

`KMP_READY`

com base apenas em R7-A.

---

# 22. HANDOFF PARA R7-B

Se:

`R7A_EXIT_READINESS = READY`

gere um artefato curto e suficiente:

`CoachingCore/r7/R7A_FINAL_HANDOFF.md`

ou o local equivalente definido pela arquitetura vigente.

Ele deve conter APENAS:

### Freeze identity
- revision/hash/commit-state pertinente;
- data/hora;
- tests;
- reviews.

### What changed
Resumo das classes corrigidas.

### Invariants
Lista canônica das invariants novas/fortalecidas.

### Remaining gaps
Somente itens que passam para B/C/D/post-V1.

### R7-B entry point
Primeiro ponto exato onde a próxima sessão deve começar.

### Required rehydration
Lista mínima de arquivos que R7-B deve ler.

Não copie todo o relatório R7-A.

O handoff deve ser desenhado para uma NOVA sessão com contexto limpo.

---

# 23. CURRENT_MISSION / LEDGER

Ao encerrar:

- atualize `CURRENT_MISSION.md`;
- atualize `MISSION_LEDGER.md`;
- registre disposition;
- preserve provenance;
- não marque R7 inteira como concluída;
- marque apenas R7-A.

Se READY:

próxima missão:

`DOMAIN_COACHING_R7-B — COLD START & WHOLE PROGRAM COMPETENCE`

Mas NÃO a inicie.

---

# 24. RELATÓRIO FINAL R7-A

Entregar relatório objetivo:

1. estado inicial;
2. blockers R6 consumidos;
3. root causes encontradas;
4. mudanças estruturais;
5. invariants;
6. tests adicionados;
7. regressões;
8. SSCTR;
9. independent engineering review;
10. gaps encaminhados;
11. readiness;
12. ponto exato de retomada da R7-B.

Separar claramente:

- comprovado;
- inferido;
- não testado.

---

# PRINCÍPIO FINAL

R7-A não existe para deixar o código “mais elegante”.

Existe para garantir que:

> **o treinador não mude de significado acidentalmente só porque a mesma situação entrou por outro branch, state mode, phase ou representação.**

Se a solução correta for uma pequena correção + invariant forte, faça isso.

Se um refactor estrutural bounded for necessário para eliminar uma classe demonstrada de bugs, faça-o.

Não faça overengineering.

---

# EXECUTE

Reidrate primeiro.

Depois estabeleça baseline atual.

Crie o contrato/checkpoint da missão R7-A.

Execute a fase até seu próprio gate de saída.

Se `R7A_EXIT_READINESS = READY`, pare.

NÃO inicie R7-B nesta sessão.
