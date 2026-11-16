# Strength Intelligence Foundation — V1 (pré-implementação)

Missão do Founder de 2026-11-13 (Exercise Intelligence & Training Metadata Foundation). Chief, Opus 5.5. Branch `claude/v1-strength-intelligence-foundation`, a partir de `ce4f136` (linha `claude/v1-run-extensions`, sem tocar o trabalho do Fable). **Pré-implementação: nenhum arquivo do CoachingCore, freeze, handoff de corrida, Figma, interface, fila humana ou governança foi alterado.**

Pacote:

| Arquivo | Papel |
|---|---|
| este documento | A diagnóstico · B contrato de metadados · C contrato de seleção e substituição · E validação · F implementação · resposta de encerramento |
| `EXERCISE_EXEMPLAR_V1.json` | D: catálogo exemplar r2: 23 configurações já existentes, os campos novos propostos e a decisão que cada uma demonstra (r2 acrescenta side-plank por condição de SQ-1) |
| `probe-strength.mjs` | Prova do diagnóstico: 37 checagens no motor atual (`v1-run-index.mjs`, sem opções). Somente leitura. |
| `sweep-planes.mjs` | Varredura de GAP-S8: 120 perfis × 12 semanas, planos de empurrar/puxar nunca escolhidos. Somente leitura. |
| `check-package.mjs` | Integridade do pacote: exemplar contra o catálogo vinculado, vocabulários, ausência de números inventados, coerência do documento. `--table` imprime a vista derivada dos campos existentes. |
| `reviews/SSCTR_SI_V1_DECISION.{md,json}` | Decisão do SSCTR nas quatro questões novas (§8): SI-V1-SSCTR-SQ-1..4, todas APPROVE_WITH_CONDITIONS, vinculadas ao sha `50e6a5ed…` deste documento como submetido (commit `3ed9dec`). |

Rodar da raiz do repositório: `node audits/v1-strength-intelligence-2026-11-13/probe-strength.mjs` e `node audits/v1-strength-intelligence-2026-11-13/check-package.mjs`.

---

## 0. Conclusão em uma página

**O módulo de força já é uma inteligência de força, não um gerador de exercícios.** Existe um catálogo real, versionado e vinculado por hash (`R7B0-CATALOG-2`, 76 configurações, 12 decisões SSCTR r2 aprovadas com condições até 2027-04-30). Ele tem padrões, subpadrões, equipamento, lateralidade, convenção de carga, habilidade, demandas ordinais (membros inferiores, axial, excêntrica), músculos primários e secundários, papéis contextuais, propósitos, escadas de habilidade, relação de variação próxima, rotação e substituição por motivo. O planejador usa tudo isso. A progressão é conquistada por evidência executada, e a coordenação com a corrida é ordinal e explícita. A probe confirma o comportamento nos oito cenários pedidos (A–H).

**Portanto esta missão não propõe um novo catálogo nem uma nova camada de seleção.** O "Exercise Metadata Contract" é o catálogo existente, mais uma extensão pequena e aditiva. O "Selection & Substitution Contract" formaliza as regras que o código já executa e acrescenta só o que falta.

**Lacunas comprovadas (probe) e destino:**

| # | Lacuna | Gravidade | Destino |
|---|---|---|---|
| GAP-S1 | Catálogo só tem nome em inglês; sem nomes pt-BR nem sinônimos | Bloqueia a V1 (exibição) | Camada de conteúdo do app, fora do caminho de dose |
| GAP-S2 | Prancha e prancha lateral são prescritas como "1×12 repetições @RIR3", progredindo para 14 | Defeito de representação | Campo `doseUnit` + regra V1 (decisão do SSCTR em SQ-1) |
| GAP-S3 | Quem treina força há anos mas não nomeia exercícios familiares não recebe agachamento, supino ou terra com barra | Qualidade para experientes; o motor já suporta (probe B3) | Pergunta do onboarding, contrato ADF; sem mudança de motor |
| GAP-S4 | Não há faixa de repetições por exercício: a faixa do objetivo vale para toda linha | Aceitável na V1 | Diferido (heurístico) |
| GAP-S5 | O volume semanal por músculo só existe como regra descritiva no catálogo: não há função e não há meta | Analítica V1 exige o descritivo; a meta é G02 | Descritivo na V1; meta fora da V1 (SQ-3) |
| GAP-S6 | Em RUNNING_SUPPORT com academia completa, o MAIN de membros superiores vira flexão e remada com elástico, porque o critério "propósito" vem antes de "carga externa" | Qualidade do estímulo | Ajuste de ordenação (SQ-2) |
| GAP-S8 | Empurrar e puxar na vertical nunca são escolhidos: em 120 perfis (5 de equipamento × 4 objetivos × 2–4 dias × 0/24 meses), por 12 semanas, empurrar na vertical aparece em só 4 (todos só com halteres ou só peso corporal) e puxar na vertical em nenhum. O subpadrão padrão horizontal sempre vence nos slots MAIN que admitem os dois planos | Cobertura de padrões: o pedido explícito "horizontais e verticais" não se cumpre | Alternância semanal de plano (SQ-4) |
| GAP-S7 | O motivo de substituição PROTECTED_RUN_STIMULUS_CONFLICT existe só como texto: o runtime protege a corrida por arranjo e por CMP.P04 | Coberto por outro mecanismo | Não implementar na V1; corrigir o texto na próxima revisão do catálogo |

**Fora da V1** (grande demais ou dependente de G02): meta de volume por músculo, regra de estagnação, superset/drop set, peso corporal com carga extra, 1RM como semente (PD-3 da ADF), classe de fadiga sistêmica por exercício, fadiga local por músculo e mídia técnica.

---

## A. Diagnóstico do módulo de força

Classificação: **IMPL+TEST** = implementado e testado · **PARCIAL** · **DOC** = só documentado · **AUSENTE**. As linhas citadas são de `ce4f136`.

### A.1 As dez perguntas

**1. Como o motor escolhe exercícios? — IMPL+TEST.**
O número de dias de força escolhe os templates (`templateTypesFor`, `r7b-repertoire.mjs:105`): 1 dia → FULL_A; 2 → FULL_A+FULL_B; 3 → LOWER+UPPER+FULL_B; 4 → LOWER/UPPER×2; a partir do 5º, CORE. Cada slot tem um padrão e um papel (MAIN/ACCESSORY) e, às vezes, subpadrões permitidos. `buildTemplates` (`:262`) filtra por equipamento disponível, habilidade admissível, papel admissível, uso único na sessão e configurações postas de lado. Depois ordena por `selectionCompare` (`:248`): familiar → já estabelecido no programa → propósito do objetivo → subpadrão padrão do slot → carga externa → maior habilidade admissível → origem R6 → id. A ordem é determinística: a mesma entrada gera o mesmo plano.
Testes: `r7b-strength.test.mjs` (12), `r7b-binding` (8), `r7b-review-fixes` (19), `r7b1-correction-cycle` (20). Probe A, B, B3.

