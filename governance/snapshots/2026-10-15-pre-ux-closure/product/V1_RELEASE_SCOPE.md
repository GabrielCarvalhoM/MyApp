# Vilumo Fit — V1 Release Scope

**Estado:** SPECIFICATION — revisão documental aprovada.

| Campo | Valor |
|---|---|
| Revisão | **RS-1.0** · 2026-10-14 |
| Owner / autoria | Product/UX Architect, worker; Founder decide prioridades estratégicas. |
| Autoridade | [PTC-3.0.0](../canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md), C023, C038–C044, C025; [pedido direto](../audits/rebaseline-3.0.0/REBASELINE_RECORD.md), [PDR](PRODUCT_DECISION_REGISTER.md). |
| Base / consumidores | [PDM-1.0](PRODUCT_DOMAIN_MODEL.md), [PA-1.0](PRODUCT_ARCHITECTURE.md), [AEC-1.0](ADAPTIVE_ENGINE_CONTRACT.md) → [EM-1.0](EXPERIENCE_MODEL.md), [CF-1.0](CORE_FLOWS.md), futuras UX Spec/Engineering. Gates/publicação no [índice](../canon/CANONICAL_INDEX.md). |
| Necessidade | Founder definiu a V1 agora; elimina a antiga ausência de launch priorities e evita que experiência/fluxos consumam o conjunto esportivo e social supersedido. |

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
| Nutrition Insights | Insight contextual de preparação/performance vinculado à demanda/revisão do treino, com limites e contexto mínimo voluntário. | Sem food logging, macro tracker, dieta completa, meal planner ou módulo nutricional autônomo. Doses/timing só com evidência e aplicabilidade aprovadas. |
| Wearables | Ingestão autorizada, reconciliação/correção e envio de structured workout quando representável/suportado; estado de export e fallback. | Sem promessa universal de marca/relógio, API ou app próprio no relógio. Consentimentos de leitura/envio distintos. |
| Crew Lite | Criar/reencontrar Crews, convites nominais, vínculo/consentimento, compromisso leve opcional, check-in privado direcionado, apoio estruturado e reconhecimento qualitativo do período comum, pausa/saída/bloqueio/silenciar. | Sem lista de pendentes/ausentes, score/ranking/pontos coletivos, perfilamento, chat, discovery público, communities abertas ou marketplace. |
| Shareability | Progresso individual próprio elegível e convite projetável sem dados de terceiros; prévia exata/ação explícita/cópia estática. | Compartilhamento coletivo externo diferido por inferência/consentimento em Crew pequena; não substituído por “agregação segura” presumida. |
| Continuidade e retorno | Execução/descanso/ajuste/histórico pessoal, interrupção e retorno pelo contexto atual; sem penalização por silêncio. | Nenhuma reposição automática de volume ou prova de comprometimento. |
| Produto mínimo transversal | Brasil; PT-BR + EN; iOS + Android; 18+; caminhos diretos e referências estáveis; estados de erro/offline/consentimento. | Interface final, age method, contratos técnicos e provas executáveis posteriores. |

**Crew preservada:** até 3 vínculos ativos/pausados por pessoa; cerca de 8 participantes por Crew; qualquer modo pode criar; nominal invite; encaminhado/projetado só entra com confirmação do convidante; sem agenda de contatos. Acordo leve diz “fazer o apropriado para cada um”, não sincronizar modalidade/dose. Descanso pode produzir check-in sem revelar motivo; declaração leve não valida performance.

O reconhecimento coletivo é qualitativo: concluir temporalmente um período de compromisso/cooperação, sem afirmar que todos cumpriram, consultar contagem de check-ins ou produzir fracasso por ausência. Apoio privado reconhece contribuições voluntárias. Isso preserva L010/C041 sem impor score/dashboard ou exposição.

## 3. Fora da V1 e possibilidades futuras

Cycling, Swimming e outros esportes podem ser expansões, **sem obrigação de release/data ou capability implementada agora**. Uma atividade adicional pode ser contexto no que se consegue interpretar honestamente; isso não declara suporte, não oferece prescrição/analytics próprios e não exige um framework genérico de esportes.

Ficam fora: chat ou texto livre social; feed/audiência/discovery público; comunidades abertas; marketplace; sessões Together/sincronização social de agenda; Season/Rally/campanhas; Crew Memory, Social Support Profile/Graph; competição ou score/pontos sociais; dieta/logging/meal planning; app próprio no relógio; postagem social automática; dados coletivos externos identificáveis ou por inferência; precisão clínica ou promessa de eficácia. A capability futura não é abandonada; só entra por decisão/evidência/review quando tiver consumidor real.

Agente de coordenação permanece canal opcional admissível da experiência híbrida, sem identidade de chatbot e sem task simples dependente de conversa. **Não é requisito de release desta V1.** Se for incluído, deve satisfazer AEC §7 e review AI/Security sobre modelo, dados, retenção e confirmação; não acrescenta autoridade nem autonomia de envio/share.

## 4. Cobertura mínima crível proposta

Os critérios são observáveis, não fórmulas de treino nem aprovação de domínio. O014 mantém a alocação final de quem fixa e verifica; Research/autoridade de treino informam evidência e limites antes de implementação/promoção de suporte pleno.

