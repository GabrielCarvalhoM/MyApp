# Vilumo Fit — Product Decision Register

Revisão: **PDR-1.0** · 2026-10-14 · Registro vigente — revisão documental aprovada; gates no índice. Owner: Chief (registro); cada decisão mantém seu decisor.
Autoridade normativa: [Product Thesis Contract 3.0.0](../canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md). Fonte Founder desta revisão: [REBASELINE_RECORD](../audits/rebaseline-3.0.0/REBASELINE_RECORD.md). Este registro não substitui a tese nem transforma hipótese em fato.

## 1. Leitura vigente e preservação

**Esta seção atual e as seções 2–6 são a leitura operacional.** O bloco posterior ao marcador `HISTORICAL_RECORD_START` é o registro PDR-0.6 integral, preservado sem editar seus bytes. Suas declarações de estado, fases, gates, hash e escopo referem-se exclusivamente às versões antigas. Não usar um “PASS” histórico para aprovar a revisão atual.

Linhagem: PDR-0.1 → 0.2 → 0.3 → 0.4 → 0.4.1 → 0.5 → 0.6 → 1.0. O texto anterior também está no [snapshot integral](../governance/snapshots/2026-10-14-pre-3.0.0/product/PRODUCT_DECISION_REGISTER.md). DR-01 a DR-54, alternativas, rulings, findings e fontes humanas permanecem recuperáveis. Não houve reset de projeto nem exclusão de decisão histórica.

O pedido direto do Founder de 2026-10-14 decide a nova direção estratégica. A tese a formaliza e os consumidores a traduzem. Decisões históricas incompatíveis foram **superadas**, não retroativamente corrigidas. Futuras alterações estratégicas exigem nova decisão do Founder; detalhes de produto/UX dentro dos limites são resolvidos pelo owner competente.

## 2. Novas decisões

Classe epistêmica de DR-55–DR-62 e DR-64: DECIDED (Founder, pedido direto de 2026-10-14). DR-63 e DR-65: DECIDED como políticas/escolhas de Product/UX dentro do design space, avaliadas nos pareceres documentais registrados no índice. Nenhum item prova eficácia, mercado ou capacidade atual de um fornecedor.

| ID | Decisão e racional | Efeito / dependentes | Owner / autoridade |
|---|---|---|---|
| DR-55 | Controlled canonical rebaseline 3.0.0: consolidar o presente sem reiniciar o projeto. Dois pilares equivalentes deixam de reger a V1; o Engine é núcleo e Crew Lite apoio. | Supera a leitura estratégica antiga de L002/C001; tese, Truth Map, domínio, arquitetura, missão e índice sincronizados. | Founder decide; PCG formaliza; Chief publica dentro da autorização. |
| DR-56 | Running × Strength são os dois domínios first-class da V1, coordenados pelo Adaptive Engine em um atleta/plano integrado. Força realizada, omitida, reduzida e fadiga relevante podem mudar decisões de corrida e vice-versa. | C023/C024/C031/C038; supera DR-21/41/43/45 na obrigação de quatro esportes. Cobertura definida no V1 Scope não é suporte implementado. | Founder; Product/UX traduz; evidência/domínio e Engineering verificam a capacidade futura. |
| DR-57 | Nutrition é contextual performance insights vinculados à demanda e timing do treino; não food logging, dieta completa, meal planner ou app nutricional paralelo. Percentual ou timing ilustrativo não é prescrição aprovada. | C039; limita DR-18 e exemplos alimentares C030. Conteúdo precisa fonte, população, contraindicações e confiança antes de uso real. | Founder; PCG limita; domínio competente + Research + Security antes de liberar orientação real. |
| DR-58 | Wearables fecham o loop: importar atividades e enviar structured workouts quando suportado. Leitura, envio, execução e reconciliação são capacidades distintas, com consentimentos e estados visíveis. | C040; supera a parte “somente fontes” de DR-47/13. AEC/PDM/PA/CF definem versão e fallback; matriz por fornecedor continua aberta. | Founder; Engineering verifica APIs/formatos/restrições; Security avalia fronteiras. |
| DR-59 | Crew Lite serve continuidade/accountability/distribuição com convites privados, participação leve, apoio estruturado e compartilhamento voluntário. Sem chat, discovery público, communities abertas ou marketplace. | C041; reduz DR-23/11 ao mínimo. Preserva DR-22/C025 (até 3 Crews; cerca de 8 pessoas; criação nos dois modos; convite nominal; encaminhado/projetado só com confirmação). Sem contatos, coerção ou prescrição social. | Founder; Product/UX delimita comportamento; Security avalia exposição. |
| DR-60 | Cycling, Swimming e outros esportes são expansões possíveis, fora da V1. Não precisam prazo, placeholders, destino dedicado ou contratação de infraestrutura antecipada. | C042/D011; remove dívida obrigatória de quatro esportes. Atividade externa pode ser contexto com proveniência, sem coaching ou promessa de suporte. | Founder; Product/UX/Engineering preservam extensibilidade proporcional. |
| DR-61 | Inovar pela coordenação do atleta em categoria densa. Market density não implica product completeness; feature parity não é objetivo. Toda feature fortalece coordenação ou serve Decide → Prepare → Execute → Observe → Adapt → Share → Repeat. | C043/C044; teste de escopo para cada consumidor. Pierre é referência de intenção/qualidade, não template nem evidência de sucesso do Vilumo. | Founder; PCG registra; owners de cada capacidade aplicam. |
| DR-62 | Missão estritamente documental: consolidar autoridades e consumidores naturais; sem código de produto, Figma, scaffold, stack ou deploy. Scope, Experience e Core Flows cabem no estágio agora porque prioridades de V1 foram dadas. AEC só existe por consumidor claro. | CURRENT_MISSION; não herda autorização de Figma da missão antiga. Próxima missão é deliberada separadamente. | Founder; Chief delimita gates e hard stop. |
| DR-63 | Engine determina recomendação, pessoa decide execução. Alterações futuras de plano ou envio ao relógio têm alcance/revisão explícitos e confirmação; propostas antigas não podem sobrescrever contexto mais novo. Conversa é opcional e não mantém plano paralelo nem aplica mudanças silenciosas. | Operacionaliza L007/L014/C032/C033 e O015 em AEC/PA/CF; desfazer restaura intenção/plano quando possível, nunca apaga atividade real nem promete recall de cópia externa. | Product/UX propõe/resolve política conservadora; Engineering/Security revisam fronteiras; autonomia ampliada volta ao Founder. |
| DR-64 | Preservar AGENTS/CLAUDE, ledger append-only, snapshots, fontes e reviews antigos. Índice contém uma autoridade vigente por papel; drafts/audits/histórico não são Product Truth. Publicação exige revisões independentes e evidência atual. | Snapshot de 49 arquivos SHA-256; migration 91 IDs no Truth Map; gates antigos não transferidos. Handoff sexta 2026-10-16 começa pelo índice. | Founder; Chief executa, registra e verifica. |
| DR-65 | Escolhas estruturais mínimas de Product/UX: check-in voluntário direcionado por destinatário; compromisso leve e reconhecimento coletivo qualitativo de encerramento sem afirmar cumprimento de todos; share externo individual/convite, coletivo externo diferido por inferência; agente opcional; export explícito por sessão/revisão, sem envio em lote automático. | PA-1.0 AR-01–AR-15, PDM/AEC/RS/EM/CF. Conservam apoio e progresso coletivo sem dashboard/score/lista de ausentes e minimizam autonomia/exposição. Critérios Run/Strength são propostas subordinadas a O014/O017, integração a O016. | Product/UX worker decide dentro de D009/D010; Chief registra, reviewers independentes julgam. Não é estratégia nova do Founder nem aprovação do próprio autor. |

## 3. Disposição das decisões históricas

PRESERVADO = sentido vigente no escopo novo; REFORMULADO = sentido útil com limite novo; SUPERADO = substituído com histórico intacto; DIFERIDO = possível, sem obrigação V1; ABERTO = lacuna concreta com owner/trigger em §5. A aprovação vigente consta do índice, não desta tabela de autoria.

| ID histórico | Disposição atual | Continuidade / delta |
|---|---|---|
| DR-01 | PRESERVADO | Full Member versus Crew Member são modos de participação, não planos comerciais; rótulos finais são UX copy. |
| DR-02 | REFORMULADO | Domínio integrado mais enxuto no PDM-1.0; Engine é ponto de decisão, sem obrigação dos sete subsistemas anteriores. |
| DR-03 | PRESERVADO | Participação leve por intenção/desfecho próprio; não fabrica contexto nem adequação validada pelo motor. |
| DR-04 | REFORMULADO | Consentimento por Crew e minimização; check-in voluntário não expõe dados privados ou ausência. |
| DR-05 | PRESERVADO | Compromisso social não prescreve carga; descansar/adaptar pode ser legítimo. |
| DR-06 | DIFERIDO | Agregação/pontuação coletiva não é necessária ao Crew Lite; não há ranking físico universal. |
| DR-07 | REFORMULADO | Esportes externos só contexto; sem catálogo que prometa suporte e sem dívida de prazo para ciclismo/natação. |
| DR-08 | PRESERVADO / ABERTO | Confiança e proveniência visíveis; método/limiares antes de decisões reais. |
| DR-09 | PRESERVADO | Recuperação, desconhecido, interrupção e retorno distintos; ausência de dados não é falha. |
| DR-10 | PRESERVADO | Engine recomenda; pessoa age; social só informa intenção/disponibilidade própria. |
| DR-11 | REFORMULADO | Crew Lite mínimo em V1 Scope; ontologia social ampla deixa de ser backlog obrigatório. |
| DR-12 | PRESERVADO | Modo de participação não determina automaticamente preço/entitlement. |
| DR-13 | REFORMULADO / ABERTO | Fontes e autodeclaração preservadas; structured export adicionado, provedor concreto ainda aberto. |
| DR-14 | PRESERVADO / ABERTO | Minimização/saída/revogação; retenção e prova técnica antes de persistência real. |
| DR-15 | REFORMULADO | Metas de corrida/força e coordenação; catálogo final e parametrização dependem de evidência. |
| DR-16 | PRESERVADO | Progresso inclui recuperação, redução, descanso e retorno apropriados. |
| DR-17 | ABERTO | Política de safety e decisões reais: fontes, populações, contraindicações e limiares. |
| DR-18 | REFORMULADO / ABERTO | Nutrition contextual somente; conteúdo específico antes de liberar insight real. |
| DR-19 | PRESERVADO / ABERTO | Efeitos sociais, performance, retenção, aquisição e moat são hipóteses. |
| DR-20 | REFORMULADO / ABERTO | Critérios comportamentais de cobertura V1 Run×Strength; validação de domínio e implementação futura exigidas. |
| DR-21 (FG-1) | SUPERADO | Quatro esportes obrigatórios → DR-56/60: dois em V1, demais possíveis expansões. |
| DR-22 (FG-2) | PRESERVADO | Pacote A/C025: 3 Crews/~8; convite privado; criação em ambos modos. |
| DR-23 (FG-3) | SUPERADO | Estratégia de lançamento decidida agora como Crew Lite; detalhes mínimos no Scope. |
| DR-24 (FG-4) | ABERTO | Packaging/preço antes de compromisso comercial; não bloqueia rebaseline documental. |
| DR-25 | DIFERIDO | Métrica operacional antes de medir/incentivar; sem fórmula inventada na V1 documental. |
| DR-26 | DIFERIDO | Tagline e marca em missão posterior. |
| DR-27 | DIFERIDO | Spin-off não é direção atual nem dependência da V1. |
| DR-28 | DIFERIDO | Competição fora de Crew Lite. |
| DR-29 | REFORMULADO / DIFERIDO | Feedback útil sem gamificação punitiva; badges/streaks não obrigatórios. |
| DR-30 | REFORMULADO | Apoio estruturado sem chat/texto livre como sistema social. |
| DR-31 | PRESERVADO | Recovery é contexto e decisão, não destino ou score obrigatório. |
| DR-32 | PRESERVADO | Entrada progressiva, solo funcional, sem coleta desnecessária. |
| DR-33 | PRESERVADO | Convite/saída/remoção/silenciar privados; detalhe da prova de acesso antes de implementar. |
| DR-34 | PRESERVADO | Participação leve pode evoluir para motor sem reiniciar identidade/membership. |
| DR-35 | REFORMULADO / ABERTO | Engine não exige LLM; agente opcional sem autoridade própria. Modelo/tools/evals só se selecionados. |
| DR-36 | DIFERIDO | Social profiles/graph/memory fora de V1; sem coleta antecipada. |
| DR-37 | DIFERIDO | Together/Moments e sessões coletivas não obrigatórios. |
| DR-38 | REFORMULADO | Share model mínimo: própria pessoa/convite; coletivo externo diferido por risco de inferência. |
| DR-39 | DIFERIDO | Shareable visual system após UX estrutural, em missão autorizada de design. |
| DR-40 | PRESERVADO | Sem exposição/inferência de terceiros; membership não consente projeção externa. |
| DR-41 | SUPERADO em escopo | Profundidade crível preservada para corrida/força; quatro esportes deixam de ser obrigação. |
| DR-42 | REFORMULADO | Capacidade por modalidade em plano integrado; só Run/Strength em V1. |
| DR-43 | SUPERADO | Contexto transitório com prazo compulsório → contexto externo sem dívida de suporte. |
| DR-44 | PRESERVADO / limitado | Compartilhar é projeção voluntária do dado permitido; não feed/autoridade de treino. |
| DR-45 | SUPERADO | Prioridade estratégica de V1 fornecida pelo Founder; não repetir gate de quatro esportes. |
| DR-46 | REFORMULADO | Conjunto mínimo de shareables no Scope; não catálogo de templates obrigatório. |
| DR-47 | PRESERVADO em parte | Brasil/PT-BR+EN/iOS+Android/18+ mantidos; somente fontes wearable superado por DR-58. |
| DR-48 | DIFERIDO | Suporte esportivo parcial futuro, sem promessa V1; honestidade de capacidade vigente permanece. |
| DR-49 | ABERTO | Owner e prova de credibilidade antes de declarar suporte real; Scope é especificação, não declaração operacional. |
| DR-50 | PRESERVADO / limitado | Experiência híbrida mantida; modalidades/nutrição seguem o novo Scope. |
| DR-51 | REFORMULADO | Política conservadora DR-63/AEC elimina falsa premissa de contrato existente completo; autonomia ampliada continua aberta. |
| DR-52 | ABERTO | Retenção, validade de convites e demais durações antes do contrato técnico dependente. |
| DR-53 | ABERTO | Verificação de idade e canal: método/proporcionalidade/dados antes de implementação. |
| DR-54 | SUPERADO como proposta | Refinamentos da PA-0.1 consumidos ou substituídos por PDM/PA-1.0; baseline preservado. |

## 4. Decisões válidas preservadas

Fontes humanas: [Founder Gate 2026-10-10](../audits/phase-1-3-reviews/founder-gate-phase3-decisions.md) e [experiência híbrida 2026-10-11](../audits/founder-decisions/2026-10-11_hybrid-experience-founder-decision.md). Mantidos mercado Brasil, idiomas PT-BR+EN, smartphones iOS+Android, mínimo 18+, valor solo, convite nominal fechado e confirmação de encaminhado/projetado, até três Crews por pessoa e cerca de oito membros por Crew. Nenhuma ingestão de contatos.

Qualidade percebida, entrada contextual, execução direta, profundidade descobrível, referências estáveis, dark-first/light-complete e identidade madura continuam intenção válida para missão futura de UX/UI. Nenhuma referência autoriza copiar Pierre. A lista antiga de exemplos alimentares não autoriza registrar comida nesta V1.

## 5. Questões realmente abertas e dependências

| Questão / IDs | Owner | Trigger / impacto |
|---|---|---|
| Políticas de treino/recuperação/risco: população atendida além de 18+, fontes, cargas, progressão, sinais, critérios de degradação e casos que exigem orientação profissional (DR-08/17/20/49). | Product/UX + autoridade de domínio/Research; Engineering para execução; Security para dados sensíveis. Founder em escopo/população estratégica. | Antes de tornar recomendações reais ou declarar cobertura crível operacional; não bloqueia formalizar o contrato. |
| Nutrition: conteúdo, timing/quantidades, fontes e contraindicações; percentual fixo ilustrativo não basta (DR-18). | Domínio competente/Research + Product/UX; Security quando personalização sensível. | Antes de entregar insight real. Não ampliar escopo para responder esta questão. |
| Matriz concreta wearable: providers, modalidade, importar/enviar/confirmar execução, formato, acesso/parcerias, latência e semântica de revogação (DR-13/58). | Engineering + Security; Founder apenas se houver compromisso comercial/prioridade fora do Scope. | Antes de prometer compatibilidade ou handoff técnico dependente; verificar documentação oficial vigente nessa etapa. |
| Packaging/preço/acesso comercial (DR-12/24). | Founder, informado por custos e evidência. | Antes de checkout, trials ou promessa comercial; não é lacuna de tese. |
| Retenção/deleção, idade e verificação de canal, isolamento por Crew, capacidades de cancelamento externo e reconciliação técnica (DR-14/52/53). | Engineering + Security; jurídico competente conforme necessário. | Antes de coleta/persistência/integração real. Requisitos documentais preservados não são validação jurídica ou técnica. |
| Evidência de coordenação, eficácia/segurança, retenção/valor social e disposição a pagar; métricas sem premiar volume inadequado (DR-19/25). | Research + Data/Analytics, com Product/UX. | Antes de claims, avaliação clínica/performance, incentivo quantitativo ou decisão experimental dependente. |
| Tecnologia de IA/agente opcional, evals, custos e autonomia ampliada (DR-35/51). | AI Systems + Engineering + Security + Product/UX; Founder para ampliação estratégica. | Só se conversa/modelo for selecionado para o release; tarefas diretas/Engine não dependem dele. |

Não estão abertas: o wedge Run×Strength, a ausência de Cycling/Swimming na V1, Nutrition insights, Crew Lite, o objetivo bidirecional wearable e a missão sem código/Figma. Não repedir essas decisões.

## 6. Findings carregados e handoff

RA3-01–04 e DI4-01–04: têm disposição por cláusula no Truth Map 1.0; não reutilizar o PASS 2.3.0. Os findings históricos SEC-J/UX-J/PCG-J não são apagados. Seus controles ainda pertinentes foram consumidos no domínio/arquitetura atuais: consentimento por finalidade/Crew, convites sem enumeração, sem exposição de ausência, retorno legítimo, mínima retenção, saída/revogação, import/export independente e limites de shareables. Durações, provas técnicas e memo jurídico continuam abertos em §5; conceitos sociais removidos da V1 não mantêm dependência automática.

Revisão nova de fidelidade/interpretabilidade/privacidade/closed loop: evidência em [audit trail 3.0.0](../audits/rebaseline-3.0.0/REBASELINE_RECORD.md) e estado final no [Canonical Index](../canon/CANONICAL_INDEX.md). A aceitação dos consumidores pelo Product/UX worker será registrada nesse índice; Claude não é tratado como tendo aceitado um handoff antes de lê-lo.

