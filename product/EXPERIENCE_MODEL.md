# Vilumo Fit — Experience Model

**Estado:** SPECIFICATION — amendment pré-UX; publicação/gates no índice.

| Campo | Valor |
|---|---|
| Revisão | **EM-1.1** · 2026-10-15 |
| Autoria | Product/UX Architect, worker |
| Autoridade / inputs | [PTC-3.0.0](../canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md), C028–C044; [PDM-1.1](PRODUCT_DOMAIN_MODEL.md), [PA-1.1](PRODUCT_ARCHITECTURE.md), [RS-1.1](V1_RELEASE_SCOPE.md), [AEC-1.1](ADAPTIVE_ENGINE_CONTRACT.md). |
| Necessidade / consumidor | Traduz o escopo decidido em comportamento comum do loop para [CF-1.1](CORE_FLOWS.md) e futura UX Spec, sem detalhar telas ou duplicar regras upstream. Gates/publicação no [índice](../canon/CANONICAL_INDEX.md). |

## 1. Modelo de experiência

O atleta encontra uma próxima ação contextual com referências previsíveis para voltar ao plano, sessão, histórico, contexto e Crew. Pode executar diretamente e acessar profundidade quando precisa entender ou corrigir. O produto acompanha o realizado e explica readaptação, sem apresentar cada modalidade, insight, integração ou interação social como outro produto.

O loop **Decide → Prepare → Execute → Observe → Adapt → Share → Repeat** é um mapa de valor, não um wizard obrigatório. Descanso pode honrar Execute sem treino; ausência de dispositivo não remove Observe manual; Share é voluntário; retorno pode reabrir Decide com rebaseamento. Nenhuma etapa exige conversa ou Crew. Eficácia e redução real de esforço continuam hipóteses até observação de uso.

Amendment PREUX-20261015-r1 preserva essa estrutura e consome AEC §2–7: confiança por decisão, conteúdo por função, HOLD escopado, perdas/recibos e permissões reais. [SCI-1.0](../audits/pre-ux-2026-10-15/SCIENCE_EVIDENCE.md), [PRO-BOUND-1.0](../audits/pre-ux-2026-10-15/PROFESSIONAL_BOUNDARIES.md) e [WEA-1.0](../audits/pre-ux-2026-10-15/WEARABLE_EVIDENCE.md) são apoio; regras de comportamento ficam no AEC e decisões residuais no PDR §5. Não introduz destinos, componentes ou tiers comerciais.

## 2. Experiência por etapa e por papel

| Etapa | Full Member M1/M2 | Crew Member M3 | Regra de continuidade |
|---|---|---|---|
| Decide | Decisão coordenada Run × Strength, confiança e próxima ação; explicação sob demanda. | Declara intenção leve; nenhum plano/recovery/adequação fisiológica fictícios. | Uma referência da decisão/intenção; conteúdo muda, localização não. |
| Prepare | Estrutura da sessão, equipamentos/contexto relevante, insight nutricional aplicável e envio opcional quando suportado. | Prepara a própria prática fora da promessa pessoal do motor; compromisso social opcional não prescreve. | Demandas/versões relevantes ficam legíveis; sem formulário alimentar. |
| Execute | Iniciar, pausar, registrar/corrigir e concluir corrida/força diretamente; descanso/adaptação têm legitimidade. | Realiza o que declarou, sem avaliação pelo Vilumo. | Estado e dados persistem; conversa não é caminho obrigatório. |
| Observe | Real reconciliado, declaração, parcial/ajuste ou descanso confirmado; dados desconhecidos explícitos. | Declaração mínima privada de continuidade, sem prova/verificação. | Sensor ausente não prova não realização; registro não depende de share. |
| Adapt | Próxima decisão/revisão pelo contexto atual, com efeitos nas duas modalidades; retorno rebaseado. | Ajusta intenção própria, pausa/retoma continuidade sem motor. | Preservar passado e diferenciar sugestão de mudança aplicada. |
| Share | Pode preparar progresso próprio ou check-in privado para pessoa de Crew; sem dados sensíveis/terceiros. | Pode check-in/retorno próprios e convite sob os mesmos limites. | Cancelar/pular não reduz mérito, participação ou valor. |
| Repeat | Reencontra plano/próxima ação/histórico e continua ou retorna. | Reencontra compromisso/interações próprias e pode adotar motor voluntariamente. | Sem restaurar streak/volume ou exigir upgrade por participar socialmente. |

