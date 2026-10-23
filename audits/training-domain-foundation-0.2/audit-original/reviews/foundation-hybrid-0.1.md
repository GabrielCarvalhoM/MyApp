# Auditoria independente — hybrid / concurrent / interference — draft 0.1

Data: 2026-10-22, America/Sao_Paulo. Perspectiva independente de autoria; inspeção documental e de evidência, não parecer de profissional humano de treino nem aprovação clínica. Escopo: arquivos originais em `outputs/foundation-audit/input-draft-0.1`, os 32 registros Strength e 17 Run, SIS/AEOS atuais e `outputs/closure-r4/POLICY_EVIDENCE.md`. Não houve alteração de inputs, runtime, Figma, gates ou classificações dos cenários.

**Veredito desta perspectiva: NOT READY para base autoritativa.** A direção conceitual é séria e aproveitável; a materialização é insuficiente. Uma 0.2 pequena, concentrada em contratos, semântica de bandas e exemplos sintéticos completos, deve preceder a revisão humana formal por regra/escopo. O draft já permite uma conversa exploratória com profissional, mas ainda transfere a ele trabalho de modelagem que se apresenta como concluído.

Rigor: L2, independente e limitado aos failure modes híbridos; impacto material no domínio, reversibilidade documental alta, incerteza esportiva material e dependências Run/Strength/AE. Nenhum P0 identificado no uso documental atual. Os P1 abaixo impedem canonização, não representam claim de dano ocorrido.

## O que está bem fundamentado

- A separação identidade × prescrição × atleta/contexto é adequada e consistente com AEOS/SIS.
- O draft rejeita escalar universal de fadiga, km↔séries, mudança automática por overlap e cutoffs globais de espaçamento. Não encontrei fórmula quantitativa oculta que contradiga essas proibições.
- Tags estão identificadas como candidatas de julgamento humano; não são apresentadas como medidas empíricas aprovadas. Isso reduz o risco, mas não fornece semântica/âncoras que estão faltando.
- Overlap descritivo versus interferência contextual é uma distinção útil; o problema é a definição ainda ampla de interferência e sua ausência de endpoint/horizonte.
- Os seeds têm diversidade suficiente para começar uma auditoria das fronteiras; não é necessário expandir o catálogo para centenas de exercícios.

## Achados materiais e correções mínimas

### HYB-01 — P1: bandas ordinais não têm constructo, escopo, comparador ou âncora

Local: `SHARED_TRAINING_DEMAND_MODEL.md:4–19,30`; `DATA_MODEL_CONTRACTS.md:18–22`; todos os `domain_judgment_candidates` dos dois seeds.

`low`, `moderate`, `high`, `very_high` e os intermediários existem sem dizer se representam pico/intensidade, dose acumulada, resposta aguda, recuperação esperada, comparação intrapessoal ou posição entre tarefas. `contextual` aparece no mesmo espaço que bandas, embora seja estado de indeterminação. Confiança também não tem escala ou interpretação. Uma linguagem com os mesmos nomes não cria comparabilidade física entre Run e Strength.

Contraexemplos: `strides` tem metabolic=`high`, lower=`low_moderate`; `long_run` metabolic=`moderate`, lower=`high`; `short_intervals` metabolic=`very_high`; `fartlek` cardiovascular=`high`. Esses números verbais podem representar potência instantânea, contribuição anaeróbia, gasto total ou residual, com rankings diferentes. Poucos strides com recuperação completa e um treino denso de intervalos não são comparáveis por esse rótulo. Uma corrida easy longa e uma breve podem ter esforço relativo semelhante e dose total muito diferente. Não é possível declarar o ranking errado ou certo sem definir o que ele mede.

