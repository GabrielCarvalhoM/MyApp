# Auditoria adversarial — V1 Training Domain Foundation 0.1 → 0.2

22 de outubro de 2026 · Vilumo Fit · FOUNDATION-AUDIT-20261022

## Decisão principal

**Draft 0.1: NOT READY para se tornar base autoritativa de domínio.** É uma direção conceitual séria e reaproveitável, com separações importantes, mas entrega um vocabulário e seeds de conceitos, não a materialização contratual/esportiva anunciada. O status autoral “READY WITH FIXES” não é evidência independente de completude. Uma conversa exploratória com um profissional já seria possível; um handoff preparado de G02/G03 exigia correções primeiro.

**Correção 0.2: READY WITH FIXES para revisão humana delimitada.** Corrige representação, rótulos/provenance, fronteiras e exemplos, preservando os49 IDs. Pode ir a profissionais para revisão de escopo, metadados, receitas e dos casos concretos apresentados. Não é Product/Domain Truth nem autoridade prescritiva; não possui estimador validado, políticas aprovadas ou oráculos esportivos positivos. Os pareceres delta e verificações exatas acompanham a entrega.

Nenhum P0 foi demonstrado neste pacote documental sem runtime ou prescrição entregue a atleta. P1 bloqueiam promoção a autoridade; não bloqueiam toda consulta a especialista ou registro factual independente. G01–G04 permanecem HUMAN_REVIEW_REQUIRED,8 QUESTIONABLE não são promovidos, C1–C6 não são esportivamente fechados. Não houve implementação, Figma, mudança no Canon ou alteração dos resultados r4.

## Corpus, método e independência

Input: ZIP enviado pelo usuário,14.520 bytes, SHA-256 `1233e63e7706d76455e78b2c8205dd5c8238c4f205a511f54b62b0f754dfe1a9`. Os11 artefatos esperados mais README estão presentes; JSONs válidos,32 exercícios/17 entradas de corrida,49 IDs únicos e nenhuma duplicata exata de ID. Os12 arquivos0.1 foram preservados byte a byte em input-draft-0.1; structural-check-0.1.json registra hashes/contagens/vocabulários.

Comparação: AEC-1.3, AEOS-1.2-r2, AESL-1.2-r2, SIS-1.1-r2, RIL-1.1-r1, STIL-1.1-r1, PDM/PDR e closure r4 disponíveis. authority-check.json confirmou13/13 cópias congeladas iguais ao manifest e aos arquivos locais de origem atuais. Não foi carregado contexto legado de outros projetos. Athlete Model foi comparado como responsabilidade conceitual Athlete Context/AthleteState de PDM/SIS/AEOS; não existe neste corpus um modelo fisiológico implementado adicional para validar.

Antes dos pareceres foram executados inventário/parse/count/IDs/vocabulário. Quatro instâncias sem autoria da0.1 revisaram strength, running, hybrid/interference e data/governance. Root consolidou e foi o único autor das correções0.2; os mesmos juízes avaliam o delta sem editá-lo. São revisões LLM documentais independentes da autoria, não treinamento profissional real, medição com atletas, aprovação regulatória ou verdade empírica independente.

Execution Proportionality: T3/R2/L2, impacto médio na decisão de readiness, reversibilidade alta, incerteza esportiva alta e dependências delimitadas. Root exerce coordenação; quatro perspectivas foram solicitadas explicitamente. Sem novo Chief, UI, security de produto, plataforma de dados, schema empresarial, pesquisa de mercado, runtime ou catálogo gigante. Pesquisa pública limitada à identidade/aplicabilidade dos8 anchors e4 fontes de dados citadas. Contrato atual no TASK_CONTRACT.md do projeto; nenhum estado foi gravado na instalação global.

## Achados que bloqueiam a promoção da0.1

