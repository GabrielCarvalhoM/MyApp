# Athlete Data Foundation — contrato de dados do atleta (V1), 2026-11-13

**Autor:** Chief (Opus 5.5). **Para:** Fable 5.2, integração, Data/Security, Product.
**Base lida:** `ce4f136` (linha comum `claude/v1-run-extensions`):
- runtime `c8104c1` (COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1);
- handoffs RWS r3+r3a e RFC r3;
- preflight.

**Não alterado:** CoachingCore, freezes, Figma, branches das extensões, missão, ledger e fila (continua 235).

**Prova:** `probe-athlete-data.mjs` (nesta pasta). Somente leitura, roda sobre `v1-run-index.mjs` sem opções, como a integração. Resultado: **32/32** checagens conferem com o diagnóstico abaixo.

```
node audits/v1-athlete-data-foundation-2026-11-13/probe-athlete-data.mjs
```

**Veredito:** o motor já diferencia os quatro cenários sem inventar capacidade. A meta nunca vira evidência. Falta um único canal de dados: a **distância datada de corridas fora do plano** (importadas ou declaradas). Esse canal alimenta o L30 e a corrida longa comparável da RWS. O resto é contrato do cliente (o que coletar e como enviar) e dois pontos de integração.

---

## 1. Diagnóstico do estado atual

A entrada do motor é `canonicalizeIntake` (`src/r6-intake.mjs:80`).

**Legenda de estado:**
- ✅ = usado corretamente;
- ⚠️ = usado, mas o cliente pode enviá-lo de forma que se perca;
- ⛔ = coletado e descartado;
- ∅ = inexistente.