## Registro histórico integral — PDR-0.6 (não operacional)

<!-- HISTORICAL_RECORD_START: PDR-0.6 byte-identical; current authority is sections 1–6 above. -->

# Vilumo Fit — Product Decision Register

| Campo | Valor |
|---|---|
| Revisão | **PDR-0.6** · 2026-10-11 |
| Linhagem | PDR-0.1 (Architect, 2.0.0) → PDR-0.2 (Chief, CORRECTION-01: FG-1 resolvido por C023; DR-38–DR-41) → PDR-0.3 (Architect: reconciliação; DR-42–DR-46) → PDR-0.4 (Architect). 0.3 → 0.4: correction loop 1 after independent judges → PDR-0.4.1 (Architect). 0.4 → 0.4.1: registro, sem nova decisão de design, das decisões do Founder no gate da fase 3 (2026-10-10); fonte `audits/phase-1-3-reviews/founder-gate-phase3-decisions.md` → PDR-0.5 (Architect). 0.4 → 0.5: Phase 4 CP-A — aceite do Canon 2.2.0, decisões do Founder da fase 3 e correções carregadas (base: PDR-0.4.1) → **PDR-0.6** (Architect). 0.5 → 0.6: Phase 4 CP-B — Product Architecture PA-0.1, resolução dos itens CPB, decisão do Founder sobre experiência híbrida e findings das re-revisões de 2026-10-11 |
| Natureza | Artefato de trabalho: classificação das lacunas encontradas em PTM-0.5.1, PDM-0.6 e PA-0.1. Não canônico; não cria doutrina. |
| Autoridade | Subordinado a **VILUMO-PTC-2.2.0** (SHA-256 `5c780fdc336166066edbc9ed62dfa0e947efdb5177898faf6c934346f6e35601`); aceite do handoff em §9. A PDR-0.4.1 traduzia o 2.1.0 (`4d4ccb65…6dbd1`), agora substituído. Owners e triggers de O001–O014 são os do Canon. Também segue a decisão do Founder de 2026-10-11 sobre experiência híbrida (DR-50), vigente pelo §2 do Canon e em formalização como PTC-2.3.0. |
| Autor (worker) | Product/UX Architect |
| Revisão independente da 0.3 | Relatórios em `audits/phase-1-3-reviews/`. **UX-J** (`UX-J_domain-model-structure.md`): **FAIL**, com UX-J-01 a UX-J-04 bloqueantes e UX-J-05 a UX-J-12 não bloqueantes · **PCG-J** (`PCG-J_canon-ingestion-domain-decisions.md`): J1, J2 e J3 **PASS**, com PCG-J-01 a PCG-J-12 e rulings J4 · **SEC-J** (`SEC-J_domain-model-boundaries.md`): **SECURITY_READY_WITH_CONDITIONS**, com SEC-J-01 a SEC-J-15. Resolução por finding: §8 |
| Re-revisão do delta 0.4 | Mesmas instâncias, seções finais dos três relatórios: **UX-J** Structural **PASS** (UX-J2-01 a UX-J2-07) · **PCG-J** J3′ **PASS** (PCG-J2-01 a PCG-J2-06) · **SEC-J** **SECURITY_READY_WITH_CONDITIONS** (SEC-J2-01 a SEC-J2-10). Nada bloqueante. Resolução: §11 |
| Re-revisão do delta 0.5 | 2026-10-11, mesmas instâncias: **UX-J** Structural **PASS** (UX-J3-01 a UX-J3-05) · **PCG-J** **PASS** nos três julgamentos sobre o Canon 2.2.0 (PCG-J3-01) · **SEC-J** **SECURITY_READY_WITH_CONDITIONS** (SEC-J3-01 a SEC-J3-09). Nada bloqueante. `DOMAIN_MODEL_APPROVED` consolidado pelo Chief sobre a PDM-0.5. Resolução: §12 |
| Gate | Insumo de `PRODUCT_DECISIONS_SUFFICIENT`, consolidado pelo Chief — não por este documento. Itens "resolvidos" ou "corrigidos" valem até a re-revisão independente. |

**Classes** (CURRENT_MISSION §3): **AGENT-RESOLVABLE** — decidível por especialista competente; quando dentro da autoridade de Product/UX, a decisão está registrada aqui · **EVIDENCE-REQUIRED** — depende de evidência ou de autoridade de domínio · **FOUNDER-DECISION** — reservada ao Founder · **LATER DESIGN SPACE** — escolha legítima que não bloqueia os outcomes atuais.
FG-1/DR-21 registra o conjunto esportivo decidido em C023. O Founder Gate da fase 3 foi realizado em 2026-10-10: FG-2 resolvido (Pacote A, formalizado em C025), FG-3 confirmada A como base de trabalho, e mercado, idiomas, plataformas e idade mínima decididos (§3; DR-47). FG-4 vai ao Release Priorities gate (D-CHIEF-02). Sequencing e launch depth pertencem ao Release Scope (Canon §7.1; DR-45).

> **Reconciliação 0.3.** Preserva a CORRECTION-01 (C016–C023 e D010–D011 vigentes; FG-1 resolvido; DR-38–DR-41) e acrescenta as decisões estruturais e lacunas que a reconciliação revelou: DR-42 (Capacidades esportivas), DR-43 (faseamento, interpretação do PCG), DR-44 (fronteira de domínio da Shareability), DR-45 (sequencing e launch depth) e DR-46 (shareables de lançamento). Nenhum item novo é Founder Gate agora.

> **Correção 0.4 (correction loop 1).** Não acrescenta DR novo nem doutrina nova. Registra:
> - a resolução de cada finding dos três judges (§8);
> - as decisões do Chief D-CHIEF-01 a D-CHIEF-03 (§5);
> - os rulings do PCG como leituras LD interinas (§6);
> - as condições Security carregadas (§7).
>
> Também reescreve FG-2, reenquadra FG-3 como confirmação inicial não bloqueante e difere FG-4 ao Release Priorities gate.

> **Sincronização 0.5 (Phase 4 CP-A).** Sem doutrina nova e sem decisão do Founder. Registra:
> - o aceite do handoff do Canon 2.2.0 (§9);
> - o estado dos rulings interinos que o 2.2.0 formalizou (§6, §6.1);
> - DR-47 (restrições de lançamento do Founder), DR-48 (O013) e DR-49 (O014);
> - as condições do delta SEC-J (§7);
> - o escopo da CP-B como itens abertos (§10), sem iniciá-lo;
> - a tabela de resolução da CP-A (§11).

> **Atualização 0.6 (Phase 4 CP-B).** Sem doutrina nova. Registra:
> - a arquitetura de produto PA-0.1 (`product/PRODUCT_ARCHITECTURE.md`) e a resolução dos itens CPB e dos findings das re-revisões de 2026-10-11 (§12);
> - a decisão do Founder sobre experiência híbrida (DR-50), seus conflitos e sincronização (§13), a nova rota do AI Systems (DR-35, §4) e a lacuna do contrato do agente (DR-51);
> - DR-52 (parâmetros operacionais), DR-53 (mecanismos de entrada) e DR-54 (refinamentos do PDM propostos pela PA-0.1);
> - as condições SEC-J3 (§7).

## 1. Resumo para o Chief — o que bloqueia o quê

| Fase / gate | Bloqueado por | Nota |
|---|---|---|
| 2 · `DOMAIN_MODEL_APPROVED` | Consolidado pelo Chief sobre a PDM-0.5 (2026-10-11): UX-J **PASS**, PCG-J **PASS**, SEC-J **READY_WITH_CONDITIONS** | A PDM-0.6 acrescenta o agente e corrige UX-J3-01 e UX-J3-05; pede revisão Security e AI Systems |
| 3 · `PRODUCT_DECISIONS_SUFFICIENT` | Founder Gate da fase 3 (D-CHIEF-01): FG-2 (resolvido, Founder, 2026-10-10; C025); FG-3 como confirmação inicial, não bloqueante (confirmada A, 2026-10-10); plataformas, mercado, idiomas e idade mínima (respondidos, §3; DR-47) | FG-4 diferido ao Release Priorities gate. Não reapresentar FG-1/C023 |
| 4 · Product Architecture | PA-0.1 entregue; resolução da CP-B em §12. `PRODUCT_ARCHITECTURE_APPROVED` depende da revisão independente da PA-0.1 (UX-J, PCG-J, SEC-J e AI Systems para o agente). Fecham antes dele, com a revisão Security: SEC-J-03 com SEC-J3-01, e SEC-J-10 com SEC-J2-03 e SEC-J3-08. Um achado jurídico que afete a arquitetura precisa chegar antes (SEC-J2-08). Nenhuma solução dependente de O013 é adotada | Estrutura por Capacidade esportiva, sem detalhe de fluxo por modalidade (D-CHIEF-02). Entrega o Shareable Object Model (C026; DR-38) |
| 5 · Experience Model | DR-06 (Data/Analytics); regra analítica de DR-09 com O001; condição de DR-10 (R-DR-10); DR-16; DR-51 (contrato do agente); UX-J3-03 (fronteira da finalidade primária de I10); UX-J3-04 (tolerância do critério de aderência, com DR-20) | Estrutural por Capacidade esportiva (D-CHIEF-02) |
| Release Priorities gate do Founder (antes da fase 6; D-CHIEF-02) | Proposta Product/UX informada pelos critérios de credibilidade de Research (DR-20). O014 (DR-49) precisa estar decidida antes de declarar suporte pleno; O013 (DR-48), só se a proposta quiser representação limitada | Decide DR-45, a forma final de FG-3, FG-4 e DR-46 |
| 6 · Core Flows | Release Priorities gate; DR-18, DR-20; SEC-J-02, SEC-J-08 | DR-17 não bloqueia se as decisões forem tratadas como categorias abstratas com confiança |
| 7 · Release Scope | Consolida as decisões do Release Priorities gate; DR-15, DR-20 | — |
| 8 · UX Spec | C023; DR-15, DR-18, DR-20, DR-45; DR-31 (forma de representar Recovery); SEC-J3-05; SEC-J3-06 | — |
| 13–17 · Visual e componentes | DR-39 (Shareable Visual System), após baseline aprovado | — |
| 22 · Technical Handoff | DR-17 (cobertura do Safety Contract), DR-08 (método), DR-13, DR-25, DR-35, DR-52, DR-53; SEC-J-05 (durações), SEC-J-09, SEC-J-11, SEC-J-14 (memo), SEC-J-15 | DR-17 é lacuna de capacidade: o Chief decide como cobri-la |
| Nenhuma fase atual | DR-26, DR-27, DR-28, DR-36, DR-37 | Diferidos com owner e trigger |

**Leitura do worker** (autoavaliação, não veredito de gate):
- FG-2 está resolvido (Founder, 2026-10-10; §3) e formalizado em C025 (Canon 2.2.0). O handoff do 2.2.0 foi aceito (§9), sem DOCTRINE_BLOCKED.
- As re-revisões do delta 0.4 não tiveram bloqueio; seus findings foram tratados na CP-A ou entram na CP-B (§10, §11). Nenhuma decisão nova do Founder é necessária para a CP-B.
- FG-3 não bloqueia: a opção A foi confirmada como base de trabalho (Founder, 2026-10-10); a forma final fica no Release Priorities gate.
- DR-45 é decidido no Release Priorities gate, antes dos Core Flows. A cobertura crível por release continua necessária, e O014 (DR-49) precisa estar decidida antes de declarar suporte pleno.
- CP-B: a PA-0.1 está entregue e aplica a decisão do Founder de 2026-10-11 (DR-50). Não há decisão nova do Founder pendente além de O013, O014 e do memo jurídico.

## 2. Registro

### 2.1 AGENT-RESOLVABLE

