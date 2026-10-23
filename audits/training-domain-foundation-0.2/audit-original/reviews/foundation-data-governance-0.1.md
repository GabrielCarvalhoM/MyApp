# Revisão independente — dados e governança — foundation draft 0.1

Escopo: contratos, coerência entre documentos/seeds, linhagem, estados, ligação ao AE e preparação da revisão humana. Revisão do pacote original em `outputs/foundation-audit/input-draft-0.1`; nenhuma avaliação da 0.2 nesta revisão. Inputs comparativos: AEOS-1.2-r2, SIS-1.1-r2, PDM-1.3, PDR e specs Run/Strength retidas pelo filtro de autoridade atual. Não foram editados inputs, gates ou casos. O hash do ZIP original registrado no structural-check é `1233e63e7706d76455e78b2c8205dd5c8238c4f205a511f54b62b0f754dfe1a9`.

**Veredito desta perspectiva: NOT READY para base autoritativa; precisa de 0.2 antes da revisão humana estruturada.** Há uma direção conceitual útil e não encontrei P0. A separação identidade/prescrição/custo e a proibição de transformar overlap em causalidade estão corretas como intenções. Contudo, os contratos não demonstram os próprios PASS nem a cobertura C1–C6 anunciada. Um treinador poderia comentar o material, mas ainda teria de inventar os objetos e exemplos que deveria estar julgando.

## Findings

### DG-01 — P1 — referências, cardinalidades e autoridade não são um contrato verificável

**Local:** DATA_MODEL_CONTRACTS.md:3–31; G01_G04_REVIEW_PREP.md:3–18.

Os campos são listas de nomes sem tipos mínimos, unidades, cardinalidades, identidade/revisão do dono ou regras de ausência. Por exemplo, `exercise_id` não diz se aponta à revisão original ou corrente; `StrengthPrescription` não tem identidade de prescrição/sessão, `sets[]` não define conjunto vazio/ordem/identidade da série; `RunWorkoutBlock` não define árvore/repeat recovery/completion; `SubstitutionRelation.approval_status` não informa aprovador, escopo/população, vigência ou revogação. A mera presença de `revision` em duas entidades não versiona o grafo.

AEOS:18 já fornece `Ref<T>` imutável e `Option<T>` com motivo; AEOS:57–60 fornece FactRef, Signal e AuthorityRef; SIS:55–66 exige a mesma herança e policy única. Não é necessário criar outro registry nem implementá-los agora. O problema é o draft não declarar essa herança nem mapear seus nomes aos contratos donos. Sem isso, uma aprovação humana pode ser indevidamente entendida como geral, permanente ou aplicável a uma receita diferente.

**Fix mínimo:** uma seção de convenções herdadas + tabela curta por entidade: owner/id/revisão, relações 1/0..1/0..n/1..n, unidades/escala quando necessárias, semântica de ordem, refs dos objetos aprovados e `Option` com motivo. Toda aprovação usa AuthorityRef existente; ausência/revogação retém somente o uso dependente. Não adicionar API, banco ou plataforma de schema.

### DG-02 — P1 — estados desconhecidos e eixos de estado estão subespecificados

**Local:** VALIDATION_REPORT.md:10–12; DATA_MODEL_CONTRACTS.md:18–28; SHARED_TRAINING_DEMAND_MODEL.md:29–31.

O PASS “Unknown/missing values have an explicit place” não é sustentado: não há motivo tipado de ausência, distinção de não aplicável/inválido/conflitante ou exemplos desses estados. O campo `status` das dimensões não tem vocabulário. `planned_or_observed` e `observed_vs_estimated` não são sinônimos: uma exposição observada pode alimentar custo estimado; uma prescrição planejada também. O shape shared apresenta um perfil como uma única dimensão, enquanto DATA_MODEL apresenta `dimensions[]`, derivação e revisão. Um consumidor não sabe se são tipos diferentes ou projeções do mesmo tipo.

**Fix mínimo:** herdar Option/Signal AEOS; ausência nunca vira zero/low. Representar conflitos por refs às alegações discordantes com estado explícito, sem média automática. Separar eixo da exposição (`PLANNED`/`OBSERVED`) do estatuto epistêmico (`MEASURED`/`REPORTED`/`DERIVED`/`UNKNOWN` ou equivalente já dono). Um único TrainingDemandProfile canônico, com exemplos de dimensão aplicável conhecida, desconhecida e não aplicável. Não impor um ordinal universal: o vocabulário e âncoras de cada dimensão permanecem review-required.