| ID / prioridade | Evidência e arquivos/seções0.1 | Impacto | Menor correção / disposição0.2 |
|---|---|---|---|
| F01 P1 — contratos não tipados | DATA_MODEL_CONTRACTS: listas de campos sem tipos/cardinalidade, Ref/revision comum, unidades, autoridade ou estados | Não é claro o que pode ser selecionado, comparado ou reconciliado. UNKNOWN explicitamente permitido não está representado | Contrato conceitual tipado, unidades, Knowledge e links à autoridade existente. Corrigido para review; formal API/schema/storage não requerido nesta fase |
| F02 P1 — demanda sem construto/comparador | SHARED_MODEL + todos49 domain_judgment_candidates: high/moderate_high/very_high/contextual sem âncoras/dose/atleta | Nome do exercício/arquétipo parece fornecer custo ordenável; comparação Run×Strength produziria falsa equivalência | Removidas bandas do payload ativo; UNKNOWN com motivo. Dicionário de construtos/consumidores, contexto separado. Estimativas reais dependem método/aprovação humana |
| F03 P1 — configuração/dose Strength incompleta | StrengthExercise/Prescription sem StrengthVariation; *_or_* e bilateral_or_unilateral; side_plank sem duração/contração | Equipamento, suporte, assistência, carga por mão/total, lado e isometria não distinguem tarefas | Preservadas famílias;7 configurações e6 prescrições sintéticas, carga/lado/tempo explícitos. As demais configurações continuam pendentes, sem falsa cobertura |
| F04 P1 — Run não define bloco/intensidade executáveis | RunWorkoutBlock não especifica unidades/advance/iterações totais/recuperação final; targets incluem time/HR_secondary/pace_optional | O mesmo JSON admite workouts diferentes e targets semanticamente inválidos | Separados completion/métrica/papel/referência; repeat/recovery/totais e3 prescrições concretas. Nenhuma zona/threshold é aprovada |
| F05 P1 — planned/completed não materializado | Execution aparece em prosa, ausente nos contratos; sem canonical FactRef/segmentos/correção; C1 promete no-double-count | Duplicação planned+observed, correções cumulativas, partial=zero e rewrite de S29 continuam possíveis | Reuso ExposureContribution/SIL-I1–5, exemplo de correção/duas entregas/prefixo observado, execução Run parcial e fronteira pós-início. Não é prova de runtime |
| F06 P1 — substituição só nomeada | SubstitutionRelation tem campos mas zero instâncias; validation row-vs-row só em prosa | Não permite avaliar propósito preservado e custo da alternativa; mesmo músculo não prova equivalência | Relação dirigida de remadas com mudança de apoio/carga/especificidade, efeito/custo desconhecidos. Aprovação/dose equivalentes continuam trabalho profissional |
| F07 P1 — provenance factual não verificável | Seeds repetem frase genérica 'informed by project specs + public/open datasets'; nenhum record/field/source revision | Não se pode declarar metadados factualizados, licença aplicável ao campo ou ausência histórica de cópia comercial | Taxonomia rebaixada a julgamento pendente, origem0.1 rastreada, source mapping UNVERIFIED. Licenças delimitadas, nenhuma base importada. Ingestão factual futura ainda bloqueada |
| F08 P1 — cenários/review prep prometem concretude ausente | SCENARIO_MAPPING/G01_PREP: nomes/variáveis sem prescrições, observações ou avaliações de alternativas |8 casos e C1–C6 identificáveis, mas profissional teria de inventar os inputs antes de revisar | Anexo com14 prompts e objetos concretos compartilhados, custos/efeitos desconhecidos e formulário de disposição. C4(5/6)/C5 continuam explicitamente incompletos |
| F09 P2 — taxonomia mistura eixos | Movement patterns inclui unilateral/trunk/hinge_isometric; mechanic inclui core; músculos pais/filhos; Run mistura propósito/estrutura/fase | Filtros/roll-ups e deduplicação semântica indefinidos; risco de dupla atribuição | Eixos/pendências explicitados, parte dos rótulos normalizada e taper tipado como template. Não se aprovou uma taxonomia completa por palpite |
| F10 P2 — evidência com escopo incompleto | EVIDENCE:8 PMIDs sem população/desenho/limites/crosswalk por claim; squat paper chamado review | Leitura pode transformar adaptação crônica em readiness agudo, comentário em evidência forte ou evidência geral em validação do vetor | Ledger bounded com claims permitidos/proibidos, desenho/população/horizonte/acesso. Nenhum paper valida o estimador do produto |
| F11 P2 — validação superestima prova | VALIDATION_REPORT: PASS unknown/planned-observed sem schema/testemunho; sem logs/procedimento | Inspeção de intenção textual parece prova de implementabilidade ou validação esportiva | PASS substituído por escopo/evidência de artefatos e pendências; checks atuais não executam motor ou fisiologia |
| F12 P2 — direção de esforço e tags de uso | S12 'sets/reps/load/RIR exceed'; running_specific_strength sem endpoint/popolação | RIR maior pode significar mais distância da falha; uso pretendido parece transferência comprovada | S12 usa um set extra com demais parâmetros iguais; tags explicitamente de intenção, não prova de transferência/inelegibilidade |

