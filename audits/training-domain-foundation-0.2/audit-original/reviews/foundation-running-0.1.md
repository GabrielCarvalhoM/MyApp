# Auditoria independente — Running — Foundation draft 0.1

Revisão documental independente, 22/10/2026. Autor desta revisão não participou da autoria do draft. Não representa aprovação profissional de treino. Nenhum gate é fechado e nenhum cenário é promovido.

## Escopo e prova inspecionada

Inspecionados integralmente `RUN_SESSION_ONTOLOGY.md`, `DATA_MODEL_CONTRACTS.md`, os **17 itens** de `SEED_DATASET_RUN.json`, `SCENARIO_DOMAIN_MAPPING.md`, `G01_G04_REVIEW_PREP.md`, `SHARED_TRAINING_DEMAND_MODEL.md`, `VALIDATION_REPORT.md`, `EVIDENCE_AND_PROVENANCE.md`; comparação com `inputs/product/RUN_INTELLIGENCE_SPEC.md` (RIL), `SPORT_INTELLIGENCE_SPEC.md` (SIS) e entradas pertinentes do Scenario Lab; C1–C6 comparados também com `outputs/closure-r4/COVERAGE.md`. O inventário determinístico `outputs/foundation-audit/structural-check-0.1.json` registra ZIP SHA-256 `1233e63e7706d76455e78b2c8205dd5c8238c4f205a511f54b62b0f754dfe1a9`, 17 IDs distintos, sem duplicata de ID.

A revisão não atribui bandas fisiológicas substitutas. Seus findings são demonstráveis por contrato, ausência de definição e inconsistência interna; não exigem inferir que uma banda alternativa seria cientificamente correta. A curadoria científica dos anchors e licenças é coberta pelo eixo de evidência/governança da auditoria principal.

## Veredito de escopo

**NOT READY para adoção como base autoritativa de domínio.** A direção paramétrica é séria e aproveitável, mas as definições de corrida são um esboço, não um contrato suficientemente determinado. Uma 0.2 pequena deve corrigir as representações e claims antes de uma revisão humana produtiva. Depois desses ajustes, poderá ser **READY FOR DOMAIN REVIEW**, continuando sem autorização prescritiva ou Product/Domain Truth.

Não há P0 comprovado no escopo: nenhum runtime ou prescrição real foi entregue. Os P1 abaixo bloqueiam a pretensão de foundation implementável/autoritativa; não impedem uma conversa exploratória com um profissional sobre o draft.

## Achados materiais

### RUN-01 — P1 — O contrato de blocos permite interpretações incompatíveis da mesma receita

**Local:** `DATA_MODEL_CONTRACTS.md:12–16`; `RUN_SESSION_ONTOLOGY.md:16–25`. Comparador: RIL §2, especialmente linhas 33–42, e Scenario Lab SIL-S02.

`RunWorkoutBlock` só enumera `type, completion_basis, work_amount, recovery_amount, target_reference, repeats, terrain_context, order`. Não define tipos/estrutura dos filhos, unidades, total de iterações, alcance de `repeats`, se existe recuperação após a última iteração ou como a recuperação recebe intensidade/completion/advance próprios. O texto promete completion/advance, mas `advance` não existe no contrato. Warm-up/cooldown são mencionados sem forma de representação. `recovery_amount` agregado incentiva uma recuperação anônima, embora o RIL exija step próprio e alvo próprio. Dois futuros implementadores poderiam gerar trabalho/descanso e totais diferentes sem infringir a lista.

**Correção mínima:** declarar união conceitual `step | sequence | repeat`, com IDs de nós, ordem dos filhos e `total_iterations >= 1`; step tem papel, quantidade tipada `TIME | DISTANCE | OPEN`, unidade, completion e advance independentes; recuperação é step normal. Declarar se o último recovery está presente na sequência ou é omitido pela receita, sem default silencioso. Totais de trabalho/recuperação/warm-up/cooldown são derivados, com classe estimado/prescrito/observado. Um exemplo estruturado misto e finito basta para demonstrar esta propriedade; não é necessário implementar executor/export.

