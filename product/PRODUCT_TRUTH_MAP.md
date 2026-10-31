# Vilumo Fit — Product Truth Map

<!-- EXPERIENCE_AUTHORITY_OVERLAY_START: EXP-AUTH-r1 -->
> **PTM-1.3 authority overlay · 2026-10-22 · EXP-AUTH-r1.** Source **S10** = [current direct Founder request](../audits/experience-decontamination-2026-10-22/FOUNDER_REQUEST.md), DECIDED / CURRENT_PRODUCT_DECISION; [DR-93–97](PRODUCT_DECISION_REGISTER.md) records scope and impact. This source supersedes experience authority only: all product/domain semantics and invariants remain. The [index responsibility map](../canon/CANONICAL_INDEX.md) selects A product/domain, B independent behavioral principles and C legacy prescriptions; retained migration/history below cannot revive old IA/style, fixed levels or design locks. Previous isolation metadata is historical after integration `32b7fb6`. This overlay is the PCG draft for review; no prior PASS is transferred. The [designer view](DESIGNER_PRODUCT_CONTEXT.md) is derived, not a second Product Truth.
<!-- EXPERIENCE_AUTHORITY_OVERLAY_END: EXP-AUTH-r1 -->

<!-- V1_WEARABLE_SCOPE_OVERLAY_START: VWS-20261027-r2 -->
> **Traceability · 2026-10-27 · post-R6 product scope supersession.** Source **S-VWS** = the current direct Founder requests [r1](../audits/v1-wearable-scope-2026-10-27/FOUNDER_REQUEST.md) and [r2](../audits/v1-wearable-scope-2026-10-27/FOUNDER_REQUEST_R2.md), DECIDED / CURRENT_PRODUCT_DECISION, recorded as [PDR DR-117–123](PRODUCT_DECISION_REGISTER.md).
> - **THESIS_CONFLICT-VWS-01.** Source A is C040, C055 and O016 (V1 structured export as a per-route option, conditional outbound, third-party provider, vendor/device matrix) together with DR-58/68/83/107. Source B is the later Founder decision. The same competent decisor narrows V1 to Apple Health/HealthKit inbound on iOS, with write-back open, and moves direct manufacturer integrations and watch outbound, Apple Watch included, to V2/POST_V1.
> - **Platform supersession (not a thesis conflict).** The thesis leaves platform to the PDR (§14). DR-120 replaces the V1 platform part of DR-47/DR-103 (iOS+Android) with iOS only; Android is POST_V1 / FUTURE_PLATFORM_EXPANSION. The S3 row below keeps the historical Founder answer.
> - **Resolution.** A V1-only supersession, annotated next to C055 and in PTC §6. Clause text and history stay. The VFT-C040 row below keeps its meaning for future routes, and its V1 part is read through DR-117/118. The VFT-O016 row's V1 part narrows to HealthKit data types, permissions and fidelity. C012/C034/L009/L014 and all invariants are unchanged.
> - **Dependents.** RS wearables row/§3/§6, AEC §5 overlay, PDM boundary, UXS overlay, designer context, index pointer.
> - **Resolved.** OPEN_PRODUCT_PLATFORM_DECISION-01 is RESOLVED — V1_IOS_ONLY (DR-120). Open: HealthKit write-back (OPEN_TECHNICAL_PRODUCT_DECISION, DR-121).
<!-- V1_WEARABLE_SCOPE_OVERLAY_END: VWS-20261027-r2 -->

<!-- GROWTH_LAYER_START: GRW-20261029-r1 -->
> **Traceability · 2026-10-29 · Growth Layer.** Source **S-GRW** = the current direct Founder requests [r1](../audits/growth-layer-2026-10-29/FOUNDER_REQUEST.md) and [r2](../audits/growth-layer-2026-10-29/FOUNDER_REQUEST_R2.md), DECIDED / CURRENT_PRODUCT_DECISION, recorded as [PDR DR-124–132 and DR-133](PRODUCT_DECISION_REGISTER.md). Same competent decisor as S8, later in time; ASSUMED for effects.
> - **GRW-01 · C003, bounded reformulation.** "Aquisição, conversão e retenção são hipóteses" becomes: distribution is a deliberate product capability (DR-124). Effects stay H002/H007; "aquisição por audiência" stays a non-goal.
> - **GRW-02 · C054 / AR-15 / UXS SHR-01, SHR-07, SHR-12.** "Personal streak" reads as plan-adherence consistency, and naive daily streaks are prohibited (DR-127). SHR-12's V1 exclusion of milestone, streak and broad recap is superseded (DR-126, DR-127).
> - **GRW-03 · C041 / PDM I4, I5, I8 / RS §3 / SHR-03 / CF F08 "convites".** Not a conflict: these defer Crew invites. A product referral (DR-129) creates no social link or graph and stays inside them.
> - **GRW-04 · "corrida com mapa/rota" vs DR-91, DR-109, PA §7, SHR-06/09, L014. Resolved by the Founder (r2, DR-133).** Real maps are allowed in external shareables of GPS activities under Map Share Privacy:
>   - user-initiated, exact preview, no automatic sharing;
>   - first and last 200 m hidden by default, editable per activity;
>   - raw GPS never enters sharing, and the private activity is unchanged.
>
>   For external shareables only, DR-133 supersedes DR-91's abstract-only trace and fixed cut, SHR-09's 500 m cut and no-map clause, and PA §7's abstract-only sentence. It qualifies the location exclusions of the PDM Shareability row, EM §6 and CF F10/S12 for the chosen protected map/route only. Textual place, address, coordinate and time exclusions stay, as do DR-109's "Rotas no app" and map-provider-as-recipient. L014 is met, not edited. r1 had resolved this conservatively (no background map); that reading was never applied.
> - **GRW-09 · DR-133 point 3 (editable protection) vs point 13 (no residence exposure).** Open: which protection values a person may choose, including whether protection may be turned off entirely, is set by Product/UX + Security before implementation.
> - **GRW-05 · future attribution vs PDM I9 / SHR-08 "atribuição individual".** Planned only (DR-126): first-party, never imported audience data or viewer identity, and any link/code is a visible opted-in field. I9 and SHR-08 bind until the open privacy model (Product/UX + Security, G07) is decided.
> - **GRW-06 · "91% de aderência" vs UXS §16.1 / PA §7.** In-app consistency labels wait for G03; adherence % stays out of share artifacts until G03 and an allowlist decision (DR-127).
> - **GRW-07 · North Star vs O001 / G03 / L016 / L020.** The concept is decided (DR-132); unit, window, denominator and "sufficient" stay open. Honored rest, reduction and HOLD count as completion.
> - **Dependents.** Thesis notes (C003, C041, C054), RS §2/§3, PA §7, PDM overlay, designer context, index pointer. EM, CF, UXS, AEC, AEOS, AESL, SIS, RIL and STIL are read through DR-124–132 and not edited. No invariant and no training rule changes.
<!-- GROWTH_LAYER_END: GRW-20261029-r1 -->