**2. Existe catálogo real? — IMPL+TEST.**
`CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json`, revisão R7B0-CATALOG-2, sha `ceee276a…`. É carregado somente se os bytes baterem (`r7b-repertoire.mjs:16-25`), e cada candidato B0 é ligado por um registro SSCTR com o mesmo hash (`:44-58`). Tem 76 configurações em 15 padrões: SQUAT 7, HINGE 11, LUNGE 8, CALF 7, PUSH 10, PULL 17, TRUNK 6, ELBOW_* 4, KNEE_* 2, HIP_ABDUCTION 2, SHOULDER_ABDUCTION 1, ANKLE_DORSIFLEXION 1. Tem ainda 7 templates, 20 escadas de habilidade, perfis de equipamento e itens LATER_GATE com fallback. **Consequência central: qualquer campo novo no catálogo muda o hash e desliga o repertório até um novo registro SSCTR.** A extensão tem de ser um arquivo à parte (§F).

**3. Músculos e padrões? — IMPL+TEST para padrões; músculos PARCIAL.**
`pattern`, `sub` e `region` dirigem a seleção, o descanso e o custo de interferência. `prim`/`sec` (19 músculos) são usados pela relação de variação próxima e pela alternativa admissível (`closeVariation :188`, `admissibleAlternative :197`: ao menos um primário em comum). A contagem por músculo é declarada como "IMPLEMENTATION_CHOICE pending G02: só primários, unilateral conta uma vez por lado, aquecimento nunca conta". Ela não existe como função (`MUSCLE_COUNTING_DESCRIPTIVE_ONLY`, `:360`). GAP-S5.

**4. Séries, repetições, intensidade, cargas e descansos? — IMPL+TEST.**
A dose por objetivo vem da política R6-POLICY-5, `operational.strength.goalDoses` (tabela em A.2). `strengthCandidate` (`r6-program.mjs:479`) escolhe o tipo de linha: PRACTICE, RETURN_ENTRY, RETURN_STEP, REESTABLISH, FIRST_ESTABLISH, UNLOGGED, KNOWN, FROM_LOG ou BODYWEIGHT. `phaseDose` (`:467`) aplica a redução de fase num só lugar.
- **Acessórios:** uma série a menos, reps do objetivo + 2, até 15.
- **Intensidade:** por RIR, não por % de 1RM. O RIR começa em 3 e o alvo é 2; existem pisos por fase e por difficulty.
- **Descanso por papel:** MAIN 120 s; MAIN com objetivo força 150 s; ACCESSORY 75 s; PRACTICE 60 s (`:973`).
- **Ajuste ao tempo** (`fitStrengthSession`, `r6-prescription.mjs:103`): acessórios saem antes de o MAIN perder séries.
- **Carga:** nunca é inventada. Exercício novo → estabelecimento por esforço. Carga registrada → regra de adoção (`loggedLoadDecision :576`, SSCTR D44/D45/D48). Máquina → "próxima regulagem", sem kg (F03-B).

**5. Progressão de carga e volume? — IMPL+TEST.**
`advanceStrength` (`:805`) só anda com evidência executada; sem log, HOLD sem regressão.
- **LOAD (força):** +1 menor incremento a cada 2 semanas aprovadas, ou na semana seguinte se EARNED.
- **REPS_THEN_LOAD (hipertrofia, geral, suporte à corrida):** +2 reps até o topo da faixa, depois +1 incremento e volta ao piso.
- **HOLD (manter):** não progride.
- **Volume:** +1 série por exercício na virada de bloco, só se as últimas exposições foram ADVANCE/EARNED (`:494`, `:862-868`).
- **Retornos e restabelecimentos:** devolvem séries uma por semana (D49/D53).

Probe E: agachamento 100 → 100 → 102,5 → 102,5 (consolidação, 2 séries) → 102,5 (4 séries) → 105. Supino 8 → 10 → 12 reps → 62,5 kg × 8.

**6. Experiência, cargas conhecidas, equipamento e objetivo? — IMPL+TEST.**
- **Classe de força** (`r6-program.mjs:47-51`): NONE, FAMILIAR_UNKNOWN_LOAD, KNOWN_LOAD ou NOT_PROGRAMMED.
- **Experiência:** NONE/NOVICE limitam a habilidade a LOW; INTERMEDIATE/EXPERIENCED, a MODERATE. HIGH só com familiaridade declarada ou alcançada por escada (`:265`).
- **Cargas conhecidas:** `knownExercises` com dose atual de até 28 dias → linha KNOWN (`r6-intake.mjs:52-63`). Sem dose → `loadHint`, que é só uma dica escrita, nunca um número prescrito.
- **Equipamento:** filtra por data (`equipmentForDate`).
- **Objetivo:** define dose, chaves de contexto (HYPERTROPHY e RUNNING_SUPPORT trocam slots acessórios) e propósito na ordenação.
- **Iniciante:** densidade limitada (B0-C08): dois templates completos, os outros dias CORE e uma negociação não bloqueante. Probe A.

**7. Quando o atleta não pode executar um exercício? — IMPL+TEST.**
- **Sem técnica estável:** `EXERCISE_SUBSTITUTION` com `SKILL_MISMATCH` desce a escada da habilidade, nunca sobe (`r6-adaptation.mjs:990-1041`).
- **Desconforto não clínico ou preferência:** exige `nonclinicalConfirmed:true` e escolhe uma alternativa do mesmo padrão.
- **Dor, lesão ou limitação:** vai para CLINICAL_HUMAN_REQUIRED, e nenhuma troca entra como remédio (`:855`; probe D).
- **Falta de equipamento:** `EQUIPMENT_CHANGE` com janela.
- **Nada serve:** a lacuna é declarada com opções, nunca omitida em silêncio (B0-C09; `asideGaps`).

**8. Substituições? — IMPL+TEST.** Quatro ingredientes:
- **Ranking:** familiar → variação próxima → mesmo subpadrão → mesmo padrão (`substitutesFor`, `r6-catalogue.mjs:29`).
- **Estímulo diferente declarado:** peso corporal ou elástico no lugar de carga recebe `stimulusChange`.
- **Estabelecimento:** o substituto sempre começa por esforço, sem converter carga.
- **Persistência:** a decisão vira `strengthSelections` e vale nas semanas seguintes. Em taper, semana de prova e pós-prova não entra exercício novo: um exercício já feito no programa o substitui (`:950-961`). Probe D: só o MAIN trocado muda; os demais mantêm identidade.

**9. Fadiga e interferência com a corrida? — IMPL+TEST (ordinal).**
- **Custos ordinais** (`interferenceCosts`, `r6-balanced.mjs:42`; CMP.I01–I11): por direção e intervalo, nunca somados.
- **Classe de membros inferiores por sessão** (`lowerDemand :16`): ajustada pela dose; HEAVY com menos de 3 séries conta MODERATE e panturrilha conta no máximo LIGHT.
- **Arranjo:** ranking Pareto e depois leximax (`chooseBalanced`). Dias e turnos escolhidos são restrições duras (CMP.P01/P02).
- **Antes do longão ou do treino de qualidade, com liderança RUN** (CMP.P04, `r6-program.mjs:1159-1167`): linhas não MAIN de membros inferiores HIGH-excêntricas perdem uma série, com explicação; o MAIN mantém o estímulo essencial.
- **Rotação:** nunca coloca troca de membros inferiores na véspera de corrida protegida (`:1366-1389`).
- **Fadiga relatada:** LOCAL_FATIGUE remove acessórios opcionais da região; SYSTEMIC_FATIGUE deixa só os principais, com uma série a menos e RIR ≥ 4 (`r6-composition.mjs:70`; probe F).
- **Fases de evento:** SPECIFIC/TAPER reduzem séries com RIR ≥ 3; semana de prova fica só com MAIN; pós-prova idem.