| ID | Lacuna | Origem | Resolução / encaminhamento | Bloqueia | Owner | Trigger / estado |
|---|---|---|---|---|---|---|
| DR-01 | "Crew Member" (papel) confunde-se com "membro de uma Crew" | §6, C004; PTM N1 | **Resolvido:** "Crew Member" só para o papel canônico de participação leve; "participante da Crew" para qualquer pessoa com vínculo Ativo ou Pausado. A pausa não tira ninguém da Crew (UX-J-04). Base: §6, C004, D001. | Fases 4–8, 18 | Product/UX; rótulos finais: UI & Experience (fase 18) | Corrigido em PDM-0.4 |
| DR-02 | Fronteiras de domínio e pontos de contato entre os pilares | C002, D009, L007, L008, L014 | **Corrigido (proposta):** sete domínios mais a Shareability como capability transversal; Continuidade como domínio-ponte; o Social lê apenas a Contribuição; contratos I1–I10. Correções de UX-J-01: (1) I10 leva à Adequação, de forma privada, os desfechos, o motivo de ajuste e a interrupção da própria pessoa; (2) a Adequação é o único ponto de integração (carga × recuperação, treino × disponibilidade energética) e é dona do Plano e da sessão prescrita; (3) não há contrato Adequação → Performance; (4) a Interrupção é a fonte única da pausa da prática. Alternativas rejeitadas: PDM §10 (A1, A2, A5, A8, A9, A10, A11). **0.5:** I10 tem finalidade primária (re-planejar e re-basear) e secundária (dinâmica comportamental, C009), esta só com consentimento próprio via I6; motivos não alimentam SSP nem SPG antes de O007 e têm retenção limitada (PCG-J2-01, SEC-J2-02). | Fases 4, 22 | Product/UX; realização técnica: Engineering (fase 22) | Re-revisão do delta 0.5 |
| DR-03 | Como um Crew Member contribui sem contexto do motor | §12, C004, L010; O005 (parte Product/UX) | **Corrigido:** o Crew Member declara a própria Intenção e o próprio Desfecho, de forma estruturada. A Intenção declarada é entidade pessoal de Continuidade, com uma vigente por período, comum a todos os vínculos da pessoa, e chega a Continuidade por I3. A intenção não cruza para a Crew (PDM §8.1). O sistema não avalia a adequação de Crew Member. Risco aceito: autodeclaração inflada, de baixo impacto no modelo fechado sem recompensa de valor; acompanhar em O008. **0.5:** Crew Member com 0 Recovery State e 0 Nutrition Context; sua falta de dados é julgada contra a Intenção declarada (UX-J2-06); pode criar Crew (C025). | Fases 4–6 | Product/UX; Security (fronteira) | Corrigido em PDM-0.4; atualizado em PDM-0.5 |
| DR-04 | O que cruza do contexto pessoal para a Crew, e sob qual consentimento | L014, L017, §8, §11, §17; O005, O007 (parte Product/UX) | **Proposta:** (a) por padrão cruza só a Contribuição mínima ("fez o que fazia sentido"), com consentimento informado no aceite de cada Crew; (b) a categoria do desfecho cruza só por opt-in; (c) não cruzam no lançamento: sinais e scores de recuperação, nutrição, localização, métricas físicas, trajetória, motivos, intenção declarada, confiança, verificação, modo de participação e acesso a capacidades; (d) a Contribuição tem o mesmo significado para a Crew qualquer que seja a fonte (SEC-J-07); (e) sem alertas de ausência a terceiros e sem presença em tempo real; (f) pausa e saída sem penalidade. Avaliação Security sobre a 0.3: READY_WITH_CONDITIONS (SEC-J-01, SEC-J-02, SEC-J-07; §7). **0.5:** "mesmo significado" só entre fontes elegíveis (UX-J2-02); categorias opt-in comuns aos dois modos (SEC-J2-07); pausa sem horário, histórico ou frequência, e retorno compartilhado por Crew (SEC-J2-06); outras Crews da pessoa nunca visíveis (SEC-J-13). Detalhe: PDM §8. | Fases 4, 6, 8 | Product/UX propõe; Security avalia | Antes de especificar acesso ou compartilhamento (O005); condições em §7; modelo de consentimento e audiência na CP-B (CPB-03) |
| DR-05 | O que um compromisso compartilhado pode exigir | §8, §14, L008, L010, L018, L019 | **Resolvido, com rótulos corrigidos:** a parte de cada pessoa é o que faz sentido para ela (as decisões do motor ou a Intenção declarada). [C §8] Nenhum compromisso prescreve carga (dose ou volume). LD (PCG-J-03): sem meta coletiva em unidade física. LD de §14: modalidade, lugar ou objetivo comuns não são requisito de participação nem de reconhecimento; um objetivo comum adotado voluntariamente não é vetado (D002). | Fases 4–6 | Product/UX | Corrigido em PDM-0.4 |
| DR-06 | Como representar o progresso coletivo | L010, L018, L020, §11, §14, §19; O008 | **Direção resolvida:** progresso coletivo = continuidade dos compromissos honrados por comportamento apropriado de qualquer tipo; nunca soma física nem escore universal de esforço (LD: soma física dá contribuição nula ao descanso adequado e viola o teste do §11). **Pendente:** unidade, janela e representação, sem ranking individual. | Fases 5, 6 | Product/UX + Data/Analytics | Antes de reconhecer, pontuar ou recompensar (O008) |
| DR-07 | Como tratar atividades fora do suporte pleno vigente | L003, L004, L023, C023, C024, D011, §7.1 | **Resolvido (estrutura), no vocabulário do Canon §7.1:** dois estados por modalidade, no catálogo do produto (Declaração de suporte) e não na pessoa: plenamente suportada (planejamento e adaptação com profundidade crível) e não declarada, só contexto do motor (conta em carga, recuperação e continuidade, sem nenhum meio de declarar suporte). Não há estado de suporte limitado: é O013 (DR-48), não adotada. O estado é comunicado com honestidade. Os caminhos de leitura são design space de Product/UX (D009, DR-42; PCG-J2-04): modalidade D011 sem capacidade → Leitura de contexto; modalidade de C023 no nível de contexto transitório → a própria capacidade, em profundidade parcial, entregando só carga e implicações (UX-J2-05). Para C023, o nível de contexto exige prazo no Release Scope vigente; sem prazo, a partir do primeiro Release Scope, é estado final e exige decisão explícita do Founder sobre aquela modalidade (§7.1). | Fases 4–8 | Product/UX; declaração por release: Release Scope, com o Founder decidindo (§7.1); alterar o conjunto: Founder | Conjunto mínimo C023 resolvido; release coverage em DR-45 |
| DR-08 | Como a confiança do dado se manifesta | C012, C015, D003 | **Resolvido (estrutura):** atributo obrigatório de sinal e decisão; níveis qualitativos (suficiente, parcial, conflitante, desatualizada, ausente); visível à pessoa; nunca cruza para a Crew nem para shareables. **Pendente:** método e limiares (fase 22); conduta sob confiança baixa (DR-17). | Fases 4, 8, 22 | Product/UX; Engineering, Data/Analytics, AI Systems | Método antes do handoff técnico |
| DR-09 | Distinguir recuperação, falta de dados, interrupção e retorno | L013, L006, §15 | **Corrigido:** máquina de estados aninhada (PDM §6.6). Sem dados e Interrompido são alcançáveis de qualquer estado ativo e de Retornando. Não há estado "abandono". A interrupção existe só por declaração da pessoa e é a fonte única da pausa da prática. O retorno re-baseia no contexto atual. A saída de Retornando está definida para Full Member e para Crew Member, sem exigir prova. O descanso não registrado termina Honrada, com evidência compatível, ou Desconhecida, e nunca como falha. A pausa de vínculo não marca ausência, e nenhum estado é exposto automaticamente. Limiares e tratamento analítico: fase 5, com O001. **0.5:** Interrupção e vínculo Pausado são independentes (UX-J2-07); a falta de dados do Crew Member é julgada contra a Intenção declarada (UX-J2-06); a oferta de pausar vínculos ao declarar interrupção vai à CP-B (CPB-10). | Fases 5, 6 | Product/UX; métricas de inatividade e falta de dados: Data/Analytics (O001) | Corrigido em PDM-0.4; atualizado em PDM-0.5 |
| DR-10 | Autoridade do motor versus agência da pessoa; caminho do social para o AP | L007, L008, §8, §20 | **Resolvido, com a condição de R-DR-10:** o motor determina o apropriado e re-planeja a partir do desfecho recebido por I10; a pessoa decide o que faz; desvio não é punido. Honrar uma decisão indicada de reduzir, recuperar ou descansar é reconhecido estritamente acima de um desvio para mais volume (LD, R-DR-10). O social só alcança o AP como intenção de agenda declarada pela própria pessoa (I5), nunca como prescrição. **0.5:** a Continuidade classifica o Desfecho com o critério de aderência carregado com a sessão prescrita (UX-J2-01); um desvio para mais volume não é fonte elegível de Contribuição (UX-J2-02). | Fases 4–6 | Product/UX | Corrigido em PDM-0.4 (§6.4); atualizado em PDM-0.5 |
| DR-11 | Quais conceitos sociais são launch-candidate | C005, D002, §10, §30; O012 | **Proposta (tradução Product/UX sob O012; R-DR-11, formalizado no Canon §7.1):** LC = Crew, vínculo, convite, compromisso compartilhado mínimo, contribuição (inclusive o retorno compartilhado pela pessoa, mesmo sem compromisso ativo), apoio, progresso coletivo. DA = Season, Together, Rally, Moments, Mission e Pact além do mínimo, Crew Memory, SSP, SPG. Base: cobre os outcomes do §30 com a menor superfície (L022); adiar conceito aceito não muda direção (D002). Exemplos de shareables do §21.1 (metas, streaks e campanhas coletivas) não criam obrigação (PTM N12). | Fases 4, 7 | Product/UX traduz (O012); Founder decide a prioridade de lançamento (O011) | FG-3 confirmada A (Founder, 2026-10-10) como base de trabalho; a forma final vai ao Release Priorities gate (D-CHIEF-01, D-CHIEF-02). Pelo Canon §7.1, adiar um conceito aceito é prioridade de lançamento, e abandoná-lo ou redefini-lo é O012 |
| DR-12 | Acoplamento entre papel e acesso comercial | §6, §12, §22; O005, O009 | **Resolvido:** "Acesso a capacidades" é conceito separado do modo de participação; nenhuma regra comercial assumida. O modo não é congelado como plano (§6); mapear papel a plano continua opção do Founder em O009 (§22; PCG-J-02). | Fases 4, 7 | Product/UX | Resolvido; texto ajustado em PDM-0.4 |
| DR-13 | Origem dos sinais (sensores, integrações, autodeclaração) | §7, §27, C012, D003 | **Resolvido (estrutura):** sinais agnósticos de fonte, cada um com confiança; autodeclaração sempre disponível como base; dispositivos e integrações como enriquecimento. Integrações específicas são LATER (Engineering); Founder só se houver compromisso comercial. **0.6:** a arquitetura de consentimento das fontes está em PA-0.1 AR-20 (SEC-J3-04); a estratégia de integração segue na fase 22. | Fases 4, 22 | Product/UX; Engineering | Integrações na fase 22 |
| DR-14 | Persistência mínima de dados sociais | L014, §14, §16, §17; O007 | **Proposta corrigida (regra de SEC-J-05):** Contribuições e Apoios persistem enquanto o compromisso está ativo e para seu encerramento; memória além disso é Crew Memory (DA). Na saída, as Contribuições e os Apoios da pessoa são eliminados ou reduzidos a um fato da Crew, sem contagem, posição ou composição da qual se derive a participação. O ex-participante fica fora de shareables coletivos futuros sem novo consentimento, e o Registro de Continuidade pessoal fica intacto. Ao encerrar a Crew, os dados sociais por pessoa são eliminados após prazo limitado. Substitui "deixam de identificar a pessoa" (PCG-J-12). **0.5:** o retorno compartilhado fora de compromisso e seus Apoios têm ciclo de vida limitado, e a regra de saída vale para eles (UX-J2-03, SEC-J2-04); os motivos de I10 têm retenção limitada (SEC-J2-02). Durações e prova de eliminação: fase 22. | Fases 4, 22 | Product/UX propõe; Security avalia; Engineering (fase 22) | Antes de qualquer persistência social (O007); condição residual em §7 |
| DR-15 | Tipos de objetivo (Goals) suportados | L004, C006; O004 | **Com C023 vigente:** Product/UX propõe tipos de objetivo por modalidade de primeira classe; o Founder confirma em `RELEASE_SCOPE`, depois de DR-45 (Release Priorities gate, D-CHIEF-02). | Fases 5–8 | Product/UX; Founder (confirmação) | Com C023 vigente |
| DR-16 | O que conta como progresso para a pessoa (parte Product/UX de O001) | C007, L006, L013, L020 | **Resolvido (princípio):** progresso = desfechos honrados de qualquer tipo apropriado — executar, adaptar, recuperar, descansar, retornar — sem volume como critério; retornar conta. Detalhe na fase 5; métrica operacional em DR-25. | Fase 5 | Product/UX (+ Data/Analytics) | Resolvido em princípio |
| DR-42 | Fronteira das modalidades de primeira classe dentro do domínio | C023, L003, L004, L018, L023, §30; DR-41 | **Resolvido (proposta):** cada modalidade de primeira classe é uma Capacidade esportiva dentro de Performance. Específico: representação de workout e sessão (com as estruturas de sessão admissíveis oferecidas à Adequação), intensidade e métricas próprias, contribuição de carga com confiança, implicações para recuperação e alimentação entregues à Adequação via I1, fatos de perfil. Compartilhado: pessoa, objetivos e prioridades, carga total e interferência, Recovery State, Nutrition Context, Schedule, Decisão, Plano e Continuidade. Nenhuma capacidade decide adequação sozinha, e nenhuma métrica física comum entre esportes serve à contribuição, comparação ou reconhecimento (LD; PDM §3.1). As fases 4–5 não detalham fluxo por modalidade (D-CHIEF-02). Atende DR-41 na fase 2 sem antecipar mecânicas por modalidade. **0.5:** cada capacidade define o critério de aderência das estruturas de sessão que oferece (UX-J2-01); em nível de contexto, entrega só carga e implicações (UX-J2-05). | Fases 4–8, 22 | Product/UX; detalhe por modalidade com Research (DR-20) | UX-J delta PASS na 0.4; re-revisão do delta 0.5 |
| DR-43 | Como tratar a atividade da pessoa numa modalidade de C023 que ainda não atingiu a cobertura mínima crível | C023, C024, L003, L004, L023, §7.1; PTM N8 | **Resolvido no Canon 2.2.0 (§7.1, C024; antes R-DR-43):** a atividade informa o contexto do motor com confiança explícita, sem declaração de suporte e sem omissão silenciosa. O nível de contexto transitório exige prazo no Release Scope vigente; sem prazo, é estado final, que exige decisão explícita do Founder sobre aquela modalidade. As representações vedadas por C024 nunca são usadas, e a representação limitada fica em O013 (DR-48), não adotada. A leitura pela própria capacidade, em profundidade parcial e só com carga e implicações, é design space de Product/UX, sem dependência de doutrina (PCG-J2-04; UX-J2-05) | Fases 6–7; opções de DR-45 | PCG formalizou no Canon; Product/UX aplica | Formalizado; PDM-0.5 §3.1 |
| DR-44 | Fronteira de domínio da Shareability | C016–C022, L009, L012, L014, L017, L020, §30 | **Proposta corrigida:** capability transversal sem dados de origem. Compõe a partir de projeções permitidas: progresso da própria pessoa vindo de Continuidade e de Performance (I7), e objetos coletivos consentidos ou agregados não reidentificáveis, inclusive o convite (I8). Projeta só por ação da pessoa, com consentimento por finalidade e destino (I9), em sentido único (LD, R-A8). Dados sensíveis da própria pessoa não são fonte no modelo atual; incluí-los é decisão do DR-38 com Security. A cópia externa é irrevogável, e isso é informado antes. Há estados Recusado, Expirado e Revogado (PDM §6.9). Em Crew pequena vale o consentimento de cada membro identificável (regra concreta: SEC-J-10). Base de domínio para DR-38; avaliação Security via DR-40 e §7. **0.5:** o objeto de convite projetado nunca inscreve por si (C025); I9 sem conversão nem atribuição (SEC-J2-05); leitura de C021 incorporada (PDM §3.2). | Fase 4 | Product/UX propõe; Security avalia | Shareable Object Model em PA-0.1 §10 (CPB-01); fecha com a revisão Security |
| DR-51 | Contrato de confirmação, desfazer e autonomia do agente do produto: não existe | DR-50 (princípio 4: "Respeite os contratos existentes de confirmação e autonomia"); L007, L014, L022. O rascunho do PTC-2.3.0 propõe O015 para esta lacuna, pendente de publicação | **Lacuna registrada, sem inventar o contrato.** Regras de produto da fase 4: PA-0.1 AR-21 a AR-27 (posição, escopo e limites do agente; nada se aplica sem confirmação explícita do alcance exato; sem autonomia; desfazer pelo caminho direto do objeto). O contrato completo de comportamento é da fase 5 | Fase 4 (regras de produto, antes de `PRODUCT_ARCHITECTURE_APPROVED`); fase 5 (contrato) | Product/UX com AI Systems & Agent Experience; Security onde houver dado ou ação sensível | Regras de produto em PA-0.1; contrato na fase 5 |
| DR-54 | Refinamentos do PDM propostos pela PA-0.1 | PA-0.1 §17 | Incorporar na próxima revisão do PDM, depois da revisão independente da PA-0.1: (1) conteúdo do convite antes do aceite (AR-42); (2) encerramento só pela saída do último participante (AR-53); (3) estado Expirado inalcançável no lançamento (AR-61, AR-63); (4) revogar opt-in de categoria minimiza o que já está visível (AR-35); (5) Apoio visível só a quem envia e a quem recebe (AR-55); (6) remoção simétrica, sem poder de criador (AR-50, AR-52) | Próxima revisão do PDM | Product/UX | Depois da revisão independente da PA-0.1 |

### 2.2 EVIDENCE-REQUIRED

| ID | Lacuna | Origem | Resolução / encaminhamento | Bloqueia | Owner | Trigger |
|---|---|---|---|---|---|---|
| DR-17 | Safety Contract e política de decisão do motor: limiares, conduta sob confiança baixa, populações, fontes | C015, O003, H004; PTM N5 | Exige autoridade de domínio (fisiologia do exercício e saúde) e evidência, agora para quatro modalidades de primeira classe. **Lacuna de capacidade:** nenhum papel instalado detém safety fisiológica; Security cobre privacidade e abuso. As fases 4–8 tratam decisões como categorias abstratas com confiança; a política não pode ser inventada por Product/UX nem por Engineering. | Fase 22 (cobrir ou declarar como pré-requisito); implementação (fora desta missão) | Autoridades de produto, segurança e domínio, coordenadas pelo Chief (O003); Research informa | Antes de implementar ou liberar adaptações reais; recomendação: Chief define a cobertura antes da fase 22 |
| DR-18 | Contexto nutricional suficiente por objetivo | C006, L021, D004; O004 | Definir o mínimo que sustenta as decisões das áreas do C006 para os objetivos suportados, sem food logging completo por padrão. Aprofundar (D004) só com evidência e decisão do Founder. | Fases 6, 8 | Product/UX e Research informam; Founder só em caso de expansão | Com o conjunto C023 vigente, antes dos Core Flows de nutrição |
| DR-19 | Claims de efeito social, de desempenho, de retenção, de distribuição e de moat | H001–H006, C008, C016, O002, §5, §21.1 | Nenhuma hipótese aparece como fato em produto, conteúdo ou marketing; distribuição orgânica, aquisição e efeitos de rede via Shareability também são objetivos sujeitos a evidência (§21.1); medir efeito social exige metodologia (O002). Não bloqueia design; restringe Conteúdo (fase 18) e instrumentação (fase 22). | Fases 18, 22 | Research + Data/Analytics; Founder decide a aposta | Antes de atribuir causalidade ou anunciar benefício |
| DR-20 | O que é "profundidade crível" para cada modalidade | L023, C023, §7, §31 | Com o conjunto C023 vigente, definir por Capacidade esportiva (PDM §3.1) os critérios de profundidade — estrutura de sessão, progressão, adaptação, carga — com evidência de domínio; sem critério não há declaração de suporte pleno. Insumo de DR-45. **0.5:** quem fixa os critérios e quem verifica, antes de uma declaração de suporte pleno, é O014 (DR-49), decisão do Founder. | Fases 5–8; 7 | Product/UX + Research (+ autoridade de domínio do DR-17); alocação: O014 | Com o conjunto C023 vigente, antes do Release Priorities gate (insumo de DR-45; D-CHIEF-02) |
| DR-53 | Mecanismos de entrada: verificação de idade e comprovação do canal do convite | DR-47, C025; PA-0.1 AR-09, AR-41; SEC-J3-02, SEC-J-14 | A arquitetura fixa os requisitos: todo caminho que cria identidade passa pela verificação; fica só o resultado ("adulto: sim") e um fato mínimo de auditoria; uma falha não deixa perfil; o aceite direto exige comprovar o canal do convite. O método, os dados mínimos e a retenção dependem de Engineering, de Security e do memo jurídico do Founder. Um verificador terceiro é nova fronteira de confiança e pede revisão Security quando for escolhido | Fase 22; implementação, fora desta missão | Engineering + Security; Founder (memo jurídico) | Na escolha do método, antes do handoff técnico |

### 2.3 FOUNDER-DECISION

| ID | Lacuna | Origem | Encaminhamento | Bloqueia | Owner | Trigger |
|---|---|---|---|---|---|---|
| DR-21 = **FG-1** | Minimum First-Class Sport Set · RESOLVED | C023/L023/D011, §7 | Running, Cycling, Swimming e Strength Training obrigatórios como primeira classe; não repetir aprovação. Sequencing e depth pertencem a Release Scope (DR-45). | Não bloqueia fases como escolha esportiva ausente; cobertura crível ainda necessária | Founder decidiu o conjunto; Product/UX/Research informam release coverage | Antes de promessa de suporte pleno/release |
| DR-22 = **FG-2** | Fronteira da Crew: Crews por pessoa, ordem de tamanho, direito de criar, critérios de relação real, descoberta no modelo fechado | O006, L011, §13, C003, C025 | Resolvido no Founder Gate da fase 3 (§3; D-CHIEF-01) e formalizado em C025 (Canon 2.2.0); os valores de referência ficam em §3. Quem pode criar uma Crew foi decidido aqui, não em DR-33 (PCG-J-08) | Fases 4, 6; revisão Security | Founder; Product/UX propõe | RESOLVIDO (Founder, 2026-10-10): Pacote A (§3); C025 |
| DR-23 = **FG-3** | Forma do Social Continuity no lançamento | O011, O012, L002, D002 | Confirmação inicial, não bloqueante, da opção A como base de trabalho (§3; D-CHIEF-01); a forma final vai ao Release Priorities gate (D-CHIEF-02) | Não bloqueia a fase 4; fase 7 | Founder (O011); Product/UX traduz (O012) | CONFIRMADA A (Founder, 2026-10-10) como base de trabalho; Release Priorities gate (decisão final) |
| DR-24 = **FG-4** | Modelo comercial dentro do escopo de design | O009; O005 (parte estratégica) | Diferido ao Release Priorities gate (D-CHIEF-01, D-CHIEF-02); entrada em §3 | Fases 7, 21 | Founder | Release Priorities gate, antes da fase 6 |
| DR-25 | Métrica operacional e prioridade de valor de Appropriate Continuity | O001, L020, §23 | Data/Analytics propõe com Product/UX unidade, janela, denominadores e contexto; o Founder decide a prioridade de valor. Não bloqueia as fases 4–8 (DR-16 cobre a semântica). | Fase 22; qualquer incentivo baseado em métrica | Data/Analytics + Product/UX; Founder | Antes de adotar métrica ou incentivo |
| DR-26 | Adoção da definição como tagline | C010 | Não acionada; tratar na fase de Brand. | Fase 12 | Founder | Fase 12 |
| DR-27 | Spin-off do social | C001, §29, O010 | Não acionada; exige evidência material de valor independente do motor. | — | Founder; Research informa; Chief registra | Evidência material |
| DR-45 | Sequencing, launch depth, ordem de dependência, cobertura mínima crível e profundidade progressiva das quatro modalidades | C023, C024, L023, §7.1; O011, O014 | **Canon §7.1 (Release Scope; antes R-DR-45):** Product/UX propõe; Research & Evidence e autoridades de domínio informam os critérios de cobertura (DR-20); Engineering informa a ordem de dependência técnica; o Chief coordena. O Founder decide as prioridades estratégicas: sequencing e prazos, launch depth acima da cobertura mínima crível e quais modalidades são declaradas plenamente suportadas. Para cada modalidade de C023 sem suporte pleno, o Release Scope registra prazo em release ou data; sem prazo, é estado final e exige decisão explícita do Founder sobre aquela modalidade. Ninguém declara suporte pleno abaixo da cobertura (L023); quem fixa os critérios e verifica é O014 (DR-49). Nenhuma representação limitada é proposta antes de O013 (DR-48). Timing (D-CHIEF-02): as fases 4–5 ficam estruturadas por Capacidade esportiva, sem detalhe de fluxo por modalidade, e a decisão entra no Release Priorities gate, antes da fase 6. Este registro não prepara a proposta agora. | Fases 6–8 (Core Flows e UX Spec por modalidade); 7 | Product/UX propõe; Research informa; Founder decide (§7.1) | Release Priorities gate (antes da fase 6) |
| DR-46 | Quais shareables entram no primeiro release | C016, C019, D010, C026; O011; PTM N11 | **Canon §7.1:** a seleção de objetos e expressões integra o Release Scope. Após o Shareable Object Model (C026, DR-38), Product/UX propõe o conjunto de lançamento, e o Founder decide as prioridades estratégicas; partes que são escolha dentro do design space seguem os owners próprios, e na dúvida o Chief as leva ao Founder. A capability existe na arquitetura (C016, C017) independentemente da seleção. | Fase 7 | Product/UX propõe; Founder decide (§7.1) | Release Priorities gate, após DR-38 (D-CHIEF-02) |
| DR-47 | Restrições de lançamento: mercado, idiomas, plataformas e idade mínima · RESOLVIDO | Founder Gate da fase 3 (MKT, PLT e o seguimento sobre idade); fora do Canon | Mercado: Brasil. Conteúdo em PT-BR e inglês desde o lançamento, pronto para internacionalização. App de smartphone em iOS e Android; relógios e outros apps só como fontes de dados, via integrações. Idade mínima 18+, verificada na entrada, sem fluxos de menores. Requisitos de produto em PDM-0.5 §2.3 e §6.1; mecânica da verificação na CP-B (CPB-11). SEC-J2-08 (menores) fica resolvida por exclusão de escopo. | Fases 4 (entrada), 8, 18 (conteúdo), 22 (integrações) | Founder decidiu; Product/UX aplica | RESOLVIDO (Founder, 2026-10-10); §3 |
| DR-48 | Representação de suporte limitado ou parcial de modalidade abaixo da cobertura mínima crível (O013) | O013, C024, L023, §7.1 | Não acionada: nem a arquitetura nem este registro adotam tal representação (§32 do Canon). Se uma proposta de Release Scope precisar dela, Product/UX propõe, Research & Evidence informa, o Chief coordena e o Founder decide, na divisão do Release Scope (§7.1). | Adoção de qualquer representação limitada (fase 4 em diante; Release Scope) | Founder decide; Product/UX propõe | Antes de qualquer Release Scope ou arquitetura adotar tal representação |
| DR-49 | Quem fixa os critérios de cobertura mínima crível de cada modalidade e quem verifica que a modalidade os atinge, antes de uma declaração de suporte pleno (O014) | O014, L023, §7.1; DR-20 | Não decidido. Product/UX propõe a alocação; Research & Evidence e autoridades de domínio informam; o Chief coordena; o Founder decide. É insumo de DR-20 e DR-45. Rota recomendada ao Chief: compor no Release Priorities gate. | DR-45 (declaração de suporte pleno); fase 7 | Founder decide a alocação | Antes de o primeiro Release Scope declarar uma modalidade plenamente suportada |
| DR-50 | Experiência híbrida · RESOLVIDO (Founder, 2026-10-11) | Registro `audits/founder-decisions/2026-10-11_hybrid-experience-founder-decision.md` (SHA-256 `1db720f2…ef27`); vigente pelo §2 do Canon; o PCG a formaliza no PTC-2.3.0, cujo rascunho (C028–C037, H008, O015) está em revisão e não é canônico | Nove princípios: entrada contextual; execução direta; profundidade por modalidade; agente para coordenação e decisões; consistência entre agente e telas; detalhes sob demanda; navegação previsível; social acessível; identidade preservada. Os exemplos de interação são classes de tarefa, não funcionalidades nem obrigações de lançamento, e a decisão não fixa tabbar, quantidade de telas, nomes de destinos nem escopo novo. Aplicação: PA-0.1, cujo §1 mapeia cada princípio, e PDM-0.6 (agente como canal de interação). Conflitos e sincronização: §13. Rotas: AI Systems & Agent Experience entra na revisão da fase 4 e na fase 5 (DR-35, DR-51); Security revisa o agente com a PDM-0.6; UI & Experience recebe o princípio 9 (PA-0.1 §16) | Fases 4, 5, 8 e 13–17 | Founder decidiu; Product/UX aplica; PCG formaliza | RESOLVIDO; os IDs do Canon entram depois da publicação do 2.3.0 |