| Campo | Valor |
|---|---|
| Revisão | **PTM-1.2** · 2026-10-19 |
| Estado | **CANDIDATE_IN_ISOLATION**; publicação anterior preservada no baseline; este amendment tem reviews/handoff próprios. |
| Owner / autor desta consolidação | Product Constitution & Governance / Codex PCG worker; Product/UX mantém as traduções estruturais downstream. |
| Autoridade | Subordinado ao `canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md`, **VILUMO-PTC-3.2.1** (candidate isolado). É índice normativo/de impacto: não cria doutrina, não substitui o contrato e não é segunda Product Truth. |
| Previous revision | PTM-1.0 (2026-10-14), recuperável no baseline Git SIL; linhagem anterior PTM-0.5.1 (2026-10-11), preservado em `governance/snapshots/2026-10-14-pre-3.0.0/product/PRODUCT_TRUTH_MAP.md`. Traduzia 2.2.0; o gap de ingestão de 2.3.0 é resolvido nesta consolidação. |
| Task / inputs | FREEZE-20261019-r1; fontes S0–S9 abaixo; SIL e RB-3.0.0-r1 como baselines preservados. evidence_policy=doctrine_audit. |
| Consumidores | PDM; Product Architecture; PDR; V1 Release Scope; Experience Model/Core Flows; CURRENT_MISSION e handoff para Claude. |
| Limite dos gates | PASS históricos referem-se somente a versões anteriores. Este mapa não declara gate de arquitetura, segurança implementada, UI, Figma, lançamento ou validação de mercado. |

## 1. Fontes, classificação e precedência

| Ref | Fonte e data | Autoria / autoridade | Uso e limite |
|---|---|---|---|
| S0 | [PTC-2.3.0 preservado](../governance/snapshots/2026-10-14-pre-3.0.0/canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md), 2026-10-11; registro anterior no índice preservado. | PCG autor; Founder estratégico; publicação registrada nos audits 2.3.0. | Autoridade herdada para conceitos ainda válidos. Não é autoridade atual nos deltas superados. Não foram consultados projetos externos anteriores. |
| S1 | [Sports Founder decision](../audits/claude-canon-update-2026-10-10/sports-founder-decision.md), decisão 2026-10-09. | Founder bruto local. | Proveniência de C023/C024/D011/L023 anteriores. S6 substitui o mínimo de quatro e sua dívida de expansão; L023 permanece. |
| S2 | [Shareability Founder decision](../audits/claude-canon-update-2026-10-10/shareability-founder-decision.md), 2026-10-09. | Founder bruto local. | C016–C022/D010/C026/C027: capability e limites, exemplos não obrigatórios. A relação com dois pilares é superada por S6. |
| S3 | [Founder Gate Phase 3](../audits/phase-1-3-reviews/founder-gate-phase3-decisions.md), 2026-10-10. | Founder respostas brutas; notas/research Chief distinguíveis. | FG-2 fixa fronteira, até 3 Crews/~8 pessoas. FG-3 baseline social básico compatível; aprofundamento posterior obrigatório não persiste após S6. PLT mantém iOS/Android; relógios apenas fontes é superado por S6. MKT mantém Brasil/PT-BR+English/18+. Comparações de apps são históricas, sem revalidação de fatos nesta missão. |
| S4 | [Hybrid Founder decision](../audits/founder-decisions/2026-10-11_hybrid-experience-founder-decision.md), 2026-10-11. | Founder texto bruto; grounding Chief não é doutrina. | Princípios híbridos preservados; quatro esportes e exemplo alimentar seguem limites de S6. Não autoriza copiar Pierre ou lançar toda capability. |
| S5 | [RA3 review](../audits/canon-2.3.0-reviews/DOCTRINE_EVIDENCE_REVIEWED_r1.md) + [DI4 review](../audits/canon-2.3.0-reviews/DOCTRINE_INTERPRETABLE_r1.md), 2026-10-11. | Judges independentes históricos. | Findings de precisão informam correção; não concedem estratégia nem PASS nesta revisão. |
| S6 | [REBASELINE_RECORD](../audits/rebaseline-3.0.0/REBASELINE_RECORD.md), pedido direto literal 2026-10-14. | Founder desta sessão; síntese/routing Chief identificados separadamente. | Autoridade atual do delta completo, preservação, missão documental, inovação/loop; preview de ChatGPT é contexto importado sem autoridade adicional. |
| S7 | [Pedido direto Founder 2026-10-19](../audits/specialist-layers-2026-10-19/FOUNDER_REQUEST.md) + [registro SIL](../audits/specialist-layers-2026-10-19/MISSION_RECORD.md) | Founder decide; Codex formaliza em isolamento. | C045/C046 e links C024/C042/C043; conversa referenciada é contexto, não evidência de concorrentes nem autorização de UI agora. |

| S8 | [Pedido Founder de freeze](../audits/v1-freeze-2026-10-19/FOUNDER_REQUEST.txt), 2026-10-19. | Founder direto; Codex formaliza. | C047–56/L024 e supersessões V1, sem prova empírica. |
| S9 | [Adendo Training Doctrine](../audits/v1-freeze-2026-10-19/TRAINING_ADDENDUM.md), mensagem direta posterior na mesma sessão. | Founder decide; registro estruturado, não transcrição científica. | C057–61/AEC/SIS/RIL/STIL: fundamentos/cadência/razões/consistência/claims, sem pesquisa nova/gate Visual. |

