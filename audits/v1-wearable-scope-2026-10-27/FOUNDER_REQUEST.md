# Founder request — V1 wearable scope reconciliation · 2026-10-27

Current direct Founder request, given in a Claude Code session on 2026-10-27 (America/Sao_Paulo), after DOMAIN_COACHING_R6 closed (`audits/domain-coaching-r6-2026-10-26/FINAL_DISPOSITION.json`). Recorded verbatim below. Decisor: Founder. Status: DECIDED / CURRENT_PRODUCT_DECISION, formalized in [PDR DR-117–119](../../product/PRODUCT_DECISION_REGISTER.md).

---

Retome o projeto `MyApp` a partir do estado atual do repositório.

Esta é uma missão CURTA E BOUNDED de governança/produto.

NÃO é continuação do DOMAIN_COACHING_R6.

O R6 já foi encerrado formalmente com seu verdict atual e seus artefatos/evidências devem permanecer historicamente intactos.

## OBJETIVO

Registrar oficialmente uma nova decisão de escopo da V1 antes da próxima missão de Coaching Core.

### NOVA DECISÃO

**Integrações diretas com fabricantes de wearables estão FORA DA V1.**

Isso inclui:

- Garmin API direta;
- COROS API direta;
- Polar API direta;
- OAuth/vendor account linking específico desses fabricantes;
- ingestão vendor-specific como requisito da V1;
- FIT/vendor-specific ingestion como requisito de lançamento;
- structured workout export para relógios;
- envio direto de treinos para Garmin/COROS/Polar;
- sincronização bidirecional específica de fabricante;
- calendário/plano enviado diretamente ao relógio;
- approvals/parcerias específicas desses fabricantes como dependência da V1.

Essas capacidades passam para:

**V2 / POST_V1.**

---

# V1

Para a V1 no iOS, a camada externa de saúde/atividade será:

**Apple Health / HealthKit.**

O produto poderá consumir aquilo que estiver efetivamente disponível via HealthKit e autorizado pelo usuário.

Isso pode incluir atividades originalmente registradas por:

- Apple Watch;
- Garmin;
- COROS;
- Polar;
- outros apps/dispositivos;

quando esses dados realmente chegarem ao Apple Health.

Mas o Vilumo NÃO deve presumir que toda a riqueza da fonte original sobreviverá até HealthKit.

Exemplos:

um treino de força pode chegar apenas como:

- strength workout;
- duração;
- horário;
- algumas métricas;

sem necessariamente conter:

- exercício;
- sets;
- reps;
- carga;
- RIR.

Uma corrida pode chegar sem todos os detalhes disponíveis na plataforma original.

**Missing data continua missing data. Não inventar.**

---

# IMPORTANTE — NÃO SIMPLIFICAR O COACHING CORE ERRADO

Esta redução de escopo NÃO remove a necessidade de contratos genéricos para dados externos.

Preservar como capacidades do domínio:

- provenance;
- source identity;
- timestamps;
- freshness;
- canonical workout representation;
- partial data;
- unknown fields;
- duplicate detection;
- conflicting observations;
- corrections;
- manual vs imported data;
- uncertainty;
- capability-aware interpretation.

O Coaching Core deve permanecer **vendor-agnostic**.

Não acoplar Coaching Intelligence a HealthKit.

Arquitetura conceitual:

`HealthKit / manual / workout execution`
→ adapter/canonicalization
→ canonical athlete/workout data
→ Coaching Core.

---

# R6 HISTÓRICO

NÃO alterar retroativamente:

- relatório final R6;
- freeze(s);
- holdout;
- reviews;
- evidence;
- hashes;
- readiness daquele momento;
- verdict BLOCK;
- quaisquer artefatos que representem historicamente o resultado do R6.

O R6 foi avaliado sob o contrato vigente naquele momento.

A nova decisão deve ser registrada como:

**post-R6 product scope supersession**

com data/proveniência clara.

---

# PRÓXIMA MISSÃO — R6.1 OU R7

A próxima missão de Coaching Core deve reidratar este novo estado e considerar:

### NÃO blockers de V1

