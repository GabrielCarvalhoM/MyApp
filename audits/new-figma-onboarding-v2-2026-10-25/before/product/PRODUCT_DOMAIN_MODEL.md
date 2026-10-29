# Vilumo Fit — Product Domain Model

<!-- EXPERIENCE_AUTHORITY_OVERLAY_START: EXP-AUTH-r1 -->
> **Domain authority retained · 2026-10-22 · EXP-AUTH-r1.** Objects, ownership, states, permissions and scientific/privacy/business limits below remain intact. [DR-93–97](PRODUCT_DECISION_REGISTER.md) / [index filter](../canon/CANONICAL_INDEX.md) retire only inherited presentation/placement prescriptions and historical experience reading sequences; capabilities do not require surfaces. DR-91 narrowly qualifies blanket location/route exclusions; other sensitive-data exclusions remain. Old isolated-state metadata is historical after integration `32b7fb6`, not a transferred gate. For clean rehydration start with the [derived context](DESIGNER_PRODUCT_CONTEXT.md).
<!-- EXPERIENCE_AUTHORITY_OVERLAY_END: EXP-AUTH-r1 -->

Revisão **PDM-1.3** · 2026-10-19 · **CANDIDATE_IN_ISOLATION / FREEZE-20261019-r1**.
Autoridade: [PTC-3.2.1](../canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md), [Scope](V1_RELEASE_SCOPE.md), [AEC](ADAPTIVE_ENGINE_CONTRACT.md), [SIS](SPORT_INTELLIGENCE_SPEC.md). Significado/ownership/estados, não schema/API/banco/novos serviços. Baseline e impacto em [registro](../audits/v1-freeze-2026-10-19/MISSION_RECORD.md).

## 1. Escopo e significado

V1 pessoal Run + Strength coordenado; Crew/M2/M3 e suas entidades são DEFERRED, NOT REJECTED. Athlete Model é Athlete Context e sua projeção versionada AthleteState. Um plano integrado, uma sessão com modalidade própria e fatos reconciliados. Modelo atualizado não implica conteúdo/versão de plano mutado. Role social não é plano de preço; entitlement é estado comercial separado.

## 2. Pessoa e objetivos

Pessoa adulta 18+, Brasil/PT-BR+EN+ES/iOS+Android, dona de contexto, registros, permissões e escolhas. GoalPriorityModel guarda objetivo concreto por modalidade, priority_mode RUN_FIRST/STRENGTH_FIRST/BALANCED_HYBRID/UNKNOWN, evento/janela e trade-off confirmado. Balanced tem coprioridades; unknown não autoriza arbitragem dependente. M1 descreve experiência pessoal; M2/M3 só histórico/roadmap, nenhum caminho V1.

## 3. Ownership e entidades

| Owner | Possui | Limite |
|---|---|---|
| Pessoa & Permissões | Identidade, conta, contexto declarado, consentimentos/finalidade/escopo, direitos, idioma/unidades. | Consentimento não é entitlement, clearance ou execução. |
| Athlete Context / AthleteState | Fatos confirmados/reconciliados, goals/prioridades, agenda, equipamento, exposição/observações/qualidade e projeções necessárias. | Não mantém plano por esporte ou inferência clínica como fato. |
| Run / Strength Intelligence | SpecialistProposal/Assessment, progressão/performance/programação/repertório e analytics semânticos de cada domínio. | Propõe/avalia; não aplica plano ou muda finalidade/objetivo. |
| Recovery / Load | ExposureContributions e sinais locais/sistêmicos com refs/limites. | Sem dupla contagem ou novo treino por estimativa, nenhum score universal/diagnóstico. |
| Adaptive Engine / Interference | Sessão planejada, único plano/decisão e trace, adequacy/necessity/change-cost/agency constraints, HOLD e validação conjunta. | Única prescrição final; JEV SHADOW/LLM sem autoridade de mutação. |
| Continuidade pessoal | Desfecho, interrupção/retorno, descanso e fatos para histórico/marcos/analytics. | Unknown não é falha nem conquista; sem avaliação social. |
| Integration | Conexão/capability/permissão, observação/provenance, export opcional/intenção/cópia/recibos. | Domínio → neutro → adapter; transporte não é realizado; ingest-first sem promessa de device universal. |
| Nutrition leve | Asset elegível ligado à demanda/fase/sessão/revisão quando já coberto. | Sem módulo, nova coleta extensa, dieta ou dose. |
| Shareability | Shareable/preview/projection refs, allowlist/inclusões/ato/destino escolhidos. | Output próprio privado→cópia externa, sem social graph, saúde/terceiros/localização/metadata oculta ou auto-post. |
| Commercial Access | Oferta versionada e entitlement/trial/assinatura verificados, preview de valor, ato comercial. | Não escreve consentimento, prioridade, dose, adoção ou sessão. Não bloqueia direitos/histórico/registro em curso. |

