# Sport Intelligence — contratos internos do Adaptive Engine

Revisão **SIS-1.1-r2** · 2026-10-19 · task **FREEZE-20261019-r1** (baseline SIL).
Estado: **CANDIDATE_IN_ISOLATION**. Delta documental autorizado pelo Founder, preparado para integração após o gate atual do Claude. Não publicado no checkout ativo. [Registro atual, autoridade e impacto](../audits/v1-freeze-2026-10-19/MISSION_RECORD.md); [baseline SIL](../audits/specialist-layers-2026-10-19/MISSION_RECORD.md).

## 1. Autoridade e responsabilidade

[PTC C045/C046](../canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md) fixa o princípio; [AEC](ADAPTIVE_ENGINE_CONTRACT.md) continua autoridade de comportamento/controle; [PDM](PRODUCT_DOMAIN_MODEL.md) possui objetos/estados; [AEOS](ADAPTIVE_ENGINE_OPERATIONAL_SPEC.md) possui pipeline, B0, HC01–10, JEV e commit. Este documento detalha somente os contratos internos dos especialistas; não cria outra policy, plano, Safety Contract, consentimento ou registry de gaps. [PDR §5 G01–G11](PRODUCT_DECISION_REGISTER.md) e AEOS PS01–PS08 continuam sendo os pontos únicos para aprovações e lacunas.

**Specialist Parity + Cross-Sport Superiority** é padrão pretendido de competência decisória. Cada modalidade plenamente suportada deve poder atender um objetivo principal próprio com profundidade comparável aos melhores especialistas relevantes para os perfis declarados. Coordenação entre modalidades deve buscar resultado melhor que planos isolados na gestão de carga, recuperação e interferência. Isso não declara paridade/efeito já alcançados, não exige copiar features ou igualar doses, não escolhe marca como autoridade e não libera treino real sem G01–G04/G09/G11.

Camadas são responsabilidades lógicas, sem pressupor agentes de IA, microserviços, stack ou telas:

```text
Athlete Context único → AthleteState / EvaluationSnapshot compartilhados
  └ Adaptive Engine / Orchestrator (único owner de decisão/plano final)
      ├ Run Intelligence Layer (prescrição/progressão/avaliação de corrida)
      ├ Strength Intelligence Layer (prescrição/progressão/avaliação de força)
      ├ Recovery / Load (projeção compartilhada de evidência e exposição)
      └ Interference Engine (detecção e avaliação conjunta, dentro do Orchestrator)
          → candidatos completos → HC → B0 oficial / JEV SHADOW
          → policy gate → decisão → explicação → confirmação → executor futuro
```

Recovery/Load não é terceiro prescritor. Interference Engine nomeia a responsabilidade de conflict detection/interaction validation já existente em AEOS §§7–10; não é um segundo decisor colocado depois de B0. Cycling/Swimming só poderão adquirir Intelligence Layers de suporte pleno após decisão futura de escopo e prova de paridade especialista no público/cobertura prometidos; não há implementação ou dívida V1. Atividades externas desses esportes continuam apenas contexto qualificado.

## 1.1 Training doctrine e fundamento da decisão

C057–C061 governam ambos os especialistas e Interference Engine: EVIDENCE-INFORMED TRAINING, NOT AI-GENERATED NOVELTY. IA aplica ciência do treinamento; plausibilidade/novidade/sugestão LLM não são autoridade. Hierarquia conceitual C057 é qualitativa e considera aplicabilidade; histórico individual qualifica resposta sem substituir princípios sólidos por uma sessão isolada. Heurísticas têm suporte/limites identificáveis e não recebem certeza de consenso. Sob evidência limitada/conflitante, reduzir confiança/precisão, preservar alternativas conservadoras e reversíveis autorizadas; sem cobertura, abster-se do dependente em vez de inventar dose. Sem score científico ou nova pesquisa nesta missão.

TrainingDecisionBasis é projeção das refs existentes de recipe/policy/evidence em SpecialistProposal/Assessment e InteractionAssessment: princípio/propósito de treino, fonte/revisão e tipo/força qualitativa do suporte, aplicabilidade/cobertura, fatos/contraevidência individual comparável, incerteza e limites. Não é registry paralelo, nova coleta, validação profissional automática ou explicação causal inventada. Razão e evidência material devem sobreviver até DecisionTrace/explicação; proposta sem fundamento pertinente não vira candidata válida só porque o texto é convincente.