### 2.4 LATER DESIGN SPACE

| ID | Escolha | Origem | Encaminhamento | Fase | Owner |
|---|---|---|---|---|---|
| DR-28 | Competição | D006, L015, L018; O008 | Fora do conjunto LC; só após critérios de justiça (O008) e decisão de escopo (FG-3, opção C). | Posterior | Product/UX + Data/Analytics |
| DR-29 | Reconhecimento, celebrações, streaks contextuais, badges e lembretes | D007, L013, L017, L019, L020 | Regras na fase 5 (corretas sob adaptar, recuperar ou descansar; sem culpa); manifestação nas fases 13+ e tom na 18. | 5, 13+, 18 | Product/UX; UI & Experience |
| DR-30 | Canal de apoio na Crew: gestos estruturados, texto curto ou conversa | §10, L012, L014, L016, L017 | **Resolvido (PA-0.1 AR-55):** gestos estruturados no lançamento, visíveis só a quem envia e a quem recebe. Texto livre só com as condições de SEC-J-06, e a capacidade de moderação é decisão de recursos do Founder. | 4 | Product/UX; Security se houver texto livre |
| DR-31 | Representação de Recovery (com ou sem score; superfícies) | D003, L005, C012, C015 | Sem score único obrigatório e sem precisão fabricada. **0.6:** superfícies resolvidas em PA-0.1 AR-19; a forma de representação, com ou sem score, fica para a fase 8. | 4, 8 | Product/UX; UI & Experience |
| DR-32 | Entrada, cold start e captura progressiva de contexto | L009, C004, C012 | Valor desde o início com confiança explícita; entrada como Crew Member com fricção muito menor; perfil por modalidade sem miniapp (L003, §30). **0.6:** resolvido em PA-0.1 §4.1 (entradas E1–E7), AR-09 e AR-11. | 4–6 | Product/UX |
| DR-33 | Procedimento de governança interna da Crew: quem convida, encerramento, remoção, silenciar, convite encaminhado | L011, L017, §13, C025 | Só o procedimento, dentro de C025: qualquer pessoa cria Crew; o convite nominal de um participante é o critério de relação real; o aceite encaminhado ou projetado exige a confirmação de quem convidou; o objeto de convite nunca inscreve por si. Remoção, silenciar, convite encaminhado e saída exigem avaliação Security (SEC-J-03, SEC-J-04); o trabalho é da CP-B (CPB-02, CPB-04). **0.6, resolvido em PA-0.1 AR-40 a AR-54:** remoção simétrica, sem motivo nem anúncio; silenciar; criador sem poder especial; encerramento só pela saída do último participante; reentrada de removido com a confirmação de quem removeu. | 4 (CP-B), 6 | Product/UX; Security |
| DR-34 | Evolução entre Crew Member e Full Member; acesso | D008, C004, L009 | A evolução nunca condiciona a permanência na Crew. **0.6:** resolvido em PA-0.1 AR-10 e na regra de destino dos dados da PDM-0.6 §6.1 (UX-J3-01). | 4–6 | Product/UX |
| DR-35 | Uso de IA no motor, nas explicações e no agente de coordenação | §7, §29, L022, C015; DR-50 | Sem identidade de chatbot, sem diagnóstico, sem precisão inventada. **0.6:** o agente do produto (DR-50) torna a IA matéria de experiência, e não só técnica. As regras de produto estão em PA-0.1 AR-21 a AR-27, inclusive a ausência de autoridade sobre a adequação (L007). O AI Systems entra na revisão da fase 4 (posição e escopo do agente) e na fase 5 (comportamento, DR-51), além da fase 22 (modelo, dados enviados e retenção, com Security e o memo jurídico) | 4, 5, 22 | AI Systems & Agent Experience; Product/UX; Engineering; Security |
| DR-36 | Social Support Profile, Social Performance Graph, Crew Memory | C005, C009, D005, §16; O007 | DA. Antes de qualquer perfilamento, inferência ou memória: significados, dados e consentimentos (O007) e avaliação Security; sem inferência psicológica como fato. | Posterior | Product/UX + Research; Security |
| DR-37 | Sessões combinadas (Together) e Moments | C005, D002, §10, §17 | DA; dependem da forma do SC (FG-3 e Release Priorities gate). I5 já previsto. Local de encontro é conteúdo declarado pela pessoa, não rastreamento; Security avalia. | Posterior (salvo FG-3 B ou C) | Product/UX; Security |
| DR-52 | Parâmetros operacionais da arquitetura | PA-0.1 AR-20, AR-26, AR-37, AR-40, AR-45, AR-50, AR-53, AR-64; PDM §8.3 | Valores de: validade e limite de usos de convites; limite de convites pendentes e taxa de envio por pessoa; limite de frequência de remoção; limite de recomposição de objetos coletivos; janelas de persistência (retorno fora de compromisso, motivos de I10, conversa com o agente, dados de fontes desconectadas); prazo de eliminação após o encerramento da Crew. Nenhum valor muda uma regra | 6, 22 | Product/UX (valores, fase 6); Engineering e Security (durações e prova de eliminação, fase 22) |

### 2.5 Obrigações a incorporar na fase adequada

| ID | Obrigação / Canon | Owner/fase | Parada / escalonamento |
|---|---|---|---|
| DR-38 | SHAREABLE OBJECT MODEL (C026): individual/coletivo, interno/externo, dados/consentimento, narrativa, customização/formato/destino; C016–C022/D010; inclui os critérios concretos de "quando apropriado" (leitura de C016). Base de domínio: DR-44 (PDM §3.2, §6.9, §8.5) | Product/UX, fases 4–8; integrar arquitetura existente; na CP-B, com SEC-J-10, SEC-J2-01, SEC-J2-03 e SEC-J3-08 (CPB-01). **0.6:** entregue em PA-0.1 §10 (AR-57 a AR-68), pendente de revisão | Modelo suficiente para scope/gate; ontologia aberta até arquitetura pronta |
| DR-39 | SHAREABLE VISUAL SYSTEM: template potential, foto/no-foto, tipografia/marca/identidade Crew, ratios/safe areas, dark/light, preview/motion útil; C027; D010/§30.1, cuja lista é ilustrativa | UI/Brand, fases 13–17 após baseline aprovado | Não impor lançamento de todas as variantes; floor global material UI/UX |
| DR-40 | Exposição externa de shareables coletivos exige consentimento apropriado e agregação/consentimento sem reidentificação; C021/L014. Proposta de domínio em DR-44; pontos 7–9 de PDM §8.4; condições SEC-J-10, SEC-J-11 e SEC-J-12 (§7). Pela leitura de C021, o consentimento do próprio membro para aqueles dados, finalidade e destino não é reidentificação, e nenhum consentimento revela outro membro. C025: o objeto de convite projetado nunca inscreve por si. LD (R-A8): I9 tem sentido único | Product/UX + Security quando boundary concreto for especificado | L3/Security para boundary; membership não é consentimento externo |
| DR-41 | C023/C024/L023/D011 na profundidade esportiva: Athlete Model, boundaries, dados/métricas/workouts, onboarding, Recovery/Nutrition/multi-sport, flows, Figma states e handoff pertinentes. Fase 2 atendida por DR-42 (UX-J delta PASS na 0.4) | Product/UX fases 2/4–8; UI fases 9/16; Engineering 22 | Sem placeholders, unidade social física universal ou release simultâneo/idêntico presumido |

## 3. Founder Gate

FG-1 registra a decisão vigente. As demais entradas tratam questões reservadas ainda abertas. Pede-se somente o necessário, sem reapresentar o que o Canon já fixa.
- **Founder Gate da fase 3 (D-CHIEF-01), realizado em 2026-10-10:** FG-2 (resolvido; C025); FG-3, confirmação inicial e não bloqueante (confirmada A); e a entrada de plataformas e mercado de lançamento, composta pelo Chief fora deste registro, com o seguimento sobre idade mínima (DR-47).
- **Release Priorities gate, antes da fase 6 (D-CHIEF-02):** FG-4, a forma final de FG-3, DR-45 e DR-46. Recomendação ao Chief: incluir DR-49 (O014), porque DR-45 não pode declarar suporte pleno sem ela; DR-48 (O013) só entra se a proposta precisar de representação limitada.
- **Decisão do Founder de 2026-10-11, experiência híbrida:** chegou fora dos gates acima e está registrada em DR-50.

### FG-1 — Minimum First-Class Sport Set (C023) · RESOLVED

**Decisão vigente do Founder.** Running / Corrida, Cycling / Ciclismo, Swimming / Natação e Strength Training / Musculação / Força / Fortalecimento são o mínimo de domínios de primeira classe. Não pedir nova aprovação desse conjunto nem recomendar removê-lo ou rebaixar uma das quatro a tracking incidental. A lista é CURRENT PRODUCT DECISION; L023 continua o invariante abstrato de profundidade e D011 mantém outras modalidades abertas.

**Separação de Release Scope.** Sequencing, launch depth, dependency order, minimum credible coverage e progressive depth por modalidade ainda precisam ser definidos pelo owner/fase competentes (DR-45). Não se exige profundidade idêntica ou lançamento simultâneo; nenhum faseamento pode violar L023, virar placeholder ou apagar C023 (DR-43). A decisão já tomada não bloqueia fases 5–8 como pergunta pendente de "quais esportes". DR-15, DR-18 e DR-20 continuam requerendo definição/evidência pertinentes para a cobertura do escopo aceito.

### FG-2 — Fronteira da Crew (O006) · RESOLVIDO (Founder, 2026-10-10)

**Decisão do Founder.** Resposta, literal: "Pacote A (Recomendado)".

| # | Parâmetro | Valor decidido |
|---|---|---|
| 1 | Crews por pessoa | Até 3 (referência revisável com evidência) |
| 2 | Tamanho | Ordem de círculo íntimo, até cerca de 8 (referência revisável com evidência, H006) |
| 3 | Quem pode criar uma Crew | Qualquer pessoa, Full Member ou Crew Member |
| 4 | Critério de relação real | Convite nominal de um participante, mais confirmação de quem convidou quando o aceite vem por convite encaminhado ou projetado |
| 5 | Descoberta no modelo fechado | Convite nominal mais objeto de convite projetável, que sozinho não inscreve ninguém |

Excluídos em qualquer opção: listagem ou busca pública de Crews, e ingestão de agenda de contatos.

Fonte: `audits/phase-1-3-reviews/founder-gate-phase3-decisions.md`.

Formalização no Canon: VFT-C025 (VILUMO-PTC-2.2.0, canônico desde 2026-10-10; resolve O006). Os valores numéricos ficam neste registro como parâmetros de referência do Founder (C025, §13). Qualquer alteração deles é decisão do Founder, e o PCG a classifica: dentro da ordem de tamanho e do limite baixo, basta atualizar este registro; fora deles, a alteração muda C025; na dúvida, é tratada como alteração de C025. A participação em mais de uma Crew e o direito de criar Crew vinculam o produto, e restringi-los exige decisão do Founder (§2). A tradução para o modelo de domínio está em PDM-0.5 §2.2, §4–§7, §8.2 e §8.5.

#### Opções apresentadas (histórico)

**Pergunta.** Qual é a fronteira operacional de "pequeno grupo privado com relação real" neste escopo? São cinco parâmetros: (1) Crews por pessoa; (2) ordem de tamanho da Crew; (3) quem pode criar uma Crew; (4) critério de relação real para entrar; (5) descoberta dentro do modelo fechado.

**Por que agora.** O trigger de O006 ("antes de definir membership, descoberta ou escala de Crew") cai na fase 4.
- Ter uma ou várias Crews por pessoa muda a arquitetura de informação.
- A ordem de tamanho muda presença, reidentificação e a existência de um caminho agregado para shareables coletivos.
- Criação, relação real e descoberta definem a entrada social leve (C004) e o canal de aquisição (C003). São também a fronteira que Security avalia (SEC-J-03, SEC-J-13).
- Quem pode criar uma Crew é um limite de participação que molda identidade e aquisição, logo é decisão do Founder (R-O005; PCG-J-08). DR-33 cuida só do procedimento.

**Já fixado pelo Canon (fora da decisão).**
- Grupo pequeno e privado, com relação real (L011).
- Sem rede pública de audiência, feed público, follower graph, influência ou comparação global (L012).
- "Convites e mecanismos de aquisição devem respeitar o mesmo modelo fechado" (§13).

**Aberto pelo Canon, e por isso na pergunta:** "Tamanho, critérios de relação real, membership e descoberta permanecem abertos" (§13; O006).

**Parâmetros, opções e efeito na arquitetura.**

| # | Parâmetro | Opções | Molda a arquitetura de informação? | Recomendação do Architect |
|---|---|---|---|---|
| 1 | Crews por pessoa | (a) 1; (b) poucas, com teto baixo (ex.: até 3); (c) sem teto | Sim, decidir agora: muda a topologia, a alternância entre Crews e o consentimento por Crew | (b) |
| 2 | Ordem de tamanho | (a) círculo íntimo (até cerca de 8); (b) grupo pequeno (até cerca de 20) | Sim, na ordem de grandeza: decidir agora, porque muda presença, reidentificação e a existência do caminho agregado de shareables coletivos. O número exato é ajustável depois, com evidência (H006) | (a) |
| 3 | Quem pode criar uma Crew | (a) qualquer pessoa, Full Member ou Crew Member; (b) só Full Member | Sim, decidir agora: define a entrada leve (C004) e quem pode iniciar aquisição (C003) | (a) |
| 4 | Critério de relação real para entrar | (a) basta o convite nominal de um participante; (b) (a) mais confirmação de quem convidou quando o aceite vem por convite encaminhado ou projetado; (c) (b) mais aprovação dos demais participantes ou de um administrador | Em princípio, decidir agora; o procedimento detalhado fica em DR-33 | (b) |
| 5 | Descoberta no modelo fechado | (a) só convite nominal, pessoa a pessoa; (b) (a) mais um objeto de convite projetável para fora do produto, que sozinho não inscreve ninguém (R-A8). Ficam fora em qualquer caso: listagem ou busca pública de Crews (L012, §13) e ingestão de agenda de contatos (SEC-J-03) | Sim, decidir agora: define os pontos de entrada e o objeto de convite (DR-38) | (b) |

Ajustáveis depois, sem rever a arquitetura: o número exato do teto, dentro da ordem escolhida; validade e limite de usos do convite; prazos; e o procedimento de DR-33, inclusive quem convida (proposta: qualquer participante).

**Pacotes de referência.**
- **A. Círculos íntimos múltiplos (recomendado):** 1(b) até 3 Crews; 2(a) até cerca de 8; 3(a) qualquer pessoa cria; 4(b); 5(b).
- **B. Círculo único:** como A, mas com 1(a), uma Crew por pessoa no lançamento.
- O antigo pacote "clube pequeno" deixa de ser uma opção fechada. Seus elementos aparecem separados, cada um com o próprio custo: 1(c) sem teto de Crews, 2(b) até cerca de 20 e 4(c) aprovação de administrador.

**Trade-offs.**
- **A, benefícios:** preserva a entrada leve e a aquisição por vários círculos reais (C003, C004), sem audiência.
- **A, custos reais:**
  - consentimento e Contribuição por Crew, com mais estados e mais decisões para a pessoa;
  - inferência cruzada entre Crews com membros em comum (SEC-J-13: as outras Crews de alguém nunca são visíveis);
  - maior superfície de convites encaminhados (SEC-J-03);
  - mais fricção para o Crew Member, que precisa alternar e consentir por Crew. Isso é custo para C004.
