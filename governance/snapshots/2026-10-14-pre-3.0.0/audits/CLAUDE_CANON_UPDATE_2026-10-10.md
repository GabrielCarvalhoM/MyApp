# Validação — arquitetura Claude e Canon Vilumo Fit

Data: 10/10/2026, America/Sao_Paulo. Executor principal: Codex. Repositório efetivo: `C:/Users/carva/Desktop/myApp/MyApp`. Arquitetura alvo: `C:/Users/carva/.claude`. Sem edição metodológica de `.codex`, implementação do app, commit ou reinício da missão.

## CURRENT → TARGET → DELTA

O pacote 1.4.0 já possuía necessity, progressive depth, independência, gates por revisão, correction threshold 2, stop e exploration/productization. A suíte inicial passou 148/148. O delta 1.5.0 acrescenta routing de unidade/modelo/effort, adapter executável e regressões sem recriar esse núcleo. Fonte do diagnóstico: `work/CURRENT_TARGET_DELTA.md`; snapshots antes de editar em `work/before`.

**Causa do mission-wide L4:** o ledger rev1 tomou a existência de futuros Founder gates como motivo para um Overall L4. Isso confundia contexto do programa com decisão atual. O helper prévio já reservava L4 a reserved_decision, mas não recusava containers nem havia regra explícita contra herdar o nível do programa. Agora mission/program são recusados pelo helper, e a política/Chief/contrato/ledger exigem unidade atual. Programa sem nível herdável; decisões já autorizadas não são reapresentadas.

**Causa do preset de modelo:** settings global continha model=opus; os 12 agentes declaravam model: inherit; o despacho real do Architect omitiu model/effort. Assim, tarefas herdavam o parent Opus5.5. Não foi encontrada configuração global persistida de max; esforço omitido herdava o contexto do runtime. Removido o modelo global fixo, mantidas as notificações, permissões e identidades dos agentes. O Chief escolhe explicitamente rota e esforço; vínculos de versões de família não fixam um modelo para a missão.

## Runtime real

CLI observado: Claude Code 2.1.296. --model/--effort são disponíveis; a documentação informa effort por invocação não-fork desde 2.1.292. O teste local mostrou uma distinção: o schema de model do Agent aceita aliases, enquanto CLI/declarações aceitam IDs completos. O primeiro adapter que tentou enviar um ID completo foi recusado; ele foi corrigido, não declarado implementado por Markdown.

O guard global PreToolUse Agent|Task valida <task-route>, liga IDs exatos às famílias verificadas opus/Sonnet, aplica model/effort nativos, corrige floor material UI/UX, bloqueia envelopes/overrides/forks/teammates incompatíveis e usa exec form/onFailure=block. Não concede permissionDecision allow. Rota não cadastrada usa verificação adicional ou invoke_task.py com ID exato/effort e handoff atual; wrapper rejeita effort env conflitante e root inválido. Agent roles continuam neutros; metadata de Designer não recebe floor pelo cargo.

**Provas executadas:** parent Sonnet5.5/low → child UI Designer Opus5.5; hook dentro do child observa effort.level=max. Agent ID e session ID ligam observação à execução. Metadata do mesmo role ficou Sonnet5.5/low; uma chamada sem envelope foi negada antes do retry corrigido. Esses são testes controlados, não aprovação de UI do Vilumo. Evidência bruta em native-smoke.jsonl, native-mechanical.jsonl e effort-observations.jsonl.

Os flags MODEL_ROUTE_RUNTIME_ENFORCED e UI_UX_OPUS_5_5_MAX_RUNTIME_ENFORCED são NO **para garantia global/universal**. O caminho nativo de inputs foi aplicado e observado, mas não cobre classificação semântica falsa, trabalho direto na sessão principal, hooks desabilitados/bare/safe mode, provider substitutions, managed model/effort caps ou worker já em andamento. As políticas exigem verificar rota efetiva e segurar apenas o trabalho dependente se houver mismatch. Não existe alegação de troca automática universal de modelo na sessão principal.