Concurrent training considera, quando aplicáveis/sustentados: proximidade entre sessões, tipo de estímulo e especificidade, volume/intensidade, custo local/sistêmico, recuperação, prioridade e histórico de resposta individual. Interferência esperada é hipótese qualificada, não penalidade universal ou causa comprovada. Sem suporte para spacing/dose altamente específicos, preferir alternativa conservadora/reversível coberta, ou ASK/HOLD do dependente. SIL-I1–I5 continuam: interação não adiciona nova fadiga a uma exposição já usada.

Cadência/processos e razões de mudança seguem AEC§1.3/AEOS§10.3. Aprender continuamente não obriga reprogramar; evolução significativa prefere próximo ciclo. Progression earned, Programmed Variation com training purpose e Reactive Adaptation material são distintas. Repetição intencional pode preservar mensuração/habilidade/especificidade; personalização não depende da contagem de alterações. Revisão humana futura/claims de paridade seguem §8/G11, sem bloquear visual.

## 2. Ownership e fronteiras

| Owner | Decide / produz | Limite |
|---|---|---|
| Athlete Context / projeção AthleteState | Fatos confirmados/reconciliados e derivados versionados, objetivos declarados e cobertura de dados. | Um atleta; nenhuma layer reescreve fato, prioridade, consentimento ou histórico. Athlete Model é o nome conceitual dessa responsabilidade existente. |
| Run Intelligence | Semântica de corrida; intenção/receita, candidatos de sessão e progressão; avaliação de performance/aderência sob regra. | Propõe, não aplica plano. Não reduz força por conta própria nem transforma falta de dados em falha. |
| Strength Intelligence | Semântica de força; repertório/estímulo, candidatos e progressão; avaliação de performance/aderência sob regra. | Propõe, não aplica plano. Não transforma força em mero suporte obrigatório à corrida. |
| Recovery / Load compartilhado | Projection de exposições observadas e planejadas, sinais locais/sistêmicos e incerteza, vinculados aos mesmos fatos. | Não cria dose, score universal ou novo fato de treino por estimativa de fadiga. Especialistas interpretam a projeção em seu domínio. |
| Interference Engine / Orchestrator | Relações de demanda Run × Strength, conflitos, viabilidade do horizonte e composição de alternativas. | Sem causalidade automática, cancelamento por proximidade ou penalidade fisiológica somada duas vezes. |
| B0 + policy gate do Adaptive Engine | Seleção entre candidatos conjuntamente válidos; ASK/HOLD/RECONCILE; prescrição final versionada. | Ordem/HC/guarda/agency são os de AEOS. JEV permanece SHADOW; LLM só explica/prepara dentro do contrato existente. |
| Pessoa / autoridade profissional | Pessoa confirma prioridade, fatos e alteração de plano; profissionais aprovam domínio/policy/aplicabilidade. | Confirmação pessoal não dá clearance nem substitui aprovação profissional. |

## 3. Contratos de entrada e saída

Tipos abaixo são extensões conceituais dos tipos AEOS, não APIs. `Ref` inclui identidade + revisão; `Option` inclui motivo de ausência. Unidades, construtos, observação/recebimento, finalidade, lineage e limites acompanham cada derivado. Nenhuma tabela obriga nova coleta: usar somente o necessário/autorizado para a decisão e marcar desconhecido.

