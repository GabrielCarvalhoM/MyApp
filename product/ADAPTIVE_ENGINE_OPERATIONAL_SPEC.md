# Adaptive Engine Operational Specification

Revisão **AEOS-1.0-r2** · 2026-10-15 · Missão **VF-AEOS-20261015-001**.
Estado: **SPECIFICATION**; gates documentais e publicação no registro da missão. Autoria: `/root`, sob coordenação do Chief. Publicação/pareceres por hash no [registro da missão](../audits/adaptive-engine-2026-10-15/MISSION_RECORD.md). Nenhum gate de execução, segurança clínica, eficácia ou release é emitido aqui.

## 1. Autoridade, finalidade e leitura

Este é o detalhamento operacional downstream do [AEC-1.1](ADAPTIVE_ENGINE_CONTRACT.md), sem substituir sua autoridade comportamental. [Canon 3.0.0](../canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md), [índice CI-3.0.1](../canon/CANONICAL_INDEX.md), [RS-1.1](V1_RELEASE_SCOPE.md), [PDM-1.1](PRODUCT_DOMAIN_MODEL.md), [PA-1.1](PRODUCT_ARCHITECTURE.md), [EM-1.1](EXPERIENCE_MODEL.md), [CF-1.1](CORE_FLOWS.md) e o pacote VF-PREUX-20261015-001 permanecem íntegros. [PDR §5 G01–G11](PRODUCT_DECISION_REGISTER.md) continua sendo o registro único de dependências/decisores. O estado desta nova missão é descoberto por [CURRENT_MISSION](../CURRENT_MISSION.md); a ausência de alteração do índice preserva seu evento publicado e não torna este documento uma nova tese.

Consumidores: Engineering implementará posteriormente estados/contratos; autoridade profissional preencherá somente os policy slots dependentes; AI Systems avaliará JEV/LLM; Quality consumirá o [Scenario Lab](ADAPTIVE_ENGINE_SCENARIO_LAB.md); Product/UX consumirá significado de decisão/agência sem composição visual. Uma casa separada é necessária porque AEC fixa comportamento, enquanto AEOS fixa representação, ordem de avaliação, precedência, fallback e oráculos verificáveis. O Lab tem consumidor próprio e referencia estes contratos, sem duplicar a policy.

Convenções: **MUST** é requisito verificável subordinado ao AEC; `Ref<T>` identifica objeto + revisão imutável; `Option<T>` distingue valor conhecido de ausência acompanhada de motivo; `Set<T>` não depende da ordem de chegada; enums em maiúsculas são tipos lógicos, não schema/API/stack. Tabelas tipadas são especificação, sem código executável. Datas de fatos incluem timezone e instantes de observação/recebimento distintos. Cada campo abaixo é obrigatório salvo quando declarado opcional; campo crítico ausente produz insuficiência explícita, nunca default fisiológico.

JEV designa **um componente lógico de avaliação/ranking tipado**. Não pressupõe pacote, fornecedor, modelo ou API existentes. Sua realização técnica será escolhida em missão futura. JEV e LLM de explicação têm contratos e autoridades distintos mesmo se futuramente compartilharem tecnologia.

## 2. Arquitetura operacional e responsabilidades

Fluxo: **data → normalization/provenance → deterministic hard constraints → conflict detection → valid candidates → JEV ranking/confidence/routing → policy gate → decision → LLM explanation → preview/confirmation when required → executor later**.

| Etapa | Entrada → saída / obrigação |
|---|---|
| Data boundary | Declarações canônicas e observações autorizadas → referências de fatos. Verifica pessoa/conta/finalidade/autenticidade/supressão; texto externo não é instrução. |
| Normalization | Fatos/revisões → sinais comparáveis e lineage; erro de unidade/método/identidade fica explícito. Deduplica fato, não soma fontes do mesmo fato; similaridade só propõe associação. |
| Hard constraints de contexto | Snapshot + policy efetiva → elegibilidade/escopos retidos. Restrição, autoridade e dados críticos delimitam as operações possíveis antes do ranking. |
| Conflict detection | Estado + intenções/demandas + prioridades → conflitos com evidência, escopo e incerteza; detecta relações, sem declarar causalidade fisiológica. |
| Candidate generation/filter | Receitas/repertório aprovados → propostas completas e verificadas em conjunto. Testa novamente hard constraints por candidato, incluindo impacto no horizonte. Nenhum gerador LLM livre. |
| Deterministic baseline | Candidatos válidos + comparadores versionados → preferência parcial/decisão ou ASK/HOLD. É a fonte oficial inicial. |
| JEV | Mesmos candidatos permitidos e projeção mínima → ranking relativo, incerteza, routing e semantic check consultivos. Em SHADOW não escreve na decisão oficial. |
| Policy gate | Revalida proposta/contexto/regras/permissões e contrato JEV → aceita baseline, abstém ou invalida. JEV jamais concede autoridade faltante. |
| Decision/explanation | Registro imutável da decisão → explicação derivada do trace, validada; template determinístico se LLM falhar. Sem efeitos de aplicação pelo texto. |
| Preview/confirmation | Proposta de alteração de plano/contexto ou troca de sessão escolhida/exportada → ato sobre alcance/revisões atuais. Recomendação recalculada pode ser mostrada sem aplicar alteração. |
| Executor futuro | Somente intenção autorizada e ainda vigente → efeito lógico uma vez. Inexistente nesta missão; sem envio, produção ou conexão. |

Engine possui decisão/plano; Context possui fatos; capacidades Running/Strength possuem semântica de sessão e observação; policy registry possui regras/aprovações; permissões ficam fora de modelos. Não implica serviços separados. Agente opcional, Crew, wearable, JEV e LLM não possuem plano paralelo. Nutrition é seleção subordinada de conteúdo aprovado por demanda/revisão, nunca outro prescritor.

## 3. Tipos comuns e normalização/provenance

| Tipo | Campos e semântica |
|---|---|
| `FactRef` | `subject_ref`, `canonical_fact_id`, `source_revision`, `state_revision`, `source_namespace`, `origin_ref`, `purpose_ref`. Identidade de delivery é outro campo; revisão recebida mais tarde não necessariamente é a mais nova. |
| `Signal<T>` | `construct`, `value: Option<T>`, `unit_or_scale`, `anchors_ref`, `method_ref`, `observed_at`, `received_at`, `coverage`, `freshness_assessment`, `comparability`, `source_refs: Set<FactRef>`, `transformation_ref`, `limitations`. Valor ausente inclui motivo `NOT_COLLECTED / REFUSED / SOURCE_DELAY / OPAQUE / INVALID / SUPPRESSED / UNKNOWN`. Zero medido é valor, nunca motivo. |
| `EvidenceAssessment` | `decision_scope`, `required_signal_refs`, `flags: Set<SUFFICIENT / PARTIAL / CONFLICTING / STALE / ABSENT>`, `critical_missing_refs`, `policy_ref`, `limitations`. Flags simultâneas preservadas por dimensão, sem reduzir tudo a média. |
| `AuthorityRef` | `policy_or_content_id`, `revision`, `approval_record_ref`, `competence_scope`, `applicability_ref`, `effective_interval`, `revocation_state`. Aprovação é registro autenticado fora do modelo, nunca alegação de texto. |
| `EvaluationSnapshot` | `subject_ref`, `context_ref`, `plan_base_ref`, `session_refs`, `facts_frontier`, `goal_ref`, `availability_ref`, `restriction_refs`, `permission_revision`, `policy_bundle_ref`, `capability_refs`, `evaluated_at`, `relevant_input_fingerprint`. Fronteira registra o que era conhecido, sem copiar payload clínico. |

