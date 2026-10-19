# Vilumo Fit — V1 Release Scope

**Estado:** SPECIFICATION — amendment pré-UX; publicação/gates no índice.

| Campo | Valor |
|---|---|
| Revisão | **RS-1.1** · 2026-10-15 |
| Owner / autoria | Product/UX Architect, worker; Founder decide prioridades estratégicas. |
| Autoridade | [PTC-3.0.0](../canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md), C023, C038–C044, C025; [pedido direto](../audits/rebaseline-3.0.0/REBASELINE_RECORD.md), [PDR](PRODUCT_DECISION_REGISTER.md). |
| Base / consumidores | [PDM-1.1](PRODUCT_DOMAIN_MODEL.md), [PA-1.1](PRODUCT_ARCHITECTURE.md), [AEC-1.1](ADAPTIVE_ENGINE_CONTRACT.md) → [EM-1.1](EXPERIENCE_MODEL.md), [CF-1.1](CORE_FLOWS.md), futuras UX Spec/Engineering. Gates/publicação no [índice](../canon/CANONICAL_INDEX.md). |
| Necessidade | V1 definida no baseline 3.0.0; amendment pré-UX explicita critérios, limites e consumo das dependências sem reabrir prioridades ou criar scope. |

## 1. Outcome da V1

Uma pessoa que combina corrida e força deve conseguir receber e entender uma coordenação integrada, preparar-se, executar diretamente, registrar/observar o realizado e receber adaptação do próximo passo. Isso funciona sem Crew, agente ou wearable obrigatório. Quando uma integração comprovadamente suporta, o ciclo também ingere atividades e envia structured workouts. Crew Lite e share voluntário reforçam continuidade/accountability/distribuição sem virar outra jornada principal.

**Decide → Prepare → Execute → Observe → Adapt → Share → Repeat.** Share pode ser pulado sem perda. A V1 não se mede pelo número de módulos ou parity com concorrentes. Toda feature deve aumentar a capacidade de coordenar o atleta ou servir a uma etapa identificável do loop (C043/C044). Densidade de mercado não exige completude; inovação e qualidade são aposta estratégica, não prova de demanda.

Este escopo fixa intenção de release, **não atesta suporte pleno atingido ou lançamento pronto**. Running e Strength são ambos obrigatórios first-class V1; não se pode lançar um como tracker raso para declarar o par cumprido. Critérios abaixo são propostas observáveis de produto, ainda a qualificar por evidência/domínio e alocação O014 antes de declaração de suporte pleno.

## 2. Incluído e mínimo necessário

