# Revisão independente — Adaptive Engine / governança

Data: 2026-10-22, America/Sao_Paulo. Instância independente `/root/governance_review`. Escopo: autoridades documentais atuais do projeto `C:/Users/carva/Desktop/myApp/MyApp`; sem autoria das fontes, sem runtime, sem acesso a Figma, sem validação humana de treinamento. Esta revisão não aprovou o relatório do autor antes de recebê-lo.

Responsabilidade exclusiva: este parecer. Fontes do projeto permaneceram intocadas; outros autores trabalham no mesmo workspace. Ferramentas efetivamente disponíveis: leitura local, PowerShell, `rg`, hashes SHA-256 e escrita de artefato da sessão. Sem pressupor conectores ou capacidades ausentes. Aplicado `verify-before-completion`: conclusão limitada a inspeção documental atual, contagem determinística e identidade dos inputs.

## Veredito

**ENGINEERING_ARCHITECTURE_READY_WITH_CONDITIONS**, estritamente para iniciar futuramente implementação de infraestrutura neutra e fixtures sintéticas sob autorização. **GO WITH FIXES** para preparar o contrato de testes do runtime; **NO-GO para ativar runtime prescritivo ou alegar qualidade esportiva demonstrada**. A inspeção não encontrou decisão explicitamente DANGEROUS nem contradição irremediável entre safety, B0, JEV, estabilidade e agência. Encontrou uma migração de oráculos reconhecidamente incompleta e lacunas reais de cobertura.

O bloqueio não é que o cérebro recomenda treino inseguro. O bloqueio é que a documentação ainda não fornece todas as regras/fixtures necessárias para provar as decisões prescritivas, e alguns expected antigos não são executáveis sob a política nova. Incompletude não deve ser reclassificada como segurança comprovada ou como perigo comprovado.

## Corpus e autoridade

Autoridades selecionadas pelo índice CI-3.3.0 / EXP-AUTH-r1: AEC-1.3; AEOS-1.2-r2; AESL-1.2-r2; SIS-1.1-r2; RIL-1.1-r1; STIL-1.1-r1; PDR atual com overlay DR-93–97 e exceção DR-91. O CURRENT_MISSION anterior está encerrado e não dá autorização de implementação; o pedido atual autoriza a presente auditoria documental. Snapshots/audits são provenance, não cópias alternativas do corpus atual.

Contagem mecânica das linhas de cenário/sequência do Lab vigente:

| Família | IDs inclusivos | Registros |
|---|---|---:|
| Núcleo AEOS | S01–S47 | 47 |
| Specialist Intelligence | SIL-S01–SIL-S14 | 14 |
| Training doctrine | TD-S01–TD-S07 | 7 |
| Freeze / adequacy | FZ-S01–FZ-S12 | 12 |
| **Cenários** | **quatro namespaces distintos** | **80** |
| Sequências | Q01–Q09 | 9 |
| **Registros avaliáveis documentalmente** | | **89** |

As variantes internas/pares contrafactuais não são contadas como novos IDs. Os perfis F-* são inputs herdados, não cenários adicionais. “47 cenários, 9 sequências” em AESL linha 208 descreve o baseline antes das extensões §§9–10; usar isso como total vigente excluiria 33 cenários.

## Findings demonstráveis

### GOV-01 — P1: expected de mudança antigos precisam de migração antes de virarem golden runtime

**Critério:** mudança oficial só existe depois de adequacy/necessity/change cost sustentados; uma fixture antiga não pode certificar a nova regra por herdar sua antiga resposta.

**Evidência:** AESL linha 249 exige explicitamente que qualquer expected de mudança S01–47/SIL-S01–14 receba adequacy, necessity, ChangeCostRule e motivo de KEEP insuficiente. Sem isso, é incompleto/NOT_EVALUABLE para a política nova. AEOS linhas 181–195 define os assessments e precedência. Os corpos antigos foram preservados conforme AESL linha 212.