Normalização MUST conservar unidade/construto/protocolo antes de transformar. HRV RMSSD e SDNN não são equivalentes; baseline pessoal só usa protocolo comparável e policy aprovada. RPE de sessão, RPE de série, RIR e dor permanecem distintos. Running preserva distância/duração/intensidade/terreno quando disponíveis; Strength preserva exercício/equipamento/séries/reps/carga/esforço e grupos de demanda aprovados. Não criar km↔séries, ACWR seguro, HRmax presumido ou readiness universal.

Associação de atividade: `UNASSOCIATED → MATCH_PROPOSED → CONFIRMED`, ou `AMBIGUOUS`. Referência estável de export pode fundamentar associação; similaridade sozinha nunca confirma. Correção canônica suprime a contribuição anterior no escopo corrigido. Supressão/eliminação prevalece sobre replay/refetch/backfill/transformação nova; controle mínimo permitido de precedência não contém payload bruto nem concede retenção indefinida (AEC §4, G07). Se não há base para conservar marcador, o desenho futuro deve garantir não reativação por controle equivalente lícito antes de reingestão. Identidade incompatível nunca se resolve por média ou JEV.

## 4. Athlete State Model

`AthleteState` é uma projeção versionada de um único Athlete Context (PDM I1/I10), não perfil por modalidade, score de saúde ou novo prontuário.

| Componente tipado | Conteúdo / uso |
|---|---|
| `identity_scope` | Pessoa pseudonimizada no processamento, modo M1/M2, 18+ e elegibilidade de cobertura por authority refs. M3 não ganha avaliação fisiológica por participar da Crew. |
| `practice_context` | Experiência declarada por modalidade, equipamento, disponibilidade e timezone, restrições voluntárias pertinentes, cobertura recente conhecida/desconhecida. |
| `goal_state: Ref<GoalPriorityModel>` | Prioridades explícitas, eventos e trade-offs autorizados; desconhecido não vira runner-first por default. |
| `planned_exposure` | Sessões futuras por modalidade/intenção/revisão, janela e dependências. |
| `observed_exposure` | Real reconciliado por modalidade e região/tarefa quando policy sustentar, parcial/não planejado/abaixo-igual-acima ou `UNCLASSIFIED`; carga desconhecida não vira zero. |
| `local_state` | Relato confirmado de região/limitação funcional, fadiga local e dor como construtos separados com privacy refs. Não diagnostica tecido, causa ou fadiga central. |
| `systemic_context` | Sono/fadiga/stress/HR/HRV e percepção de recuperação, cada qual como `Signal`; nenhum wearable obrigatório. |
| `performance_trend` | Tarefas comparáveis, esforço/contexto e cobertura com regra de classificação; `DECLINING/STABLE/IMPROVING/INDETERMINATE` apenas sob policy. Sem regra, preservar observações e indeterminado. |
| `continuity_state` | `ACTIVE / NO_DATA / INTERRUPTED_DECLARED / RETURNING`; interrupção encerra prescrição ativa, retorno usa contexto atual. Social não determina este estado. |
| `holds_and_restrictions` | Holds escopados ativos, autoridade/condições de saída e histórico por referência. Score favorável não os limpa. |
| `integration_state` | Cobertura/frescor da ingestão, erro/lag/unknown e evidências de export/sistema/device separadas do estado do atleta. |
| `evidence_and_purpose` | Avaliações por decisão, permissões/finalidades e lineage de todos os derivados, incluindo distinção primário versus I10 secundário. |

Atualiza somente consequências dependentes de fato novo/revisão/correção. Mantém snapshot anterior e decisão como eram conhecidos. Estado não pode inferir abandono, ingestão Nutrition, doença ou adesão social. Recusa de detalhe íntimo permite limitação escopada sem exigir diagnóstico para continuar registro/direitos.

## 5. Session Intent & Demand Model

| Tipo | Campos |
|---|---|
| `SessionIntent` | `session_ref`, `sport: RUNNING / STRENGTH`, `purpose_ref`, `goal_links`, `essential_stimulus_ref`, `criticality: HIGH / LOW / UNASSESSED` com origem/regra, `flexibility`, `planned_window`, `equipment_refs`, `approved_recipe_ref`, `status`, `chosen_revision_ref`, `executing_revision_ref: Option<Ref>`. |
| `SessionDemand` | `session_ref`, `planned_or_observed`, `sport_specific_payload_ref`, `demand_dimensions`, `local_exposure_refs`, `novelty_assessment`, `intensity_construct`, `volume_construct`, `recovery_interactions`, `comparability`, `uncertainty`, `policy_refs`. Dimensões são categorias/valores com unidades e origem; desconhecido é permitido. |
| `DemandRelation` | `source_session_ref`, `target_session_ref`, `relation: TEMPORAL / SHARED_LOCAL_DEMAND / GOAL_COMPETITION / LOGISTICAL / PREPARATION_DEPENDENCY`, `window_ref`, `evidence_refs`, `rule_ref`, `confidence_limits`. Uma relação não prova dano, interferência causal ou intervalo universal. |

Running pode ter propósito de sessão-chave, longão ou easy somente quando catálogo aprovado o define. Strength mantém propósito e estrutura real; “heavy lower” é rótulo derivado por regra/repertório aprovado, não percentual de 1RM inventado. Demanda realizada abaixo/igual/acima depende de critério G03 e comparabilidade, sem concluir fadiga automaticamente. Sessão-chave crítica tem valor contextual, nunca supera safety ou substitui prioridade declarada.

Toda mudança preserva ou declara perda do estímulo essencial e efeito futuro nas duas modalidades. Outra modalidade ingerida fica `EXTERNAL_CONTEXT` com limites, fora do gerador prescritivo. Sessão iniciada fixa revisão executada; alteração do restante gera proposta/revisão/aceite próprios, sem reescrever séries/intervalos feitos. Modelo neutro e preflight de export são integralmente os do AEC §5.2; AEOS não redefine workout ou escolhe provider.

## 6. Goal Priority Model

`GoalPriorityModel`: `goal_set_ref`, objetivos Running/Strength declarados com tipo e janela/evento, `primary_goal_ref: Option`, `secondary_goal_refs`, `priority_source: USER_CONFIRMED`, `effective_window`, `acceptable_tradeoff_refs`, `nonnegotiable_user_constraints`, `revision`, `unknowns`.

Regras operacionais:

1. Safety/aplicabilidade/autoridade têm precedência sobre objetivo e sessão-chave. First-class exige profundidade de ambos, sem dose igual.
2. Prioridade afeta seleção entre opções permitidas na mesma janela; não rebaixa modalidade a tracker. Não existe prioridade secreta por engagement, Crew, fornecedor ou baseline do produto.
3. Se candidatos fazem sacrifícios distintos e a prioridade/trade-off decisivo falta, `ASK` pergunta o mínimo. Recusa/desconhecido conserva limite; não inventa ordem. Se o que falta é autoridade profissional, `HOLD/PROFESSIONAL_REVIEW`, sem pedir ao usuário para suprir aprovação.
4. Alterar objetivo/prioridade exige edição confirmada sobre revisão atual. JEV pode apontar ambiguidade, nunca alterar goal refs. Evento com data incerta é incerto, sem calendário presumido.
5. Comparação runner-first versus strength-first conserva todos os fatos e candidatos salvo elegibilidade dependente da prioridade. Trace MUST identificar exatamente o goal ref alterado e qual trade-off mudou; não obriga decisão diferente quando safety ou dominância tornam o resultado igual.

