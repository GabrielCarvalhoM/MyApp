# CURRENT_MISSION — Controlled canonical rebaseline 3.0.0

Revisão: **MISSION-RB-1.0** · 2026-10-14 (America/Sao_Paulo).
Estado: **COMPLETE_DOCUMENTATION_ONLY**. Fechamento e evidência no [audit trail](audits/rebaseline-3.0.0/REBASELINE_RECORD.md).
IMPLEMENTATION_AUTHORIZED = NO · IMPLEMENTATION_STARTED = NO · FIGMA_AUTHORIZED_IN_THIS_MISSION = NO.

## Objetivo e autoridade

Consolidar a documentação do Vilumo Fit para a direção V1 decidida diretamente pelo Founder em 2026-10-14: **Running × Strength**, coordenados pelo **Adaptive Engine** como núcleo/diferencial; Nutrition como insights contextuais de performance; Wearables como infraestrutura de closed loop (atividades recebidas e treinos estruturados enviados quando suportado); **Crew Lite** para continuidade/accountability/distribuição. Cycling, Swimming e outros esportes são possíveis expansões fora da V1, sem dívida de lançamento.

A autoridade do produto é [Product Thesis Contract](canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md). O [Canonical Index](canon/CANONICAL_INDEX.md) identifica versões, papéis e estado vigente. O pedido bruto e o routing da missão estão no [REBASELINE_RECORD](audits/rebaseline-3.0.0/REBASELINE_RECORD.md). Esta missão define trabalho e parada; não cria tese concorrente nem dispensa gates materiais. A decisão direta nova supera os trechos antigos incompatíveis, com histórico preservado.

Usar a arquitetura global já instalada indicada em AGENTS.md/CLAUDE.md: Chief/Orchestrator coordena; PCG owna tese; Product/UX owna estrutura/experiência; reviewers frescos julgam domínios afetados. Execution Proportionality 1.4.0 governa profundidade. Não duplicar método ou manter estado de produto nas pastas globais. Estratégia já autorizada não requer aprovação repetida.

## Escopo permitido e limites

Permitido: ler este projeto e suas fontes humanas autorizadas; preservar snapshot integral; reescrever tese/Truth Map; refatorar domínio/arquitetura; registrar supersessão e novas decisões; atualizar missão/índice; produzir Scope, Experience e Core Flows comportamentais como consumidores naturais; criar AEC apenas porque esses consumidores dependem de autoridade/reconciliação compartilhadas; executar checks documentais e reviews independentes; publicar a revisão local autorizada e emitir handoff.

Proibido: código de produto, Figma, design visual final, aplicações/scaffolding, setup de stack, banco/auth/API, tokens executáveis, backend/frontend, deploy, promessa comercial, seleção de fornecedor sem evidência e autorização de dependência real. Scripts de auditoria documental não são implementação do produto.

Não consultar outros projetos Vilumo ou fontes externas de legado. Não apagar MISSION_LEDGER, fontes humanas, snapshots, reviews ou decisões antigas. AGENTS.md/CLAUDE.md permanecem byte-identical porque ainda governam corretamente o trabalho. O registro Git ainda não tem commits; não realizar reset, limpeza ou commit como parte desta missão.

## Outcomes e ordem de dependência

| Outcome | Consumidor / critério de aceitação |
|---|---|
| Preservação e rastreabilidade | Snapshot `governance/snapshots/2026-10-14-pre-3.0.0/` de 49 arquivos com SHA-256; ledger append-only; fontes anteriores intactas. |
| Tese 3.0.0 e Truth Map 1.0 consolidados | Uma identidade vigente; cada ID anterior com disposição explícita; invariantes ainda válidos preservados; obrigações dos quatro esportes e dois pilares equivalentes superadas visivelmente. |
| Decisões suficientes para formalização | PDR-1.0 com DR-55–DR-65, DR-01–DR-54 intactos no bloco histórico e leitura operacional atual; lacunas com owner/trigger sem reabrir decisões dadas. |
| Domínio e arquitetura refatorados | Um atleta/plano integrado; contratos de corrida/força, recuperação, contexto, consentimento e closed loop; Crew Lite delimitado; extensibilidade sem construir esportes futuros. |
| Consumidores naturais | V1 Scope define o que lançar e o que excluir; AEC define autoridade/inputs/outputs/confirmação/reconciliação; Experience e Core Flows traduzem comportamento/estados. Nenhum deles se declara suporte implementado ou UX visual pronto. |
| Consistência cruzada e autoridade | Links/IDs/versões íntegros, escopo alinhado, gates antigos invalidados para versões novas; reviews de fidelidade, interpretabilidade/estrutura, privacidade e closed loop na mesma revisão. |
| Publicação e handoff | Índice atualizado por papel/versão/estado, evento/hash de publicação, aceite do consumidor Product/UX, relatório curto e ordem para Claude retomar. |