**10. O que muda entre os objetivos? — IMPL+TEST.** Ver A.2. Há diferença real de reps, séries, RIR, modo de progressão, descanso do MAIN e slots acessórios. **O que não muda:** nenhum objetivo tem meta de volume por músculo (GAP-S5), e a ordenação por propósito favorece configurações marcadas, mesmo quando isso empobrece o estímulo (GAP-S6). Nenhum objetivo alterna planos de empurrar/puxar (GAP-S8).

### A.2 Diferenças por objetivo (R6-POLICY-5 + catálogo; nada aqui é novo)

| Objetivo | Reps (faixa) | Séries (máx.) | RIR alvo/início | Progressão | Descanso MAIN | Slots de contexto |
|---|---|---|---|---|---|---|
| STRENGTH | 5 (4–6) | 3 (4) | 2/3 | LOAD | 150 s | — |
| HYPERTROPHY | 8 (8–12) | 3 (4) | 2/3 | REPS_THEN_LOAD | 120 s | acessórios trocam por isolamento (flexão de joelho, extensão de joelho, cotovelo, elevação lateral) |
| RUNNING_SUPPORT | 8 (6–10) | 2 (3) | 3/3 | REPS_THEN_LOAD | 120 s | panturrilha alterna joelho estendido/flexionado; tronco ↔ abdução de quadril |
| GENERAL | 10 (8–12) | 2 (3) | 3/3 | REPS_THEN_LOAD | 120 s | — |
| MAINTAIN | 8 (8) | 2 (2) | 3/3 | HOLD | 120 s | — |

Volume (LOWER/STANDARD/HIGHER) e difficulty (V1CP) atuam sobre esse envelope sem multiplicá-lo (`v1-coaching.mjs`). Volume HIGHER de força hoje é igual ao STANDARD (divulgado).

### A.3 Matriz de capacidades

| Capacidade | Estado | Evidência |
|---|---|---|
| Catálogo versionado, hash-vinculado e autorizado por SSCTR | IMPL+TEST | `r7b-repertoire.mjs:14-63`; `r7b-binding.test.mjs` |
| Seleção por objetivo, experiência, equipamento e familiaridade | IMPL+TEST | `buildTemplates`; probe A, B, B3, H |
| Cobertura de padrões por template e declaração de lacuna de puxada | IMPL+TEST | B0-C05/C09; `pullCoverageDisclosure :341` |
| Cobertura de planos (vertical × horizontal) | AUSENTE na prática | slots admitem os dois planos, mas a ordenação sempre escolhe o horizontal (GAP-S8; probe I) |
| Continuidade: MAIN fixo no bloco, rotação só de acessórios com alternativa admissível, adiada em fases de evento | IMPL+TEST | `rotationFor :1380`; DR-134; probe A (MAIN idêntico nas semanas 1 e 2) |
| Escadas de habilidade e progressão com agência na virada de bloco | IMPL+TEST | B0-C07; `r6-adaptation.mjs:782` |
| Dose por objetivo, fase e retorno | IMPL+TEST | `strengthCandidate`, `phaseDose` |
| Progressão por evidência executada; adoção de carga registrada | IMPL+TEST | `advanceStrength`, `loggedLoadDecision`; probe E |
| Sem transferência de carga entre exercícios | IMPL+TEST | probe H; catálogo "no cross-exercise kilogram conversion" |
| Substituição por motivo e roteamento clínico | IMPL+TEST | probe D |
| Interferência ordinal corrida × força e proteção do longão e da qualidade | IMPL+TEST | CMP.I01–I11, P01–P05; probe C, G |
| Fadiga local ou sistêmica relatada | IMPL+TEST (por região) | probe F |
| Densidade para iniciantes | IMPL+TEST | B0-C08; probe A |
| Volume semanal por músculo (descritivo) | DOC | regra no catálogo, sem função (GAP-S5) |
| Meta de volume por músculo (hipertrofia) | AUSENTE | G02 aberto |
| Dose por tempo (isometria) | AUSENTE | GAP-S2 |
| Nomes localizados e sinônimos | AUSENTE | GAP-S1 |
| Motivo PROTECTED_RUN_STIMULUS_CONFLICT | DOC | só texto; CMP.P04 cobre o efeito (GAP-S7) |
| Estagnação, superset, drop set, falha, 1RM, peso corporal com carga | LATER_GATE / UNSUPPORTED | `laterGate` do catálogo |

### A.4 Riscos de implementação

1. **Hash do catálogo.** Editar `REPERTOIRE_CATALOG_B0.json` desliga as 37 configurações B0 e todos os candidatos até um novo registro SSCTR. Toda adição vai num arquivo de extensão com hash próprio (padrão `v1/EVENT_EXTENSION_V1.json`).
2. **Verificadores históricos.** Regra do Founder de 2026-11-13: nunca editar contratos ou verificadores de freeze para aceitar uma diferença. A extensão de força traz seu próprio verificador.
3. **Byte-identidade do caminho padrão.** Sem mudança de ordenação (SQ-2), o caminho padrão fica byte-idêntico. Excluir HOLD (SQ-1) muda programas em que prancha ou prancha lateral apareceriam, só nesses casos.
4. **Concorrência com o Fable.** RWS/RFC tocam corrida e composição, não `r7b-repertoire.mjs` nem `r6-catalogue.mjs`. Mesmo assim, a força entra depois do freeze das extensões de corrida ou numa linha própria a partir do mesmo base, sem rebase sobre trabalho em curso.
5. **Falsa precisão.** Não acrescentar escores numéricos de fadiga ou estímulo. O catálogo já define demandas como "priors ordinais, nunca medida de fadiga, timer de recuperação ou escore aditivo".

---

## B. Exercise Metadata Contract

### B.1 Princípio

O contrato de metadados **é o catálogo vinculado R7B0-CATALOG-2** (`configurationFields`, `vocabulary`, `demandSemantics`, `muscleCounting`). Este pacote não o duplica nem o reescreve. Acrescenta:
- **(i)** uma extensão de motor, pequena e hash-vinculada: `doseUnit` e o que SQ-1/SQ-2 decidirem;
- **(ii)** uma camada de exibição, fora do caminho de dose: nomes e sinônimos.

### B.2 Campos: necessidade, classificação e evidência

Classes: **V1** obrigatório · **OPC** útil, opcional · **DIF** diferido · **NJ** não justificável com a evidência disponível. Origem: **EX** já existe no catálogo · **NOVO** proposto aqui. Base: **CI** evidência científica (fontes R6-S do manifesto r12) · **CT** consenso ou prática técnica · **PP** política ou heurística de produto · **HIP** hipótese.