| Dado | Campo de entrada | Estado | Consumidor real (código) |
|---|---|---|---|
| Idade | `athlete.ageYears` (18–80) ou `ageEligible` | ✅ só elegibilidade | `r6-intake.mjs:89-90`. Fora de 18–80 → UNSUPPORTED. Não modera a progressão (UXS ONB-20 diz que modera: deriva documental, ver §4 G9). |
| Peso, altura, sexo | `weightKg`, `heightCm`, `sex` | ⛔ por desenho | Guardados em `profileContext` com `doseConsumer:false` (`:267`). Nenhuma dose, carga ou ritmo os lê. Probe D. |
| Experiência em corrida | `runTrainingMonths` (0 / 1–5 / 6–23 / 24+) ou `runExperience` | ⚠️ | Classe de corrida (`r6-program.mjs:40-45`), elegibilidade de maratona e 5K, teste P3 (`v1-run-calibration.mjs:518-520`) e, nas extensões, a elegibilidade RWS (INTERMEDIATE+) e o G da RFC. **Se a categoria vier junto com os meses, os meses se perdem** (`experienceBasis` só existe quando a categoria não é dada; `:134-135`). O critério de meses do teste de 5K passa a ser tratado como desconhecido. Probe D2. |
| Experiência em força | `strengthTrainingMonths` ou `strengthExperience` | ✅ | Classe de força, nível de habilidade dos exercícios (`r6-program.mjs:48-51`, `r6-adaptation.mjs:812`). |
| Prática recente de corrida | `recent.runDaysPerWeek`, `runMinutesPerWeek`, `longestRunMinutes` | ✅ (em minutos) | Classe de corrida, início do longão, critérios da maratona. **Nenhuma distância é lida** (só minutos). |
| Histórico importado (Apple Saúde) | `history[]` + `wearableCapabilities` | ⚠️ / ⛔ | `historySummary` (`r6-intake.mjs:67-74`): janela de 28 dias, deduplica por `canonicalActivityId` → `activityId` → `startedAt:sport`, descarta parciais e resume dias, minutos e o maior tempo por semana. Com `completeness:'FULL'` ou sem autorrelato, usa o **menor** entre os dois. **A distância de cada corrida é descartada** e as linhas brutas não ficam no programa (probe C). Divide por 4 semanas se `historyWeeks` não for enviado (probe C2). |
| Recordes e resultados | `performanceAnchors[]` | ⚠️ | A V1RC lê como evidência (`v1-run-calibration.mjs:193`):<br>• **CAPACITY** só com data ≤ 56 dias, `measurement` em {OFFICIAL, TRACK, GPS, MANUAL, TREADMILL} e `tolerated:true`;<br>• 57–112 dias: presumida, LOW;<br>• recorde sem data: HISTORICAL_BEST, nunca capacidade (probe B1, D);<br>• **resultado sem `measurement` ou sem `tolerated`: REJECTED** (probe B3);<br>• resultado ≤ 28 dias **com `sport:'RUN'`** também vira "maior corrida recente" (`r6-intake.mjs:165`; sem `sport` não vira: probe B4). |
| Tarefas de qualidade familiares | `knownRuns[]` (em minutos) | ✅ | Classe QUALITY_FAMILIAR. "6 × 800 m" não é representável (RWS L8, fora de escopo). |
| Cargas de força | `knownExercises[]` (séries, reps, RIR, carga+unidade+convenção, `observedAt` ≤ 28 d, `current`, `familiar`, `tolerated`) | ✅ | Classe KNOWN_LOAD e dose inicial (`r6-program.mjs:47-51`; probe D). Unidade ou convenção ilegível: divulgada e não usada (`:204`). **Não há campo de 1RM/recorde.** Um 1RM enviado como dose seria lido como série de trabalho (ver §3 e §7, PD-3). |
| Objetivos | `goals.run`, `goals.strength`, `event{kind,date,timeGoalMinutes}` | ✅ | Modelo de objetivo e fases. **Tempo-meta é só contexto** (`:208`). Na V1RC aparece como `goal` com `isPrediction:false, usedForPace:false` e relação neutra (probe B1, B2). |
| Dias por esporte, mesmo dia | `schedule.runDays`, `strengthDays`, `runTurn`, `strengthTurn`, `sameTurnConfirmed`, `temporaryPreference` | ✅ | `sharedDays` e negociação de turno (`r6-intake.mjs:145-146`, `r6-program.mjs:1475`). Turnos diferentes não geram pergunta (probe D). |
| Tempo por sessão | `runMinutes`, `longRunMinutes`, `strengthMinutes` (10–240) | ✅ | Orçamento por sessão. Um valor para todas as corridas mais o longão (coerente com UXS ONB-09). Não há minutos por dia. |
| Sessões do plano (app ou importadas) | observações de revisão `{sessionId, actual, source}` | ✅ | `normalizeObservations` (`r6-provenance.mjs:65`):<br>• identidade `session:<id>`;<br>• o mesmo treino do app e do Apple Saúde se funde se concordam (minutos ±max(3, 10 %)), senão o conflito fica em quarentena (probe E1);<br>• correções por `correctionOf`. |
| Corridas importadas sem sessão | observação sem `sessionId` | ⛔ inerte | Gravada como `UNPLANNED`, **sem `context.sport`**. Não entra em carga, crédito, P1, Q8 nem estimativa (probe E2). Se o mesmo treino for enviado vinculado e solto, vira `ACTIVITY_BOUND_TO_TWO_SESSIONS` e a sessão fica em quarentena (probe E3). |
| Ritmo de corrida leve (P1) | linhas do plano: família EASY, ≥ 20 min, distância, **RPE ≤ 4 relatado** | ✅ | Só sessões do plano com RPE. Histórico importado nunca gera P1 (probe C). |
| Distância de corrida fora do plano, com data | — | ∅ | Exigida pela RWS r3a (L30, longão comparável, `historyReference`). Não existe canal. **Lacuna G1.** |

**Os quatro cenários no motor atual (probe):**

| Cenário | Classe de corrida | Força | Capacidade V1RC | Estimativas | Faixas na semana 0 |
|---|---|---|---|---|---|
| **A** iniciante absoluto | WALK_JOG | NONE (carga por esforço) | EFFORT_ONLY | nenhuma | só esforço |
| **B** experiência declarada, sem importação | EASY_CURRENT | — | B1 (só recorde sem data): NONE · B2 (10K oficial de 30 d, tolerada): CALIBRATED · B3 (mesma prova sem medição/tolerância): NONE, REJECTED | B2: 5K–meia | B1: nenhuma (P1 exige corridas do plano) · B2: derivadas |
| **C** histórico do Apple Saúde | EASY_CURRENT (minutos importados) | — | NONE | nenhuma | nenhuma (sem P1, sem prova) |
| **D** híbrido com recordes | EASY_CURRENT | KNOWN_LOAD | CALIBRATED (meia de 45 d) | meia etc.; meta posicionada | derivadas |