Correção mínima: definir um dicionário enxuto por dimensão com constructo/escopo, localização quando pertinente, observação versus inferência, dose e contexto necessários, comparador, origem e limites. `UNKNOWN`, `UNASSESSED`, `NOT_APPLICABLE` e `CONFLICTING` são estados separados de valor. Banda só existe sob regra/âncora versionada e explicitamente aplicável; na ausência, valor nulo e motivo. Não converter bandas em pontos nem somá-las. Não fabricar limites numéricos para preencher o draft.

### HYB-02 — P1: seeds voltam a fixar demanda no arquétipo/exercício

Local: `SEED_DATASET_RUN.json:20,62,410,453,498,586,718` e registros equivalentes; `SEED_DATASET_STRENGTH.json:31,276,705,1864` e equivalentes; regra contraditada em `RUN_SESSION_ONTOLOGY.md`, seção Training-cost rule, e `FOUNDATION_OVERVIEW.md`, Core separation.

As bandas são guardadas na identidade sem prescrição, dose de referência, população, familiaridade, técnica ou modelo. O sufixo `tendency` e o status de revisão humana são honestos, mas não impedem um consumidor futuro de tratá-las como baseline. Back Squat axial=`high`, Bulgarian Split Squat axial=`low`, Nordic eccentric=`very_high` não são estimativas transferíveis a toda execução. Nordic assistido com amplitude limitada e exposição pequena não pode herdar o mesmo custo de uma exposição nova e exigente. Side Plank eccentric=`low_moderate` não especifica se a versão contém movimento excêntrico ou se é um hold isométrico.

Correção mínima: conservar IDs/nome/estrutura e perguntas qualitativas de revisão; retirar/desativar bandas como dado consumível, ou deslocá-las para hipóteses com contexto de referência explícito e `not_for_decision`. Não trocar `high` por outro palpite. Gerar perfis de demanda somente para prescrições concretas sintéticas, com campos desconhecidos admitidos e sem alegar validação esportiva.

### HYB-03 — P1: o vetor mistura exposição, resultado estimado e prioridade de decisão

Local: `SHARED_TRAINING_DEMAND_MODEL.md:6–19`; `DATA_MODEL_CONTRACTS.md:27–28`; `FOUNDATION_OVERVIEW.md`, fórmula Hybrid.

Lower local e músculos podem ser projeções hierárquicas da mesma exposição; axial/eccentric/impact são aspectos mecânicos, não cargas independentes que se acumulam por padrão. Cardiovascular, metabolic e systemic recovery não têm fronteiras: o mesmo esforço pode ser contado como três custos. Novidade é relação do atleta com a tarefa; schedule sensitivity e key-session proximity são contexto/logística/prioridade. A prioridade muda qual estímulo proteger, não o custo fisiológico já incorrido.

Contraexemplo: S01 e S02 compartilham exatamente a mesma sessão executada. Ao virar Run-first para Strength-first, sua demanda fisiológica não muda, embora a adequação das alternativas possa mudar. Um custo estimado que incorpora goal priority poderia artificialmente alterar a exposição passada. Um perfil com lower=`high` + quadríceps=`high` + eccentric=`high` não representa três exposições distintas.

Correção mínima: manter dimensões físicas opcionais e ligadas à mesma ExposureContribution; separar familiaridade/novidade do atleta e condições de decisão no InterferenceContext/SessionIntent já existentes. Definir systemic recovery como projeção derivada não aditiva, ou adiar esse campo até existir consumidor/modelo sustentado. Tratar regiões como vistas da mesma exposição, sem rollup numérico implícito.

### HYB-04 — P1: planned/observed não garante reconciliação nem elimina double counting

Local: `DATA_MODEL_CONTRACTS.md:18–28`; `SHARED_TRAINING_DEMAND_MODEL.md:30–31`; `SCENARIO_DOMAIN_MAPPING.md:17`; requisito normativo SIS §3/§5, especialmente SIL-I2/I4.