## 7. Conflict Taxonomy

`ConflictRecord`: `conflict_id`, `class`, `scope_refs`, `fact_and_session_refs`, `rule_ref`, `status: DETECTED / AMBIGUOUS / RESOLVED / RETAINED`, `evidence_limits`, `materiality_for_decision`, `resolution_route`. Severidade de safety é rule-bound, nunca inventada pelo ranking.

| ID / classe | Detecção operacional / resolução permitida |
|---|---|
| C01 Cross-domain demand | Relação de demanda local/temporal entre Running e Strength sob regra aplicável; comparar agendas/intenções e candidatos válidos. Proximidade sozinha não cancela sessão. |
| C02 Goal/criticality trade-off | Opções preservam propósitos/objetivos diferentes ou sessão-chave não flexível; usar prioridade/trade-off confirmado ou ASK. |
| C03 Recovery/performance convergence | Sono/fadiga/performance comparáveis convergem ou divergem por policy; múltiplos sinais não geram fórmula universal. Poor sleep isolado não determina redução automática. |
| C04 Safety/restriction/applicability | Limitação funcional/restrição/red flag ou público fora de cobertura; gate determinístico e HOLD afetado/owner competente. HRV boa não anula. |
| C05 Availability/equipment | Janela/equipamento necessários incompatíveis; MOVE/SUBSTITUTE apenas repertório/janela aprovados, senão ASK/HOLD dependente. |
| C06 Observation mismatch | Planejado versus parcial/não planejado/abaixo-igual-acima com G03; readaptar futuro, sem compensar débito ou premiar excesso. |
| C07 Missing/late/conflicting source | Ausência de sync, unidade/método/identidade ou fontes conflitantes; reconciliar/pedir fato mínimo. Garmin atrasado não significa treino perdido. |
| C08 Version/override/stability | Contexto/objetivo/override mudou, proposta antiga ou repetição; invalidar/reevaluar, impedir mutação repetida e flip-flop sem fato material. |
| C09 Preparation/export mismatch | Insight/export ligado a revisão obsoleta, perda de representação, transport unknown ou prova insuficiente; invalidar pendentes e conservar cópia remota como evidência real, sem declarar pronta. |
| C10 Interruption/return | Pausa declarada/retorno versus horizonte antigo; rebasear contexto e restrições, sem repor carga. |
| C11 Authority/purpose/policy gap | Regra/aprovação/finalidade/capability faltante, expirada ou revogada; reter somente efeitos dependentes e indicar owner, nunca inventar substituto “conservador”. |

Conflitos coexistem; C04/C11 podem excluir opções antes do ranking. Detector retorna evidência ou ambiguidade, não obrigação de adaptar. Ausência de conflito detectado não é certificado de segurança. C09 de transporte por si só não é HOLD clínico.

## 8. Candidate Adaptation Model

`CandidateSet` é fechado por avaliação e fingerprint: todos os membros têm IDs estáveis, hash de conteúdo, snapshot/policy/candidate-generator revision e resultado determinístico de validação. O JEV recebe somente a projeção dos membros `VALID`. Lista rejeitada fica no trace interno, sem expor payload proibido ao modelo.

| `AdaptationCandidate` | Semântica obrigatória |
|---|---|
| `candidate_id`, `candidate_hash`, `evaluation_ref` | Identidade local estável e vínculo exclusivo ao conjunto/snapshot. Não reutilizar ID com conteúdo diferente. |
| `action_class` | `KEEP / MOVE / REORDER / REDUCE_VOLUME / REDUCE_INTENSITY / SUBSTITUTE / RECOVER / REST / REPLAN / RETURN`. `RECONCILE`, `ASK` e `HOLD` são rotas de controle, não prescrição substituta. |
| `base_refs`, `proposed_revision_refs`, `change_set` | Plano/sessões/revisões base e propostas exatas. Cada alteração indica objeto/campo/antes/depois por referência, unidades e regra. Proposta não é plano já aplicado. |
| `recipe_and_authority_refs` | Receita/repertório/policy/evidence IDs e aprovação/aplicabilidade. Nenhuma dose, treino ou progressão gerados sem essa fonte. |
| `preconditions`, `validity_conditions` | Dados/finalidades/janelas/restrições necessários e eventos que invalidam proposta. Sem TTL fisiológico universal. |
| `intent_effects` | Propósito/estímulo por sessão e objetivo: `PRESERVED / MODIFIED_WITHIN_APPROVED_INTENT / LOST_WITH_ACCEPTED_TRADEOFF / UNKNOWN`, com justificativa rule-bound. |
| `horizon_impact` | Todas as sessões que mudam ou devem ser reavaliadas, efeitos cruzados, agenda, Nutrition e exports; distinguir pendentes invalidáveis e cópias remotas já entregues. |
| `burden_features` | Mudanças em sessão escolhida/iniciada/exportada, quantidade de objetos afetados e preferência declarada de agenda; valores observáveis, sem supor adesão/engagement. |
| `eligibility_proof` | Resultado por HC, versões/fatos usados, `VALID / REJECTED / UNRESOLVED`; unresolved nunca entra como permitido. |
| `confirmation_scope` | `NONE_FOR_READ_ONLY_RECOMMENDATION / APPLY_PLAN_CHANGE / CHANGE_REMAINING_EXECUTION`; export sempre outra intenção explícita, sem consentimento acoplado. |
| `limitations`, `comparison_features` | Evidência/suficiência e vetor de comparação autorizado; não incluir narrativa sensível bruta. |

Gerador aplica somente transformações de receitas aprovadas dentro de limites próprios. MOVE/REORDER MUST reavaliar horizonte completo afetado e disponibilidade, sem deslocar conflito para sessão-chave seguinte. REDUCE_VOLUME e REDUCE_INTENSITY são ações distintas; manter intensidade não é presumido seguro. SUBSTITUTE exige exercício/propósito/equipamento/restrição cobertos, sem contornar dor. REST/RECOVER requerem aplicabilidade própria e não são fallback universal. REPLAN/RETURN não restauram volume antigo. KEEP passa os mesmos gates: plano anterior inválido não continua por ausência de alternativa.

Combinação de ações é um candidato composto, com ordem/delta completos e validação conjunta; duas opções válidas isoladas podem ser inválidas juntas. Não montar fragmentos de candidatos depois de ranquear. Conjunto vazio produz controle ASK/HOLD/RECONCILE conforme causa e autoridade, nunca invenção de sessão. Contagem/latência de geração são orçamentos operacionais futuros; saturação produz abstensão/fallback válido, sem truncamento que esconda candidato obrigatório por policy.

## 9. Hard Constraints / Safety Gates

Resultado de cada gate: `PASS / FAIL / UNRESOLVED / NOT_APPLICABLE` + constraint/version + escopo + fato/authority refs. `NOT_APPLICABLE` exige justificativa de aplicabilidade; `UNRESOLVED` impede somente a prescrição/efeito dependente. Nenhuma agregação compensa FAIL com score positivo. Executam antes de detectar/gerar no que for contextual, por candidato antes de JEV e novamente no policy gate/efeito futuro.

