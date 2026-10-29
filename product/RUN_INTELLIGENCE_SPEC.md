# Run Intelligence Layer

<!-- EXPERIENCE_AUTHORITY_OVERLAY_START: EXP-AUTH-r1 -->
> **Domain authority retained · 2026-10-22 · EXP-AUTH-r1.** Full prescription/progression/programming/performance/recovery/analytics semantics and scientific/approval limits remain intact. [DR-93–97](PRODUCT_DECISION_REGISTER.md) / [index filter](../canon/CANONICAL_INDEX.md) retire only inherited presentation, placement and “existing objects/no new destinations” instructions as architecture requirements; anti-bloat and no invented capability remain. Isolation metadata is history after `32b7fb6`; no efficacy or implemented support follows. Designer entry: [derived context](DESIGNER_PRODUCT_CONTEXT.md).
<!-- EXPERIENCE_AUTHORITY_OVERLAY_END: EXP-AUTH-r1 -->

Revisão **RIL-1.1-r1** · 2026-10-19 · **CANDIDATE_IN_ISOLATION** · task FREEZE-20261019-r1 (baseline SIL).
Owner semântico: Run Intelligence sob Adaptive Engine. [SIS](SPORT_INTELLIGENCE_SPEC.md) define entradas/saídas/ownership, carga compartilhada e arbitragem; [AEC](ADAPTIVE_ENGINE_CONTRACT.md) controla comportamento; [AEOS](ADAPTIVE_ENGINE_OPERATIONAL_SPEC.md) controla avaliação. Aqui se especifica o núcleo decisório de corrida para implementação futura; não é planilha pronta, catálogo comercial ou receita fisiológica aprovada.

## 1. Pergunta decisória e estado

Qual estímulo de corrida preserva o objetivo do atleta hoje e no ciclo, dentro da experiência/exposição/cobertura, da agenda, das restrições e da coordenação com força? Corrida pode ser principal ou secundária; seu especialista precisa continuar competente em ambos os contextos. Não recebe automaticamente a sobra do treino de força nem prioridade secreta.

Consome `SpecialistRequest`: histórico comparável e cobertura; experiência/exposição recente; objetivos/eventos e prioridade confirmados; sessões executadas versus plano vigente; equipamento/ambiente conhecido; zona/baseline e origem; recovery/exposure refs compartilhadas; policy/receitas aprovadas. Ausência de GPS/FC/relógio não elimina caminho manual validado. Informação necessária ausente limita a decisão dependente; não presume pace, FCmáx, limiar ou data de prova.

Estado de programação/performance é projeção versionada do Athlete Model único. Refs de ciclo/semana/fase/receita não são segundo plano. O especialista retorna propostas ou insuficiência; somente Orchestrator publica o plano final.

## 1.1 Fundamentos decisórios e cadência

Run deve raciocinar explicitamente sobre especificidade; progressão de carga; volume, intensidade e frequência; distribuição de intensidade; recuperação; sessões-chave, long run e trabalho específico de prova; periodização e taper; aderência e individualização. São fundamentos para escolher/manter estímulo e interpretar resposta, não features, lista de opções ou fórmula universal. C057/SIS§1.1 exigem suporte em princípios de treinamento bem estabelecidos e prática consolidada, com evidência/aplicabilidade e limites rastreáveis; não prescrever por plausibilidade, LLM, novidade ou para demonstrar personalização. “AI applies training science; it does not replace training science.” Evidência fraca/conflitante reduz certeza/precisão e conserva decisões reversíveis cobertas, sem substituir abstensão por dose inventada.

AEC§1.3/AEOS§10.3 distinguem Continuous Learning de Exceptional In-Cycle Adaptation e Systematic Between-Cycle Progression. Após execução, atualizar o Athlete Model pertinente não muta plano; semana válida/adequada permanece, salvo fato material que exija reação. Entre semanas/ciclos é o lugar padrão para evolução significativa; progressão é earned por evidência comparável e não calendário. Programmed Variation exige propósito de treinamento/fase/especificidade/deload/taper, não ganho presumido; Reactive Adaptation exige inadequação material e menor intervenção. Estrutura variável já aceita é execução do plano, não nova mutação. Nenhum rótulo contorna HC/agency/necessity.