Não há FactRef/ExposureContribution, revisão de prescrição/executada, cobertura temporal/por segmento, associação de observado, supersession, contribuição conhecida versus desconhecida ou refs compartilhadas entre modelos. `planned_or_observed` no custo e `observed_vs_estimated` no perfil ainda confundem dois eixos: uma dose completada pode ser observada, enquanto sua demanda continua estimada. Metabolic/neuromuscular fatigue não se tornam observadas porque houve registro de execução.

Contraexemplo: atleta completa dois de quatro blocos e interrompe sem registrar o resto. Um perfil planejado da sessão mais um perfil observado parcial pode duplicar os dois blocos; substituir o todo pelo parcial pode apagar o restante desconhecido. Derivar fadiga local em Strength e recovery global em Load pode duplicar a interpretação da mesma exposição. O claim C1 de reconciliação não é materializado pelo schema atual.

Correção mínima: referenciar os tipos existentes ExposureContribution/FactRef e suas revisões/escopo; documentar que realizado conhecido substitui previsão somente na mesma cobertura, restante desconhecido permanece desconhecido e restante futuro pode continuar planejado. Reusar a mesma contribuição entre consumidores. Separar basis=`PLANNED/COMPLETED` de epistemic_kind=`OBSERVED/DERIVED_ESTIMATE`. InteractionAssessment não adiciona uma nova penalidade fisiológica.

### HYB-05 — P1: interferência não especifica efeito, direção, horizonte ou alternativa

Local: `SHARED_TRAINING_DEMAND_MODEL.md:21–34`; `DATA_MODEL_CONTRACTS.md:27–28`; AEOS §5 DemandRelation; SIS §3 InteractionAssessment.

O draft usa `interference` para overlap que vira relevante por contexto, mas não distingue interferência crônica na adaptação, comprometimento agudo de performance, incompatibilidade de agenda, restrição local/safety ou custo de alterar o plano. `InterferenceAssessment` difere de `InterferenceContext` sem mapeamento para o `InteractionAssessment` normativo. Um par de sessões não cobre por si só efeitos no próximo estímulo, no fim da semana ou na progressão.

Contraexemplo: uma exposição pode prejudicar a qualidade de sprints na mesma sessão sem demonstrar prejuízo de hipertrofia em semanas; outra pode ocupar a janela de treino sem nenhuma inferência fisiológica. Nenhuma delas deveria virar uma única propriedade `interference=high`.

Correção mínima: mapear explicitamente o nome de trabalho ao InteractionAssessment existente, sem novo motor/registry. Cada assessment precisa de efeito/endpoint alegado, sessão/objetivo afetados, direção quando sustentada, horizonte e contexto, evidence/rule refs e efeitos/unknowns por alternativa. Relação não é causalidade; ausência de regra mantém conclusão dependente como unassessed. Manter dados descritivos úteis mesmo quando a decisão esportiva não é avaliável.

### HYB-06 — P1: o mapping chama referências de categorias de materializações concretas

Local: `SCENARIO_DOMAIN_MAPPING.md:3–22`; `G01_G04_REVIEW_PREP.md:7–14`.

Não há uma semana/atleta prescrito, dose, horários, séries/blocos efetivos, referência de intensidade, exposição observada, alternativa ou witness MEC. `C3 Pareto`, `C4 um eixo` e `C6 envelope representado` são intenções: nenhum contrato envelope/ref/intervalo ou exemplo o materializa. `G02 exact variables` exagera a precisão do material disponível. Sem paired projections de Run e Strength, o compartilhamento de linguagem não foi exercitado.

Correção mínima: uma família sintética reutilizável S01/S02/C1/C2/C3/C4; uma família planned/observed S05/S12/S29/C6; contexto explícito S13/S14/C5; e retorno S28. Não precisa um arquivo por caso. Fixar doses/horários sintéticos como fatos do cenário, manter assessments/policies nulos ou premissas identificadas, fornecer KEEP e alternativas menores, e solicitar aceito/rejeitado/unknown e justificativa ao profissional. Exemplos concretos não aprovam a dose.