**Manifestação concreta:** S01/S02, S05, S12 e S13/S14 ainda têm recomendações exatas MOVE/REDUCE (AESL 91–104), enquanto seus perfis F-CROSS/F-SIGNALS/F-EXPOSURE/F-KEY não declaram o conjunto completo de assessments/custo/menores alternativas sob o Freeze. Rejeitar KEEP sob a receita antiga não substitui automaticamente demonstrar benefício após custo e insuficiência das intervenções menores. S09/S28/S29 e SIL com possível mutação precisam da mesma migração quando sua variante escolher mudança; invariantes de reconciliação/versão podem continuar avaliáveis.

**Impacto:** testes de regressão futuros poderiam considerar correta uma mudança incompatível com o gate atual, ou o relatório poderia inventar a premissa ausente e marcar PASS. Isso não prova que mover/reduzir seja esportivamente errado no caso.

**Resolução exigida / owner:** owner AEC/AEOS + autoridade de treino para regra real; Engineering para fixture sintética. Materializar assessments explícitos por variante de mudança, comparar KEEP e menores alternativas, registrar refs/hash e só então promover à seleção golden executável. Até lá: QUESTIONABLE/incompleto para a decisão forte, com invariantes estruturais preservados. Não “corrigir” o caso assumindo inadaptação perigosa ou benefício fisiológico inexistente.

**Trigger:** antes de usar expected exato como oráculo de runtime da política Freeze. Bloqueia essa etapa, não a presente auditoria nem infraestrutura neutra.

### GOV-02 — P2: FZ-S11 conserva exclusão absoluta de rota parcialmente superseded

**Critério:** um oracle não pode contrariar uma exceção posterior explicitamente vigente.

**Evidência:** AESL 263 proíbe `route` no share. PDR DR-91, linha 201, permite traçado de corrida concluída por escolha explícita a cada artefato, desligado por padrão, trim início/fim, linha abstrata sem fundo/horário. PDR overlay linha 16 e índice atual mantêm DR-91 e qualificam exclusões absolutas antigas.

**Impacto:** copiar a proibição literal para o golden runtime rejeitaria um fluxo autorizado. Nenhum dado deve ser compartilhado só por inferir essa exceção; as condições de segurança continuam obrigatórias.

**Resolução exigida / owner:** owner da fonte do Lab, com governança/privacy competente: alinhar oracle à exceção limitada DR-91 e testar default OFF, opt-in por artefato, trim e ausência de metadata. Para a auditoria atual, interpretar FZ-S11 sob o filtro de autoridade vigente e explicitar a supersessão; não classificar o comportamento atual como unsafe por uma frase subordinada antiga.

**Trigger:** antes de transformar FZ-S11 em assertion executável. Não bloqueia o núcleo de decisão de treino.

### GOV-03 — P2: cobertura de prioridade é relacional, não evidência de uma decisão Balanced concreta

**Critério:** priorizar Run/Strength e manter coprioridades Balanced devem ser exercitados com inputs comparáveis e trade-offs explícitos, sem um default secreto.

**Evidência:** S01/S02 (AESL 91–92) têm F-CROSS com máximos exatos Run-first/Strength-first. S03 é prioridade desconhecida, não Balanced confirmado. SIL-S01 (216) diz que diferença exata exige conjunto/ordem ainda a congelar. FZ-S06 (258) cobre os três modos como oracle abstrato, mas não fornece candidato dominante ou trade-off incomparável concretos para Balanced. AEOS B1 (199) exige coprioridades/dominância e ASK quando decisivo indefinido.

**Impacto:** é possível passar os pares Run/Strength e ainda implementar Balanced como runner-first, 50/50 ou ASK perpétuo. A regra atual não prescreve esses comportamentos; a cobertura atual não os exclui com exemplo concreto.