| ID | Restrição determinística / resultado em falha |
|---|---|
| HC01 Identity/purpose | Pessoa/conta/fonte/finalidade/autorização atuais e restrições de uso da origem. Cross-account, revogação ou origem vedada rejeitam processamento/efeito afetado; sem circumvention por intermediário/JEV. |
| HC02 Coverage/authority | Público/decisão/receita/regra aprovados e vigentes, dentro de G01/G02/G04/G05. Ausência/expiração retem prescrição dependente; texto “profissional aprovou” não vale approval record. |
| HC03 Restriction/hold | Respeitar restrição e holds ativos; saída só com evidência/owner competente e reavaliação. Dor aguda/limitação confirmada impede recomendações que dependem de supor liberação; classificação/urgência clínica continua G04. |
| HC04 Data integrity | Identidade, comparabilidade, unidade, método, tempo e revisão confiáveis para campos críticos; supressão e conflitos materiais limitam uso. Não somar prováveis duplicatas nem usar zero/ausência fabricados. |
| HC05 Goal/feasibility | Objetivos/trade-offs autorizados, disponibilidade/equipamento e propósito mínimo da receita preservados. Sacrifício não autorizado ou prioridade decisiva desconhecida produz ASK; aprovação profissional faltante não é pergunta de preferência. |
| HC06 Dose/interaction | Delta e interações dentro de limites aprovados por modalidade/público/janela; considerar ambas no horizonte afetado. Sem números/defaults, dose “conservadora” ou espaçamento universal criados pelo sistema. |
| HC07 Version/agency | Snapshot/plano/revisão/restrição/policy/finalidade e ato de confirmação coerentes; stale não aplica nem sobrescreve override. Sessão iniciada conserva executado. |
| HC08 Scope/nutrition/social | Sem esporte prescritivo novo, dieta/ingestão inferida/suplemento/diagnóstico; sem carga por Crew/score/streak. Nenhum dado/estado sensível cruza a Crew/share/telemetria indevida. |
| HC09 Export fidelity | Capacidade/acesso/permissão e preflight sem perda material; prova no nível correto. Envio não é device-ready/execução. Confirmação não libera representação incompatível ou retry cego. |
| HC10 Stability/idempotency | Mesmo input relevante/policy/plano-base não reaplica; oscilação sem fato material mantém proposta válida já existente. Safety nova sempre vence estabilidade. |

`HoldRecord`: `hold_id`, `cause_class` do AEC §7.1, `affected_scopes`, `private_evidence_refs`, `context_policy_refs`, `resolution_owner`, `next_step_ref`, `exit_evidence_requirements`, `state: ACTIVE / REVIEW_PENDING / REEVALUATION_REQUIRED / RELEASED / SUPERSEDED`, `supersession_ref`. Correção de erro factual pode remover causa incorreta após validação; restrição profissional requer autoridade pertinente. `RELEASED` exige registro de evidência aceito + reavaliação de todos os gates dependentes; não por score/tempo/silêncio/override/consentimento de risco. Outputs antigos afetados deixam de ser utilizáveis; histórico/registro/correção/direitos/funções independentes continuam. Não se promete recall remoto.

## 10. Decision Policy / Multi-objective Ranking

`PolicyBundle` reúne revisões imutáveis: coverage, receitas/transformações, gates, interpretação de sinais/aderência, comparator, stability, routing, Nutrition-content eligibility e explicação aprovada. Cada módulo declara aplicabilidade, dependências, autoridade, evidências, vigência/revogação e casos aceitos/rejeitados. Módulo ausente não é rule default. Composição/versionamento não exige registry/service novo.

**Baseline determinístico B0**, oficial na primeira implementação:

1. Se interrompido/restrição/autoridade/dado crítico impede escopo, produzir controle correspondente com próximo passo; avaliar apenas partes independentes válidas.
2. Gerar/filtrar candidatos, conservando rejeições por HC no trace. Se não há candidato válido, escolher ASK para fato/preferência que a pessoa pode fornecer; RECONCILE para integridade/associação; HOLD com owner para autoridade/safety. São escopos compatíveis, não uma ordem que deixa perguntar repetidamente em lugar de reter risco conhecido.
3. Comparar somente opções válidas e comparáveis usando a ordem abaixo. O comparator é parcial: `BETTER / WORSE / EQUAL / INCOMPARABLE`, com razões. Unknown não é pior score ou empate inventado.
4. Selecionar o máximo único quando sustentado. Se há equivalentes **semanticamente iguais em efeitos/limites** e sem preferência material faltante, reutilizar a proposta vigente válida; na primeira avaliação, desempatar pela identidade canônica do candidato para reprodutibilidade, registrando a equivalência. ID jamais decide sacrifício material entre opções diferentes.
5. Se não existe máximo único por trade-off material/unknown, ASK mínimo ou HOLD/review conforme a lacuna. Nenhum weighted sum implícito força desempate.

| Ordem de comparação B0 | Regra exata / dependência |
|---|---|
| B1 Preservação do objetivo primário | Comparar efeito no objetivo confirmado: `PRESERVED` precede `MODIFIED_WITHIN_APPROVED_INTENT`, que precede perda explicitamente aceita. Classificação depende de receita/policy; UNKNOWN não é ordenável. Sem prioridade decisiva, ASK. |
| B2 Estímulo essencial / criticality | Dentro de B1 equivalente, preservar estímulos de sessões-chave de alta criticality sustentada; considerar dependências de próximas sessões. Alta vs baixa não contorna restrição nem escolhe prioridade secreta. Se a hierarquia entre estímulos é material e não aprovada, ASK/review. |
| B3 Objetivos secundários | Dentro de B1/B2 equivalentes, preferir preservação secundária admitida, sem exceder trade-off autorizado; vários secundários sem ordem usam dominância de Pareto, e trade-off não resolvido é incomparable. |
| B4 Evidência para a comparação | Preferir efeitos sustentados sem dependência crítica desconhecida; não tratar score JEV/HRV favorável como safety. Quando incerteza impede B1–B3, não pular para B5. |
| B5 Menor ruptura necessária | Entre opções até aqui equivalentes, preferir não trocar sessão em execução/escolhida/exportada e preservar preferência de agenda declarada; depois menor conjunto de objetos alterados. Se esses custos conflitam sem preferência aprovada, incomparable, sem pesos fabricados. |
| B6 Estabilidade | Reutilizar candidato/proposta vigente ainda válida e sem desvantagem material; ver §14. Não estabilizar opção proibida ou ignorar fato novo. |

Predições fisiológicas contrafactuais só entram como estimativa com policy/evidência/limites aprovados. Hoje o vetor usa efeitos previstos pela receita e logística; não estima lesão, adaptação muscular ou tempo de prova com precisão fabricada. Nenhum valor numérico/peso/calibração é inventado. Comparador e classificação fisiológica podem evoluir somente por revisão/eval correspondente, sem mudar os invariantes.

`DecisionOutcome` é uma união discriminada: `RECOMMEND(candidate_ref) / ASK(question_refs, blocked_scopes) / HOLD(hold_refs) / RECONCILE(issue_refs)`, com `independent_scope_outcomes` quando escopos distintos convivem. KEEP é uma recomendação validada. ASK não reinicia bateria diária; cada pergunta tem informação material, opções desconhecido/recusa e efeito esperado, sem prometer liberação de hold. RECONCILE não inventa associação. Controle não se transforma em prescrição pelo LLM.

## 11. Confidence Model

Confiança é **por decisão/comparação/escopo**, separada de safety e aplicabilidade; não é saúde, probabilidade de sucesso fisiológico ou permissão de execução.