| Área | Comportamento V1 | Limite |
|---|---|---|
| Running | Contexto/objetivos suportados, estrutura de sessão própria, execução direta/observação, histórico específico e adaptação que considera Strength. | Famílias exatas de objetivo, sessão, métricas e progressão dependem da cobertura/safety validadas. Não promete atender todos os corredores. |
| Strength | Contexto, equipamentos/experiência, estrutura de exercícios/séries/repetições/carga/intervalos conforme repertório validado, registro/correção e adaptação que considera Running. | Repertório, progressão e limites devem ser críveis; sem mera checkbox de força num plano de corrida. |
| Adaptive Engine | Plano integrado, decisões e revisões explicáveis, confidence, agência, descanso/retorno e correções do observado (AEC). | Sem resultado fisiológico garantido, precisão fabricada ou regra de safety inventada. |
| Recovery | Sinais relevantes mínimos, consentidos; recuperação integrada à decisão e reconhecida como progresso. | Sem diagnóstico, score obrigatório ou destino independente. |
| Nutrition Insights | Educação ou seleção contextual de conteúdo revisado por função/fase/demanda/revisão, com aplicabilidade/limites e contexto voluntário mínimo (AEC §6). | Sem prescrição individual autônoma, dose/timing pessoal, inferência de ingestão/deficit, food logging/macros/dieta/meal planner. **Suplementos OUT**. Profissional/legalidade não se resolvem pelo rótulo “insight”. |
| Wearables | Ingestão/reconciliação e Running estruturado guiado etapa a etapa quando rota/device/acesso/representação forem comprovados; export/recibos/diferenças/fallback. Strength **app-first**, wearable como suplemento fiel. | Domínio/workout neutros; nenhum vendor/Terra/SDK é Product Truth. Store/formato/scheduler não provam entrega/executor; Polar outbound direto não demonstrado, Strava não funda Engine/closed loop/Crew. Consentimentos locais separados respeitam limite externo real. |
| Crew Lite | Criar/reencontrar Crews, convites nominais, vínculo/consentimento, compromisso leve opcional, check-in privado direcionado, apoio estruturado e reconhecimento qualitativo do período comum, pausa/saída/bloqueio/silenciar. | Sem lista de pendentes/ausentes, score/ranking/pontos coletivos, perfilamento, chat, discovery público, communities abertas ou marketplace. |
| Shareability | Progresso individual próprio elegível e convite projetável sem dados de terceiros; prévia exata/ação explícita/cópia estática. | Compartilhamento coletivo externo diferido por inferência/consentimento em Crew pequena; não substituído por “agregação segura” presumida. |
| Continuidade e retorno | Execução/descanso/ajuste/histórico pessoal, interrupção e retorno pelo contexto atual; sem penalização por silêncio. | Nenhuma reposição automática de volume ou prova de comprometimento. |
| Produto mínimo transversal | Brasil; PT-BR + EN; iOS + Android; 18+; caminhos diretos e referências estáveis; estados de erro/offline/consentimento. | Interface final, age method, contratos técnicos e provas executáveis posteriores. |

**Crew preservada:** até 3 vínculos ativos/pausados por pessoa; cerca de 8 participantes por Crew; qualquer modo pode criar; nominal invite; encaminhado/projetado só entra com confirmação do convidante; sem agenda de contatos. Acordo leve diz “fazer o apropriado para cada um”, não sincronizar modalidade/dose. Descanso pode produzir check-in sem revelar motivo; declaração leve não valida performance.

O reconhecimento coletivo é qualitativo: concluir temporalmente um período de compromisso/cooperação, sem afirmar que todos cumpriram, consultar contagem de check-ins ou produzir fracasso por ausência. Apoio privado reconhece contribuições voluntárias. Isso preserva L010/C041 sem impor score/dashboard ou exposição.

## 3. Fora da V1 e possibilidades futuras

Cycling, Swimming e outros esportes podem ser expansões, **sem obrigação de release/data ou capability implementada agora**. Uma atividade adicional pode ser contexto no que se consegue interpretar honestamente; isso não declara suporte, não oferece prescrição/analytics próprios e não exige um framework genérico de esportes.

Ficam fora: chat ou texto livre social; feed/audiência/discovery público; comunidades abertas; marketplace; sessões Together/sincronização social de agenda; Season/Rally/campanhas; Crew Memory, Social Support Profile/Graph; competição ou score/pontos sociais; dieta/logging/meal planning e suplementos; prescrição nutricional individual autônoma; app próprio no relógio; postagem social automática; dados coletivos externos identificáveis ou por inferência; precisão clínica ou promessa de eficácia. A capability futura não é abandonada; só entra por decisão/evidência/review quando tiver consumidor real.

Agente de coordenação permanece canal opcional admissível da experiência híbrida, sem identidade de chatbot e sem task simples dependente de conversa. **Não é requisito de release desta V1.** Se for incluído, deve satisfazer AEC §7 e review AI/Security sobre modelo, dados, retenção e confirmação; não acrescenta autoridade nem autonomia de envio/share.

## 4. Cobertura mínima crível proposta