Severidades são relativas à promoção pretendida. Rotular como HUMAN_REVIEW_REQUIRED contém parte do risco, mas não torna um campo indefinido avaliável ou consumível. A0.2 corrige o handoff; a aprovação esportiva residual não foi convertida em 'resolvido' por documentação.

## Completude dos quatro pilares

**A Strength: parcial e estruturalmente subespecificado na0.1.** Boa separação identidade/prescrição/custo e exemplos amplos de lower/upper/unilateral/calves/trunk. Faltam configuração, dose temporal, convenções de carga e exposição por lado, execução/revisão e substituições reais. Padrão e muscle roles não podem ser tratados como fatos imutáveis independentes da configuração. Força continua objetivo próprio, não suporte obrigatório da corrida.

**B Running: repertório paramétrico adequado como estratégia, contrato insuficiente.** Os17 nomes evitam catálogo estático, mas não definem primitivas nem construtos. Tempo/threshold podem ser próximos sem serem duplicatas provadas; precisam método/intenção. Long/strides/fartlek/intervals não fixam custo; race depende evento/dose/estratégia; taper é fase/relação, não tipo fisiológico. Não é necessário adicionar milhares de workouts.

**C Shared: a intenção é correta, a comparabilidade ainda não existe.** Vetor qualitativo evita um score único, mas só trocar escalar por14 campos não garante ciência. Lower/muscle groups são projeções sobrepostas; cardiovascular/metabolic/systemic precisam construtos; skill/novelty dependem tarefa e atleta; schedule/key proximity são contexto/decisão.0.2 separa os eixos, usa dimensões opcionais, proíbe soma/ordenação de desconhecidos e explicita endpoint/horizonte. Não entrega uma escala cross-sport validada.

**D Seed + integração: quantidade suficiente para descobrir falhas de schema, concretude insuficiente na0.1.**32+17 conceitos deram contraexemplos úteis — side plank, máquina/halter, strides, hills/taper — mas nenhuma prescrição ou relação de substituição foi instanciada originalmente. Os cenários continuam domain-open. A0.2 acrescenta exemplos pequenos compartilhados, sem fingir que se tornaram receitas aprovadas.

## Auditoria de todos os seeds

Todos os32 strength têm source mapping genérico, skill/stability/axial/eccentric sem comparador e nenhum objeto de prescrição/configuração0.1. Todos17 run têm demanda por identidade e provenance sem mapeamento de claim. As observações abaixo são de representação/aplicabilidade; não são declarações de que a anatomia ou o exercício está cientificamente errado. Pareceres completos por item estão nos reviews independentes.