| Campo | Classe | Origem | Base | Consumidor real |
|---|---|---|---|---|
| `id` estável (ids R6 preservados) | V1 | EX | PP | tudo; ids nunca reutilizados |
| `name` canônico (inglês) | V1 | EX | PP | logs e motivos |
| nomes localizados (`pt-BR`, `en`) | V1 | NOVO, exibição | PP | app; nunca a dose (GAP-S1) |
| sinônimos e aliases por locale | OPC | NOVO, exibição | PP | busca e associação de entrada livre ou importada, se o app tiver |
| `variantOf` (família) | V1 | EX | CT | ranking de substituição |
| `pattern`, `sub`, `region` | V1 | EX | CT | slots, CMP, descanso, fadiga por região |
| `eq` (todos exigidos) | V1 | EX | PP | filtro por data |
| `loading`, `conv` | V1 | EX | PP/CT | carga, incremento, kg ou nível |
| `lat` | V1 | EX | CT | instrução "por lado"; contagem uma vez por lado |
| `skill` (LOW/MODERATE/HIGH) | V1 | EX | CT (B0-C03/C07, LOW–MODERATE) | admissão por experiência e familiaridade |
| pré-requisitos | V1 | EX como `skillLadders` | CT | progressão e regressão de habilidade |
| `prim`, `sec` | V1 | EX | CT (anatomia funcional) | variação próxima, alternativa admissível, analítica descritiva |
| `kind` (COMPOUND/ISOLATION/STABILITY/PRACTICE) | V1 | EX | CT | contexto de slot, prática |
| `purposes` | V1 | EX | PP + CI parcial (R6-S25/S34 para RUNNING_SUPPORT) | ordenação, hoje grosseira (GAP-S6) |
| `roles` admissíveis | V1 | EX | PP (DR-134) | slot MAIN/ACCESSORY/PRACTICE |
| `lower` (NONE…HEAVY) | V1 | EX | CI + heurística de classe (R6-S03…S09, S30, S31, S53) | interferência, CMP.P04/P05 |
| `axial` (NONE…HIGH) | V1 | EX | CT/HIP (prior ordinal) | desempate CMP.P05 |
| `ecc` (excêntrico/alongado) | V1 | EX | CI (R6-S10, S48, S50, S51, S54, S55: dano excêntrico e economia de corrida) + classe heurística | CMP.I11, rotação, CMP.P04 |
| **`doseUnit`** (REPS / HOLD_SECONDS) | **V1** | **NOVO, motor** | CT | forma da linha (GAP-S2; SQ-1) |
| faixa de reps por configuração | DIF | — | CT/HIP | nenhum consumidor na V1; a faixa do objetivo basta (GAP-S4) |
| estabilidade e amplitude como campos próprios | DIF | — | CT | coberto por `skill`, `kind` e `ecc`; sem consumidor |
| demanda sistêmica por exercício | NJ | — | sem escala validada por exercício | `lower`/`axial`/`kind` já servem de proxy ordinal; um número aqui seria falsa precisão |
| escore numérico de fadiga, estímulo ou interferência | NJ | — | — | proibido; o catálogo já fixa "ordinal, nunca aditivo" |
| grupos sobrepostos | V1 | EX como derivado de `prim`/`sec` | CT | sem campo próprio |
| restrição de posição na semana | V1 | EX como regra (CMP.*), não atributo | CI/PP | composição; nunca por exercício |
| equivalência para substituição | V1 | EX como relação derivada (`closeVariation`, `admissibleAlternative`) | CT | nunca armazenada como "equivalente" |
| condições de NÃO equivalência | V1 | EX derivado + C.4 | CT | `stimulusChange`, regras de C.4 |
| compatibilidade com objetivos | V1 | EX (`purposes` + dose do objetivo) | PP/CI | — |
| possibilidades de progressão | V1 | EX (`loading`/`conv` + escadas) | CT | modo de progressão |
| transferência esportiva | DIF | — | HIP individual | só como propósito; não é claim |

### B.3 Vocabulários controlados

Valem os do catálogo (`vocabulary`): `lowerBodyDemand`, `ordinalDemand`, `skillDemand`, `contextualRole`, `rotationEligibility`, `loadConvention`, `laterality`, `purpose`, `muscles` e `severity`. Novo:
- `doseUnit ∈ {REPS, HOLD_SECONDS}`, com default REPS quando ausente, o que preserva os bytes do caminho atual.

### B.4 Identidade e versionamento

1. O `id` é imutável. Uma configuração retirada fica no catálogo como LATER_GATE ou UNSUPPORTED, e seu id nunca é reutilizado.
2. **Catálogo de motor:** muda só por nova revisão (R7B0-CATALOG-3), com sha e registros SSCTR. **Extensão de força:** `v1/STRENGTH_EXTENSION_V1.json` declara `binds: {catalogRevision, catalogSha256}` e tem sha próprio fixado no runtime; mudar a extensão desliga só a extensão.
3. A camada de exibição não tem hash no motor. A cobertura é checada por teste: todo id do catálogo tem nome pt-BR.
4. Todo programa registra o binding (`repertoireBinding`). Quando a extensão existir, o binding ganha `strengthExtension: {version, sha256}`.

### B.5 Fontes e níveis de evidência

O manifesto de evidência é o do catálogo (`audits/domain-coaching-r6-2026-10-26/reviews/ssctr-evidence-manifest.r12.json`, mapa em `REPERTOIRE_CATALOG_B0.json#evidence`). Não houve pesquisa nova. As atribuições de classe por exercício (qual exercício é HEAVY, qual é HIGH excêntrico) são **heurística ordinal aprovada com condições** (B0-C04, SUPPORTED_WITH_LIMITS, confiança MODERATE), não medição.

---

## C. Exercise Selection & Substitution Contract

Contrato descritivo do que o runtime já faz (IMPL), mais os três acréscimos (NOVO). A seleção nunca decide dose, progressão, volume, intensidade, recuperação, distribuição semanal, taper, holds ou segurança: esses ficam com o motor (C.6).

### C.1 Seleção (IMPL)

1. **Estrutura antes do exercício.** Dias → templates; slot = padrão + papel + subpadrões. Selecionar não cria slot.
2. **Admissibilidade (filtro):**
   - catálogo admitido pela autoridade;
   - equipamento da data;
   - papel do slot;
   - habilidade: LOW para NONE/NOVICE, até MODERATE para INTERMEDIATE/EXPERIENCED, HIGH só familiar ou alcançado por escada;
   - uso único na sessão;
   - nada posto de lado por motivo;
   - `knownOnly` quando exigido.
3. **Ordenação:** a de `selectionCompare` (C.5 para a mudança de SQ-2).
4. **Cobertura:** os templates cobrem agachar, hinge, empurrar, puxar, unilateral, panturrilha e tronco. Os slots MAIN de empurrar/puxar **admitem** os dois planos, mas na prática só o horizontal é escolhido (GAP-S8, N4). Um padrão sem configuração gera `missingPatterns` + `missingLimits` (SKILL/EQUIPMENT) e uma divulgação, nunca omissão silenciosa. Puxada limitada → PULL_LIMITED_FOR_EQUIPMENT.
5. **Iniciante:** prática na semana de estabelecimento, densidade de 2 templates completos e escadas com agência. Nenhuma configuração HIGH.
6. **Experiente:** recebe o que declarou familiar ou o que alcançou pela escada. O motor nunca presume familiaridade a partir de meses de treino (probe B2) nem de uma variante próxima (probe H: agachamento com barra ≠ agachamento frontal).