[Subagents oficial](https://code.claude.com/docs/en/sub-agents), [configuração de modelo/effort](https://code.claude.com/docs/en/model-config), [hooks oficial](https://code.claude.com/docs/en/hooks). As capacidades acima distinguem documentação de observação local.

## Evals e review

- Instalação: PASS, 105 arquivos no manifest, zero errors; 12 agentes, 17 skills, 9 playbooks, 16 rubricas.
- Policy regressions: 192/192 PASS, incluindo os 20 cenários obrigatórios, checks do guard, alias bindings, wrapper/override e gates atuais/stale/self-approval.
- Engineering execution: 80/80 PASS.
- Scoped verification: 18/18 PASS. Todos os 23 textos LOCKED / INVARIANT preservados; IDs únicos; duas decisões presentes; fontes downstream atuais; nenhum app code; 99 arquivos metodológicos protegidos de Codex com hashes inalterados.
- Judge técnico independente: ENGINEERING_ARCHITECTURE_READY PASS, `/root/routing_runtime_judge`; 9 checks adicionais do guard e 5 do wrapper. Coverage limitada explicitamente.
- Auditor normativo independente: DOCTRINE_EVIDENCE_REVIEWED PASS, `/root/doctrine_fidelity_judge`, cobre ambas as decisões Founder; 37 termos/cláusulas presentes. Nenhum legacy ou pesquisa concorrencial.
- Verificação final de arquivos/estado: 11/11 PASS, incluindo hash do Canon/index, revisões downstream 0.3, manifest vigente, gates pendentes e ausência de implementação.
- DOCTRINE_INTERPRETABLE: BLOCKED. O reviewer independente Opus5.5/max leu as fontes atuais, mas não entregou parecer final. Uma tentativa posterior com escopo menor retornou HTTP429 usage_limit_reached antes do despacho, com reset informado para 10/10/2026 às 04:00 America/Sao_Paulo.
- Chief independente: PRODUCT_CONSTITUTION_READY BLOCKED pela ausência desse parecer. Não houve substituição por modelo inferior, aprovação inferida nem nova confirmação Founder solicitada. As decisões autorizadas estão incorporadas ao input canônico local; a conclusão formal de readiness/publicação/handoff permanece pendente.

Resultados sintéticos provam regras determinísticas, não qualidade universal, eficácia, mercado ou Figma pronto. Evidência/reviews pertencem ao projeto/sessão; o global contém somente regras/templates/casos sintéticos.

O gate pendente segue a instrução explícita de [product-governance](C:/Users/carva/.agents/skills/product-governance/SKILL.md): “READY exige ambos PASS, checks/autoridade e conflitos resolvidos”. Ela exige os pareceres independentes de fidelidade e interpretabilidade; só o primeiro terminou. O bloqueio é técnico de quota, não falta de autorização do Founder.

## Product Canon

Contrato local atualizado com as decisões autorizadas: VILUMO-PTC-2.1.0, SHA-256 4d4ccb65b341efc45b88bbf5aa173bb34c2f39452e5f6b85dd3beb6b8ee6dbd1. O index aponta para esta fonte atual e registra explicitamente o gate formal bloqueado.

- §21.1 C016–C022: Shareability & Social Projection e seus seis princípios como CURRENT PRODUCT DECISION. Capability transversal; Adaptive Performance e Social Continuity continuam os dois pilares. Objetivos comerciais permanecem intenções, sem efeito demonstrado. Exemplos individuais/Crew não são backlog. D010 conserva objetos/templates/formatos/quantidade em Design Space.
- §30/30.1: SHAREABLE OBJECT MODEL e SHAREABLE VISUAL SYSTEM, nas fases apropriadas, sem ontologia ou catálogo antecipado. C021/L014 governam consentimento apropriado e prevenção de exposição/reidentificação; C022/L012/L020 impedem vanity/posting drift. §31 inclui critérios de violação correspondentes.
- §7 C023: Running, Cycling, Swimming e Strength Training de primeira classe como mínimo obrigatório. Remover/rebaixar requer nova decisão explícita Founder. A lista permanece CURRENT PRODUCT DECISION, não LOCKED. L023 continua o invariant abstrato de Sport Depth; D011 conserva outras modalidades abertas.
- §7/27/30/31/33: produto separado de release sequencing/depth. Não se exige simultaneidade/profundidade idêntica; faseamento exige minimum credible coverage e não legitima placeholder ou tracking genérico. Integração com Athlete Model, Recovery/Nutrition, coordenação assimétrica, flows/dados/métricas/handoff conforme fase. Nenhuma unidade física social universal ou template genérico é imposto.

## Estado e downstream

MISSÃO segue IN_PROGRESS; gates não aprovados continuam PENDING. Overall L4 foi removido do ledger rev2. Cada task futura registra execução/risco/owner/judges/rota/reason/effort/artifacts/stop/escalation no contrato corrente; trivial L0 é execução direta sem ceremony.

Durante o audit, o Architect entregou PTM/PDM/PDR 0.1. Correção localizada para 0.2: fontes atuais; C016–C023/D010–D011; retirada da pergunta/recomendação de reduzir o conjunto esportivo; FG-1 resolvido quanto à lista; cenário de Swimming incidental corrigido para modalidade adicional. O Architect depois incorporou a reconciliação e entregou as revisões atuais 0.3. Propostas não afetadas e questões restantes foram preservadas; 0.3 não foi sobrescrita. Os originais estão em work/before/new-downstream, sem recuperar produto antigo.

DR-38–DR-46 encaminham object model, visual system, boundary concreto Security e profundidade esportiva aos owners/fases, com os registros atuais do Architect. CURRENT_MISSION foi ajustado nas fases 2/4/7/13. Arquitetura final, UX spec, Figma e handoff técnico ainda ausentes no disco: apenas obrigações registradas, sem criar artefatos especulativos. A reconciliação do Architect foi observada em 0.3; aceitação pelo Chief e reviews/gates competentes permanecem pendentes. Nenhum worker existente foi interrompido.

## Flags

```text
EXECUTION_PROPORTIONALITY_NATIVE = YES
EXECUTION_LEVEL_PER_TASK = YES
PROGRAM_WIDE_L4_BUG_FIXED = YES
DYNAMIC_MODEL_ROUTING = YES
DYNAMIC_EFFORT_ROUTING = YES
MODEL_ROUTE_RUNTIME_ENFORCED = NO
UI_UX_OPUS_5_5_MAX_POLICY = YES
UI_UX_OPUS_5_5_MAX_RUNTIME_ENFORCED = NO
AGENT_NECESSITY_NATIVE = YES
ARTIFACT_NECESSITY_NATIVE = YES
RESEARCH_NECESSITY_NATIVE = YES
REVIEW_NECESSITY_NATIVE = YES
CORRECTION_LOOP_GUARD = YES
STOP_CONDITIONS_NATIVE = YES
EXPLORATION_PRODUCTIZATION_SPLIT = YES
SHAREABILITY_CAPABILITY_IN_CANON = YES
SHAREABLE_OBJECT_MODEL_ROUTED = YES
SHAREABLE_VISUAL_SYSTEM_ROUTED = YES
MINIMUM_FIRST_CLASS_SPORT_SET_IN_CANON = YES
RUNNING_FIRST_CLASS = YES
CYCLING_FIRST_CLASS = YES
SWIMMING_FIRST_CLASS = YES
STRENGTH_FIRST_CLASS = YES
SPORT_DEPTH_INVARIANT_PRESERVED = YES
ADDITIONAL_SPORTS_REMAIN_DESIGN_SPACE = YES
RELEASE_SCOPE_REMAINS_SEPARATE = YES
SPORT_LIST_NOT_PROMOTED_TO_LOCKED_INVARIANT = YES
MISSION_RESTARTED = NO
IMPLEMENTATION_STARTED = NO
```

## Files audited

- `C:\Users\carva\.claude\agent-system\CHANGELOG.md`
- `C:\Users\carva\.claude\agent-system\manifest.json`
- `C:\Users\carva\.claude\agent-system\README.md`
- `C:\Users\carva\.claude\agent-system\VERSION`
- `C:\Users\carva\.claude\agent-system\constitutions\AI_SYSTEMS_AGENT_EXPERIENCE_ARCHITECT.md`
- `C:\Users\carva\.claude\agent-system\constitutions\CHIEF.md`
- `C:\Users\carva\.claude\agent-system\constitutions\DATA_ANALYTICS_EXPERIMENTATION_ARCHITECT.md`
- `C:\Users\carva\.claude\agent-system\constitutions\ENGINEERING_SYSTEMS_ARCHITECT.md`
- `C:\Users\carva\.claude\agent-system\constitutions\INTEGRATION_RELEASE_ENGINEER.md`
- `C:\Users\carva\.claude\agent-system\constitutions\PRODUCT_CONSTITUTION_GOVERNANCE.md`
- `C:\Users\carva\.claude\agent-system\constitutions\PRODUCT_ENGINEER.md`
- `C:\Users\carva\.claude\agent-system\constitutions\PRODUCT_UX_ARCHITECT.md`
- `C:\Users\carva\.claude\agent-system\constitutions\QUALITY_RELIABILITY_ENGINEER.md`
- `C:\Users\carva\.claude\agent-system\constitutions\RESEARCH_EVIDENCE_STRATEGIST.md`
- `C:\Users\carva\.claude\agent-system\constitutions\SECURITY_PRIVACY_ABUSE_ARCHITECT.md`
- `C:\Users\carva\.claude\agent-system\constitutions\UI_EXPERIENCE_DESIGNER.md`
- `C:\Users\carva\.claude\agent-system\evals\AI_SYSTEMS.md`
- `C:\Users\carva\.claude\agent-system\evals\ENGINEERING.md`
- `C:\Users\carva\.claude\agent-system\evals\ENGINEERING_EXECUTION.md`
- `C:\Users\carva\.claude\agent-system\evals\EXECUTION_PROPORTIONALITY.md`
- `C:\Users\carva\.claude\agent-system\evals\GROUND_RESTATE.md`
- `C:\Users\carva\.claude\agent-system\evals\IMPLEMENTATION.md`
- `C:\Users\carva\.claude\agent-system\evals\MEASUREMENT.md`
- `C:\Users\carva\.claude\agent-system\evals\policy_cases.json`
- `C:\Users\carva\.claude\agent-system\evals\PRODUCT_ARCHITECTURE.md`
- `C:\Users\carva\.claude\agent-system\evals\PRODUCT_GOVERNANCE.md`
- `C:\Users\carva\.claude\agent-system\evals\proportionality_cases.json`
- `C:\Users\carva\.claude\agent-system\evals\QUALITY.md`
- `C:\Users\carva\.claude\agent-system\evals\README.md`
- `C:\Users\carva\.claude\agent-system\evals\RELEASE.md`
- `C:\Users\carva\.claude\agent-system\evals\RESEARCH.md`
- `C:\Users\carva\.claude\agent-system\evals\ROUTING_CHIEF.md`
- `C:\Users\carva\.claude\agent-system\evals\scenarios.json`
- `C:\Users\carva\.claude\agent-system\evals\SECURITY.md`
- `C:\Users\carva\.claude\agent-system\evals\UI.md`
- `C:\Users\carva\.claude\agent-system\playbooks\ENGINEERING_DELIVERY.md`
- `C:\Users\carva\.claude\agent-system\playbooks\EVIDENCE_RESEARCH.md`
- `C:\Users\carva\.claude\agent-system\playbooks\GIT_PR_REVIEW.md`
- `C:\Users\carva\.claude\agent-system\playbooks\NEW_FEATURE.md`
- `C:\Users\carva\.claude\agent-system\playbooks\NEW_SURFACE.md`
- `C:\Users\carva\.claude\agent-system\playbooks\PRODUCT_GOVERNANCE.md`
- `C:\Users\carva\.claude\agent-system\playbooks\RELEASE.md`
- `C:\Users\carva\.claude\agent-system\playbooks\STRUCTURAL_REFACTOR.md`
- `C:\Users\carva\.claude\agent-system\playbooks\VISUAL_REFACTOR.md`
- `C:\Users\carva\.claude\agent-system\protocols\CORE.md`
- `C:\Users\carva\.claude\agent-system\protocols\ENGINEERING_EXECUTION.md`
- `C:\Users\carva\.claude\agent-system\protocols\ENVIRONMENT.md`
- `C:\Users\carva\.claude\agent-system\protocols\ESCALATION.md`
- `C:\Users\carva\.claude\agent-system\protocols\EXECUTION_PROPORTIONALITY.md`
- `C:\Users\carva\.claude\agent-system\protocols\HANDOFF.md`
- `C:\Users\carva\.claude\agent-system\protocols\HARDENING.md`
- `C:\Users\carva\.claude\agent-system\protocols\STATUS.md`
- `C:\Users\carva\.claude\agent-system\protocols\TASK_CONTRACT.md`
- `C:\Users\carva\.claude\agent-system\registry\capabilities.json`
- `C:\Users\carva\.claude\agent-system\registry\routing.json`
- `C:\Users\carva\.claude\agent-system\registry\ROUTING.md`
- `C:\Users\carva\.claude\agent-system\scripts\agent_system.py`
- `C:\Users\carva\.claude\agent-system\scripts\execution_checks.py`
- `C:\Users\carva\.claude\agent-system\scripts\proportionality_evals.py`
- `C:\Users\carva\.claude\agent-system\scripts\run_evals.py`
- `C:\Users\carva\.claude\agent-system\scripts\run_execution_evals.py`
- `C:\Users\carva\.claude\agent-system\scripts\validate_installation.py`
- `C:\Users\carva\.claude\agent-system\templates\completion-evidence.json`
- `C:\Users\carva\.claude\agent-system\templates\execution-status.json`
- `C:\Users\carva\.claude\agent-system\templates\implementation-plan.json`
- `C:\Users\carva\.claude\agent-system\templates\review-request.json`
- `C:\Users\carva\.claude\agents\ai-systems-agent-experience-architect.md`
- `C:\Users\carva\.claude\agents\chief.md`
- `C:\Users\carva\.claude\agents\data-analytics-experimentation-architect.md`
- `C:\Users\carva\.claude\agents\engineering-systems-architect.md`
- `C:\Users\carva\.claude\agents\integration-release-engineer.md`
- `C:\Users\carva\.claude\agents\product-constitution-governance.md`
- `C:\Users\carva\.claude\agents\product-engineer.md`
- `C:\Users\carva\.claude\agents\product-ux-architect.md`
- `C:\Users\carva\.claude\agents\quality-reliability-engineer.md`
- `C:\Users\carva\.claude\agents\research-evidence-strategist.md`
- `C:\Users\carva\.claude\agents\security-privacy-abuse-architect.md`
- `C:\Users\carva\.claude\agents\ui-experience-designer.md`
- `C:\Users\carva\.claude\CLAUDE.md`
- `C:\Users\carva\.claude\settings.json`
- `C:\Users\carva\.claude\skills\ground-restate\SKILL.md`
- `C:\Users\carva\.claude\skills\route-work\SKILL.md`
- `C:\Users\carva\.claude\skills\verify-product-architecture\SKILL.md`
- `C:\Users\carva\.claude\skills\verify-ui\SKILL.md`
- `C:\Users\carva\.claude\skills\evidence-synthesis\SKILL.md`
- `C:\Users\carva\.claude\skills\verify-domain-gate\SKILL.md`
- `C:\Users\carva\.claude\skills\product-governance\SKILL.md`
- `C:\Users\carva\.claude\skills\explore-solution-space\SKILL.md`
- `C:\Users\carva\.claude\skills\write-implementation-plan\SKILL.md`
- `C:\Users\carva\.claude\skills\execute-implementation-plan\SKILL.md`
- `C:\Users\carva\.claude\skills\isolate-worktree\SKILL.md`
- `C:\Users\carva\.claude\skills\test-driven-development\SKILL.md`
- `C:\Users\carva\.claude\skills\systematic-debugging\SKILL.md`
- `C:\Users\carva\.claude\skills\request-code-review\SKILL.md`
- `C:\Users\carva\.claude\skills\receive-code-review\SKILL.md`
- `C:\Users\carva\.claude\skills\verify-before-completion\SKILL.md`
- `C:\Users\carva\.claude\skills\finish-development-branch\SKILL.md`
- `C:\Users\carva\Desktop\myApp\MyApp\AGENTS.md`
- `C:\Users\carva\Desktop\myApp\MyApp\CLAUDE.md`
- `C:\Users\carva\Desktop\myApp\MyApp\CURRENT_MISSION.md`
- `C:\Users\carva\Desktop\myApp\MyApp\MISSION_LEDGER.md`
- `C:\Users\carva\Desktop\myApp\MyApp\canon\CANONICAL_INDEX.md`
- `C:\Users\carva\Desktop\myApp\MyApp\canon\VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md`

Os três outputs product/* recebidos durante a missão também foram inspecionados; são working artifacts, não novos Canons. Configs/CLI/env/model/effort e o transcript de despacho do projeto atual foram inspecionados sem ler credenciais, recuperar legacy ou alterar processos existentes.

## Files modified

- `C:\Users\carva\.claude\agent-system\CHANGELOG.md`
- `C:\Users\carva\.claude\agent-system\manifest.json`
- `C:\Users\carva\.claude\agent-system\README.md`
- `C:\Users\carva\.claude\agent-system\VERSION`
- `C:\Users\carva\.claude\agent-system\constitutions\CHIEF.md`
- `C:\Users\carva\.claude\agent-system\protocols\CORE.md`
- `C:\Users\carva\.claude\agent-system\protocols\ENVIRONMENT.md`
- `C:\Users\carva\.claude\agent-system\protocols\EXECUTION_PROPORTIONALITY.md`
- `C:\Users\carva\.claude\agent-system\protocols\HARDENING.md`
- `C:\Users\carva\.claude\agent-system\protocols\TASK_CONTRACT.md`
- `C:\Users\carva\.claude\agent-system\registry\capabilities.json`
- `C:\Users\carva\.claude\agent-system\registry\routing.json`
- `C:\Users\carva\.claude\agent-system\registry\ROUTING.md`
- `C:\Users\carva\.claude\agent-system\scripts\agent_system.py`
- `C:\Users\carva\.claude\agent-system\scripts\run_evals.py`
- `C:\Users\carva\.claude\agent-system\scripts\validate_installation.py`
- `C:\Users\carva\.claude\agents\ai-systems-agent-experience-architect.md`
- `C:\Users\carva\.claude\agents\chief.md`
- `C:\Users\carva\.claude\agents\data-analytics-experimentation-architect.md`
- `C:\Users\carva\.claude\agents\product-ux-architect.md`
- `C:\Users\carva\.claude\agents\security-privacy-abuse-architect.md`
- `C:\Users\carva\.claude\agents\ui-experience-designer.md`
- `C:\Users\carva\.claude\CLAUDE.md`
- `C:\Users\carva\.claude\settings.json`
- `C:\Users\carva\Desktop\myApp\MyApp\CURRENT_MISSION.md`
- `C:\Users\carva\Desktop\myApp\MyApp\MISSION_LEDGER.md`
- `C:\Users\carva\Desktop\myApp\MyApp\canon\CANONICAL_INDEX.md`
- `C:\Users\carva\Desktop\myApp\MyApp\canon\VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md`

Além dos 28 arquivos alterados do baseline, estes três arquivos produzidos durante a missão receberam correção localizada 0.1→0.2; seu estado atual é 0.3 produzido pelo Architect:

- `C:/Users/carva/Desktop/myApp/MyApp/product/PRODUCT_TRUTH_MAP.md`
- `C:/Users/carva/Desktop/myApp/MyApp/product/PRODUCT_DOMAIN_MODEL.md`
- `C:/Users/carva/Desktop/myApp/MyApp/product/PRODUCT_DECISION_REGISTER.md`

O index canônico foi sincronizado com a fonte atual e o bloqueio real de readiness. Artefatos de avaliação/report da missão ficam fora do global. O relatório deste audit está também em `C:/Users/carva/Desktop/myApp/MyApp/audits/CLAUDE_CANON_UPDATE_2026-10-10.md`, com evidências e fontes diretas em `audits/claude-canon-update-2026-10-10/`.

## Files created in .claude

- `C:/Users/carva/.claude/agent-system/evals/MODEL_ROUTING.md`
- `C:/Users/carva/.claude/agent-system/evals/model_cases.json`
- `C:/Users/carva/.claude/agent-system/protocols/MODEL_ROUTING_POLICY.md`
- `C:/Users/carva/.claude/agent-system/registry/model-runtime.json`
- `C:/Users/carva/.claude/agent-system/scripts/invoke_task.py`
- `C:/Users/carva/.claude/agent-system/scripts/model_route_guard.js`
- `C:/Users/carva/.claude/agent-system/scripts/model_routing.py`
- `C:/Users/carva/.claude/agent-system/scripts/model_routing_evals.py`
- `C:/Users/carva/.claude/agent-system/templates/task-contract.json`

Backups, relatórios, fontes de decisão e evidências de teste/review ficam em work/ e audits/ do projeto, fora da descoberta global. Sem commit automático.
