# DOMAIN_COACHING_R6 — Founder continuation request (2026-10-26)

Direct Founder message to the Claude Code continuation session, 2026-10-26, after the Codex R6 execution stopped on a usage limit at 2026-10-26T13:10:33Z. It instructs the new runtime to take over the partial R6 state and complete the existing mission without restarting it. The original mission authority remains [FOUNDER_REQUEST.md](FOUNDER_REQUEST.md); this message adds continuation rules and two product-state clarifications (contextual priority derived from goals; chosen days/shifts as strong agenda constraints without an obligation to invent inadequate training). Reproduced verbatim below.

---

Você está entrando em uma missão que JÁ ESTÁ EM ANDAMENTO no repositório atual.

Projeto:
`C:\Users\carva\Desktop\myApp\MyApp`

Sua tarefa é **assumir exatamente o estado parcial da missão DOMAIN_COACHING_R6 deixado pela execução anterior e concluí-la integralmente**.

NÃO reinicie o R6.
NÃO reescreva a missão a partir do zero.
NÃO descarte alterações não commitadas.
NÃO use `git reset`, checkout destrutivo, clean ou qualquer operação que possa remover trabalho existente.
NÃO refaça trabalho que já estiver corretamente concluído.
NÃO altere UI, Figma, KMP, produção ou planos reais.

## PRIMEIRO: REIDRATE O ESTADO REAL

Antes de alterar qualquer coisa:

1. leia:
   - `CLAUDE.md`
   - `AGENTS.md`
   - `CURRENT_MISSION.md`
   - `MISSION_LEDGER.md`

2. localize:
   - artefatos congelados do R5;
   - `CoachingCore/r5`;
   - trabalho parcial já criado para R6;
   - audit/mission contract do R6;
   - qualquer checkpoint, report, scratch, review ou arquivo gerado pela execução anterior;
   - alterações não commitadas atuais.

3. execute:
   - inspeção de `git status`;
   - diff relevante;
   - testes/baseline quando necessário para entender o estado.

4. determine exatamente:
   - o que do R6 já foi concluído;
   - o que está parcialmente implementado;
   - o que ainda não começou;
   - quais agentes/reviews terminaram;
   - quais ficaram interrompidos;
   - quais arquivos pertencem a outras missões simultâneas e devem ser preservados.

Use o REPOSITÓRIO como fonte de verdade.

Não presuma que este prompt contém todo o estado atual.

---

# CONTEXTO DO HANDOFF

A execução anterior do R6 foi interrompida por limite de uso.

Antes da interrupção, ela havia registrado que:

- MyApp e R5 completo foram localizados;
- R5 congelado deveria permanecer intacto;
- R6 estava sendo desenvolvido em módulos separados;
- baseline original passou nos 280 testes;
- três casos Balanced do holdout R5 selecionavam opções pela ordem dos candidatos mesmo quando os custos eram incomparáveis;
- alguns casos paravam em contratos de alternativas antes de alcançar raciocínio de progressão ou retorno;
- o adapter introduzia um horário futuro de 22h, invalidando uma observação real anterior de 20h;
- correções desses pontos já haviam começado;
- houve início de trabalho em cold program / adaptation-learning / SSCTR R6.

Confirme tudo isso pelo estado real do repositório antes de confiar nesta descrição.

---

# AUTORIDADE DA MISSÃO

Localize e leia integralmente o contrato/prompt persistido da missão:

**DOMAIN_COACHING_R6 — ROBUST AUTONOMOUS COACHING & COLD-START COMPLETION**

Essa missão existente continua sendo a autoridade.

NÃO crie uma missão R6 diferente.

Sua função é completar aquela missão.

Os objetivos centrais permanecem:

1. corrigir todos os defeitos concretos encontrados pelo holdout R5;
2. cold start real a partir de inputs semelhantes aos do onboarding;
3. Balanced Hybrid robusto;
4. geração whole-program sem semana pré-montada;
5. Run / Strength / Hybrid programming suficientemente completos para V1;
6. substitution funcional;
7. return não clínico;
8. taper / race-week / event transition;
9. adaptive coaching em horizonte;
10. Athlete Model longitudinal robusto a dados parciais/ruído;
11. corrigir bugs de provenance/time;
12. corrigir H20 na geração inicial;
13. executar novo unseen holdout R6;
14. julgar coaching pela qualidade das decisões, não apenas por testes verdes;
15. determinar honestamente se a semântica está pronta para KMP Production Core Prep.

---

# IMPORTANTE: ESTADO DE PRODUTO MAIS NOVO

Ao reidratar o projeto, respeite decisões superseding já persistidas.

Em particular, o produto está evoluindo para não depender de prioridade estática do usuário entre Run-first / Strength-first / Balanced.

O coach deve ser capaz de derivar prioridade contextual a partir de:

- objetivos;
- fase;
- evento;
- estímulos essenciais;
- histórico;
- atleta;
- horizonte.

Se o contrato R6 já incorporou isso, preserve.

Se documentação de produto ainda estiver sendo alterada paralelamente por outra missão, NÃO edite Figma/UI daqui e NÃO force sincronização documental fora do escopo.

Projete o Coaching Core de forma compatível com objetivos sem exigir um `staticPriorityMode` quando não for semanticamente necessário.

Também preserve a ideia de que os dias/turnos escolhidos pelo atleta são restrições fortes da agenda, mas não obrigação de inventar treino inadequado.

---

# R5 HOLDOUT É REGRESSÃO CONGELADA

Os 24 casos do holdout R5 devem permanecer intactos.

Não altere fatos para melhorar resultados.

Para cada defeito conhecido:

- reproduza;
- encontre root cause;
- corrija capability;
- acrescente teste;
- rerode exatamente o caso original.

Especial atenção para:

### Balanced SUBOPTIMAL ×3

Não usar:
- ordem dos candidatos;
- 50/50 arbitrário;
- alternating winner;
- hidden Run-first;
- hidden Strength-first.

Buscar primeiro Pareto.

Quando trade-off for inevitável, comparar efeito conjunto em:
- H0 sessão;
- H1 semana;
- H2 bloco;
- H3 objetivo.

### progression / return contracts

Não deixar contratos artificiais interromperem raciocínio quando o contexto realmente possui informação suficiente.

Não contornar missing info verdadeiro.

### substitution

Se uma substituição admissível já foi fornecida, o motor deve realmente considerá-la no candidate set.

### future timestamp bug

Corrigir causalidade/proveniência.

Uma observação futura não pode alterar decisão passada.

Adicionar regression coverage para:
- clock skew;
- timezone;
- out-of-order;
- future observation;
- duplicates;
- stale events.

### H20

Não corrigir apenas o MOVE posterior.

Descobrir e corrigir a falha de geração inicial.

---

# COLD START É PRIORIDADE

O treinador V1 precisa partir de inputs parecidos com onboarding, e NÃO de uma semana perfeita já estruturada.

Pipeline esperado:

`OnboardingState`
→ `Canonical Athlete Intake`
→ `Goal/Capability/Uncertainty Model`
→ `Program`
→ `Block`
→ `Week`
→ `Executable Sessions`

Cobrir os perfis requeridos pelo contrato R6.

Não exigir dado perfeito.

Classificar unknown em:

- pode seguir com establishment conservador;
- ASK realmente necessário;
- pode aprender posteriormente;
- clinical/out-of-scope.

O objetivo é conseguir montar um primeiro programa competente para atletas V1 elegíveis sem histórico Vilumo.

---

# NÃO RETORNAR AO MODELO PAPER-PER-WORKOUT

Manter a correção conceitual estabelecida em R4/R5:

**Sports Science**
define:
- princípios;
- boundaries;
- admissible envelopes;
- evidência/contraevidência.

**Coaching Intelligence**
compõe e escolhe a melhor decisão dentro desses limites.

Uma prescrição concreta dentro de envelope aprovado NÃO precisa de um paper específico provando exatamente aquela combinação.

SSCTR revisa mudanças científicas materiais, não cada output.