| Contrato | Campos / semântica mínima | Owner / consumo |
|---|---|---|
| `SpecialistRequest` | `evaluation_ref`, snapshot/fingerprint, AthleteState/context/goal/plan-base refs, fatos e exposure refs pertinentes, disponibilidade/equipamento, restrições/holds, policy/approval refs, recipe/repertoire revisions, escopo e janela solicitados. | Orchestrator envia o mesmo snapshot-base a Run/Strength; projeção mínima por finalidade. |
| `SpecialistProposal` | Layer/revisão, request/snapshot refs, SessionIntent/SessionDemand, payload de modalidade, receita e regras usadas, estímulo essencial, alternativas admissíveis, limites/unknowns, efeitos na progressão e condições de validade. | Especialista propõe; Orchestrator compõe em `AdaptationCandidate` AEOS. Não é decisão vigente nem autorização de export. |
| `SpecialistAssessment` | Sessão/revisão executada, fatos reconciliados, comparabilidade, demanda observada, performance e aderência separadas, critério/versão ou `UNCLASSIFIED`, oportunidade de progressão ou motivo de abstensão. | Especialista avalia observação; projeções compartilhadas só avançam por atualização versionada, sem escrever plano. |
| `ExposureContribution` | FactRef + revisão ativa, escopo/tarefa/modalidade, observada versus planejada, dimensões de dose com unidades e demanda qualitativa sustentada, transformação/policy refs, cobertura/limites. | Recovery/Load projeta um fato; múltiplas interpretações referenciam a mesma contribuição. Não é uma nova atividade. |
| `InteractionAssessment` | DemandRelation/ConflictRecord refs, sessões/payloads/revisões, região/dimensão compartilhada, prioridade e janela, evidência/regra, efeitos/unknowns por alternativa e elegibilidade conjunta. | Interference Engine valida relações/horizonte. Relação não é carga extra, clearance ou diagnóstico. |
| `ArbitrationResult` | DecisionRecord AEOS + propostas/assessments usados, candidato composto fechado/hash, regras/HC/B0, deltas e perda/preservação por modalidade, alcance/confirm/validade e efeitos sobre progressão/insights/exports. | Adaptive Engine é o único emissor da prescrição final. Resultado também pode ser ASK/HOLD/RECONCILE. |

Catálogos de receitas/exercícios, performance models e zonas são referências versionadas do `PolicyBundle`, com aprovador/aplicabilidade e evidência G01/G02. Não nascerá um registry independente por layer com regras incompatíveis. Proposta incompleta, stale ou fora de cobertura não entra como candidata válida. Dados suficientes para registrar não equivalem a dados suficientes para progredir/prescrever.

## 4. Ordem de avaliação e precedência

Freeze: sob plano vigente válido/adequado, atualização de fatos/assessments termina em Level0/KEEP antes de gerar mudanças. As etapas propositivas abaixo se aplicam ao plano inicial, continuação ou necessidade material sustentada conforme AEOS§10; não negociar treinos novos a cada registro.

1. Normalizar/reconciliar fatos uma vez e fixar `EvaluationSnapshot`, incluindo fronteira do que era conhecido. Projetar exposições e sinais sem misturar planejado/realizado.
2. Aplicar HC contextuais: identidade/finalidade, cobertura/autoridade, restrições e integridade vêm antes de preferências esportivas. Restringir escopo dependente, preservando registros e funções independentes.
3. Solicitar propostas/assessments de Run e Strength no mesmo snapshot/policy bundle. Cada especialista preserva competência e objetivos próprios; pode retornar insuficiência/fora de cobertura em vez de completar campos com defaults.
4. Interference Engine identifica relações e monta alternativas completas do horizonte: manter, mover, reordenar, reduzir, substituir, recuperar/descansar ou replanejar, apenas onde há receitas aprovadas. Mudança que preserva um treino mas inviabiliza o seguinte não é solução válida.
5. Especialistas validam o payload e o estímulo das alternativas afetadas como funções da proposta fechada. Não recebem autoridade para aplicar uma contraproposta recursiva. Composto recebe HC01–10 em conjunto, inclusive dose/interação/agenda, antes de B0/JEV.
6. B0 avalia adequação/necessidade/Change Cost e Level 0 antes de mudar (AEC §1.2/AEOS §10); plano válido ainda adequado permanece. Apenas entre mudanças necessárias/minimamente eficazes aplica a ordem: objetivo primário ou coprioridades Balanced confirmados → estímulo essencial/criticality → secundários → evidência → menor ruptura → estabilidade. First-class não significa empate de prioridade. Sacrifício material sem preferência/regra suficiente leva a ASK/review, sem desempate por ID ou “corrida sempre vence”.
7. Policy gate revalida; decisão final conserva trace/efeito em ambos os domínios. Mudança aplicada usa confirmação/guarda integral AEOS §13.1. Alteração na sessão em curso preserva realizado e requer proposta para o restante. Export e social continuam intenções separadas.