| Dimensão | Avaliação / uso |
|---|---|
| Observação | Integridade/associação/cobertura/frescor/protocolo comparável; fonte rica não resolve propósito ausente. |
| Aplicabilidade da regra | Coverage/população/receita/policy e autoridade válidas, ou UNKNOWN/HOLD; não compensável por sinais bons. |
| Efeitos/candidato | Limites sustentados e efeitos no objetivo/horizonte classificados; incerteza material impede comparação correspondente. |
| Ranking | Evidência para preferir uma opção entre as válidas; pode ser baixa mesmo com todas admissíveis. |
| JEV | Autodeclaração qualitativa ou predição calibrável do avaliador, isolada das dimensões anteriores. Não é a única fonte nem pode promover suficiência. |

`DecisionConfidence`: `dimension_assessments`, `evidence_flags`, `material_unknowns`, `comparison_status: SUPPORTED / UNDERDETERMINED / NOT_EVALUABLE`, `allowed_routes`, `policy_ref`, `jev_assessment_ref: Option`. Gate final deriva rotas de requisitos determinísticos. JEV pode apontar incerteza adicional; não limpa conflito/STALE/HOLD e não eleva limite de domínio. Fonte nova contraditória não pode aumentar confiança por mera contagem. Evidência opcional ausente não força ASK/HOLD se caminho independente aprovado sustenta decisão.

Se futuramente houver probabilidade numérica, declarar **qual evento** se prevê (por exemplo, concordância com ranking de especialista num conjunto permitido), população/conjunto, método de calibração, versão e limites. Não apresentar probabilidade de “seguro”. Sem baseline/calibração, usar ordinal ou `NOT_CALIBRATED`, sem inventar percentuais. Agreement humano não prova segurança clínica/efeito.

## 12. JEV Contract — tipagem, limites e shadow mode

### 12.1 Inputs

`JevRequest` é um envelope imutável construído **após** HC e minimização. O request não inclui candidatos rejeitados, credenciais, IDs de login, Crew, títulos/notas externos, conversa bruta ou narrativa clínica. Features derivadas continuam potencialmente sensíveis; pseudônimo não é anonimização nem dispensa G07.

| Campo / tipo | Conteúdo e validação |
|---|---|
| `contract_revision`, `request_id`, `evaluation_ref` | AEOS/JEV contract, ato consultivo e avaliação/fingerprint de origem. |
| `mode: SHADOW` | Único modo inicial permitido. Nenhum field do retorno tem canal de escrita/executor. |
| `snapshot_digest`, `candidate_set_digest`, `policy_bundle_ref` | Vinculação exata de contexto/plano-base/conjunto/regras; mudar qualquer input material invalida resposta. Digest por si não concede permissão. |
| `valid_candidates: List<JevCandidateView>` | ID/hash, classe, intent effects, diferenças mínimas pertinentes, horizon impact redigido, eligibility attestation refs e limitações. Proibido completar/modificar candidato. |
| `context_features: List<Feature>` | Projeção mínima aprovada para comparar: prioridade declarada, criticality, demanda relativa sustentada, limites de evidência, disponibilidade e custo de ruptura. Sem payload de saúde bruto ou fonte textual executável. |
| `allowed_routes`, `question_catalog_refs` | `RANK / ASK / HOLD / RECONCILE / HUMAN_REVIEW / PROFESSIONAL_REVIEW / ABSTAIN`; perguntas e encaminhamentos somente de catálogo aprovado. Human review operacional não fornece clearance clínico. |
| `prepared_action_ref: Option`, `semantic_checks` | Ação exata já preparada e claims/intent a validar, sem autoridade de aplicação. |
| `baseline_ref`, `evaluator_visibility` | Baseline fica fora da visão inicial do JEV para comparação independente. É ligado no trace após resposta; se experimento de acesso ao baseline existir, identificar estrato separado, sem misturar resultados. |
| `operational_budget_ref`, `deadline_at` | Orçamento versionado de tempo/limite/custo e cancelamento selecionado por Engineering/AI em ambiente de execução futuro, sem SLO fictício. Expiração é falha consultiva com fallback. |

`Feature`: `feature_id`, `construct`, `typed_value_or_unknown`, `unit_or_ordinal`, `source_ref_tokens`, `derivation_ref`, `comparability_limits`, `sensitivity_class`, `allowed_exposure`. Allowlist é aplicada fora do JEV, por finalidade/recipient/versão. Missing não é zero. O mapa token→fato é restrito fora do modelo. Requisitos mínimos sem permissão → não chamar JEV; baseline só usa o que estiver autorizado.

### 12.2 Outputs

| Campo de `JevResponse` | Contrato |
|---|---|
| `request_id`, `contract_revision`, `snapshot_digest`, `candidate_set_digest`, `evaluator_revision` | MUST corresponder ao request e à execução registrada. Versão desconhecida ou vínculo divergente invalida resposta inteira. |
| `status` | `EVALUATED / ABSTAIN / INVALID_INPUT / TIMEOUT / ERROR / CANCELLED`; status de transporte é registrado pelo chamador, sem confiar em erro autodeclarado. |
| `ranking: List<RankGroup>` | Grupos ordenados com IDs do conjunto permitido, ties explícitos; `unranked_ids` e motivo completam a partição exata. Cada candidato aparece uma vez; sem novo ID, omissão silenciosa ou duplicata. Partial ranking não resolve sozinho opção crítica desconhecida. |
| `candidate_assessments` | Por ID: features/reason codes permitidos, suporte/limites e relação `PREFERRED / TIED / INCOMPARABLE / UNASSESSED`; score opcional só com construto/escala/versão, nunca dose nem licença de safety. |
| `confidence_assessment` | Por comparação/escopo: `SUPPORTED / UNDERDETERMINED / NOT_EVALUABLE`, unknowns, referências e eventual calibração identificada. Autoconfiança não promove limite determinístico. |
| `route_recommendation` | Rota permitida e escopos; question/review refs do catálogo. ASK/HOLD/PRO review são recomendações consultivas no SHADOW, registradas para avaliação. |
| `semantic_validation` | `CONSISTENT / FLAGGED / ABSTAIN / NOT_REQUESTED`, ação exata/ref, checks e reason refs. CONSISTENT não aprova candidato, policy, consentimento, diagnóstico ou efeito. |
| `reason_codes`, `feature_refs`, `limitations` | Razões auditáveis estruturadas; sem chain-of-thought ou narrativa privada. Nenhuma explicação inventa fonte, regra ou field fora do envelope. |

Reason codes mínimos: `PRIMARY_GOAL_PRESERVED`, `SECONDARY_TRADEOFF`, `KEY_STIMULUS_PROTECTED`, `LOWER_DISRUPTION`, `INSUFFICIENT_PRIORITY`, `EVIDENCE_CONFLICT`, `CRITICAL_INPUT_UNKNOWN`, `CONTEXT_OR_VERSION_MISMATCH`, `ACTION_INTENT_MISMATCH`, `SEMANTIC_AMBIGUITY`, `PROFESSIONAL_REVIEW_NEEDED`, `NO_SUPPORTED_PREFERENCE`, `EVALUATOR_FAILURE`. Todos ligam features autorizadas e um comparator/check aplicável. Enum não concede verdade: verificar correspondência; código inconsistente invalida a parte dependente e impede usar ranking sem vínculo completo. Usuário recebe somente projeção aprovada da razão pertinente ao trace oficial; JEV bruto fica privado, com acesso por função/finalidade e retenção G07.

### 12.3 Validação, fallback e autoridade

O chamador MUST validar schema lógico, enum, tamanhos/orçamento, IDs/partição, digests, versões, purpose/exposure, referências e ausência de mutação. Conteúdo inválido/stale não é “consertado” pelo LLM nem interpretado permissivamente. Revalidar gates determinísticos depois da avaliação. Recomendação JEV não pode criar candidato, limpar HOLD, escolher consentimento, alterar objetivo, criar dieta/diagnóstico, executar ou substituir AEC.

