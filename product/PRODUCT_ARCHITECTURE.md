# Vilumo Fit — Product Architecture

**Estado:** SPECIFICATION — amendment pré-UX; publicação/gates no índice.

| Campo | Valor |
|---|---|
| Revisão | **PA-1.1** · 2026-10-15 |
| Owner / autoria | Product/UX Architect, worker |
| Autoridade / base | [PTC-3.0.0](../canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md), sobretudo C023/C025/C026/C028–C044; [PDM-1.1](PRODUCT_DOMAIN_MODEL.md), [AEC-1.1](ADAPTIVE_ENGINE_CONTRACT.md), [RS-1.1](V1_RELEASE_SCOPE.md); [RB-3.0.0-r1](../audits/rebaseline-3.0.0/REBASELINE_RECORD.md). |
| Consumidores | [Experience Model](EXPERIENCE_MODEL.md), [Core Flows](CORE_FLOWS.md); futura UX Spec e handoff ao Designer após gate/autorização vigentes. |
| Linhagem / estado de gate | Consolida PA-0.1, preservada no [snapshot](../governance/snapshots/2026-10-14-pre-3.0.0/product/PRODUCT_ARCHITECTURE.md). Pareceres anteriores não cobrem PA-1.1; gate/publicação no [índice](../canon/CANONICAL_INDEX.md). |

Este documento define objetos, destinos lógicos, entradas, prioridade funcional e estados. Não decide tabbar, número de telas, linguagem visual, componentes, tokens, motion ou Figma. **AR-nn** são escolhas de arquitetura subordinadas à tese, não cláusulas normativas novas.

## 1. Problema, outcome e baseline

O baseline aprovado 3.0.0 já coordena **Running × Strength** por um plano/Engine, Nutrition na preparação, Wearables para Observe/Execute e Crew Lite para continuidade. Este amendment PREUX-20261015-r1 fecha semântica de incerteza, HOLD, conteúdo e integração para que a futura UX não invente regras. Preserva objetos/destinos, esportes e social; não reabre rebaseline, composição ou visual.

Todo objeto tem owner no PDM; entradas abrem a mesma referência. [AEC §2–7](ADAPTIVE_ENGINE_CONTRACT.md) é autoridade comportamental; [PDR §5](PRODUCT_DECISION_REGISTER.md) registra decisões residuais. Evidência de apoio: [SCI-1.0](../audits/pre-ux-2026-10-15/SCIENCE_EVIDENCE.md) TR-001–015/NUT-001–010, [PRO-BOUND-1.0](../audits/pre-ux-2026-10-15/PROFESSIONAL_BOUNDARIES.md) SAFE-001–005 e [WEA-1.0](../audits/pre-ux-2026-10-15/WEARABLE_EVIDENCE.md) CTRL-001–012. Evidência não cria outra Product Truth, validação profissional ou suporte executado.

## 2. Destinos lógicos e entradas

Nomes abaixo são referências funcionais. O Designer pode expressá-las em componentes/layouts adequados, mas não ocultar tarefa direta, inventar owner ou mover uma referência por personalização.

| Destino lógico | Pergunta / papel | Ownership visível |
|---|---|---|
| **Hoje** | O que importa agora? Entrada contextual recorrente. | Nenhum objeto novo: seleciona objetos dos destinos abaixo, sem cópia de plano/contexto. |
| **Plano** | O que está previsto e como preparo/executo? | Plano/decisões vigentes, preparação, sessão planejada, intenção leve M3, registro do dia, interrupção/retorno. |
| **Progresso** | O que aconteceu e como continuo? | Histórico pessoal, sessões realizadas, continuidade e trajetória; aprofundamento por Running/Strength. |
| **Crews** | Quem já está comigo e como continuamos? | Minhas Crews, convites, compromissos leves, participação e mensagens privadas estruturadas. |
| **Você** | Meu contexto e permissões. | Objetivos/agenda/equipamentos/fontes, privacidade, permissões wearable, conta, idioma e direitos. |