**Resolução exigida / owner:** Engineering + autoridade de treino onde real. Completar variantes sintéticas de FZ-S06, reaproveitando F-CROSS: (a) alternativa domina ambas as coprioridades; (b) duas alternativas preservam um lado cada e nenhuma domina, exigindo preferência mínima ou trade-off já aprovado. Não exige dezenas de novos cenários nem nova feature.

**Trigger:** antes de certificar implementação Balanced de B0. É gap crítico de coverage, não WRONG já observado.

### GOV-04 — P1 para alegação esportiva: Q01–Q09 não avaliam a trajetória de uma semana de atleta

**Critério:** estabilidade de event processing não prova estabilidade adequada da carga/recuperação ao longo de dias.

**Evidência:** AESL 147–155 contém concorrência, lag/duplicata, export/hold, recusa/jitter, finalidade, falha remota, reaplicação e revogação. Q04 testa anti-flip-flop por fatos repetidos; Q07 testa no-op depois de aplicação. Nenhuma define exposição comparável por vários dias, débito acumulado, redução e posterior retorno ou preservação de progressão da semana sob fadiga nova persistente.

**Impacto:** a auditoria pode validar as nove sequências de governança, mas não concluir que decisões locais preservam uma semana esportiva realista. Ausência dessa evidência não autoriza afirmar que o motor ignoraria recovery debt.

**Resolução exigida / owner:** owner do corpus com autoridade de treino para materializar um caso longitudinal mínimo reaproveitando F-SIGNALS/F-EXPOSURE e prioridades existentes. Explicitar quais novos fatos tornam reavaliação necessária e quais apenas atualizam modelo. Preservar IDs originais; a extensão deve ter justificativa de cobertura e ser separada do corpus herdado.

**Trigger:** antes de claim de estabilidade esportiva multi-dia ou validação de recovery debt. A auditoria atual pode fechar identificando a lacuna e restringindo o veredito.

## Contradições procuradas e não demonstradas

| Hipótese adversarial | Evidência | Juízo |
|---|---|---|
| B1 poderia sempre sacrificar Strength para Running | AEC 26/48; AEOS 199; S01/S02/S42 | Não demonstrado. Objetivo primário e HC são explícitos; segurança pode produzir mesmo resultado com prioridades trocadas. |
| MEC é escolha mecânica do menor número de level | AEC 44; AEOS 192/194/203 | Não. Efeito conjunto/contexto e suficiência precedem ranking; vários microajustes podem custar mais que mudança coerente. F-KEY precisa completar precondições Freeze; não concluir MOVE errado apenas porque REDUCE tem level menor. |
| JEV pode sobrescrever B0, declarar segurança ou exigir ASK por sua rota | AEOS 195/273/275; S34–38/S43 | Não. SHADOW preserva oficial independente de retorno JEV e revalida gates determinísticos. |
| Stable-by-default impede responder a dor/revogação | AEC 42/46; AEOS 189/334; S07/S33/FZ-S08 | Não. Controle imediato precede custo/hysteresis. KEEP anterior inválido não é fallback. |
| Recusa permite refazer mesma proposta com ID novo | AEC 50; AEOS 325/336; SIL-S12/FZ-S07 | Não. Constraint de agência é semântica e escopada; início com pendência invalida composto sem permitir reoferta por novo hash. |
| Athlete Model update exige plan mutation | AEC 40; AEOS 179/190/212; TD-S02/FZ-S01 | Não. Há separação explícita com zero delta/export/revisão de conteúdo no KEEP. |
| SIS põe candidatos antes de necessity e revoga AEOS | SIS 70/77 e AEC/AEOS | Não. Preambulo SIS limita etapas propositivas a plano inicial/continuação/necessidade sustentada. Ordem da lista não revoga esse guard. |

## Limites que o relatório final deve preservar

