# Vilumo Fit — Product Architecture

<!-- EXPERIENCE_AUTHORITY_OVERLAY_START: EXP-AUTH-r1 -->
> **Authority overlay · 2026-10-22 · EXP-AUTH-r1.** This is a mixed historical architecture, not the new design's required structure. Under [DR-93–97](PRODUCT_DECISION_REGISTER.md) and the [index filter](../canon/CANONICAL_INDEX.md), destination inventory, hierarchy, navigation, entry/screen composition, placement and old alternative selections are **LEGACY / SUPERSEDED AS ACTIVE UX AUTHORITY**. Data/authority boundaries, canonical object references, independent agency/discoverability/state principles, entitlement and privacy/share allowlist—including the existing DR-91 route/photo restrictions—remain binding. No new surface or Figma solution follows from this annotation. Previous isolation metadata is historical after `32b7fb6`; no current gate is inferred. Clean designer path: [derived context](DESIGNER_PRODUCT_CONTEXT.md).
<!-- EXPERIENCE_AUTHORITY_OVERLAY_END: EXP-AUTH-r1 -->

Revisão **PA-1.3** · 2026-10-19 · **CANDIDATE_IN_ISOLATION / FREEZE-20261019-r1**.
Autoridade: [PTC-3.2.1](../canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md), [Scope RS-1.3](V1_RELEASE_SCOPE.md), [PDM-1.3](PRODUCT_DOMAIN_MODEL.md), [AEC-1.3](ADAPTIVE_ENGINE_CONTRACT.md). Delta Founder em [registro](../audits/v1-freeze-2026-10-19/MISSION_RECORD.md). Substitui só nesta cópia os consumidores anteriores; não reabre o gate UXSPEC ativo do Claude. Estrutura de produto, não layout/design system/código.

## 1. Outcome e responsabilidades

Run + Strength coordenados em uma semana confiável, execução rápida, evolução mensurável e qualidade visual premium. SMALL PRODUCT SURFACE, PREMIUM EXECUTION; menos interface, mais decisão. A remoção de Crew realoca capacidade à qualidade, sem substituí-la por feature adjacente. External share é output voluntário, não rede interna.

## 2. Destinos lógicos e entradas

| Destino | Pergunta / papel |
|---|---|
| Hoje | O que faço agora? Seleciona próxima ação/sessão, contexto mínimo, estado da semana, mudança material e evolução só quando relevante. Não possui plano/cópia de contexto. |
| Plano / Week | Semana/horizonte integrado Run × Strength e descanso, relações entre sessões, preparação/execução, revisões/diferenças e proposta quando necessária. |
| Progresso | Histórico/analytics pessoais por Running, Strength e Overall/Multisport; comparação e deep dive sob demanda. |
| Você | Contexto/objetivos/prioridades/disponibilidade/equipamento, conta, privacidade/direitos, integrações, idioma/unidades e assinatura/settings mínimos. |

Onboarding, post-workout/check-in **pessoal**, shareable e paywall são fluxos/contextos dos objetos existentes; não novas tabs obrigatórias. Nenhum destino Crew, feed, comunidade, social page, hub Nutrition ou agentes. Entradas V1: adoção pessoal, abertura diária, aviso sobre objeto próprio, retorno após pausa. Brasil/PT-BR+EN+ES (DR-103)/iOS+Android/18+ preservados. Entrada por convite/membership é diferida com Crew.

**AR-01:** Hoje seleciona, não duplica. **AR-02:** referências/nomes funcionais estáveis, sem trocar lugar por personalização; não fixa tabbar. **AR-03:** plano/decisão, execução e realizado têm owners/revisões distintos na mesma sessão. **AR-04:** repetir realizado prepara nova sessão, sujeita a contexto atual.

## 3. Objetos e caminho canônico

| Objeto / owner | Caminho / outras entradas |
|---|---|
| Plano, decisão, trace/proposta/adequacy e HOLD | Plano→decisão; Hoje/avisos abrem mesma referência. HOLD não cria destino. |
| Sessão planejada/executando/realizada e export opcional | Sessão, alcançável em Plano/Hoje/Progresso; exercício/step preserve modalidade e versão executada. |
| Athlete Model/contexto/GoalPriority | Você→contexto, com edição pertinente a partir de Plano. Um perfil, não um por modalidade. |
| Recovery/contexto do dia | Plano/contexto e entrada em Hoje/Sessão; tendência sob Progresso; privacidade em Você. |
| Histórico/PR/marco/analytics | Progresso, origem de detalhes e share; Hoje pode selecionar insight material de orientação. |
| Insight Nutrition leve elegível | Preparação da sessão/revisão, sem galeria, módulo ou coleta extensa. |
| Integração/capability/permissão | Você→Integrações; estado relevante na Sessão/Hoje. Ingest-first; export só por rota admissível, sem projeto nativo de relógios. |
| Shareable/projeção | Fluxo sobre treino/resultado/marco/semana, prévia e cópia por ato; registro pessoal em Você→Privacidade. |
| Subscription/entitlement | Paywall após prévia de valor; gerir/restaurar oferta/assinatura em Você. Não é consentimento, adoção de plano ou modo social. |

