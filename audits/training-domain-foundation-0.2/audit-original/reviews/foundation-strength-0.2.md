# Parecer independente de delta — Strength — foundation 0.2

Data: 2026-10-22. Juiz: a mesma instância independente que revisou a perspectiva Strength 0.1; sem autoria de correções/pacote 0.2. Escopo delimitado: verificar resolução/contenção dos achados STR-01–09 para **handoff humano de um subconjunto**, sem reabrir toda a pesquisa ou conferir autoridade esportiva.

## Veredito

**READY WITH FIXES para revisão humana delimitada.** Nenhum bloqueio documental adicional ao handoff desse subconjunto foi identificado. A 0.2 fornece configurações, doses e execução suficientemente concretas para o responsável humano aceitar/rejeitar/alterar a forma e os exemplos sem ter de inventar toda a representação. Taxonomia, comparadores, pertinência das doses, elegibilidade e receitas continuam pendentes. **Não está pronta para Product/Domain Truth ou uso prescritivo.**

A autorização para revisar a estrutura não é uma aprovação das doses sintéticas. Não foram fechados G01–G04, C1–C6 ou os oito QUESTIONABLE. Este juiz não é o profissional humano responsável por esses gates.

## Inputs e prova de identidade

Recalculei SHA-256 de **todos os 15 arquivos** listados em `outputs/foundation-audit/review-input-manifest-0.2.json`: **15/15 coincidem**, inclusive bytes. Isso verifica o manifesto realmente recebido, sem pressupor que o check do autor esteja correto.

| Objeto | SHA-256 verificado |
|---|---|
| `review-input-manifest-0.2.json` | `b33c0f8242a50121c51faf01eb6344384bbadfe02bdb0f17573a3db13b915de0` |
| `checks-0.2.json` | `c9b5dc69216c5a46e5db922024550d7af2afe3977721f7ee6c5abdca9111cf63` |
| `STRENGTH_EXERCISE_ONTOLOGY.md` | `8d99537bf18b9310dc7b6043b97be453a701d192fd92b2834a876d03e9b4b641` |
| `DATA_MODEL_CONTRACTS.md` | `ad9008a8b35cefd748a148c6cc17dc5aa7551973e9d250e8c8bfd7e6ac8d6bec` |
| `SEED_DATASET_STRENGTH.json` | `070d5d9bccafc3794c3280d413007af457f6f51f3cc9d776f9122764b5d6147a` |
| `DOMAIN_REVIEW_FIXTURES.json` | `69d4ce4783c52e0cf342bae45c3e3e775290c1aa6307acf443555ae8048cfab3` |
| `G01_G04_REVIEW_PREP.md` | `267c62319a818182ce1366de5506c26a134485d8793f16c7ef22dd4c1227770b` |
| `VALIDATION_REPORT.md` | `bde4854942a028dd651bee5031980ad3494b44844f23ea9eab5a4c92dd2afe0e` |

Leitura semântica realizada: contrato/ontologia, estrutura dos 32 seeds, todas as sete configurações e seis prescrições Strength, relação de substituição, reconciliação/correção e cenários S12/S29/C3/C6, além de G01–G04 prep e validation report. `checks-0.2.json` relata 40 PASS/0 FAIL; não executei novamente o checker integral e não adoto sua saída como prova de fisiologia ou runtime. Executei verificações próprias sobre os 32 itens: IDs/ordem retidos; todos demand estimates UNKNOWN/null; todos source mappings UNVERIFIED; todas approvals ausentes; nenhuma banda antiga de custo permanece nos campos ativos de julgamento, que contêm apenas objective tags/status.

## Disposição dos achados Strength 0.1