Nenhum cenário é tratado como iniciante sem motivo. Nenhum ganha capacidade de meta, recorde sem data ou minutos importados.

---

## 2. Contrato mínimo de entrada do atleta

**Princípio:** um fato entra uma vez, com origem, data e confiabilidade. Cada consumidor lê a sua parte. Nada novo é exigido do motor congelado. O único dado novo é lido pela entrada composta e retirado antes do motor (SC-6).

### 2.1 Onboarding (`generateProgram`, intake `R6-INTAKE-1`)

| Bloco | Obrigatório quando | Forma exata | Regra do cliente |
|---|---|---|---|
| Elegibilidade | sempre | `ageYears` (da data de nascimento) + `eligibility{status, assessedAt, pain…clinicalConcern: boolean}` | Desconhecido = ASK, nunca liberação. |
| Experiência | por esporte com objetivo | **`runTrainingMonths` / `strengthTrainingMonths` (inteiro)**; **não** enviar a categoria junto | Faixa respondida → limite inferior da faixa (0, 1, 6, 24). Assim os meses chegam à V1RC (P3) e às extensões. |
| Objetivo | ao menos um esporte | `goals.run`, `goals.strength`, `event{kind, date, timeGoalMinutes?}` | Tempo-meta só em `event.timeGoalMinutes`; nunca em `performanceAnchors`. |
| Agenda | por esporte com objetivo | `runDays`, `strengthDays` (0–6), `runTurn`/`strengthTurn` (AM/PM), `runMinutes`, `longRunMinutes`, `longRunDay`, `strengthMinutes`, `sameTurnConfirmed?` | Igual a UXS ONB-09/21. |
| Prática recente (autorrelato) | corrida com objetivo | `recent{runDaysPerWeek, runMinutesPerWeek, longestRunMinutes, strengthDaysPerWeek}` | Desconhecido = ausente (o motor estabelece de forma conservadora); nunca 0 por omissão. |
| Maior corrida recente com distância **(novo, opcional)** | quando o atleta sabe | `athlete.recentLongestRun{distanceKm, minutes, date, measurement}` | Lido só pela entrada composta (RWS, L30 r3a "intake declaration… with a distance and a run date") e retirado antes do motor. Os mesmos minutos vão em `recent.longestRunMinutes`. Nunca conta como longão comparável (r3a, WE 07). |
| Importação Apple Saúde | se o atleta concedeu leitura | `history[]` (ver §3.2) + `wearableCapabilities{activityAvailable:true, completeness, provider:'HEALTHKIT', historyWeeks}` | `historyWeeks` = semanas realmente cobertas (1–4). `completeness:'FULL'` só se a janela inteira foi lida. Cada linha leva `distanceKm` quando houver; o motor ignora, a entrada composta guarda (G1). |
| Resultados e recordes | opcional | `performanceAnchors[]{id, sport:'RUN', kind, distance\|distanceKm, time\|seconds, date, measurement, completed, tolerated, rpe?}` | Sem data: `kind:'PERSONAL_BEST'` (vira histórico). Data aproximada: o 1º dia do mês informado, nunca uma data posterior à real. `measurement:'OFFICIAL'` para prova com chip. `tolerated` pergunta "terminou e se sentiu normal depois?". Sem essas duas respostas a evidência é rejeitada (B3). |
| Força conhecida | opcional | `knownExercises[]{id (catálogo), sets, reps, rir, load{value, unit, convention}, observedAt, current, familiar, tolerated}` | Só **séries de trabalho atuais** (≤ 28 dias). Nunca 1RM ou recorde (PD-3). |
| Equipamento | força | `equipment[]` | Já lido. |
| Corpo | opcional | `weightKg`, `heightCm`, `sex` | Contexto, sem consumidor de dose. |