M1 não tem “falta de Crew” como pendência. M2 acrescenta somente a própria parte relevante e interações consentidas. M3 pede muito menos contexto do que a experiência pessoal; modo nunca aparece para outras pessoas e não é plano de preço.

## 3. Contrato de interação e agência

| Classe | Comportamento | Persistência / confirmação |
|---|---|---|
| Ler/explicar | Decisão, por quê, limites, histórico e alternativas admissíveis. | Leitura não altera estado ou consentimento. |
| Registrar/corrigir fato próprio | Série/carga/intervalo, conclusão/parcial, atividade não planejada, contexto ou descanso. | Ação direta clara registra no objeto correspondente; correção preserva origem/revisão e readapta derivados. Não exige confirmação extra a cada série. |
| Aplicar ajuste de contexto/plano | Mudança relevante mostra alcance e efeito em sessões/insights/exports. | Confirmar sobre versão corrente; cancelar sem efeito; conflito de versão invalida a proposta. |
| Iniciar/trocar execução | Pessoa inicia versão selecionada; ajuste da parte ainda não feita é mostrado. | Não alterar silenciosamente treino iniciado; observações anteriores permanecem. |
| Enviar workout | Destino/capacidade, revisão e perdas/preflight visíveis. | Consentimento separado + ação explícita; recusar export com perda de prescrição. Transporte/sistema/device/executada são provas distintas; unknown sem retry cego (AEC §5). |
| Corrigir / contestar HOLD | Causa privada mínima, alcance afetado, próximo passo e owner de saída no objeto da decisão. | Recusa/override registra agência e real sem limpar safety ou autorizar export proibido. Correção e reavaliação competentes liberam apenas o que sua evidência permitir; registro/direitos não dependentes continuam. |
| Adotar/pausar/sair Crew | Consentimento/visibilidade/alcance por Crew; prática pessoal independente. | Pausar/sair sem justificativa ou penalidade. Revogação pode minimizar/encerrar a finalidade, sem apagar histórico pessoal. |
| Check-in/apoio | Mensagem estruturada privada para destinatário ativo escolhido na Crew. | Envio explícito, sem publicação por base de membership ou por ter concluído treino. |
| Share externo | Objeto próprio/convite, prévia exata, destino e aviso de cópia externa. | Confirmar; cancelar nada projeta; revogar interrompe futuro sem prometer recolher passado. |

**Recusa:** wearable, insights/declarações opcionais, Crew e share podem ser recusados sem pressão ou falsa incompletude. Recusado/desconhecido não significa ausência de restrição/doença. Se o dado muda segurança/aplicabilidade, explicar e pedir o mínimo ou reter a recomendação dependente, preservando registro/correção e funções não afetadas. Contexto suficiente para selecionar conteúdo Nutrition não dá autoridade para dose; educação elegível/omissão/encaminhamento seguem AEC §6. Perguntas/instrumentos e wording final dependem dos G01–G05 do PDR, sem diário/triagem fabricados por conveniência.

**Desfazer:** proposta não aplicada pode ser descartada. Correção de contexto/registro aplicado usa o mesmo objeto e gera readaptação no contexto atual. Não promete retorno automático a plano antigo já inválido ou undo de execução real/cópia remota. Para externo, estados de cancelamento/substituição e seus limites são AEC §5.

