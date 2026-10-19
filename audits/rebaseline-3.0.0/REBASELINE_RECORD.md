# Controlled canonical rebaseline — Vilumo Fit 3.0.0

Data: 2026-10-14 (America/Sao_Paulo). Estado inicial: IN_PROGRESS.
Owner/coordenador: Codex / instância corrente como Chief. Projeto: `C:/Users/carva/Desktop/myApp/MyApp`.

## Autoridade bruta do Founder

Fonte: pedido direto do usuário nesta sessão, 2026-10-14. O preview da conversa referenciada é contexto importado, não autoridade adicional. Nenhum projeto anterior foi consultado.

> No projeto local `C:\Users\carva\Desktop\myApp`, execute um controlled canonical rebaseline completo das documentações do Vilumo Fit, preservando histórico e decisões ainda válidas, sem reiniciar o projeto do zero. A nova direção canônica da V1 é: Running × Strength como domínios first-class; Adaptive Engine como núcleo e principal diferencial; Nutrition apenas como contextual performance insights ligados às demandas do treino (não food logging, dieta completa ou meal planner); Wearables como infraestrutura de closed loop, incluindo ingestão de atividades e envio de structured workouts para relógios quando suportado; Crew Lite como camada básica de continuidade/accountability/distribuição, sem chat, discovery público, communities abertas ou marketplace. Cycling, Swimming e outros esportes permanecem possíveis expansões futuras e a arquitetura deve continuar extensível, mas ficam fora da V1. Preserve AGENTS.md/CLAUDE.md e governança quando ainda válidos; nunca apague MISSION_LEDGER, snapshots ou histórico. Faça snapshot/arquivo do baseline anterior se necessário. Reescreva de forma consolidada e limpa, em vez de acumular patches, os documentos canônicos cuja verdade mudou materialmente, incluindo ao menos Product Thesis Contract e Product Truth Map; refatore Product Domain Model e Product Architecture preservando extensibilidade sem overengineering; registre novas decisões no Product Decision Register sem apagar decisões históricas; reescreva CURRENT_MISSION para a nova direção. Crie/atualize V1 Release Scope, Experience Model e Core Flows somente se forem consumidores naturais e estiverem no estágio correto, evitando document sprawl. Se um Adaptive Engine Contract fizer sentido como artefato de autoridade, crie-o apenas se houver consumidor claro. Incorpore como princípio estratégico a tese de entrar em categoria lotada por inovação real, sem copiar Pierre Finance: market density não implica product completeness; feature parity não é objetivo; toda feature deve aumentar a capacidade do Vilumo de coordenar o atleta ou servir claramente ao loop Decide → Prepare → Execute → Observe → Adapt → Share → Repeat. Também registre limites de Nutrition e Crew para impedir expansão indevida de escopo. Faça uma auditoria final de consistência cruzada entre documentos, remova contradições e deixe uma única verdade canônica clara. Não implemente código de produto nem Figma nesta missão. Ao final, produza um relatório curto com: arquivos alterados/criados/arquivados, principais decisões, o que permaneceu inalterado, contradições resolvidas, questões realmente abertas e a ordem recomendada para o Claude retomar na sexta-feira.

Steering direto adicional do Founder nesta sessão:

> use os agentes e o fluxo de trabalho adequado para trabalhar assim como o claude vinha fazendo enquanto escrevia esses documentos para garantir a qualidade e consistencia

Steering posterior: usar a arquitetura existente e Chief/Orchestrator como entrada; avaliar coerência de tese/escopo/domínio, arquitetura, experiência/UX afetada e auditoria final de autoridade; aplicar Execution Proportionality sem convocar papéis apenas por existirem. Os entry points AGENTS.md/CLAUDE.md e constituições CORE/Chief/PCG/Product-UX, routing 1.4.0 e política de proporcionalidade foram lidos. A instância corrente exerce Chief conforme o contrato instalado; não foi criada uma arquitetura alternativa.

## Task Contract / routing