Os critérios são observáveis, não fórmulas ou aprovação de domínio. [SCI-1.0](../audits/pre-ux-2026-10-15/SCIENCE_EVIDENCE.md), [PRO-BOUND-1.0](../audits/pre-ux-2026-10-15/PROFESSIONAL_BOUNDARIES.md) e [WEA-1.0](../audits/pre-ux-2026-10-15/WEARABLE_EVIDENCE.md) fecharam evidência documental e limites qualitativos para DR-66–69. Antes de comportamento real, G01/G02 exigem profissional de Educação Física habilitado/policy/casos e qualificação jurídica do serviço; G05 exige nutricionista/jurídico para conteúdo/lógica Nutrition. Nenhuma IA fornece registro profissional, responsabilidade técnica ou clearance médico. O014 não permite inferir suporte pleno do texto.

| Área | Critério de cobertura | Evidência que deverá existir antes de declarar pronto |
|---|---|---|
| Running | Objetivo/perfil suportado explícitos; sessão com estrutura/intensidade/limites próprios; execução/observação e adaptação de corrida de fato coordenadas com força. | Casos validados de sessão/progressão, critérios de aderência e efeitos cruzados sob limites revisados; não apenas mockups. |
| Strength | Repertório/equipamentos suportados explícitos; sessão com exercícios/estrutura/registro próprios; progressão/adaptação possíveis sob contexto integrado. | Casos validados de repertório, ajuste e execução/correção; não apenas sugestão de exercício ou boolean de conclusão. |
| Engine | Run→Strength e Strength→Run com prioridade primária/secundária, classes de ação distintas e confiança por decisão; trace/confirm/rejeição/correção/HOLD sem autoridade social/LLM. | Policy profissional/rule/evidence IDs versionados; casos positivos/negativos de dose/limites, parcial/desconhecido/retorno, instrumentos e safety; realização independente de idempotência/revisão/holds conforme AEC §2–7. |
| Nutrition | Demanda/fase/revisão e classe por função, contexto mínimo/recusa, conteúdo obsoleto retirado; suficiência de seleção não permite dose. | Assets/lógica/públicos/aplicabilidade e modelo profissional revisados por nutricionista/jurídico em revisão identificada; educação não é isenção presumida. Sem prescrição individual ou suplementos. |
| Wearables | Pelo menos um caminho real de ingestão + outbound Running estruturado até device e retorno para launch; matriz por rota/conta/device e preflight sem perda de prescrição. | Acesso/entitlement produtivo, golden cases neutro→adapter e device físico; time/distance/open/repeats/advance/pace/HR quando declarados; update/delete/falha parcial/unknown/revogação, dedupe/late/missing/multisource e retorno reconciliado. Strength completo no app. Teste sintético não prova hardware. |
| Solo / continuidade | Loop completo sem Crew/agente/relógio, descanso legítimo, ausência não vira abandono, retorno rebaseado. | Cenários com registro manual, offline e reconexão; consentimento recusado, sem perda de registros. |
| Crew Lite / share | Convite fechado, direitos de vínculo, check-in/apoio privados e voluntários; nenhuma exposição por default ou mérito por volume. | Casos negativos de encaminhado, limite, pausa/saída/remoção, ausência, novo membro e inferência; teste da prévia/cópia externa. |

**Coverage não pode ser inferida do documento.** Se só uma modalidade cumprir o mínimo, o produto ainda não satisfaz esta V1. Se nenhuma integração suportar closed loop crível, Founder/Chief recebem opções e impacto na promessa; não trocar silenciosamente por “wearables são fontes”.

## 5. Aceitação por cenários e ordem de dependência