Observação conserva bruto/declaração/derivado distintos, pessoa/provider/rota/conta/originador/IDs namespaceados, ocorrido/medido/recebido+timezone, unidade/escala/método/janela, qualidade/frescor/cobertura e transformação/revisão/lineage. Dedupe associa fato, não delivery; similaridade só propõe; duas sessões reais semelhantes não se fundem/médiam campos incompatíveis. Correção substitui a contribuição no escopo; supressão/revogação vencem replay/refetch/backfill/novo delivery/transformação. Marcador mínimo ou controle equivalente lícito, sem payload de saúde/retenção indefinida; AEC §4/§5.4 e G07.

Sessão tem revisão imutável e fases/steps/repeats finitos, completion/advance/targets/unidades/baselines separados e payload Strength íntegro. Planejado, escolhido, executado e observado distinguíveis; execução não é sobrescrita. HOLD tem classe/escopo/causa privada mínima, owner/next step/evidência de saída. Policy/authority atual é verificada fora dos modelos. Não copiar payload sensível a traces/exports/logs. Um sinal favorável não dá clearance.

### 3.1 Athlete Model, aprendizado e motivo de mudança

Athlete Model mantém fatos e projeções de resposta/performance/programação/exposição com evidência/contraevidência/comparabilidade/finalidade e revisão; pode avançar após cada sessão pertinente enquanto plano e prescrição ficam iguais. AEC§1.3/AEOS§10.3 distinguem processos (continuous learning / exceptional in-cycle adaptation / systematic between-cycle progression) e motivos de delta (earned progression / programmed variation com training purpose / reactive adaptation material). Motivos/cadência são projeções do DecisionTrace existente, não novos planos/fatos de performance ou consentimento. Assessments de oportunidade não são progresso concedido nem efeitos pendentes autoaplicáveis. Fronteira de ciclo prepara continuação sob os mesmos HC/guarda/adoção; nenhum aumento automático por semana. Preserva I10/I11–13 e SIL-I1–I5.

## 4. Contratos de fronteira

| ID | Regra |
|---|---|
| I1 | Contexto/fatos autorizados → coordenação compartilhada, provenance/confiança por decisão, sem km↔séries ou score universal. |
| I2 | Engine → execução/continuidade: decisão/revisão/estrutura/critério/limites/trace/HOLD; gerar/recomendar não aplica, confirmação identifica alcance/versão. |
| I3 | Observação/declaração → desfecho: real reconciliado; ausência de atividade não prova não realização; descanso sem prova é desconhecido. |
| I4/I5 | Continuidade→Crew e social→agenda DEFERRED. Nenhum vínculo, convite, apoio ou agenda de outro na V1. |
| I6 | Finalidade/escopo mínimos para todo efeito; read/write/share distintos, revalidados em fila/retry. OAuth externo não é necessariamente granular: só preservar outra finalidade se sustentável, senão desconectar e explicar. |
| I7 | Progresso próprio → shareable por iniciativa, allowlist PA§7/UX§16 e fato/revisão; assinante e não compartilhante mantêm privacidade. |
| I8 | Crew→share externo DEFERRED, inclusive convites; nenhum dado de terceiro/coletivo na V1. |
| I9 | Prévia exata → cópia externa por ato/destino explícitos; sem posting automático, dado vivo, audiência/likes/atribuição individual ou recall prometido. |
| I10 | Primário: dados necessários para explicar/reavaliar plano/horizonte com base própria. Secundário longitudinal adicional é opt-in OFF por padrão, finalidade/base independente. Revogar cessa fila/uso/serviço e elimina/deixa de usar derivados secundários; primário só continua sob finalidade/base própria válida. Sem perfilamento social/ML por default. |
| I11 | Especialistas → coordenação: mesmo snapshot/policy, propostas versionadas, composição/horizonte/HC; sem ciclo, plano/fato/consentimento paralelo ou dose default. |
| I12 | Coordenação/realizado → progressão: original/adaptado/executado/observado distintos; retirada deliberada não é falha nem conquista; critério ausente UNCLASSIFIED. |
| I13 | Atualização do modelo → avaliação: atualiza evidência, verifica adequacy, preserva plano válido adequado; só necessidade/benefício material após custo permite menor mutação eficaz sob aceitação/guarda. |
| I14 | Commercial Access → treino: entitlement verificado libera somente o alcance comercial; pagamento não aplica plano, não consente saúde/export/share, não limpa HOLD. |
| W1/W2/W3 | Ingestão autorizada → observação; sessão/revisão → export opcional por rota; resultado externo → reconciliação I3/I10. Envio/receipt não é execução, falha não é culpa/carga do atleta. AEC §5 conserva guardas de cada efeito. |

## 5. Estados e transições

Confiança SUFFICIENT/PARTIAL/CONFLICTING/STALE/ABSENT por escopo, sem reduzir dimensões a média. Aplicabilidade/holds distintos de confiança. Decisão/proposta preparada→vigente/substituída/stale/expirada; mudança aplica só após ato corrente/guarda §13.1. Modelo pode atualizar enquanto conteúdo do plano fica igual.

