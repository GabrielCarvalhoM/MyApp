# Raw Founder authority — Detailed UX Specification request (2026-10-18)

Authority record: the Founder's request as given to the Claude Chief session on 2026-10-18 (America/Sao_Paulo), reproduced verbatim below for traceability of the mission's workstreams, review dimensions, degraded states, mission questions and checkpoint report. This record is evidence of the request, not Product Truth; the Canon and the published consumers remain the product authority. Nothing here authorises implementation, Figma or visual direction. Recorded by the Chief after the r1 Product/UX judge noted that the literal request text was not in the repository.

---

Você está retomando o Vilumo Fit em uma NOVA sessão.

Projeto local:

C:\Users\carva\Desktop\myApp

IMPORTANTE:
não assuma contexto desta conversa.
O repositório é a fonte de verdade.
Leia o estado atual antes de tomar qualquer decisão.

==================================================
MISSÃO
==================================================

Iniciar a próxima fase do Vilumo Fit:

DETAILED UX SPECIFICATION

A missão atual NÃO é:
- redesenhar o produto;
- fazer novo rebaseline;
- pesquisar novamente o mercado;
- alterar a tese;
- implementar código;
- implementar Adaptive Engine;
- implementar JEV;
- conectar providers;
- desenhar telas;
- abrir ou editar Figma.

O objetivo é transformar o produto e o motor já aprovados em uma experiência detalhada, coerente, compreensível e implementável.

Ao final desta missão deve existir uma UX Specification estrutural suficientemente completa para passar por review e, somente depois de aprovação do Founder em outro checkpoint, servir de entrada para Figma.

==================================================
ANTES DE QUALQUER TRABALHO
==================================================

Use obrigatoriamente a arquitetura global de agentes instalada no projeto.

Entre pelo Chief / Orchestrator.

Aplique:

Execution Proportionality & Anti-Overengineering.

Prime directive:

Maximum useful rigor.
Minimum unnecessary machinery.

Antes de criar qualquer coisa, leia e sincronize-se com:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `canon/CANONICAL_INDEX.md`
4. `CURRENT_MISSION.md`
5. `MISSION_LEDGER.md`

Depois consuma integralmente as autoridades e contratos atuais relevantes, incluindo no mínimo:

- Canon 3.0.0 vigente;
- `V1_RELEASE_SCOPE.md` 1.1;
- `ADAPTIVE_ENGINE_CONTRACT.md` 1.1;
- `PRODUCT_DOMAIN_MODEL.md` 1.1;
- `PRODUCT_ARCHITECTURE.md` 1.1;
- `EXPERIENCE_MODEL.md` 1.1;
- `CORE_FLOWS.md` 1.1;
- `PRODUCT_DECISION_REGISTER.md`;
- `audits/pre-ux-2026-10-15/FINAL_READINESS_AUDIT.md`.

E agora também, obrigatoriamente:

- `product/ADAPTIVE_ENGINE_OPERATIONAL_SPEC.md`
  - AEOS-1.0-r2
- `product/ADAPTIVE_ENGINE_SCENARIO_LAB.md`
  - AESL-1.0-r2
- pacote/publicação:
  - `VF-AEOS-20261018-001`

O pacote AEOS foi publicado e aprovado com:

- AI review PASS;
- Engineering review PASS;
- Product/UX review PASS;
- Security review PASS;
- 390/390 verificações finais;
- Canon 3.0.0 preservado;
- PREUX preservado;
- nenhum código, ML, integração real ou Figma iniciado.

NÃO repita essas revisões ou pesquisas sem um conflito material novo.

==================================================
BASELINE QUE NÃO DEVE SER REABERTO
==================================================

A V1 permanece:

- Running × Strength como domínios first-class;
- Adaptive Engine como núcleo;
- Nutrition contextual ao treino/performance;
- Wearables como closed loop bidirecional quando tecnicamente suportado;
- Crew Lite;
- um sistema coordenando o atleta, não apenas dois módulos independentes.

A tese principal continua:

Vilumo deve coordenar Running e Strength como um único sistema adaptativo.

Não transformar o produto em:

- Runna + Hevy colados;
- chatbot fitness;
- dashboard de métricas;
- tracker genérico;
- social feed;
- app nutricional;
- sistema baseado em readiness score mágico.

==================================================
ARQUITETURA OPERACIONAL DO MOTOR QUE A UX DEVE RESPEITAR
==================================================

A experiência deve refletir corretamente:

data
→ normalization/provenance
→ deterministic hard constraints
→ conflict detection
→ valid adaptation candidates
→ deterministic baseline / JEV shadow
→ policy gate
→ decision
→ explanation
→ preview/confirmation quando necessária
→ executor futuro

JEV:

- é judge/ranker tipado;
- começa em SHADOW MODE;
- não controla oficialmente plano ou execução;
- nunca ultrapassa hard constraints;
- não inventa treino;
- não cria autoridade;
- não quebra safety;
- não substitui policies profissionais.

LLM:

- interpreta linguagem;
- coleta contexto;
- explica decisões oficiais;
- pode preparar opções já autorizadas;
- não é autoridade fisiológica;
- não inventa thresholds;
- não prescreve autonomamente;
- não executa decisão por conta própria.

==================================================
OBJETIVO DA DETAILED UX SPEC
==================================================

Converter os contratos atuais em comportamento de produto.

Especificar:

- o que o usuário vê;
- o que pode fazer;
- quando pode fazer;
- o que acontece depois;
- quais estados existem;
- quais transições existem;
- o que é automático;
- o que precisa de confirmação;
- o que pode ser desfeito;
- como erros e incerteza aparecem;
- como o sistema mantém continuidade.

NÃO definir estética ainda.

Não quero nesta missão:

- cor;
- tipografia;
- ilustração;
- design system;
- composição visual;
- pixel layout;
- direção visual;
- Figma.

==================================================
PRINCÍPIOS DE EXPERIÊNCIA
==================================================

Preservar a filosofia:

menos interface, mais decisão.

Mas sem esconder informação necessária para confiança e controle.

O usuário não deve precisar entender a arquitetura interna do motor.

A UX deve transformar complexidade em:

- contexto;
- decisão;
- consequência;
- controle.

Adaptive Engine não pode parecer uma caixa-preta arbitrária.

Toda adaptação material deve permitir que o usuário entenda, em linguagem simples:

1. o que mudou;
2. por que mudou;
3. o que foi preservado;
4. qual trade-off foi feito;
5. qual o nível/qualidade da informação disponível quando relevante;
6. o que ele pode fazer a respeito.

Exemplo conceitual:

“Preservei seu threshold porque é uma sessão prioritária neste bloco. Reduzi volume acessório do próximo lower para diminuir interferência sem remover o estímulo principal.”

Não transformar isso em UI agora; apenas especificar o comportamento.

==================================================
WORKSTREAM 1 — INFORMATION ARCHITECTURE
==================================================

Defina a arquitetura de experiência necessária para a V1.

Determinar:

- principais superfícies;
- responsabilidades de cada superfície;
- hierarquia;
- entradas;
- saídas;
- objetos compartilhados;
- onde cada ação pertence.

Evite criar tela para cada entidade.

Pergunta obrigatória:

essa superfície realmente precisa existir ou o comportamento pode acontecer dentro de outra?

A navegação deve ser previsível.

Não criar telas apenas porque existem entidades no Domain Model.

==================================================
WORKSTREAM 2 — ONBOARDING / ATHLETE MODEL
==================================================

Especificar como obter apenas as informações necessárias para iniciar o sistema.

Cobrir:

- objetivos;
- prioridade de objetivos;
- runner-first / strength-first / balanced quando previsto pelos contratos;
- experiência;
- disponibilidade semanal;
- equipamento;
- histórico relevante;
- conexão opcional de wearable;
- preferências;
- limitações permitidas pelos contratos;
- dados ausentes.

Evitar onboarding gigantesco.

Usar progressive disclosure.

Separar:

informação necessária agora

de

informação que pode ser aprendida posteriormente.

==================================================
WORKSTREAM 3 — TODAY / CURRENT DECISION
==================================================