- Revisão do contrato: RB-3.0.0-r1. Fase: design/review documental; productization do cânone, sem implementação.
- Routing: T3/R3, L3 Governance Gate. L4 estratégico já decidido pelo Founder acima; não requer confirmação repetida. Impacto alto (doutrina e dependentes); irreversibilidade baixa (snapshot verificável); incerteza delimitada (formalização, sem validar mercado); dependências altas (tese → domínio/arquitetura → experiência/flows).
- Flags afetadas: product_doctrine, product_structure, documentation_only, independent_review, data_model, external_integration, sensitive_data/permissions (contratos conceituais de wearable/social, não coleta real). Sem code_changed, visual_surface, auth implementation, deployment ou pagamentos.
- evidence_policy: doctrine_audit. Auditoria de fidelidade e premissas; hipóteses de diferenciação, retenção, segurança/eficácia e willingness-to-pay continuam não validadas. Não há pesquisa de concorrentes nem promessa de capacidade de provedor.
- PCG worker `pcg_rebaseline`: autoria da tese 3.0.0 e Truth Map. Product/UX worker `architecture_rebaseline`: domínio/arquitetura e consumidores naturais. Chief/instância corrente: integração, registro, missão, índice e handoff. Research judge: fonte/fidelidade/epistemologia. Product/UX judge fresco: interpretabilidade e consistência estrutural. Security judge: fronteiras conceituais de privacidade. Engineering judge: apenas contratos de closed loop e reconciliação; arquitetura técnica e implementação permanecem fora do gate. Worker != judge; reviewers não editam artefatos avaliados.
- Dependências: snapshot/autoridade → draft PCG → checks → fidelity + interpretability → consolidação/publicação; domínio/arquitetura consomem draft com revisão explícita, sem promover draft silenciosamente; scope → experience → core flows; security/integration review antes do fechamento documental.
- Mechanism mínimo: documentação existente e audit trail local; sem novo pipeline global, council, implementação, Figma, instalação ou scheduler. Não inicia outro projeto.
- Exclusões com motivo: Designer/UI não participa porque não há manifestação visual/Figma; AI Systems não participa agora porque nenhum modelo, tool, memória ou autonomia de agente foi selecionado/ampliado (política conservadora e O015 permanecem); Data não define métrica/instrumentação nesta formalização; Product Engineer/Quality/Release não têm comportamento executável ou entrega de software para implementar/testar/liberar. Esses papéis entram apenas quando o trigger concreto futuro ocorrer.
- Helper Python de routing não executado: o alias `python` do host não contém runtime instalado. A matriz/rubrica foram aplicadas diretamente; checks objetivos equivalentes de integridade/traceability são executados por PowerShell. Não há limitação de prova documental por essa indisponibilidade.
- Checks: integridade de 49 arquivos no snapshot; AGENTS/CLAUDE intactos; ledger append-only; registros históricos intactos; IDs/links/versões/escopo; cenários cruzados de corrida/força, recovery, Nutrition, wearable degradado e Crew; pareceres atuais por hashes. Gates históricos não cobrem revisões novas.
- STOP_WHEN: documentação consistente e publicada dentro da autoridade direta; checks e pareceres materiais atuais sem finding bloqueante; handoff e questões abertas delimitados. Não equivale a release, UX visual, Figma ou technical readiness.
- ESCALATE_IF: nova estratégia fora do pedido, conflito de autoridade não resolvido, perda de histórico, finding material persistente após duas correções, limitação que impede prova necessária. Revisões técnicas profundas ficam na missão futura se não forem requisito da formalização.

## Baseline e preservação

Snapshot integral e byte-identical criado antes de qualquer edição: `../../governance/snapshots/2026-10-14-pre-3.0.0/` (49 arquivos; `.git` excluído). Manifesto SHA-256: `../../governance/snapshots/2026-10-14-pre-3.0.0/SNAPSHOT_MANIFEST.json`.
Baseline: PTC-2.3.0, PTM-0.5.1, PDM-0.6, PA-0.1, PDR-0.6; repositório main sem commits, todos os documentos preexistentes untracked. Não foi feito reset, limpeza, commit ou recuperação de outro projeto.

## Current → target → delta

Current: dois pilares first-class (Adaptive Performance/Social Continuity), quatro esportes mínimos obrigatórios, Wearables apenas fontes, Nutrition com profundidade possível em aberto e missão que avançaria até Figma/handoff técnico.
Target decidido: V1 Running × Strength coordenados por um Adaptive Engine; Nutrition contextual; closed loop wearable bidirecional quando suportado; Crew Lite subordinado ao valor de treino/continuidade. Expansão esportiva possível sem dívida obrigatória da V1. Missão estritamente documental.
Delta normativo: revisar obrigações conflitantes com rastreabilidade; preservar agência, recuperação legítima, privacidade, não competição física ingênua, valor solo, execução direta, experiência contextual e acabamento. Pierre é referência estratégica de inovação/qualidade, não prova de mercado nem template.

## Revisões, decisões de integração e fechamento