### 2.2 Durante o plano (`evaluateProgram`)

| Fato | Forma | Regra |
|---|---|---|
| Sessão do plano feita (app ou Apple Saúde) | observação com `sessionId`, `source{provider, activityId}`, `actual{completed, minutes, distanceKm?, measurement, gpsQuality?, rpe?}` + campos RWS (`formatHash`, `steps`, `declared`) | Uma sessão recebe, no máximo, um treino importado. O treino vinculado nunca é reenviado solto. |
| Corrida importada sem sessão | observação **sem** `sessionId`, com `canonicalActivityId` = UUID do HKWorkout e **`actual.sport:'RUN'`** | Fica inerte para o motor. A RWS a lê como histórico (L30 e longão comparável) só com `sport:'RUN'` explícito. |
| Resultado oficial ou teste | `runEvidence` (V1RC, já existe) ou sessão `RACE` do plano | Sem mudança. |
| Correção | `correctionOf` (motor), `supersedes` (V1RC), `declared{distanceKm, reason}` (RWS) | Sem mudança. Correção nunca infla o histórico (r3a). |
| Registros carregados | `actualLedger`, `referenceState`, `runEvidenceRecord`, `runFormatRecord` (RWS), **`runHistoryRecord` (novo, G1)** | O cliente guarda e devolve cada um, como hoje. |

---

## 3. Origem, confiabilidade e uso de cada dado

### 3.1 Hierarquia por consumidor

"Medido" = OFFICIAL, TRACK, GPS (inclusive a distância de aparelho importada do Apple Saúde) ou TREADMILL.

| Uso | Aceita | Nunca aceita |
|---|---|---|
| **Classe de corrida e dose inicial** (motor) | autorrelato em minutos; importação (o menor dos dois quando FULL); prova ≤ 28 d (só teto do longão) | meta, recorde sem data, distância, peso, altura, sexo |
| **Capacidade, faixas e estimativas** (V1RC) | prova, teste ou contrarrelógio datado, medido e tolerado; corridas leves do plano com RPE ≤ 4 (P1); sessões de qualidade do plano (P2, Q8) | meta, recorde sem data (só histórico), declaração sem aparelho, correção, GPS POOR, esteira (Q8) |
| **Adesão** (RWS → RFC) | conclusão lida pelo motor (SC-1): MEASURED, CONFIRMED_CORRECTION ou DECLARED (decisão do Founder) | `actual.completed` cru; UNKNOWN (V5, decisão do SSCTR na revisão B); corrida fora do plano |
| **L30 e longão comparável** (RWS r3a) | `historyReference` de corridas executadas ≤ 30 d / ≤ 28 d de qualquer fonte: motor, importação, manual; declaração do intake só no L30 | minutos convertidos em km; totais semanais; declaração sem data; medição POOR sem declaração |
| **Previsão** (RFC) | referência V1RC atual, aderência real, nível por experiência (G; desconhecida → EXPERIENCED, ver §6) | meta, declaração, qualquer corrida fora do plano como ganho |
| **Melhora, recorde, ritmo** | só evidência medida (SC-3) | DECLARED, correção, POOR |

### 3.2 Apple Saúde → fato canônico (adaptador iOS, nunca lógica no Core)

| HealthKit | Campo canônico | Nota |
|---|---|---|
| `HKWorkout.uuid` | `canonicalActivityId` e `source.activityId` | Identidade da corrida em todas as fontes. |
| tipo `running` | `sport:'RUN'` | Força (`traditionalStrengthTraining`) só conta exposição. Nunca vira `knownExercises` (DR-120: sem séries e cargas). |
| início + fuso | `startedAt` (ISO com offset) / `occurrenceDate` | Fuso do sistema. |
| duração ativa | `durationMinutes` / `actual.minutes` | Pausas excluídas. |
| `totalDistance` | `distanceKm` | Medido. Qualidade `UNKNOWN` (r3a: utilizável). |
| `HKMetadataKeyIndoorWorkout = true` | `measurement:'TREADMILL'` | Fora do ritmo comparável. |
| ao ar livre com distância | `measurement:'GPS'` | — |
| sem distância | só minutos | Não entra em L30. |
| FC máxima | **não mapear** `sensor:'CHEST_STRAP'` sem prova do aparelho | Sem sensor conhecido, a V1RC não forma zonas (correto). |
| esforço do Apple (`workoutEffortScore`) | **não mapear para `rpe`** até PD-1 | — |
| origem = o próprio app (se o write-back for adotado) | **ignorar na importação** | Já é a linha do app; evita o laço. |

