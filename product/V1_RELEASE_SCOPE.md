# Vilumo Fit — V1 Release Scope

<!-- EXPERIENCE_AUTHORITY_OVERLAY_START: EXP-AUTH-r1 -->
> **Authority overlay · 2026-10-22 · EXP-AUTH-r1.** Read through the [current index filter](../canon/CANONICAL_INDEX.md) / [DR-93–97](PRODUCT_DECISION_REGISTER.md). IN/OUT, depth of Run/Strength, first value, subscription, mobile/iPhone/iOS primary platform and valid behavioral/privacy/business constraints remain. Old destination names/placement, fixed levels, visual rules and handoff sequence are **LEGACY / SUPERSEDED AS ACTIVE UX AUTHORITY**. Progressive depth does not prescribe three levels or navigation. DR-91 qualifies previous blanket route exclusions; provisional Founder prices remain provisional, not absent/final. No capability/scope is added. Previous isolation metadata is historical after `32b7fb6`; draft overlay has no transferred PASS. Designer entry: [derived context](DESIGNER_PRODUCT_CONTEXT.md).
<!-- EXPERIENCE_AUTHORITY_OVERLAY_END: EXP-AUTH-r1 -->

<!-- NFV1_GATES_OVERLAY_START: NFV1-GATES-r1 -->
> **Founder decisions · 2026-10-24 · [DR-103–109](PRODUCT_DECISION_REGISTER.md).** V1 languages are PT-BR, EN and ES (transversal row updated). Prices shown in design are provisional, not Product Truth; post-expiry access stays G10. Taper/race week only under approved policy (ACF-G04). Sleep/HRV shown as values and observable context, never "normal/below" without an approved rule. Wearables row unchanged: Apple Health/HealthKit plus candidate watch routes (Garmin, COROS, Polar in AEC §5.1) under G06, ingest-first. Account-deletion timelines/legal text stay G07. Route display and sharing off by default; GPS recording permission is separate. No capability is added.
<!-- NFV1_GATES_OVERLAY_END: NFV1-GATES-r1 -->

<!-- V1_WEARABLE_SCOPE_OVERLAY_START: VWS-20261027-r2 -->
> **Founder decisions · 2026-10-27 · post-R6 product scope supersession · [DR-117–123](PRODUCT_DECISION_REGISTER.md).**
> - **Platform.** V1 is iOS only. Android is POST_V1 / FUTURE_PLATFORM_EXPANSION, considered after initial validation (DR-120).
> - **External source.** Apple Health/HealthKit; inbound is required. Vilumo takes only what is actually available and authorized, including activities from other devices that reach Apple Health, and missing data stays missing (DR-121).
> - **Write-back.** Writing app activities to HealthKit is an OPEN_TECHNICAL_PRODUCT_DECISION; it blocks neither R7 nor Coaching Core readiness.
> - **POST_V1 / V2.** Direct Garmin, COROS and Polar integrations: APIs, vendor OAuth, FIT/vendor-specific ingestion, two-way sync, partnerships. Structured workout, plan or calendar sent to any watch, Apple Watch/WorkoutKit included (DR-117, DR-122).
>
> This supersedes the 2026-10-24 line above, "Wearables row unchanged … Garmin, COROS, Polar … under G06". The wearables row, §3, §6 G06 and the transversal row were updated on 2026-10-27; pre-change text: [before/](../audits/v1-wearable-scope-2026-10-27/before/product/V1_RELEASE_SCOPE.md), r1 text: [r1/](../audits/v1-wearable-scope-2026-10-27/r1/product/V1_RELEASE_SCOPE.md). Generic external-data semantics stay V1, and the Coaching Core is platform-agnostic (DR-119, DR-123).
<!-- V1_WEARABLE_SCOPE_OVERLAY_END: VWS-20261027-r2 -->

Revisão **RS-1.3** · 2026-10-19 · **CANDIDATE_IN_ISOLATION / FREEZE-20261019-r1**.
Autoridade: [PTC-3.2.1](../canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md) C047–C056/L024; [PDR-1.3](PRODUCT_DECISION_REGISTER.md). O baseline Run/Strength [SIL](SPORT_INTELLIGENCE_SPEC.md) é input preservado. Esta é a única seleção atual de V1/V2; inventário de gaps permanece PDR §5. Estado de revisão e impacto em [registro freeze](../audits/v1-freeze-2026-10-19/MISSION_RECORD.md). Nenhum arquivo ativo do Claude é alterado.

## 1. V1 em uma frase

**Treinador premium para quem corre e treina força, coordenando as duas modalidades numa semana confiável para uma não sabotar a outra.** PREMIUM MULTISPORT TRAINING INTELLIGENCE PRODUCT; wedge RUN + STRENGTH, sem promessa de todos os esportes. Specialist Parity + Cross-Sport Superiority é target sujeito a validação, não desempenho já provado.

## 2. IN — superfície pequena, profundidade real

