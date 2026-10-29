# Founder request r2 — V1 platform and wearable clarifications · 2026-10-27

Current direct Founder request, given in the same Claude Code session on 2026-10-27, after the r1 record ([FOUNDER_REQUEST.md](FOUNDER_REQUEST.md), [r1 bytes](r1/)).
- **Decisor:** Founder.
- **Status:** DECIDED / CURRENT_PRODUCT_DECISION, formalized in [PDR DR-120–123](../../product/PRODUCT_DECISION_REGISTER.md).
- **Naming:** the request's `OPEN_PRODUCT_PLATFORM_QUESTION-1` is the item recorded in r1 as `OPEN_PRODUCT_PLATFORM_DECISION-01`.

The request is recorded verbatim below.

---

A decisão pós-R6 sobre wearables está correta, com as seguintes clarificações finais de produto.

NÃO reabra nem altere qualquer evidência histórica do DOMAIN_COACHING_R6.

## 1. V1 É iOS-FIRST

Decisão definitiva para a V1:

**o lançamento inicial será somente iOS.**

Android NÃO faz parte da V1.

Android será considerado somente depois da validação inicial do produto.

Portanto:

- não adicionar Health Connect à V1;
- não criar requisitos Android para V1 readiness;
- não criar paridade iOS/Android como blocker;
- não implementar ou especificar integração Android nesta fase.

Classificar Android como:

`POST_V1 / FUTURE_PLATFORM_EXPANSION`

A arquitetura, entretanto, deve evitar acoplamentos desnecessários que tornem uma futura implementação Android difícil.

---

## 2. HEALTHKIT NA V1

No iOS, a camada externa principal de saúde/atividade da V1 será:

**Apple Health / HealthKit.**

HealthKit INBOUND faz parte da V1.

O produto poderá consumir apenas os dados efetivamente disponíveis e autorizados no HealthKit.

Não presumir que:

- exercício;
- séries;
- reps;
- carga;
- estrutura de intervalos;
- campos proprietários do wearable;

estarão necessariamente disponíveis.

Ausência de campo continua sendo ausência de campo.

Não inferir ou inventar dados.

---

## 3. HEALTHKIT WRITE-BACK

Não considere `HealthKit somente leitura` uma decisão definitiva além do inbound explicitamente aprovado.

Separar:

### V1 REQUIRED
`HealthKit inbound`

### OPEN_TECHNICAL_PRODUCT_DECISION
Possibilidade de o Vilumo registrar no HealthKit atividades concluídas/registradas pelo próprio app.

Essa decisão pode ser resolvida posteriormente durante preparação de implementação iOS.

Ela NÃO deve bloquear:

- DOMAIN_COACHING_R7;
- Coaching Core readiness;
- semantic freeze.

---

## 4. APPLE WATCH / WORKOUTKIT

Continua fora da V1:

- structured workout delivery para Apple Watch;
- WorkoutKit como requisito;
- controle de intervalos pelo relógio;
- envio de plano/calendário ao Watch;
- qualquer dependência desse fluxo para lançar a V1.

Classificar como:

`POST_V1 / V2`

Assim como as integrações diretas Garmin/COROS/Polar.

---

## 5. COACHING CORE CONTINUA PLATFORM-AGNOSTIC

Não acoplar Coaching Intelligence ao HealthKit.

A arquitetura conceitual continua:

HealthKit
→ iOS platform adapter
→ canonical athlete/workout data
→ Coaching Core

O Coaching Core deve continuar trabalhando com representação canônica independente de plataforma/fabricante.

Preservar capacidades como:

- provenance;
- source identity;
- timestamps;
- freshness;
- partial data;
- missing data;
- conflicting observations;
- duplicates;
- corrections;
- canonical workout representation;
- capability-aware interpretation.

Não criar lógica esportiva como:

`if source == HealthKit`.

---

## 6. PREPARAÇÃO PARA ANDROID FUTURO

Não implementar Health Connect agora.

Porém, contratos e modelos genéricos não devem assumir que HealthKit será eternamente a única fonte possível.

A futura expansão deve poder seguir conceitualmente:

iOS:
HealthKit
→ platform adapter
→ canonical data

Android futuro:
Health Connect ou outra camada decidida futuramente
→ platform adapter
→ canonical data

→ mesmo Coaching Core.

Isso é extensibilidade arquitetural, NÃO escopo de implementação da V1.

Não criar abstrações complexas antecipadamente sem consumidor atual.

Aplicar Execution Proportionality & Anti-Overengineering.

---

## 7. GARMIN / COROS / POLAR

Permanece a decisão já registrada:

integrações diretas com:

- Garmin;
- COROS;
- Polar;

são:

`POST_V1 / V2`

Incluindo:

- OAuth/API;
- FIT vendor-specific;
- sync direto;
- structured workout;
- calendário;
- envio para relógio;
- partnerships/approvals.

Nenhum desses itens pode bloquear a V1 ou DOMAIN_COACHING_R7.

---

## 8. FIGMA

Não execute Design Reconciliation nesta tarefa.

A futura rodada de Figma deverá remover da V1:

- Garmin;
- COROS;
- Polar;
- Health Connect;
- Android-specific flows;
- structured-watch delivery.

A experiência V1 deve representar apenas o ecossistema iOS/Apple Health pertinente.

Não altere o Figma agora.

---

## 9. R7

DOMAIN_COACHING_R7 deve avaliar Coaching Core através de **canonical inputs**, não através de APIs ou fornecedores.

Pode testar diferenças de qualidade dos dados:

- rich;
- partial;
- sparse;
- stale;
- conflicting;
- duplicate;
- corrected;
- manual;
- imported/external.

Mas vendor-specific ingestion e HealthKit implementation NÃO fazem parte da competência esportiva do treinador e NÃO devem expandir a R7.

---

Registre estas decisões de forma aditiva/superseding nas autoridades apropriadas, preservando integralmente a história do R6.

Resolva `OPEN_PRODUCT_PLATFORM_QUESTION-1` como:

`RESOLVED — V1_IOS_ONLY`

Depois confirme:

`V1_PLATFORM_SCOPE = IOS_ONLY`

`V1_EXTERNAL_HEALTH_SOURCE = APPLE_HEALTH_HEALTHKIT`

`HEALTHKIT_INBOUND_V1 = REQUIRED`

`HEALTHKIT_WRITEBACK = OPEN_TECHNICAL_PRODUCT_DECISION`

`STRUCTURED_WATCH_DELIVERY = POST_V1`

`DIRECT_VENDOR_WEARABLE_INTEGRATIONS = POST_V1`

`ANDROID = POST_V1`

`COACHING_CORE_PLATFORM_AGNOSTIC = YES`

`R7_CAN_START_WITH_CANONICAL_INPUT = YES`

Não inicie DOMAIN_COACHING_R7 nesta tarefa.