**Duplicidade (WEA-08), regras de vínculo do adaptador:**
1. Treino importado no dia de uma sessão de corrida do plano ainda sem treino → vincular (`sessionId`). O motor funde com o registro do app (E1).
2. Dois candidatos, ou um treino que poderia ser de duas sessões → perguntar ao atleta (FLOW-08). Nunca vincular por proximidade.
3. Sem candidato → enviar solto, com `sport`.
4. Nunca enviar o mesmo UUID vinculado e solto (E3).
5. O histórico do onboarding e a revisão podem trazer o mesmo UUID. A RWS deduplica pelo UUID (G1).

---

## 4. Lacunas que bloqueiam funcionalidades V1

| # | Lacuna | Bloqueia | Dono | Resolução mínima |
|---|---|---|---|---|
| **G1** | Distância datada de corridas fora do plano não é guardada por ninguém | RWS: L30 (CT-3) e longão comparável a partir do Apple Saúde e da declaração do intake. Hoje dá `DISTANCE_HISTORY_UNKNOWN` → TIME (seguro, mas a funcionalidade não aparece para C e D) | **Fable (fase A)** | `runHistoryRecord` (§6) |
| **G2** | Corrida solta no ledger não tem esporte | Leitura do L30 durante o plano | Adaptador + Fable | `actual.sport:'RUN'` obrigatório no contrato. O leitor RWS aceita só esporte explícito. Teste T3 de preservação. |
| **G3** | Formulário típico de recorde (sem data, medição ou tolerância) produz evidência rejeitada ou histórica | Capacidade, faixas, estimativas e previsão para B e D | Product (copy) + cliente | Coletar `date`, `measurement`, `tolerated`, `rpe` (§2.1). Sem isso o comportamento atual é o correto. |
| **G4** | `historyWeeks` ausente subestima minutos de importação curta (divide por 4) | Classe de C: pode cair para EASY_LOW ou abaixo, e o longão inicial fica menor | Cliente | Enviar semanas cobertas (C2). |
| **G5** | Categoria de experiência + meses → meses perdidos | P3 do 5K e consistência com RWS/RFC | Cliente | Enviar só meses (D2). |
| **G6** | Corridas registradas só pelo Apple Saúde não têm RPE | P1 → contínuos nativos por distância e faixa leve observada | Product (pergunta de esforço pós-corrida também para importadas, RUN-08) | PD-1 |
| **G7** | Custódia guarda só campos do motor | Persistir `runHistoryRecord` (como `runEvidenceRecord`/`runFormatRecord`) | Integração (Data + Security) | Mesmo tratamento dos outros registros da extensão. |
| G8 | Laço de write-back | Só se o write-back for adotado (decisão aberta DR-120) | Adaptador | Ignorar treinos de origem própria. |
| G9 | Deriva documental: UXS ONB-20 descreve uso de idade, peso e sexo que o runtime não faz | Nada (o runtime é o lado conservador) | Product | Corrigir o texto na próxima sincronização de produto; não mudar o motor. |

**Não são lacunas (corretos hoje):**
- meta fora da evidência;
- recorde sem data como histórico;
- corpo sem dose;
- mesmo dia e turnos;
- tempo por sessão;
- fusão app + Apple Saúde na mesma sessão;
- quarentena de conflitos;
- distância declarada só para adesão.

---

## 5. Casos sintéticos verificáveis

### 5.1 Hoje, sem implementação: `probe-athlete-data.mjs`, 32/32