| Strength ID | Observação específica da0.1 / revisão necessária |
|---|---|
| back_squat | Posição/ROM/stance/carga ausentes; músculos primários não são volume efetivo |
| front_squat | Configuração/apoio e comparabilidade; ausência de tag hypertrophy não significa exclusão |
| goblet_squat | Dumbbell/kettlebell são alternativas; carga/suporte mudam a tarefa |
| leg_press | Máquina, trajetória, ROM, posição e convenção de stack não definidos |
| bulgarian_split_squat | Suporte traseiro e carga/lado ausentes; unilateral duplicado no padrão |
| reverse_lunge | Corpo livre/halter, passo, lado e dose unilateral não selecionados |
| step_up | Altura da caixa e assistência/apoio mudam tarefa e comparabilidade |
| conventional_deadlift | Banda very_high axial sem referência; excêntrica depende execução |
| trap_bar_deadlift | Altura das alças/ROM/carga; categoria squat_hybrid precisa definição |
| romanian_deadlift | Barra/halter, ROM e dose excêntrica não fixos |
| hip_thrust | Barra/máquina, banco/apoio e ROM não selecionados |
| nordic_hamstring_curl | Âncora obrigatória, assistência e fase excêntrica/retorno precisam variante |
| leg_curl | Sentado/deitado, máquina e unilateralidade alteram comparação |
| standing_calf_raise | Bilateral/unilateral, apoio, joelho e posição da carga não escolhidos |
| seated_calf_raise | Configuração joelho/suporte/máquina; roles musculares são curadoria |
| tibialis_raise | Corpo livre/máquina, alavanca/amplitude e carga não escolhidos |
| bench_press | Barra/banco estão explícitos, mas grip/ROM/assistência/ordem/dose não |
| incline_dumbbell_press | Ângulo do banco e peso por mão necessários |
| overhead_press | Sentado/em pé/barra/halter e demanda de suporte não especificados |
| push_up | Apoios/inclinação/carga corporal/assistência e ROM precisam configuração |
| pull_up | Pegada/assistência/carga corporal/adicional; skill alto não universal |
| lat_pulldown | Cabo/máquina, pegada e convenção de carga/comparabilidade |
| barbell_row | Apoio/ângulo do tronco, isometria de hinge e especificidade |
| chest_supported_row | Banco+halter e máquina integrada não são o mesmo conjunto de equipamento |
| cable_row | Máquina/cabo/apoio/pegada; carga não intercambiável por nome |
| face_pull | Cabo/banda e external_rotation_bias precisam definição; banda excêntrica não ancorada |
| lateral_raise | Halter/cabo e bilateral/unilateral; agregado deltoids versus lateral_deltoid |
| biceps_curl | Barra/halter/cabo e lado/apoio; volume muscular não deduzido do nome |
| triceps_extension | Cabo/halter, overhead/posição e lado não definidos |
| pallof_press | Banda/cabo, lado, hold/reps e dose; anti-rotação não prova transferência para corrida |
| dead_bug | Alternância, lados, alavanca/ROM e controle; core não é mechanic equivalente a compound |
| side_plank | Sustentação temporal/isometria/lado não representados; excêntrica não fixa pelo nome |

Cobertura Strength: squat, hinge, extensão de quadril, flexão de joelho, panturrilha/soleus/tibial, empurrar/puxar horizontal/vertical e tronco estão amostrados. Falta exercitar carries/locomoção carregada, pliometria/impacto, plano frontal/adutores/abdutores e configurações assistidas com carga própria. São perguntas para o escopo G01, não obrigação de inflar o seed antes de decidir população/objetivo. Nenhuma duplicata exata; variações próximas são úteis para expor diferenças de apoio/configuração.