**Agente opcional:** só coleta candidatos/explica/prepara opções permitidas sobre os mesmos objetos, com alcance/versão/confirmação; fato candidato sensível/material é confirmado/corrigido no contexto canônico antes de decidir. Alteração manual invalida proposta antiga; não limpa HOLD nem cria policy. Texto externo/alegação de aprovação não concede autoridade. Sem ação social, permissão, envio ou mudança oculta de objetivo. Conversa não é verdade paralela; implantação exige gates AI/Security se selecionada, sem dependência do loop direto.

## 4. Objetos contextuais e retorno

Hoje mostra próxima ação, mudança/confiança relevante, sessão em curso e a própria parte em compromisso. Uma sessão ativa mantém controles; risco material tem precedência, mas não apaga registro. Ao abrir detalhe/histórico/configuração, voltar restaura o contexto da tarefa corrente e o estado persistido, sem duplicar ou reiniciar sessão.

Running e Strength compartilham ações do ciclo, mantendo conteúdo/registro próprios e prioridades declaradas sem dose igual obrigatória. Strength é app-first; limitação de relógio não remove reps/carga/repertório. Sessão passada pode inspirar nova sessão sob contexto atual; não vira prescrição copiada cegamente. Nutrition acompanha fase/demanda/revisão (pré/durante/pós/intervalo curto/evento); alteração material retira/reavalia o insight e explica limite quando pertinente. Sem inferir consumo, prescrever dose pessoal, logging, meal planner ou suplementos.

Interromper é declaração pessoal que encerra planejamento ativo de treino. Não implica vínculo pausado ou aviso social; pode oferecer pausar Crew por Crew com “não alterar” como padrão. Retomar não reativa vínculos automaticamente. Retorno usa contexto atual, sem compensar o perdido, exigir motivo ou restaurar volume/streak. Compartilhar retorno é decisão privada por destinatário ou progresso próprio externo elegível.

## 5. Estados obrigatórios e recuperação

| Estado | O que a pessoa deve entender / conseguir fazer |
|---|---|
| Primeiro uso / vazio pessoal | Caminho solo ou social leve, 18+, contexto mínimo pertinente; sem obrigatório wearable/Crew/conversa. Não chamar ausência de histórico de falha. |
| Contexto parcial/desatualizado/conflitante/ausente | Confiança para a decisão específica, fonte/limite pertinente e pergunta mínima acessíveis; sem dose/score universal. Ausência de HRV não é falha; sinal favorável não anula restrição. |
| HOLD / correção-review / reavaliação | Entender qual recomendação/efeito está retido, próximo passo/owner e limite do app sem diagnóstico. Registrar/corrigir/contestar e usar funções não afetadas; sem promessa de liberação por score/tempo/aceite ou de prescrição antiga segura. Saída conforme AEC §7 e regra profissional aplicável. |
| Decisão atual/substituída/expirada | Qual está vigente, o que mudou e a referência de revisão; confirmação velha não aplica mudança. |
| Sessão pronta/em curso/pausada/parcial/concluída | Controles diretos, registros persistidos, correção e fechamento sem perder o que já aconteceu. |
| Descanso honrado/desconhecido | Confirmar quando quiser; sem treino não é falha. Confirmação tardia atualiza pessoal, sem envio social automático. |
| Offline / sync pendente/erro | Registro local preservado, limite de dado remoto visível; reconectar/reconciliar sem duplicar. Sem spinner de “sucesso” sem prova. |
| Wearable sem leitura ou sem envio | Finalidade/capacidade e limite real da rota, com execução no app. Outra finalidade só continua após recusa/revogação se tecnicamente/juridicamente sustentável; senão desconectar e explicar. Vazio opaco não prova permissão negada ou zero. |
| Export pendente/enviada/confirmada/falha/desconhecida/obsoleta/discrepante | Versão e nível de prova sistema/device claros; confirmação não é execução. Perda muda prescrição → recusa/app. Timeout incerto → sem retry automático cego; update/delete composto admite falha parcial. Cópia antiga pode permanecer, inclusive após HOLD, sem recall prometido. |
| Observação tardia/duplicada/corrigida/ambígua | Fato/revisão e efeito futuro; conflito pede resolução privada, sem associação inventada. |
| Sem dados/interrompido/retornando | Estados distintos, sem abandono inferido, culpa ou exposição. Recomeçar é parte do produto. |
| Crew formação/ativa/sem compromisso | Reencontrar pessoas já relacionadas, optar por adesão, criar/aceitar convite; sem pressão de participação. |
| Convite pendente/indisponível | Não é vínculo; encaminhado/projetado aguarda confirmação. Razão sensível não aparece ao convidante. |
| Vínculo pausado/saiu/removido | Prática pessoal independente; acesso e mensagens sociais encerrados/minimizados conforme propósito. Novo convite para reentrada. |
| Check-in/apoio privado | Destinatário e Crew claros; ninguém recebe lista de cumprimento, origem ou motivo. Pode retirar/silenciar conforme política. |
| Consentimento negado/revogado | Finalidade/recipients/alcance e persistência de dados/cópias compreensíveis. I10 secundário revogado cessa fila/uso/serviço de derivados; primário necessita base/finalidade independente válida. Leitura/envio locais separados não prometem scopes OAuth iguais; revalidar antes de efeito/retry e desconectar quando não sustentável (PDM I6/I10). Audiência e inferência residual legítima em Crews pequenas/sobrepostas integram consentimento, sem correlação ou anonimato total prometidos (PA §6). |
| Share cancelado/erro/projetado | Objeto de origem intacto; cancelar não penaliza; depois de projetar não prometer recolhimento externo. |