**AR-01:** Hoje é entrada contextual, sem ser dono de objeto; nenhum objeto/tarefa vive exclusivamente ali. **AR-02:** referências estáveis ficam alcançáveis no caminho direto, com a mesma lógica em M1/M2/M3; conteúdo varia, não autoridade. Não é obrigação de cinco abas simultâneas.

**Entradas:** instalação/adoção solo; convite nominal; convite encaminhado/projetado; criação de Crew; retorno por aviso pessoal; retomada após pausa. Todos os caminhos de nova identidade verificam 18+. Convite sem conta tem ingresso leve; não exige objetivos, recovery, Nutrition ou wearable. Sem idade/comprovação concluídas, nenhum vínculo/dado de Crew é concedido. Quem convida vê só pendente, aceito ou não aceito/expirado, sem a causa sensível.

## 3. Objetos e destino canônico

| Objeto / responsabilidade | Destino canônico lógico | Outras entradas sem nova instância |
|---|---|---|
| Plano / decisão, revisão, aplicabilidade/HOLD e trace | Plano → detalhe da decisão | Hoje, aviso, agente opcional; causa privada, escopo afetado, próximo passo/owner de resolução e contestação no mesmo objeto. Sem destino HOLD. |
| Sessão (referência única) | Detalhe da sessão, com faceta planejada/execução e histórico do realizado | Plano, Hoje, Progresso; wearable export aponta à mesma referência/revisão. |
| Insight contextual | Preparação da decisão/sessão correspondente | Hoje quando pertinente; mesma revisão/classe/fase/conteúdo/aplicabilidade, ou educação/omissão/contexto necessário/encaminhamento. Sem galeria Nutrition nem serviço de consulta novo. |
| Desfecho / registro do dia | Plano → janela correspondente | Sessão, Hoje; histórico em Progresso aponta ao mesmo registro. |
| Histórico, marcos, trajetória | Progresso | Hoje seleciona marco próprio; detalhe da sessão. |
| Intenção M3 / interrupção / retorno | Plano | Hoje; conversa opcional apenas prepara sobre o mesmo objeto. |
| Contexto estável / objetivos / agenda / equipamento | Você → Meu contexto | Ajuste pertinente em Plano/Hoje prepara mesma mudança. |
| Recovery diário autodeclarado | Plano → contexto do dia | Hoje; tendência sob demanda em Progresso; fonte/consentimento em Você. |
| Wearable Connection / capacidades / permissões | Você → Integrações | Falha relevante em Hoje/Plano; export vinculado à sessão. |
| Export estruturado, diferenças e recibos | Sessão → envio e versões | Hoje quando entrega/versão é relevante; níveis sistema/device, unknown e discrepância separados. Integração agrega conexão, sem duplicar prescrição. |
| Crew / compromisso / vínculo | Espaço da Crew, alcançável em Crews | Hoje mostra somente a própria adesão/ação pertinente. |
| Check-in / apoio privado | Espaço da Crew → interações privadas da própria pessoa | Ação depois de desfecho/retorno prepara envio; aviso pessoal leva ao mesmo objeto. |
| Convite recebido / emitido | Crews → convites / Crew → meus convites | Link nominal/projetado, aviso; nenhuma listagem pública. |
| Shareable | Composição a partir do próprio objeto ou convite | Não é destino/feed/galeria; registro de projeção em Você → Privacidade. |
| Consentimento / direitos / bloqueios | Você → Privacidade | Primeiro uso, Crew, integração e composição referenciam mesmo consentimento. |

**AR-03:** navegar por Hoje/Progresso/agente não cria cópias. Planejamento e realizado têm owners distinguíveis no PDM e compartilham referência de sessão; uma correção atua no fato próprio, sem apagar prescrição histórica. **AR-04:** repetir sessão passada prepara **nova** sessão sujeita à coordenação atual; nunca reabre/sobrescreve a realizada.

## 4. Hierarquia funcional e divulgação progressiva

