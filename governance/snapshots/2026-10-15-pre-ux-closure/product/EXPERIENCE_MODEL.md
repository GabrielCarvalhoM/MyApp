# Vilumo Fit — Experience Model

**Estado:** SPECIFICATION — revisão documental aprovada.

| Campo | Valor |
|---|---|
| Revisão | **EM-1.0** · 2026-10-14 |
| Autoria | Product/UX Architect, worker |
| Autoridade / inputs | [PTC-3.0.0](../canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md), C028–C044; [PDM-1.0](PRODUCT_DOMAIN_MODEL.md), [PA-1.0](PRODUCT_ARCHITECTURE.md), [RS-1.0](V1_RELEASE_SCOPE.md), [AEC-1.0](ADAPTIVE_ENGINE_CONTRACT.md). |
| Necessidade / consumidor | Traduz o escopo decidido em comportamento comum do loop para [CF-1.0](CORE_FLOWS.md) e futura UX Spec, sem detalhar telas ou duplicar regras upstream. Gates/publicação no [índice](../canon/CANONICAL_INDEX.md). |

## 1. Modelo de experiência

O atleta encontra uma próxima ação contextual com referências previsíveis para voltar ao plano, sessão, histórico, contexto e Crew. Pode executar diretamente e acessar profundidade quando precisa entender ou corrigir. O produto acompanha o realizado e explica readaptação, sem apresentar cada modalidade, insight, integração ou interação social como outro produto.

O loop **Decide → Prepare → Execute → Observe → Adapt → Share → Repeat** é um mapa de valor, não um wizard obrigatório. Descanso pode honrar Execute sem treino; ausência de dispositivo não remove Observe manual; Share é voluntário; retorno pode reabrir Decide com rebaseamento. Nenhuma etapa exige conversa ou Crew. Eficácia e redução real de esforço continuam hipóteses até observação de uso.

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
| Enviar workout | Destino/capacidade, revisão e diferenças relevantes visíveis. | Consentimento de envio separado de ingestão + ação explícita; enviada/confirmada não é executada. |
| Adotar/pausar/sair Crew | Consentimento/visibilidade/alcance por Crew; prática pessoal independente. | Pausar/sair sem justificativa ou penalidade. Revogação pode minimizar/encerrar a finalidade, sem apagar histórico pessoal. |
| Check-in/apoio | Mensagem estruturada privada para destinatário ativo escolhido na Crew. | Envio explícito, sem publicação por base de membership ou por ter concluído treino. |
| Share externo | Objeto próprio/convite, prévia exata, destino e aviso de cópia externa. | Confirmar; cancelar nada projeta; revogar interrompe futuro sem prometer recolher passado. |

**Recusa:** wearable, insights/declarações opcionais, Crew e share podem ser recusados sem pressão ou falsa incompletude. Se um dado for de fato necessário à segurança/aplicabilidade de uma prescrição, explicar a necessidade e oferecer somente o que a policy validada permite; não fingir precisão para manter o fluxo curto. O conjunto necessário depende de O003/O014, não de comodidade de UI.

**Desfazer:** proposta não aplicada pode ser descartada. Correção de contexto/registro aplicado usa o mesmo objeto e gera readaptação no contexto atual. Não promete retorno automático a plano antigo já inválido ou undo de execução real/cópia remota. Para externo, estados de cancelamento/substituição e seus limites são AEC §5.

**Agente opcional:** só explica/prepara sobre mesmos objetos e operações, alcance/versão/confirmação explícitos, sem ação social, permissão ou envio externo. Alteração manual vale imediatamente; proposta antiga é invalidada. Conversa não é fonte paralela de verdade. Implantação exige AI/Security se entrar no release; o loop direto permanece completo sem ele.

## 4. Objetos contextuais e retorno

Hoje mostra próxima ação, mudança/confiança relevante, sessão em curso e a própria parte em compromisso. Uma sessão ativa mantém controles; risco material tem precedência, mas não apaga registro. Ao abrir detalhe/histórico/configuração, voltar restaura o contexto da tarefa corrente e o estado persistido, sem duplicar ou reiniciar sessão.

Running e Strength compartilham ações do ciclo, mantendo conteúdo/registro próprios. Sessão passada pode inspirar repetição, mas cria uma nova sessão sob contexto atual; não transforma histórico em prescrição copiada cegamente. Nutrition aparece no momento de preparar demanda identificada; muda a demanda, rever/remover o insight e explicitar por quê quando material. Não registra alimentação por inferência nem oferece diário/meal planner.

Interromper é declaração pessoal que encerra planejamento ativo de treino. Não implica vínculo pausado ou aviso social; pode oferecer pausar Crew por Crew com “não alterar” como padrão. Retomar não reativa vínculos automaticamente. Retorno usa contexto atual, sem compensar o perdido, exigir motivo ou restaurar volume/streak. Compartilhar retorno é decisão privada por destinatário ou progresso próprio externo elegível.

## 5. Estados obrigatórios e recuperação