Adequacy ADEQUATE/INADEQUATE/UNDETERMINATE/NOT_APPLICABLE_INITIAL e necessity REQUIRED/NOT_REQUIRED/UNDETERMINATE são assessments privados, não estados médicos ou telas. AgencyConstraint liga recusa/início com pendência e razões; safety vence; SIS§7/UX CONF-16 preservados.

Sessão planejada/pronta→executando↔pausada→parcial/concluída/cancelada; iniciado preserva executado e props afetadas stale. Observação recebida/proposta de associação/confirmada/ambígua/não associada/corrigida/suprimida; precedência mínima impede ressurreição. Continuidade ACTIVE/NO_DATA/INTERRUPTED_DECLARED/RETURNING, sem inferir abandono ou repor volume.

Share prévia privada→confirmada→projetada/cancelada/falha conhecida/resultado externo não comprovado; OS share sheet aberto não prova post. Correção/alteração da revisão invalida prévia preparada. Entitlement ausente/pendente/verificado/expirado/revogado/desconhecido conforme prova; não conceder por timeout/clique. Compra/restauração/renovação não são prova de treino; caducidade não apaga fatos. Conexão/export mantém estados detalhados AEC§5, sem simplificação.

Entidades/estados Crew, vínculo, compromisso, convite, check-in/apoio são roadmap DEFERRED, NOT REJECTED; não materializar estados vazios/coleção/notifications na V1.

## 6. Invariantes

1. Um atleta, um plano integrado, uma sessão canônica; canais e integrações não geram estado concorrente.
2. Motor decide; pessoa age. Insight, fonte, Crew e agente não prescrevem independentemente. Edição manual é input do loop sem ajuste oculto adicional.
3. Honrar reduzir/recuperar/descansar é progresso. Mais volume não supera honrar nem gera vantagem social. Tolerância fina de aderência permanece aberta.
4. Insight nutricional só explica/prepara demanda do treino. Contexto disponível não autoriza logging, dieta ou meal planner.
5. Workout exportado não equivale a entregue/executado. Dado tardio/corrigido não duplica, apaga passado ou prescreve retroativamente.
6. Crew pode criar/participar nos tetos, aderir, pausar, sair, bloquear convites/silenciar apoio. Nenhum alerta de quem “sumiu”, ausência, contexto ou modo de outro.
7. Consentimento social, leitura, envio, share e aprendizado secundário não se ampliam entre finalidades, Crews ou destinos.
8. Sem leaderboard, pontos ou score/streak coletivo V1; check-in não cresce por volume nem exige prova. Descanso pode contar sem revelar a causa.
9. Até classificação jurídica própria, Recovery, Nutrition e motivos de saúde têm minimização/consentimento explícito e ficam privados; não cruzam para Crew/share.
10. Outro esporte pode ser contexto no que se interpreta com confiança explícita; sem prescrição/analytics próprios, placeholder ou promessa. Extensão não exige capability futura implementada agora.

Aplicabilidade freeze: invariantes 6 e a parte social de 7/8 preservam contrato da expansão Crew, não requisito V1. Invariantes 1–5/7/9/10 continuam ativos no valor pessoal. Novo 11: Model Update ≠ Plan Mutation; L024/AEC/AEOS governam. Novo 12: billing, consentimento, adoção e execução são autoridades separadas.

## 7. Persistência e direitos

Pessoa pode corrigir, acessar/exportar próprios dados, revogar, eliminar/encerrar conta. Cessar finalidade impede efeitos/fila/derivados futuros; dados primários só retidos sob finalidade/base/necessidade transparentes. Encerrar motor/assinatura não reativa outro modo social, coleta ou memória; cancelar assinatura não é apagar conta. Histórico e registro/fechamento em curso, correção e direitos continuam acessíveis sem coerção comercial. Retenção/backups/marcadores/recipient e prova de eliminação: G07/G09, sem prazos inventados. Cópias externas já entregues têm limites explícitos; não prometer recall.

## 8. Alternativas e provas

Especialistas profundos em vez de tracker genérico/dois planos; share por outputs em vez de rede; analytics por Progressive Depth em vez de dashboard do Hoje; entitlement próprio em vez de modes sociais/preço inferido. Checks e revisões do freeze por hash, não aprovação própria. Specs anteriores e UX r3 originais recuperáveis no Git/histórico; nenhum gate ativo do Claude é sobrescrito.

## 9. Abertos / limite de etapa

PDR §5 G01–G11 mantém owners/provas por trigger. Nada aqui valida fórmula/policy/segurança/eficácia/provider/billing; nomes/dados/sensores reais dependem prova antes de ativação. Para Visual/UI estão fechados escopo, objetos, prioridades, first-value, assinatura/profundidade/estabilidade; detalhes testáveis não exigem nova missão documental.