Uma alternativa não pode ficar `VALID` apenas porque cada metade passou isoladamente. Se não houver alternativa conjuntamente sustentada, manter controle escopado; KEEP/REST não são defaults seguros. Uma layer futura não entra no gerador sem decisão de escopo e evidência própria.

## 5. Carga, recuperação e ausência de dupla contagem

O modelo compartilhado preserva vetor de exposições, não um escalar de “fadiga total”. Corrida pode contribuir distância/duração, tempo em intensidade sustentada e demanda mecânica; força pode contribuir séries/reps/carga/esforço e demanda local/axial/excêntrica. Não converter km em séries, somar kg a minutos, confundir carga externa com interna ou apresentar janela de recuperação como certeza.

Invariantes verificáveis:

- **SIL-I1:** mesmo fato canônico/revisão ativa gera uma contribuição de exposição observada por escopo, mesmo vindo de manual + wearable ou de dois especialistas. Correção substitui a contribuição anterior; supressão/revogação prevalece conforme AEC. Transformação nova não é novo treino.
- **SIL-I2:** planejado informa previsão de demanda; ao reconciliar realizado, a projeção do passado usa o observado conhecido, sem somar previsto + realizado. Parte não observada continua desconhecida, não zero; associação ambígua não fabrica uma segunda carga nem desaparece com o fato.
- **SIL-I3:** RPE de sessão e volume externo podem descrever dimensões diferentes do mesmo fato. Um modelo deve declarar componentes já usados e evitar somar uma estimativa total a seus próprios componentes como exposições independentes. Múltiplas fontes não aumentam confiança por contagem.
- **SIL-I4:** Recovery/Load e modelos locais interpretam as mesmas ExposureRefs. Fadiga estimada por Run/Strength é hipótese/projeção referenciada, não nova exposição. `InteractionAssessment` aponta relação; nunca adiciona “penalidade de interferência” novamente ao custo já representado sem modelo aprovado que separe o construto.
- **SIL-I5:** uma sessão de força com exercícios primários/secundários e superset/drop set conserva cada série/segmento único. Atribuição de volume a vários músculos não multiplica a carga sistêmica nem cria volume efetivo certificado. Método de atribuição depende G02.

Ausência de dor não prova recuperação; HR/HRV favorável não elimina restrição local. Demanda axial/excêntrica e novidade são dimensões de decisão sustentadas por repertório/policy, sem pontuação universal. Estado de transporte/export jamais entra como exposição realizada. Não inferir causa (“força causou queda no pace”) de proximidade/correlação.

## 6. Progressão, adaptação e aderência

`ProgressionAssessment` registra por domínio: base prescrita; revisão escolhida/executada; alvo efetivamente vigente; dose observada; qualidade/comparabilidade; critério/policy; ação de coordenação e seu motivo privado; oportunidade de avaliação; evidência a favor/contra mudança. Ação futura pode ser avançar, manter, regredir/rebasear, deload ou abster-se conforme policy aprovada. Essas são decisões internas, não novos rótulos morais de usuário.

| Situação | Interpretação obrigatória |
|---|---|
| Engine reduziu/moveu/substituiu antes da execução | Avaliar aderência contra a revisão aceita/executada. O alvo original permanece histórico, sem “falha em cumprir” a dose retirada. Progressão não é concedida como se o alvo original tivesse sido conquistado. |
| Pessoa tentou alvo vigente e houve desvio observado comparável | Pode avaliar dificuldade/desempenho conforme critério aprovado; desvio não prova causa nem autoriza progressão automática. “Falha do atleta” só pode significar critério de tarefa não atingido, nunca julgamento moral. |
| Adaptação durante sessão | Separar parte executada sob cada alvo/revisão e o que foi retirado deliberadamente. Não reclassificar retroativamente séries/intervalos já feitos. |
| Sem sync, associação ambígua ou registro parcial | `UNKNOWN/UNCLASSIFIED` nos aspectos sem prova; não marcar falha, descanso honrado, PR ou conquista de progressão por ausência de dado. |
| Recuperação/descanso indicado honrado | Continuidade apropriada preservada. Não equivale a ganho comprovado de capacidade física nem gera reposição de volume no próximo treino. |
| Retorno após pausa ou alteração de contexto | Rebasear sob policy/contexto atuais; não restaurar cargas/pace ou “recuperar” séries/km perdidos automaticamente. |