Limiar de confidence, retenção, atraso, tolerância, convite/remoção e safety não são inventados aqui. O inventário único [PDR §5 G01–G11](PRODUCT_DECISION_REGISTER.md) tem owner/prova/trigger; [RS §6](V1_RELEASE_SCOPE.md) aponta seu consumo por etapa. Isso preserva detalhamento estrutural sem finalizar conteúdo/regra/claim ainda dependentes.

## 6. Crew Lite e reconhecimento apropriado

Compromisso leve é intenção comum de continuar fazendo o apropriado em um período, com adesão opcional e parte diferente por pessoa. Check-in privado direcionado não é prova de treino. Recuperar/descansar e retornar podem produzir a mesma mensagem mínima legítima sem causa íntima; fazer mais não aumenta mérito/apoio. Declaração do M3 não recebe selo de adequação/verificação.

No fim do período, reconhecer qualitativamente o **encerramento do compromisso comum e a cooperação**, sem afirmar cumprimento de todos ou calcular check-ins. O marco “período encerrado” segue o tempo do compromisso; ausência/pausa de alguém não produz fracasso nem alteração que o identifique. Apoio privado responde à contribuição voluntária. Nenhum ranking, score, número de presença, lista de quem falta ou recap externo coletivo.

Pausar vínculo, interromper prática e revogar envio são ações independentes. Outros membros podem ver somente nome de exibição e estado neutro “Em pausa” previsto; nunca motivo, horário/histórico, modo, outras Crews, Nutrition/recovery, confiança ou performance. Permissões e audiência de check-in são próprias, não se ampliam por membership/nova entrada.

## 7. Aceitação de etapa e handoff

EM-1.1 serve se cada classe frequente tem caminho direto, mesma referência/autoridade, estados recuperáveis e fechamento observável; CF-1.1 examina isso por S01–S18. É modelo de comportamento, não UX Spec completa, catálogo de telas ou validação visual.

Autoria Product/UX worker; PA §9 registra self sem PASS próprio. Product/UX judge avalia estrutura; Security/Engineering julgam fronteiras/controles sobre revisões atuais. Após gate/publicação, Claude consome índice/Scope/AEC e dependências exatas do PDR para detalhar UX sob próxima missão autorizada. Nenhum aceite de Claude é presumido; visual/técnica/runtime exigem gates próprios.