### HYB-07 — P2: S12 mistura direção de RIR com excesso de dose

Local: `SCENARIO_DOMAIN_MAPPING.md:10`.

“Actual sets/reps/load/RIR exceed” sugere que qualquer valor acima do alvo significa mais demanda. RIR maior representa mais repetições estimadas em reserva, mantidas as demais condições; não é equivalente a mais séries/carga. Também não basta somar diferenças para concluir fadiga.

Correção mínima: separar delta de dose e delta de esforço com escala/versão/estimativa/comparabilidade; manter cada componente bruto. Se a diferença de dose é material ou a resposta indica problema permanece questão de regra G02/G03.

### HYB-08 — P2: evidência sustenta restrições conceituais, não a taxonomia inteira nem os tags

Local: `EVIDENCE_AND_PROVENANCE.md:14–23`; `SHARED_TRAINING_DEMAND_MODEL.md:33–34`.

A evidência foi listada corretamente como constraint, mas não há ledger que ligue cada constructo/claim à fonte, população, endpoint, horizonte e limite. Não encontrei suporte nesses anchors para os valores ordinais individuais nem para tratar todas as 14 dimensões como construtos independentes validados. Também não há licença científica para tratar a fórmula multiplicativa ilustrativa do overview como modelo quantitativo.

Correção mínima: uma tabela curta claim→fonte→inferência permitida→limite, mais `DOMAIN_JUDGMENT/UNVALIDATED` para a forma do vetor e seus campos propostos. Separar evidência de efeito crônico de respostas agudas; distinguir hipótese de modelagem de fato científico. O dicionário pode manter campos não validados como candidatos opcionais; não precisa eliminar conceitos úteis por ausência de métrica validada.

## Inspeção de cada dimensão compartilhada

| Campo do draft | Disposição mínima |
| --- | --- |
| Lower/upper local | Útil como região. Especificar qual constructo e fase; não somar novamente músculos da mesma exposição. |
| Muscle-group | Útil para exposição regional/músculo e substituição; primário/secundário não certifica effective sets nem fadiga. Corrida não precisa inventar contribuição muscular medida. |
| Cardiovascular | Distinguir demanda/resposta interna/dose; preservar intensidade e duração como dimensões reais, sem equivalência com bandas Strength. |
| Neuromuscular | Diferenciar exigência da tarefa de declínio funcional estimado/medido. “High speed” não é “high fatigue” automaticamente. |
| Eccentric | Descrever ação/exposição, amplitude/dose/contexto; não fixar dano ou recuperação pelo nome do exercício. |
| Axial | Definir região/constructo/exposição, não um fator universal de fadiga sistêmica ou risco. |
| Impact | Relevante a terreno/superfície/locomoção/saltos quando suportado. Não inferir risco lesional de uma banda; ausente no seed não significa zero. |
| Metabolic | Especificar se intensidade, energia total ou outra inferência; sem definição, suspender banda. Sobreposição com cardiovascular exige declaração. |
| Coordination/skill | Requisito técnico da tarefa versus familiaridade/capacidade individual. Não usar como penalidade fisiológica adicional. |
| Systemic recovery | Hipótese/projeção dependente de atleta e histórico; não exposição observada nem somatório independente dos outros campos. Pode ser adiado. |
| Novelty | Contexto atleta × exercício/prescrição × exposição prévia, com desconhecido explícito; não propriedade fixa. |
| Schedule sensitivity | Relação logística/flexibilidade/Change Cost, fora do vetor fisiológico. |
| Key-session proximity sensitivity | Contexto de sessões/intenção/horizonte e policy, fora da exposição física. |
| Timing/proximity | Necessita timestamps/janela e sessões/revisões; sem threshold global e sem inferência causal pela proximidade. |

## Evidência científica verificada e limites