Fluxo: snapshot/grounding → draft PCG → checks → reviews normativos → consolidação/publicação; Product/UX traduz a decisão/draft explicitamente versionado em paralelo, mas seu gate exige cânone aprovado; Scope/AEC → Experience → Core Flows → reviews estruturais/privacy/closed loop → auditoria final → handoff. Findings voltam ao autor; judge não edita sua própria evidência. Falha obrigatória não vira PASS por prazo ou economia.

Research desta missão usa **evidence_policy=doctrine_audit**: fidelidade e epistemologia, sem pesquisa preventiva de mercado. Diferenciação, segurança/eficácia, valor social, retenção e disposição a pagar continuam hipóteses. Não há validação clínica/nutricional ou de API por aprovar a redação.

## Proteções de escopo

- Nutrition: sem food logging, dieta completa, meal planner, metas/macros diários ou subsistema nutricional autônomo; todo insight aponta demanda e contexto do treino. Exemplos numéricos são exemplos, nunca política de dose aprovada.
- Crew Lite: sem chat, discovery público, communities abertas, marketplace, follower graph, ranking de esforço universal ou memória/perfil social antecipado. Valor solo preservado; entrada/apoio/check-in/share voluntários; privacidade por Crew. “Básico” não elimina saída, revogação, convite fechado e bloqueio/silenciar necessários.
- Wearables: importar não implica permissão de escrever; “enviado” não prova execução; “atividade não recebida” não prova treino ausente. Capacidades/falhas/versão precisam ser honestas. Sem garantia de cancelamento de cópia já no relógio.
- Corrida/força: controles/profundidade próprios com decisão integrada; modalidade externa observada é contexto, não promessa de coaching. Motor considera recovery e carga cruzada, e pessoa mantém agência.
- Princípio estratégico: market density não implica product completeness; feature parity não é objetivo. Cada capability serve coordenação ou o loop Decide → Prepare → Execute → Observe → Adapt → Share → Repeat. Share é voluntário e Repeat funciona sem Crew/wearable. Pierre não é template do produto.

## Estados e limites dos gates

Gates documentais pertinentes: PRODUCT_CONSTITUTION_DRAFT, DOCTRINE_EVIDENCE_REVIEWED, DOCTRINE_INTERPRETABLE, PRODUCT_CONSTITUTION_READY; DOMAIN/ARCHITECTURE/EXPERIENCE/CORE_FLOWS_CONSISTENT no escopo especificado; PRIVACY_BOUNDARIES_REVIEWED e CLOSED_LOOP_CONTRACT_REVIEWED; CROSS_DOCUMENT_CONSISTENCY.

Índice e audit trail registram veredito, revisão/hash, instância e alcance reais. “CANONICAL” identifica a fonte local aprovada dentro da autorização; “SPECIFICATION” não significa produto implementado. Não emitir FIGMA_READY_TO_DEV, UX_SPEC_READY, UI_READY, TECHNICAL_HANDOFF_READY, ENGINEERING_ARCHITECTURE_READY, AI_SYSTEM_READY, RELEASE_READY ou hipótese validada nesta missão. Reviews anteriores cobrem apenas suas versões antigas.

## Questões abertas que não impedem este rebaseline

O [PDR vigente, seção 5](product/PRODUCT_DECISION_REGISTER.md) registra políticas de treino/segurança e conteúdo Nutrition; critérios empíricos de credibilidade; matriz wearable real; packaging/preço; métodos de idade/canal, retenção/deleção e limites de cancelamento; métricas/evidência; tecnologia de IA e eventual autonomia ampliada. Cada questão tem owner e trigger antes da implementação, promessa ou release que dela depender.

Não preencher essas lacunas com doses, scores, thresholds, SDKs ou entidades especulativas. Se uma lacuna impedir consistência do contrato, resolver a regra abstrata/limite com o owner competente ou registrar blocker específico; não afirmar readiness dependente.

## Conclusão e hard stop

Encerrar quando os outcomes documentais, checks atuais e pareceres materiais estiverem satisfeitos e o handoff tiver sido emitido/aceito pelo consumidor real. Findings não bloqueantes permanecem com owner/trigger. O estado final e eventuais limitações são registrados no índice e no ledger sem apagar passado.

**STOP após o rebaseline documental.** Não retomar automaticamente a antiga missão de 22 fases até Figma/handoff técnico. Claude retoma na sexta-feira **2026-10-16** lendo índice → tese/Truth Map → PDR/current mission → Scope/AEC → domínio/arquitetura/Experience/Core Flows → audit trail. Depois prepara a próxima missão proporcional (evidência/políticas e UX specification) e aguarda autorização específica para Figma/implementação quando essa etapa for desejada.