### RUN-02 — P1 — A intensidade mistura métrica, papel, referência e condição de conclusão

**Local:** `SEED_DATASET_RUN.json`, `allowed_target_types` de `vo2_long_intervals`, ambos os hills, `strides`, `race_pace_session`, `taper_specific_session`; `DATA_MODEL_CONTRACTS.md:9–16`. Comparador: RIL §§2–3.

O vocabulário inclui `HR_secondary`, `pace_optional`, `pace_relative` e `time` junto de `HR`, `pace`, `power`, `RPE`. Secondary é papel, optional é cardinalidade/regra, relative é referência e time é quantidade/completion; não são a mesma dimensão. `primary_intensity_reference` é nome de campo sem contrato de `RunIntensityReference`; faltam construto/método, fonte/protocolo, unidade/faixa, data/revisão e limites de comparabilidade. Nenhum campo separa domínio fisiológico de intensidade da métrica que tenta operacionalizá-lo. "threshold" no nome não resolve qual limiar/construto foi autorizado. RPE de sessão versus step tampouco é discriminado.

**Correção mínima:** normalizar métrica separada de `PRIMARY/SECONDARY`, reference kind e obrigatoriedade; mover time para completion. Referenciar uma definição conceitual versionada de intensidade já exigida pelo RIL; permitir `UNKNOWN/NOT_CLASSIFIED` para domínio e alvo omitido por receita coberta, sem preenchimento populacional. Pace relativo precisa referência explícita. Não criar zonas nem limites novos.

### RUN-03 — P1 — Demandas dos 17 arquétipos não têm exposição de referência ou âncoras

**Local:** todos os 17 `domain_judgment_candidates`; regra de custo em `RUN_SESSION_ONTOLOGY.md:30–31`; shared model §Shared demand dimensions.

As candidatas estão honestamente marcadas `HUMAN_REVIEW_REQUIRED`, mas há uma banda de custo por nome sem dose, atleta, sessão típica definida ou escala ancorada. Exemplos: `short_intervals` tem metabolic `very_high` embora o propósito agregue `speed_economy_or_high_intensity`; `strides` metabolic `high`; fartlek é sempre high cardiovascular/metabolic; race é very_high em três dimensões sem evento/dose/estratégia; long_run é high lower e moderate cardiovascular. Não é necessário provar que cada valor é errado: **a proposição nem está suficientemente delimitada para ser julgada**. O próprio draft diz que arquétipo não determina custo.

Além disso, os seeds de corrida só preenchem quatro dimensões genéricas. Não exercitam muscle-group, eccentric, impact ou novidade, essenciais ao encontro lower × threshold/hills. Ausência não pode se transformar em low/zero. Há `contextual` dentro da escala de bandas, confundindo estado de conhecimento com magnitude.

**Correção mínima:** retirar estas bandas não ancoradas do payload consumível, preservando-as apenas em histórico de hipóteses a revisar; ou anexar exposição de referência + âncora da banda + fonte/julgamento + aplicabilidade, ainda bloqueadas para decisão. Enquanto isso, `UNKNOWN` e motivo são suficientes. Comparações de custo precisam instâncias prescritas no mesmo contexto e construto, nunca ranking direto de nomes. Incluir um exemplo que percorra as dimensões mecânicas locais sem inventar número/ranking científico.

### RUN-04 — P1 — C5/taper e criticality não têm relações implementáveis

**Local:** `RUN_SESSION_ONTOLOGY.md:13,22`; `RunPrescription` e `RunSessionArchetype` no contrato; seeds `race_pace_session`, `taper_specific_session`, `race`; `SCENARIO_DOMAIN_MAPPING.md` S13/S14/C5. Comparador: RIL §5.