Precedência: decisão humana atual explícita → contrato formalizado e publicado conforme gates → decisões não conflitantes já aceitas → tradução downstream. Referência, exemplo, hipótese, auditoria ou presença de arquivo não concede autoridade. Antes de publicação, S8/S9 governam o delta atual como decidido, preservando S0–S7 não conflitantes; o índice controla o estado do artefato.

- **L / LOCKED_INVARIANT:** DECIDED: 22 anteriores herdados de S0; L024 novo explicitamente decidido por S8, sem mudar texto dos anteriores.
- **C / CURRENT_PRODUCT_DECISION:** DECIDED, Founder por S0–S4/S6–S9 conforme cada linha; traduções subordinadas têm autoria distinta rastreada; vale no escopo atual, sem congelar para sempre a V1.
- **D / DESIGN_SPACE:** DECIDED, permissão/limite aprovado; execução dentro dele segue owner competente, não feature obrigatória.
- **H / HYPOTHESIS:** ASSUMED, confiança não validada; S0 ou S6 é origem da aposta, não evidência de efeito. Não há claims empíricos promovidos a invariantes.
- **O / OPEN_QUESTION:** OBSERVED, lacuna documental/decisória verificada nos contratos locais, confiança alta quanto à ausência registrada, limitada ao repo consultado; não prova impossibilidade técnica. Resoluções O006/O012 são DECIDED. Contraevidência possível: futura decisão/contrato rastreável; só então atualizar o estado.

As tabelas seguintes dão ID, destino/seção integral, fonte/autoridade, racional/alcance e dependentes para **cada um dos 91 IDs anteriores**. “Preservado” conserva significado; somente a comparação textual dos 22 L vigentes afirma texto definidor byte-identical. “Reformulado” inclui consolidação ou mudança de escopo explícita; “Superado” cessa obrigação; “Diferido” conserva possibilidade fora da V1. Classes/bases são as acima, salvo histórico superado, cuja antiga classificação aparece como proveniência.


## 2. Verdade operacional consolidada

Fonte atual S8: [missão Founder de freeze](../audits/v1-freeze-2026-10-19/FOUNDER_REQUEST.txt), posterior ao SIL; DECIDED para direção de produto, ASSUMED para resultados/claims. C047–C056 e L024 são a formalização atual; DR76–85 e RS-1.3 selecionam V1. Run + Strength wedge premium; Crew DEFERRED; external share IN; analytics profundos via Progressive Depth; Nutrition completa DEFERRED/apoio leve opcional; ingest-first; subscription/value-before-hard-ask; prioridades e first-value definidos; semana compromisso e stable-by-default/minimum effective change. Nenhum efeito, paridade, retenção ou disposição a pagar está demonstrado por essa decisão.

| Delta | Autoridade / natureza | Dependentes |
|---|---|---|
| C001/C003/C004/C005/C038/C041 | DECIDED, Founder S8: Crew fora V1, tese preservada. | PDM/PA/RS/EM/CF/UX retiram destinos, modos, jornadas sociais. |
| C006/C039/C040 | DECIDED: Nutrition módulo diferido, apoio leve condicional; wearable ingest-first, outbound sem gate global. | PDR G05/06, AEC/Scope/UX. |
| C016/C036/C054 | DECIDED: external share próprio sem social network, eventos/privacidade/identidade. | PA I7/I9, CF F10, UX§16. |
| C047/C048/C051 | DECIDED: posicionamento, qualidade premium/anti-bloat, profundidade progressiva. | Scope/PA/UX/Visual. |
| C049/C050/C052/C053 | DECIDED: prioridades/semana/first value/subscription. | AEOS/AEC, onboarding, adoção/pagamento separados. |
| L024 | LOCKED_INVARIANT / DECIDED explicitamente pelo Founder: estabilidade padrão. | AEOS necessity gate e custos; safety/autoridade nunca relaxadas. |
| C055/C056 | DECIDED: integração proporcional e sync direto→visual após gate. | Handoff; não autoriza executar telas nesta entrega/código/release. |

C057–C061/DR86–90 derivam de S9: treinamento evidence-informed e humildade, três processos/cadências, três tipos de mudança, consistência/personalização, confiança/claims e validação humana futura não bloqueante. AEC/SIS/AEOS e RIL/STIL recebem só esse delta; os núcleos especialistas e C045/C046 ficam preservados. Os 22 LOCKED anteriores ficam preservados. L001/L007/L010–12 governam a tese social futura, sem dívida V1; L024 é o único LOCKED novo. História/migrações §§3–11 seguintes descrevem revisões anteriores e não selecionam escopo atual contra esta seção. H009/O014/O017 continuam sem validação empírica.

Conflitos resolvidos por supersessão autorizada: THESIS_CONFLICT-FZ-01 Crew-V1→deferred; FZ-02 outbound obrigatório→condicional; FZ-03 comparação fisiológica imediata→adequacy/necessity/change-cost; FZ-04 monetização aberta→subscription/value-first. Nenhum desses conflitos retorna ao Founder: ele já decidiu na fonte S8. Roadmap social pós-validação não remove invariantes sociais; feed público incompatível não se torna promessa futura.

## 3. Migração integral — invariantes anteriores (23/23)

Todas as linhas ativas abaixo são L / DECIDED, autoridade Founder por S0, salvo L002 que deixa de vigorar por S6. A coluna razão/alcance explica por que continuam válidas; o texto integral reside no PTC indicado.