| Prioridade | Primeiro nível | Profundidade acessível |
|---|---|---|
| P0: execução em curso + condição material de segurança | Controles diretos, registro preservado; mudança/risco que exige interromper ou rever o próximo passo. | Explicação/contexto sem bloquear recuperar registro. |
| P1: decisão/próxima ação | Comportamento apropriado, sessão/descanso, mudança material e confiança reduzida quando afeta a ação. | Por quê, dados conhecidos/ausentes, alternativas, efeitos Run × Strength e revisões. |
| P1: preparação / problema de transporte relevante | Insight contextual aplicável; destino/export/revisão correta; erro ou entrega desconhecida. | Conteúdo/limites, capacidades da integração e versões. |
| P2: fechar observação/readaptação | Concluir, confirmar descanso, corrigir ou resolver associação ambígua; próximo passo atualizado. | Histórico do fato, comparação com o planejado e provenance. |
| P3: continuidade social opcional | Própria adesão, check-in recebido/enviado e convite pertinente. | Espaço da Crew, consentimento e participação; sem atividade/fiscalização de terceiros. |
| P4: reflexão/configuração | Caminhos estáveis para Progresso e Você. | Análises em escopo, contexto e privacidade. |

**AR-05:** condição material de segurança tem precedência sobre a recomendação/execução **afetada**, preservando acesso ao registro/correção e funções não dependentes. HOLD não bloqueia conta nem declara pessoa inapta. Causa privada, alcance, próximo passo e responsável por saída são compreensíveis; não reutilizar prescrição antiga como segura por default. Fora desse escopo, sessão ativa mantém controles/registro. Plan update não altera sessão iniciada silenciosamente. Social nunca força mais treino, aceite ou exposição; confiança/erro que mudam ação não ficam ocultos.

Hoje não é catálogo: mostra o previsto, próxima ação, mudanças relevantes e a própria parte em compromisso. Sem Crew é estado pleno, com entrada discreta para criar/convite, sem checklist de incompletude. Sem dados, pedir contexto quando muda decisão; não inventar prescrição. M3 vê intenção/continuidade leves, não plano fictício ou paywall de modo.

## 5. Jornada e profundidade por modalidade

**AR-06:** iniciar, pausar, registrar/corrigir, concluir, confirmar descanso, ajustar disponibilidade, interromper/retornar e enviar workout possuem caminho direto em Plano/Sessão/integração. Tarefas simples não dependem de conversa.

Running fornece linguagem/estrutura/observação próprias; Strength fornece exercício/séries/repetições/carga/intervalos conforme cobertura validada. Não há destino primário por esporte. O aprofundamento aparece em Sessão, detalhe da decisão e Progresso. Catálogo de cobertura não anuncia esporte futuro/beta por atividade ingerida. Parâmetros/repertório concretos vêm da qualificação de RS §4, O014/O017 e safety.

**AR-07:** Recovery integra a decisão/contexto/tendência, sem módulo ou score obrigatório. Relato local, fadiga geral e HR/HRV preservam origem/limites; score favorável não limpa restrição. Nutrition é conteúdo vinculado à demanda/fase/revisão, selecionado dentro da fronteira profissional do AEC §6; dado suficiente para seleção não licencia dose. Pré/durante/pós/intervalo curto/evento são relevâncias contextuais, sem horário universal, logging ou módulo. Mudança material reavalia/retira conteúdo dependente; recusa mantém desconhecido sem pressão.

**AR-08:** Wearables têm conexão/capacidades/permissões e envio ligado à sessão. **Domínio → workout neutro → adapter → provider** preserva sessão/plano do Vilumo; Terra não modela domínio. Prévia inclui diferenças/perdas e destino/revisão; diferença que muda prescrição recusa export, com app como caminho direto. Strength mantém exercícios/séries/reps/carga/descanso no app; relógio é suplemento fiel. Capacidade pública, acesso produtivo e prova no device permanecem distintos (AEC §5; PDR G06). Polar outbound não comprovado e stores sem executor não recebem promessa de relógio guiando. Nenhum novo destino por vendor.