- **B:** arquitetura e consentimento mais simples, e sem inferência entre Crews. Em troca, gera atrito para quem tem mais de um círculo real (custo para C004 e H002), e ampliar depois exige rever a arquitetura de informação.
- **1(c), sem teto de Crews:** aproxima a pessoa de uma rede de grupos e multiplica os custos de A.
- **2(b), até cerca de 20:** reduz a sensação de círculo íntimo e torna a presença mais difusa (L017). Cria um caminho agregado de shareables que, ainda assim, precisa provar que não reidentifica (C021).
- **4(c), aprovação dos demais ou de administrador:** reforça a relação real, mas cria papel de administrador, pressão social sobre a aprovação e necessidade de moderação (Security). Aproxima-se de clube.
- **3(b), só Full Member cria:** reduz o caminho de aquisição pelo Crew Member e torna a entrada social menos leve (C004).

**Recomendação do Architect.** Pacote **A**. Teto e limite são parâmetros revisáveis com evidência (H006), não identidade.

**Consequências.**
- Fixa os estados de vínculo e convite (PDM §6.2), a topologia da Crew na fase 4 e o escopo das condições Security da fase 4 (SEC-J-03, SEC-J-04, SEC-J-12, SEC-J-13).
- Em qualquer opção, o Consentimento tem escopo por Crew (PDM §4; SEC-J-01).
- O procedimento (quem convida, encerramento, remoção, convite encaminhado) segue com Product/UX e Security, dentro da fronteira escolhida (DR-33).
- Em qualquer opção, grupos pequenos tornam agregados coletivos reidentificáveis. Shareables coletivos dependem do consentimento de cada membro identificável (C021, DR-44, SEC-J-10).

### FG-3 — Forma do Social Continuity no lançamento (O011) · CONFIRMADA A (Founder, 2026-10-10) como base de trabalho das fases 4–6; forma final no Release Priorities gate

**Decisão do Founder.** Resposta, literal: "Confirmar A (Recomendado)". Fonte: `audits/phase-1-3-reviews/founder-gate-phase3-decisions.md`.

#### Opções apresentadas (histórico)

**Pergunta.** O Founder confirma a opção A como base de trabalho das fases 4–6, ou pede que B ou C sejam estruturadas desde já?

**Por que agora, e por que não bloqueia.**
- A tradução de O012 é de Product/UX (DR-11; R-DR-11). Adiar conceitos aceitos não é mudança material de direção (D002). Por isso a fase 4 pode começar com A.
- O papel do Founder aqui é a prioridade de lançamento (O011), não confirmar a tradução de O012. O Founder só entra por O012 se um conceito for abandonado de vez ou redefinido.
- Uma confirmação cedo evita retrabalho caso o Founder queira B ou C estruturadas desde a fase 4.
- A forma final do lançamento é decidida no Release Priorities gate, antes da fase 6, junto com DR-45, FG-4 e DR-46 (D-CHIEF-02).

**Fora das alternativas.** Lançar sem Social Continuity rebaixaria um pilar (L002, C001; PTM §9, V11) e exigiria decisão do Founder para alterar um invariante.

**Alternativas.**
- **A. Mínimo thesis-critical:** Crew, vínculo e convite, compromisso compartilhado, contribuição consentida, apoio e progresso coletivo não físico. A contribuição inclui o retorno compartilhado pela pessoa, como em DR-11. Os demais conceitos ficam como direção aceita.
- **B.** A + sessões combinadas (direção Together) + Moments por opt-in.
- **C.** B + Seasons + competição no modelo fechado.

**O que cada opção acrescenta a esta missão.**

| Opção | Estrutura social | Escopo extra de design | Shareables que habilita |
|---|---|---|---|
| A | Centrada em compromisso: fora de compromisso ativo, a Crew não tem Contribuição nem presença, exceto o retorno compartilhado (PDM §6.7) | — | Individuais (I7): desfecho, retorno, marco, objetivo alcançado, progresso multiesporte. Coletivos (I8): identidade da Crew, compromisso concluído, progresso coletivo e convite |
| B | Acrescenta coordenação no tempo e no lugar | Agenda compartilhada e local de encontro (fronteira de privacidade, §17 → Security); ativação de I5; interação entre motor e sessão coletiva (L008: o motor pode indicar recuperar no dia do encontro); modelo de consentimento de Moments | Os de A, mais o registro de sessão combinada e momentos da Crew por opt-in |
| C | Acrescenta temporada e comparação | Critérios de justiça antes de pontuar (O008, L018, com Data/Analytics); estrutura de temporada; mais superfície de abuso e de comparação (L015, L019) | Os de B, mais resumo de temporada e resultados de competição, estes só depois de O008 |

**Trade-offs.**
- **A:** cobre os seis outcomes do §30 com a menor superfície (L022). A coordenação prática de encontros fica fora do produto e o social fica centrado em compromisso. Há risco de o social parecer leve enquanto H006 não tem evidência.
- **B:** reforça coordenação e presença (§10), ao custo das frentes de escopo da tabela.
- **C:** exige critérios de justiça resolvidos antes de pontuar (O008, L018). Traz maior risco de comparação e gamificação indevidas (L015, L019) e maior superfície.

**Decidido agora versus no Release Priorities gate.**
- **Agora (confirmação inicial):** a base estrutural das fases 4–6, que é A, ou A com B e/ou C estruturadas desde a fase 4.
- **No Release Priorities gate:** a forma final do lançamento, isto é, quais conceitos LC entram e quais viram LATER DEPTH. É decidida junto com DR-45, FG-4 e DR-46.

**Recomendação do Architect.** Confirmar **A**, com o contrato I5 já previsto para tornar B a primeira profundidade posterior.

**Consequências.** A define o perímetro social das fases 4–6. B e C passam a candidatos de LATER DEPTH no Release Priorities gate, com triggers: evidência de H001 e H006 e, no caso de C, O008 resolvido. Os shareables coletivos de cada opção seguem DR-38 e DR-46.

### FG-4 — Modelo comercial dentro do escopo de design (O009) · diferido ao Release Priorities gate

**Situação.** Diferido ao Release Priorities gate, antes da fase 6 (D-CHIEF-01, D-CHIEF-02). Não faz parte do Founder Gate da fase 3. As fases 4–6 não dependem dele, porque o acesso a capacidades já está separado do papel (DR-12).

**Pergunta.** O escopo de design e handoff desta missão inclui modelo comercial (planos, paywall, trial, acesso por papel)?

**Por que no Release Priorities gate.** Release Scope e `FIGMA_READY_TO_DEV` precisam declarar se superfícies comerciais estão cobertas. Monetização é OPEN QUESTION do Founder (O009). Full Member e Crew Member "não são planos comerciais congelados" (§6). Nenhuma formulação da tese fixa assinatura, trial, cobrança por grupo ou gratuidade de Crew Member (§22).

**Alternativas.**
- **A. Fora do escopo:** nenhuma superfície comercial; seam de acesso mantido; O009 adiado com trigger "antes de compromisso comercial".
- **B. Estrutura genérica:** pontos de entrada de plano e paywall, sem regras nem preços.
- **C. Decidir agora:** definir o modelo e projetá-lo por completo.

**Trade-offs.**
- **A:** não pressupõe nada que o Canon deixa aberto; `FIGMA_READY_TO_DEV` registra a limitação; incluir depois exige nova passagem de UX e UI. A deixa aberta a parte estratégica de O005, o acesso comercial por papel, inclusive a gratuidade de Crew Member (§22; R-O005), até o Founder decidir O009.
- **B:** reduz retrabalho de layout, mas cria superfícies sem regra. Engineering teria de inventar regras de acesso, o que contraria a condição de sucesso da missão.
- **C:** exige evidência de valor e custos dos domínios (O009) que ainda não existe, e amplia o escopo desta missão com fluxos e UI comerciais. Os limites do §22 (valor individual independente, entrada social leve, adequação, consentimento) valem para qualquer decisão comercial, em qualquer momento. Não são um risco específico de decidir agora.

**Recomendação do Architect.** **A**.

**Consequências.** Os handoffs declaram a exclusão como limitação explícita; nenhuma decisão comercial fica implícita em fluxos. Mapear papel a plano continua opção do Founder em O009 (PCG-J-02). Não bloqueia as fases 4–6.

### Decisões do Founder no gate da fase 3 fora do Canon

Registradas sem alteração. Não são doutrina do Canon: são decisões de escopo de produto e de postura legal. Fonte de todas: `audits/phase-1-3-reviews/founder-gate-phase3-decisions.md`.

| Tema | Resposta do Founder (literal) | Decisão registrada |
|---|---|---|
| Mercado e idiomas | "Brasil pt br + inglês, em relação a idade verifique o comportamento de apps da área como gymrats, strava, Runna, garmin coach e replique" | Mercado: Brasil. Idiomas: PT-BR e inglês |
| Plataformas | "iOS + Android (Recomendado)" | iOS + Android (app de smartphone). Relógios e outros apps só como fontes de dados via integrações; a estratégia de integração é decidida depois |
| Idade mínima | "18+, como Runna (Recomendado)" | 18+. A divergência entre os pares (GymRats e Strava 13+, Garmin 16+ fora dos EUA, Runna 18+) foi apresentada antes da decisão |

Efeito registrado na fonte para a idade mínima: a fase 4 inclui apenas verificação de idade, sem fluxos de permissão de responsável nem proteções específicas para adolescentes. A condição Security SEC-J2-08 (menores) fica resolvida por exclusão de escopo. Direitos do titular de dados como requisitos da fase 4 e o memo legal permanecem.

Registro desta revisão: DR-47. Requisitos de produto derivados: PDM-0.5 §2.3 (tabela de restrições), §2.1, §6.1 e §8.1. A verificação de idade em cada ponto de entrada e os direitos do titular como requisitos de arquitetura entram na CP-B (CPB-11, CPB-08).

## 4. Encaminhamentos a outros especialistas

| Para | Itens | Quando |
|---|---|---|
| Product Constitution & Governance | Revisão da PA-0.1: conformidade à tese e rótulos [C], [F], LD e [P]. Formalização da decisão de 2026-10-11 no PTC-2.3.0; depois da publicação, Product/UX sincroniza os IDs no PTM, no PDM, neste registro e na PA. R-DR-10, R-O005 (em parte) e R-A8(a) seguem como LD interinas | Revisão da PA-0.1; publicação do 2.3.0 |
| Security, Privacy & Abuse | Revisão das condições da PA-0.1 (PA-0.1 §15), inclusive a de CPB-07 (SEC-J3-09). Revisão própria do agente e das mudanças da PDM-0.6 em §6.1, §6.2, §8.1 e I9, que a re-revisão de 2026-10-11 não cobriu. Depois, as condições de §7 | Revisão da PA-0.1; fases 6, 8, 22 |
| Data, Analytics & Experimentation | DR-06 (O008), DR-16 e DR-25 (O001), DR-19 (O002 e efeitos de Shareability, medição) | Fase 5; fase 22 |
| Research & Evidence | DR-18, DR-20 (as quatro modalidades de C023; insumo de DR-45), DR-19 (auditoria de claims, inclusive H007), DR-49 (informa a alocação de O014) | Fases 5–8; Release Priorities gate; 18 |
| UI & Experience Designer | DR-39 (Shareable Visual System); princípio 9 da decisão de 2026-10-11 e a nota de handoff da PA-0.1 §16 | Fases 13–17, após baseline aprovado |
| Chief | Despacho das revisões independentes da PA-0.1 (UX-J, PCG-J, SEC-J e AI Systems) e da revisão Security da PDM-0.6. Composição do Release Priorities gate (D-CHIEF-02), com a recomendação de incluir DR-49 (O014). DR-17 (lacuna de capacidade de safety fisiológica, agora para quatro modalidades) | Agora; antes da fase 6; antes da fase 22 |
| AI Systems & Agent Experience | Agente do produto (DR-50): revisão da posição e do escopo na fase 4 (PA-0.1 AR-21 a AR-27); contrato de confirmação, desfazer e autonomia na fase 5 (DR-51); modelo, dados enviados e retenção com Security na fase 22 (DR-35) | Revisão da PA-0.1; fase 5; fase 22 |

## 5. Decisões do Chief (registradas, não re-decididas)

| ID | Decisão do Chief | Efeito neste registro |
|---|---|---|
| D-CHIEF-01 | O Founder Gate da fase 3 contém: FG-2, a fronteira da Crew (Crews por pessoa, ordem de tamanho, direito de criar, critérios de relação real, descoberta no modelo fechado); FG-3, a confirmação inicial e não bloqueante da opção A como base de trabalho, com a forma final de lançamento no Release Priorities gate; e plataformas e mercado de lançamento, entrada que o Chief compõe. FG-4 fica diferido ao Release Priorities gate. Inclui a resolução do conflito de autoridade: o direito de criar Crew pertence a FG-2 (Founder), conforme a classificação do PCG (PCG-J-08, R-O005); DR-33 guarda só o procedimento | §1; §3 (FG-2, FG-3, FG-4); DR-22, DR-23, DR-24, DR-33 |
| D-CHIEF-02 | Timing de DR-45: as fases 4–5 ficam estruturadas por Capacidade esportiva, sem detalhe de fluxo por modalidade. Um Release Priorities gate do Founder, antes da fase 6, reúne DR-45 (sequencing e launch depth das modalidades), a forma final de FG-3, FG-4 e DR-46. Product/UX propõe, informado pelos critérios de credibilidade de Research (DR-20). Este registro só registra; a proposta não é preparada agora | §1; DR-15, DR-20, DR-45, DR-46; FG-3, FG-4; PDM §3.1 |
| D-CHIEF-03 | Até haver classificação jurídica fornecida pelo Founder, o design trata Recovery, Nutrition e composição corporal como dados pessoais sensíveis, com consentimento explícito, específico e por finalidade, e minimização. O memo jurídico do Founder é insumo não bloqueante antes da fase 22 | PDM §3 (I6, I7), §4, §5, §6.9, §8; §7 (SEC-J-14) |

## 6. Rulings do PCG como leituras LD interinas

Os rulings J4 de PCG-J são interpretações de governança, não edições do Canon. Valem como leitura LD interina até a próxima revisão do Canon pelo PCG, que os invalida no escopo que editar (DI-01, DI-02, DI-05). Este registro não os amplia.

**0.5.** O Canon 2.2.0 editou esse escopo. O estado de cada ruling está em §6.1. A tabela abaixo é o registro histórico dos rulings como recebidos: a coluna "Onde se aplica (0.4)" vale para a 0.4, e os DI fecharam com a publicação do 2.2.0.

| Ruling | Leitura interina (LD) | Condições | Onde se aplica (0.4) | Confiança (PCG) | DI relacionado |
|---|---|---|---|---|---|
| R-DR-43 | A atividade numa modalidade de C023 abaixo da launch depth, e em qualquer modalidade D011, pode servir de contexto do motor (carga, recuperação, interferência) | (1) A modalidade não é apresentada como suportada: sem placeholder, "em breve", listagem, plano, prescrição ou analytics próprios; pode-se dizer que a sessão conta para carga e recuperação. (2) Confiança explícita, sem precisão fabricada (C012). (3) Só para C023: o nível contexto é um estado transitório, que o Release Scope sequencia até a cobertura mínima crível; mantê-lo sem prazo exige decisão explícita do Founder. (4) "O motor ignora a atividade" é desfavorecido; só se admite confiança reduzida quando o dado não pode ser lido de forma crível, nunca omissão silenciosa | PDM §3.1, §4, A6, S10, X4; DR-07, DR-43 | Alta para D011; média-alta para C023 | DI-01 |
| R-DR-45 | Product/UX propõe no Release Scope. Research e a autoridade de domínio informam os critérios de profundidade (DR-20); Engineering informa a ordem de dependência, só como documentação; o Chief coordena (O011). O Founder decide o sequencing, a launch depth além do mínimo e quais modalidades de C023 são declaradas plenamente suportadas em cada release | O limiar de cobertura mínima crível vem da evidência e é limitado por L023: ninguém declara suporte pleno abaixo dele. Remover uma modalidade de C023, ou reduzi-la de forma permanente, exige decisão explícita do Founder e revisão de C023. [Redação original, superada: "Uma delegação do Founder a Product/UX só vale se registrada na revisão do Canon". Vale agora o Canon 2.2.0, §7.1, "Limites do Release Scope": uma delegação explícita do Founder vale como o Founder a decidir e, até a revisão seguinte do Canon, que a registra, vale pelo registro rastreável da decisão do Founder, que quem a invoca deve citar (PCG-J2-06)] | DR-45, DR-46; D-CHIEF-02; PDM §3.1, §7; PTM §4 (D002, D010, D011) | Alta que o Founder decide hoje; média que isso reflita a divisão pretendida em O011 | DI-02 |
| R-DR-10 | A autoridade do motor (L007) determina o apropriado sem coagir a ação. São compatíveis: a agência da pessoa, o re-planejamento, I5 limitado à intenção declarada e a ausência de poder do grupo para prescrever (§8). Não punir desvio é exigido (L013, L017) | Honrar um desfecho indicado de reduzir, recuperar ou descansar é reconhecido estritamente acima de um desvio para mais volume; a paridade falha L008 e §8. A determinação do motor continua sendo a referência de todo reconhecimento (§29) | PDM §6.4, §7; DR-10 | Alta | — |
| R-DR-11 | DR-11 é tradução de Product/UX sob O012. Adiar conceitos aceitos não é mudança material de direção (D002, §10) | O Founder entra por O011 (prioridade de lançamento), não para confirmar a tradução. Entra por O012 só se um conceito for abandonado de vez ou redefinido. Perguntar FG-3 agora ou depois é decisão do Chief | DR-11; FG-3; D-CHIEF-01 | Alta | DI-02 |
| R-O005 | Product/UX propõe e Security avalia a fronteira concreta: padrões de privacidade, mecânica de consentimento e minimização dentro de L014, §17 e C021 | O Founder decide: acesso comercial por papel (O009, via FG-4); limites de participação que moldam identidade ou aquisição, como o direito de criar Crew (FG-2); e qualquer padrão que amplie a exposição além do que os outcomes do §30 exigem, em troca de aquisição ou engagement. Ninguém, nem o Founder, autoriza exposição involuntária sem mudar L014 | DR-03, DR-04, DR-12, DR-14, DR-44; FG-2, FG-4 | Alta | — |
| R-D011 | Acrescentar modalidades se decide em três níveis | (1) Reconhecer uma modalidade extra só como contexto do motor: Product/UX, dentro de D011 e D009, limitado por L022, C012 e R-DR-43. (2) Declarar uma modalidade extra plenamente suportada num release: prioridade de Release Scope (O011); Product/UX propõe com os critérios de Research (L023, DR-20) e o Founder decide, na mesma base de R-DR-45. (3) Acrescentar uma modalidade ao mínimo não removível: emenda C023 e exige decisão explícita do Founder, revisão do Canon pelo PCG e novas revisões | PDM §3.1, §4 (Declaração de suporte, Leitura de contexto); DR-07, DR-45; PTM §4 (D011) | Média-alta | DI-01, DI-02 |
| R-A8 | A Shareability como capability transversal tem baixo risco de virar pilar ou feed | (a) I9 tem sentido único: alcance, curtidas ou seguidores externos nunca são exibidos nem importados (C022, L020). (b) Um convite compartilhado fora do produto não é inscrição aberta: o aceite segue vinculado aos critérios de relação real de O006 e FG-2 (DR-33, Security) | PDM §3 (I8, I9), §3.2, §6.9, §8.2, §8.5, §9; DR-33, DR-40, DR-44; FG-2 | Alta | — |

