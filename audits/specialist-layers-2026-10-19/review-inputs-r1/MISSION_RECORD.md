# SIL-20261019 — amendment isolado de especialistas

Contrato **SIL-20261019-r1** · 2026-10-19 America/Sao_Paulo · estado **CANDIDATE_IN_ISOLATION / PRE_REVIEW**.

## 1. Pedido, rota e limite

[Fonte humana](FOUNDER_REQUEST.md): Founder autoriza formalizar o princípio e a arquitetura, com alteração direta de arquivos em isolamento e sem interromper o Claude. Não é missão nova no checkout ativo. Autoria documental: Codex `/root`, responsabilidades PCG/arquitetura; worker não julga a própria entrega. Consolidação normativa deverá ser de instância Chief distinta. Sem código de produto, UI/Figma, rollout, conector/provider, pesquisa de mercado, nova coleta ou alteração global.

Rota aplicada por `route-work` 1.4.0 + registry/routing.json 1.4.0: **T3/R2/L3**, documentary productization; autonomia de edição/commit/patch isolados já autorizada. Impacto alto (princípio + fronteiras conceituais), irreversibilidade baixa (cópia/patch reversíveis), incerteza média (paridade/efeito não demonstrados, hipóteses abertas), dependências sistêmicas delimitadas (Canon→AEC/PDM→PA/Scope/AEOS→UX). L3 cobre integridade normativa e coerência de contratos; não há trust boundary real alterada.

Flags verdadeiras: documentation_only, product_doctrine, product_structure, data_model (conceitual), technical_boundary (ownership), domain_logic (especificação), systemic, parallel_edits, isolation_required, git_delivery, independent_review. Flags sem mudança: code_changed/auth/permissions/new_trust_boundary/sensitive_data/ai_material/analytics_changed/external_integration/visual_surface. Dados/analytics já descritos ganham semântica; nenhum tratamento, recipient, finalidade, superfície ou capacidade de IA nova é autorizado. AI/JEV/LLM e Security mantêm contratos originais; Engineering verificará se o detalhamento realmente os preserva.

Grafo mínimo: root autor → checks objetivos → Research (fidelidade/epistemologia, doctrine_audit) + Product/UX (interpretabilidade e compatibilidade com UX) + Engineering (contratos/carga/loops) independentes, sem edição dos artefatos → Chief independente consolida somente os pareceres. Research não faz pesquisa nova; o outcome é formalização, não comprovação empírica. Designer/UI/implementação/Quality executável/Data experimento/Release dispensados: sem superfície/código/medição/deploy. Security não despachado inicialmente: não muda finalidade/perm/recipient/coleta/trust boundary; rerotear se a review identificar expansão real. IA não despachada: SHADOW, B0, LLM e autoridade permanecem byte-identical nas seções de controle.

STOP_WHEN: contratos completos, referências coerentes, checks atuais, reviews pertinentes resolvidos, patch/commit/handoff verificáveis. Não requer integrar no checkout do Claude ou receber aceite dele para entregar o patch. ESCALATE_IF: conflito de doutrina sem autorização, coleta/IA/autonomia nova, risco real, alteração inevitável da UX ativa ou mesmo finding material sobrevivendo a duas correções. Não pedir novamente aprovação já dada para este delta.

## 2. Grounding e isolamento

Repositório confirmado: `C:/Users/carva/Desktop/myApp/MyApp`, `main` **unborn**, sem commits; todos os arquivos de projeto untracked. Nenhum worktree ou branch com base utilizável; ferramenta de anexos não tinha checkout disponível. Criar commit/branch no diretório ativo mudaria o ambiente do Claude. Escolhida cópia isolada em `work/vilumo-specialist-layers` desta sessão, Git próprio, branch `docs/specialist-parity-run-strength`. Não é worktree/clonagem com histórico do MyApp: é snapshot independente, sem fingir base upstream existente.

Snapshot: **201 arquivos**, hashes brutos em [SOURCE_BASELINE.json](SOURCE_BASELINE.json), capturados com conferência fonte/cópia por arquivo. Baseline Git recuperável **`0bc196210686b72c4c72090d260bfe86289a6bc4`** (branch `snapshot/myapp-20261019`). Lease de edição = somente esse diretório isolado por `/root`. Nenhum stash/reset/switch/add/commit no repositório ativo. Canon/consumidores editados são candidatos desta cópia, não publicação ativa. Todos os arquivos antigos ficam recuperáveis, sem copiar novo snapshot redundante para o patch.