Consistência programada pode servir mensuração, habilidade, estímulo e especificidade; preservar quando útil. Repetição não é defeito automático, variação não demonstra inteligência e personalização não exige instabilidade. Interação com a outra modalidade usa concurrent training/TrainingDecisionBasis SIS§1.1, prioridade, demanda/recuperação e resposta individual, sem regras arbitrárias ou dupla fadiga. §9/G11 conserva prova futura, revisão humana desejável e claims responsáveis; não bloqueia Visual/UI.

## 2. Prescription engine

Traduz objetivo → fase do ciclo → intenção da sessão → estímulo essencial → estrutura → modalidade de controle/intensidade → completion/advance → alternativas elegíveis. Deve devolver `SessionIntent/SessionDemand` e payload de corrida com:

| Componente | Decisão / semântica |
|---|---|
| Propósito | Recuperação/easy, base, estímulo prolongado, limiar, intervalos, velocidade/economia, subida, progressivo, sessão específica, teste ou prova quando o catálogo aprovado cobrir. Nome não fixa dose nem transforma cada família em feature obrigatória de lançamento. |
| Estrutura | Fases ordenadas de aquecimento, trabalho, recuperação entre repetições/blocos e desaceleração quando cabíveis; steps e repeats finitos com número **total** de iterações explícito. Recuperação tem tipo, completion e alvo próprios. |
| Quantidade | Duração/distância por step e totais derivados, com unidade; prescrito versus estimado versus realizado. Volume de trabalho intenso separado de volume total e de pausas. |
| Intensidade | Métrica/faixa, unidade, construto e baseline/versão de referência; pace/velocidade, RPE ou FC conforme aplicabilidade, sem targets incompatíveis simultâneos. |
| Controle | Completion por tempo/distância/open; avanço manual/automático separado do alvo. Regra para step incompleto/skip/pausa, sem inventar classificação automática de falha. |
| Contexto | Terreno/inclinação/superfície, ambiente e limitações quando conhecidos e relevantes; não igualar pace de condições incomparáveis. Não exige nova coleta de localização. |
| Alternativas | Variantes aprovadas que preservam propósito sob agenda/equipamento/contexto; efeito de retirar aquecimento, mudar recuperação ou encurtar bloco explicitado, sem alteração silenciosa. |

Exemplo **apenas de forma**, sem prescrição: `aquecimento por duração → repeat N vezes [trabalho por distância em intensidade autorizada → recuperação por duração] → desaceleração`. Cada componente é instanciado somente por receita/policy aplicável. Um repeat não pode omitir se há recuperação após a última repetição: essa decisão pertence à receita e à representação. Totais derivados não são exigência de executar distância extra para “fechar” número estimado.

Aquecimento/cooldown não são campo decorativo: entram em disponibilidade, carga prevista e fidelidade de export. Sessão não é o rótulo “intervalado 8 km”. Se falta evidência para target específico, usar alternativa aprovada com outro construto ou abster-se, sem preencher com média da população.

## 3. Zonas, pace, RPE e FC

`RunIntensityReference` contém método/construto, fonte/avaliação, população/aplicabilidade, unidades/faixas, data/versão e limites de comparabilidade. Zonas derivam de referência autorizada e mantêm esse vínculo; números de zona não significam a mesma coisa entre métodos. FCmáx presumida por idade ou threshold genérico não são fallback automático.

- Pace e velocidade têm ordem de faixas inversa; alvo instantâneo e média do lap são distintos. Distância/tempo estimados a partir de um alvo não viram medição.
- RPE de sessão e RPE de um intervalo têm momento/âncoras próprios. Dor não é esforço. Avaliar se o controle subjetivo pode sustentar a intenção dentro da cobertura, sem exigir sensor para validar esforço declarado.
- FC é observação com fonte/protocolo/limitações. Atraso de resposta, ambiente e comparabilidade são tratados por policy, sem perseguir alvo cardiovascular incompatível com o propósito do intervalo.
- Se pace, RPE e FC discordam materialmente, conservar evidências e usar precedência da receita/policy aprovada; não fazer média. Sem precedência sustentada, marcar conflito e pedir contexto/reter dependente.
- Atualização de baseline cria nova revisão e só altera propostas futuras sob validade/agência. Histórico conserva alvo e método usados; mudança de zona não reescreve aderência passada.