### C.2 Continuidade e estabilidade (IMPL)

- **MAIN:** fica no bloco. Na virada, muda só com motivo registrado (DELIBERATE_BLOCK_TRANSITION, SKILL_PROGRESSION com agência, EQUIPMENT_CHANGE, ATHLETE_PREFERENCE). Nunca muda em fase adiada.
- **ACCESSORY:** gira só com alternativa admissível e na cadência da preferência. A virada nunca aumenta a demanda de membros inferiores nem a excêntrica, e não cai na véspera de corrida protegida.
- **PRACTICE:** nunca gira pelo calendário.
- **Determinismo:** a mesma entrada gera os mesmos exercícios. A ordenação termina no id.
- **Histórico:** o estado da progressão é por id. Um exercício que volta depois de mais de 28 dias se restabelece com a carga anterior como teto. Uma troca não apaga o histórico do exercício trocado.
- **Invariante "sem gerador aleatório":** entre duas semanas consecutivas sem decisão registrada, sem fase adiada e sem virada de cadência, o conjunto de configurações por slot é idêntico (V-SEL-03).

### C.3 Substituição (IMPL)

| Motivo | Gatilho | Direção | Dose |
|---|---|---|---|
| EQUIPMENT_UNAVAILABLE | janela datada ou permanente | mesmo padrão, depois família de variante; o original volta ao fim da janela | substituto por esforço; original com regra de retomada |
| SKILL_MISMATCH | atleta sem técnica estável | degrau abaixo na escada, ou menor habilidade; nunca acima do substituto | estabelecimento |
| NONCLINICAL_DISCOMFORT_OR_PREFERENCE | `nonclinicalConfirmed:true` | mesmo padrão, ranking de C.1 | estabelecimento |
| clínico (dor, lesão, doença, limitação) | qualquer sinal | **nenhuma substituição**; CLINICAL_HUMAN_REQUIRED | — |
| DELIBERATE_BLOCK_TRANSITION | virada de bloco | razão + propósito | estabelecimento |
| PROTECTED_RUN_STIMULUS_CONFLICT | — | **não implementado** (GAP-S7): o efeito vem do arranjo + CMP.P04 | — |

### C.4 Quando a substituição NÃO é equivalente (IMPL; regras, não atributos)

Uma troca é sempre declarada como **substituição, não equivalência**. É **estímulo diferente** (divulgado) quando:
1. carga externa → peso corporal, elástico ou assistência (`stimulusChange`);
2. subpadrão diferente (escada que muda o subpadrão, como flexão → pike: "variação, não progressão");
3. nenhum músculo primário em comum, o que não a torna admissível como alternativa de rotação;
4. demanda de membros inferiores, axial ou excêntrica a mais de um passo (back-squat → goblet-squat não é variação próxima; probe I);
5. máquina diferente (MACHINE_STACK nunca é comparável entre máquinas);
6. unilateral ↔ bilateral: lados nunca somados; a contagem muda.

Em todos os casos: a carga não é transferida, a primeira exposição é estabelecimento e não há progressão na primeira exposição.

### C.5 Acréscimos (NOVO; decididos pelo SSCTR em §8, com as condições lá listadas)

- **N1. `doseUnit: HOLD_SECONDS`** para `front-plank` e `side-plank`. Regra V1 recomendada: configuração HOLD **não admissível para seleção** enquanto não houver dose de tempo aprovada. Sai da seleção, da rotação e das alternativas. Tronco segue com dead-bug, bird-dog e pallof-press, todos por repetição. Não cria dose. Alternativa: dose por tempo aprovada pelo SSCTR (SQ-1).
- **N2. Ordenação para RUNNING_SUPPORT em membros superiores.** Em slots de região UPPER, o critério "propósito RUNNING_SUPPORT" deixa de vir antes de "carga externa", porque os membros superiores não têm custo de corrida (catálogo `interferenceNotes`). Com equipamento, o MAIN superior volta a ser db-row/supino com halteres. Sem equipamento, nada muda. Só seleção; nenhuma dose (SQ-2).
- **N4. Alternância de plano na semana.** Na mesma lógica da alternância de panturrilha (B0-C05), quando a semana tem dois ou mais slots MAIN do mesmo padrão (PUSH ou PULL), o segundo prefere o plano vertical se houver configuração admissível. Exemplos: TPL.UPPER_B, ou FULL_B quando FULL_A já tem o horizontal. A escolha é fixa por slot durante o bloco, para preservar a continuidade (MAIN não gira). Com um só slot do padrão, nada muda. Só seleção; nenhuma dose (SQ-4).
- **N3. Exposição semanal por músculo, descritiva** (`weeklyStrengthExposure`): séries de trabalho por primário, conforme `muscleCounting`. Unilateral conta uma vez; aquecimento e prática ficam fora. Saída só para analítica e explicação; **nenhum consumidor de dose, nenhum limiar** (SQ-3).

### C.6 Fronteira com o motor adaptativo

| Decisão | Dono | O que a camada de exercício fornece |
|---|---|---|
| Progressão, volume, intensidade | `strengthCandidate`/`phaseDose`/`advanceStrength` (R6-POLICY-5 + SSCTR D-series) | `loading`, `conv` e o incremento derivado; nada mais |
| Recuperação e interferência | `interferenceCosts`/`chooseBalanced` (CMP.*) | `lower`, `ecc`, `axial` e o primeiro contato (`novelOrEccentricLower`) |
| Distribuição semanal | arranjo híbrido (CMP.P01–P05) | nada; a seleção vem depois do arranjo |
| Taper, semana de prova e pós-prova | `phaseDose` + `NO_NEW_EXERCISE_PHASES` | o substituto já feito no programa |
| Holds, retornos e clínico | adaptação (F08, D49, triagem clínica) | nada; nenhum metadado libera um hold |
| Segurança e elegibilidade | intake + triagem | nada |

**Regra:** nenhum campo novo é lido por `strengthCandidate`, `phaseDose`, `advanceStrength`, `interferenceCosts` ou pelos handlers clínicos e de hold. N1 atua só no filtro de admissibilidade. N2 e N4 atuam só na ordenação. N3 não tem consumidor de decisão. **Dependência congelada:** nenhuma. N1, N2 e N4 mudam a seleção sob B0-C03/C05, e por isso passam pelo SSCTR (§8). Nenhum relaxa um bloqueio.

---

## 5. Integração corrida × musculação

O motor já distingue as situações pedidas. Classificação de cada regra:
- **CI** = interferência plausível sustentada por evidência;
- **RC** = restrição de produto;
- **PROG** = preferência de programação.