1. O corpus é uma especificação de cenários e templates, não fixtures executadas. A avaliação pode julgar coerência, decisões condicionais e invariantes; não deve fabricar observações do motor.
2. AESL 31–35 distingue invariant, synthetic golden e expert/domain. Sem gold competente, `NOT_EVALUABLE_DOMAIN` continua necessário. A classificação principal pedida pelo Founder pode ser PASS/ACCEPTABLE/etc., mas o relatório deve carregar esse limite em paralelo. PASS documental não significa recomendação clinicamente segura ou dose correta.
3. Escala de dez dimensões deve ter aplicabilidade explícita: cenário de transporte não prova progressão, e cenário de identidade não prova treino Balanced. Não preencher todas as dimensões como PASS apenas para preservar denominador.
4. Se uma decisão exata não está definida, registrar conjunto permitido/controle condicional. S09 explicitamente recusa dose/REPLAN exatos em AESL 139; isso é uma delimitação do teste, não liberdade para aceitar “qualquer adaptação”.
5. G01/G02/G04/G09/G11 permanecem dependentes do trigger real em PDR 168–178 e AEOS 386–393. Não confundir GO para infraestrutura neutra com GO para motor prescritivo pronto para atleta. G11 é empírico; esta auditoria não o fecha.
6. O motor especificado é conservador em autoridade/versão, mas a ausência de uma dose insegura escrita não prova qualidade equivalente à de excelente treinador híbrido. A política fisiológica ainda depende de inputs profissionais.

## Evidência objetiva e revisão

Comando de contagem: `rg -n '^\| (S[0-9]{2}|SIL-S[0-9]{2}|TD-S[0-9]{2}|FZ-S[0-9]{2}|Q[0-9]{2})' product/ADAPTIVE_ENGINE_SCENARIO_LAB.md | Measure-Object` → **89 linhas**. Inspeção de namespaces e intervalos fechou 80+9, sem IDs faltantes nos intervalos declarados.

SHA-256 dos inputs lidos nesta revisão:

| Arquivo | SHA-256 |
|---|---|
| ADAPTIVE_ENGINE_SCENARIO_LAB.md | `196309752ED75CC1D002595AD78DFB169BFAA94FFCD179F746DCCA93356C25BF` |
| ADAPTIVE_ENGINE_OPERATIONAL_SPEC.md | `56534C1BBE80C9B805EF3D7F94C63D0DCED293AE79FFD0220C5FB1315744A610` |
| ADAPTIVE_ENGINE_CONTRACT.md | `3746823201B62144D6D4AC106647609A3509412627CB758B0A10E7A95F56AB37` |
| SPORT_INTELLIGENCE_SPEC.md | `1C7290F99063D1D1914FB563DF029EE00724F96C54196721B71DFA0B5994A312` |
| RUN_INTELLIGENCE_SPEC.md | `1A70C3B865F40105B1537C3674E8DA1F2AAAC27EDE7878B38D85F8AC5E607880` |
| STRENGTH_INTELLIGENCE_SPEC.md | `17B156B7EE26C2020B79C54AD627B2D87E95C3A9A0B77373C62652A055C95F40` |
| PRODUCT_DECISION_REGISTER.md | `D8F30B7C546976ACB366641CC2651C994F415EA7AB4A2C5815DDC5D63C1E149A` |
| CANONICAL_INDEX.md | `6ADBE0CDF921BD6FADC7F360BD904597E434C27BBFF971F833FEB7C05A61F3B2` |

Critérios de encerramento desta revisão: fontes atuais inspecionadas; contagem demonstrada; migration/authority/coverage findings com owner e trigger; nenhuma fonte editada. O parecer do draft do relatório final será registrado depois de receber seus artefatos; esta revisão não o antecipa.

## Revisão independente do draft AE-DOC-20261022-r1

Artefato efetivamente recebido e lido: `outputs/validation-data.json`, 544.647 bytes, SHA-256 `2E47BAC5A2EDE1ADD4F3BFB12D3A95AFA3F10D8D079B3B9BA26C63A7A8742724`. Este parecer vale para esses bytes, não para revisões posteriores. Nenhum dado do autor foi editado pelo judge.