Preenchido pelo Chief após os checks e pareceres vigentes. Relatórios de revisão são evidência, não fontes alternativas de Product Truth.


## Fechamento documental 3.0.0 — 2026-10-14

**Baseline publicado; handoff Product/UX ACCEPTED; missão COMPLETE_DOCUMENTATION_ONLY.** Evento: `VF-PTC-3.0.0-CANONICAL-20261014-001`, `PUBLICATION_EVENT.json`. O aceite de Claude não foi presumido. A interrupção por limite de uso ocorreu no closed loop; o mesmo judge retomou do checkpoint, sem reabrir Product/UX r2, Privacy r2 ou decisões aprovadas.

Chief consolidou PRODUCT_CONSTITUTION_READY com fidelidade e interpretabilidade independentes. Estado por escopo:

| Parecer | Veredito / evidência |
|---|---|
| DOCTRINE_EVIDENCE_REVIEWED | PASS — `DOCTRINE_EVIDENCE_REVIEWED_r1.md` |
| DOCTRINE_INTERPRETABLE | PASS — `DOCTRINE_INTERPRETABLE_r1.md` |
| PRODUCT_UX_CONSISTENCY | PASS documental — `PRODUCT_UX_CONSISTENCY_r2.md` |
| PRIVACY_BOUNDARIES_REVIEWED | PASS documental — `PRIVACY_BOUNDARIES_REVIEWED_r2.md` |
| CLOSED_LOOP_CONTRACT_REVIEWED | PASS documental — `CLOSED_LOOP_CONTRACT_REVIEWED_r1.md`; nenhuma correção nova exigida |

Correção única do worker fechou UXRB-01–03 e PB-J-01/02: revogação wearable por finalidade versus desconexão completa; nenhuma lista/dado real de Crew antes do vínculo; share de desfecho genérico próprio distinto de sinais/contexto Health/Recovery; DR-65 incluído; derivados secundários I10 deixam de ser usados/removidos após revogação; inferência humana residual explicitada. FAILs r1 e prechecks r1/r2 permanecem preservados. Followups Privacy PB-F-01–03 e Engineering CL-F01–03 têm owner/trigger e não foram promovidos a prova executável.

Publicação alterou somente metadados de estado/aprovação, com reconstrução por allowlist e hashes reviewed/published no evento. O consumidor Product/UX confirmou status/hash reais de PTC/PTM e 8/8 corpos equivalentes, além dos cinco pareceres. O prefixo de autoridade/contrato deste registro foi mantido integralmente; apenas este fechamento foi acrescentado. Current Mission encerra apenas a documentação.

Verificação final: `FINAL_VERIFICATION.json`. Reutiliza os checks normativos e de preservação já aprovados na r2; verifica somente hashes/publicação, equivalência de corpos, links adicionados, pareceres atuais, append-only do ledger/registro, histórico do PDR e estados finais. Não repete discovery, julgamentos ou validação empírica.

Alterados oito arquivos existentes: PTC, Truth Map, Domain Model, Architecture, Decision Register, CURRENT_MISSION, CANONICAL_INDEX e MISSION_LEDGER (append-only). Criados quatro consumidores naturais: V1_RELEASE_SCOPE, ADAPTIVE_ENGINE_CONTRACT, EXPERIENCE_MODEL e CORE_FLOWS. Audit trail é evidência de execução, não novos documentos de produto. Snapshot anterior integral de 49 arquivos; 41 originais fora da lista de rewrite permanecem byte-identical conforme evidência r2. AGENTS/CLAUDE, fontes humanas, governance histórica, snapshots e reviews antigos intactos.

Questões realmente abertas: safety/população/treino e Nutrition; credibilidade/evals Run×Strength (O014/O017); matriz e viabilidade wearable (O016), sync e autorização reais; preço/packaging; idade/canal/retention/deleção e disclosure nas superfícies; métricas/evidência e tecnologia/autonomia de agente somente se entrar no release. Cada uma para no trigger de uso real, promessa ou implementação dependente. Não estão abertas as escolhas estratégicas já dadas pelo Founder.

Claude retoma sexta-feira 2026-10-16: índice → tese/Truth Map → PDR/missão → Scope/AEC → domínio/arquitetura/Experience/Core Flows → audits/publicação. Próximo trabalho é fechar evidência/políticas e capacidades que condicionam UX Spec, depois especificar a experiência apenas para o Scope aprovado, sob missão proporcional. Não retomar a missão histórica de 22 fases, não iniciar código/Figma nem ampliar Nutrition/Crew/esportes.