### 6.1 Estado dos rulings no Canon 2.2.0

**FORMALIZADO** = o Canon 2.2.0 registra o conteúdo, que passa a valer com a autoridade da cláusula ou leitura que o contém; a leitura interina deixa de ser a fonte. **INTERINO (LD)** = o Canon não editou o ponto, e o ruling segue vinculante como leitura interina até a próxima revisão do Canon.

| Ruling | Estado | Onde está agora | Nota |
|---|---|---|---|
| R-DR-43 | FORMALIZADO | Canon §7.1 (Uso como contexto do motor; Nível de contexto transitório; Estado final abaixo da cobertura; Representações vedadas no faseamento; Modalidades de VFT-D011) e C024 | A condição (3) ficou mais precisa: o nível transitório exige prazo, em release ou data, no Release Scope vigente. Parte da condição (1), como analytics próprios ou listagem, passou a ser representação de suporte limitado, aberta em O013 (DR-48); o modelo segue sem adotá-la. O caminho de leitura é design space de Product/UX (PCG-J2-04) |
| R-DR-45 | FORMALIZADO | Canon §7.1 (Release Scope; Decisão do Release Scope; Limites do Release Scope) e O011 | A redação sobre delegação foi substituída pela regra do §7.1 (PCG-J2-06). "O limiar vem da evidência" virou O014 (DR-49), aberta: quem fixa os critérios e quem verifica |
| R-D011 | FORMALIZADO | Canon §7.1 (Modalidades de VFT-D011) | O nível (1) ficou mais estreito: a atividade sempre informa carga e recuperação, e Product/UX escolhe como ela é lida, não se ela informa. Suporte limitado: O013 |
| R-DR-11 | FORMALIZADO | Canon §7.1 (Decisão do Release Scope: adiar conceito aceito é prioridade de lançamento; abandonar ou redefinir é O012) e O011 | — |
| R-O005 | INTERINO (LD), em parte decidido | O005 no Canon aponta para C025 | O direito de criar Crew e a participação em mais de uma Crew estão decididos em C025. O restante segue como LD interina: Product/UX propõe, Security avalia, e o Founder decide o acesso comercial por papel (O009) e qualquer exposição além dos outcomes do §30 |
| R-A8 | (a) INTERINO (LD); (b) FORMALIZADO | (b) C025 | (a) O sentido único de I9 não está no Canon e segue como LD; SEC-J2-05 o estende a conversão e atribuição, como proposta [P]. (b) O objeto de convite nunca inscreve por si, e o aceite projetado exige a confirmação de quem convidou: C025 |
| R-DR-10 | INTERINO (LD) | — | O Canon 2.2.0 não o editou; segue vinculante como leitura interina (PCG-J, delta 0.4). Aplicado em UX-J2-02 |

A posição Security sobre DI-05 (SEC-J-10) foi adotada pelo PCG na leitura de C021. A mecânica (preferência permanente, recusa silenciosa, revogação) continua com Product/UX e Security, na CP-B (CPB-01).

## 7. Condições Security carregadas

Fonte: `audits/phase-1-3-reviews/SEC-J_domain-model-boundaries.md`, seção 4, sobre PDM-0.3 e PDR-0.3. As condições abaixo seguem abertas depois desta correção. SEC-J-03 e SEC-J-10 precisam fechar antes de `PRODUCT_ARCHITECTURE_APPROVED`. SEC-J-05 e SEC-J-07 tiveram a regra de domínio corrigida nesta revisão e aparecem aqui só pela parte residual.

**0.5.** Acrescenta as condições do delta SEC-J (SEC-J2-01 a SEC-J2-10; seção final do mesmo relatório), com seu estado. As condições da fase 4 entram no escopo da CP-B (§10). C025 torna atuais SEC-J-03 e SEC-J-13. SEC-J2-03 fecha com SEC-J-10, antes de `PRODUCT_ARCHITECTURE_APPROVED`.

**0.6.** Acrescenta as condições do delta SEC-J de 2026-10-11 (SEC-J3-01 a SEC-J3-09). As da fase 4 têm proposta de fechamento na PA-0.1 (mapa em §12); SEC-J3-05 e SEC-J3-06 ficam para a fase 8. O fechamento é da revisão Security.

| ID | Condição (resumo) | Owner | Trigger / fase | Evidência para fechar | Arquivo de evidência |
|---|---|---|---|---|---|
| SEC-J-01 | Consentimento no aceite: declarar exatamente o que cruza (nome de exibição, Contribuição mínima, estado de pausa), a audiência (inclusive futuros participantes) e a granularidade; consentimento e categorias opt-in por Crew; pausa como alternativa plena e sem custo; novo consentimento quando o escopo cresce; novos participantes não veem contribuições anteriores. Já incorporado: escopo por Crew no Consentimento (PDM §4) | Product/UX | Fase 4, na CP-B (CPB-03) | Modelo de consentimento e audiência (CP-B) e estados de divulgação (fase 8) | SEC-J_domain-model-boundaries.md §4 |
| SEC-J-02 | Inferência de ausência: sem grade por pessoa e dia; granularidade padrão no período do compromisso, sem horário nem dia da semana visíveis; sem listas de pendentes nem ordenação por contribuição; nenhum lembrete cita o estado de outro participante nem a dependência do grupo em alguém | Product/UX | Fase 6 | Core Flows e estados, mais walk-through Security de S6 numa Crew de duas pessoas | SEC-J_domain-model-boundaries.md §4 |
| SEC-J-03 | Convite não é membership: endereçado a uma pessoa, com validade, revogável e de usos limitados; convite encaminhado ou projetado nunca dá acesso sem confirmação de quem convidou ou da regra da Crew (DR-33); sem ingestão de agenda de contatos; contato do convidado usado só para a entrega e descartado na recusa ou expiração; participantes avisados quando alguém entra | Product/UX (DR-33, C025) | Fase 4, na CP-B (CPB-02); fecha antes de `PRODUCT_ARCHITECTURE_APPROVED` | Ciclo de vida do convite na fase 4, com casos negativos: estranho usa link encaminhado; ex-participante ou removido é reconvidado | SEC-J_domain-model-boundaries.md §4 |
| SEC-J-04 | Saída e remoção: revogam de imediato todo acesso ao conteúdo da Crew, inclusive histórico; reentrada só por novo convite (SEC-J-03); remoção sem motivo exposto e sem anúncio além da mudança na lista; silenciar o Apoio de um participante sem sair; encerramento não expõe histórico individual. Já incorporado: o acesso termina na saída (PDM §6.2) | Product/UX, com revisão Security | Fase 4, na CP-B (CPB-04) | Regras de DR-33 com casos de abuso | SEC-J_domain-model-boundaries.md §4 |
| SEC-J-05 (residual) | Regra de saída e encerramento já substituída em PDM §8.3. Resta: durações e prova de eliminação | Engineering com Security | Fase 22 | Spec de retenção e eliminação, com eliminação verificada | SEC-J_domain-model-boundaries.md §4 |
| SEC-J-06 | Texto de apoio: Security recomenda gestos estruturados no lançamento. Texto livre só com bloquear e silenciar, caminho de denúncia e owner nomeado para resposta a abuso, sem pedidos de motivo, sem alimentar shareables, projeção externa, motor ou perfilamento (O007) e com retenção limitada | Product/UX; o Founder decide se for preciso capacidade de moderação | Fase 4, na CP-B (DR-30; CPB-05) | Registro de decisão de DR-30, mais revisão Security se houver texto livre | SEC-J_domain-model-boundaries.md §4 |
| SEC-J-07 (residual) | Linhas de §8.1 e significado independente da fonte já incorporados (PDM §8.1, I4). Resta: autodeclaração estruturada (intenção e categoria do desfecho), sem saúde, localização ou motivo em texto livre cruzando para a Crew | Product/UX | Fases 5–6 | Regra de elegibilidade das fases 5–6, conferida contra a condição | SEC-J_domain-model-boundaries.md §4 |
| SEC-J-08 | Progresso coletivo sem pressão atribuível: nenhum resultado coletivo tudo-ou-nada em que a ausência de uma pessoa identificável cause falha visível; nenhum total por membro que permita achar, por subtração, quem não contribuiu | Product/UX, com O008 | Fase 6 | Design do progresso coletivo (DR-06), percorrido com S3 e com um caso em que um membro descansa | SEC-J_domain-model-boundaries.md §4 |
| SEC-J-09 | Dispositivo compartilhado e controle coercitivo: isolamento de conta e sessão e caminhos rápidos de saída ou pausa precisam de threat model | Security | Fase 22 | Threat model da fase 22 | SEC-J_domain-model-boundaries.md §4 |
| SEC-J-10 | Shareables coletivos em Crew de até 8: todo objeto coletivo é dado pessoal de cada membro identificável; consentimento individual, por finalidade e destino, desligado por padrão, nunca por voto nem dado por outra pessoa; preferência permanente em vez de pedido a cada objeto; recusa silenciosa, com forma degradada que não revela composição; a revogação de qualquer membro interrompe as projeções futuras de todos. A posição Security sobre DI-05 vai ao PCG. Já incorporado: estados Recusado, Expirado e Revogado (PDM §6.9) | Product/UX (DR-38); doutrina: PCG, via Chief, já adotada na leitura de C021 | Fase 4, na CP-B (CPB-01), com SEC-J2-03; fecha antes de `PRODUCT_ARCHITECTURE_APPROVED` | Modelo de objetos de DR-38, com walk-through de consentimento e recusa numa Crew de duas e numa de cinco pessoas | SEC-J_domain-model-boundaries.md §4 |
| SEC-J-11 | Mecânica da projeção externa: snapshots estáticos, sem link vivo para dados internos; link ou página, se houver, revogável, não enumerável e sem nada além do objeto; identificadores de referral sem identidade, Crew ou membership; quem vê não é rastreado; metadados de localização e horário removidos; aviso prévio de que a cópia não pode ser recolhida | Product/UX (escolha do modelo na fase 4); Engineering (verificação na fase 22) | Fase 4, na CP-B (CPB-06) | Modelo de projeção de DR-38 e teste de metadados e links na fase 22 | SEC-J_domain-model-boundaries.md §4 |
| SEC-J-12 | Convite como shareable: o convite externo não leva nomes, fotos, contagem nem contribuições de participantes; o nome da Crew só aparece sob consentimento de identidade externa da Crew (I8); o aceite sempre passa pela confirmação de SEC-J-03 | Product/UX (DR-33, DR-40) | Fase 4, na CP-B (CPB-02) | Objeto de convite em DR-38 | SEC-J_domain-model-boundaries.md §4 |
| SEC-J-13 | Várias Crews por pessoa (C025 permite, até 3): consentimento e Contribuição separados por Crew; as outras Crews de uma pessoa nunca são visíveis a nenhuma Crew. Já incorporado: outras Crews nunca visíveis (PDM §8.1, §8.2) | Product/UX | Fase 4, na CP-B (CPB-07) | Topologia da CP-B | SEC-J_domain-model-boundaries.md §4 |
| SEC-J-14 | Classificação regulatória dos dados de saúde (Recovery, Nutrition, composição corporal) e sua base legal; direitos de exportação e eliminação, inclusive eliminação de conta (PDM §6.1). Interino por D-CHIEF-03: tratados como sensíveis desde já | Founder, com insumo jurídico competente, e Security | Memo não bloqueante antes da fase 22 (D-CHIEF-03); controles na fase 22 | Memo de classificação que alimenta o Consentimento | SEC-J_domain-model-boundaries.md §4 |
| SEC-J-15 | Verificação negativa obrigatória: autorização no servidor (permissão só no frontend é FAIL); testes de negação entre Crews, de ex-participante e de removido, de convite encaminhado usado por estranho, de revogação de consentimento alcançando projeções futuras, de limites de taxa em convite e Apoio, e dos cenários de vigilância por parceiro e de lembrete entre pares | Security, com Engineering | Fase 22 (cenários rascunhados na fase 6) | Evidência dos testes executados | SEC-J_domain-model-boundaries.md §4 |
| SEC-J2-01 | I7 de Performance: definir o que Performance projeta, em vez de Performance bruto. Excluir por padrão rota ou localização, horário preciso, peso corporal, texto de justificativa do motor e motivos de I10; incluir só por escolha explícita, com privacidade de rota | Product/UX (DR-38) | Fase 4, na CP-B (CPB-01) | SOM com a projeção de Performance definida | SEC-J_domain-model-boundaries.md, delta |
| SEC-J2-02 | Finalidade secundária de I10 (C009) com consentimento próprio via I6; motivos não alimentam SSP nem SPG sem O007; retenção limitada. Corrigido na regra: PDM-0.5 I6, I10, §8.2, §8.3 e A11 | Product/UX, com Security | Regra na CP-A; durações na fase 22 | Re-revisão SEC-J do delta 0.5; spec de retenção na fase 22 | SEC-J_domain-model-boundaries.md, delta |
| SEC-J2-03 | Quem pede vê um único resultado, que não distingue recusa de expiração; limitar recomposição e novos pedidos para que um ataque por diferença não revele quem recusou; preferir preferência permanente | Product/UX (DR-38) | Fase 4, na CP-B (CPB-01); fecha com SEC-J-10, antes de `PRODUCT_ARCHITECTURE_APPROVED` | SOM com walk-through de consentimento e recusa | SEC-J_domain-model-boundaries.md, delta |
| SEC-J2-04 | Contribuições de retorno fora de compromisso e seus Apoios com ciclo de vida limitado; a regra de saída vale para eles. Corrigido na regra: PDM-0.5 §8.3 | Product/UX (regra); Engineering (durações) | Regra na CP-A; durações na fase 22 | Re-revisão SEC-J do delta 0.5; spec de retenção | SEC-J_domain-model-boundaries.md, delta |
| SEC-J2-05 | I9 sem retorno de conversão ou atribuição; o aceite de convite é o único caminho de entrada a partir de um objeto projetado e passa pela confirmação de C025 (redação de UX-J3-05). Corrigido na regra: PDM-0.5 I9, §3.2, §6.9, §8.2, §9 | Product/UX | Regra na CP-A; mecânica de referral na CP-B (CPB-06) | Modelo de projeção | SEC-J_domain-model-boundaries.md, delta |
| SEC-J2-06 | SEC-J-02 também cobre a pausa: sem horário, histórico ou frequência de pausas; o retorno é compartilhado por Crew, nunca para todas as Crews da pessoa. Regra incorporada: PDM-0.5 §6.2, §6.6, §8.1 | Product/UX | Fase 6 (estados) | Core Flows e estados | SEC-J_domain-model-boundaries.md, delta |
| SEC-J2-07 | As categorias opt-in oferecidas não revelam o modo. Regra incorporada: PDM-0.5 §8.1 | Product/UX | Fase 6 (elegibilidade) | Core Flows, conferidos contra a condição | SEC-J_domain-model-boundaries.md, delta |
| SEC-J2-08 | Menores: resolvida por exclusão de escopo (18+; DR-47). Restam os direitos do titular como requisitos de arquitetura e a regra de que um achado jurídico que afete a arquitetura chega antes de `PRODUCT_ARCHITECTURE_APPROVED`, ou essa aprovação é reaberta | Founder (memo); Product/UX (direitos na arquitetura) | Fase 4, na CP-B (CPB-08) | Requisitos de direitos mapeados na arquitetura | SEC-J_domain-model-boundaries.md, delta |
| SEC-J2-09 | PDM §8.4 alinhado a PDR §7 e PDM §12 sobre o que fecha antes de `PRODUCT_ARCHITECTURE_APPROVED`. Corrigido: PDM-0.5 §8.4 | Product/UX | CP-A | Re-revisão | SEC-J_domain-model-boundaries.md, delta |
| SEC-J2-10 | Um objeto DA que entre em I8 (Moments, Season recap, Crew Memory) exige revisão Security quando entrar, como em DR-36 e DR-37 | Product/UX | Na CP-B, se algum objeto DA entrar (CPB-09); depois, sempre que entrar | Revisão Security registrada | SEC-J_domain-model-boundaries.md, delta |
| SEC-J3-01 | Estados do convite: quem convidou vê só pendente, aceito, ou não aceito/expirado. Falha de idade, convidado no limite de 3 Crews e recusa explícita aparecem iguais. A confirmação de C025 é a única exceção de I9 e mostra só o necessário para confirmar a pessoa pendente | Product/UX (CPB-02, CPB-07, CPB-11), com Security | CP-B; fecha com SEC-J-03 antes de `PRODUCT_ARCHITECTURE_APPROVED` | PA-0.1 AR-09, AR-43, AR-44, AR-67 e NC-05 a NC-09, revisados pela Security | SEC-J_domain-model-boundaries.md, delta 0.5 |
| SEC-J3-02 | Minimização da verificação de idade: guardar só o resultado ("adulto: sim") e um fato mínimo de auditoria; documento, data de nascimento ou biometria, só o que o método estritamente exigir; uma falha não deixa perfil; um verificador terceiro é nova fronteira de confiança, com revisão Security na escolha | Product/UX, com Security (CPB-11); controles: Engineering | CP-B; controles na fase 22 | PA-0.1 AR-09; DR-53 | SEC-J_domain-model-boundaries.md, delta 0.5 |
| SEC-J3-03 | Assédio por convite: o convidado pode recusar e bloquear novos convites de uma pessoa, para qualquer Crew, sem que ela saiba; limite de convites pendentes por pessoa e de taxa de envio; alimenta SEC-J-15 | Product/UX (CPB-02, CPB-07) | CP-B | PA-0.1 AR-37, AR-49; NC-09 | SEC-J_domain-model-boundaries.md, delta 0.5 |
| SEC-J3-04 | Integrações: consentimento explícito por fonte e por tipo de dado, com os menores escopos; desconectar interrompe a ingestão, com retenção definida do que já entrou; dado recebido não é confiável, entra com confiança e sob a Safety Policy; nada é escrito de volta numa plataforma, nem compartilhado com ela, sem consentimento separado | Engineering, com Security; arquitetura de consentimento: Product/UX | CP-B (consentimento); fase 22 (DR-13) | PA-0.1 AR-20 | SEC-J_domain-model-boundaries.md, delta 0.5 |
| SEC-J3-05 | Telas do telefone: avisos, tela bloqueada e widgets nunca mostram conteúdo da Crew, estado de outras pessoas ou dado sensível por padrão; estende SEC-J-09 | Product/UX, com Security | Fase 8; threat model na fase 22 | UX Spec da fase 8 | SEC-J_domain-model-boundaries.md, delta 0.5 |
| SEC-J3-06 | Paridade bilíngue de consentimento: textos de consentimento e divulgação com o mesmo alcance em PT-BR e EN; o registro do consentimento guarda idioma e versão do texto | Product/UX | Fase 8 | UX Spec da fase 8 | SEC-J_domain-model-boundaries.md, delta 0.5 |
| SEC-J3-07 | Revogar a finalidade secundária de I10 interrompe o uso e remove, ou deixa de usar, o que foi derivado nela | Product/UX (regra, CPB-08); Engineering (prova) | CP-B; prova na fase 22 | PA-0.1 AR-69 | SEC-J_domain-model-boundaries.md, delta 0.5 |
| SEC-J3-08 | Escopo de dados de C021: o consentimento a objeto coletivo diz quais dados do membro aparecem, além de finalidade e destino; o objeto não revela dado não consentido do membro, nem por inferência | Product/UX (CPB-01) | CP-B; fecha com SEC-J-10 antes de `PRODUCT_ARCHITECTURE_APPROVED` | PA-0.1 AR-61, AR-62; NC-13 | SEC-J_domain-model-boundaries.md, delta 0.5 |
| SEC-J3-09 | Sobreposição entre Crews: revisão Security de CPB-07, com o percurso de uma pessoa em 3 Crews com membros em comum, cobrindo o que esses membros inferem dos estados por Crew e o vazamento do limite | Product/UX, com Security (CPB-07) | CP-B | PA-0.1 AR-39, AR-44; NC-14 | SEC-J_domain-model-boundaries.md, delta 0.5 |