**Resultado do draft: REQUEST_CHANGES**, limitado aos campos/juízos abaixo. A leitura não requer refazer a auditoria inteira nem inventar falhas do motor para preencher distribuição.

### Checks determinísticos do draft

| Critério | Evidência observada | Resultado |
|---|---|---|
| Corpus íntegro por cardinalidade | 89 registros, 89 IDs únicos, 80 `scenario` e 9 `sequence` | PASS |
| Dez dimensões por registro | Todos os 89 têm exatamente dez propriedades em `rubric` | PASS |
| Distribuição declarada | 61 PASS + 19 ACCEPTABLE + 9 QUESTIONABLE = 89 | PASS de consistência aritmética; não aprovação automática dos juízos |
| Limites de domínio | 44 NOT_EVALUABLE_DOMAIN; 45 NOT_TESTED_DOMAIN para controle/representação | PASS na separação documental versus fisiológica |
| Prontidão por escopo | NO-GO prescritivo e GO WITH FIXES neutro/sintético | PASS |
| Semântica de `must_not` | 89/89 campos começam por cópia integral de `source_oracle`, que inclui obrigações positivas | FAIL; correção R1 abaixo |

### R1 — P1 do relatório: `must_not` inverte obrigações positivas em proibições

**Evidência:** JSON linha 56 (S01) inicia o campo proibitivo com `B0 RECOMMEND C-A, CONFIRM`; linha 170 repete para C-B. O mesmo padrão foi contado em todos os 89 registros. Em S04, KEEP esperado também fica sob o rótulo must-not. Em FZ-S11 o campo preserva, adicionalmente, a exclusão absoluta stale de rota.

**Impacto:** apresentar a dashboard com esse rótulo faria a mesma decisão aparecer simultaneamente como esperada e proibida. O problema está na entrega de auditoria; não é um comportamento WRONG do cérebro especificado.

**Correção exigida ao autor:** conservar `source_oracle` original para rastreabilidade e escrever em `must_not` somente ações explicitamente proibidas, mais proibições atuais derivadas e identificadas. Não copiar texto misto inteiro, nem extrair cegamente frases por palavra-chave: preservar o sentido e o escopo. Revalidar 89/89 para não transferir inversão ao Golden Set.

### R2 — P2: S28 transforma ramo condicional em ausência factual e sugere level não derivável

**Evidência:** source_input S28 (Lab 118; JSON 2917+) já traz retorno com contexto/restrição atual diferente. Source_oracle permite REPLAN/RETURN **sob receita válida**, caso contrário HOLD/ASK. Draft linha 2926 anuncia ASK/HOLD “até contexto e receita atual”, como se ambos faltassem. Linha 2929 registra `5/6 não determinados` embora RETURN/REPLAN não determine extensão de mudança, e o plano anterior esteja encerrado.

**Correção exigida ao autor:** manter o ramo permitido: com contexto/receita/regra/autoridade aplicáveis, propor REPLAN/RETURN com alcance/ato/guarda; sem a dependência necessária, controle escopado. Não afirmar que um contexto descrito como atual está ausente. `change_level` deve ficar indeterminado, sem inferir 5/6 do nome da ação; respeitar base encerrada/NONE quando aplicável. A classificação QUESTIONABLE pode continuar se seu racional ficar restrito à incompletude do ramo positivo e da extensão mínima; não é ausência de safety já demonstrada.

### R3 — P2: aplicabilidade da rubrica infla algumas propriedades