Fontes inspecionadas: AGENTS/CLAUDE locais e instruções ancestrais; CURRENT_MISSION e MISSION_LEDGER; Canon/índice/PTM/PDR §§1–6 e histórico discriminado; PDM/PA/Scope/AEC; AEOS/AESL; manifests/snapshots 3.0.0 e pré-UX, deltas 2.2→2.3 para convenção; missão e pareceres/checador UX atuais. Nenhum outro projeto/legacy/Figma foi inspecionado. EM/CF são consumidores preservados; não há mudança de jornadas que exija sua reautoria.

Claude estava em **UXSPEC-20261018**, UXS-1.0-r3 `598b055d8df6cf67cafe0365e88d0ba694164d00c7ab6576fc2643eff5dcfcdb`; CP7, revalidação final em curso. Missão proíbe visual/Figma e exige checkpoint Founder separado. O pedido atual exige seguir para telas/visual após o gate; handoff mantém a sequência e o checkpoint já vigente. Não declarar autorização visual antecipada, fechar gate de outro autor ou mudar CURRENT_MISSION.

## 3. Current → target → delta e impacto

Baseline: Run × Strength first-class, contexto/plano únicos e coordenação já aprovados; capacidades esportivas detinham sobretudo semântica/registro. AEOS tinha gerador de receitas, SessionIntent/Demand, conflitos e HC/B0, mas não detalhava programação/progressão/performance especialista suficiente. C043/DR61 e Scope rejeitavam feature parity. A nova decisão **aperta competência decisória**, sem inverter essa seleção de features.

| Artefato | Revisão candidata | Natureza / delta necessário |
|---|---|---|
| canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md | PTC-3.1.0 | **Amplia** com C045 (qualidade especialista/coordenação superior pretendida); **explicita** C046. Vincula C024/C042/C043; preserva integralmente todos os LOCKED. |
| canon/CANONICAL_INDEX.md | CI-3.1.0-candidate | Seleciona versões só na cópia isolada, registra novas specs e distingue baseline/publicação ativa. Corrige ponteiro de missão para UXSPEC vigente sem editar missão. |
| product/PRODUCT_TRUTH_MAP.md | PTM-1.1 | S7, C045/C046 e resolução THESIS_CONFLICT-SIL-01; migração/histórico preservados. |
| product/PRODUCT_DECISION_REGISTER.md | PDR-1.2 | DR72–75; não substitui DR55–71, G01–11 ou bytes do registro histórico PDR-0.6. |
| product/PRODUCT_DOMAIN_MODEL.md | PDM-1.2 | **Amplia** semântica de capacidades para especialistas; **explicita** Athlete Model/projeções/I11/I12 e ownership único. Sem nova coleta/entidade de pessoa/consentimento. |
| product/PRODUCT_ARCHITECTURE.md | PA-1.2 | AR16/17: especialistas internos e mesmas superfícies; AR01–15/estrutura de UI permanecem. |
| product/ADAPTIVE_ENGINE_CONTRACT.md | AEC-1.2 | §1.1: única prescrição/arbitragem, carga/loops e progressão versus redução; comportamento/controle anterior preservado. |
| product/ADAPTIVE_ENGINE_OPERATIONAL_SPEC.md | AEOS-1.1-r1 | §2.1 encaixa especialistas no pipeline existente; não substitui HC/B0/JEV/policy gate/guarda/LLM. Explicita início da sessão como mudança material para proposta afetada. |
| product/ADAPTIVE_ENGINE_SCENARIO_LAB.md | AESL-1.1-r1 | §9 acrescenta 14 oráculos SIL sem tocar S01–47/Q01–09. Especificação, nunca afirmação de run executado. |
| product/V1_RELEASE_SCOPE.md | RS-1.2 | Distingue feature parity de competência; mapeia cobertura/prova sem comprometer toda família/método na V1. |
| product/SPORT_INTELLIGENCE_SPEC.md | SIS-1.0-r1 (novo) | Consumidor: implementação de contratos internos; possui apenas detalhamento das fronteiras sob AEC/AEOS, não policy/plano/gaps concorrentes. |
| product/RUN_INTELLIGENCE_SPEC.md | RIL-1.0-r1 (novo) | Consumidor: receitas/modelos/progressão de corrida; seis núcleos decisórios e regras de ausência/comparabilidade. |
| product/STRENGTH_INTELLIGENCE_SPEC.md | STIL-1.0-r1 (novo) | Consumidor: receitas/exercise intelligence/modelos/progressão de força; seis núcleos, estruturas e comparabilidade. |