## 8. Resolução dos findings — correction loop 1 (0.3 → 0.4)

Registro histórico da correção 0.3 → 0.4; os locais citados são os da 0.4. A resolução da CP-A (0.4 → 0.5) está em §11.

Autoavaliação do worker, não veredito: cada linha aponta onde a 0.4 trata o finding, e a re-revisão independente decide. **CORRECT** = corrigido nesta revisão · **DEFER** = carregado com owner e trigger (§7) · **REJECT** = não adotado, com motivo.

| ID | Resolução | Local (0.4) | Nota |
|---|---|---|---|
| UX-J-01 | CORRECT | PDM §1 (diagrama, Ponte), §3 (domínios; I1, I2, I3, I6, I10; teste de desacoplamento), §3.1, §4 (Plano, Training Context, Schedule, Interrupção), §6.4, §6.6, §7, §9, A9, A10; PDR DR-02, DR-10, DR-42 | (a) I10 leva desfecho, motivo de ajuste e interrupção à Adequação, de forma privada. (b) Carga × recuperação e treino × disponibilidade energética se integram só na Adequação. (c) A Adequação é dona do Plano e da sessão prescrita, que compõe a partir das estruturas de sessão oferecidas via I1; não há caminho Adequação → Performance, e Training Context guarda só o realizado. (d) A Interrupção é a fonte única da pausa da prática; Schedule cobre só janelas enquanto a pessoa pratica. §3 e §9 declaram I1–I10 |
| UX-J-02 | CORRECT | PDM §6.6, §6.4; PDR DR-09; cenário X3 | Máquina aninhada: Sem dados e Interrompido alcançáveis de todo estado ativo e de Retornando. Regra de descanso não registrado com piso "nunca falha"; mecânica na fase 5, com O001. Saída de Retornando definida também para Crew Member |
| UX-J-03 | CORRECT | PDM §2.2 (M3), §3 (Continuidade; I3), §4 (Intenção declarada), §5, §6.7, §8.1; PDR DR-03 | Entidade pessoal de Continuidade, uma por pessoa e período, comum a todos os vínculos; incluída em I3; linha de §8.1 com padrão "não cruza" |
| UX-J-04 | CORRECT | PDM §2.2 (Terminologia), §6.2, §6.3, §6.7; PDR DR-01; cenário X5 | Participante = vínculo Ativo ou Pausado, e o estado da Crew independe de pausas. Transições de saída abaixo de 2 participantes e de saída do último; destino do compromisso e gatilhos de Cancelado definidos |
| UX-J-05 | CORRECT | PDM §4 (Contribuição), §5, §6.7, §8.1; cenário S5; PDR DR-11, FG-3 | O retorno compartilhado ganha escopo de Crew, mesmo sem compromisso ativo. O caráter centrado em compromisso fica registrado como consequência de FG-3 A |
| UX-J-06 | CORRECT | PDM §3 (I7, I8, I9), §3.2, §4 (Goals, Trajetória, Registro de Continuidade), §6.9, §8.5; PDR DR-44 | I7 cobre o progresso próprio vindo de Continuidade e de Performance, sob I6. Dados sensíveis próprios como fonte ficam como decisão de DR-38 com Security. Donos: marcos de continuidade (Registro de Continuidade), objetivo alcançado (Goals), progresso multiesporte (Trajetória). Convite incluído em I8 |
| UX-J-07 | CORRECT | PDM §3.1, §4 (Declaração de suporte, Leitura de contexto, Prática de modalidade), §5, §7, A6; PDR DR-07 | Nível de suporte no catálogo, decidido em Release Scope. Caminhos de leitura nomeados; a leitura de C023 em nível contexto pela própria capacidade vai ao PCG (DI-01) |
| UX-J-08 | CORRECT | PDM §2.2, §3 (Performance), §4, §5; cenários S9, S11 | Modo 0..1; Recovery e Nutrition 0..1 para Crew Member; sem Athlete Model para Crew Member (A3); a participação assimétrica deixou de ser modo e virou propriedade da Crew; 1 Decisão integrada por janela; contexto integrado composto na Adequação; interferência representada em Load e decidida na Adequação; Trajetória separada do Registro de Continuidade; "Desfecho Retornar" reescrito |
| UX-J-09 | CORRECT | PDM §6.7; PDR DR-05 | [C §8] só para "prescrever carga". Meta em unidade física como LD. Modalidade, lugar ou objetivo comuns limitados a "requisito de participação ou reconhecimento" (LD) |
| UX-J-10 | CORRECT | PDM §6.9 | Só os estados estruturais: Recusado, Expirado e Revogado; Crew Encerrada e ex-participante não originam nem projetam objetos coletivos. Fronteiras concretas carregadas em SEC-J-10 (§7) |
| UX-J-11 | CORRECT | PDR §3 (FG-2), DR-22; PDM §4 (Consentimento, Convite) | Critérios de relação real e descoberta no modelo fechado entram na pergunta; o antigo pacote C foi desfeito em parâmetros; custos reais de A; parâmetros que moldam a arquitetura separados dos ajustáveis; criação de Crew em FG-2; Consentimento com escopo por Crew |
| UX-J-12 | CORRECT | PDR §3 (FG-3), §1, DR-11, DR-23 | Confirmação inicial, não bloqueante; consequência de ser centrado em compromisso; escopo extra de B e C; shareables por opção; agora versus Release Priorities gate; "retorno" alinhado a DR-11 |
| PCG-J-01 | CORRECT | PTM §7 (nova linha do §21.1), C016, §12; PDM §3.2, §8.5 | Obrigação "deve transformar…" registrada, com "quando apropriado" e a abertura de D010. "Camada forte" restaurada em C016. A cobertura do §12 permanece verdadeira |
| PCG-J-02 | CORRECT | PTM C004; PDM §3 (Pessoa & Participação); PDR DR-12, FG-4 | "Planos comerciais congelados" (§6); mapear papel a plano continua opção do Founder em O009 |
| PCG-J-03 | CORRECT | PDM §3.1, §6.4, §6.7, §8.5, §9; PTM L003 | Rótulos [C] trocados por LD ou [P]. Pesos iguais como [P]. "Sem métrica comum" limitado a contribuição, comparação e reconhecimento. L003 usa "não impõem" (§30) |
| PCG-J-04 | CORRECT | PDM §6.4; PDR DR-10 | Honrar redução, recuperação ou descanso indicados é reconhecido estritamente acima de desvio para mais volume (LD, R-DR-10) |
| PCG-J-05 | CORRECT | PDM §3.1, §4, A6, S10, X4; PDR DR-07, DR-43, §6 | Condições 1–4 de R-DR-43 registradas, inclusive o caráter transitório e sequenciado do nível contexto para C023 |
| PCG-J-06 | CORRECT | PTM §4 (D002, D010, D011), §8.3; PDR DR-45, DR-46 | Atribuições de owner que o Canon não faz levam rótulo LD interino (R-DR-45, R-DR-11, R-D011); o "Founder/Produto" de O011 foi preservado |
| PCG-J-07 | CORRECT | PDM §3 (I8, I9), §3.2, §6.9, §8.2, §8.5, §9; PDR DR-33, DR-40, DR-44 | I9 com sentido único; convite fora do produto não é inscrição aberta (R-A8) |
| PCG-J-08 | CORRECT | PDR §3 (FG-2), DR-22, DR-33, §5 (D-CHIEF-01); PDM §6.3, §7 | Quem pode criar Crew é decidido em FG-2 (Founder); DR-33 guarda só o procedimento |
| PCG-J-09 | CORRECT | PDR §4 (linha Chief) | A nota de índice desatualizada deu lugar ao estado verificado em PCG-J-09 |
| PCG-J-10 | CORRECT | PTM §9 (V12) | Qualificador de consentimento em "quem fez"; "deixou de fazer" segue incondicional; o padrão final fica com DI-05 e SEC-J-10 |
| PCG-J-11 | CORRECT | PDR DR-11, DR-23, §3 (FG-3) | O papel do Founder é a prioridade de lançamento (O011), não confirmar a tradução de O012 |
| PCG-J-12 | CORRECT | PDM §8.3, §8.4; PDR DR-14 | Resolvido pela regra de SEC-J-05 e sinalizado em §8.4 |
| SEC-J-01 | DEFER | §7; PDM §4 (Consentimento por Crew) | Parte incorporada; o restante vai à fase 4 |
| SEC-J-02 | DEFER | §7 | Fase 6 |
| SEC-J-03 | DEFER | §7; PDM §6.2, §7, §8.2 | Fase 4; fecha antes de `PRODUCT_ARCHITECTURE_APPROVED` |
| SEC-J-04 | DEFER | §7; PDM §6.2 | Fase 4; o padrão de acesso na saída já foi adotado |
| SEC-J-05 | CORRECT | PDM §8.3; PDR DR-14 | Regra do judge adotada; durações e prova de eliminação carregadas para a fase 22 (§7) |
| SEC-J-06 | DEFER | §7 | Fase 4 (DR-30) |
| SEC-J-07 | CORRECT | PDM §8.1, §3 (I4), §2.2 (M3); PDR DR-04 | Linhas dizendo que modo e acesso não cruzam; significado independente da fonte. Evidência de elegibilidade carregada para as fases 5–6 (§7) |
| SEC-J-08 | DEFER | §7 | Fase 6 |
| SEC-J-09 | DEFER | §7 | Fase 22 |
| SEC-J-10 | DEFER | §7; PDM §6.9 (estados) | Fase 4; fecha antes de `PRODUCT_ARCHITECTURE_APPROVED` |
| SEC-J-11 | DEFER | §7 | Fase 4; verificação na fase 22 |
| SEC-J-12 | DEFER | §7; PDM §3 (I8), §8.5 | Fase 4 |
| SEC-J-13 | DEFER | §7; §3 (FG-2, custos de A) | Fase 4, depois de FG-2 |
| SEC-J-14 | DEFER | §7; §5 (D-CHIEF-03) | Memo do Founder, não bloqueante, antes da fase 22 |
| SEC-J-15 | DEFER | §7 | Fase 22 |

**Contagem.** 26 CORRECT: UX-J-01 a UX-J-12, PCG-J-01 a PCG-J-12, SEC-J-05 e SEC-J-07. 13 DEFER: os demais SEC-J, todos com owner, trigger e evidência em §7. 0 REJECT.

**Divergência entre judges, registrada.** UX-J-09 tratava a proibição de meta em unidade física como canônica. PCG-J-03, que é owner da interpretação de doutrina, a classificou como LD. A 0.4 segue o PCG.

## 9. Aceite do handoff do Canon 2.2.0 (Phase 4 CP-A)

Registro do destinatário, conforme o protocolo de handoff ("Aceitação"). Receber não é aceitar: o aceite abaixo vale para a versão e o escopo verificados. É autoavaliação do worker; as re-revisões independentes da CP-A conferem a tradução.

| Campo | Valor |
|---|---|
| Producer → consumer | PCG, via Chief (publicação `VF-PTC-2.2.0-CANONICAL-20261010-001`, conforme `canon/CANONICAL_INDEX.md`) → Product/UX Architect, worker da Phase 4 CP-A |
| Versão aceita | VILUMO-PTC-2.2.0, `canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md`, SHA-256 `5c780fdc336166066edbc9ed62dfa0e947efdb5177898faf6c934346f6e35601`, verificado em 2026-10-10 antes de qualquer edição e de novo na retomada da sessão |
| Escopo consumido | Contrato inteiro, 79 IDs. O delta `governance/drafts/VILUMO-PTC-2.2.0/DELTA_2.1.0_TO_2.2.0.md` (CH-01 a CH-26 e §14, R1-01 a R1-13) serviu para localizar o que mudou |
| Mudanças traduzidas | Novos: C024, C025, C026, C027, H007, O013, O014. Alterados: O005, O006 (resolvida por C025), O011. Texto novo ou alterado: §2 (regras modais), §7 (C024), §7.1, §13, §21.1 (alcance e leituras de C016, C018/C019 e C021; H007), §27, §30, §30.1, §31, §32 e §33. Tradução: PTM-0.5 §0–§12, PDM-0.5 e este registro |
| Critérios verificados | (1) L001–L023 inalterados e sem LOCKED novo, segundo o delta (§7 e §14.7) e as checagens do PCG; esta CP-A conferiu que o Canon tem exatamente L001–L023, mas não refez a comparação byte a byte com o 2.1.0. (2) Cada ID novo e cada linha alterada tem tradução sem contradição (PTM-0.5 §3–§7.1, §9, §10). (3) Nenhuma cláusula exige decisão que Product/UX não possa tomar ou rotear: O013 e O014 ficam com o Founder, e as soluções dependentes não são adotadas (§32 do Canon). (4) As possibilidades que C025 concede a pessoas são respeitadas (PDM-0.5 §2.2, §8.2). (5) Os rulings interinos formalizados foram reclassificados (§6.1). (6) Nenhum ponto exigiu THESIS_CONFLICT nem DOCTRINE_BLOCKED |
| Veredito | **ACEITO** (2026-10-10). Sem DOCTRINE_BLOCKED |
| Dependentes invalidados | PTM-0.4, PDM-0.4 e PDR-0.4.1, que traduziam o 2.1.0, são substituídos pelas revisões 0.5. Os gates das fases 1–3 ligados ao 2.1.0 são re-checados no escopo editado: `CANON_INGESTED` (PCG-J), `DOMAIN_MODEL_APPROVED` (UX-J, PCG-J e SEC-J, cuja validade era o PTC-2.1.0) e o insumo de `PRODUCT_DECISIONS_SUFFICIENT` |
| Abertos que limitam o downstream | O013 (DR-48) e O014 (DR-49). Nenhuma arquitetura ou Release Scope adota representação de suporte limitado, e nenhum Release Scope declara suporte pleno sem a alocação de critérios. O índice canônico registra sete findings não bloqueantes diferidos ao PCG (RA2-01 a RA2-04, DI3-01 a DI3-03), que não foram lidos nesta CP-A |
| Próximo owner e passo | Chief: registrar o aceite no índice canônico e despachar as re-revisões independentes do delta 0.5 (UX-J, PCG-J, SEC-J). Product/UX: CP-B (§10), quando o Chief retomar |

## 10. Escopo da CP-B — Product Architecture (itens abertos, não iniciados)

Registro do que a CP-B deve entregar ou fechar. Nada abaixo foi feito na CP-A. **0.6:** esta seção complementa a missão §4 e não é o escopo completo da arquitetura (UX-J3-02); a resolução de cada item está em §12. Trigger comum: a retomada da CP-B pelo Chief. Todos os itens respeitam C016–C027, L011–L017, o vocabulário do Canon §7.1 e a não adoção das soluções dependentes de O013 e O014.

| ID | Item | Fontes | Owner | Trigger / fecha antes de | Evidência para fechar |
|---|---|---|---|---|---|
| CPB-01 | Shareable Object Model dentro da arquitetura: objetos individuais e coletivos, interno e externo, consentimento, exposição, narrativa, customização, formato e destino. Inclui o que Performance projeta (I7) e a mecânica do consentimento coletivo e da recusa | C026, C016–C022, D010; DR-38, DR-44; SEC-J-10, SEC-J2-01, SEC-J2-03 | Product/UX; Security avalia | CP-B; SEC-J-10 e SEC-J2-03 fecham antes de `PRODUCT_ARCHITECTURE_APPROVED` | SOM com walk-through de consentimento e recusa numa Crew de 2 e numa de 5 pessoas; projeção de Performance definida |
| CPB-02 | Ciclo de vida do convite: convite nominal, validade, revogação, usos limitados, confirmação de quem convidou no aceite encaminhado ou projetado, descarte do contato do convidado e aviso de entrada; objeto de convite externo | C025, §13; DR-33, DR-40; SEC-J-03, SEC-J-12 | Product/UX; Security | CP-B; SEC-J-03 fecha antes de `PRODUCT_ARCHITECTURE_APPROVED` | Ciclo de vida com casos negativos: estranho com convite encaminhado; ex-participante ou removido reconvidado |
| CPB-03 | Modelo de consentimento e audiência: o que cruza no aceite, a audiência (inclusive futuros participantes), a granularidade, consentimento e opt-ins por Crew, novo consentimento quando o escopo cresce, e novos participantes sem acesso a contribuições anteriores | L014, §17, C021; DR-04; SEC-J-01 | Product/UX | CP-B | Modelo de consentimento e audiência; estados de divulgação na fase 8 |
| CPB-04 | Remoção e silenciar: revogação imediata do acesso, reentrada só por novo convite, remoção sem motivo exposto, silenciar o Apoio de alguém sem sair, e encerramento sem expor histórico | L017, §13; DR-33; SEC-J-04 | Product/UX; Security | CP-B | Regras de DR-33 com casos de abuso |
| CPB-05 | Mensagens de apoio: gestos estruturados ou texto, com as condições de SEC-J-06 se houver texto livre | L016, L017; DR-30; SEC-J-06 | Product/UX; Founder, se for preciso capacidade de moderação | CP-B | Registro de decisão de DR-30; revisão Security se houver texto livre |
| CPB-06 | Mecânica da projeção externa: snapshot estático, link revogável e não enumerável se houver, referral sem identidade, sem rastrear quem vê, metadados removidos e aviso de irrevogabilidade; I9 sem conversão nem atribuição | C017, C021, C022; DR-38; SEC-J-11, SEC-J2-05 | Product/UX (modelo); Engineering (verificação na fase 22) | CP-B | Modelo de projeção; teste de metadados e links na fase 22 |
| CPB-07 | Topologia multi-Crew: até 3 vínculos por pessoa, alternância, consentimento e Contribuição por Crew, outras Crews nunca visíveis, e aplicação dos tetos (convites pendentes, aceites simultâneos) | C025; FG-2; SEC-J-13 | Product/UX | CP-B | Topologia com walk-through de uma pessoa em 3 Crews com membros em comum |
| CPB-08 | Direitos do titular como requisitos de arquitetura: exportação e eliminação, inclusive da conta (SEC-J-14), e os demais que o memo jurídico indicar. Um achado jurídico que afete a arquitetura chega antes da aprovação | L014, §17; SEC-J-14, SEC-J2-08; D-CHIEF-03 | Product/UX (direitos na arquitetura); Founder (memo jurídico) | CP-B; um achado jurídico posterior reabre `PRODUCT_ARCHITECTURE_APPROVED` | Requisitos de direitos mapeados na arquitetura |
| CPB-09 | Entrada de objeto DA em I8 (Moments, Season recap, Crew Memory), com revisão Security quando entrar | C005, D002, O007; DR-36, DR-37; SEC-J2-10 | Product/UX; Security | CP-B, se algum objeto DA entrar; depois, sempre que entrar | Revisão Security registrada |
| CPB-10 | Se a declaração de interrupção pode oferecer pausar vínculos, sem exposição | L013, L014, L017; UX-J2-07 | Product/UX; rótulos: UI & Experience (fase 18) | CP-B | Decisão registrada, com walk-through do cenário X9 |
| CPB-11 | Verificação de idade (18+) em todos os pontos de entrada (adoção direta, aceite de convite e criação de Crew), sem fluxos de menores e com recusa que não expõe o motivo | DR-47; `audits/phase-1-3-reviews/founder-gate-phase3-decisions.md` | Product/UX; Security | CP-B | Pontos de entrada da arquitetura com a verificação e o tratamento da recusa |