Qual target é primário, quais são limites secundários e qual fonte tem suficiência são decisões G02. Targets podem ser omitidos quando a receita validada o permitir; campo obrigatório não justifica precisão inventada.

## 4. Progression engine

Avalia elegibilidade de progressão por tarefa comparável, contexto, exposição recente conhecida e objetivo/fase. Não aumenta tudo de uma vez ou reage ao último treino isolado. Deve comparar e declarar efeito sobre:

| Eixo | Decisão exigida |
|---|---|
| Volume e frequência | Duração/distância semanal e por sessão, frequência, tamanho/contribuição do longão, exposição conhecida e distribuição. Sem percentual semanal universal ou reposição automática de treino perdido. |
| Intensidade | Target/tempo no estímulo, número e duração/distância de repetições; preservar construto e estímulo. Pace melhor isolado não prova prontidão para novo bloco. |
| Densidade | Relação trabalho/recuperação, descanso e agrupamento dos blocos; menor pausa pode aumentar demanda mesmo sem mais km. Alteração exige receita/limites aprovados. |
| Especificidade | Terreno, duração do estímulo, exposição à demanda-alvo e complexidade; não equiparar mudança de ambiente a ganho/perda de capacidade. |
| Manter/reduzir/rebasear | Distinguir estímulo conquistado, tolerância aparente, perda de comparabilidade, pausa, retirada deliberada e evidência insuficiente. Não exigir progressão em toda sessão/semana. |

Antes de propor avanço: verificar qual alvo estava vigente, o que foi executado, comparabilidade, recuperação/restrições e impacto no horizonte Run × Strength. Esforço e distribuição da sessão contam para interpretação; resultado “completo” não prova adequação da próxima progressão. Performance aquém pode motivar investigação/adaptação sob regra, sem atribuir causa única a força, sono ou motivação.

Usar `ProgressionAssessment` SIS §6. Corrida encurtada deliberadamente pelo Orchestrator não é tentativa frustrada do volume anterior e não conquista automaticamente esse volume. Dado tardio pode revisar futura oportunidade, preservando decisão emitida e versão executada. Resultado de prova/teste só atualiza referência se protocolo/aplicabilidade/comparabilidade forem aceitos.

## 5. Programming / periodization

`RunProgramState` referencia objetivo/evento, cobertura, fase/mesociclo/microciclo, exposição prevista/observada, sessões-chave, estímulos essenciais, critérios de transição e revisões do plano integrado. As fases conceituais base → desenvolvimento → específica → taper → prova → recuperação são repertório possível, sem calendário fixo ou obrigação para objetivo sem prova.

O especialista deve justificar distribuição de estímulos/frequência, alternância de demandas e relação entre sessões-chave/longão/trabalho fácil conforme perfil e policy. Periodização não é alternar nomes de treino. Calendário de prova-alvo exige data/distância/objetivo, prioridade relativa de múltiplos eventos e trade-offs confirmados; sem isso, ASK do mínimo decisivo. Nenhuma prova ou performance prevista é garantida.

Taper reduz/redistribui demanda para evento-alvo quando coberto, com propósito/retensão de estímulo e interação com força explicitados. Deload administra demanda acumulada/necessidade de recuperação dentro do ciclo; descanso e HOLD têm significados distintos. Nenhuma semana fixa de descarga, porcentagem, “80/20” obrigatório ou regra universal de taper é criada aqui.

Prova movida/cancelada, interrupção ou disponibilidade alterada provoca revisão do horizonte e da fase sob regra; não comprime automaticamente semanas perdidas ou repõe longões. Eventos secundários e testes não recebem a mesma prioridade de um alvo principal por terem data. Força próxima do evento entra como proposta ao Orchestrator, que valida efeito com Strength Intelligence; Run não cancela unilateralmente a outra modalidade.