Os seeds citam `event_context` e `goal_phase`, mas não há referência tipada a evento/fase/objetivo, revisão, prioridade confirmada ou relação da sessão com o estímulo essencial. `session_role` não define o que protege; criticality só existe em prosa. `taper_specific_session` tem `structure_type=contextual` e parâmetros "reduced_exposure/quality_retention", que são intenção do programa, não uma estrutura executável. Assim, o mesmo threshold pode ser key ou secundário, dentro ou fora de taper, mas o modelo não fixa esta diferença. C5 promete carregar aquilo que não representa.

**Correção mínima:** referências a objetos upstream de evento/objetivo/fase e `SessionIntent`/criticality, com versões e motivo/estímulo preservado. Tratar `taper_specific_session` como template de fase que compõe uma receita estruturada, conservando o ID se útil; não criar entidade de fase paralela. Diferenciar prova-alvo, prova secundária e teste quando cobertos; cancelamento/adiamento altera contexto, não restaura carga automaticamente. Deload, descanso e HOLD conservam os sentidos upstream.

### RUN-05 — P1 — Execution e C6 são promessas sem contrato; S29 não preserva a fronteira de agência

**Local:** `RUN_SESSION_ONTOLOGY.md:24–25`; ausência de RunExecution no contrato; `SCENARIO_DOMAIN_MAPPING.md` S29 e C6. Comparador: SIS §§5–7, RIL §§3–4/8, AEOS §2.1.

Uma frase sobre execução não define ligação do resultado ao step/repeat/revisão e referência efetivamente executados, observação desconhecida/partial/skip ou revisão do restante. `planned_or_observed` em EstimatedTrainingCost é insuficiente para reconciliação por segmentos sem dupla contagem. C6 afirma envelope separado, mas nenhum campo referencia membros/condições/escopo de um envelope previamente aceito. S29 fala em fato "suficientemente material" e omite que, para readaptar o restante após início com proposta pendente stale, ele deve ser **novo e posterior ao início**, não replay da mesma razão.

**Correção mínima:** definir RunExecution como projeção de refs canônicas existentes, preservando executing revision e step/repeat instance; mapear porção observada, remanescente e desconhecida sem assumir zero. Separar retirada deliberada de tentativa insuficiente. Acrescentar `accepted_envelope_ref`/membro/condições onde aplicável; fora do envelope exige proposta/ato próprios. Registrar material-fact ref e fronteira de início no cenário S29 por referência a AEOS, sem implementar workflow.

### RUN-06 — P2 — Os eixos de taxonomia estão misturados; não é necessária uma explosão do catálogo

**Local:** seeds `long_run`, `progression_run`, `tempo_continuous`, `threshold_continuous`, `short_intervals`, `fartlek`, `race_pace_session`, `taper_specific_session`.

O catálogo mistura duração/exposição relativa (long), estrutura (continuous/intervals/progression/fartlek), propósito/construto (threshold), evento/pace e fase (taper). Isso não torna os itens inválidos, mas falta regra de composição/identidade e cobertura. Tempo e threshold têm a mesma estrutura e não definem fronteira semântica; poderiam ser aliases ou templates distintos com construtos explicitamente diferentes. Short intervals junta economia/velocidade e estímulo cardiovascular intenso sob o mesmo perfil; o nome sozinho não pode escolher o objetivo.

**Correção mínima:** manter IDs como templates de composição e declarar quais eixos descrevem; precisar `training_purpose` e referência de intensidade na instância. Acrescentar uma nota de potencial alias tempo/threshold e resolver em revisão humana; não eliminar por estética nem criar uma família por duração/pace.

### RUN-07 — P2 — Terreno/subida/descida e novidade aparecem sem prova de representação

**Local:** `RUN_SESSION_ONTOLOGY.md:11`; `RunWorkoutBlock.terrain_context`; hills seeds; shared model exemplo Heavy lower + hills e `VALIDATION_REPORT.md` exemplo 4. Comparador: RIL §§2/4/7.