| ID anterior | Tratamento / destino | Fonte | Razão / alcance vigente | Dependentes |
|---|---|---|---|---|
| VFT-L001 | PRESERVADO → PTC§2 | S0 | Identidade fitness/performance e continuidade, sem exigir social equivalente. | Marca/PA/Scope |
| VFT-L002 | **SUPERADO → C038/C001/C041; histórico S0** | S0→S6 | “Dois pilares de primeira classe” cessa explicitamente; Engine núcleo, Crew camada Lite. Não vira novo LOCKED. | PDR DR55/56/59; PA/Scope |
| VFT-L003 | PRESERVADO → PTC§3 | S0 | Pessoa integral em um sistema; extensibilidade não obriga todo esporte. | PDM/PA/Flows |
| VFT-L004 | PRESERVADO → PTC§3 | S0 | Adequação coordena carga/interferência/contexto disponíveis; dados ausentes explícitos. | PDM/PA/O003/O017 |
| VFT-L005 | PRESERVADO → PTC§4 | S0 | Recovery no cérebro antes de superfície; não score obrigatório. | PDM/PA/Experience |
| VFT-L006 | PRESERVADO → PTC§4 | S0 | Reduzir/substituir/descansar apropriados são progresso. | Scope/Experience/Flows/Crew |
| VFT-L007 | PRESERVADO → PTC§4 | S0 | Engine determina adequação; apoio social favorece continuidade, sem mesmo status de pilar. | PA/agent scope/Crew |
| VFT-L008 | PRESERVADO → PTC§4 | S0 | Incentivo social nunca vence recuperação/adequação. | Crew/Shareables/metrics |
| VFT-L009 | PRESERVADO → PTC§7 | S0 | Valor básico solo não depende de Crew; loop também sem share/conversa/wearable. | Scope/Experience/Flows |
| VFT-L010 | PRESERVADO → PTC§7 | S0 | Crew assimétrica, sem homogeneidade física; não implica suporte a esportes de todos. | Crew/progresso coletivo |
| VFT-L011 | PRESERVADO → PTC§7 | S0 | Pequenos grupos privados com relação real. | C025/membership/invites |
| VFT-L012 | PRESERVADO → PTC§7 | S0 | Sem audiência/feed/follower graph; Lite não reabre rede pública. | PA/Crew/Shareability |
| VFT-L013 | PRESERVADO → PTC§8 | S0 | Interrupção/retorno legítimos, sem sequência física indiscriminada. | Experience/Flows/metrics |
| VFT-L014 | PRESERVADO → PTC§8 | S0 | Consentimento precede aquisição; finalidade por Crew/destino. | Security/Crew/wearables/shareables |
| VFT-L015 | PRESERVADO → PTC§8 | S0 | Cooperação precede comparação. | Crew/incentives |
| VFT-L016 | PRESERVADO → PTC§8 | S0 | Continuidade/comportamento antes de engagement/conteúdo. | Metrics/Scope/shareables |
| VFT-L017 | PRESERVADO → PTC§8 | S0 | Sem fiscais, culpa, humilhação, vigilância ou exposição. | Accountability/Experience/Security |
| VFT-L018 | PRESERVADO → PTC§8 | S0 | Comparação justa; sem unidade física ingênua entre contextos. | Crew/progress/O008 |
| VFT-L019 | PRESERVADO → PTC§8 | S0 | Gamificação somente subordinada à adequação/retorno/cooperação. | Incentives/Scope/metrics |
| VFT-L020 | PRESERVADO → PTC§8 | S0 | Não otimizar primariamente screen time/likes/posts/volume/streaks brutos. | Metrics/acquisition |
| VFT-L021 | PRESERVADO → PTC§5 | S0 | Relação alimentação/performance; C039 agora reduz escopo V1 explicitamente. | Nutrition/O004 |
| VFT-L022 | PRESERVADO → PTC§12 | S0 | Sem superapp/trackers/chatbot identidade; expansão aumenta valor apropriado. | Toda capability/Scope |
| VFT-L023 | PRESERVADO → PTC§3 | S0/S1 | Profundidade crível para qualquer suporte pleno declarado; mínimo esportivo é decisão revisável. | C023/C024/O014/Scope |

## 4. Migração integral — decisões anteriores (34/34)

C / DECIDED; autoridade Founder conforme fontes. Critérios/readiness continuam dependências, não efeitos provados.