**Evidência:** S13 `interference=PASS` usa “mais ruptura pode preservar melhor estímulo”, porém F-KEY (Lab 69) só fixa criticality, efeitos B1/B2/B3 e ruptura; não fecha conflito Run×Strength. A variante S14 do mesmo perfil recebe N/E. SIL-S02 `progression=PASS` vem da fidelidade de repeats/recuperação; S22 e SIL-S03 usam integridade de histórico; S41 usa ausência de classificação. Isso não demonstra proteção da progressão de médio/longo prazo pedida pela dimensão H.

**Correção exigida ao autor:** N/E para propriedades não exercitadas; manter PASS na dimensão realmente testada. Nos casos adaptativos incompletos S05/S12/S14/S29, não contar preservação genérica de objetivo/passado como prova de progressão de médio/longo prazo; usar N/E ou PARTIAL com a limitação concreta. Reconstruir resultados agregados por propriedade a partir da rubrica corrigida. Não exige mudar o status principal dos controles.

### R4 — P2 de precisão: incompletude do fixture não é um B0 observado de HOLD

**Evidência:** S01/S02/S05/S12 anunciam HOLD até migração. AESL 249 estabelece incomplete/NOT_EVALUABLE da fixture sob a política nova; AEOS 191 determina HOLD quando regra crítica efetivamente faltar à instância da decisão. São afirmações relacionadas, mas diferentes. Nenhum EvalRun foi realizado.

**Correção exigida ao autor:** marcar a decisão forte como documentalmente não avaliável antes de migração e conservar o candidato condicional; se quiser mostrar HOLD como execução conceitual, deixar explícita a hipótese de ausência de regra crítica no runtime. Não registrar um HoldRecord, estado real ou resultado observado inexistente. A classificação QUESTIONABLE de S01/02/05/12/13/14 por migração incompleta é defensável e não equivale a declarar MOVE/REDUCE errados.

### Juízos específicos aceitos, com escopo

- **S01/S02:** priority flip é correto sob o conjunto sintético e deve permanecer ligado aos dois objetivos protegidos. A incompletude Freeze impede promover a decisão exata como golden atual; não prova dano.
- **S05/S12:** triangulação/ABOVE sintéticos não viram dose real; QUESTIONABLE por migração é defensável. Não presumir que toda redução de volume preserve intensidade com segurança.
- **S13/S14:** crítica de necessity/custo é válida; não exigir uma ordem numérica cega MEC nem declarar MOVE errado só porque REDUCE tem level menor. A suficiência da opção menor depende do objetivo/estímulo, contexto e custo.
- **S29:** a fonte já ordena início s1 e depois contexto material diferente; o draft pode solicitar fixture com fronteira temporal/necessity/custo, mas não deve dizer que não existe qualquer ordenação no cenário. Controle da revisão executada está correto.
- **FZ-S11:** decisão derivada sob DR-91 e fonte PDR 201 corretas; QUESTIONABLE é do oracle subordinado stale. A versão final deve listar o conjunto completo dos guardrails atuais ou referenciar claramente que `trim previstos` inclui default OFF, escolha por artefato, linha abstrata, sem fundo/horário e metadata. Não manter rota absolutamente proibida em `must_not`.
- **S22:** trocar o literal antigo “adapta futuro uma vez” por reavaliação dependente e mudança somente se necessária é uma derivação correta sob o Freeze; mostrar que é interpretação atual, não transcrição do antigo expected.
- **Q01/Q07:** ACCEPTABLE pela hipótese inicial não materializada é defensável; a invariante técnica pode ser validada condicionalmente sem alegar qualidade esportiva da aplicação inicial.
- **Q02–Q09:** trajetórias de autorização/versão/reconciliação são coerentes na derivação. O draft explicita que recovery debt multi-dia não foi modelado, evitando extrapolação.

Parada desta revisão do draft: REQUEST_CHANGES com correções limitadas e demonstráveis. Uma revisão posterior precisa verificar os novos bytes e registrar quais R1–R4 foram resolvidas; este parecer não aprova antecipadamente a dashboard, o Golden Set ou a narrativa ainda não recebidos.