Timeout/erro/indisponibilidade/resposta inválida: registrar `JEV_UNAVAILABLE` + causa redigida; usar **resultado B0 revalidado no estado atual**, inclusive ASK/HOLD, sem improvisar treino ou reutilizar decisão antiga inválida. Se B0 também indisponível/inválido, reter escopo dependente e indicar próximo passo operacional; “KEEP último plano” não é fallback automático. Orçamento impede retry infinito; cancelamento por revogação/contexto invalida resposta tardia. Logs não contêm payload de saúde/token/prompt bruto.

**SHADOW MODE obrigatório na primeira implementação**: B0 é congelado independentemente do retorno JEV; execução oficial não lê preferências/rotas/semantic flags JEV. Disagreements e flags vão ao Lab/review privado e não mudam silenciosamente plano ou pergunta apresentada. Candidato inseguro detectado por replay/teste leva a correção de policy/código no processo competente; o modelo shadow não executa remediação em pessoas. Flags de segurança já detectáveis deterministicamente seguem HC sem aguardar JEV. JEV desligado, falho ou com ranking oposto deve deixar o resultado oficial idêntico para os mesmos inputs.

Não há ativação controladora autorizada, calendário ou meta arbitrária de cenários. Promoção futura exige: avaliação independente representativa por estratos; zero violações dos invariantes; calibração/desacordo/estabilidade/ruptura explicados contra baseline e experts quando competentes; gates AI/Engineering/Security/domínio por versões; rollback/kill switch e autorização explícita para o contrato alterado. Targets não invariantes só depois de baseline. Mesmo eventual modo assistivo continuará sob hard constraints/policy gate/agência, sem autoridade soberana.

## 13. Decision Trace / Auditability e state/versioning

`DecisionRecord`: `decision_ref`, `evaluation_ref`, `snapshot_ref`, `candidate_set_ref`, `baseline_result_ref`, `jev_shadow_result_ref: Option`, `policy_gate_results`, `official_outcome`, `confidence_ref`, `validity_conditions`, `affected_scope_refs`, `confirmation_requirement`, `explanation_ref`, `prior_decision_ref: Option`, `lifecycle_state`.

`DecisionTrace` MUST ligar: fatos/revisões conhecidos e ausências/conflitos; policy/rule/evidence/approval versions realmente usadas; candidatos gerados/admissíveis/rejeitados e HC/reason refs; vetor/comparações B0 e ambiguidades; JEV input projection/digest/evaluator/timeout e desacordo **separados do oficial**; ação/precondições/efeitos no horizonte; explicação/claims/template/model revision e validação; prévia/alcance/ato confirmado ou rejeitado; resultado lógico/erro/override/correção/successor. Não coletar pensamento interno do modelo. Referenciar fatos mínimos, sem replicar relato de saúde em logs/exports ou cada trace.

| Estado/transição | Precondição / efeito lógico futuro |
|---|---|
| `EVALUATING → PREPARED` | Snapshot fechado, candidatos/controle e policy gate válidos. Cria proposta sem aplicar plano. |
| `PREPARED → PRESENTED` | Referência vigente e explicação fiel/template; leitura pode mostrar recomendação sem mutação. |
| `PRESENTED → ACCEPTED` | Somente se ato necessário identifica proposta/hash/alcance e revisões correntes; sem confirmação implícita de export/social/dados. |
| `ACCEPTED → APPLIED` | Futuro executor realiza commit lógico condicionado à guarda completa de autorização abaixo, com validação indivisível ou controle equivalente contra mudança interveniente de qualquer precondição crítica aplicável. Uma única revisão integrada vigente. Guarda divergente: `STALE`/cancelamento escopado, zero novo efeito; sem overwrite. |
| `PREPARED/PRESENTED/ACCEPTED → STALE` | Fato relevante, override, policy/restrição/permissão/plano muda; impedir efeitos não aplicados, gerar avaliação sucessora se autorizada. |
| `PRESENTED → DECLINED` | Registrar não aplicação e preferência apenas se declarada/confirmada; não pune nem auto-reapresenta a mesma proposta sem novidade. |
| `APPLIED → SUPERSEDED` | Nova revisão aplicada; conservar passado e versão executada/exportada. Correção/undo cria transição atual, não elimina realizado ou aplicação histórica. |
| Qualquer pendente → `EXPIRED/CANCELLED` | Validade encerrada, revogação/hold/interrupção; efeitos dependentes cessam. Cópia remota entregue conserva estado real. |

ASK/HOLD/RECONCILE são resultados de decisão rastreáveis, sem necessidade de `APPLIED` para existirem. Confirmação de contexto/fato é operação própria anterior à avaliação; confirmar plano não confirma inferência sensível extraída pelo agente nem limpa HOLD. O catálogo de estados descreve eventos lógicos, sem impor banco/event bus.

`LogicalIntentKey` identifica pessoa/finalidade/operação/objeto/revisão/ato estável; retry da mesma intenção não cria efeito adicional e payload divergente com mesma chave é conflito. `EvaluationKey` contém conjunto relevante de fatos/revisões normalizados, contexto/objetivos/restrições/permissões aplicáveis, policy/comparator/stability revisions e plano-base. Delivery ID ou horário de consulta sem mudança relevante não cria nova intenção material. Expiração relevante é fato de avaliação. Após aplicar, reentrega do evento que motivou a avaliação encontra efeito já registrado ou plano sucessor satisfeito; não gera revisão idêntica por diferença mecânica do plan-base. Antes de nova proposta, comparar delta material com o plano vigente.

Confirmação é vinculada a `candidate_hash + scope + plan_base_ref + context_ref + policy_bundle_ref + permission_revision + validity`. Antes de cada efeito, inclusive fila/retry, ler novamente restrições/hold/consentimentos/capability/versões. Revogação vence trabalho pendente; resposta JEV/LLM tardia é descartada. Não existe exactly-once remoto: export/unknown/replace parcial e recibos mantêm contrato AEC §5.4. Representação provider-neutral não equipara store/scheduler a relógio; app fallback só se sessão ainda aplicável.

### 13.1 Commit e guarda concorrente de autoridade

`CommitAuthorizationGuard` vincula `logical_intent_key`, operação/escopo/ato confirmado, `plan_base_ref`, `context_ref`, revisões das sessões/escolha/execução afetadas, `permission_and_purpose_revision`, `restriction_and_hold_scope_revision`, `policy_and_approval_revision`, `capability_revision` quando pertinente e predicados de validade/aplicabilidade no instante do efeito. Referências de policy imutáveis não bastam: a guarda também verifica sua aprovação/vigência/revogação corrente. O controle de holds/restrições inclui inserção de **novo** hold no escopo antes vazio; ausência lida anteriormente não constitui autorização estável. Cada revisão/epoch representa somente dependências críticas ao efeito, sem serialização global de fatos irrelevantes.

Há um **ponto lógico de commit/autorização por efeito**. Validar todas as precondições críticas e comprometer a transição/intenção de efeito MUST ser indivisível em relação a alterações concorrentes das mesmas precondições, ou usar controle equivalente que impeça aceitar estado superado. Uma leitura imediatamente anterior seguida de CAS apenas p1/c1 é insuficiente. Engenharia escolherá mecanismo equivalente adequado; não se exige banco, lock, transação distribuída ou atomicidade remota aqui. Se o mecanismo futuro não puder provar essa guarda, não comprometer o efeito dependente.