| Situação | O que acontece hoje | Base | Metadado usado |
|---|---|---|---|
| Quadríceps pesado antes de intervalado | CMP.I02 MODERATE se ≤ 30 h; I03 LOW até 54 h; o arranjo evita quando os dias permitem | CI | `lower` após ajuste por séries |
| Grande estímulo excêntrico antes do longão | CMP.I11 LOW até 30 h; CMP.P04 tira uma série de acessório HIGH-excêntrico sob liderança RUN, com explicação; rotação nunca põe excêntrico novo ali | CI (dano excêntrico × economia de corrida) | `ecc`, primeira exposição |
| Força de superiores perto de corrida leve | **sem custo** (nenhuma relação) | CI (ausência de mecanismo nos membros inferiores) | `region` |
| Demanda sistêmica elevada (terra, agachamento pesado) | sem classe sistêmica; `axial` HIGH é o primeiro a ser trocado quando sessão pesada fica vizinha de corrida-chave (CMP.P05) | CT/HIP | `axial` |
| Recuperação insuficiente entre sessões | CMP.I10: duas sessões pesadas de inferiores em ≤ 48 h, MODERATE; I09: duas corridas-chave em ≤ 30 h | CI/PROG | `lower` |
| Mesmo dia, turnos diferentes | duas sessões; intervalo por `turnHours`; rótulo "mais cedo no mesmo dia"; I05–I08 por direção | CI (ordem) + RC (DR-112) | `lower` |
| Semana de prova | força só MAIN, poucas séries, RIR alto; I01 HIGH para inferiores ≤ 72 h antes da prova | CI + PROG | — |
| Corrida × hipertrofia | liderança por fase (RUN/STRENGTH/JOINT) protege estímulos diferentes; JOINT com empate real pergunta uma vez | RC | — |

**Nem toda proximidade é inadequada:**
- severidades LOW não bloqueiam;
- custos não são somados;
- só MODERATE+ obriga a divulgar alternativas (`hybridSemantics.disclosure`);
- evidência individual pode subir a severidade para aquele atleta, nunca baixar a populacional.

Probe G: o mesmo dia com corrida leve AM e força PM não gerou custo, o que está correto.

**O que os metadados ainda poderiam acrescentar:** nada indispensável para a V1. A classe sistêmica ficou NJ, e a fadiga local por músculo ficou DIF (a região basta para os sinais que o app coleta).

---

## D. Catálogo exemplar

`EXERCISE_EXEMPLAR_V1.json` (r2) reúne **23 configurações já existentes**. Ele não cria exercícios: o catálogo de 76 é o tamanho V1 atual, e o tamanho comercial é outra decisão. Cobre agachamento (4), hinge (4), empurrar H/V (4), puxar H/V (4), unilateral (2), panturrilha (2), tronco (3, incluindo os dois HOLD) e acessório de corredor (1 tibial).

Cada entrada traz:
- `id`, ligado ao catálogo por sha;
- **somente os campos novos** (`doseUnit`, `display.pt-BR`, `aliases`);
- `decisions`: a decisão real que os metadados existentes produzem (seleção, substituição, programação), com referência à regra e, quando houver, à checagem da probe.

Os valores existentes não são copiados: `check-package.mjs` os lê do catálogo vinculado e imprime a tabela derivada (`--table`). Nenhum número de fadiga, estímulo ou interferência foi atribuído.

---

## E. Validation Pack

### E.1 Cenários sintéticos (já executados na probe, sobre o motor atual)

| Cen. | Fatos fixos | Invariantes verificados |
|---|---|---|
| A | iniciante, 3 dias, só halteres | classe NONE; nenhuma configuração HIGH; semana 0 só prática ou estabelecimento (nenhum kg); 2 templates completos + 1 mais leve com negociação; MAIN idêntico nas semanas 1–2 |
| B | intermediário, hipertrofia, 2 × 40 min, academia, supino e agachamento conhecidos | reps 8–12, REPS_THEN_LOAD; exercícios familiares HIGH selecionados; carga conhecida usada sem conversão; volume por músculo apenas descritivo (GAP-S5) |
| B2/B3 | 36 meses de força, com e sem exercícios nomeados | sem nomear: nenhuma configuração HIGH (GAP-S3); familiaridade declarada sem carga: HIGH selecionado e estabelecido por esforço |
| C | híbrido 10K, qualidade + longão, força RUNNING_SUPPORT, cargas conhecidas | custos ordinais, sem HIGH fora da prova; véspera do longão mantém o MAIN, e CMP.P04 só toca acessório HIGH-excêntrico; taper/prova com menos séries, RIR ≥ 3, só MAIN na prova, nenhum exercício novo; MAIN superior = flexão/elástico (GAP-S6) |
| D | troca do agachamento principal por preferência não clínica | mesmo padrão; estabelecimento; demais MAIN intactos; com dor → humano; substituto com peso corporal declarado como estímulo diferente; motivo de corrida protegida inexistente (GAP-S7) |
| E | força (LOAD) e hipertrofia (REPS_THEN_LOAD) ao longo de 5–6 semanas | no máximo um incremento por semana, só com evidência; identidade preservada; reps 8→10→12→+carga→8 |
| F | semana de força perdida; fadiga local LOWER; fadiga sistêmica | nada empilhado; local remove acessórios de inferiores e mantém MAIN; sistêmica deixa só MAIN, −1 série, RIR ≥ 4 |
| G | corrida AM + força PM nos mesmos dias | duas sessões nos dias escolhidos; custos computados; nada indevido |
| H | carga conhecida só no agachamento com barra | todo outro exercício com carga sai por estabelecimento; nenhuma variante HIGH presumida |

Resultado em `ce4f136`: **37/37** (`probe-strength.mjs`). As checagens marcadas `GAP-*` passam quando a lacuna é observada. Quando N1–N3 forem implementados, essas checagens viram testes do novo comportamento (E.3).

### E.2 Invariantes (para os testes da extensão)

| ID | Invariante |
|---|---|
| V-SEL-01 | Determinismo: a mesma entrada e a mesma autoridade geram exatamente as mesmas configurações. |
| V-SEL-02 | Nenhuma configuração HIGH sem familiaridade declarada ou escada alcançada. |
| V-SEL-03 | Sem decisão registrada, fase adiada ou virada de cadência, os slots não mudam de uma semana para a seguinte. |
| V-SEL-04 | MAIN nunca muda pelo calendário; só por decisão com motivo na virada de bloco ou por substituição por motivo. |
| V-SEL-05 | Padrão sem configuração é declarado (SKILL/EQUIPMENT) e nunca omitido em silêncio. |
| V-SUB-01 | Substituto: mesmo padrão; nenhuma carga transferida; primeira exposição = estabelecimento. |
| V-SUB-02 | Dor, lesão, doença ou limitação nunca geram substituição; o caso vai a humano. |
| V-SUB-03 | SKILL_MISMATCH nunca sobe a habilidade. |
| V-SUB-04 | Nenhum exercício novo no programa durante taper, semana de prova ou pós-prova. |
| V-PRG-01 | No máximo um passo de carga por semana por exercício; nunca sem evidência executada. |
| V-PRG-02 | Nenhuma carga entre exercícios, implementos ou máquinas. |
| V-INT-01 | Nenhum metadado novo é lido por dose, progressão, interferência, hold ou triagem clínica. |
| V-INT-02 | Custos de interferência continuam ordinais e não somados. |
| V-EXT-01 | Extensão ausente, com hash diferente ou sem registro: comportamento byte-idêntico ao atual. |
| V-EXT-02 (N1) | Com a extensão ativa, nenhuma linha HOLD é prescrita com repetições. |
| V-EXT-03 (N2) | Com a extensão ativa, em RUNNING_SUPPORT com equipamento, o MAIN superior tem carga externa; sem equipamento, igual ao atual. |
| V-EXT-05 (N4) | Com a extensão ativa, uma semana com 2+ slots MAIN de PUSH (ou PULL) e equipamento para os dois planos contém os dois planos; a configuração de cada slot fica idêntica dentro do bloco. |
| V-EXT-06 (N1, SQ-1) | Nenhuma linha HOLD em slot, rotação, substituição, fallback, alternativa de contexto, PRACTICE ou oferta de escada (dead-bug → front-plank), mesmo com familiaridade ou preferência; tronco coberto em todo perfil de equipamento, inclusive só peso corporal; nenhum valor em segundos em lugar nenhum. |
| V-EXT-07 (N4, SQ-4) | Preferir o vertical nunca rebaixa um slot de carga externa para peso corporal, assistido ou elástico (halteres + elástico: db-row fica, band-pulldown não entra); no máximo metade dos slots MAIN do padrão vai para o vertical; um slot só fica horizontal; configuração familiar ou estabelecida no *outro* slot não derruba a preferência (supino familiar: bench-press no slot 1, db-overhead-press no slot 2); N4 nunca introduz exercício em TAPER, RACE_WEEK ou POST_EVENT; programa existente adota só na virada de bloco. |
| V-EXT-08 (N2, SQ-2) | Ordem em slots UPPER sob RUNNING_SUPPORT: familiar → estabelecido → carga externa → propósito → resto; habilidade e equipamento inalterados (nenhum barbell-row ou bench-press sem familiaridade); MAIN de programa existente só muda na virada de bloco com motivo registrado; teste conjunto N2 + N4. |
| V-EXT-04 (N3) | A exposição por músculo bate com `muscleCounting` e não altera nenhum byte do programa. |
| V-DSP-01 | Todo id do catálogo tem nome pt-BR; nenhum alias aponta para dois ids. |