| Área | Critério de cobertura | Evidência que deverá existir antes de declarar pronto |
|---|---|---|
| Running | Objetivo/perfil suportado explícitos; sessão com estrutura/intensidade/limites próprios; execução/observação e adaptação de corrida de fato coordenadas com força. | Casos validados de sessão/progressão, critérios de aderência e efeitos cruzados sob limites revisados; não apenas mockups. |
| Strength | Repertório/equipamentos suportados explícitos; sessão com exercícios/estrutura/registro próprios; progressão/adaptação possíveis sob contexto integrado. | Casos validados de repertório, ajuste e execução/correção; não apenas sugestão de exercício ou boolean de conclusão. |
| Engine | Mudança material em uma modalidade pode alterar a decisão futura da outra e ser explicada; agente/Crew não determina adequação. | Cenários Run→Strength e Strength→Run, ausência/conflito de dados, parcial/ajuste/descanso/retorno e política de safety aprovada (O017). |
| Nutrition | Insight responde à demanda identificada/revisão; demanda muda, insight reavaliado; contexto mínimo e limites claros. | Conteúdo/regra de aplicabilidade revisados com evidência, sem precisão/dose fabricadas nem conteúdo de dieta. |
| Wearables | Pelo menos um caminho comprovado de ingestão + envio estruturado realmente viável para launch; matriz informa modalidades/estruturas, limites e fallback (O016). | Prova de acesso, representação, consentimento, entrega/erro, dedupe, dados tardios/corrigidos e revisão/export obsoleto na integração escolhida. Nem todo destino precisa enviar ambas modalidades; o app precisa cobrir ambas. |
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

Sequência de retomada: fechar evidência/ownership de safety e cobertura; confirmar capacidades wearable e efeitos de permissões; detalhar comportamento onde esses limites alteram flows; então UX Spec/wireframes, review de estrutura, Designer/UI, Engineering e implementação sob nova missão autorizada. Nenhuma etapa exige expansão esportiva, módulo nutricional ou social avançado.

## 6. Questões realmente abertas

Registro único de decisão: PDR, DR-55–DR-65 e disposições atuais dos DR históricos. Esta tabela só organiza consumidores/triggers; não cria outro decision register.

| Tema | Owner competente | Trigger / limite antes de seguir |
|---|---|---|
| Quem fixa/verifica cobertura mínima (O014), com objetivos/repertório Running/Strength e aderência/tolerância | Founder decide alocação; Product/UX propõe; Research/autoridade de treino informam; Chief coordena. | Antes de declarar suporte pleno e antes de implementar treino adaptativo; intenção first-class já foi decidida, não repetir estratégia. |
| Safety Policy/Contract e parâmetros de treino/adaptação/recovery | Chief nomeia autoridade competente de treino/safety; Research informa evidência; Security cobre dados; Engineering implementa depois. | Antes de prescrição/adaptação real. AEC fixa degradação conceitual, sem dose/limiar. |
| Aplicabilidade/conteúdo Nutrition, precisão e público não elegível | Product/UX + Research/autoridade de domínio; Security para dados sensíveis. | Antes de publicar insight ou parâmetros; sem ampliar para dieta/logging. |
| Integrações launch, acesso, matriz de capabilities/limites e modo de fallback | Engineering + Security; Product/UX adapta jornada se limitação material; Founder decide impacto estratégico de promessa. | Antes de promessa comercial, escolha técnica e handoff de implementação. Não assume vendor/SDK ou todos relógios. |
| Identity/18+, comprovação de convite, remoção/reentrada e controles de abuso | Engineering + Security; Product/UX fornece CF F08/F09; Founder fornece memo jurídico/recursos quando necessários. | Antes de coletar/implementar. Método não pode ampliar dados ou expor motivo sensível. |
| Retenção, revogação, eliminação, backups, base legal e direitos do titular | Security/Engineering; Founder/autoridade jurídica para classificação/base legal. | Antes de coletar dados e de technical readiness; incluir prova de cessar uso/remover ou deixar de usar derivados de I10 secundário conforme PDM I10 (PB-F-01), sem apagar fatos legítimos de finalidade ainda autorizada. Revisão de arquitetura se regra jurídica mudar comportamento. |
| Audiência e inferência humana residual em vínculos sobrepostos (PB-F-02) | Product/UX + Security. | Antes de UX Spec/contrato de consentimento/notificações: informar audiência atual/futura e estado neutro; membros comuns podem reconhecer/comparar o que legitimamente veem, sem função de correlação, descoberta de outras Crews ou promessa de anonimato total. Conferir Crew de dois e pessoa em Crews sobrepostas. |
| Provas negativas de fronteira e exposição nas superfícies (PB-F-03) | Engineering + Security; Product/UX no comportamento das superfícies. | Antes de implementação/coleta/technical readiness: provar acesso cross-account/cross-Crew, saída/remoção/novo membro, convite/limites, autorização/vínculo/destinatário/revisão vigentes na emissão e retry, revogação em filas/derivados; qualificar abuso, minimização e notificações/lock screen/widgets sem conteúdo sensível ou estado de terceiros por padrão. Consentimento PT-BR/EN com escopo equivalente; parâmetros e mecanismos continuam abertos. |
| Modelo comercial/acesso por papel e pricing (O009) | Founder; Research informa se solicitado. | Antes de paywall/assinatura. Full/Crew Member não são plano de preço assumido. |
| Métricas de valor/validação de benefício, retenção e distribuição (O001/O002/H) | Data/Research com Product; Founder decide aposta/prioridade. | Antes de alegar efeito ou incentivar por métrica. Sem score inventado nesta missão. |
| Agente opcional, confirmação/undo/modelo/retention (O015) | Product/UX + AI Systems; Security nos dados/ações. | Só se entrar no release. AEC já proíbe autoridade/estado paralelo; nenhuma dependência conversacional. |

Coletivos externos e social avançado são **diferidos**, não questões bloqueantes da V1: reabrir somente com consumidor/evidência e revisão de privacidade. Este escopo não cria roadmap com datas nem autoriza código/Figma na missão atual.