## 4. Hierarquia, estabilidade e progressive depth

**AR-05:** P0 safety/restrição material retém imediatamente recomendação/efeito afetado, sem apagar registro/direitos ou bloquear conta. Proposta nunca altera silenciosamente sessão iniciada. Fora de P0: execução/ação atual e semana antes de reflexão/configuração. Sem item social P3.

Hoje responde rapidamente ação/semana/mudança/evolução; não tenta provar toda a inteligência. Week é contrato de confiança: distribuição legível, relações Run × Strength, versão e diferença só quando mudança acontece. Atualizar Athlete Model/validade não muda conteúdo. AEC/AEOS escolhem Level0 antes de adaptação, consideram Change Cost/hysteresis/stickiness e só propõem menor intervenção necessária. UX manifesta resultado oficial, sem filtrar decisões ou criar thresholds.

**Progressive Depth:** L1 Orientation mostra poucos sinais sustentados; L2 Progresso organiza Running/Strength/Overall; L3 Deep Dive acessa métricas e fatos das specs, contexto/comparabilidade/limites e comparação entre períodos. Dado bruto/observado, estimativa e inferência são distintos. Sem política, carga “adequada”, recuperação/capacidade/tendência permanecem indeterminadas. Não somar km e séries nem fazer placar de volume.

## 5. Jornadas principais e controles preservados

**AR-06:** tarefas frequentes têm caminho direto: iniciar/pausar/avançar/registrar/corrigir/concluir/descansar, disponibilidade/retorno e export opcional sem conversa. **AR-07:** Recovery parte do núcleo, sem score obrigatório; Nutrition só apoio leve elegível, zero módulo novo ou dose individual.

**AR-08:** domínio → workout neutro → adapter → provider; sessão é do Vilumo, ingestão não dá prescrição externa; Strength app-first. **AR-09:** offline/unknown/transport/device/observação separados; reconciliação/correção/supressão e guardas AEC/AEOS permanecem, sem retry cego/clearance por override. Smartphone tempo/manual é ramo explícito; métricas de sensores/GPS/FC dependem capability e finalidade comprovadas, sem mapa/traçado V1.

Primeiro uso produz semana/proposta + explicação de coordenação (C052), mostra valor e paywall transparente, adota sobre versão atual quando entitlement permitir. Falha/recusa comercial não inventa sucesso ou prescrição, não apaga contexto confirmado e não bloqueia direitos/registro. Produto pronto e preço/oferta não são fatos inferidos de bibliografia.

## 6. Crew — roadmap, DEFERRED, NOT REJECTED

AR-10–AR-14 (Crew/compromisso/reconhecimento/vínculo/convite/apoio) deixam de ser estrutura V1; seu conteúdo anterior é recuperável no commit SIL. L010–L012/C025 mantêm parâmetros/direitos/limites da expansão futura, sujeitos a validação e scope autorizado. Sem M3, grupos, notificações sociais, convite público, gráfico social, competição ou contatos agora. External Shareability não exige esses objetos. Feed público/follower graph continua proibido, não promessa de V2.

## 7. Shareable Object Model — V1 próprio / externo

**AR-15:** compartilhar nasce do objeto elegível, com narrativa de conquista/evolução/identidade e qualidade Vilumo; não screenshot cru do contexto privado. Eventos: treino, PR, prova, milestone, semana, evolução/força, streak pessoal, recap, conquista multiesporte; distância/volume próprios elegíveis, nunca mérito por fazer mais. Uma família pode reutilizar expressão visual; número de templates é design space.

Payload allowlisted: objeto/revisão e fato próprio, modalidade, narrativa/identidade escolhidas, valores próprios verificados/declaração identificada de distância/duração/pace/splits sem horário/ganho de elevação acumulado/estrutura da sessão/reps/meta; exercícios/carga/séries/volume/levantamento principal/PR/evolução, quando aplicáveis e escolhidos. Derivado aprovado claramente estimado, sem fonte/modelo desconhecido. Cada inclusão é visível na prévia e pode ser omitida. Não exportar FC/HRV/RPE/RIR/recovery/sono/Health/Nutrition, motivo de adaptação/limitação, peso corporal, horário, coordenadas/endereço/nome de lugar/altitude absoluta, terceiros/Crew, conta/IDs internos/token ou metadados ocultos (EXIF/GPS/XMP). Rota entra só como traçado abstrato aparado, por escolha explícita a cada artefato, desligada por padrão (UXS SHR-09; Founder 2026-10-20); foto só a escolhida, reexportada sem metadados (UXS SHR-10). Duas famílias: card completo e overlay sobre foto. Composição e renderização no aparelho; compartilhar não exige upload ao servidor. Nenhuma inferência de saúde embutida em título/alt-text/nome do arquivo/metadata. Progresso verdadeiro não afirma causalidade/segurança.