| ID | Cenário de aceitação | Onde provar |
|---|---|---|
| S01 | Novo atleta solo, sem wearable/Crew, chega a decisão com incerteza honesta e consegue executar/registrar diretamente. | CF F01, F02, F03. |
| S02 | Demanda de Running e Strength cria conflito; uma decisão integrada oferece mudança admissível e explica efeitos nas duas modalidades. | CF F02, F06; AEC §6. |
| S03 | Força registrada/corrigida afeta contexto do próximo run sem duplicar sessão. | CF F03, F05, F06. |
| S04 | Run observado tarde pode afetar próxima força; histórico preserva versão/dados conhecidos na época. | CF F05/F06. |
| S05 | Descanso indicado confirmado é progresso; não confirmado é desconhecido, sem falha ou aviso à Crew. | CF F07/F09. |
| S06 | Treino mudou, insight antigo e export pendente ficam obsoletos; cópia remota anterior é explicitamente tratada. | CF F02/F04/F06. |
| S07 | Destino não suporta envio/estrutura, ou write consent é recusado: app executa; não promete entrega. | CF F04. |
| S08 | Mesma sessão manual + integração + correção produz um fato/derivados reconciliados. | CF F05. |
| S09 | Pessoa interrompe/retorna sem restaurar volume; Crew pause é independente. | CF F07. |
| S10 | Convite encaminhado sem confirmação, menor, limite/cheia ou convidante saiu nunca concedem acesso. | CF F08. |
| S11 | Crew Member entra sem motor, contribui autodeclarando e recebe apoio sem performance verificada/lista de ausências. | CF F08/F09. |
| S12 | Share externo voluntário mostra só objeto próprio/convite; nenhum terceiro, dado sensível ou lista coletiva. | CF F10. |
| S13 | Limitação funcional/restrição relatada prevalece sobre score favorável; HOLD escopado preserva registros e só sai por evidência/responsável competente. | CF F01/F02/F06/F07; AEC §7. |
| S14 | Contexto seleciona conteúdo Nutrition, sem dose; recusa/risco ou demanda alterada produz educação elegível/omissão/HOLD e obsolescência. | CF F02/F06; AEC §6. |
| S15 | Perda de target/repeat/reps ou write sem prova não vira relógio pronto; Strength app-first permanece íntegro. | CF F04; AEC §5. |
| S16 | Timeout sem read/idempotência remota ou replace parcial não dispara retry cego; possível cópia antiga permanece explícita. | CF F04/F05; AEC §5.4. |
| S17 | Consentimento/revisão muda durante fila, LLM/provider text tenta sobrepor policy; efeito antigo é recusado, sem leak social ou liberação de hold. | CF F04/F06; AEC §5.4/§7. |
| S18 | HRV de métodos distintos, wrong-person ou duas atividades parecidas ficam resolvidos/limitados por provenance; sem fusão/zero/adesão inventados. | CF F05/F06; AEC §2/4. |

Sequência de retomada, somente em nova missão autorizada: índice → PTC/PTM/PDR → RS/AEC → PDM/PA/EM/CF e pareceres atuais → UX detalhada dos contratos já fechados, mantendo provisório apenas detalhe dependente de §6. Profissionais, acesso/device e prova executável seguem seus triggers, sem pesquisa genérica restante para Claude. Figma/visual e implementação conservam autorizações/gates próprios; nenhum preço/paywall condiciona a retomada.

## 6. Consumo operacional das dependências

O **[PDR §5, G01–G11](PRODUCT_DECISION_REGISTER.md)** é o registro único de decisões, owners, prova e disposição; DR-66–71 registram este amendment. A tabela abaixo é somente o mapa de consumo do Scope, sem novas decisões/owners ou redefinição de gaps. Nenhuma dependência é veto global à estrutura de UX/Figma; “pode detalhar” não autoriza essas etapas nesta missão.