| ID anterior | Tratamento / destino | Fonte | Razão / alcance vigente | Dependentes |
|---|---|---|---|---|
| VFT-C001 | REFORMULADO → PTC§2 | S0→S6 | Um produto integrado permanece; slogan de dois pilares sai. | PDR DR55/56/59; PA |
| VFT-C002 | PRESERVADO → PTC§12 | S0 | Integração de valor + responsabilidades distinguíveis, sem serviços antecipados. | PDM/PA/technical futuro |
| VFT-C003 | REFORMULADO → PTC§11 | S0/S6 | Aquisição/retenção objetivo da camada Crew Lite, não social equivalente/comercial provado. | PDR DR59; H002/H003 |
| VFT-C004 | PRESERVADO → PTC§7 | S0 | Papéis/entrada leve, sem pricing congelado ou avaliação sem contexto. | Membership/O005/O009 |
| VFT-C005 | REFORMULADO → PTC§7 | S0→S6 | Crew básica; demais conceitos possibilidades futuras sem dívida V1. | PA/Scope/PDR DR59 |
| VFT-C006 | REFORMULADO → PTC§5 | S0→S6 | Nutrition apenas insights ligados a treino; escopo amplo corporal/alimentar deixa de obrigar. | PA/Experience/PDR DR57 |
| VFT-C007 | PRESERVADO → PTC§11 | S0 | Appropriate Continuity inclui execução/adaptação/descanso/retorno apropriados. | Metrics/Experience/O001 |
| VFT-C008 | PRESERVADO → PTC§11 | S0 | Valor social conceitual; participação não prova causalidade. | Metrics/Research/O002 |
| VFT-C009 | REFORMULADO → PTC§11 | S0→S6 | Diferencial prioriza Engine Run×Strength; SSP/SPG/memória avançada não são dependência V1. | PDR DR56/61; H005/H009 |
| VFT-C010 | PRESERVADO → PTC§2 | S0 | Definição permitida não decide tagline. | Brand futuro |
| VFT-C012 | PRESERVADO → PTC§3 | S0 | Confiança explícita; informação insuficiente não autoriza precisão. | Engine/wearables/Experience |
| VFT-C015 | PRESERVADO → PTC§4 | S0 | Sem diagnóstico indevido; Safety para regras fisiológicas reais. | O003/Research/Safety |
| VFT-C016 | REFORMULADO → PTC§9 | S0/S2→S6 | Shareability transversal forte/voluntária; dois pilares cessam, profundidade conforme Lite. | PA/Scope/Shareable model |
| VFT-C017 | PRESERVADO → PTC§9 | S0/S2 | Shareability considerada em objetos, sem público por padrão. | PA/model/shareables |
| VFT-C018 | PRESERVADO → PTC§9 | S0/S2 | SHOULD qualidade/elegibilidade, sem cada shareable obrigatório; justificar exclusão estrutural. | UI futuro/Scope |
| VFT-C019 | PRESERVADO → PTC§9 | S0/S2 | Expressões distintas permitidas; inventário/lançamento não obrigatórios. | D010/UI futuro |
| VFT-C020 | PRESERVADO → PTC§9 | S0/S2 | Identidade social além de métricas; sem soma física coletiva ingênua. | Crew/shareables |
| VFT-C021 | PRESERVADO → PTC§9 | S0/S2 | Consentimento finalidade/destino; agregação não prova anonimato; terceiros protegidos. | Security/Crew/Flows |
| VFT-C022 | PRESERVADO → PTC§9 | S0/S2 | Externo amplifica valor; sem vanity/posting/audiência. | Metrics/Shareability |
| VFT-C023 | **REFORMULADO → PTC§3/C042** | S0/S1→S6 | Só Run/Strength first-class V1; obrigação Cycling/Swimming removida com autoridade explícita. | PDR DR56/60; PDM/PA/Scope |
| VFT-C024 | **REFORMULADO → PTC§3** | S0/S1→S6 | Profundidade crível por Run/Strength; cessam prazo/contexto transitório e dívida dos outros. | Scope/O014/PDR DR60 |
| VFT-C025 | REFORMULADO → PTC§7 | S0/S3/S5 | Fronteira/3/~8 preservados; clarifica abuso vs estratégia e convite projetável (RA3-03). | PDR FG-2/DR59; Crew/Security |
| VFT-C026 | PRESERVADO → PTC§9 | S0/S2 | Modelo de shareables no consumidor natural, não arquivo obrigatório. | PA/shareable section/Flows |
| VFT-C027 | PRESERVADO → PTC§9 | S0/S2 | Sistema visual quando fase/escopo aplicarem; missão sem UI/Figma. | UI/Brand missão futura |
| VFT-C028 | REFORMULADO → PTC§10 | S0/S4 | Híbrida/controle direto/profundidade mantidos; entrada simplificada, sem contagem de telas. | PA/Experience/Flows |
| VFT-C029 | REFORMULADO → PTC§10 | S0/S4/S5 | Clarifica entrada contextual recorrente além de onboarding (DI4-03). | Experience/entry context |
| VFT-C030 | REFORMULADO → PTC§10 | S0/S4→S6 | Classes diretas mantidas; exemplo alimentar não autoriza logging atual. | Experience/Flows/PDR DR57 |
| VFT-C031 | **REFORMULADO → PTC§3** | S0/S4→S6 | Linguagem/controles próprios só dos dois esportes V1; nada de suporte oculto aos quatro. | PDM/PA/Experience/Flows |
| VFT-C032 | REFORMULADO → PTC§10 | S0/S4/S5/S6 | Autoridade/agency/consent já vigentes; agente opcional no scope, não substitui motor (RA3-01/02). | PA/agent scope/O015/PDR DR63 |
| VFT-C033 | REFORMULADO → PTC§10 | S0/S4 | Mesmo outcome: mesmos dados/planos, alcance visível e sem mudanças extras silenciosas. | PA/Experience/Flows |
| VFT-C034 | REFORMULADO → PTC§10 | S0/S4 | Descobrir detalhe em scope sem esconder erro/sync/incerteza. | Wearables/Experience/Flows |
| VFT-C035 | REFORMULADO → PTC§10 | S0/S4/S5 | Referências estáveis incluem localização/rótulo (DI4-04), sem escolher navegação. | PA/Experience/UI futuro |
| VFT-C036 | REFORMULADO → PTC§10 | S0/S4→S6 | Caminhos Crew/Share diretos mantidos; pessoas relacionadas, sem discovery/chat. | Crew/Experience/Flows |
| VFT-C037 | REFORMULADO → PTC§10 | S0/S4/S5 | Qualidade/identidade mantidas; usos externos explicitamente autorizados preservados (RA3-04). | Brand/UI futuro/refs |

## 5. Migração integral — design space anterior (11/11)

D / DECIDED, liberdade aprovada sob autoridade Founder. Um espaço diferido não é capability em escopo nem prazo futuro.

| ID anterior | Tratamento / destino | Fonte | Razão / alcance vigente | Dependentes |
|---|---|---|---|---|
| VFT-D001 | REFORMULADO → PTC§7 | S0→S6 | Naming/composição Lite; nomes futuros não ampliam V1. | PA/Crew/naming futuro |
| VFT-D002 | DIFERIDO → PTC§7/C005 | S0→S6 | Mecânicas sociais aprofundadas somente se necessidade/escopo futuro; sem sessões juntas ou ciclos obrigatórios. | Scope/PDR DR59 |
| VFT-D003 | PRESERVADO → PTC§4 | S0 | Recuperação sem módulo ou score obrigatório, confiança e Safety. | Recovery/Experience |
| VFT-D004 | **SUPERADO → C039/D012; histórico S0** | S0→S6 | Food logging/receitas/meal planning/infra alimentar não são design space V1; expansão exige nova decisão. | PDR DR57/PA/Experience |
| VFT-D005 | DIFERIDO → PTC§7 | S0→S6 | Perfilamento social, SSP/SPG/Crew Memory não integram V1 nem autorizam coleta. | O007/Security/Scope |
| VFT-D006 | REFORMULADO → PTC§8 | S0/S6 | Competição opcional subordinada, sem requisito Lite; O008 antes de pontos. | Crew/incentives |
| VFT-D007 | REFORMULADO → PTC§8 | S0/S6 | Gamificação contextual possível, não checklist; Seasons seguem futuro. | Scope/Experience/metrics |
| VFT-D008 | PRESERVADO → PTC§7 | S0 | Entrada leve/papéis/acesso sob consentimento/solo. | Membership/O005/O009 |
| VFT-D009 | PRESERVADO → PTC§12 | S0 | Objetos/jornadas/soluções abertas, sem stack ou navegação prescritas. | PDM/PA/Engineering futuro |
| VFT-D010 | REFORMULADO → PTC§9 | S0/S2/S6 | Inventário/formatos/destinos abertos, sem toda expressão na V1. | PA/Scope/UI futuro |
| VFT-D011 | REFORMULADO → PTC§3/C042 | S0/S1→S6 | Agora inclui Cycling/Swimming além de outros; sem mínimo4 ou prazo. | PDM/PA/Scope/PDR DR60 |