Streak e semana elegíveis incluem honrar descanso/adaptação conforme critério aprovado, não volume ou treino diário obrigatório. Unknown impede declarar conquista não demonstrada; manter resumo honesto/sem claim quando necessário. Corrigir fato invalida nova prévia dependente; cópia já enviada preserva limite externo, sem recall.

Fluxo: escolher objeto/campos → artefato premium → prévia exata e destino → ato explícito → OS/native share sheet ou entrega de cópia em formato compatível. Instagram Stories/WhatsApp/TikTok são possíveis ambientes externos, sem API/social-login/upload automático/analytics de audiência. Cancelar/recusar share não perde valor. Leitura de treino/saúde ou assinatura nunca consente share. Sem feed, galeria pública, ranking ou prompts dominantes. Registro pessoal de projeção mínimo e finalidade/retention G07.

> **Growth Layer · 2026-10-29 · GRW-20261029-r1 · [DR-124–132](PRODUCT_DECISION_REGISTER.md).**
> - **AR-15 is also an acquisition capability (DR-126):** result, PR/milestone, weekly summary, evolution, map or route (DR-133), complete card, transparent overlay and Stories formats, with discreet branding, all inside the allowlist above.
> - **Map share (DR-133, Founder r2)** supersedes, for external shareables only, the sentence above that the route enters "só como traçado abstrato aparado".
>   - **Options:** Map (real map + protected route), Route (trace, no map), Photo/Overlay, and no route.
>   - **Protection:** the first and last 200 m are hidden by default and can be edited per activity before sharing.
>   - **Pipeline:** raw GPS → privacy filtering → share-safe geometry → map/artifact rendering → external share, composed on the device. Raw GPS never enters the share mechanism or an export, and the private activity keeps its full data.
>   - **Map provider:** receives at most the share-safe area and is a recipient to declare (DR-109, G07).
>   - **Still excluded:** place names, addresses, coordinates and times as fields and metadata.
>   - **Privacy Zones:** planned, with no infrastructure now.
> - **Consistency facts follow DR-127:** no naive daily streak; adherence % stays out until G03 and an allowlist decision.
> - **Minimal referral (DR-129)** is an architectural provision, not a structure to build now: a personal referral link/code, the invite's origin, a referral → signup record and a hook for a future reward (G10). It is commercial attribution, never a social link, graph or Crew invite (§6). No contact access, no view of the other person, and pre-account data stays on the device (DR-111).
> - **Attribution** (share generated → share completed → external visit → signup/install) is future and first-party: no imported audience metrics or viewer identity. A link/code enters an artifact only as a visible, removable field, added to the allowlist after Product/UX + Security and G07.
> - No analytics or referral infrastructure exists before a real consumer (DR-132).

## 8. Subscription, estados e direitos

Subscription-first é orientação de UX, não arquitetura de billing. Antes do hard ask, prévia de semana coordenada e benefício legível. Oferta exibe modalidade/plano comercial/trial/condição/preço/renovação/cancelamento quando efetivamente definidos; placeholders em exploração sem fingir oferta real. Trial/mensal/anual/timing/price são testáveis. Gerir/restaurar estado comercial com prova, sem assinatura inferida de clique/timeout ou sucesso no provider sem verificação.

Entitlement condiciona nova geração/adoção/execução prescrita conforme oferta aplicável; registrar/corrigir/fechar sessão já em curso e acessar próprios dados/direitos não são sequestrados por expiração/cancelamento. Não alterar treino no meio, nem restaurar plano inválido. Falha de compra é estado comercial, não falha do atleta, consentimento ou HOLD médico. Read/write/share/secondary use continuam permissões separadas.

## 9. Verificação do delta / alternativas

Escolhas: quatro referências funcionais e fluxos transitórios em vez de tabs para features; analytics profundos em Progress, não no Hoje; weekly adequacy antes de recalcular; preview de valor antes de cobrança; Crew depois da validação, external share agora. Nenhuma alternativa exige redesign dos controles de execução/HOLD/versionamento já revisados.

Pareceres/gate por hashes em [registro freeze](../audits/v1-freeze-2026-10-19/MISSION_RECORD.md); esta descrição não aprova a si. PDR G01–G11 concentra provas profissionais/implementação/retention, sem novos docs de monetização/analytics/onboarding. Após gate atual + sync, C056 autoriza seguir diretamente ao Visual/UI premium. Sem tela, Figma ou código nesta entrega.