### E.3 Testes necessários (novos, na extensão)

- `test/v1str-extension.test.mjs` — V-EXT-01 (sem arquivo, hash errado ou sem registro → igual ao base), V-EXT-02, V-EXT-03, V-EXT-05, V-EXT-06, V-EXT-07, V-EXT-08, V-INT-01 (espião sobre os campos lidos).
- `test/v1str-exposure.test.mjs` — V-EXT-04, cenário B (valores conhecidos), unilateral e prática.
- `test/v1str-display.test.mjs` — V-DSP-01 sobre o arquivo de exibição.
- Regressão: a suíte atual inteira na entrada composta, mais `probe-strength.mjs` com as checagens GAP-S2/S6/S8 invertidas.

### E.4 Critérios objetivos de aceitação

1. A suíte atual passa sem alteração (contagem igual à do freeze base).
2. V-EXT-01: hash dos programas sem a extensão = hash atual, para os fixtures v1cp/v1fc.
3. Os novos testes passam; a probe passa com as GAP-S2/S6/S8 invertidas.
4. O verificador próprio da extensão vincula o sha da extensão, o sha do catálogo e o registro SSCTR.
5. SSCTR revisa o candidato implementado (não esta especificação) para N1 e N2.

---

## F. Implementação — menor caminho viável

**Reutiliza tudo:** `r7b-repertoire.mjs`, `r6-catalogue.mjs`, `r6-program.mjs` (dose, progressão, composição), `r6-adaptation.mjs` (substituição e fadiga), `r6-balanced.mjs` (interferência). Nenhum módulo novo de seleção.

| Etapa | O quê | Arquivos | Dono | Bloqueia V1? |
|---|---|---|---|---|
| S0 | Onboarding pergunta quais exercícios a pessoa já faz com técnica estável (lista curta por padrão, só configurações HIGH e MODERATE) → `knownExercises{id, familiar, current, tolerated, observedAt}` sem dose; dose de trabalho opcional | contrato ADF §2.1 (adendo); app | Product/onboarding + ADF | sim (GAP-S3) |
| S1 | Camada de exibição: `display.pt-BR` + `aliases` para os 76 ids | arquivo de conteúdo do app (ex.: `app/content/exercises.pt-BR.json`), fora do CoachingCore | Product/conteúdo | sim (GAP-S1) |
| S2 | Extensão de motor: `v1/STRENGTH_EXTENSION_V1.json` (`binds` catálogo sha, `doseUnit`, flag de ordenação N2); `src/v1-strength.mjs` lê e verifica o sha; filtro HOLD em `usable`/`candidatesFor`; ajuste em `selectionCompare` para região UPPER sob RUNNING_SUPPORT; alternância de plano em `buildTemplates` (mesmo mecanismo de `calfSub`) | 1 JSON + 1 módulo novo; ~3 pontos de chamada em `r7b-repertoire.mjs`/`r6-catalogue.mjs` | Fable | sim para N1 (defeito visível) e N4 (cobertura pedida); N2 é qualidade |
| S3 | `weeklyStrengthExposure` (N3) | `src/v1-strength.mjs` | Fable | analítica V1 ("volume por grupo") |
| S4 | Verificador próprio + registros SSCTR SI-V1-SQ-1..4 (já decididos sobre a especificação) re-vinculados ao sha da extensão na revisão do candidato | `scripts/v1str-verify.mjs`; registro em `audits/…/reviews/` | Fable + SSCTR | sim |

**Composição de entrada:** a mesma regra da linha de corrida (RFC envolve RWS, que envolve `v1-run-index`). A extensão de força é lida pela autoridade do repertório, não por um wrapper de entrada, porque atua dentro de `buildTemplates`. Ela entra como opção `strengthExtension` resolvida em `repertoireAuthority` e registrada no binding.

**Ordem:** S0 e S1 podem começar já (não tocam o motor). S2–S4 entram depois do freeze V1RWS/V1RFC ou numa linha própria a partir do mesmo base (`ce4f136`), com integração por merge. Nunca mexer na linha do Fable em curso.

**Dependências esportivas:** SQ-1 a SQ-4 (§8). PD-3 (1RM como semente) continua na ADF e não é pré-requisito.

**V1 obrigatório × futuro:**
- **V1:** S0, S1, N1, N4, N3 descritivo.
- **V1 recomendado:** N2.
- **Futuro (G02 e LATER_GATE):** meta de volume por músculo para hipertrofia; faixa de reps por exercício; dose por tempo (se SQ-1 escolher exclusão); regra de estagnação; superset/drop set; peso corporal com carga extra; 1RM/PD-3; fadiga local por músculo; mídia técnica; ampliar o catálogo para a biblioteca comercial.

---

## 8. Evidência e revisão SSCTR

**Evidência usada:** só a do projeto (manifesto r12, decisões B0-C03…C12, R6-POLICY-5 e as séries SSCTR D). Nenhuma pesquisa nova foi necessária: as quatro questões abaixo são de aplicação, não de literatura.

