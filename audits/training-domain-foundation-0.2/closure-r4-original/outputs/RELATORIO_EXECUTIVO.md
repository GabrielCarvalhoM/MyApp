# Vilumo Fit — validação documental do Adaptive Engine

Revisão AE-DOC-20261022-r3 · 22/10/2026, America/Sao_Paulo.

**Veredito: NO-GO para runtime prescritivo/adaptativo como autoridade de treino.** Contratos e infraestrutura neutra podem avançar em futura missão autorizada, **GO WITH FIXES**, com fixtures sintéticas isoladas. O motor especificado tem bons controles, mas este corpus ainda não demonstra competência de excelente treinador híbrido em situações esportivas completas.

Foram avaliados individualmente **80 cenários e 9 sequências**, total de **89 registros**: **61 PASS, 19 ACCEPTABLE e 9 QUESTIONABLE; 0 WRONG e 0 DANGEROUS demonstrados**. Nos cenários: {'PASS': 54, 'ACCEPTABLE': 17, 'QUESTIONABLE': 9, 'WRONG': 0, 'DANGEROUS': 0}. Nas sequências: {'PASS': 7, 'ACCEPTABLE': 2, 'QUESTIONABLE': 0, 'WRONG': 0, 'DANGEROUS': 0}. Cada registro tem classificação, rationale, dez dimensões justificadas, decisão/limites, fontes, preserve/modify, nível, trade-off, confidence, proibições, agência e próxima verificação. Os nove Q também têm decisões por passo e trajetória própria.

A contagem “47 + 9” era o subtotal do corpo original: as extensões atuais acrescentam 14 SIL, 7 TD e 12 FZ. A seleção usa o índice CI-3.3.0 e o AESL atual, com fontes congeladas e SHA-256 em [manifesto](../inputs/manifest.json). Cópias de review e snapshots não foram somados. Cada linha pode conter variantes: não são 89 atletas ou 89 execuções de software.

## O que funciona bem

As autoridades distinguem aprendizagem de mutação; plano adequado permanece em KEEP. Restrição local domina HRV favorável (S07/S42); fonte atrasada não vira treino perdido (S08/S09); falta não cria dívida de volume; redução deliberada não conta como falha nem conquista do alvo removido (SIL-S04). Exposições não são somadas novamente por provider, especialista ou estimativa de interferência (S22/SIL-S07/S08). Composto é validado no horizonte inteiro (S47), e agência/revogação/versões têm guardas explícitas.

O par S01/S02 deriva uma diferença coerente de ranking: Run-first protege threshold movendo lower; Strength-first protege lower movendo threshold. Essa diferença é **condicional** à necessidade e admissibilidade, não uma prescrição real validada. Balanced usa dominância/Pareto e ASK quando há sacrifício material sem regra/preferência; não é 50/50 nem default de corrida. Com safety restritiva, S42 corretamente conserva o mesmo HOLD em ambas as prioridades.

## Onde a avaliação não fecha

O problema material mais claro é a migração de expectativas antigas. O próprio AESL §10 exige adequacy/necessity/ChangeCostRule e razão de KEEP insuficiente para antigos expected de mudança. S01/S02/S05/S12/S13/S14 e ramos de S28/S29 não fecham essas precondições. Repetir o vencedor escrito na tabela seria validar a própria premissa. A escolha exata fica NOT_EVALUABLE até a migração; uma regra crítica ausente numa instância futura exigiria HOLD dependente. Não houve um retorno HOLD observado em runtime nesta missão.

Os nove QUESTIONABLE são **S01, S02, S05, S12, S13, S14, S28, S29 e FZ-S11**. O último é ambiguidade localizada na redação abreviada do oracle de share: a referência a route deve ser explicitamente qualificada por DR-91/índice atual para não ser lida como exclusão absoluta. Não é falha esportiva ou recomendação perigosa. Os 19 ACCEPTABLE continuam visíveis na fila quando precisam de fechamento documental/fixture; não foram disfarçados como PASS.

Não apareceu recomendação normativa explícita que justifique WRONG ou DANGEROUS. Isso não comprova que a implementação ou o treino real seriam seguros. Muitos casos são controles de transporte/autoridade/representação, e várias decisões esportivas dependem de recipes SYNTHETIC_ONLY. Todos mantêm indicador paralelo de avaliabilidade de domínio; PASS de invariante não é gold fisiológico.