`grade_context` é uma string de nome de parâmetro, sem unidade/sinal/origem/unknown. Trabalho subindo e recuperação descendo podem expor demandas diferentes; "hill repeats" não permite inferir automaticamente excêntrica ou impacto altos. O exemplo 4 da validação é condicional, mas não mostra os fatos que qualificariam a demanda excêntrica. Falta demonstrar que terreno é contexto por step, incluindo subida/descida/superfície/novidade e comparabilidade, em vez de metadado fixo do arquétipo.

**Correção mínima:** contexto tipado opcional e desconhecido, conhecido por bloco/step quando material; um witness com trabalho uphill e recovery downhill versus sem descida. Sem escalar automático nem novo arquétipo obrigatório de downhill/trail. Uma variação de contexto basta para testar a ontologia.

### RUN-08 — P2 — O pacote sobredeclara testes e preparação de revisão humana

**Local:** `VALIDATION_REPORT.md`, checks "PASS" planned/observed e unknown/missing; `G01_G04_REVIEW_PREP.md` G03; mapping C1–C6.

As estruturas afirmadas em G03 não estão materializadas em JSON e os estados missing/unknown não são definidos nos contratos. Seis exemplos em prosa não são evidência de round trip de prescrição/execução. A lista de perguntas é um roteiro útil, mas o treinador terá de inventar os próprios casos/dados antes de responder. Isso repete o limite que o r4 já explicitou: um slot não é um witness esportivo.

**Correção mínima:** substituir PASS de comportamento por `DESIGN_INTENT/UNVERIFIED` onde só há texto; declarar o que foi realmente checado. Anexar poucos exemplos estruturados reaproveitados entre cenários, com questões e campos pendentes de resposta profissional. Não encomendar um novo engine, harness ou estudo empírico para esta etapa.

## Revisão individual — todos os 17 seeds

Os 17 são úteis como hipóteses de repertório. Todos herdam RUN-02/03 (metadados/intensidade e custo sem domínio/exposição/âncoras) e proveniência genérica, não item/campo. "Manter" abaixo conserva o template, não aprova sua dose ou banda. Nenhum item fornece prescrição concreta completa, progression/regression knob operacional, exposure profile ou execution instance.