## 6. Migração integral — hipóteses anteriores (8/8)

H / ASSUMED; não validadas. As fontes são origem da premissa, não prova. Research/Data/domínio são consumidores para futura validação apropriada; a missão não pesquisa mercado nem fisiologia.

| ID anterior | Tratamento / destino | Fonte | Premissa / limite preservado | Dependentes |
|---|---|---|---|---|
| VFT-H001 | PRESERVADO → PTC§11 | S0 | Efeito de apoio na continuidade segue hipótese, não causalidade demonstrada. | C008/O002 |
| VFT-H002 | PRESERVADO → PTC§11 | S0 | Aquisição/network effects de entrada social precisam de prova. | C003/metrics/Research |
| VFT-H003 | REFORMULADO → PTC§11 | S0/S6 | Retenção assistida agora refere Crew Lite, continua não validada. | C003/Research |
| VFT-H004 | REFORMULADO → PTC§11 | S0/S6 | Benefit Recovery/Nutrition contextual não é segurança/eficácia comprovada. | O003/O004 |
| VFT-H005 | REFORMULADO → PTC§11 | S0/S6 | Moat da coordenação/longitudinal sem exigir social profiling; não exclusividade comprovada. | C009/Research/Privacy |
| VFT-H006 | PRESERVADO → PTC§11 | S0/S3 | Relações acrescentam valor voluntário; 3/~8 não ótimos provados. | C025/Research |
| VFT-H007 | PRESERVADO → PTC§11 | S0/S2 | Shareability reforça distribuição/continuidade, efeito ainda hipotético. | Shareables/Research/metrics |
| VFT-H008 | PRESERVADO → PTC§11 | S0/S4 | Redução de esforço híbrida requer observação de uso. | Experience/evals futuros |

## 7. Migração integral — questões anteriores (15/15)

O / OBSERVED registra ausência em fontes locais, não ausência global de solução. Fonte/limitação/confiança em §1; estados resolvidos/parcialmente respondidos têm autoridade DECIDED somente no trecho decidido. Owners e triggers integrais estão no PTC§13; este mapa não os amplia.

| ID anterior | Tratamento / destino | Fonte | Estado / razão | Dependentes que aguardam o trigger |
|---|---|---|---|---|
| VFT-O001 | PRESERVADO → PTC§13 | S0 | ABERTA: operacionalizar continuidade com contexto/denominadores. | Métrica priorizada/incentivo |
| VFT-O002 | PRESERVADO → PTC§13 | S0 | ABERTA: efeito social vs seleção. | Claim causal/comercial |
| VFT-O003 | REFORMULADO → PTC§13 | S0/S6 | ABERTA: motor/Recovery/Nutrition real; capacidade Safety não presumida. | Regras/adaptações/insights reais |
| VFT-O004 | REFORMULADO → PTC§13 | S0→S6 | ABERTA dentro de insights; deixa de abrir alimentação generalista. | Políticas Nutrition/C039 |
| VFT-O005 | REFORMULADO → PTC§13 | S0/S3/S6 | ABERTA: direitos/dados/consent por Crew; criação/multi-Crew já decididos. | Contratos de acesso/coleta/share |
| VFT-O006 | PRESERVADO → PTC§13/C025 | S0/S3 | RESOLVIDA/DECIDED no Founder FG-2; não pedir de novo. | Só futura revisão paramétrica |
| VFT-O007 | DIFERIDO → PTC§13 | S0→S6 | Perfilamento/memória social fora da V1. | Expansão autorizada que os use |
| VFT-O008 | REFORMULADO → PTC§13 | S0/S6 | ABERTA: contribuição justa, sem leaderboard obrigatório Lite. | Pontos/comparações/recompensas |
| VFT-O009 | PRESERVADO → PTC§13 | S0 | ABERTA: pricing/packaging/acesso; nenhum trial ou gratuidade decididos. | Compromisso comercial |
| VFT-O010 | DIFERIDO → PTC§13 | S0/S6 | Spin-off só diante de evidência/decisão futura; sem bloquear V1 integrada. | Estratégia futura separação |
| VFT-O011 | REFORMULADO → PTC§13 | S0→S6 | PARCIALMENTE RESPONDIDA: capabilities V1; profundidade/readiness permanecem abertas. | Scope critérios/roadmap/lançamento |
| VFT-O012 | REFORMULADO → PTC§13 | S0→S6 | RESPONDIDA para scope V1 Lite; owners especificam mecânicas internas. | Expansão social material |
| VFT-O013 | DIFERIDO → PTC§13 | S0/S6 | Eventual suporte limitado não adotado ao ingerir outros esportes como contexto. | Promessa de suporte parcial futura |
| VFT-O014 | REFORMULADO → PTC§13 | S0/S6 | ABERTA: alocação de critérios/verificação Running/Strength antes de suporte real; não quatro domínios. | Declaração de suporte pleno |
| VFT-O015 | REFORMULADO → PTC§13 | S0/S4/S5 | ABERTA: confirma/recusa/desfaz/alcance/autonomia; autoridade existente já vale; Chief na dúvida. | Preparar/aplicar ajustes conversacionais |

## 8. IDs novos e rastreabilidade do delta