Ordem observável obrigatória:

- **Revogação/hold/approval/capability/sessão/ato crítico mudou antes do ponto:** a guarda falha mesmo com plano/contexto ainda p1/c1. Proposta fica STALE ou cancelada no escopo; zero mutação/novo efeito autorizado, zero nova fila dependente. Trace registra revisões esperadas/encontradas, qual precondição falhou, evento de autoridade e sua precedência sobre tentativa de commit. Outra tentativa só após reavaliação/ato atuais.
- **Commit válido ocorreu primeiro e a autoridade mudou depois:** preservar o fato/revisão já comprometidos e sua ordem; não fingir que o efeito passado nunca ocorreu. Invalidar o uso futuro/outputs dependentes e cancelar fila/retries ainda não comprometidos; HOLD quando a causa exigir. Nenhuma confirmação anterior autoriza efeito subsequente sob autoridade revogada. Realizado/histórico e cópia remota já entregue conservam fatos e limites próprios.

Criar intenção/fila não é realizar envio. Cada despacho/efeito posterior tem sua própria guarda atual e ponto lógico; revogação entre commit do plano e execução da fila impede essa execução. Se comando remoto já foi autorizado/despachado antes da revogação e pode ter sido entregue, conservar resultado real/UNKNOWN e possível cópia residual, tratar cancelamento separado só se suportado/autorizado e não prometer recall/exactly-once remoto. A ordem local/ack não prova instante de execução no device. Nenhum JEV/LLM pode fornecer ou validar a guarda no lugar dos controles determinísticos. Cenários S45/S46 e Q09 do Lab especificam as duas ordens concorrentes sem mudar p1/c1.

Auditabilidade não exige retenção infinita. G07 controla finalidade/retention/acesso/eliminação das projeções, snapshots, traces, requests, features e rótulos de eval. Após eliminação, conservar somente prova mínima permitida ou controle equivalente; evidência removida não é reconstituída por refetch. Replay autorizado pode ser `NOT_REPRODUCIBLE_ERASURE` com limite explícito. Acesso interno para debug não concede exposição ao usuário errado/Crew/provider. Telemetria operacional usa status/códigos redigidos e referências não resolvíveis fora do escopo.

## 14. Anti-flip-flop / Stability

`StabilityState`: decisão/proposta vigente, fingerprint relevante, candidato aceito/recusado, objetivos e constraints confirmados, última mudança material/reason refs, estabilidade de evidência comparável e pending confirmation. Pertence ao mesmo plano/trace, sem memória opaca de preferência.

Regras obrigatórias:

- Mesmos inputs relevantes/policy/estado → mesmo resultado B0; reordenar deliveries/candidatos ou repetir JEV não muda decisão, cria carga ou reenvio.
- Ruído de fonte/repetição sem novo fato material não alterna KEEP/MOVE/REDUCE. Materialidade é definida por construto/receita/policy, não pelo LLM. Se falta regra de materialidade necessária, reter adaptação dependente/ASK por fato pertinente ou review de policy; não criar limiar.
- Priorizar proposta vigente válida entre equivalentes (§10); não a reapresentar após recusa sem fato/declaração/policy material nova. Mudança de preferência explícita pode disparar avaliação.
- Não usar cooldown para atrasar HC/restrição/permissão nova, correção relevante ou contexto que invalida sessão. Gate tem precedência imediata; confirmar antes de efeito continua obrigatório.
- Evidência tardia revisa futuro; não reescreve decisões anteriores, causalidade ou mérito. Atividade duplicada não causa dupla adaptação.
- Detectar ciclo de revisões sem melhoria material sob comparator/policy; suspender caminho automático afetado, conservar trace e encaminhar Engineering + domínio quando aplicável (AEC falha repetida). Quantidade/janela específica, se necessária ao comportamento fisiológico, precisa policy G02/G04; monitor operacional futuro deve ser validado sob G09, sem número arbitrário aqui.

O oráculo de estabilidade é semântico: variações equivalentes preservam ação/delta/escopo, e uma alteração material justifica mudança por reason/policy ref. Não exige manter plano quando ficou inválido nem proíbe adaptação necessária. Taxa de oscilação e ruptura desnecessária serão medidas por sequências/counterfactuals no Lab.

## 15. Outcome Learning Contract

Separar três usos sem expandir finalidade por chamar o produto de adaptativo:

| Uso | Entrada/resultado permitido / limite |
|---|---|
| Primário I10 | Observação corrigida/desfecho/declaração pertinente → reavaliar sessão/horizonte atual, explicar diferença planejado/realizado e preservar contexto. Não requer aprendizado ML. Necessidade/base/finalidade devem ser próprias e transparentes. |
| Personalização longitudinal secundária | Histórico adicional/motivos/padrões → hipóteses pessoais versionadas somente sob opt-in específico OFF por padrão e G07; recusa não penaliza valor primário. Revogação cessa filas/uso/serviço e elimina ou deixa de usar derivados dessa finalidade. |
| Evals/qualidade | Fixtures sintéticas como default nesta fase; dado real posterior só com finalidade/base/recipients/retenção/uso aprovados, minimização e separação de conjuntos. Não presumir que treino de modelo ou terceiro é uso primário. |

`OutcomeObservation`: fato canônico/revisão, sessão e revisão realmente executada (ou desconhecida), exposição/realizado comparável, critério de aderência/policy ref ou `UNCLASSIFIED`, percepção voluntária confirmada, performance com contexto/limites, correção/supressão e purpose refs. `LearningHypothesis`: padrão/construct, evidências e contraevidência, cobertura, aplicabilidade, confidence/limitations, revision, purpose/consent ref, revisão profissional necessária e expiração por mudança relevante. Nenhum desses objetos diagnostica ou muda policy automaticamente.

Abaixo/igual/acima do planejado é classificação de exposição específica validada, sem mais mérito por exceder, falha automática por menos ou causa fisiológica inferida. Falta de dado é censura/unknown, export confirmado não é outcome, clique em insight não é ingestão. User override não é rótulo “motor errado”; registra escolha e contexto sem causalidade. Rejeição pode indicar agenda/preferência se declarada, não aprovação para ajustar dose.

Nenhum treinamento ML, reinforcement learning, otimização por engagement, atualização autônoma de thresholds ou rollout online nesta missão. Futuro aprendizado produz proposta de hipótese/policy, com holdout/review/rollback e autorização por G02/G07/G09/G11 antes de afetar pessoas; correlação com performance não demonstra efeito. Crew e telemetria de social não entram como evidência fisiológica ou perfilamento.

## 16. LLM Contract

LLM é opcional para explicar e para o canal de coordenação; loop e tarefas diretas funcionam sem ele. Não é o baseline, criador de treino, policy gate ou executor. A função de explicação ocorre **depois do registro oficial**; em SHADOW não usa o ranking JEV como razão da escolha B0.

| Operação / tipo | Contrato permitido |
|---|---|
| `ExplanationRequest` | `decision_ref`, `official_outcome`, claims/reason refs aprovados do trace B0/gate, alcance/deltas públicos à própria pessoa, confiança/limites, próximos passos/catálogo e locale PT-BR/EN. Apenas projeção autorizada; sem conversa/provider text bruto ou fatos privados desnecessários. |
| `ExplanationResponse` | `decision_ref`, `revision`, texto, `claim_bindings` para cada afirmação material, `limitations`, `model_or_template_revision`, `status`. Texto não contém novos efeitos, policy, evidência, diagnóstico ou instrução Nutrition pessoal. |
| `FactCandidateExtraction` | Fato voluntário candidato + trecho privado mínimo/construct/origem e necessidade de confirmação. Material/sensível só entra no objeto canônico após confirmação/correção explícita; texto não edita estado por si. |
| `PrepareAllowedAction` | Selecionar referência de opção já preparada/permitida, mostrar alcance e pedir confirmação no caminho canônico; sem gerar delta novo ou ferramentas de efeito. |