| ID e linha inicial no JSON | Avaliação individual | Menor ajuste útil |
|---|---|---|
| recovery_run — 7 | Propósito adequado como intenção; rótulo não comprova que correr melhora recuperação deste atleta. Estrutura contínua é representável. | Distinguir intenção de efeito observado; dose/intensidade/eligibilidade pela receita e contexto. |
| easy_run — 49 | Bom template básico. Não se distingue esforço da dose total nos bands; easy curto/longo é o contraexemplo do próprio draft. | Manter, remover custo fixo e instanciar duas durações no mesmo atleta. |
| steady_run — 91 | Pode ser template distinto, mas "steady/aerobic_endurance" não define fronteira com easy/tempo. | Definir construto por receita e marcar desconhecido até referência; sem zona universal. |
| long_run — 133 | Útil para exposição prolongada relativa ao histórico. Não é apenas uma forma, pode conter segmentos com propósito próprio. | Duração/distância e papel no horizonte; permitir estrutura segmentada, custos derivados da dose/exposição. |
| progression_run — 176 | Capta progressão interna à sessão, diferente de progressão entre ciclos. Não existem segmentos nem limites no seed. | Segments ordenados e referência por step; declarar que aceleração prescrita não é mutação do plano. |
| tempo_continuous — 219 | Propósito `sustained_quality` amplo; potencial alias de threshold sem fronteira. | Resolver alias ou distinguir intenção/construto aprovado; não dar custo diferente só pelo nome. |
| threshold_continuous — 262 | Família útil, mas threshold não é construto autoexplicativo nem zona universal. | RunIntensityReference e dose da receita; manter continuous como forma. |
| threshold_cruise_intervals — 305 | Bom par para testar preservação de estímulo versus densidade. Work/recovery não são objetos tipados nem há última recovery. | Work/recovery steps + total iterations; preservar intenção via relação aprovada, não inferida do nome. |
| vo2_long_intervals — 350 | "VO2-style" evita declarar medida de VO2max; coerente como hipótese de propósito. HR_secondary não é tipo de métrica. | Separar metric/role, método de referência e densidade; não inferir VO2max alcançado. |
| short_intervals — 395 | Mistura economia/velocidade e high intensity com um metabolic very_high. Principal ambiguidade de propósito do catálogo. | Selecionar intenção no template/receita; não precisa multiplicar IDs para todas as combinações. |
| fartlek — 439 | É estrutura variável, com doses potencialmente muito diferentes; bands high não têm exposição definida. | Sequência/variabilidade finita ou envelope previamente aceito, sem esforço default. |
| hill_repeats_short — 482 | Distingue propósito neuromuscular, mas mistura time com intensidade e não representa modo de recuperação/descida. | Mover time para completion; contexto por step; qualificar custo por dose/atleta/terreno. |
| hill_repeats_long — 527 | Propósito aerobic_power_hills pode servir, mas long/short não têm limites definidos e high local depende contexto. | Delimitação recipe-specific sem corte universal, recuperação estruturada e origem da inclinação. |
| strides — 572 | Template neuromuscular útil; `full_recovery` é política/critério não definido. `pace_relative` carece referência. Metabolic high não está ancorado. | Reference kind e completion/advance da recuperação; foco/dose de cada exposição, sem impor banda. |
| race_pace_session — 615 | Bom template de especificidade; evento determina qual referência e estímulo, sem significar intensidade high universal. | Event/goal revision e referência de pace/intent; forma contínua ou repetida instanciada. |
| taper_specific_session — 659 | É intenção de fase, não forma executável; `contextual` não é uma banda nem um tipo de estrutura operacional. | Conservar como phase-template que compõe receita de uma família; referência à fase/evento aceita e stimulus-retention requirement. |
| race — 703 | Evento e competição têm relevância própria; distância sem evento/data/prioridade/comportamento não basta. Três very_high não são fatos. | Event ref e objetivo/estratégia confirmado; separar competição de teste quando no escopo; custo contextual. |

**Suficiência de quantidade:** 17 templates cobrem repertório inicial suficiente para testar a representação. Acrescentar dezenas não resolveria estes findings. Falta diversidade de **instâncias verificáveis**: contínuo simples versus longo; repeat com recovery final explícito; sessão segmentada; hills com recuperação em descida; alvo manual/unknown; evento/taper; execução parcial com mudança de revisão; envelope aceito. Essas formas podem compartilhar exemplos/casos. Teste/assessments e terreno adicional devem ser declarados fora de cobertura se não houver receita aprovada, sem ampliar escopo silenciosamente.

## Domain coverage dos oito QUESTIONABLE

Esta tabela é cobertura representacional/de dados, não veredito esportivo nem nova classificação do AE.

| Caso | Cobertura no 0.1 | Lacuna concreta para materializar |
|---|---|---|
| S01 | PARCIAL: lower nomeado + threshold/cruise nomeado. | Nenhum sets/reps/RIR/run blocks/dose, timing/atleta, efeito sobre estímulo essencial ou alternativas menores. Não permite dizer se há conflito material. |
| S02 | PARCIAL: possibilidade de inverter prioridade está na prosa. | Instanciar exatamente o mesmo par e alterar somente prioridade; efeitos nos objetivos precisam avaliação, não runner-first implícito. |
| S05 | PARCIAL em conceito; sem histórico/sinais comparáveis instanciados. | Exposições com lineage, esforço e sono com fonte/tempo, performance comparável e incerteza. Convergência não é contagem automática de sinais. |
| S12 | PARCIAL e predominantemente Strength; Run context não foi representado. | Desvio observado contra revisão vigente, demanda projetada no horizonte de corrida e ausência de recompensa/compensação automática. |
| S13 | PARCIAL: key/phase/event são nomes. | SessionIntent, estímulo essencial e criticality/contexto versionados; par de alternativas demonstra o que seria preservado e a que custo. |
| S14 | PARCIAL: sessão secundária/easier é rótulo. | Mesmo caso de S13 mudando apenas criticality/receita justificável; papel baixo não torna mudança necessária nem descartável. |
| S28 | NÃO MATERIALIZADO: só descreve slots de retorno. | Exposição anterior, duração/causa não clínica da pausa e contexto/restrição atual, receita de re-entry a revisar. Não restaurar pace antigo nem compensar. |
| S29 | PARCIAL: texto sobre planned/completed/remainder. | RunExecution com step/repeat/revision; novo fato posterior ao início; proposta/ato do restante sem reescrever o passado. |

