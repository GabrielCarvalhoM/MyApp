# Formulário de revisão humana — TDF-HR-0.2-r1

**EM BRANCO / SEM PARECER HUMANO.** Use um registro completo por decisão. Repita os campos quando houver outra população, regra ou versão; a identificação do revisor deve acompanhar cada decisão mesmo que remetida a uma ficha assinada comum. Um checkbox ou matriz sem justificativa e contexto não constitui aceite rastreável.

## Registro completo — copiar para cada decisão

| Campo | Preenchimento pelo revisor |
|---|---|
| Decision ID | ___ |
| Reviewer name | ___ |
| Role / função e escopo de atuação | ___ |
| Credentials / registro profissional e qualificação pertinente | ___ |
| Population/context reviewed | ___ |
| Objetivos, nível Run × Strength, equipamentos e fase cobertos | ___ |
| Artifact/rule/version | ID do item/caso/alternativa: ___ · pacote TDF-HR-0.2-r1 · hash/manifest: ___ |
| Decision | ___ **APPROVE / APPROVE WITH CONDITIONS / REVISE / REJECT / OUT OF SCOPE** |
| Rationale / justificativa | ___ |
| Evidence/experience basis | Fonte/versão ou experiência profissional aplicável, incluindo limites: ___ |
| Conditions/limits | Incluídos: ___ · excluídos: ___ · premissas ainda não verificadas: ___ |
| Required changes | Redação/receita/escopo/dados a corrigir: ___ · responsável proposto: ___ |
| Re-review trigger | Mudança de perfil, dose, sinal, regra, evidência ou prazo que invalida este parecer: ___ |
| Date/version | Data/fuso: ___ · revisão do parecer: ___ · validade se definida: ___ |
| Assinatura / referência ao aceite humano | ___ |

Uma decisão pode depender de dados ausentes; registre a dependência explicitamente na justificativa/condições. Não há opção marcada por padrão. Não preencher significa **sem decisão**, nunca APPROVE.

## Mapa de cobertura do retorno

Preencha a disposição de cada item e o Decision ID que contém o registro completo.

| Grupo / IDs | Disposição por item / Decision IDs |
|---|---|
| G01-01 a G01-13 — cada linha do scope review | ___ |
| G01-E1 a G01-E10 — exemplos, avaliados individualmente | ___ |
| S01 / RUN_FIRST — julgamento do caso | ___ |
| S02 / STRENGTH_FIRST — julgamento do caso | ___ |
| G02-S01-Q1 a Q12 — respostas, incluindo dados faltantes | ___ |
| G02-S02-Q1 a Q12 — respostas e diferenças perante S01 | ___ |
| PC-LT-01 a PC-LT-05 — cada frase | ___ |

### Comparação de alternativas

| ID | S01: disposição / razão / Decision ID | S02: disposição / razão / Decision ID |
|---|---|---|
| K — KEEP | ___ | ___ |
| M — micro | ___ | ___ |
| V-L — menos volume lower | ___ | ___ |
| V-R — menos volume Run | ___ | ___ |
| I — intensidade/densidade | ___ | ___ |
| MV-L — mover lower | ___ | ___ |
| MV-R — mover corrida | ___ | ___ |
| SUB — substituição | ___ | ___ |
| PR — partial replan | ___ | ___ |

Alternativa escolhida, se decidível: S01 ___ / S02 ___. Menores alternativas aceitas/rejeitadas/indeterminadas e por quê: ___. Estímulo essencial e perda admitida em cada domínio: ___. Efeito no horizonte e custo de agenda: ___. Dados/regra faltantes: ___. Não se exige uma alternativa diferente por prioridade.

## Síntese do subset, sem promoção

População e fronteiras propostas: ___. Regras/receitas efetivamente julgadas: ___. Itens sem parecer ou fora da sua competência: ___. Encaminhamentos/dependências G03/G04: ___. Disposição global **deste retorno delimitado**: ___; registros que a sustentam: ___. Data/revisão/assinatura: ___.

O responsável pela integração deve manter este template original e guardar o parecer humano como novo artefato versionado, vinculado aos hashes revisados. Alterar fatos/doses após o parecer exige avaliar seu trigger de nova revisão. Este retorno não fecha sozinho G01/G02 inteiros, não promove 0.2 a Truth, não reclassifica os oito QUESTIONABLE e não declara C1–C6 fechados. G03/G04 permanecem HUMAN_REVIEW_REQUIRED.