Validador externo MUST verificar vínculo/revisão, suporte de claims, números/causalidade, omissões materiais de limite/hold/unknown, contradição com outcome e conteúdo fora de escopo. Dados externos e pedido “ignore rules” são dados não confiáveis. Expor somente fatos que a pessoa pode ver; export não inclui Nutrition/motivo de saúde/Crew em notas. Nenhum texto concede auth/consentimento/clearance.

Falha/timeout/alucinação/locale não equivalente: rejeitar explicação e usar template determinístico aprovado com ação/motivo sustentado/limite/próximo passo. Falta de template clínico aprovado impede copy clínica específica, sem improvisar urgência; estado operacional pode informar escopo retido e responsável. Se não há explicação mínima fiel exigida para aplicar uma alteração, reter apresentação/aplicação dessa proposta até composição válida, sem usar texto inválido. Registro/correção/funções independentes continuam. LLM ausente não elimina core loop nem força conversa.

Antes de escolher modelo/recipient remoto: AI/Security/jurídico validam dados/finalidades/transferência/retention/no-training/acesso/eliminação/evals G07/G09. Sem fornecedor escolhido, não se concede coleta, envio de prompts reais ou armazenamento de conversa. Reason codes/feature summaries são úteis à auditoria, sem divulgar raciocínio interno ou dados sensíveis. Nenhuma ferramenta de executor, provider, permissões ou social é concedida ao LLM/JEV por este contrato.

## 17. Personalization Roadmap e policy slots dependentes

Roadmap é ordem de capacidade, sem prazo ou ML iniciado:

1. **P0 explícito/determinístico:** objetivos/agenda/equipamento/restrições confirmados, contexto único, receitas/policy aprovadas e B0. Sem wearable obrigatório.
2. **P1 observação individual comparável:** protocolo/frescor/referência pessoal validados, longitudinal primário somente onde necessário para decisão atual; confidence e correção preservados. Wearable não ganha autoridade universal.
3. **P2 JEV shadow:** mesmo conjunto válido, ranking/routing/semantic check auditáveis em paralelo, sem controle. Evals estratificados, counterfactuals e baseline independente.
4. **P3 longitudinal secundário opt-in:** hipóteses pessoais adicionais com lineage/consentimento/revogação e prova de valor, sem atualizar policy automaticamente.
5. **P4 decisão futura:** eventual aprendizado estatístico ou JEV assistivo exige hipótese, dados suficientes, autoridade/aplicabilidade, review independente, rollout/rollback e autorização específica. Não é requisito implícito da V1 ou compromisso de implementar ML.

Slots abaixo **consomem PDR §5**, não criam inventário concorrente. Todos têm estado `UNFILLED_EXTERNAL` até prova da autoridade real; fixtures usam `SYNTHETIC_ONLY`, nunca aprovação profissional. A mecânica de tipo/ausência/rejeição já está fechada.

| Slot / dependência única | Exato conteúdo ainda necessário / owner/prova / efeito de ausência |
|---|---|
| PS01 coverage/recipes — G01 | Profissional real de Educação Física alocado pelo Founder + jurídico: perfis/objetivos/Running/Strength/repertório/serviço e casos aceitos/rejeitados por revisão. Sem isso, não gerar prescrição correspondente. |
| PS02 signal/demand/comparator — G02 | Autoridade de treino: construtos/âncoras/protocolos/frescor, demanda relativa, materialidade/criticality, preservação do estímulo, limites de dose/spacing/substituição/progressão e casos. Não substituir por fórmula do JEV; ASK por preferência conhecida pode resolver somente lacuna de preferência. |
| PS03 outcome/adherence — G03 | Product/UX + profissional: comparabilidade/tolerância/abaixo-igual-acima/parcial e critérios por sessão. Sem isso, real bruto honesto/UNCLASSIFIED; sem juízo automático ou soma de mérito. |
| PS04 safety/return — G04 | Profissional competente, médico no clínico: red flags, urgência/copy, restrição, liberação/retorno e evidência de saída de hold. Não preencher com aceite/score/tempo. |
| PS05 Nutrition — G05 | Nutricionista + jurídico: asset/lógica/funcão/público/aprovação/validade por revisão. Sem isso, omitir conteúdo afetado/usar somente educação já elegível; sem prescrição individual/suplementos. |
| PS06 provider/capability — G06 | Engineering sob acesso/credenciais/entitlement/contrato autorizado: golden cases neutro→adapter e device, perdas/recibos/update/delete/unknown/retorno. Não prometer suporte de marca ou device-ready até prova. |
| PS07 purpose/retention/recipient — G07 | Founder/jurídico + Security/Engineering: inventário de campos/derivados/traces/eval/model recipients, bases/transferência/retenção/deleção e controle de não reativação. Sem isso, nenhum tratamento real dependente; sintético local é suficiente para especificar. |
| PS08 empirical validation — G11 | Research/Data + domínio: baseline real/representativo, calibração, experts competentes e critérios não invariantes após observação; claims/rollout dependentes aguardam prova. Sem falsa meta numérica ou alegação de eficácia. |

G08 identidade/abuso e G09 realização/prova continuam gates de implementação nos scopes pertinentes; não são perguntas de produto abertas por AEOS. G10 comercial não bloqueia esta especificação. Orçamentos técnicos, biblioteca, persistência, transporte, schemas de serialização, harness, testes reais e modelos são execução/decisões de engenharia futuras dentro destes contratos; não são blockers externos inventados para impedir qualquer infraestrutura neutra. Alteração técnica que mude comportamento retorna a Product/UX.

## 18. Aceitação, ordem futura e hard stop

Aceitação documental: os 14 blocos mínimos têm tipos/regras/ausência/owner e testes correspondentes no Lab; JEV shadow não controla efeito; fallback preserva HC/agência; nenhuma fórmula fisiológica/meta não invariante/autoridade profissional é fabricada; upstream/pacote preservados; reviews independentes por risco material e checks por hash atuais. Parecer documental não é aprovação de política profissional ou runtime.

Ordem recomendada **somente em missão futura autorizada**: (1) fixtures sintéticas/contratos e oráculos do Lab; (2) versioning/provenance/reconciliação/consentimentos/holds; (3) registry de regras/receitas e aprovação profissional nos slots dependentes; (4) gerador/filtro + B0 + trace/stability com checks de invariantes; (5) JEV shadow e fault injection/comparação; (6) explicação determinística e LLM opcional com adversariais; (7) prévia/confirm/executor com provas de concorrência/idempotência; (8) adapter/device spike autorizado após acesso e consentimentos; (9) avaliação com experts/dados reais permitidos e gates de rollout. Itens podem avançar em paralelo apenas sem dependência; prescrição real aguarda G01–G05/G07/G09, provider específico G06, claims G11.

**HARD STOP:** esta missão termina na especificação, Scenario Lab e reviews/evidência documental. Sem engine/código de produção/scaffold/ML/provider connection/spike/Figma/telas. Não afirma implementação iniciada, política clinicamente validada, JEV calibrado, eval executado ou produto pronto. Próximo responsável recebe os contratos/hashes e lacunas exatas; não herda autorização para implementar.