| Questão | Recomendação do Chief | Por que precisa do SSCTR |
|---|---|---|
| **SQ-1** Isometria (prancha, prancha lateral): (a) tirar da seleção até haver dose de tempo, ou (b) aprovar dose por tempo | (a): nenhuma dose nova; tronco segue coberto por dead-bug, bird-dog e pallof-press | muda o repertório admitido sob B0-C03 |
| **SQ-2** Em slots UPPER sob RUNNING_SUPPORT, carga externa antes do propósito | aprovar: membros superiores não têm custo de corrida; flexão e elástico como MAIN são estímulo menor sem ganho de compatibilidade | muda o exercício prescrito sob B0-C05 |
| **SQ-4** Alternância de plano (N4): o segundo slot MAIN de PUSH/PULL da semana prefere o vertical, fixo no bloco | aprovar: os templates já admitem os dois planos e a regra é da mesma família da alternância de panturrilha aprovada (B0-C05); hoje a cobertura vertical é nula | muda o exercício prescrito sob B0-C05 |
| **SQ-3** Hipertrofia na V1: manter as doses aprovadas, sem meta nem limiar por músculo; exposição por músculo só descritiva; claims limitados | confirmar; a meta fica em G02 | define o limite do que a V1 pode prometer em hipertrofia |

### 8.1 Decisão do SSCTR (2026-11-13; revisão até 2027-04-30)

Registros `reviews/SSCTR_SI_V1_DECISION.json` (SI-V1-SSCTR-SQ-1..4), vinculados ao sha `50e6a5ed49dab57e…` deste documento no commit `3ed9dec`. O SSCTR rodou a probe (37/37) e a varredura, e fez três buscas dirigidas (Europe PMC). Nenhuma questão exigiu escalonamento. As condições completas e testáveis estão nos registros; o resumo abaixo é só leitura.

| Questão | Disposição | Evidência · confiança | Condições principais |
|---|---|---|---|
| SQ-1 isometria | **APPROVE_WITH_CONDITIONS** para (a); **ABSTAIN** em (b) | SUPPORTED_WITH_LIMITS (consenso técnico) · MODERATE | HOLD_SECONDS em front-plank **e side-plank**; nenhuma linha HOLD em lugar nenhum (V-EXT-06); tronco coberto em todo perfil, ou lacuna declarada (B0-C09); nenhum valor em segundos; perda da cobertura antiflexão lateral divulgada como limitação; MAIN inalterado; linha de prancha existente trocada a partir da próxima semana construída como troca de acessório registrada. Dose por tempo (b) exige proposta concreta e decisão própria. |
| SQ-2 superiores em RUNNING_SUPPORT | **APPROVE_WITH_CONDITIONS** | SUPPORTED_WITH_LIMITS (heurística com suporte científico) · MODERATE | só slots UPPER (inclusive contexto EVENT em acessórios); ordem familiar → estabelecido → carga externa → propósito; admissibilidade inalterada; nova linha com carga começa por estabelecimento; sem opção de carga, byte-idêntico; nenhum claim de benefício para corrida ou lesão; teste conjunto com N4. Contraevidência registrada: flexão ≈ supino só com carga equiparada, que a V1 não oferece (peso corporal com carga é LATER_GATE). |
| SQ-3 hipertrofia | **APPROVE_WITH_CONDITIONS** (confirma) | SUPPORTED_WITH_LIMITS · HIGH | uma vez por músculo primário; secundários nem contados nem frações; unilateral uma vez; aquecimento e prática nunca; planejado e executado separados (executado só de séries registradas; depende de Data/G03); nenhum consumidor (V-INT-01); exibição sem meta, faixa, cor, escore ou limiar. Meta ou contagem fracionária: G02 com revisão própria. |
| SQ-4 alternância de plano | **APPROVE_WITH_CONDITIONS** + guarda de classe de carga | SUPPORTED_WITH_LIMITS para admissibilidade; benefício PLAUSIBLE_BUT_UNCERTAIN, não declarável · MODERATE | V-EXT-07; perfis só com halteres ou halteres + banco não têm puxada vertical no catálogo, e N4 não os resolve (fica a lacuna, declarada); nenhum claim de cobertura equilibrada ou de benefício de força, hipertrofia, postura, ombro ou corrida. |

**O que a V1 NÃO pode dizer sobre hipertrofia (SQ-3):** volume ótimo, máximo ou "baseado em ciência"; "10 séries" ou qualquer meta por músculo; suficiente/insuficiente, abaixo/acima do recomendado; músculos negligenciados ou equilibrados; crescimento prometido ou previsto; direcionamento ou especialização por músculo; conselho de acrescentar séries a partir da contagem; que a corrida não afeta a hipertrofia ou que a interferência foi neutralizada; que um plano limitado pelo tempo equivale a um programa de volume maior.
**O que pode dizer:** o plano segue uma prescrição orientada à hipertrofia (8–12 repetições, repetições e depois carga, repetições em reserva) dentro dos dias e do tempo escolhidos, e o trabalho semanal por músculo depende do tempo disponível.

**Abertos, com dono:**
- **Fila humana:** quatro itens HQ-SI-V1-SSCTR-SQ-1..4 ficam **propostos apenas** nos registros. Esta missão proíbe alterar a fila; o próximo dono da fila os acrescenta. Até lá, a correspondência registro↔fila não fecha (`validate_records.py` não foi rodado).
- **Revisão do candidato:** a do SSCTR sobre a implementação do Fable continua obrigatória. Esta decisão é sobre a especificação; nenhum gate foi fechado e nada foi publicado.
- **Despacho:** o SSCTR rodou como subagente com o adaptador nativo do projeto e declarou não poder verificar o próprio despacho.

---

## 9. Resposta de encerramento

**O que falta para o módulo de musculação escolher, estruturar, substituir e acompanhar exercícios de forma inteligente, coerente com a corrida?**

**Escolher e estruturar: quase nada no motor.** A seleção já é por objetivo, experiência, familiaridade, equipamento, papel e cobertura de padrões, de forma determinística e estável. Falta a **entrada certa**: perguntar no onboarding quais exercícios a pessoa domina (S0). Sem isso, um experiente recebe uma versão de iniciante avançado. Falta também corrigir três escolhas: isometria por repetição (N1), o MAIN superior de quem corre (N2) e a ausência de empurrar/puxar na vertical (N4). Esta última é a única lacuna de seleção que o próprio pedido nomeia.

**Substituir: nada estrutural.** Os motivos, a direção, o roteamento clínico, o estímulo diferente declarado, a ausência de transferência de carga e as semanas de evento estão implementados e testados. O motivo "corrida protegida" é coberto por arranjo + CMP.P04; o texto do catálogo se corrige na próxima revisão.

**Acompanhar:** a progressão por evidência está pronta. Falta a **exposição semanal por músculo descritiva** (N3) para a analítica de "volume por grupo" prometida na V1, sem virar meta.

**Coerência com a corrida:** já é a parte mais madura. Interferência ordinal, proteção do longão e da qualidade, mesmo dia por turnos, fases de evento e liderança por fase. Os metadados necessários (`lower`, `ecc`, `axial`, `region`) existem.

**O que não é desta fundação e não se finge resolver:** meta de volume por músculo para hipertrofia (G02), estagnação, métodos especiais, 1RM e fadiga por músculo. Uma coleção de metadados não é inteligência de força. Aqui a inteligência já existe, e a fundação acrescenta quatro ajustes, uma pergunta de onboarding e uma camada de nomes.

**SSCTR:** as quatro questões estão decididas com condições (§8.1); a implementação as herda como invariantes V-EXT-06..08.

**STOP_WHEN atendido:** diagnóstico comprovado (probe 37/37), contratos B e C definidos sobre o catálogo existente, exemplar D consistente (`check-package.mjs`), pacote de validação E utilizável, caminho F com donos.