**THESIS_CONFLICT-SIL-01:** fonte A C043/DR61/Scope “feature parity não é objetivo”; fonte B pedido atual requisito 4. Resolvido sob autoridade direta Founder: C045 exige paridade **de competência no núcleo decisório** e mantém C043 contra catálogo. Não reescrever DR61/história como se o padrão anterior já fosse esse. Resultado/mercado/eficácia continuam hipóteses H009/O017/G11, sem claims de concorrentes importados da conversa.

**Preservados/sem contradição:** Run/Strength ambos V1, prioridade/dose não iguais; contexto/plano/sessão únicos; Engine autoridade, agência/confirm/undo; Recovery parte do núcleo; G01–G11/PS01–08; Nutrition contextual; Crew Lite; app-first Strength; representação neutra/export separado; privacidade/opt-in I10; B0 oficial/JEV SHADOW/LLM explicador; sem Cycling/Swimming V1. Future full support exige paridade, sem obrigação de roadmap.

**Consumidores intocados:** UX Spec ativa, EM/CF, missão/ledger/AGENTS/CLAUDE, todas as evidências/reviews/snapshots anteriores. Publicações históricas mantêm sua prova sobre inputs originais, não aprovam novos hashes. Início da sessão com proposta pendente já era HC07/guarda crítica; esta explicitação atende UPSTREAM-ISSUE-04 sem redesenhar UX. Demais UPSTREAM-ISSUE/FD do Claude continuam com seus owners; SIL não os resolve nem reabre.

## 4. Verificação e reviews

Checador existente `audits/ux-spec-2026-10-18/verify_uxspec.ps1`, modo pre-review, executado no checkout ativo com saída externa à árvore: **304 PASS, 0 FAIL, 2 warnings**, antes de editar a cópia. Warnings são citações intencionais de “+20%” já conhecidas, não novos números prescritivos. Final mode pertence ao fechamento ainda em curso do Claude, não é forçado por esta missão. O verificador é específico à allowlist/congelamento UXSPEC; aplicá-lo à cópia com amendment autorizado marcaria os deltas intencionais como violação. Não se altera seu script/expectativas para fabricar PASS.

Checks do delta: diff/allowlist, preservação dos demais arquivos/LOCKED/histórico, links locais, versões/IDs, invariantes de controle preservados; inspeção de cobertura e independência documental. Evidência bruta em PRE_REVIEW_VERIFICATION.json e DELIVERY_VERIFICATION.json. Não há build/testes de produto porque o repositório contém somente documentos e nenhuma implementação foi autorizada. Não se executa treino/harness/eval fisiológica por adicionar oráculos.

Pareceres independentes serão registrados em RESEARCH_REVIEW.md, UX_REVIEW.md e ENGINEERING_REVIEW.md, vinculados ao REVIEW_INPUTS.json. Chief consolida em CONSOLIDATION.md. Revisões materiais recebem revalidação do judge pertinente; parecer antigo não cobre hash novo. Sem declaração canônica/merge pronto por self-check.

## 5. Handoff e restos

Claude recebe [handoff curto](HANDOFF_CLAUDE.md); não houve envio automático de mensagem, interrupção de agente ou alteração de missão. Patch pode ser conferido/aplicado após o gate atual com comparação das bases — não usar reset/checkout para sobrepor trabalho. Se algum arquivo de autoridade tiver mudado, aplicar somente os hunks compatíveis e resolver a divergência real, sem reiniciar UX.

Restam execução futura e evidência profissional/real sob G01–G11, definição empírica de comparadores de paridade e superioridade, integração do patch e aceite humano/consumidor. Não são trabalho documental genérico para o Claude. Esta entrega não anuncia suporte pronto, release, aprovação clínica ou Figma iniciado.