### DG-03 — P1 — planned/completed/correction e não dupla contagem ainda não estão materializados

**Local:** DATA_MODEL_CONTRACTS.md:3–28; SCENARIO_DOMAIN_MAPPING.md:14,17,22; VALIDATION_REPORT.md:10; STRENGTH_EXERCISE_ONTOLOGY.md, seção StrengthExecution; RUN_SESSION_ONTOLOGY.md, seção RunExecution.

As ontologias citam Execution, mas o contrato não o define nem liga planejado/chosen/executing/completed/realizado por refs. Não existe associação ao fato canônico e revisão/escopo da ExposureContribution do SIS. Logo C1 (“reconciled … without summing … twice”) é intenção, e C6 (“autoregulation envelope is represented separately”) não encontra campo/entidade correspondente. S29 não tem vínculo executado versus resto nem fronteira de fatos. Falta mecanismo conceitual para correção substituir contribuição anterior, partes omitidas/desconhecidas e uma atividade externa ser associada sem similaridade virar prova.

**Fix mínimo:** adotar objetos Execution/ExposureContribution/SessionIntent/SessionDemand existentes, em vez de duplicá-los. Acrescentar uma fixture com prescrição p1, revisão escolhida/executando, sets/steps completos, restante, fato corrigido v2 e contribuição anterior suprimida; outra com envelope planejado versus nova mutação. Demonstrar por identidade/escopo, sem cálculo de fadiga ou regra esportiva inventada. C1 e C6 só passam a “representáveis” após esses exemplos, sem fechar os casos.

### DG-04 — P1 — seed informativo não fornece factual lineage e candidatos não têm condições de interpretação

**Local:** ambos SEED_DATASET_*.json, campo provenance de todos os itens; FOUNDATION_OVERVIEW.md, Core separation; DATA_MODEL_CONTRACTS.md:30–34.

Os 32 e 17 IDs são únicos e contagens conferem; isso é uma verificação de serialização/inventário. Os campos de provenance repetem descrições genéricas (“informed by … datasets”, “derived from … literature”), sem fonte/registro/revisão/field mapping. Não há evidência para promover nenhum nome, músculo, equipamento ou tag a fato importado de uma base escolhida. Isso não prova cópia comercial; tampouco prova origem/licença por item. `DOMAIN_REVIEW_REQUIRED` no topo e `HUMAN_REVIEW_REQUIRED` nos candidatos são contenções úteis, mas não tornam os metadados defensáveis. As bandas não dizem “comparado a quê, sob qual dose/técnica/atleta”.

**Fix mínimo:** marcar os seeds como candidatos autorais não verificados, inclusive taxonomia/músculos/equipamento, preservando os 49 IDs. Criar refs de fontes verificadas apenas para campos realmente conferidos, com fonte/revisão ou acesso e claim/limites; distinguir classe de provenance de evidência e aprovação. Para tendências sem condições/âncoras, usar unassessed ou isolar como hipótese qualitativa explicitamente não consumível por ranking. Revisão humana valida campo/escopo/revisão, não o arquivo inteiro por associação. Não regenerar o catálogo por quantidade; uma migração pontual de estados/provenance é suficiente.

### DG-05 — P1 — preparação G01–G04 e “materializações” ainda são perguntas genéricas

**Local:** G01_G04_REVIEW_PREP.md:3–18; SCENARIO_DOMAIN_MAPPING.md:3–22; VALIDATION_REPORT.md:15–29.

Não há perfis de atleta concretos, prescrições completas com referências, alternativas de substituição, fonte/revisão do estado, caso aceito/rejeitado/insuficiente nem formulário de decisão. G03 declara estruturas “now reviewable”, mas seus objetos/exemplos não existem; G04 diz onde restrições gateiam, mas não apresenta uma referência de restrição/eligibilidade e seu efeito. Os sanity examples são expectativas textuais, não testes executados nem oráculos aprovados. A cobertura é de nomes de conceitos, não testemunhos dos casos. `StrengthVariation` também inexiste como contrato; pode ser descrição referenciada na identidade existente, mas precisa de uma escolha explícita para não duplicar séries/exposições.