| Caso | O que prova |
|---|---|
| A | Iniciante → WALK_JOG, força NONE, só esforço. |
| B1 | Recorde sem data → histórico; meta → `NO_CURRENT_ESTIMATE`; sem faixa na semana 0. |
| B2 | 10K oficial datado e tolerado → CALIBRATED; meta posicionada, nunca ritmo. |
| B3 | Mesma prova sem medição/tolerância → REJECTED. |
| B4 | `sport:'RUN'` necessário para "maior corrida recente". |
| C | Importação → minutos, deduplicação, classe EASY_CURRENT; distâncias descartadas; sem P1 nem capacidade. |
| C2 | `historyWeeks`. |
| D | Híbrido: KNOWN_LOAD, turnos sem pergunta, meia calibrando, PB histórico, corpo sem dose. |
| D2 | Categoria apaga meses. |
| U | Experiência desconhecida gravada como NOVICE (só `experienceDeclared`/`experienceBasis` distinguem). |
| E1–E3 | Fusão na sessão, solta inerte, conflito vinculado + solto. |

### 5.2 Depois da implementação: oráculo do Fable (`test/v1rws-history-*.test.mjs`)

| # | Entrada | Esperado |
|---|---|---|
| H1 | Cenário C com distâncias em `history` | `runHistoryRecord` com 12 fatos (a duplicata conta uma vez); L30 = 13 km; motor byte a byte igual ao cenário C sem distâncias (exceto `inputHash`, se as linhas mudarem). |
| H2 | H1 + o mesmo UUID reenviado solto na revisão da semana 1 | L30 inalterado (uma corrida, uma vez). |
| H3 | B + `recentLongestRun{15 km, 85 min, data −12 d}` | L30 = 15 (DECLARED). Longão comparável **não** existe → primeiro LONG por TIME (r3a WE 07). A chave não chega ao motor (V9: decisão igual à de B sem ela). |
| H4 | Corrida solta sem `actual.sport` | Fora do L30. |
| H5 | Corrida importada `TREADMILL` 10 km | Conta no L30 (é medida). Fora de P1 e Q8 (V1RC). |
| H6 | Medição POOR sem declaração | Sem `historyReference` (r3a). |
| H7 | Cenários A–D por `v1-run-forecast-index` (fase B) | A: previsão UNAVAILABLE com orientação V1RC. B1 e C: UNAVAILABLE (sem referência); meta nunca move a faixa. B2 e D: `OBSERVED_FORECAST` só depois de 2 semanas contadas; antes `NOT_ENOUGH_HISTORY` + `PLAN_SCENARIO`. |
| H8 | D com sessão DECLARED de 16 km | Crédito de adesão 1. Nenhuma mudança de faixa, estimativa, recorde ou Insights (SC-3). |
| H9 | B2 sem `runTrainingMonths` nem categoria (experiência desconhecida; o intake grava NOVICE) | A RFC usa G de EXPERIENCED (0,03), nunca 0,08. Com `runTrainingMonths: 0` (NONE): sem previsão. |

Os casos H usam só valores já decididos (r3a, RFC r2). Divergência de um exemplo SSCTR é achado, nunca ajuste (S7 do preflight).

---

## 6. Plano mínimo de implementação e integração (Fable)

**Entra na fase A existente**, depois do V2 (`runFormatRecord`) e antes do freeze `V1RWS-1`. Não é fase nova.

Se `V1RWS-1` já estiver congelado quando isto for lido, entra na fase B como **arquivo adicionado**, declarado no `v1rfc-freeze`. Nenhuma emenda de arquivo congelado. Nenhum arquivo de `src/` existente além do que o preflight já autoriza.

1. **`src/v1-run-history.mjs` (puro).**
   - `factsFromIntake(input)`: lê as linhas `RUN` brutas de `history`/`athlete.history` com `distanceKm` e `athlete.recentLongestRun`, e gera fatos `RUN_FACT{id, activityId, date, minutes, measured{distanceKm, source, quality}, declared?, origin: IMPORT|INTAKE_DECLARED}`.
   - `factsFromLedger(ledger)`: linhas vinculadas de corrida e linhas `UNPLANNED` com `actual.sport==='RUN'`.
   - `historyReference` (r3a), `L30(asOf)` e `comparableLongRun(asOf, M)`.
   - Deduplicação: `canonicalActivityId` → `source.activityId` → ids fundidos da linha do motor (`mergedSourceIds`). A linha do motor vence quando a mesma corrida aparece nos dois.