| Run ID | Observação específica da0.1 / revisão necessária |
|---|---|
| recovery_run | Intenção de recuperação não prova recuperação nem custo baixo para qualquer dose |
| easy_run | Dose30min versus120min altera burden; zonas não se inferem do nome |
| steady_run | Fronteira steady/easy/tempo depende constructo e referência |
| long_run | Long é relativo ao atleta/horizonte; continuous_or_progressive é composição |
| progression_run | Segmentos/alvos/completion precisam estrutura explícita |
| tempo_continuous | Termo ambíguo; definir constructo ou alias em relação a threshold |
| threshold_continuous | Intenção não é limiar medido; reference/protocolo obrigatório quando usado |
| threshold_cruise_intervals | Iterações, duração/distância, recovery e última recuperação precisam semântica |
| vo2_long_intervals | Nome não mede VO2; HR_secondary é papel, não métrica |
| short_intervals | Economia/velocidade e HIIT podem diferir; metabolic very_high sem dose |
| fartlek | Estrutura variável não determina distribuição/custo; blocos finitos/abertos precisam contrato |
| hill_repeats_short | time é completion; grade, superfície e recuperação descendente importam |
| hill_repeats_long | Dose/duração/gradiente e descida não se deduzem do nome |
| strides | Pace_relative exige baseline; metabolic high não tem exposição/comparador |
| race_pace_session | Evento/distância/objetivo/referência e papel de FC precisam vínculo |
| taper_specific_session | Fase/template a compor com receita, não novo intensity domain; contextual não é banda |
| race | Evento/prioridade/estratégia/ambiente; very_high não é custo universal |

Os17 são suficientes para testar a ideia paramétrica; não provam cobertura total do atleta/objetivo V1.0.2 retém IDs, normaliza target métrica/papel, reclassifica taper template e remove bandas ativas. Não regenera biblioteca factual nem atribui músculo/demanda científica a cada item.

## Comparação com AE/AEC/AEOS/SIS/RIL/STIL/Athlete Model

| Pergunta |0.1 |0.2 e dependência real |
|---|---|---|
| AE consegue consumir? | Inspiração conceitual, sem adaptação contratual segura | Payload/crosswalk para SessionIntent/SessionDemand/SIS; implementável conceitualmente, sem parser/engine/runtime demonstrado |
| Minimum Effective Change? | Não fornece adequacy, necessidade, essential stimulus ou alternativas concretas | Fornece perguntas/deltas inspeccionáveis; regras/efeitos e rejeição de menores ainda dependem G02 |
| Substituições por objetivo e custo? | Tipo e prosa, nenhuma relação | Relação condicional de remadas; custo/eligibilidade/estímulo unknown; não há substitute aprovado |
| Planned versus completed? | Separação declarada, sem Execution/segment lineage | Exemplo corrigido/duplicado/parcial e execution Run; regras profissionais de comparabilidade e runtime continuam ausentes |
| Material fact/necessity/Change Cost? | Fact/dose/decisão misturados ou omitidos | Inputs podem alimentar assessments existentes; EstimatedTrainingCost distinto de PlanStabilityCost. Nenhuma necessidade é decidida pelo seed |
| Terminologia/ownership? | TrainingDemandProfile com dois shapes; EstimatedStrengthCost/InterferenceAssessment sem mapeamento | Shape comum e aliases; SIS InteractionAssessment e ExposureContribution preservados; um plano/Athlete Model e nenhuma política paralela |
| Progressão/retorno/in-session? | Promessas sem envelopes/targets executados | Envelope e pós-início concretos em premissas sintéticas; política/progressão/retorno/restrições reais continuam abertas |

Pontos upstream relevantes: AEOS §5 SessionIntent/SessionDemand/DemandRelation; §10.1 adequacy/necessity/PlanStabilityCost e §10.2 Level0/MEC; SIS §§3/5/6/7 inputs/ExposureContribution/SIL-I1–5/progressão/estabilidade; RIL §§2/3/4/5/8; STIL §§2/3/5/8; PDM §§3/3.1. Esses contratos prevalecem sobre este candidato. Não há contradição que destrua a tese do AE; há lacunas materiais de payload, evidência e autoridade.

