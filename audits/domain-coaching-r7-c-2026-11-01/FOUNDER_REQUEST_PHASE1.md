# DOMAIN_COACHING_R7-C · Fase 1 — Founder request (verbatim)

Direct Founder message to a Claude Code session, 2026-11-01 (America/Sao_Paulo). It authorizes R7-C Phase 1 only: investigation, context reconstruction, exact scope definition and closure plan. Reproduced verbatim below; nothing is paraphrased.

---

# DOMAIN COACHING — R7-C · FASE 1

Estamos retomando o Coaching Core depois do fechamento formal da R7-B.2.

## CONTEXTO DE EXECUÇÃO

Esta missão será executada em fases separadas.

NÃO execute a R7-C inteira nesta sessão.

Esta sessão corresponde SOMENTE à:

> **R7-C — Fase 1: investigação, reconstrução de contexto, definição exata do escopo e plano de fechamento.**

Ao terminar, produza um checkpoint de alta densidade para a próxima sessão.

Não continue automaticamente para implementação.

---

# MODO DE TRABALHO

Estamos voltando ao fluxo normal do Claude Code.

Não use `tools/agent-runtime` como supervisor desta missão.

Não crie sequência automática de unidades/sessões.

Trabalhe normalmente nesta sessão visível.

Aplicar permanentemente:

> Execution Proportionality & Anti-Overengineering.

Use o menor processo suficiente para atingir confiança adequada.

Não criar documentos, gates, reviewers, agentes ou verificações sem consumidor real.

STOP_WHEN a Fase 1 estiver concluída.

---

# BASELINE

A R7-B.2 terminou formalmente:

`CLOSED_READY`

Ela fechou o blocker residual:

`QE-R7B1-04`

Preservar todas as closures de:

- R7-A;
- R7-B0;
- R7-B;
- R7-B.1;
- R7-B.2.

Não reabrir findings já fechados sem nova evidência concreta.

Primeiro identifique no próprio repo:

- branch/commit canônico de fechamento da R7-B.2;
- freeze vigente;
- registros de closure;
- authorities vigentes;
- último checkpoint relevante.

Não assuma hashes fornecidos por memória externa quando o repo puder responder diretamente.

---

# OBJETIVO DESTA FASE

Determinar com precisão:

1. **o que R7-C realmente significa segundo as autoridades atuais do projeto;**
2. quais capacidades ela precisa fechar;
3. quais contratos já estão congelados;
4. quais contratos ainda estão incompletos;
5. quais dependências existem;
6. quais riscos são safety-critical;
7. qual é o menor plano de implementação capaz de fechar a fase;
8. quais evidências serão necessárias posteriormente para afirmar READY.

Esta é uma fase de **investigação e definição**, não de implementação.

---

# PASSO 1 — RECONSTRUIR A AUTORIDADE

Inspecione somente os artefatos necessários.

Priorize:

- CURRENT_MISSION;
- MISSION_LEDGER;
- Product / Training / Sports authorities relevantes;
- R7-B0 catalogue;
- R7-B/B.1/B.2 closure records;
- freezes;
- decision registers;
- runtime contracts;
- tests existentes;
- findings ainda explicitamente abertos.

Não reidrate o projeto inteiro.

Não releia documentos irrelevantes só para “ter contexto”.

Produza um mapa pequeno de autoridade:

```text
authority
→ o que governa
→ versão/freeze
→ relevante para qual parte da R7-C
```

---

# PASSO 2 — IDENTIFICAR O ESCOPO REAL DA R7-C

Não invente o significado da R7-C.

Derive do repo.

Determine:

- objetivo formal;
- entrada esperada;
- saída esperada;
- critérios de readiness;
- blockers conhecidos;
- dependências;
- explicitamente fora de escopo.

Se houver inconsistência entre documentos, não escolha silenciosamente.

Classifique:

```text
AUTHORITATIVE
STALE
SUPERSEDED
AMBIGUOUS
```

e explique somente o necessário.

---

# PASSO 3 — GAP ANALYSIS

Compare:

```text
estado atual depois da R7-B.2
vs
estado necessário para fechar R7-C
```

Para cada gap real:

```text
ID / descrição
por que importa
authority
runtime impact
safety impact
dependências
provável área de código
evidência necessária para fechar
```

Distinguir claramente:

### A. blocker real
impede readiness.

### B. residual conhecido
pode permanecer documentado.

### C. melhoria
não deve entrar na R7-C se não for necessária.

### D. hipótese
precisa primeiro de evidência.

Não transformar melhorias em blockers.

---

# PASSO 4 — SAFETY / CLINICAL BOUNDARIES

Atenção especial a qualquer comportamento relacionado a:

- dor;
- lesão;
- retorno;
- interrupção;
- re-entry;
- clinical-human-required;
- contraindicações;
- late evidence;
- causalidade fisiológica;
- prescrição sem suporte.

A R7-B.2 acabou de fechar um problema de prioridade clínica.

Preservar estritamente:

> safety/clinical requirement precede non-safety conversational or evidence reconciliation behavior quando a autoridade exigir isso.

Não alterar essa precedência incidentalmente.

---

# PASSO 5 — REPERTÓRIO E COMPOSIÇÃO

Verifique o que R7-C espera das camadas já existentes:

```text
evidence
→ classification
→ validated repertoire/archetype
→ parameterization
→ hybrid composition
→ bounded adaptation
```

Preservar a tese:

> repertório validado não significa templates rígidos,
> mas também não significa geração prescritiva ilimitada.

Não introduzir geração aberta pelo modelo.

---

# PASSO 6 — RUNNING + STRENGTH + HYBRID

Se R7-C tocar qualquer uma dessas áreas, verificar explicitamente:

### Running
- Run Intelligence Layer;
- estímulos protegidos;
- progressão;
- volume/intensidade;
- retorno;
- taper/race quando aplicável.

### Strength
- Strength Intelligence Layer;
- exercício/substituição;
- progressão;
- skill/equipment;
- recovery/interference.

### Hybrid
- interferência;
- scheduling;
- composição;
- prioridades dinâmicas;
- recuperação;
- proteção de estímulos.

Não assumir prioridade fixa:

```text
run-first
strength-first
balanced
```

A prioridade deve continuar derivada de objetivo, fase, histórico, resposta, recuperação, agenda e demais authorities.

---

# PASSO 7 — TESTES EXISTENTES

Mapeie os testes já existentes que cobrem o escopo encontrado.

Não execute baterias gigantes apenas porque existem.

Nesta fase, execute apenas verificações leves se necessárias para confirmar o baseline.

O objetivo é saber:

```text
o que já temos
o que falta testar depois
```

Não é obter freeze novo.

---

# PASSO 8 — PLANO DA FASE 2

Depois da investigação, proponha o menor plano de implementação.

Preferência:

```text
R7-C Fase 2
→ implementação dos blockers/gaps reais

R7-C Fase 3
→ evidência dirigida + adversarial + freeze

R7-C Fase 4
→ review independente

R7-C Fase 5
→ correção/recheck/closure somente se necessário
```

Mas NÃO force essa quantidade de fases.

Se o trabalho justificar menos fases, diga.

Execution Proportionality governa.

---

# NÃO FAZER NESTA SESSÃO

Não:

- implementar o fechamento da R7-C;
- criar freeze;
- declarar READY;
- rodar review independente final;
- criar dezenas de documentos;
- iniciar R7-D;
- alterar Figma;
- trabalhar em Supabase;
- trabalhar em SwiftUI;
- mexer no Agent Execution Runtime;
- reabrir R7-B.2;
- mudar escopo da V1;
- adicionar wearables diretos Garmin/COROS/Polar;
- inventar feature nova.

Pequenas correções exclusivamente necessárias para permitir investigação podem ser feitas, mas devem ser excepcionais e explicitadas.

---

# CHECKPOINT OBRIGATÓRIO

Ao terminar, produza um checkpoint curto e completo com exatamente estas seções:

## R7C_PHASE1_STATUS

`COMPLETE | BLOCKED`

## CANONICAL_BASELINE

- branch
- HEAD
- último closure
- freeze relevante

## WHAT_R7C_IS

Descrição objetiva derivada das authorities.

## AUTHORITIES

Somente as relevantes.

## CURRENT_STATE

O que já existe e está fechado.

## REAL_GAPS

Somente gaps que realmente precisam ser tratados.

## DO_NOT_REOPEN

Closures/invariantes a preservar.

## SAFETY_CRITICAL_ITEMS

Itens que exigirão maior rigor posteriormente.

## TEST_EVIDENCE_ALREADY_AVAILABLE

O que já cobre parte da missão.

## PHASE_2_EXACT_SCOPE

Escopo mínimo da próxima sessão.

## PHASE_2_FILES_LIKELY_TOUCHED

Estimativa, não obrigação.

## LATER_EVIDENCE_REQUIRED

O que precisará existir antes de closure.

## OPEN_AMBIGUITIES

Somente ambiguidades reais.

## RECOMMENDED_NEXT_PROMPT

Não escreva o prompt completo.

Forneça apenas a intenção da próxima fase em 3–8 bullets.

---

# GIT

Pode criar a branch normal de trabalho para R7-C se necessário segundo as convenções atuais do repo.

Não faça commit artificial apenas para marcar investigação se nada material precisar ser versionado.

Se documentação de missão precisar ser atualizada para registrar o checkpoint, mantenha a alteração mínima.

Não faça merge.

---

# TERMINAL CONDITION

Pare quando:

1. o significado exato de R7-C estiver reconstruído;
2. o baseline estiver confirmado;
3. gaps reais estiverem identificados;
4. safety boundaries estiverem explícitos;
5. Fase 2 estiver claramente delimitada;
6. o checkpoint estiver escrito.

Então:

**STOP.**

Não iniciar a implementação.