**AR-09:** execução/registro preparados funcionam offline no limite **ainda válido**; novo HOLD/restrição não é ignorado. Status separa fila/transporte/sistema/device/execução/observação/interpretação. Unknown não é falha conhecida e não permite retry automático cego. Update/delete composto ou não comprovado mantém cópia antiga/falha parcial explícitas. Reconexão revalida propósito/revisão/autoridade, sem duplicar carga, apagar séries ou reenviar tudo. Nova recomendação dependente de dado indisponível explicita limite, sem aparência de atualizada. AEC §4/§5 rege associação, conflito de fonte e efeito idempotente.

O canal de agente permanece opcional, sem destino/estado próprio. Explica e prepara ajustes pessoais versionados, mostra alcance/confirmação e respeita edição manual. Não consente, age no social, envia externamente ou decide por conta própria. Se não entrar no release, todas essas jornadas continuam diretas (AEC §7).

## 6. Crew Lite, membership e reconhecimento

**AR-10:** um espaço por Crew, com compromisso leve, participantes, meus convites, minha participação e interações privadas. Nenhum conceito social vira destino independente. Sem chat/texto livre, feed, público, score, tabela de presença ou quem ainda não contribuiu.

**Compromisso:** período e intenção comum de continuar fazendo o apropriado; adesão individual opcional. A parte Full Member é honrar seu contexto/decisão; a parte Crew Member é intenção autodeclarada, sem avaliação fisiológica. Sem meta coletiva de km/minutos/calorias nem exigência de esporte/dose iguais. Crew pode estar ativa sem compromisso.

**Contribuição/check-in:** pessoa decide enviar declaração mínima para uma Crew e destinatário ativo específicos, sem motivo, dados de treino, origem/verificação ou modo. “Fiz o que fazia sentido” inclui descanso/adaptação/retorno; mais volume não melhora mensagem/apoio. Não há publicação automática ao grupo, fanout por adesão ou história enviada a futuros participantes. Envio só depois de confirmação de destinatário/alcance e consentimento; consentir a Crew não consente check-in permanente. Conteúdo mínimo comum a M2/M3 não revela qual usa o motor.

**Reconhecimento de progresso coletivo [AR-11]:** no fim do período, o compromisso pode reconhecer qualitativamente o encerramento de um período comum de continuidade/apoio: “Encerramos este período; seguir, adaptar e descansar fazem parte do caminho”. Isso reconhece o fato do período compartilhado e a cooperação, **não afirma que todos treinaram/cumpriram**, não consulta quantos check-ins foram enviados e não cria sucesso/fracasso dependente de um membro. Apoio privado reconhece a contribuição voluntária de cada pessoa. Sem contador, denominador, composição ou histórico social profundo. O fato canônico é Compromisso concluído pelo fim do período; representação exata é trabalho de conteúdo/Designer posterior. L010/C041 ficam preservados sem soma física ou fiscalização.

**Membership [AR-12]:** criar em M1/M2/M3 é permitido dentro de 3 vínculos e cerca de 8 participantes; Ativo/Pausado contam. Pausar por Crew mantém vínculo e mostra só “Em pausa”, sem motivo/horário/histórico; não altera prática. Sair/remover revoga acesso imediato inclusive ao histórico e revoga convites pendentes do participante. Novo membro não recebe mensagens/declarações anteriores; outras Crews de alguém não são visíveis.

**Limitação de inferência:** o produto não revela outras Crews nem oferece correlação entre elas, mas membros que já pertencem às mesmas Crews podem reconhecer a pessoa e comparar estados neutros que legitimamente veem. Receber um check-in voluntário também é conhecido pelo destinatário; não prova momento de treino, ausência, saúde ou motivo. Isolamento por Crew não torna relações íntimas anônimas nem impede toda inferência humana. Product/UX e Security devem explicitar audiência/estado neutro no consentimento e qualificar notificações antes da UX Spec/contrato dependente, inclusive com Crews de dois e vínculos sobrepostos (RS §6, PB-F-02).