## Cobertura e Golden

Foram identificadas **seis lacunas reais agrupadas**: trajetória esportiva multi-dia; double explícito; compromisso Balanced concreto; exemplos positivos dos graus de mudança; decisão de taper com evento; e progressão/envelope autorregulado já aceito. A matriz separa contrato coberto, cobertura parcial e lacuna. Q01–09 exercitam transições técnicas; não permitem concluir se dívida de recuperação acumulada seria detectada ou se decisões locais destruiriam uma semana.

O **Golden Scenario Set contém 20 registros existentes**, com invariantes sobre preservação, modificação, proibições, limites e confirmação. Todos estão PENDING_FIXTURE_CLOSURE. Há slots explícitos sem witness validado para double, replanning parcial/significativo do vigente e trajetória esportiva multi-dia. FZ-S09 inicial e S28 retorno não foram usados como falsa prova de Level 6. Propomos extensões pontuais dos casos existentes e uma sequência esportiva adicional; essas propostas não foram adicionadas ao corpus autoritativo nem classificadas como executadas.

## Correções antes do runtime dependente

1. Migrar oráculos adaptativos e rebasear sequências/contrafactuais dependentes, mantendo a expectativa original rastreável.
2. Fechar regras aplicáveis de cobertura/adequação/necessidade/custo/progressão/aderência/safety com os owners já definidos em **G01–G04**. Esta revisão não inventa doses, thresholds ou aprovação humana.
3. Fechar witnesses mínimos de cobertura e fixtures Golden. Estabilidade não deve impedir executar uma prescrição variável já aceita; uma mutação fora do envelope ainda exige necessidade/agência.
4. Alinhar FZ-S11 com DR-91. Provar runtime/efeitos/concorrência em G09 e claims dependentes em G11, quando essas etapas forem autorizadas. Não são autorização de implementação nesta missão.

## Revisão e limites

Três revisores independentes da autoria dos dados cobriram sports/training logic, governança do AE e product safety/evidence. Preservamos seus pareceres e os achados de drafts anteriores em [reviews](../reviews/). As correções de representação incluíram separar obrigações/proibições, não contar pré-requisito técnico como progressão esportiva, preservar prioridade herdada e distinguir incompletude documental de saída operacional observada.

**Limite do fechamento da revisão:** as três revisões foram executadas, mas o fechamento por hash da entrega final não foi concluído por todos os revisores devido ao limite de uso. O revisor de governança comunicou aceite do r2 no seu escopo; o esportivo considerou r2 bem calibrado e pediu a última célula FZ-S09 como N/E, corrigida no r3. A verificação final das correções é do autor, sem aprovação independente unânime. A [disposição das revisões](REVISION_DISPOSITION.md) conserva essa diferença; os pareceres originais não foram reescritos como PASS.

A pesquisa pública ficou restrita a incertezas materiais e estudos primários: [concurrent training/spacing](https://pubmed.ncbi.nlm.nih.gov/25546450/), [ordem de sessões no mesmo dia](https://pmc.ncbi.nlm.nih.gov/articles/PMC7224562/), [HRV guiando treino em protocolo específico](https://pubmed.ncbi.nlm.nih.gov/26909534/), [autorregulação RIR em amostra restrita](https://doi.org/10.1519/JSC.0000000000003164) e [taper em contexto específico](https://pubmed.ncbi.nlm.nih.gov/10694140/). Os resultados não foram convertidos em regras de dose do Vilumo; populações, medidas e limites estão no parecer esportivo. Um artigo retratado foi excluído.

Esta é validação documental por IA, sem runtime, dados humanos ou gold de treinador. Não declara validação científica, safety clínica, eficácia, calibração ou paridade com especialistas. A ausência de casos explicitamente perigosos não é taxa de segurança. Nenhuma autoridade do MyApp, runtime ou Figma foi alterada.

Inspecione todos os registros na [dashboard](dashboard.html), [dados completos](validation-final.json) ou [CSV](cases.csv). A dashboard inclui overview, prioridades, propriedades, detalhes de cada caso/sequência, fila de correção, coverage, Golden, contrafactuais, padrões e fontes/reviews.