| Referência única / consumidor | UX detalhada / Figma em missão futura | Etapa dependente / prova a consumir do PDR |
|---|---|---|
| G01 Cobertura → RS §2/4, PDM capacidades | Estrutura first-class/elegibilidade/limites fechada; catálogo e exemplo prescritivo dependentes provisórios. | Antes de implementar cobertura prescritiva/claim: perfis, repertório e casos profissionalmente aprovados + serviço qualificado. |
| G02 Policy/instrumentos → AEC §2/3 | Ações, suficiência e incerteza detalháveis; perguntas/âncoras/protocolos/números dependentes aguardam escolha validada. | Antes de geração/adaptação/export prescritivos finais: rule/policy IDs, doses/limites e casos/instrumentos aprovados. |
| G03 Aderência → AEC §4, CF F03/F05 | Parcial/desconhecido/correção fechados; rótulo automático dependente de tolerância provisório. | Antes de classificar/usar aderência automaticamente; sem score social/mérito por excesso. |
| G04 Safety/retorno → AEC §7, CF F07 | Escopo/causa privada/owner/saída de HOLD e contestação fechados; triagem/copy clínica, liberação e retorno específicos provisórios. | Antes de coleta/classificação/ação clínica ou retorno prescrito: regras/casos e responsável real; nenhum score/aceite libera. |
| G05 Nutrition → AEC §6, CF F02/F06 | Fases, mínimo contexto, omissão/recusa e obsolescência fechados; textos/lógica individualmente diretivos aguardam revisão por versão. | Antes de publicar/ativar conteúdo afetado: nutricionista + jurídico/modelo de serviço. NUT-G02 prescrição individual fica fora da entrega autônoma V1, sem backlog de dieta/suplementos. |
| G06 Integrações → AEC §5, CF F04/F05 | Limites, status, perdas/fallback e permissões detalháveis sem marca suportada presumida. | Acesso/contrato/entitlement e custo antes da rota real; golden cases/device antes do claim. Pelo menos um caminho completo no launch; sem provider/Terra escolhido aqui. |
| G07 Dados/jurídico → PDM I6/I10, PA §8 | Consentir/recusar/revogar/direitos fechados; copy final depende de recipients/finalidades reais e PT-BR/EN equivalentes. | Antes de coletar/transferir/persistir: inventário/bases/retenção/exceções/transferência. Revogação I10 secundário cessa filas e derivados sem apagar primário independente válido. PB-F-01 preservado. |
| G08 Identidade/abuso → CF F08/F09, PA §6 | Ingresso/negação neutra e audiência/inferência residual fechados; método que mudar jornada retorna ao Architect. Consentimento explicita Crews de dois/vínculos sobrepostos, sem anonimato absoluto ou correlação nova. | Antes de coletar/implementar método: 18+/canal/limites/remoção/reentrada/abuso e casos negativos. PB-F-02/03 preservados. |
| G09 Realização / IA condicional → AEC §3–7 | Nenhum blocker documental; sem dependência de conversa. Incapacidade técnica material retorna ao Architect. | Prova executada de revisão/fila/retry/idempotência/undo/HOLD/cross-account/Crew/revogação/derivados/redaction; notificações/lock screen/widgets sem sensível/terceiros por default. Se LLM selecionado: recipients/retention/no-training/evals adversariais e gates próprios. |
| G10 Comercial → oferta futura | **Não bloqueia UX/Figma**; modos M1/M2/M3 não viram tiers/paywall. | Oferta/preço/trial e experimento reais só após Founder/Data e custos/termos; benchmark não prova WTP. |
| G11 Eficácia/valor → claims/avaliação futura | Sem blocker estrutural; exemplos não prometem eficácia ou prevenção de lesão. | Antes de rollout avaliativo/claim dependente: desenho/guardrails/prova proporcional e policy/safety antes de exposição. |

Coletivos externos e social avançado são **diferidos**, não questões bloqueantes da V1: reabrir somente com consumidor/evidência e revisão de privacidade. Este escopo não cria roadmap com datas nem autoriza código/Figma na missão atual.

Autoria Product/UX worker; consolidação self em PA §9, sem PASS próprio. Revisão/publicação no índice é requisito distinto de prontidão de implementação/release.