## Cobertura de S01/S02/S05/S12/S13/S14/S28/S29 e C1–C6

Escala deste relatório: IDENTIFICÁVEL = nome/intenção; CONCRETO PARCIAL = payload/contexto revisável mas interpretações/policies/branches ausentes; SUFICIENTE = caso completo no escopo declarado com limites. Nenhum desses rótulos significa PASS esportivo. Na0.1 todos14 eram identificáveis, sem materialização completa; na0.2 os14 possuem entradas de revisão, mantendo limitações abaixo.

| Caso | Evidência0.2 | Cobertura residual / owner |
|---|---|---|
| S01 | Doses lower+intervals, unidades/esforço,12h end-to-start/13h start-to-start,KEEP/redução/MOVE | CONCRETO PARCIAL: threshold real,essential stimulus,adequacy/necessity/joint effects — treino G02 |
| S02 | Mesmos fatos, prioridade invertida,reduce/move run | CONCRETO PARCIAL: custo/preservação/MEC sem regra — treino G02 |
| S05 | Sono/relato local/queda de performance e história | CONCRETO PARCIAL: protocolo/frescor/comparabilidade/convergência — G02/G03 |
| S12 | Alvo versus set extra,mesma carga/RIR | CONCRETO PARCIAL: materialidade/impacto e comparabilidade — G02/G03 |
| S13 | Sessão/dose e criticality HIGH como premissa | CONCRETO PARCIAL: vínculo de goal/fase/estímulo protegido — G02 |
| S14 | Mesmo run/dose/agenda/prioridade de S13;apenas LOW como premissa | CONCRETO PARCIAL: necessidade antes de alterar — G02 |
| S28 | Pausa14dias por agenda,último plano,eligibilidade unknown | CONCRETO PARCIAL: rebase e retorno não clínico/limites clínicos — G01/G02/G04 |
| S29 | Prefixo completo,stale prestart,new fact pós-início,remainder | CONCRETO PARCIAL: alternativa/dose elegível e agência atual — G02/G03/AEOS |
| C1 | Cinco dias,correção/duplicate delivery,past unknown | CONCRETO PARCIAL: não converte toda trajetória r4 nem prova recovery debt — G02/G03 |
| C2 | Double comhorários/dose/ordem e próximo estímulo | CONCRETO PARCIAL: tolerância conjunta/spacing/regra — G02 |
| C3 | Coprioridades e duas alternativas comdeltas | CONCRETO PARCIAL: efeitos/validade antes de Pareto/ASK — G02 |
| C4 | Deltas candidatos0–4 e5/6 explicitamente ausentes | INSUFICIENTE para espectro completo: positivos/negativos5/6 — G02; não inferir RETURN=6 |
| C5 | Evento sintético10km,fase/sessões,cancelamento/adiamento | INSUFICIENTE para taper coordenado: receita real ainda ausente — G02 |
| C6 | Envelope4–6reps,60kg,inside/outside/earned/unknown | CONCRETO PARCIAL: envelope e oportunidade profissionais — G02/G03 |

As doses exemplificativas são sintéticas. Não são recomendação nem evidência de que13h,14dias,60kg ou RPE6 atendam qualquer atleta.10 Golden domain-open do r4 continuam intactos; converter os20 completos ou rerodar rubrica não foi feito nem prometido. Uma entrada de review não é sporting witness aceito.

## Provenance, licenças e qualidade da evidência

As fontes citadas existem e a direção geral é compatível com preservar dose/contexto/endpoint. Porém, não validam as bandas/escala/dimensões escolhidas nem autorizam políticas proprietárias. A verificação foi de abstracts/metadata e licenças publicadas, com limites explícitos em EVIDENCE_LEDGER.json. Não houve nova meta-análise nem revisão de todos os textos completos.