Coordenador pode retirar uma oportunidade de avaliação, sem declarar regressão do atleta. Especialista pode reter progressão por evidência insuficiente; deve distinguir esse motivo de desempenho abaixo do alvo e da decisão deliberada de proteção de outra modalidade.

## 7. Estabilidade, ciclos e novos eventos

Grafo acíclico por avaliação: **fatos → projeções → propostas → validação de interação/composto → B0/gate → decisão**. Proposta/decisão preparada não vira fato de performance, não aumenta recuperação nem dispara nova avaliação das próprias estimativas. Propostas não chamam umas às outras. Validar alternativa com especialistas é avaliação do payload, não nova rodada de planejamento negociado.

Conjunto de candidatos é fechado por snapshot/generator revision; eventual alternativa adicional exige nova revisão do conjunto e validação completa antes de ranking, dentro de orçamento operacional futuro. Sem orçamento/regra necessária, abster-se do escopo dependente; não inventar número de rodadas ou TTL fisiológico. AEOS §14 mantém detecção de ciclo/escalação Engineering + domínio.

Aplicação válida avança a revisão do plano, mas não cria um segundo estímulo observado. Reentrega dos mesmos fatos ou retorno das mesmas assessments não reaplica delta satisfeito. Fato/restrição/objetivo/policy materialmente novo cria avaliação sucessora; resposta stale é descartada. Iniciar a sessão com proposta pendente executa a revisão vigente somente se ainda válida; não confirma a proposta. Proposta APPLY_PLAN_CHANGE que inclui a sessão fica STALE inteira, inclusive se composta. Registrar evento de agência no DecisionTrace e no StabilityState, com sessão/revisão executada, proposta/razões de STALE e fronteira temporal/de fatos do início. Para o restante dessa execução, o resultado oficial não repropõe alteração ao restante sem fato material novo surgido depois do início; o próprio início, novo ID/conjunto, replay ou reavaliação das mesmas razões não satisfazem essa condição. Demais sessões de composto recebem avaliação sucessora normal. HOLD/restrição de safety continua imediato, sem cooldown. É semântica do motor, não filtro na UI; preserva CONF-16 e a expectativa UPSTREAM-ISSUE-04 já registrada na UX r3, sem editá-la.

## 8. Paridade e prova futura

Paridade é avaliada no público/objetivo/equipamento/cobertura declarados, com casos profissionais de prescrição, progressão, periodização, substituição, interpretação de desvio e degradação. Comparadores especialistas são selecionados e versionados na avaliação futura; nomes citados em conversa são referências de intenção, não evidência atual de capacidade ou obrigação de cópia.

Cross-Sport Superiority exige comparação com planos isolados sob os mesmos fatos/objetivos/restrições: medir preservação de estímulos e trade-offs, coordenação do horizonte, ausência de progressão não conquistada, estabilidade e qualidade de decisão; efeitos reais exigem desenho e evidência G11. Não criar score composto/target sem baseline. Casos sintéticos provam contrato, não fisiologia ou superioridade comercial.

Detalhamento por domínio: [Run Intelligence](RUN_INTELLIGENCE_SPEC.md) e [Strength Intelligence](STRENGTH_INTELLIGENCE_SPEC.md). Oráculos adicionais no [Scenario Lab §9](ADAPTIVE_ENGINE_SCENARIO_LAB.md). Freeze: Crew/social interno e conversa ficam deferred; external share próprio e subscription/value-first entram em seus consumidores existentes. GoalHierarchy inclui Balanced e a semana estável só muda sob necessidade/custo/menor intervenção. RIL/STIL e a proteção contra dupla contagem permanecem. UX continua nos objetos de Plano/Sessão/Progresso/Hoje; complexidade interna não obriga expor layers/agentes, painéis ou nova navegação. **Menos interface, mais decisão.**