| Estado | O que a pessoa deve entender / conseguir fazer |
|---|---|
| Primeiro uso / vazio pessoal | Caminho solo ou social leve, 18+, contexto mínimo pertinente; sem obrigatório wearable/Crew/conversa. Não chamar ausência de histórico de falha. |
| Contexto parcial/desatualizado/conflitante | Limite que afeta ação visível, explicação/contexto pertinente acessíveis; nenhuma dose exata fabricada. |
| Decisão atual/substituída/expirada | Qual está vigente, o que mudou e a referência de revisão; confirmação velha não aplica mudança. |
| Sessão pronta/em curso/pausada/parcial/concluída | Controles diretos, registros persistidos, correção e fechamento sem perder o que já aconteceu. |
| Descanso honrado/desconhecido | Confirmar quando quiser; sem treino não é falha. Confirmação tardia atualiza pessoal, sem envio social automático. |
| Offline / sync pendente/erro | Registro local preservado, limite de dado remoto visível; reconectar/reconciliar sem duplicar. Sem spinner de “sucesso” sem prova. |
| Wearable sem leitura ou sem envio | Quais permissões/capacidades faltam e execução manual disponível. Recusar write não desconecta read automaticamente. |
| Export pendente/enviada/confirmada/falha/desconhecida/obsoleta | Onde está a versão e que prova existe; recuperar/reenviar sem duplicata, ou fallback no app. Cópia antiga remota pode permanecer. |
| Observação tardia/duplicada/corrigida/ambígua | Fato/revisão e efeito futuro; conflito pede resolução privada, sem associação inventada. |
| Sem dados/interrompido/retornando | Estados distintos, sem abandono inferido, culpa ou exposição. Recomeçar é parte do produto. |
| Crew formação/ativa/sem compromisso | Reencontrar pessoas já relacionadas, optar por adesão, criar/aceitar convite; sem pressão de participação. |
| Convite pendente/indisponível | Não é vínculo; encaminhado/projetado aguarda confirmação. Razão sensível não aparece ao convidante. |
| Vínculo pausado/saiu/removido | Prática pessoal independente; acesso e mensagens sociais encerrados/minimizados conforme propósito. Novo convite para reentrada. |
| Check-in/apoio privado | Destinatário e Crew claros; ninguém recebe lista de cumprimento, origem ou motivo. Pode retirar/silenciar conforme política. |
| Consentimento negado/revogado | Qual finalidade para, onde controlar e quais dados/cópias persistem com limite transparente. I10 secundário revogado interrompe uso e remove ou deixa de usar seus derivados; primário ainda autorizado permanece independente. Revogação wearable por finalidade preserva outras permissões válidas; desconexão completa cessa leitura/envio (PDM I6/I10). |
| Share cancelado/erro/projetado | Objeto de origem intacto; cancelar não penaliza; depois de projetar não prometer recolhimento externo. |

Limiar de confidence, retenção, atraso, tolerância, limites de convite/remoção ou regra de safety não são inventados aqui. [RS §6](V1_RELEASE_SCOPE.md) aponta owner/trigger antes de implementação/release. Os flows devem respeitar esses abertos em vez de escolher por conveniência.

## 6. Crew Lite e reconhecimento apropriado

Compromisso leve é intenção comum de continuar fazendo o apropriado em um período, com adesão opcional e parte diferente por pessoa. Check-in privado direcionado não é prova de treino. Recuperar/descansar e retornar podem produzir a mesma mensagem mínima legítima sem causa íntima; fazer mais não aumenta mérito/apoio. Declaração do M3 não recebe selo de adequação/verificação.

No fim do período, reconhecer qualitativamente o **encerramento do compromisso comum e a cooperação**, sem afirmar cumprimento de todos ou calcular check-ins. O marco “período encerrado” segue o tempo do compromisso; ausência/pausa de alguém não produz fracasso nem alteração que o identifique. Apoio privado responde à contribuição voluntária. Nenhum ranking, score, número de presença, lista de quem falta ou recap externo coletivo.

Pausar vínculo, interromper prática e revogar envio são ações independentes. Outros membros podem ver somente nome de exibição e estado neutro “Em pausa” previsto; nunca motivo, horário/histórico, modo, outras Crews, Nutrition/recovery, confiança ou performance. Permissões e audiência de check-in são próprias, não se ampliam por membership/nova entrada.

## 7. Aceitação de etapa e handoff

EM-1.0 serve se cada classe frequente tem caminho direto, mesma referência/autoridade, estados recuperáveis e fechamento observável; CF-1.0 prova isso por S01–S12. É modelo de comportamento, não UX Spec completa, catálogo de telas ou validação visual.

Product/UX judge avalia estrutura e aderência independentemente; Security/Engineering julgam fronteiras de informação/integração. Self-check em PA §9 não aprova. Após revisão/publicação, Claude retoma parâmetros/evidência e UX Spec somente na ordem de dependência do scope. Escolhas visuais/técnicas ou implementações exigem seus próprios gates e nova missão autorizada.
