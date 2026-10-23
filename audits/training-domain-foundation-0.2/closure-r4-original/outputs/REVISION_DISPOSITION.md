# Disposição das revisões — AE-DOC-20261022-r3

Owner desta disposição: /root, autor dos dados e do relatório. Isto registra correções e limites; não substitui os pareceres independentes nem os reclassifica como PASS.

Foram executadas três revisões independentes: sports/training logic, Adaptive Engine/governance e product safety/evidence. Os três revisores leram autoridades e o draft dos 89 registros; produziram achados rastreáveis. O draft de casos r1 revisto tem SHA-256 `2e47bac5a2ede1add4f3bfb12d3a95afa3f10d8d079b3b9ba26c63a7a8742724`, conforme seus pareceres. Os documentos em reviews/ conservam os REQUEST_CHANGES originais.

## Resolução dos achados de representação

| Finding | Correção na entrega | Verificação |
| --- | --- | --- |
| Todos: must_not misturava oracle positivo e proibições | 89 campos de proibições escritos separadamente; source_oracle preserva texto integral | Checker por caso + inspeção S28/S01/S07; revisor de governança confirmou 0/89 cópias no r2 |
| Safety D02: aprendizagem sem qualificar finalidade | Ação genérica qualifica primário já autorizado e I10 secundário opt-in | Dados e rubrica usam a mesma frase corrigida; checagem final do autor |
| Sports D02 / GOV R3: propriedades infladas por controles técnicos | N/E em progresso de repeats/protocolo/dedupe/classificação/inicial; interferência S13/S42 N/E; progressão adaptativa não fechada PARTIAL | Agregados regenerados, denominador por propriedade; último resíduo FZ-S09 progressão tornou-se N/E no r3 |
| Sports D03: prioridade herdada omitida | priority_origin e priority_exercised distintos; S15/S32/Q01 e correlatos preservam origem | Grupos sobrepostos informados; fontes omissas não viraram Balanced |
| GOV R2: S28 inventava falta de contexto e nível 5/6 | Ramo positivo com contexto/receita válidos; ASK/HOLD somente conforme ausência real; nível indeterminado | Fonte original e derivação lado a lado; RETURN não equivale a replanning significativo |
| GOV R4: migração ≠ HOLD observado | S01/S02/S05/S12 indicam decisão exata NOT_EVALUABLE; HOLD é condicional à regra crítica ausente numa instância | Cabeçalho e decisão explicam que nenhum runtime foi observado |
| Safety FZ-S11: exclusão route não é necessariamente absoluta | Rationale agora registra ambiguidade da redação abreviada, com DR-91 atual prevalecendo | Não se afirma falha unsafe ou proibição absoluta vigente |
| Cobertura/Golden | Seis gaps; 20 registros de invariantes pendentes; quatro slots críticos explicitamente sem witness | Nenhum novo caso ou Level 6 foi inventado para completar cobertura |

## Estado da rechecagem independente

O revisor de governança comunicou após ler r2: “r2 verifica R1–R4 resolvidos” e informou que estava registrando ACCEPTED para a entrega documental, sem aprovação do runtime. A gravação final do parecer foi interrompida por limite de uso; não alteramos seu arquivo para fingir assinatura concluída.

O revisor esportivo comunicou que r2 estava bem calibrado, com D01/D03 resolvidos e coverage/Golden adequados; pediu a célula FZ-S09 progressão como N/E. Essa alteração foi feita. Seu fechamento por hash também foi interrompido por limite de uso. A revisão de safety permanece com condições do draft, cujas duas correções de representação foram verificadas pelo autor.

Portanto: revisão adversarial independente **executada**; findings tratados e evidência final objetiva registrada; **sem aprovação independente unânime por hash da entrega r3**. Isso é uma limitação explícita do fechamento, não uma aprovação profissional ou científica. Os hashes finais do JSON, dashboard e relatório estão em VERIFICATION.json.

## Veredito preservado

NO-GO para runtime prescritivo como autoridade final de treino. GO WITH FIXES apenas para futura infraestrutura neutra/fixtures sintéticas autorizadas. G01–G04, G09 e claims G11 permanecem dependências existentes. Nenhuma alteração das autoridades, runtime ou Figma foi feita; as correções propostas do motor permanecem na fila da auditoria.