## C1–C6 comparados ao closure r4

O closure r4 já possuía witnesses de controle estruturados, com domínio aberto. O 0.1 não os instancia com receita/dose e, em alguns pontos, reduz o detalhe para uma frase. O ganho é repertório nomeado, não fechamento de coverage esportiva.

| Gap | Cobertura do 0.1 | Correção necessária |
|---|---|---|
| C1 trajetória | PARCIAL conceitual, inferior ao detalhe de snapshots do r4. | Vincular projeções a ExposureRefs/revisões e observação/unknown por segmento; um exemplo multi-dia reutiliza os mesmos fatos sem soma dupla. Sem fisiologia cumulativa inventada. |
| C2 double | PARCIAL: dois prescriptions podem ser citados; timing não é tipado nem a interação instanciada. | Dois payloads, janelas/ordem e próximos estímulos no horizonte; distinguir solução logística de suficiência esportiva. |
| C3 Balanced | PARCIAL: "preserved intent/Pareto" é promessa; nenhum efeito/candidato concreto. | Efeito por objetivo/estímulo e admissibilidade/policy separada de preferência; desconhecido não é opção dominada. |
| C4 níveis | NÃO MATERIALIZADO esportivamente; enumeração de micro/volume/move/substitute/replan não fornece antes/depois. | Poucos deltas estruturados de template para review, sem fingir witnesses positivos de níveis 5/6 ou falha de menores. |
| C5 taper | PARCIAL, por rótulo event/taper. | Fase/evento/revisão e receita concreta com intenção de retenção; mudança de evento explicitamente contrafactual e sem restauração automática de carga. |
| C6 envelope | AUSENTE no contrato, apesar da alegação do mapping. | Envelope aceito com membros, condições, alcance/revisão e variante dentro/fora; separar earned progression do simples cumprimento. |

## Handoff mínimo recomendado

1. **Antes de mandar como pacote de revisão:** corrigir RUN-01/02/04/05; retirar consumo decisório de bandas não ancoradas (RUN-03); reduzir claims da validação/mapping para a prova existente.
2. **Exemplos sintéticos de forma:** um pequeno conjunto reaproveitável, com números apenas como exemplos de representação e `SYNTHETIC_NOT_PRESCRIPTIVE`, ou parâmetros explicitamente a preencher pelo revisor. Não fazer política universal nem transformar estes exemplos em recomendação de treino.
3. **Perguntas ao profissional:** para cada proposta, qual população/exposição ela cobre, que construto/intenção preserva, o que não pode ser comparado, que dados faltantes restringem a decisão, que menor delta é suficiente e com qual evidência. Respostas/pendências registradas com revisão/escopo.
4. **Não exigir da 0.2** uma biblioteca completa, cutoffs de spacing, doses aprovadas, algoritmo de custo, motor de progression ou fechamento dos oito casos. Esses são outcomes posteriores das autoridades de domínio pertinentes.

O seed run precisa de **migração editorial dirigida dos 17 itens**, preservando IDs e a ideia paramétrica. Não é necessário regenerar o catálogo inteiro nem inventar mais workouts. A next step recomendada é 0.2 documental com representação demonstrável → human sports-domain review, sem autoridade automática na promoção de versão.