**Invites [AR-13]:** nominal, validade/revogação, aceite direto condicionado à comprovação do canal. Encaminhado/projetado exige confirmação do convidante. Até aceite/consentimento e vínculo autorizado, mostrar somente o mínimo para conduzir confirmação e explicar categorias/alcance do acesso, nunca nome da Crew, roster, estados reais de membros ou conteúdo interno. Somente após vínculo Ativo mostrar o mínimo permitido. Sem confirmação, cheia, limite, recusa, idade ou expiração: sem acesso; convidante vê resultado neutro. Contato serve só à finalidade nominal/comprovação, com minimização/eliminação definida; não se ingere agenda. Pessoa pode bloquear novos convites do remetente.

**Segurança social [AR-14]:** apoio somente gesto estruturado privado entre remetente/destinatário, silenciável. Sem administrador/poder permanente especial do criador. Preserva-se proposta de remoção simétrica por participante, sem motivo/anúncio de autoria; controles neutros contra abuso e reentrada condicionada à confirmação de quem removeu, se ainda participante, devem ser qualificados por Security/Engineering antes de implementação (RS §6). Nenhuma votação ou moderação pública é inventada. Crew encerra quando o último sai; com um restante, compromisso comum cancelado sem fracasso.

## 7. Shareable Object Model proporcional

C026 é atendida aqui, sem documento extra de templates. Share continua capability transversal, sem requisito social.

| Família | Fonte / narrativa | Internal → external | Limites V1 |
|---|---|---|---|
| Progresso próprio | Próprio resultado elegível, marco, adaptação/descanso/retorno, segundo scope/content validados. | Prévia privada escolhida → cópia estática por ação/destino explícitos. | Sem outro membro, Crew, motivo, Nutrition, recovery/health signals ou localização/rota. Métrica própria opcional somente se revisada, nunca destaque de volume como mérito. |
| Convite | Meu convite nominal; narrativa de continuar juntos sem objeto coletivo identificável. | Cópia/link de ingresso nominal opaco, com confirmação de encaminhado/projetado. | Sem nome/foto/contagem/contribuição de membros, nome da Crew ou conteúdo interno antes do acesso autorizado; nunca inscrição direta. |
| Identidade/conquista/progresso coletivo externos | Capability futura, preservada. | Diferida fora da V1. | Crew pequena facilita inferência mesmo sem nomes. Não se implementa agregado/recusa silenciosa como prova pronta; exige consentimento/modelo e avaliação Security próprios quando houver scope. |

**AR-15:** compartilhar nasce do objeto, não screenshot ou feed. A pessoa pode cancelar sem efeito; externalizar requer prévia exata e aviso de que cópia fora do produto não pode ser recolhida. Sem metadados extras, horário/localização sensíveis, dados vivos ou audiência/conversão por indivíduo de volta ao produto. Registro pessoal de projeção permite governar futuras ações. Expressão visual, customização e formatos são design space downstream, sem templates nesta missão.

Não compartilhar não muda adequação, reconhecimento ou participação. Objetos coletivos internos podem reconhecer o período sem transformá-lo em export externo. Não atribuir resultado de outro membro pela inferência de pertencimento.

## 8. Estados, direitos e alternativas

Estados completos no PDM §5/AEC; a arquitetura exige caminhos recuperáveis:

| Situação | Ação e retorno estáveis |
|---|---|
| Contexto/confiança insuficientes | Detalhe da decisão + menor ajuste material em Plano/Você; recusa/desconhecido possíveis. Sem score, dose ou obrigatoriedade de wearable para preencher caminho. |
| HOLD / review / reavaliação | Mesma decisão/sessão: escopo/limite e próximo passo privados, contestação/correção e owner de saída; funções não afetadas preservadas. Confirmação/override não limpa safety. AEC §7 define classes/transições. |
| Revisão pendente/obsoleta | Voltar à decisão corrente; confirmar novo alcance se aplicável, preservando execução/export anteriores. |
| Sync, associação ou dado corrigido | Sessão/observação com status; resolver/corrigir e retomar sem perder registro. |
| Wearable indisponível/unsupported/discrepante | Execução app ainda válida; conexão/permissão em Você; diferenças/unknown/versão antiga na sessão até prova no nível correto. Outage não é ausência do atleta nem HOLD médico automático. |
| Interrupção/retorno | Plano/Hoje; não pausa vínculos automaticamente nem exige volume. |
| Crew vazia/formação/sem compromisso | Criar/convite ou permanecer sem adesão; sem pressão ou fracasso. |
| Vínculo pausado/saída/remoção | Minha participação/Privacidade; acesso termina na saída. Dado pessoal/histórico solo independentes. |
| Consentimento negado/revogado | Privacidade e ponto de uso apontam ao mesmo consentimento. I10 secundário revogado cessa fila/uso/serviço dos derivados; primário requer finalidade independente válida. Wearable mantém outra finalidade somente se rota permitir técnica/juridicamente; senão desconecta e explica, sem prometer OAuth granular. Recipients/propósitos reais e audiência/inferência residual precisam integrar copy de consentimento, sem novas features (PDM I6/I10, PA §6). |
| Share cancelado/erro | Origem intacta; nada projetado sem confirmação; não penalizar. |

Direitos de acessar/exportar próprios dados, corrigir, revogar, eliminar e encerrar conta têm referência estável em Você; nenhum export de dados de terceiros. Deixar o motor/conta segue PDM §7. Retenção/idade/base legal/backups e comprovação técnica permanecem RS §6/PDR; achado que altera comportamento reabre a arquitetura.

| ALT | Escolhida | Concorrente e razão |
|---|---|---|
| ALT-1 | Hoje contextual sobre referências estáveis. | Plano inteiro dentro de Hoje sobrecarrega entrada/perde continuidade; interface exclusivamente conversacional viola execução direta. Preservar o esquema anterior de referências era útil, com conteúdo/regras atualizados. |
| ALT-2 | Run/Strength como profundidade dos mesmos objetos. | Hubs/planos por esporte dividem coordenação; tracker genérico perde cobertura. |
| ALT-3 | Nutrition preparação e wearable vinculado à sessão. | Novos módulos de Nutrition/Watch duplicam jornadas sem reforçar decisão integrada. |
| ALT-4 | Crew leve privada, reconhecimento qualitativo de período. | Preservar dashboard coletivo detalhado requer métricas e permite inferência; retirar todo reconhecimento comum violaria L010/C041. |
| ALT-5 | Share individual/convite V1; coletivo futuro. | Preservar export coletivo anterior transfere solução sem gate; apagar capability reduziria design space sem autorização. |
| ALT-6 | Preservar destinos e acrescentar estados escopados/controle na referência atual. | Hub separado de safety/integração duplicaria decisão; retry/default “conservador” automático ocultaria perda/autoridade. AEC centraliza comportamento; estado de transporte não vira prescrição. |

Prova por percursos analíticos em [CF S01–S18](CORE_FLOWS.md); sem wireframe/protótipo nesta missão, sem UX testada ou implementação validada.

## 9. Architecture Eval — autoavaliação

Task **PREUX-20261015**, contrato **PREUX-20261015-r1**; rubrica **PRODUCT_ARCHITECTURE 1.0.0** (extensão 1.2.0 preservada); skill verify-product-architecture 1.0.0. Avaliador **Product/UX Architect 1.2.0, worker `/root/preux_integration`, modo self/autoria**; escopo PDM/PA/AEC/RS/EM/CF-1.1. Esta inspeção prepara review independente; **não emite PASS, VISUAL_READY ou aprovação própria**. PTC/PTM não alterados. Nenhuma prova clínica, jurídica, visual ou executável é inferida.