| ID novo | Classe / base / autoridade | Fonte / razão | Texto integral / consumidor |
|---|---|---|---|
| VFT-C038 | CURRENT / DECIDED / Founder | S6: Engine núcleo/diferencial, Run×Strength principal, camadas subordinadas; supersede L002. | PTC§2 → PDR DR56/59; PDM/PA/Scope |
| VFT-C039 | CURRENT / DECIDED / Founder | S6: fronteira Nutrition impede logging/meal planner/dieta; formaliza exclusões dentro de “apenas insights”. | PTC§5 → PDR DR57; PA/Experience/Flows |
| VFT-C040 | CURRENT / DECIDED / Founder | S6: closed loop ingestão+structured workouts quando suportado; C012/L014 limitam confiança/permissão. | PTC§6 → PDR DR58; PDM/PA/Scope/Flows |
| VFT-C041 | CURRENT / DECIDED / Founder | S6 + S3 mínimo básico ainda válido: Crew Lite, continuidade/accountability/distribuição sem chat/discovery/comunidade/marketplace. | PTC§7 → PDR DR59; PA/Scope/Flows |
| VFT-C042 | CURRENT / DECIDED / Founder | S6: esportes futuros possíveis, sem obrigação escondida; substitui obrigação de 4 e prazo. | PTC§3 → PDR DR60; PDM/PA/Scope |
| VFT-C043 | CURRENT / DECIDED / Founder | S6: inovação real/market density/feature parity; Pierre não template ou evidência. | PTC§2 → PDR DR61; scope reviews |
| VFT-C044 | CURRENT / DECIDED / Founder | S6: loop estratégico; L009/L014 mantêm Share voluntário e solo. | PTC§2 → PDR DR61; PA/Scope/Experience/Flows |
| VFT-D012 | DESIGN SPACE / DECIDED / Founder | S6 + S0 D009/C012/L021: como expressar insights dentro do novo limite; substitui D004, sem alimentar feature creep. | PTC§5 → PA/Experience/O003/O004 |
| VFT-H009 | HYPOTHESIS / ASSUMED / aposta não validada | S6/C038/C043, premissa de valor/diferenciação separada da direção decidida; nenhum dado de mercado novo. | PTC§11 → Research futura/claims/valor |
| VFT-O016 | OPEN / OBSERVED / owner de domínio | S6 pede wearable bidirecional; providers/workouts/permissões não definidos. Confiança alta na lacuna local, não prova indisponibilidade de API. | PTC§13 → Engineering/Product/UX/Security antes de compromisso específico |
| VFT-O017 | OPEN / OBSERVED / owner de domínio | S0 L023/O003/O014 + S6: não há evidência de qualidade/eficácia do núcleo liberado. Ausência local não prova impossibilidade. | PTC§13 → Safety/domínio/Engineering/Research antes de adaptação real ou claim |
| VFT-C045 | CURRENT / DECIDED / Founder | S7: Specialist Parity + Cross-Sport Superiority; requisito de competência, não feature parity ou efeito validado. | PTC§2 → PDR DR72; Scope/AEC/SIS/RIL/STIL; O014/O017/G01–G04/G09/G11. |
| VFT-C046 | CURRENT / DECIDED / Founder | S7: especialistas sob Orchestrator, Athlete Model compartilhado, arbitragem única, sem dupla contagem/loops ou UI por layer. | PTC§4 → PDR DR73/74; PDM/PA/AEC/AEOS/SIS. |


Nenhum novo LOCKED. A extensão deriva somente dos limites/outcomes autorizados; hipótese do diferencial continua H009. Novas decisões do PDR DR55–DR64 são registros de decisão/handoff/execução, não conjunto de features adicionais.

## 9. Conflitos resolvidos e findings históricos

| Ref | Fonte A / autoridade anterior | Fonte B / autoridade atual | Incompatibilidade / resolução | Impacto |
|---|---|---|---|---|
| THESIS_CONFLICT-RB-01 | S0 L002/C001: Founder anterior, dois pilares equivalentes. | S6/C038/C041: Founder atual, Engine núcleo + Crew Lite camada. | Resolvido por supersessão explícita de L002 e reformulação C001; manter limites sociais sem igual centralidade. | PDM/PA/Scope/metrics/shareability/PDR DR55/59 |
| THESIS_CONFLICT-RB-02 | S1/S0 C023/C024/C031/§7.1: quatro esportes mínimos e prazos de contexto transitório. | S6/C023/C042/D011: apenas Run/Strength V1, outros possibilidades. | Resolvido removendo dívida e prazo de Cycling/Swimming; L023 permanece. | Domínios/athlete/workout/Scope/experience/PDR DR56/60 |
| THESIS_CONFLICT-RB-03 | S0 C006/D004/C030: Nutrition ampla e ferramentas alimentares abertas. | S6/C006/C039/D012: apenas insights. | D004 superado; C006 restrito, exemplo alimentar de C030 não concede logging. | Nutrition/objetos/Experience/agent/PDR DR57 |
| THESIS_CONFLICT-RB-04 | S3 PLT: watches/outros apps apenas fontes. | S6/C040: closed loop inclui envio quando suportado. | Bidirecional conceitual sem prometer provider; plataformas móveis mantidas. | Integrações/workout export/states/O016/PDR DR58 |
| PRODUCT_DRIFT_WARNING-RB-01 | S0 C005/C009/D002/D005 e dependentes: profundidade social/perfilamento como direção central. | S6/C041/C042/C043: Lite e arquitetura proporcional. | Conceitos futuros explicitamente diferidos; manter fronteiras sem overengineering. | PDM/PA/Scope/PDR DR59/61 |
| PRODUCT_DRIFT_WARNING-RB-02 | S4 e usos possíveis da referência Pierre. | S6/C043 + C037: ambição de inovação/qualidade, sem copiar. | Referência não vira template, produto completo, roadmap ou prova empírica. | Brand/UI futuros/priorização |

Estes findings registram a resolução autorizada e sua história; não são gates extras nem conflitos bloqueantes remanescentes. Source A segue íntegra no snapshot.