**Dias de corrida e longão (DR-112).** Os dias e o turno das corridas são os escolhidos pela pessoa, e o longão cai no dia que ela escolheu entre eles; a progressão do longão segue a política de corrida vigente. Mais dias espalham a carga semanal, não a aumentam. Vizinhança com força é tratada pelo conteúdo, não movendo dias (SIS §5).

## 6. Performance model

`RunPerformanceAssessment`: referências de tarefas/testes/provas e versões de alvo; distância/duração, resultado/pace, estrutura cumprida, esforço/FC quando válidos, condições conhecidas, cobertura/frescor, comparabilidade, método e incerteza. Tendência pode ser `IMPROVING/STABLE/DECLINING/INDETERMINATE` somente sob regra aprovada; faltando regra, preservar fatos e indeterminado.

Modelo deve distinguir velocidade/duração sustentadas em esforço e contexto comparáveis, tolerância à estrutura/densidade e evidência para referência de intensidade. Não inferir VO2max, limiar, lesão, fadiga central ou tempo exato de prova sem modelo validado para esse construto. Estimativa, medição e meta são classes separadas; previsão sem suporte é omitida. Sensores mais ricos não dão certeza adicional automática.

Uso primário de histórico pertinente à próxima decisão segue I10; aprendizado adicional/hipóteses longitudinais secundários exigem opt-in e lineage conforme AEOS §15. Este spec não autoriza dados ou ML novos.

## 7. Recovery / load model

Interpreta projeção compartilhada SIS §5: exposição de corrida total e por demanda/estrutura, estímulo intenso, longão, novidade/terreno quando conhecidos e demanda local/sistêmica sustentada; cruza exposição de força por referências, sem criar carga adicional. Preserva dose externa, percepção interna e sinais de recuperação como construtos diferentes.

Sinal local/limitação funcional pode restringir estímulo mesmo com HRV favorável. Sessão incompleta não prova fadiga; proximidade de heavy lower não prova interferência causal. Recovery não é cronômetro muscular universal. Especialista relata limites de viabilidade das alternativas; Orchestrator escolhe sob policy/prioridade, sem compensação automática por “corrida perdida”.

## 8. Analytics que alimentam decisões

Analytics são projeções dos mesmos fatos/receitas/revisões: volume/frequência e distribuição de intensidade quando classificável; exposição do longão e das sessões-chave; desempenho em tarefa comparável; tendência de referência; aderência/partial/unknown; progressão versus retirada deliberada e contexto de interferência. Devem informar manter/revisar target, estrutura ou fase, com explicação simples no objeto existente.

Critério de aderência compara revisão realmente vigente/executada, incluindo intervalos, parciais e pausas; tolerâncias dependem G03. Concluir sessão, atingir estímulo e melhorar performance são conclusões diferentes. Mais km/pace rápido não significam mais mérito ou aderência melhor. Ausência de sync nunca prova não realização. Não criar dashboard, ranking social, novos destinos ou exposição de layers para demonstrar profundidade.

## 9. Critérios para futura implementação

G01/G02 devem fornecer receitas/cobertura e casos por perfil/objetivo/fase, métodos de intensidade/performance, regras de progressão e materialidade/spacing. G03 fornece aderência e comparabilidade; G04 restrições/retorno; G09 prova contratos/versões; G11 prova claims de paridade/efeito. São detalhamentos dos gaps existentes, sem inventar nova etapa ou delegar de volta ao Claude pesquisa genérica.

Verificar no Scenario Lab: interpretação de repeats/recuperação/targets; volume versus intensidade versus densidade; mudança de referência sem reescrever passado; taper versus deload; prioridade de prova; redução deliberada versus tentativa abaixo do alvo; dado ausente; Run principal e Run secundário com profundidade própria; efeitos em Strength e validade conjunta. Cenários profissionais futuros testam qualidade da prescrição; sintéticos só testam contrato.