---

# QUALIDADE > QUANTIDADE

Não considere sucesso simplesmente:

- mais POSITIVE;
- mais tests;
- mais rules.

Manter classificações:

- BEST_SUPPORTED
- ACCEPTABLE_ALTERNATIVE
- SUBOPTIMAL
- INSUFFICIENT_INFORMATION
- UNSUPPORTED
- CLINICAL_OUT_OF_SCOPE

KEEP é sucesso se for a melhor decisão.

ASK é sucesso se informação realmente for necessária.

A meta é eliminar falhas estruturais e aumentar decisões BEST_SUPPORTED.

---

# REVIEWS INDEPENDENTES

Preserve a independência exigida pelo projeto.

Use instâncias/agentes separados quando necessário para:

- autoria/implementação;
- Quality/Engineering;
- coaching-quality adversarial review;
- SSCTR quando houver alteração científica material;
- holdout author.

Não faça a mesma instância implementar e depois usar sua própria opinião como prova de qualidade.

Se o tipo nativo SSCTR não estiver exposto, use o fallback já definido pelo projeto, carregando explicitamente constituição/protocolo/skill.

---

# NOVO HOLDOUT R6

Só depois de congelar a implementação R6:

1. registre hashes;
2. outra instância cria corpus novo sem ver internals/expected outputs;
3. sele;
4. execute UMA primeira avaliação;
5. preserve o raw;
6. review independente classifica qualidade;
7. não retune antes de registrar a primeira avaliação.

Não usar o holdout R5 como “novo”.

---

# NÃO MIGRAR PARA KMP AINDA

Node24 continua oracle/reference runtime nesta missão.

Somente no FINAL avalie:

`KMP_PRODUCTION_CORE_PREP_READINESS`.

Recomende KMP apenas se os critérios do R6 forem realmente satisfeitos.

Do contrário, use `DOMAIN_COACHING_R7` ou outro próximo passo explicitamente justificado.

---

# PRESERVE TRABALHO PARALELO

O repositório pode conter mudanças de outras missões, incluindo Figma/onboarding/documentação.

Não as sobrescreva.

Antes de gravar em arquivos compartilhados:

- confira diff;
- use append/supersession conforme governança;
- preserve alterações existentes;
- não normalize arquivos alheios apenas por estilo.

Se houver conflito real:
registre, reconcilie e preserve ambos os intents em vez de descartar silenciosamente.

---

# FINALIZAÇÃO

Não pare após implementar código.

Complete integralmente a Definition of Done do R6 existente, incluindo:

- implementação;
- testes;
- regressões;
- simulador;
- R5 holdout rerun;
- fresh R6 holdout;
- reviews independentes;
- SSCTR quando aplicável;
- verification;
- readiness verdicts;
- final report;
- CURRENT_MISSION / MISSION_LEDGER conforme as regras locais;
- checkpoint de conclusão.

No relatório final, quero especialmente:

1. R5 holdout antes → depois;
2. novo R6 holdout;
3. BEST_SUPPORTED / ACCEPTABLE / SUBOPTIMAL / INSUFFICIENT / UNSUPPORTED;
4. cold-start results;
5. whole-program quality;
6. Balanced results;
7. return;
8. event/race-week;
9. substitution;
10. athlete learning;
11. bugs corrigidos;
12. gaps restantes;
13. `PRODUCTION_CORE_SEMANTIC_STABILITY`;
14. `KMP_PRODUCTION_CORE_PREP_READINESS`;
15. `NEXT_ENGINEERING_STEP`.

Não force READY.

Se continuar NOT_READY, diga exatamente por quê.

## OBJETIVO FINAL

**Concluir a missão DOMAIN_COACHING_R6 existente, aproveitando integralmente o trabalho parcial já realizado, e provar com casos congelados + um novo holdout independente se o Vilumo já consegue agir como um treinador híbrido robusto desde o cold start até programa, adaptação, aprendizado e evento — ou identificar honestamente o próximo conjunto mínimo de blockers antes da implementação de produção.**