| Capacidade | V1 / obrigação | Limite |
|---|---|---|
| Run + Strength | Especialistas de primeira classe, um Athlete Model/plano; prescription/progression/programming/performance/exercise/recovery/analytics conforme SIS/RIL/STIL. | Ambos críveis na cobertura G01/G02; sem dose igual ou feature parity. |
| Goal hierarchy | RUN_FIRST, STRENGTH_FIRST ou BALANCED/HYBRID e objetivos concretos por esporte. | Balanced é coprioridade; ASK mínimo para sacrifício material sem acordo; sem default secreto. |
| Semana | Proposta coordenada inicialmente boa, explicação Run × Strength e adoção explícita. Plano é compromisso, não previsão descartável. | Nova evidência não implica nova semana; guards de autoridade/safety e qualidade AEC/AEOS. |
| Stable adaptation | Learn-only/KEEP primeiro; necessidade material, Change Cost, hysteresis e stickiness da próxima sessão; Minimum Effective Change. | Sem números inventados, safety/invalidade imediata, nunca preservar plano proibido. |
| Execução | Running por etapas/targets válidos e tempo/avanço; Strength exercício/séries/reps/carga/RIR/RPE/descanso, correção/substituição elegível, mínimo de fricção. | App-first Strength; sensores/GPS/FC quando comprovados/consentidos. Fallback tempo/registro informado explícito, sem mapa/traçado V1. |
| Post-workout | Poucos sinais opcionais com consumidor decisório real; mostrar aprendizado quando pertinente. | Não questionário diário, nem evento promocional de adaptação a cada sessão. |
| Progressive Depth | Level 1 Orientation, Level 2 Progress (Running/Strength/Overall), Level 3 Deep Dive. | Analytics profundos acessíveis, não impostos no Hoje; faltas/derivados/estimativas claros. |
| External Shareability | Famílias C054: treino, PR, prova, milestone, semana, evolução, streak pessoal, recap, conquista híbrida; próprios fatos de distância/volume/força elegíveis. | Sem rede/grupo, sem post automático, comparação como mérito, dados privados de saúde/terceiros/localização. Quantidade de templates aberta. |
| Subscription | Value before hard ask: prévia coordenada e valor → paywall → treino sob entitlement válido. | Sem preço/trial definido, billing implementado ou créditos/economia interna. Recusa não perde dados/direitos/registro em curso. |
| Wearables | Apple Health/HealthKit (iOS) é a camada externa de saúde/atividade da V1: ingestão/reconciliação confiável do que estiver efetivamente disponível e autorizado, inclusive atividades de Apple Watch, Garmin, COROS, Polar ou outros apps/devices quando chegarem ao Apple Health (DR-118). Proveniência, dedupe, conflito, correção, parcial/unknown e manual × importado continuam semântica de domínio (DR-119). | Sem integração direta com fabricante (API/OAuth/vendor linking, ingestão FIT/vendor-specific, parceria), sem structured workout, plano ou calendário enviado ao relógio e sem sync bidirecional: V2/POST_V1 (DR-117). Não presumir a riqueza da fonte original (exercício, séries, reps, carga, estrutura de intervalos, campos proprietários); dado ausente continua ausente. HealthKit inbound é obrigatório; gravar no HealthKit atividades do próprio app é OPEN_TECHNICAL_PRODUCT_DECISION (DR-121; LAC-21), sem bloquear R7/Coaching Core. |
| Nutrition apoio | Somente leve contextual existente com conteúdo elegível e custo baixo; pode ser omitido quando faltar aprovação. | Sem módulo/superfície adicional, dose individual, suplementos, logging/macros/dieta. |
| Transversal | Brasil, PT-BR+EN+ES (ES por DR-103, Founder 2026-10-24), **somente iOS** (DR-120, Founder 2026-10-27; Android é POST_V1 / FUTURE_PLATFORM_EXPANSION, considerado após a validação inicial, sem Health Connect, requisito ou paridade Android na V1), 18+; **plataforma de produto/design: mobile / iPhone / iOS** (tablet e web não dirigem a arquitetura visual da V1; Founder 2026-10-19, UXS §24.1), caminho solo completo, offline/erros/consentimento/direitos honestos. | No implementation/release claim. Sem wearable, Crew, conversa ou share obrigatório. |

## 3. OUT / roadmap DEFERRED, NOT REJECTED

Crew inteira e papéis M2/M3, grupos privados, membership/convites, check-ins/apoio sociais, metas coletivas, desafios/campanhas/streaks de grupo e competição interna ficam pós-validação. A tese social e direitos/limites futuros do Canon permanecem; não construir hub, tabs, convite, placeholders ou onboarding social na V1. Feed público/follower graph/audiência continuam proibidos pelo Canon, não promessa de expansão.

Nutrition completa (calorias/diário/macros/meal planner/banco alimentar/logging) é DEFERRED. Cycling/Swimming/outros esportes são possibilidades sem prazo, sob paridade especialista antes de suporte pleno. Chat de IA genérico, canal conversacional, agentes visíveis, gamificação profunda, marketplace/coaching marketplace, dezenas de integrações, app nativo em todos os relógios, dashboard excessivo e insights em toda tela ficam OUT. Explainer futuro opcional permanece contrato separado, sem autoridade.