2. **Registro `runHistoryRecord`.**
   - Append-only, criado no `generateProgram` composto a partir do input bruto (o programa não guarda as linhas brutas) e devolvido ao cliente.
   - Nas revisões: carregado, e os fatos do ledger recalculados (não copiados).
   - Mesmo padrão de `runEvidenceRecord`: linha ilegível nomeada, nada reescrito.
3. **SC-6.**
   - A entrada composta retira `athlete.recentLongestRun` do intake e `runHistoryRecord` da revisão antes do motor.
   - `history` continua indo ao motor como hoje (ele lê os minutos).
   - I1 continua: sem a chave nova, igual chave a chave.
4. **Seletor RWS.** E6/CT-3 e a elegibilidade do LONG passam a ler `L30`/`comparableLongRun` deste módulo, no lugar de "desconhecido".
5. **Testes** H1–H8 e o T3 estendido: `actual.sport` sobrevive a `normalizeObservations` e à custódia.
6. **Fase B (RFC).** Nenhuma entrada nova. Confirmar H7–H9 sobre o ponto de entrada composto.
   - **Nível G (achado deste diagnóstico):** `values.forecast` manda `unknownExperienceUses: EXPERIENCED` (G 0,03) e `noForecastExperience: [NONE]`.
   - Mas o intake grava experiência desconhecida como `runExperience: NOVICE` (`r6-intake.mjs:267`), o G mais alto (0,08).
   - A RFC deve tratar como conhecida só quando `canonical.athlete.experienceDeclared.run === true` ou existe `experienceBasis.run`. Caso contrário usa EXPERIENCED.
   - Ler `runExperience` cru superestimaria a melhora de quem não informou experiência.

**Fora do Fable (integração, depois):**
- adaptador iOS (§3.2);
- persistência de `runHistoryRecord` (G7, Data + Security; o registro contém datas e distâncias de atividades: mesma classe de dado de `runEvidenceRecord`);
- copy das perguntas de recorde e de esforço pós-importação (G3, G6);
- G9.

**Parada:** se `factsFromLedger` exigir mudar um arquivo congelado para obter o esporte de uma linha solta, parar e reportar. A resolução é o contrato `actual.sport`, não uma emenda.

---

## 7. Decisões esportivas realmente pendentes (SSCTR)

Nenhuma bloqueia a implementação. Cada uma tem um padrão conservador até ser decidida.

| # | Pergunta | Padrão até decidir | Efeito se aprovada |
|---|---|---|---|
| **PD-1** | O "Esforço" que o atleta registra no Apple Fitness (`workoutEffortScore`, 1–10, avaliado pelo atleta; nunca o estimado) pode valer como o RPE 0–10 da sessão para P1 e Q8? | Não. Perguntar o esforço no app. | Atletas que só registram pelo Apple Saúde passam a ter P1, faixa leve observada e contínuos nativos. |
| **PD-2** | Corridas fora do plano (extras importadas) devem afetar carga, prontidão ou o plano? | Inertes para o motor (como hoje), mostradas, com oferta de vínculo a uma sessão. Contam só como histórico RWS. | Mudaria a dose. Exige SSCTR e emenda de motor, fora da V1 atual. |
| **PD-3** | Um 1RM ou recorde recente de força pode semear a carga de trabalho inicial? | Não. Só séries de trabalho atuais; estabelecimento por esforço. | Primeira semana de força mais precisa para D. |

**Já decidido, não reabrir:**
- declaração sem aparelho conta só para adesão (Founder);
- meta nunca é evidência (V1RC/RFC);
- prova ≤ 28 d como longão inicial (V1CP Q04);
- recorde sem data como histórico (V1RC);
- L30 e suas fontes (r3a);
- UNKNOWN na previsão (V5, decidido pelo SSCTR na revisão B).