**Fix mínimo:** pequeno conjunto de fixtures sintéticas que reutilize os 49 seeds e cubra S01/S02, S05/S12, S13/S14, S28/S29 e C1–C6. Dar fatos, revisões, dose/estrutura, perfil/contexto, ausências/restrições, intenções protegidas, alternativas e perguntas que o humano decide. Registrar parecer com conteúdo/revisão/competência/limites/razão e resultado `ACCEPT / REVISE / INSUFFICIENT` ou equivalente; não inventar parecer nem fechar G01–G04. Remover PASS sem evidência e substituir “materialização” por “esboço” onde ainda faltar exemplo. Amostra suficiente é cobertura desses mecanismos, não um novo catálogo enorme.

### DG-06 — P2 — semântica de custo e proliferação de tipos exigem crosswalk

**Local:** DATA_MODEL_CONTRACTS.md:18–28; SHARED_TRAINING_DEMAND_MODEL.md:29–31; STRENGTH_EXERCISE_ONTOLOGY.md, EstimatedStrengthCost; SCENARIO_DOMAIN_MAPPING.md:19–20.

TrainingDemandProfile, EstimatedStrengthCost/EstimatedTrainingCost e InterferenceAssessment/InterferenceContext não têm relação formal com SessionDemand/ExposureContribution/InteractionAssessment que já pertencem ao AEOS/SIS. `cost` também pode ser lido como ChangeCost, mas custo fisiológico estimado não mede custo da mudança do plano (disrupção, aprendizagem, perda de estímulo, agenda). A foundation pode informar adequacy/necessity e a comparação de alternativas; não os decide sozinha.

**Fix mínimo:** declarar aliases/projeções e consumidores por responsabilidade; eliminar o nome duplicado quando não trouxer semântica própria. Training cost é vetor derivado vinculado a dose/contexto/exposição; ChangeCost permanece dono AEOS/AEC e compara mudança/horizonte. SubstitutionRelation é direcional e condicionada ao estímulo/contexto, não equivalência simétrica nem aprovação de efeito clínico. Bastam 2–3 relações candidatas contrastantes com preservado/alterado/desconhecido, não grafo completo de 32×32.

### DG-07 — P2 — vocabulários misturam dimensões ortogonais e sentinelas

**Local:** ambos seeds; DATA_MODEL_CONTRACTS.md.

`mechanic` mistura `compound/isolation` com `core`; movement_patterns contém `unilateral` já modelado em laterality. Equipamentos usam strings “A_or_B” que não distinguem alternativa de requisito conjunto. Run allowed_target_types mistura métrica, papel (`HR_secondary`), opcionalidade (`pace_optional`) e dose (`time`); bandas incluem `contextual` junto de ordinais. São ambiguidades de máquina e também de revisão humana, mesmo sem implementação.

**Fix mínimo:** normalização limitada: métrica separada de papel/obrigatoriedade; requisitos de equipamento any/all em uma representação simples; contextual/unassessed separados de valor ordinal; laterality separado de padrão. Não impor uma ontologia anatômica enorme: um vocabulário controlado pequeno com aliases resolve a maior parte.

## Critérios de saída proporcionais para 0.2

1. Referências e herança AEOS/SIS explícitas; um shape por objeto, sem segundo Athlete Model/policy registry.
2. `Option`/conflito/não aplicável e planned/observed versus estimado demonstrados, sem default fisiológico.
3. Fixtures referencialmente consistentes provando correção/não dupla contagem, parcial/restante e envelope versus mutação; cobertura concreta de todos os IDs S/C pedida, sem novo verdict esportivo.
4. Seeds classificados conforme origem real; claims de fontes não verificadas removidos; tendências sem âncoras impedidas de virar dado factual ou custo automático.
5. Parecer humano preparado por escopo/revisão/competência e questões; nenhum approval fabricado. Reuso das regras de vigência/revogação existentes.
6. Relatório de validação diferencia parse/IDs/crossrefs comprovados, representação documental inspecionada e domínio não avaliado. READY FOR DOMAIN REVIEW significa pacote julgável, não Truth promovida.

As mudanças acima são documentais e pequenas em número de mecanismos. Não exigem runtime, JSON Schema completo, migração de produto, novo estudo ou mais centenas de exercícios. A revisão humana pode começar após 0.2 verificável; Product/Domain Truth exige autoridade e aceite reais do conteúdo/revisão aplicável.