**V2 / POST_V1 (DR-117, Founder 2026-10-27):** integrações diretas com fabricantes de wearables — Garmin, COROS e Polar API direta; OAuth/vendor account linking; ingestão FIT/vendor-specific; structured workout export para relógios (inclusive Apple Watch); envio direto de treinos, plano ou calendário ao relógio; sync bidirecional específica de fabricante; approvals/parcerias de fabricante. A especificação outbound existente fica preservada como backlog, inerte na V1. **Android** (com Health Connect ou outra camada) é POST_V1 / FUTURE_PLATFORM_EXPANSION, considerado após a validação inicial (DR-120). Reentrada exige decisão de scope própria.

**Anti-bloat:** capacidade removida é realocada à qualidade do núcleo, execução, onboarding, analytics, visual, performance/confiabilidade; não a outra feature. Nenhuma expansão é automaticamente chamada V2 aprovada/data prometida: reentrada depende de validação do produto, evidência e decisão de scope.

## 4. Experiência e qualidade que orientam Visual/UI

Primeiro valor: objetivo → prioridade → experiência → dias e turnos por esporte → restrições/equipamento/dados mínimos (no aparelho) → conta (DR-111) → Athlete Model → raciocínio Run+Strength → semana/proposta → explicação factual de coordenação → prévia de valor → oferta → adoção/treino. Fora da cobertura, mostra limite/próximo passo, não plano fictício. Gerar não aplica; pagar não confirma plano.

Priorizar nove classes de trabalho, não nove tabs/telas obrigatórias: onboarding; Today; Week/Plan; execução; post-workout/check-in pessoal; Progress/Analytics; shareable; perfil/settings necessário; paywall/subscription. Hoje responde “o que faço agora?”, semana permite organizar a vida; deep analytics vivem em Progresso. Plano não muda por ruído nem por cada treino finalizado.

**SMALL PRODUCT SURFACE, PREMIUM EXECUTION:** premium/moderno/diferenciado, dark-first com light mode, polimento/personalidade, confiança, motion/microinterações úteis e velocidade operacional. Reduzir escopo para aumentar qualidade, não adotar UI barata/genérica. Nenhuma paleta/layout/quantidade de componentes é decidida neste freeze.

## 5. Analytics e shareability — cobertura preservada

Running: volume/frequência, pace/RPE/FC/zonas quando confiáveis, distribuição de intensidade, longões/sessões-chave, aderência/capacidade/carga/tendências/histórico/ciclos/comparação/resposta ao treino. Strength: séries/reps/carga/volume/RIR/RPE, PR/progressão, volume/frequência por grupo, performance por exercício/tendência/recuperação/aderência/histórico. Multisport: distribuição semanal, consistência, exposição combinada sem unidade fictícia, relações/interferência e recuperação/aderência ao híbrido com evidência/limites.

Métrica observada ≠ estimativa ≠ causalidade. Sem regra comparável, tendência/capacidade/recuperação permanecem indeterminadas; sem converter km↔séries ou correlacionar e chamar causa. Detalhamento e campos nos especialistas e UX, não novo doc de analytics.

Share produz conquista/evolução/identidade com qualidade Vilumo, não screenshot cru. Famílias/eventos não obrigam sequência de posts nem gamificação. Semana/streak pessoal incluem honrar descanso/adaptação; desconhecido não é fracasso ou sucesso. Destinos externos usam cópia escolhida/OS share sheet; sem APIs sociais ou acesso a conta/audiência. Modelo de allowlist/consentimento em PA §7 / UX §16.

## 6. Dependências existentes por etapa

PDR §5 continua único owner/prova/trigger de G01–G11. G01–G04: receitas/qualidade/aderência/safety reais, incluindo materialidade/hysteresis/stability/priority Balanced e comparabilidade; G05: conteúdo Nutrition se entrar; G06: na V1, prova da rota Apple Health/HealthKit (tipos de dado, permissões, leitura opaca, janela de histórico, fidelidade por tipo) e dos sensores do telefone antes de claim dependente; rotas de fabricante e outbound são POST_V1 (DR-117); G07: finalidade/dados/retention e share permitidos; G08: 18+/conta, social adiado; G09: execução/entitlement/guarda/idempotência; G10: oferta comercial/terms antes de cobrar, já decidido subscription/value-first; G11: efeitos/paridade/comercial dependem prova. Não inventar limiar/price/provider ou esperar esses detalhes para desenhar estados coerentes.

## 7. Aceitação e próximo passo

Auditoria A–Y da missão em [registro/checks](../audits/v1-freeze-2026-10-19/MISSION_RECORD.md), sem novo ciclo de discovery. Alterações intencionais supersedem Crew-V1 e outbound-launch obrigatório; baseline e gate corrente do Claude permanecem prova dos inputs originais. Após gate: sync deste patch (inclui SIL caso ainda não aplicado), somente conflitos materiais posteriores + checks mínimos e **Visual/UI diretamente**, conforme autorização Founder C056. Nenhuma tela/código é produzido aqui.