| Critério | Self-check | Evidência e limite |
|---|---|---|
| Necessidade/outcome | Coberto para review | PA §1; AEC §2/6/7 consome SCI/PRO/WEA, sem repetir pesquisa ou reabrir 3.0.0. Benefício permanece hipótese. |
| Ownership canônico | Coberto para review | PDM §3–5; PA §3: decisão/trace/HOLD, observação, export/intenção separados; sem estado de agente/Hoje/provider. |
| Arquitetura/navegação | Coberto para review | PA §2–5/8: destinos preservados; nenhum módulo Nutrition/HOLD/watch ou nova audiência social. Visual N/A nesta missão. |
| Jornada | Coberto por cenário analítico | CF F01–F10/S01–S18: recusa/contexto, perda, late/duplicate, versão antiga, hold/reavaliação, reconciliação e retorno. Sem testes de uso/runtime. |
| Hierarquia | Coberto para review | PA §4: safety no escopo afetado, execução/decisão e observação antes de social; registro/direitos preservados. |
| Estados | Coberto com dependências explícitas | PDM §5; AEC §2/5/7; EM §5. Trust/receipt/confidence/HOLD não colapsam; gaps exatos no PDR §5 e consumo por etapa RS §6. |
| Terminologia/invariantes | Coberto para review | Run × Strength first-class sem dose igual; Nutrition por função e suplementos OUT; Crew AR-10–15 preservados; sem limiar/readiness universal. |
| Alternativas/prova | Coberto para review | PDM §8/PA §8; preservar estrutura + estados versus destinos/defaults automáticos; preflight recusa perda e app-first em AEC §5. Prova descartável documental, sem UI. |
| Handoff | Preparado, gate pendente | §10 identifica versões/consumidores, evidência, gaps e STOP; Chief/judges independentes avaliam revisão/hashes atuais. |

Achados desta autoinspeção: nenhuma incompatibilidade estrutural identificada no delta documental; políticas e provas dependentes permanecem **abertas**, com responsáveis/provas no PDR. Veredicto de autoria: **SUBMETIDO A REVIEW INDEPENDENTE**, sem gate emitido. Pareceres e hashes do amendment ficam na auditoria pré-UX mantida pelo Chief; pareceres 3.0.0 cobrem somente o baseline inalterado. Finding devolve critério/evidência/revisão ao autor; alteração material invalida a cobertura dependente.

## 10. Handoff documental

Producer: Product/UX worker `/root/preux_integration`; consumidores atuais: Chief e judges independentes; task PREUX-20261015 / contract PREUX-20261015-r1. Artefatos: os seis consumidores 1.1; autoridade PTC-3.0.0/PTM-1.0 preservada, DR-66–69/71 subordinadas. Inputs SCI-1.0, PRO-BOUND-1.0 e WEA-1.0 consumidos para objetos/jornadas reais; nenhum aceite de Claude é presumido. Outcome: contratos qualitativos e estados suficientes para detalhamento estrutural futuro, com dependências específicas mantidas abertas.

Próximo passo: Chief verifica integridade/links/versões e encaminha a judges frescos Product/UX, Engineering e Security (Research avalia packs). Somente parecer competente atual permite consolidar gate/publicação no índice. Gaps/provas únicas em PDR §5 G01–G11, consumidores por etapa RS §6; nenhuma decisão documental substitui profissional real, jurídico, admissão de provider ou device/spike. Corrigir findings no owner correto e revisar consumidores afetados, sem inventar novos artefatos ou rebaseline. **STOP de autoria após esta entrega e evidência de integridade; não iniciar UI/Figma/código.**

Handoff ao Designer só ocorre em missão futura autorizada e gate arquitetural vigente: deve preservar PTC/revisões/cláusulas, objetos/destinos, entradas, hierarquia, estados, alternativas, limitações e pareceres independentes. VISUAL_READY nunca se infere desta autoavaliação. Não fixa Figma/tabbar nem absorve gates de Engineering, Security ou UI.