| Finding histórico | Tratamento nesta revisão | Texto / próximo owner |
|---|---|---|
| RA3-01 | Corrigido: autoridade/agência/consent vigentes explícitos; O015 somente lacuna específica. | PTC§10 C032 + §13 O015; gap permanece observado, sem falso readiness. |
| RA3-02 | Corrigido: L022 somente identidade/dependência produto; obrigações de fluxos mantêm força CURRENT. | PTC§10/§12; citação correta “soma de produtos com uma camada de IA ou social”. |
| RA3-03 | Corrigido: mecânicas neutras restritas a abuso/segurança; condições materiais a Founder; nunca oferecer invite projetável altera política. | PTC§7 C025; PA/Scope operacionalizam. |
| RA3-04 | Corrigido: referências por si não autorizam cópia; vale uso explicitamente autorizado. | PTC§10 C037. |
| DI4-01 | Corrigido: O015 inclui prepara/aplica e Chief encaminha dúvida de autonomia material. | PTC§13 O015. |
| DI4-02 | Encaminhado ao consumidor apropriado: classes simples/frequentes com racional são Experience/Flows/agent scope. | PTC§10; Product/UX registra classificação sem mudar tese. |
| DI4-03 | Corrigido: entrada contextual recorrente distinta de onboarding. | PTC§10 C029. |
| DI4-04 | Clarificado: localização/rótulo de referências estáveis preservados sob personalização, sem escolher navegação. | PTC§10 C035; UX/UI futuros verificam. |

Amendment SIL: **THESIS_CONFLICT-SIL-01 resolvido por explicitação autorizada.** S6/C043 e DR61 rejeitam feature parity; S7 exige paridade de competência no núcleo. C045 e links C024/C042/C043 distinguem os termos, preservam o teste de escopo e apertam o padrão de qualidade sem copiar catálogos. Detalhes/impacto em SIL, sem reescrever o passado.

## 10. Cenários de consistência e handoff

Estes são testes documentais derivados das cláusulas, não comportamento executado nem validação fisiológica/visual.

| Cenário | Resultado exigido / limite | Fonte / consumidor |
|---|---|---|
| Pessoa combina longão e força; recuperação pede reduzir força. | Um contexto integrado; motor propõe adaptação; descanso é progresso; Crew não exige volume; pessoa mantém agência. | L003–L008/C023 → PDM/PA/Experience/Flows |
| Nenhuma Crew, conversa ou wearable conectado. | Loop individual e controles diretos preservam valor com confiança honesta; Share opcional. | L009/C028/C030/C040/C044 → Scope/Experience/Flows |
| Treino exige insight Nutrition. | Contextual ao treino; fonte/contexto/segurança ainda precisam de políticas reais; sem logging/macros/dose universal. | C006/C039/D012/O003/O004 → Experience/Flows |
| Structured workout não suportado/falha de envio; atividade chega tarde/duplicada. | Estado explícito e caminho direto; enviado não é concluído; ingestão não inventa adesão ou precisão. | C012/C034/C040/O016 → PA/Flows/contrato técnico futuro |
| Atleta também pedala/nada; atividade externa chega. | Usar contexto relevante com limite de confiança não declara suporte; nenhum domínio first-class/prazo extra. | C042/D011/PTC§3 → PDM/PA/Scope |
| Membro retorna/descansa; Crew compartilha progresso. | Contribuição apropriada consentida; não exposição de motivo/não participação de terceiro, culpa ou soma física. | L006/L013/L014/L017/L018/C021/C041 → Crew/Flows/Security |
| Convite encaminhado e segunda/terceira Crew. | Confirmação do inviter; sem inscrição automática; per-Crew consent; direitos por papel e parâmetros Founder. | C025 → PDM/PA/Flows |
| Agente prepara mudança que afetaria treino e Nutrition. | Escopo explícito; não ampliar consentimento/aplicar silenciosamente; motor decide adequação; O015 antes de escolher autonomia. | C032/C033/O015 → PA/Experience/Flows/AEC se necessário |
| Nova feature por paridade ou por infraestrutura disponível. | Precisa outcome e contribuição coordenar/loop; sem requisito não entra por disponibilidade. | C043/C044/L022 → PDR/Scope |

**Ordem de consumo:** PTC → mapa/decisões vigentes → domínio → arquitetura → scope → Experience Model e Core Flows quando naturais. Um Adaptive Engine Contract só entra com consumidor distinto e necessidade demonstrada; não por nome. UI/Figma e implementação exigem missão posterior. Handoff canônico emitido/aceito e pareceres vigentes ficam no índice/registro, sem autoaceite deste mapa.

## 11. Cobertura e self-check da autoria

Inventário: **91/91 IDs de 2.3.0**, sem desaparecimento silencioso — L23 + C34 + D11 + H8 + O15. Destinos vigentes ou históricos são explícitos. **11 IDs novos** — C038–C044, D012, H009, O016/O017. Total rastreável 102; **100 ativos** (L22 + C41 + D11 + H9 + O17), com L002 e D004 apenas históricos. C011/C013/C014 continuam ausentes.

Self-check PCG para submissão, sem aprovação independente:

- Pedido literal, versões, autoridade e current/target/delta: reconstruídos em S0–S6 e conflitos RB-01–04.
- Classes normativas/epistêmicas: separadas; nenhuma hipótese validada ou novo LOCKED; dose nutricional/provedor não inventados.
- Histórico: snapshot integral preservado;91 IDs indexados com tratamento individual; significado das supersessões é explícito.
- Limites/outcomes/design space: texto traduzível sem escolher navegação, stack, IA, UI, algoritmo ou roadmap de expansões.
- Consumidores/impactos: mapeados por cláusula; regras futuras e implementação param somente em triggers concretos.
- RA3/DI4: resoluções e owner downstream de DI4-02 registradas; O015 não tratado como implementado.
- Check determinístico: comparar IDs do snapshot, definições atuais, linhas dos 22 L ativos e inventário; Chief registra evidência e hashes de review no bundle RB-3.0.0. Resultado dessa prova não equivale a gate de domínio.

Condição de handoff da autoria: entrega **GOVERNANCE_READY_FOR_REVIEW / PRODUCT_CONSTITUTION_DRAFT**, com pareceres Research/interpretabilidade e consolidação Chief por revisão ainda necessários no fluxo registrado. A aprovação atual, publicação e eventual aceite posterior são controlados pelo índice e REBASELINE_RECORD, não por esta autoavaliação.