Detalhar a experiência principal do produto.

A experiência deve responder rapidamente:

- o que faço hoje?
- por quê?
- mudou alguma coisa?
- preciso decidir algo?
- como executo?
- o que vem depois?

Definir comportamento para:

- Running day;
- Strength day;
- recovery day;
- rest;
- alteração recente;
- baixa confiança;
- treino já executado;
- treino parcialmente executado;
- wearable aguardando sync;
- activity late arrival;
- conflict requiring input.

==================================================
WORKSTREAM 4 — RUNNING EXPERIENCE
==================================================

Running deve permanecer first-class.

Especificar:

- workout intent;
- workout structure;
- warmup;
- blocks;
- repeats;
- recovery;
- cooldown;
- targets;
- alternatives;
- execution;
- completion;
- perceived effort;
- result;
- deviations;
- adaptation consequence.

Distinguir claramente:

planned
sent
provider accepted
device synced/received quando comprovável
executed
returned/imported
reconciled

Nunca mostrar “sincronizado no relógio” apenas porque o provider aceitou a requisição.

==================================================
WORKSTREAM 5 — STRENGTH EXPERIENCE
==================================================

Strength também deve permanecer first-class.

Não tratá-lo como acessório da corrida.

Especificar:

- exercícios;
- sets;
- reps;
- load;
- RIR/RPE quando aplicável;
- completion;
- substitution;
- progress;
- session intent;
- muscle/local demand;
- planned vs performed;
- above-plan / below-plan effort;
- adaptations posteriores.

A experiência principal de Strength deve ser app-first.

Wearable pode complementar, mas não reduzir o modelo de Strength ao menor denominador comum de relógios.

==================================================
WORKSTREAM 6 — ADAPTATION UX
==================================================

Este é um dos pontos mais importantes da missão.

Definir classes de manifestação da adaptação.

Cobrir:

KEEP
MOVE
REDUCE_VOLUME
REDUCE_INTENSITY
SUBSTITUTE
RECOVERY / REST
REPLAN_WEEK
ASK / HOLD
ESCALATE

Para cada classe, determinar:

- quando pode acontecer silenciosamente;
- quando deve ser apenas sugerida;
- quando exige preview;
- quando exige confirmação;
- quando não pode acontecer;
- como explicar;
- como mostrar consequências;
- como desfazer;
- como preservar consistência do plano.

IMPORTANTE:

o usuário não deve receber notificações constantes de microajustes irrelevantes.

Definir materialidade.

Evitar “adaptive theater”.

Uma adaptação deve aparecer como adaptação somente quando realmente mudou uma decisão relevante.

==================================================
WORKSTREAM 7 — WHY / EXPLAINABILITY
==================================================

Definir como o usuário pode entender uma decisão sem expor chain-of-thought.

Pode haver fatores estruturados como:

- sessão prioritária;
- fadiga local;
- histórico recente;
- treino acima do planejado;
- disponibilidade;
- próximo evento;
- dados insuficientes;
- provider atrasado.

Separar:

“o que influenciou”

de

“raciocínio interno”.

Decision Trace é para auditabilidade do sistema, não para mostrar raciocínio interno bruto ao usuário.

==================================================
WORKSTREAM 8 — CONFIDENCE / UNCERTAINTY
==================================================

A UX deve operacionalizar corretamente:

SUFFICIENT
PARTIAL
CONFLICTING
STALE
ABSENT

Não criar um score mágico.

Definir como cada estado altera:

- automação;
- quantidade de explicação;
- necessidade de pergunta;
- capacidade de alterar o plano;
- necessidade de HOLD;
- apresentação ao usuário.

Exemplo:

dados insuficientes podem gerar:

“Antes de ajustar, preciso saber como suas pernas estão hoje.”

em vez de inventar adaptação.

==================================================
WORKSTREAM 9 — USER AGENCY
==================================================

Especificar claramente:

- accept;
- reject;
- override;
- edit;
- undo;
- report incorrect context;
- keep original;
- alternative selection quando permitido.

Mas respeitar AEOS:

override do usuário NÃO remove:

- safety;
- hard constraints;
- permissions;
- professional boundaries;
- policy gates.

A experiência deve comunicar isso sem parecer autoritária.

==================================================
WORKSTREAM 10 — WEARABLE EXPERIENCE
==================================================

Especificar experiência provider-neutral.

Cobrir:

- connect;
- permissions separadas;
- read;
- write;
- disconnected;
- sync pending;
- provider accepted;
- delivery unknown;
- returned activity;
- delayed activity;
- duplicate;
- conflict;
- stale;
- provider outage;
- unsupported workout component;
- update;
- replace;
- revoke/delete;
- reconciliation.

Não inventar capabilities específicas que G06 ainda não comprovou.

A UX deve conseguir funcionar mesmo quando um provider possui capability degradada.

==================================================
WORKSTREAM 11 — NUTRITION CONTEXT
==================================================

Nutrition permanece contextual.

Não criar:

- calorie tracker;
- macros dashboard completo;
- food diary;
- diet plan;
- meal planner;
- barcode scanner;
- nutrition tab gigante.

Definir momentos em que contexto nutricional pode aparecer naturalmente:

- preparação;
- long session;
- recovery;
- short turnaround;
- event/race context.

Separar:

general education
performance guidance
professional prescription

Onde a terceira categoria depender de G05, deixar conteúdo/policy provisório e claramente dependente de validação.

==================================================
WORKSTREAM 12 — CREW LITE
==================================================

Crew deve continuar secundário ao core.

Cobrir apenas o escopo vigente:

- private Crew;
- invite;
- activity/progress sharing conforme privacy;
- commitment;
- reactions/support;
- basic shared goal/Relay se já vigente;
- recap.

NÃO introduzir:

- global feed;
- public discovery;
- DM;
- chat complexo;
- creator economy;
- marketplace;
- ranking massivo;
- social network aberta.

Regra:

Crew deve reforçar treino, compromisso ou resultado.

Não sequestrar a experiência principal.

==================================================
WORKSTREAM 13 — AGENT / CONVERSATIONAL EXPERIENCE
==================================================

Definir onde conversa realmente reduz interface.

O agente pode:

- explicar mudança;
- receber contexto;
- responder “por quê?”;
- ajudar a resolver conflito;
- aceitar linguagem natural;
- apresentar alternativas autorizadas.

Mas caminhos essenciais devem continuar funcionando sem conversa.

Não transformar Vilumo num chatbot.

A interface direta deve continuar eficiente.

==================================================
WORKSTREAM 14 — FAILURE / DEGRADED STATES
==================================================

Especificar explicitamente:

- no wearable data;
- stale data;
- provider offline;
- duplicate activity;
- failed workout push;
- workout delivered status unknown;
- conflicting input;
- user ignores adaptation;
- incomplete Strength log;
- missed Running activity;
- accidental duplicate;
- plan version conflict;
- late sync;
- revoked permission;
- unavailable capability;
- system low confidence.

Evitar dead ends.

Para cada estado:

o usuário deve saber:

- o que aconteceu;
- impacto;
- se precisa agir;
- próxima ação possível.

==================================================
WORKSTREAM 15 — CONTINUITY
==================================================

Detalhar continuidade entre:

plan
→ today
→ execution
→ result
→ interpretation
→ adaptation
→ next session

Essa continuidade é central para o produto.

Não permitir que cada treino pareça um evento isolado.

Vilumo deve dar sensação de:

“meu treinamento vive aqui.”

==================================================
WORKSTREAM 16 — NOTIFICATIONS
==================================================

Especificar classes e prioridade sem escrever microcopy final.

Evitar notificação excessiva.

Notificar somente quando houver valor claro, por exemplo:

- decisão exige usuário;
- treino relevante mudou;
- sync falhou de forma material;
- próximo treino depende de contexto;
- Crew commitment relevante.

Não notificar microajustes irrelevantes.

==================================================
WORKSTREAM 17 — OPEN DEPENDENCIES
==================================================

PDR G01–G11 continuam autoridade para dependências abertas.

Não tente resolver com criatividade aquilo que exige:

- profissional de Educação Física;
- nutricionista;
- médico;
- jurídico;
- provider/device;
- credenciais;
- dados reais;
- calibração.

Quando a UX depender disso:

especifique o comportamento estrutural

+

marque explicitamente o conteúdo/policy como dependency-bound.

Não bloqueie toda a UX por detalhes que podem ser preenchidos depois.

==================================================
DELIVERABLE PRINCIPAL
==================================================

Produza uma Detailed UX Specification com consumidor claro.

Não crie dezenas de documentos se um ou poucos artefatos forem suficientes.

O Chief deve decidir a casa correta.

A especificação deve permitir que um Product Designer consiga depois abrir Figma sem precisar reinterpretar o produto.

Ela deve conter no mínimo:

- architecture of experience;
- surface inventory;
- navigation model;
- object/action/state model;
- primary journeys;
- secondary journeys;
- state transitions;
- adaptive moments;
- confirmation model;
- explainability model;
- error/degraded states;
- wearable states;
- Running behaviors;
- Strength behaviors;
- Nutrition contextual behaviors;
- Crew behaviors;
- agent/direct interaction model;
- provisional/dependency-bound areas.

==================================================
REVIEW OBRIGATÓRIO
==================================================

Depois do draft, faça review estrutural independente proporcional.

Quero no mínimo avaliação das dimensões:

1. Product/UX coherence.
2. Fidelity to AEC + AEOS.
3. Running depth.
4. Strength depth.
5. Adaptive Engine manifestation.
6. User agency.
7. Explainability.
8. Low-confidence behavior.
9. Wearable state correctness.
10. Privacy/Security onde material.
11. Crew scope containment.
12. Nutrition scope containment.
13. Navigation/surface bloat.
14. Consistency across flows.
15. Implementability conceitual.

Use worker != judge para riscos materiais.

Corrija findings reais.

Não entre em loops de review sem mudança relevante.

==================================================
QUESTÕES QUE A MISSÃO DEVE RESPONDER
==================================================

Antes de encerrar:

1. Um usuário entende em poucos segundos o que deve fazer hoje?
2. Ele percebe por que o Vilumo é diferente de Runna + tracker de força?
3. Running parece first-class?
4. Strength parece first-class?
5. Adaptive Engine produz consequência visível?
6. A adaptação parece útil em vez de gimmick de IA?
7. Usuário entende mudanças importantes?
8. Usuário mantém controle?
9. Baixa confiança gera comportamento conservador?
10. Wearable status nunca promete mais do que sabemos?
11. Nutrition continua contextual?
12. Crew continua Lite?
13. O agente reduz interface sem virar a interface inteira?
14. Existem telas/superfícies redundantes?
15. Há fluxo morto?
16. Há estado sem saída?
17. A experiência mantém continuidade ao longo da semana?
18. Product Designer consegue começar Figma sem reinterpretar contratos?

==================================================
CHECKPOINT FINAL
==================================================

Quando Detailed UX Specification + review estiverem concluídos:

PARE.

NÃO abra Figma ainda.

Apresente ao Founder um relatório curto contendo:

A. Arquivos criados/alterados.
B. Arquitetura da experiência proposta.
C. Inventário de superfícies.
D. Modelo de navegação.
E. Principais jornadas.
F. Como Running se manifesta.
G. Como Strength se manifesta.
H. Como o Adaptive Engine se manifesta.
I. Como adaptações são explicadas/confirmadas/desfeitas.
J. Como wearables aparecem.
K. Como Nutrition entra sem virar módulo.
L. Como Crew entra sem sequestrar o produto.
M. Papel do agente.
N. Principais degraded/error states.
O. Findings dos reviewers e correções.
P. Dependências ainda abertas.
Q. Blockers reais para Figma.
R. Recomendação exata para a etapa visual/Figma.

E responda explicitamente:

`DETAILED_UX_READY_FOR_FIGMA = YES / NO`

Se NO:
liste somente blockers reais.

Se YES:
não comece Figma.

HARD STOP.

A autorização para direção visual e Figma será dada pelo Founder em uma missão separada.