| Achado | Delta observado | Disposição neste handoff |
|---|---|---|
| STR-01 configuração/carga | `StrengthVariation`, referências/revisões, equipamento AND, modo de resistência, laterality e convenções de carga definidos. Sete configurações ilustram suporte/carga; prescriptions selecionam uma configuração. Split squat usa carga por mão e IDs por lado. | **CORRECT para representação do subconjunto.** Os 32 nomes continuam famílias não elegíveis, explicitamente. Configurar todas não é pré-requisito para revisar estes exemplos. |
| STR-02 execução/parcial/revisão | Contrato de StrengthExecution e ExposureContribution preserva target revision, segmentos, observação/recebimento/correção e distinção entre observado e projeção. Reconciliação substitui log rev1 por rev2, duas entregas não viram dois fatos; prefixo observado usa sq-1/sq-2. S29 conserva feito, identifica fato posterior ao início e limita proposta ao restante. | **CORRECT para forma/handoff.** O exemplo não implementa reconciliação nem prova decisão esportiva. Target/observação/revisão restante continuam objetos distintos. |
| STR-03 isometria | `side_plank_hold` estático/isométrico, dose de 20s por lado, set IDs únicos; não inventa repetições ou RIR de rep para a sustentação. Banda excêntrica removida. | **CORRECT para representação.** Duração/forma e esforço continuam sintéticos, sem recomendação. |
| STR-04 bandas fixas | As 32 estimativas são UNKNOWN/null; bandas axial/excêntrica/skill/stability antigas removidas do seed ativo, sem nova hierarquia inventada. Contrato exige comparison basis/método/aplicabilidade para uso futuro. | **CORRECT por retirada da falsa precisão.** Comparadores profissionais são trabalho G02, não blocker para começar review. |
| STR-05 substituições | Relação dirigida remada inclinada→apoiada, configuração, objetivo candidato e dimensões alteradas; custo/elegibilidade desconhecidos e approval null. Duas prescriptions tornam a pergunta inspecionável sem transportar automaticamente carga/PR. | **CONTAINED e reviewable.** Ainda não é substituição admissível; preservação/perda de estímulo, dose e comparabilidade precisam decisão humana. Não há falsa alegação de custo menor. |
| STR-06 factual/provenance | Taxonomia/configuração explicitamente DOMAIN_JUDGMENT; source_mapping UNVERIFIED em todos; nenhuma adoção/importação externa alegada. | **CORRECT por reclassificação honesta.** Verificação de fonte e conteúdo continua pendente antes de factualidade autoritativa. |
| STR-07 eixos/músculos | `unilateral` removido de padrões em exemplos pertinentes; demais mixed axes, mechanic core e parent/child muscle labels explicitamente candidatos não normalizados e proibidos para roll-up numérico. | **CONTAINED como residual G01**, suficiente para review humano. Normalização permanece obrigatória antes de filtros/cálculos elegíveis. |
| STR-08 purpose/transferência | Running-specific tags são intenção de uso; omissão não exclui objetivos e tag não prova transferência ou prevenção. | **CORRECT semanticamente.** Seleção de repertório/claims segue G01/G02/G11. |
| STR-09 PASS excedia prova | Validation report agora limita prova à forma/subconjunto, não herda PASS autoatribuído 0.1. Prep distingue structure/source/approval e pede decisões por recorte. | **CORRECT no claim de readiness.** Checks de artefato não viram aprovação científica ou generalidade de schema. |

## Residuais que acompanham o handoff

Não há P0/P1 novo que impeça entregar a 0.2 aos revisores humanos para esse escopo. Permanecem condições explícitas para qualquer uso autoritativo:

- **G01:** decidir perfis/objetivos e cobertura, normalizar vocabulário de músculos/padrões/mechanic/laterality, configurar o que for efetivamente suportado e verificar source mapping onde factualidade externa for reivindicada.
- **G02:** julgar doses/estímulo essencial/custos comparáveis/substituições/progressão/envelopes e relevância do contexto. Relação de substituição e números sintéticos são perguntas, não respostas aprovadas. Não é necessário criar modelo universal para revisar uma receita delimitada.
- **G03:** aprovar comparabilidade/tolerâncias/aderência e semântica de registros completos/parciais. O exemplo S12 isola uma série extra, sem converter “mais RIR” em mais estresse ou conceder progressão automática. S29 ainda não tem alternativa esportivamente validada.
- **G04:** elegibilidade/restrição/retorno dependem da competência apropriada. Configuração presente não é clearance; desconhecido não vira treino conservador presumidamente seguro.

Refinamentos técnicos de forma, como um tagged union formal para carga corporal versus externa, enum fechado de estados e mais fixtures de máquina/assistência/warm-up/superset, pertencem à futura formalização quando exigidos por um consumidor/escopo. Os exemplos atuais explicitam bodyweight com valor/unidade nulos e convenção própria; o contrato conceitual e o escopo SYNTHETIC_ONLY evitam tratar isso como kg medidos. Não identifiquei motivo para tornar tais refinamentos condição de uma revisão humana da estrutura ou para expandir o catálogo agora.

## Próxima ação adequada

Entregar a 0.2 com hashes e estes limites ao profissional responsável por um recorte G01/G02/G03, registrando aceitação/rejeição/condições por configuração, receita e regra. Preservar os fixtures sintéticos e as pendências humanas. Novas mudanças documentais só são necessárias se a revisão trouxer uma insuficiência concreta; não há necessidade de outra rodada abstrata nem de uma regeneração dos 32 itens para fazer o handoff.