| Anchor0.1 | Uso defensável e limitação relevante |
|---|---|
| [ACSM2026,41843416](https://pubmed.ncbi.nlm.nih.gov/41843416/) | Distinguir variáveis/outcomes; healthy adults e adaptação, não estimador agudo do Vilumo |
| [Dose-response,41343037](https://pubmed.ncbi.nlm.nih.gov/41343037/) | Separar método de atribuição direta/indireta; não certificar effective sets individuais ou thresholds universais |
| [Proximidade,38970765](https://pubmed.ncbi.nlm.nih.gov/38970765/) | Meta-regressão exploratória de adaptação com RIR estimado; não usar como estudo de fadiga aguda |
| [Acute response,42458937](https://pubmed.ncbi.nlm.nih.gov/42458937/) | Suporte task-specific para exercício/carga/esforço; não generalizar recuperação de24h para todos os treinos |
| [Running TID,34749417](https://pubmed.ncbi.nlm.nih.gov/34749417/) | Método de intensidade importa; não aprova distribuição obrigatória ou bandas de custo híbrido |
| [Concurrent umbrella,41762427](https://pubmed.ncbi.nlm.nih.gov/41762427/) | Resultados contextuais de adaptação; elite pouco representada, sem clearance/readiness individual |
| [HIIT+strength,42759564](https://pubmed.ncbi.nlm.nih.gov/42759564/) | Endpoints/protocolos diferem; ausência de diferença média não é ausência de efeito individual |
| [Squat biomechanics,38576836](https://pubmed.ncbi.nlm.nih.gov/38576836/) | Comentário clínico nível5 sobre configuração; não revisão sistemática que valida metadados/custo |

Overlap é exposição compartilhada; interferência crônica é uma hipótese de efeito em adaptação; fadiga aguda/readiness da sessão seguinte é outro endpoint. Associação temporal não prova causa. A evidência do concurrent training em geral não resolve automaticamente lower+threshold de S01/S02. Revisões que compartilham estudos não contam como replicações independentes. Não foram adotados números precisos de spacing, recuperação ou volume a partir de resultados médios.

Licenciamento: [free-exercise-db declara Unlicense](https://github.com/yuhonas/free-exercise-db/blob/main/LICENSE.md); [Kinetic declara MIT](https://github.com/kinetic-place/exercises-db/blob/main/LICENSE) com condição de aviso. Isso não comprova direitos de toda mídia ou fonte factual dos seeds. [O repositório específico ExerciseDB é AGPL](https://github.com/ExerciseDB/exercisedb-api/blob/main/LICENSE); não se deve equiparar licença do repositório a termos da API/dados/mídia ou proibir comércio apenas pelo nome da licença. [RepDB publica termos comerciais próprios](https://repdb.co/license/v1.2/) por tier/versão e limita redistribuição bruta; os termos vistos não estabelecem a alegação genérica sobre seu 'free dataset with attribution'. Nenhum provedor foi selecionado/importado na correção.

Não há mídia/instruções comerciais demonstradamente copiadas nos arquivos inspecionados. **Não é possível certificar ausência histórica de cópia**: a0.1 não fornece manifest de importação nem origem por campo. A resposta responsável é manter UNVERIFIED e impedir ingestão factual automática. Nem nome comum de exercício nem biblioteca com licença permissiva provam provenance da curadoria original.

## G01–G04: preparação original e handoff corrigido

G01_PREP0.1 oferece boas perguntas, mas não define população/cobertura/negativos ou formulário de disposição. G02 chama 'reviewable' variáveis/custos que não têm unidade/comparador/prescrição. G03 afirma structures planned/completed e versioning sem Execution no contrato. G04 não traz classes/reavaliação/responsáveis suficientes; corretamente evita diagnóstico/clearance.

0.2 dá ao profissional objetos e perguntas delimitadas, casos aceitos/rejeitados a especificar, histórico de limitações e registro de avaliação por artifact/rule/revision, competência/população/escopo, evidência/limites, dose/protocolo/comparabilidade, KEEP/MEC/Change Cost, safety/agência, reavaliação e disposição/condições/retirada. Founder ainda deve alocar o profissional real de G01; Product/UX+treino em G03; médico quando avaliação clínica e Engineering nos aspectos operacionais conforme PDR. A revisão LLM não preenche seus nomes/assinaturas.

Próxima etapa útil: revisão humana **por subset**, começando pelo escopo, vocabulário/configurações e lower×threshold, seguido de observação/aderência e retorno não clínico. C4/C5 e restrições clínicas podem ser rejeitados/deferidos/out-of-scope com owner. Não é necessário outro r5 abstrato ou esperar uma escala universal antes de consultar humanos. Não é admissível assinar toda a foundation como Truth apenas porque os documentos ficaram tipados.

## Overengineering e underengineering

Removeria do payload ativo os custos não ancorados, duplicação EstimatedStrengthCost/EstimatedTrainingCost/SessionDemand sem alias e a mistura schedule/key sensitivity/systemic summary como novas exposições. Não criaria matriz todos-contra-todos de substituição, taxonomia de milhares de workouts, banco factual gigante, modelo universal numérico, JSON Schema empresarial ou pipeline de14 dimensões obrigatórias. Não manteria PASS documentais como testes fictícios.

Adicionaria somente o que tem consumidor demonstrado: configuração/carga/lado/tempo para STIL; intensidade/completion/recovery/repeats para RIL; referências/versões/unknowns/execution e exposição para SIS/AEOS; definição/limites do comparador; poucas relações/fixtures concretas e perguntas profissionais por versão. Esses são os deltas0.2. Ampliação de vocabulário/catálogo só após decisão de escopo G01 e necessidade de exercício de contrato real.

Seeds precisam de **migração localizada**, não regeneração completa.32/17 IDs e repertório foram retidos. Valores0.1 permanecem no input histórico. Não se deve rebandear49 itens por outro palpite nem afirmar que a fonte factual foi verificada por renomear a classe.

## Entrega e verificação

- RELATORIO_AUDITORIA.md: este relatório completo.
- v1-training-domain-foundation-0.2/:15 arquivos da revisão limitada; CHANGELOG e limites explícitos.
- input-draft-0.1/ e ZIP original preservados; structural-check-0.1.json e authority-check.json.
- checks-0.2.json e review-input-manifest-0.2.json: resultados de consistência e hashes exatos do candidato.
- reviews/: quatro perspectivas0.1 e seus pareceres delta0.2, com disposição consolidada separada. Os relatórios não são assinaturas esportivas humanas.

Quarenta verificações de artefato passaram na submissão0.2 inicial: parse/count/IDs, status/provenance, refs internas, tipos de target, doses/configuração/lado/isometria, totais de repeats/recovery, terreno, fatos corrigidos/entregas duplicadas, partial/remaining, fronteira S29, testemunhas ausentes preservadas, fontes e hashes upstream/input. Não é execução de runtime, cobertura total de todos os contratos futuros, teste clínico ou prova de fisiologia. Verifique checks/disposição final para eventuais deltas posteriores e os hashes efetivamente revisados.

A revisão independente encontrou e a autoria corrigiu três P2 adicionais: intervalo12h entre término/início versus13h entre inícios; S13/S14 controlando dose/agenda/prioridade e variando só criticality; C2 substituindo horários da mesma sessão e MOVE carregando início/término coerentes. O snapshot anterior e seus pareceres foram preservados. A submissão final r2 passa43 verificações, incluindo essas três condições, sem alterar nenhum resultado esportivo.

A decisão permanece: **0.1 NOT READY para autoridade;0.2 READY WITH FIXES para revisão humana delimitada.** Promoção a Product/Domain Truth depende dos aceites reais e rastreáveis ainda ausentes, não desta auditoria.