- ausência de Garmin direto;
- ausência de COROS direto;
- ausência de Polar direto;
- ausência de structured workout export para relógio;
- ausência de vendor OAuth/API;
- ausência de FIT específico de fabricante.

Nenhum desses pode manter o Coaching Core V1 em BLOCK.

### Ainda relevantes para V1

Continuam relevantes:

- partial external workouts;
- provenance;
- deduplicação;
- stale data;
- timestamps;
- conflicting data;
- unknown details;
- manual correction;
- canonical workout semantics.

Porque esses problemas continuam existindo mesmo quando os dados chegam via Apple Health.

---

# APPLE HEALTH

NÃO implementar HealthKit nesta missão.

NÃO escrever integration code.

NÃO criar adapter real.

NÃO pesquisar APIs desnecessariamente.

Registrar apenas o contrato de produto/arquitetura necessário.

Implementação real pertence à etapa de produção.

---

# ANDROID

Não tome silenciosamente uma nova decisão de Android nesta missão.

Se a documentação atual ainda prometer Android na V1 e essa decisão criar uma inconsistência por Apple Health ser iOS-only:

registre explicitamente como:

`OPEN_PRODUCT_PLATFORM_DECISION`

para o Founder resolver depois.

NÃO adicione Health Connect automaticamente ao escopo sem decisão explícita.

---

# FIGMA

Não faça uma grande rodada de Figma agora.

Essa missão precede o freeze final.

Apenas registre, quando necessário, que o futuro V1 Design Reconciliation deverá:

- remover conexão direta Garmin;
- remover conexão direta COROS;
- remover conexão direta Polar;
- remover envio de workout estruturado para relógios como promessa V1;
- tratar Apple Health como integração V1;
- representar partial/missing data honestamente;
- remover qualquer blocker visual baseado em direct wearable integration.

A alteração completa do Figma será feita na missão de Design Reconciliation & Implementation Freeze posterior ao fechamento do Coaching Core.

---

# DOCUMENTAÇÃO

Localize quais autoridades atuais realmente precisam registrar a mudança.

Atualize apenas o necessário, provavelmente incluindo conforme aplicabilidade real do repo:

- Product Decision Register;
- Product Truth / product scope;
- V1 scope;
- integration/wearable contract;
- architecture/domain boundaries;
- backlog/roadmap;
- CURRENT_MISSION;
- MISSION_LEDGER.

Não reescrever dezenas de documentos por redundância.

Use supersession explícita.

Preserve histórico.

---

# VERIFICAÇÃO

Antes de concluir, faça busca no repo por referências que ainda tratem como V1 requirement:

- Garmin;
- COROS;
- Polar;
- wearable direct integration;
- structured workout export;
- watch sync;
- FIT ingestion;
- device partner API.

Classifique cada ocorrência como:

- HISTORICAL — preservar;
- SUPERSEDED — atualizar referência vigente;
- V2_POST_V1 — manter como backlog;
- GENERIC_CORE_CAPABILITY — preservar;
- STALE_V1_REQUIREMENT — corrigir.

Não faça replacement global cego.

---

# DELIVERABLE FINAL

Entregar resumo curto contendo:

1. decisão registrada;
2. autoridades atualizadas;
3. decisões superseded;
4. o que foi preservado como generic Core capability;
5. o que foi movido para V2;
6. eventuais inconsistências encontradas;
7. qualquer OPEN_PRODUCT_PLATFORM_DECISION;
8. ponto exato que R6.1/R7 deve ler para reidratar esta decisão.

Emitir:

`V1_WEARABLE_SCOPE_RECONCILIATION = READY | READY_WITH_FIXES | NOT_READY`

e:

`NEXT_COACHING_MISSION_CAN_REHYDRATE_NEW_SCOPE = YES | NO`

## Definition of Done

A missão termina quando:

- Garmin/COROS/Polar diretos não são mais requisito vigente da V1;
- HealthKit está registrado como integração externa da V1 no iOS;
- generic external-data semantics continuam preservadas;
- R6 histórico continua intacto;
- R6.1/R7 consegue reidratar o novo escopo sem ambiguidade.

Pare aí.

NÃO iniciar R6.1/R7 nesta sessão.