CPB-11 não estava na lista do Chief. Vem do registro do Founder ("Phase 4 includes age verification only") e é escopo, não decisão nova.

## 11. Resolução da CP-A (0.4 → 0.5)

Autoavaliação do worker, não veredito: cada linha aponta onde a 0.5 trata o item, e as re-revisões independentes decidem. **CORRECT** = tratado nesta revisão · **DEFER-CP-B** = no escopo da CP-B (§10) · **DEFER** = carregado com owner e trigger · **REJECT** = não adotado, com motivo.

| ID | Item | Resolução | Local (0.5) | Nota |
|---|---|---|---|---|
| CPA-1.1 | PTM mapeia os 79 IDs do Canon 2.2.0 | CORRECT | PTM §3 (C024–C027), §5 (H007), §6 (O005, O006, O011, O013, O014), §12 | 79/79, sem ID fantasma (checagem determinística) |
| CPA-1.2 | Testes V e T para as linhas novas e alteradas do §31 | CORRECT | PTM §9 (V8, V9, V10, V12, V14), §10 (T13, T14, T19–T22) | C024/L023: V8, V9, T13, T19. C025: V14, T21. C021: V12, T20. H007: V10, T14. Contexto do motor: T22 |
| CPA-1.3 | Regras modais do Canon §2 e leituras do Canon §7.1 no PTM | CORRECT | PTM §0, §7.1 (nova), §4, §8.3 | — |
| CPA-1.4a | Marcadores "[A FG-2]" → C025 e valores do Pacote A | CORRECT | PDM §4 (Crew, Vínculo, Convite), §5, §6.2, §6.3, §7, §8.2, §8.5, §9 | — |
| CPA-1.4b | Caminho de leitura do DR-43 → Canon §7.1 e C024, sem dependência de DI-01 (PCG-J2-04) | CORRECT | PDM §3.1, §4, A6, S10, X4; PDR DR-07, DR-43 | — |
| CPA-1.4c | DR-45 e Release Scope → definição e decisor do Canon §7.1 | CORRECT | PDR DR-45, DR-46; PDM §3.1, §7; PTM §4, §7.1 | — |
| CPA-1.5 | PDR §6: rulings formalizados e rulings interinos | CORRECT | PDR §6, §6.1 | Formalizados: R-DR-43, R-DR-45, R-D011, R-DR-11 e R-A8(b). Interinos: R-DR-10, R-O005 (em parte) e R-A8(a) |
| CPA-1.6 | Aceite do handoff do Canon 2.2.0 | CORRECT | PDR §9 | ACEITO; sem DOCTRINE_BLOCKED |
| CPA-2.1 | Pacote A no modelo de Crew e membership | CORRECT | PDM §2.2, §4, §5, §6.1–§6.3, §7, §8.1, §8.2, §8.5; cenários X7, X8 | Até 3 Crews; até cerca de 8; criação como permissão da pessoa nos dois papéis (UX-J2-04); confirmação no aceite encaminhado ou projetado; o objeto nunca inscreve; sem listagem, busca ou ingestão de contatos |
| CPA-2.2 | FG-3 A como base social | CORRECT | PDM cabeçalho, §4 (leitura do conjunto LC), §6.7, §9; PDR DR-11 | — |
| CPA-2.3 | Restrições de lançamento como requisitos de produto | CORRECT | PDM §2.1, §2.3, §3, §4, §6.1, §8.1; cenário X11; PDR DR-47, §3 | A mecânica da verificação de idade está na CP-B (CPB-11) |
| PCG-J2-01 | Finalidade secundária de I10 (C009) | CORRECT | PDM I6, I10, §4 (Consentimento), §8.2, §8.3, §9, A11 | Mantida com consentimento próprio via I6, desligado por padrão; a alternativa "remover" foi rejeitada (A11) |
| PCG-J2-02 | Redação de A7(c) | CORRECT | PDM §10, A7 | — |
| PCG-J2-03 | Separar [C] de [P]/LD nas arestas proibidas | CORRECT | PDM §1, §9 | Também corrigido o rótulo misto da Assimetria (PDM §2.2), apontado pela checagem determinística |
| PCG-J2-04 | Caminho de leitura sem dependência de DI-01 | CORRECT | Ver CPA-1.4b | — |
| PCG-J2-05 | Ponteiros desatualizados | CORRECT | PTM §11 (N8), §6 (coluna "Fase" de O006, O009 e O011); PDM §8.4 | — |
| PCG-J2-06 | Redação de R-DR-45 sobre delegação | CORRECT | PDR §6 (R-DR-45), §6.1 | Superada pela regra do Canon §7.1 |
| UX-J2-01 | Owner do critério de aderência | CORRECT | PDM §3 (I1, I2), §3.1, §4 (Desfecho), §6.4, §7 | Mecânica na fase 5, com DR-20 |
| UX-J2-02 | "Mesmo significado" só entre fontes elegíveis | CORRECT | PDM §4 (Contribuição), I4, §6.4, §6.8, §8.1; cenários S3, X10 | Desvio para mais volume não é elegível; elegibilidade fina na fase 5 (O008) |
| UX-J2-03 | Ciclo de vida do retorno fora de compromisso | CORRECT | PDM §4, §5, §8.3 | Durações na fase 22 |
| UX-J2-04 | Criação de Crew como permissão da pessoa | CORRECT | PDM §2.2, §6.1, §6.3, §8.2; cenário X7 | Ver CPA-2.1 |
| UX-J2-05 | Nível de contexto: só carga e implicações, sem prescrição | CORRECT | PDM §3 (I1), §3.1, §4, S10, X4 | LD do Canon §7.1 e de C024, com O013 aberta |
| UX-J2-06 | (a) Recovery e Nutrition do Crew Member; (b) falta de dados do Crew Member | CORRECT | PDM §5, §6.6, X1 | (a) 0 de cada; (b) julgada contra a Intenção declarada |
| UX-J2-07 | Interrupção e vínculo Pausado independentes | CORRECT (regra); DEFER-CP-B (oferta de pausar vínculos); DEFER (rótulos: UI & Experience, fase 18) | PDM §4, §6.2, §6.6; cenário X9; PDR §10 (CPB-10) | — |
| SEC-J2-01 | O que Performance projeta em I7 | DEFER-CP-B | PDR §7, §10 (CPB-01) | Pertence ao SOM |
| SEC-J2-02 | = PCG-J2-01 | CORRECT | Ver PCG-J2-01; PDR §7 | Durações na fase 22 |
| SEC-J2-03 | Recusa e expiração indistinguíveis; ataque por diferença | DEFER-CP-B | PDR §7, §10 (CPB-01) | Fecha com SEC-J-10, antes de `PRODUCT_ARCHITECTURE_APPROVED` |
| SEC-J2-04 | = UX-J2-03 | CORRECT | Ver UX-J2-03; PDR §7 | — |
| SEC-J2-05 | I9 sem conversão nem atribuição | CORRECT | PDM I9, §3.2, §6.9, §8.2, §9; PDR §7 | Mecânica de referral na CP-B (CPB-06) |
| SEC-J2-06 | Pausa sem horário, histórico ou frequência; retorno por Crew | CORRECT | PDM §4, §6.2, §6.6, §8.1; PDR §7 | Estados na fase 6 |
| SEC-J2-07 | Categorias opt-in sem revelar o modo | CORRECT | PDM §8.1; PDR §7 | Elegibilidade na fase 6 |
| SEC-J2-08 | Menores; direitos do titular; achado jurídico | CORRECT (menores, por exclusão de escopo: DR-47); DEFER-CP-B (direitos do titular: CPB-08) | PDM §2.3, §8.4; PDR DR-47, §7, §10 | — |
| SEC-J2-09 | PDM §8.4 e PDR §7 alinhados | CORRECT | PDM §8.4 | Mesma correção da parte de PCG-J2-05 |
| SEC-J2-10 | Objeto DA que entra em I8 | DEFER-CP-B | PDR §7, §10 (CPB-09) | — |
| PDR-L14 | Prosa do cabeçalho do PDR que ainda chamava pendente o gate da fase 3 | CORRECT | PDR, parágrafo após "Classes"; §1 | — |
| CPA-4 | Escopo da CP-B registrado como itens abertos com trigger | CORRECT | PDR §10 | 11 itens; CPB-11 vem do registro do Founder |

**Contagem.** 36 itens: 31 CORRECT; 2 mistos (UX-J2-07: regra CORRECT, oferta DEFER-CP-B, rótulos DEFER para a fase 18; SEC-J2-08: menores CORRECT por exclusão de escopo, direitos DEFER-CP-B); 3 DEFER-CP-B (SEC-J2-01, SEC-J2-03, SEC-J2-10); 0 REJECT. Todos os findings dos deltas estão cobertos: UX-J2-01 a UX-J2-07, PCG-J2-01 a PCG-J2-06, SEC-J2-01 a SEC-J2-10.

**Escalonamento.** Nenhum item exigiu decisão do Founder, mudança de doutrina ou THESIS_CONFLICT. O013 e O014 seguem abertas com o Founder, sem solução dependente adotada.

## 12. Resolução da CP-B (PA-0.1)

Autoavaliação do worker, não veredito. **RESOLVIDO** = regra de arquitetura proposta na PA-0.1, pendente de revisão independente · **CORRECT** = correção feita nesta passagem · **DEFER** = carregado com owner e trigger · **NOT_APPLICABLE** = não se aplica, com motivo.

| Item | Resolução | Local | Fecha com / próximo passo |
|---|---|---|---|
| CPB-01 | RESOLVIDO | PA-0.1 §10: AR-57 a AR-68; NC-11 a NC-13; J6 | Revisão Security: SEC-J-10, SEC-J2-01, SEC-J2-03, SEC-J3-08 |
| CPB-02 | RESOLVIDO | PA-0.1 §9.4: AR-40 a AR-49; NC-01 a NC-06, NC-09, NC-10; J2, J3 | Revisão Security: SEC-J-03, SEC-J-12, SEC-J3-01, SEC-J3-03 |
| CPB-03 | RESOLVIDO | PA-0.1 §9.2: AR-32 a AR-36; J2, J3, J7. A criação de Crew leva o mesmo consentimento do aceite (UX-J3-01) | Revisão Security (SEC-J-01) |
| CPB-04 | RESOLVIDO; DR-33 resolvido | PA-0.1 §9.5: AR-50 a AR-54; NC-04, NC-15; J8. O criador não tem poder especial, e sua saída não muda nada para a Crew (UX-J3-02) | Revisão Security (SEC-J-04) |
| CPB-05 | RESOLVIDO: gestos estruturados; DR-30 resolvido | PA-0.1 §9.6: AR-55 | Revisão Security (SEC-J-06) |
| CPB-06 | RESOLVIDO | PA-0.1 §10: AR-65 a AR-67 | Revisão Security (SEC-J-11, SEC-J2-05); verificação de Engineering na fase 22 |
| CPB-07 | RESOLVIDO | PA-0.1 §9.3: AR-37 a AR-39, AR-44; NC-07, NC-14 | Revisão Security de CPB-07 (SEC-J-13, SEC-J3-09) |
| CPB-08 | RESOLVIDO (requisitos) | PA-0.1 §12: AR-69; J7, J9; regra de destino dos dados da PDM-0.6 §6.1 | Revisão Security (SEC-J2-08, SEC-J3-07); memo jurídico do Founder pendente; um achado posterior reabre a aprovação |
| CPB-09 | NOT_APPLICABLE na base de lançamento | PA-0.1 AR-28 | Nenhum objeto DA entra em I8 com FG-3 A; a regra vale quando um entrar (SEC-J2-10) |
| CPB-10 | RESOLVIDO: oferta opcional, Crew por Crew | PA-0.1 §9.7: AR-56; J4 | Revisão UX-J |
| CPB-11 | RESOLVIDO (requisito) | PA-0.1 AR-09, AR-11, AR-46; NC-08; J1, J2. A entrada do Crew Member pede só idade, nome de exibição e consentimento (C004) | Revisão Security (SEC-J3-01, SEC-J3-02); mecanismo em DR-53 |
| UX-J3-01 | CORRECT | PDM-0.6 §6.1 (regra de destino dos dados ao deixar a experiência pessoal), §6.2 e §8.1 (consentimento na criação) | Revisão Security da PDM-0.6 |
| UX-J3-02 | CORRECT | PA-0.1: DR-31 em AR-19; DR-32 em AR-11 e PA-0.1 §4.1; DR-34 em AR-10; PDM §6.7 em AR-31; superfícies do PDM §2.3 em PA-0.1 §8; casos negativos NC-05 a NC-08 e NC-15. §10 complementa a missão §4 | Revisão UX-J |
| UX-J3-03 | DEFER (fase 5) | Fronteira operacional da finalidade primária de I10, por exemplo: desfechos recentes usados no Plano vigente são primários; padrões longitudinais são secundários | Product/UX com Security; fases 5 e 22 |
| UX-J3-04 | DEFER (fase 5) | Faixa de tolerância do critério de aderência, para que um excesso marginal num dia de Executar não retire o reconhecimento | Product/UX, com DR-20; fase 5 |
| UX-J3-05 | CORRECT | PDM-0.6 I9; §7 deste registro (SEC-J2-05); PA-0.1 AR-67 | — |
| PCG-J3-01 | CORRECT | PTM-0.5.1, T19 e detecção de V9 ("a partir do primeiro Release Scope") | — |
| SEC-J3-01 | RESOLVIDO | PA-0.1 AR-09, AR-43, AR-44, AR-67; NC-05 a NC-09 | Fecha com SEC-J-03 |
| SEC-J3-02 | RESOLVIDO (requisito) | PA-0.1 AR-09; DR-53 | Controles na fase 22; verificador terceiro com revisão Security |
| SEC-J3-03 | RESOLVIDO | PA-0.1 AR-37, AR-49; NC-09 | Alimenta SEC-J-15 |
| SEC-J3-04 | RESOLVIDO (arquitetura de consentimento) | PA-0.1 AR-20 | Estratégia de integração na fase 22 (DR-13) |
| SEC-J3-05 | DEFER (fase 8) | §7 deste registro | UX Spec; threat model na fase 22 |
| SEC-J3-06 | DEFER (fase 8) | §7 deste registro | UX Spec |
| SEC-J3-07 | RESOLVIDO (regra) | PA-0.1 AR-69; J7 | Prova de Engineering na fase 22 |
| SEC-J3-08 | RESOLVIDO | PA-0.1 AR-61, AR-62; NC-13 | Fecha com SEC-J-10 |
| SEC-J3-09 | RESOLVIDO; pede revisão Security | PA-0.1 AR-39, AR-44; NC-14 | Revisão Security de CPB-07 |

**Contagem.** 26 itens: 17 RESOLVIDO (10 CPB e 7 SEC-J3), 1 NOT_APPLICABLE (CPB-09), 4 CORRECT (UX-J3-01, UX-J3-02, UX-J3-05, PCG-J3-01), 4 DEFER (UX-J3-03 e UX-J3-04 para a fase 5; SEC-J3-05 e SEC-J3-06 para a fase 8) e 0 REJECT. RESOLVIDO é proposta pendente de revisão independente.

## 13. Decisão do Founder de 2026-10-11: conflitos e sincronização

Conferência pedida pela própria decisão: "Se encontrar conflito com uma regra anterior, registre-o e ajuste o trecho afetado conforme esta decisão, preservando o restante."

| Fonte | Trecho | Conflito | Ação |
|---|---|---|---|
| PDR-0.5, DR-35 | "Uso de IA no motor e nas explicações", fase 22 | Sim: o agente do produto torna a IA matéria de experiência nas fases 4 e 5 | DR-35 atualizado |
| PDR-0.5 §4, linha do AI Systems | "somente se o motor ou suas explicações usarem IA", fase 22 | Sim | Linha atualizada: revisão da fase 4, fase 5 e fase 22 |
| PDR, DR-11 e FG-3 | "menor superfície (L022)" | Não: trata do escopo de conceitos sociais, não de quantidade de telas | Nenhuma |
| PDM-0.5 | — | Nenhum trecho fazia tarefa simples depender de conversa nem tinha meta de telas mínimas | Agente acrescentado como canal na PDM-0.6 |
| PTM-0.5 | L022 ("chatbot de treino"), C015 | Não: coerentes com os princípios 2, 4 e 8 | Sincronizar os IDs depois da publicação do 2.3.0 |
| Modelo de navegação considerado na CP-B, nunca publicado | plano dentro da entrada contextual | Sim, com os princípios 1 e 7 | Rejeitado (PA-0.1, ALT-1, alternativa B) |
| Princípio 4: "Respeite os contratos existentes de confirmação e autonomia" | não existe contrato do agente | Lacuna | DR-51; o rascunho do 2.3.0 propõe O015, pendente de publicação |
| Canon C024 e princípio 3 | profundidade por modalidade durante o faseamento | Não (LD): a profundidade vale quando o Release Scope declara a modalidade plenamente suportada; abaixo da cobertura, valem §7.1 e C024 | Registrado em PA-0.1 §5 |

**Sincronização feita:** a PA-0.1, construída com a decisão (seu §1 mapeia cada princípio); a PDM-0.6, com o agente como canal, sem autoridade própria nem estado paralelo; DR-50, DR-51 e DR-35; a linha do AI Systems em §4. **Pendente:** os IDs do PTC-2.3.0, depois da publicação, e as revisões Security e AI Systems do agente.