Pesquisa pública realizada em 2026-10-22. Leitura dos registros/abstracts PubMed; não alego leitura integral de artigos fechados. Nenhum resultado foi transcrito como regra prescritiva. Não somei participantes/estudos de revisões potencialmente sobrepostas.

- [Held et al., 2026, PMID 41762427](https://pubmed.ncbi.nlm.nih.gov/41762427/) é uma umbrella review de 17 meta-análises sobre adaptações de capacidade aeróbia, força, potência e hipertrofia. Conclusões focam indivíduos recreacionalmente treinados; altamente treinados/elite têm dados escassos. Sustenta rejeitar veto universal e distinguir contexto/desfecho. Não fornece readiness agudo, dose adequada individual, clearance ou banda por arquétipo; a inferência de uma linguagem de 14 dimensões é do produto.
- [Kikuchi et al., 2026, PMID 42759564](https://pubmed.ncbi.nlm.nih.gov/42759564/) inclui 21 estudos/569 participantes, com comparação de concurrent HIIT+strength e strength. O agregado não mostrou diferença significativa em squat 1RM/CMJ; subgrupos diferiram em CMJ, com cautela por poucos estudos. Isso impede equivalência “sem diferença média = sem efeito individual” e recomenda preservar tipo de estímulo/endpoint, sem autorizar cutoff ou tag fixo. Abstract não permite generalizar a todos os esportes/níveis ou segurança individual.
- [Schumann et al., 2022, PMID 34757594](https://pubmed.ncbi.nlm.nih.gov/34757594/) — anchor do r4 — agrega 43 estudos em adultos saudáveis, intervenções supervisionadas de pelo menos quatro semanas. Resultados diferem entre força explosiva, força máxima e hipertrofia; espaçamento é análise de adaptação em grupo. Não transforma uma separação temporal em garantia para a próxima sessão nem prova que KEEP é inadequado em S01/S02. É contraponto relevante ao ler apenas a conclusão mais favorável de uma revisão posterior.
- [Cowley et al., 2026, PMID 42458937](https://pubmed.ncbi.nlm.nih.gov/42458937/) testa 18 participantes em crossover com back squat/prone row, cargas e proximidades à falha distintas, observação imediata e em 24h. Sustenta que exercício/carga/esforço importam e que identidade não fixa custo. Não valida todos os exercícios, corrida, recuperação além desse horizonte ou transferência causal ao indivíduo do app.
- [Robinson et al., 2024, PMID 38970765](https://pubmed.ncbi.nlm.nih.gov/38970765/) é meta-regressão exploratória de ganhos de força/hipertrofia com RIR estimado a partir das descrições dos protocolos e ajuste global modesto. Não é estudo de fadiga aguda. A evidência permite distinguir objetivo e tratar esforço separadamente; usar sua conclusão para recovery timers ou custo neural agudo seria extrapolação. Separar esta fonte da alegação de fadiga suportada por Cowley.
- [Campos et al., 2022, PMID 34749417](https://pubmed.ncbi.nlm.nih.gov/34749417/) revisa 20 artigos de corredores de média/longa distância e identifica diferenças de quantificação da distribuição de intensidade. Sustenta preservar método/protocolo de intensidade, não tratar zonas como portáveis. Não valida um perfil híbrido universal nem os tags metabolic/lower; tampouco transfere percentuais médios para política individual.

## Cobertura dos casos, nesta perspectiva

`PARCIAL/CONCEITUAL` significa que há vocabulário útil, mas não instância completa suficiente para julgamento esportivo. Não é classificação AE e não altera QUESTIONABLE ou G01–G04.

| Caso | Cobertura observada no 0.1 | Menor materialização faltante |
| --- | --- | --- |
| S01 | Parcial: identidades de exercícios e arquétipo Run. | Atleta, dose, prioridade, timing/horizonte, histórico, KEEP e candidatos menores; perfil compartilhado explícito com unknowns. |
| S02 | Parcial: mesma família, prioridade invertida. | Mesmos fatos físicos de S01, valor de proteger estímulos por contexto e alternativas aprováveis. Prioridade não altera custo passado. |
| S05 | Conceitual: categorias de sinais. | Observações datadas, protocolos e comparabilidade, distinção convergência/correlação/causa; ação depende de regra. |
| S12 | Parcial: estrutura de delta. | Prescrição aceita e execução concreta por set, RIR em direção correta, cobertura e comparabilidade. |
| S13 | Conceitual: papel crítico. | Intent/criticality com origem/regra/versão, evento/fase e estímulo essencial; demanda separada de proteção. |
| S14 | Conceitual: papel secundário. | Mesmo contraste de S13 com alternativas e prova de necessidade; low criticality não autoriza mudança sozinho. |
| S28 | Conceitual: pausa/reentrada mencionadas. | Histórico/estado/restrições, elegibilidade e recipes de retorno como candidatas, sem restaurar doses automaticamente. |
| S29 | Parcial: completed/remnant mencionados. | Mapeamento por segmento/revisão, fato novo, restante futuro e desconhecido; evitar reescrever realizado. |
| C1 | Conceitual: trajetória e claim antidupla contagem. | ExposureRefs únicas e exemplo multi-dia planejado/parcial/observado/correção; sem somar projeções como novas cargas. |
| C2 | Parcial: timing de um par. | Horários/ordem e próximas sessões/horizonte, efeitos separados por objetivo/endpoint. |
| C3 | Conceitual: Pareto mencionado. | Pelo menos duas alternativas concretas, estímulos preservados/comprometidos e assessments com limites; preferência só entre viáveis. |
| C4 | Conceitual: eixos de mudança. | Antes/depois prescrito por eixo e suficiência menor→maior demonstrável sob premissas rotuladas. |
| C5 | Conceitual: evento/taper. | Evento/data/distância/prioridade/fase, recipe candidata e mudança/cancelamento de contexto. |
| C6 | Conceitual: envelope afirmado. | Accepted envelope ref imutável, bounds/version/eligibilidade, execução dentro versus proposta fora e delta observado. |

## Proporcionalidade e próximo passo

Não adicionar runtime, wearables, ontologia biomédica, modelos numéricos, novos scores ou mais dezenas de arquétipos para compensar esses gaps. Não exigir preencher todas as dimensões em cada item. Priorizar a menor semântica verificável: dose específica por modalidade, mapeamento de exposição, contexto e exemplos de uso.

Alterações recomendadas para 0.2: (1) limpar tags não ancorados sem perder o catálogo; (2) expandir o arquivo compartilhado com dicionário e não aditividade; (3) referenciar contratos SIS/AEOS existentes, separar evidência observada de inferência e revisões; (4) trocar claims de materialização por exemplos sintéticos preenchidos com unknowns honestos; (5) consolidar um ledger curto de claims/limites. Não regenerar conceitualmente todo o catálogo: transformar os dois JSONs para remover/desativar faixas fixas e corrigir apenas registros comprovadamente afetados.

Para submissão humana formal, aproveitar o pacote mínimo já descrito em r4 POLICY_EVIDENCE, em vez de criar novo processo: receita/metadata com unidades, população/elegibilidade, adequacy/necessity/Change Cost, alternativas, horizonte, ausência/conflito, positivos/negativos e disposição por regra/versão. Perguntas vagas em G01_G04_REVIEW_PREP são úteis como pauta inicial, mas não bastam como pacote de aprovação. O profissional pode aprovar subconjunto e rejeitar/out-of-scope outros. Os pareceres humanos e G01–G04 permanecem externos e abertos.

Verificação da entrega: parecer restrito ao arquivo de ownership; achados confrontados com referências/linhas atuais; 49 registros inspecionados por seus metadados/campos candidatos; fontes identificadas por título/PMID e limites de acesso. Nenhum seed foi modificado por esta instância.
