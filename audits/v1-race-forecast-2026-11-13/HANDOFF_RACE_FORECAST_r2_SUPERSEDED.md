> **SUBSTITUÍDO** pela r3 (`HANDOFF_RACE_FORECAST.md`, 2026-11-13). Mantido só como histórico; não usar para implementação.

# Handoff — V1 Race Forecast + Pace Insights (RFC, r2, 2026-11-13)

**Estado:** especificação para implementação. Nenhum código, freeze, Figma, fila ou arquivo de missão alterado. Dados sintéticos apenas; V1_COACHING_AUTHORITY_READY = NO, INTEGRATION_READY = NO, F08_OPEN.
**Onde:** branch `claude/v1-race-forecast`, worktree `.claude/worktrees/v1-race-forecast`, a partir de `c8104c1` (COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1; conferido: 30/30 arquivos, V1 198/198). Independente do worktree `v1-run-workout-structure` (RWS).
**Autoridade dos números:** `ssctr/SSCTR_RFC_DECISION.json` (SSCTR-RFC-DECISION-r1, sha256 `1d032c40…6e72`), objeto `values`, e seus `workedExamples`. Esta r2 já incorpora a decisão; havendo divergência de texto, vale a decisão.

---

## 1. Diagnóstico: o que já existe e se aproveita

| Capacidade V1RC (congelada) | Uso aqui |
|---|---|
| Capacidade atual a partir de prova/teste/tentativa, com recência (56/112 dias), conflito (28 dias, 3 %, vale o mais lento), níveis de confiança e margem 2,5/4/6 % | **Ponto de partida** da previsão. Nada é recalculado |
| Estimativas atuais 5K/10K/meia/maratona por lei de potência em faixa (k 1,04–1,12; maratona 1,08–1,20 só a partir de meia ou mais), portas de resistência (40/60/75 min), população 27–75 min | **Conversão entre distâncias**: a previsão parte da estimativa atual do evento, que já contém a faixa de k e a margem |
| `projection.comparisons`: histórico das trocas de referência (data, evidência, equivalente de 10 km, confiança) | **Série da resposta individual** (pares de referências) |
| Leitura por semana: a semana lê só o que estava registrado antes do seu primeiro dia (`inForce`: data e `firstRecordedAt` < corte) | **Anti-vazamento** pronto; a previsão herda o corte |
| Fator de treino Q8 (sessões de limiar/meia/maratona, blocos ≥ 5 min, ±1,5 %, teto +4,5 %/−6 %; o de subida nunca muda estimativa) | **Pace Insights** explica e não duplica |
| `comparableRun`, `hardExecution`, `easyObservation` (condições, medição, GPS, RPE, blocos) | **Comparabilidade** das sessões do Insights |
| P3 teste de campo (3/5 km, elegibilidade, 42 dias) | **Única rota** de recalibração sugerida pelo Insights |
| Retirada: hold, pausa ≥ 14 dias, modos walk/jog/restart/return, triagem de sinais | **Retirada** da previsão e do Insights |
| Meta comparada com a faixa, `isPrediction:false` | Mantido; a meta nunca é evidência |

**O que falta:** a V1RC devolve `projection: UNAVAILABLE / NO_VALIDATED_PROJECTION_MODEL` por decisão explícita do SSCTR (Q7: "no individually validated improvement model"), e o catálogo R7-B0 proíbe "claim … finish time or fitness gain". A previsão futura exige, portanto, uma **decisão esportiva nova** (pedida: `SSCTR_DECISION_REQUEST_RFC.md`) e a **leitura formal Founder/PCG** dessa regra antes de qualquer exibição ao atleta (seção 11, D1).

Campos do motor lidos (verificados no código em `c8104c1`): `program.goal.run.event {kind, date, timeGoalMinutes}`, `program.weeks[].sessions[] {id, sport, family, phase, prescription.durationMinutes, status}`, `program.stateTrace[w].run.mode`, experiência `NONE|NOVICE|INTERMEDIATE|EXPERIENCED` (`r6-intake.mjs:132`), fases `GENERAL|BUILD|SPECIFIC|TAPER|RACE_WEEK|POST_EVENT`, linhas do ledger `{eventId, sessionId, localDate, actual{completed, minutes|seconds, distanceKm, measurement, gpsQuality, rpe, conditions, work}, context{sport, family, mode, weekIndex}, response, provenance.firstRecordedAt}`.

## 2. Modelo recomendado

**Ideia:** previsão = estimativa atual (V1RC) × ganho ainda não observado, com o ganho limitado por um teto saturante por experiência, ponderado pela aderência executada e escalado por uma resposta individual que só se move com evidência qualificada. Escala log-tempo; determinístico; O(semanas + referências).

```
Entradas: E = evento do plano; est = runCalibration.estimates[E] (AVAILABLE); refDate = data da referência de est
          x = experiência; semanas do plano com fase, modo e aderência; pares de referências da V1RC

1. Aderência da semana passada w:
   a_w = Σ_sessões RUN (completed ? planned : min(actual, planned)) / Σ planned          (relato ausente = 0)
   f(a) = 0 se a < a_min ; (a − a_min)/(a_full − a_min) se a_min ≤ a < a_full ; 1 se a ≥ a_full
2. Aderência futura: ā = média de a_w das últimas ≤ 4 semanas concluídas; sem nenhuma: ā = 1 e flag ASSUMES_PLAN_FOLLOWED
3. Semanas efetivas até t:
   H_eff(t) = Σ f(a_w) sobre semanas do plano cujo último dia ≤ t, só nas fases ESTABLISHMENT, BUILD, CONSOLIDATION,
              DEVELOPMENT, SPECIFIC; peso 0 para TAPER, RACE_WEEK, POST_EVENT, NEXT_BLOCK, hold, WALK_JOG/RESTART/RETURN
              e semanas antes do plano (treino desconhecido não rende ganho); semanas futuras rendem f(ā) cada
4. Teto cumulativo: Γ(t) = G_x · (1 − exp(−H_eff(t)/τ))
5. Ganho futuro: g = Γ(início da semana da prova) − Γ(refDate)                         (≥ 0)
   g = 0 na maratona (trainingGain false), após desaceleração (abaixo) ou com fator Q8 de descida em vigor em qualquer domínio
6. Resposta R ∈ [0,1]: prior R_c0 = 0,5, s0 = 0,3. UM par: A = a referência elegível mais antiga datada a partir de
   (início do plano − 28 dias); B = a referência padrão atual da V1RC. Mesmo tipo (prova com prova; teste/tentativa com
   teste/tentativa); nenhuma presumida, limite inferior, esforço desconhecido, fora da população ou acima da meia; sem
   pausa declarada ≥ 7 dias entre A e B; B − A ≥ 28 dias; ΔΓ = Γ(t_B) − Γ(t_A) ≥ 0,005:
      R_obs = ln(T10_A/T10_B)/ΔΓ ;  var = (σ_A² + σ_B²)/ΔΓ² ;  σ = margem V1RC da referência (nível + lento) / 1,2816
      R_c = (R_c0/s0² + R_obs/var)/(1/s0² + 1/var), cortado em [0,1] ;  s = (1/s0² + 1/var)^(−1/2)
   R_hi = min(1, R_c + 1,2816·s) ;  borda lenta usa SEMPRE R = 0
   Desaceleração: B ≥ 3 % mais lenta que a referência elegível anterior do mesmo tipo → g = 0, flag NO_GAIN_LATEST_RESULT_SLOWER
7. Faixa (sobre os valores NÃO arredondados da estimativa V1RC):
   central = est.central · exp(−R_c·g) ;  rápido = est.lower · exp(−R_hi·g) ;  lento = est.upper   (sem melhora)
   arredondar para fora como a V1RC (15 s em 5K/10K, 60 s em meia/maratona; central ao mais próximo)
8. Largura = lento/rápido − 1 sobre valores arredondados; exibir se ≤ W_max[E]; senão TOO_UNCERTAIN_TO_SHOW
   (fica só a estimativa atual). Nunca estreitar para caber.
```

**Exemplo (a) da decisão, conferido de forma independente:** 10K oficial 50:00 (HIGH) antes do plano; intermediário; calculado no início da semana 5 de 16; aderência 0,95 → f = 1; H_eff até a semana da prova = 14; Γ = 0,05·(1 − e^−1,4) = 0,03767; R_hi = 0,88448; rápido = 2925·e^−0,03332 = 2829,1 s → **47:00**; central 3000·e^−0,01884 = 2944 s → **49:00**; lento **51:15**; largura 9,0 % ≤ 12 % → exibida, confiança LOW.

**Propriedades que importam:**
- **A borda lenta é sempre a estimativa atual** (nenhuma melhora assumida): a previsão nunca afirma ganho; o lado rápido nunca passa do teto da experiência ponderado pela aderência.
- **Platô e regressão:** referência posterior ≥ 3 % mais lenta, ou fator Q8 de descida em vigor → g = 0 (sem ganho futuro); o nível mais lento já está na estimativa atual da V1RC. Uma referência um pouco mais lenta (< 3 %) dá R_obs ≤ 0 e puxa R_c para baixo (exemplo d: R_c 0,42).
- **Incerteza honesta:** um par de resultados identifica pouco a resposta; o modelo alarga em vez de estreitar. Faixa = envelope plausível, não intervalo de probabilidade calibrado; confiança LOW quando há ganho, no máximo MODERATE sem ganho.
- **Valores vigentes (SSCTR):** G = 0,08/0,05/0,03 (novato/intermediário/experiente; NONE sem previsão; desconhecida = experiente); τ = 10 semanas; fases que rendem: ESTABLISHMENT, BUILD, CONSOLIDATION, DEVELOPMENT, SPECIFIC; a_min 0,5, a_full 0,9; horizonte ≤ 112 dias; nada a partir da RACE_WEEK; W_max 0,12/0,12/0,15/0,18 (Founder pode subir até 0,18/0,18/0,20/0,20 sem nova revisão esportiva); sem efeito de taper (evita dupla contagem: a referência já foi corrida descansada); **maratona sem ganho de treino**.

**Literatura × hipótese × calibração** (detalhe e acesso na decisão SSCTR):

| Elemento | Natureza |
|---|---|
| Lei de potência e faixas de k; portas de maratona | Literatura + decisão V1RC (vigente) |
| Ganhos menores com mais experiência; saturação ao longo de um bloco; heterogeneidade grande de resposta | Literatura (direção); magnitudes = julgamento esportivo do SSCTR |
| Forma exponencial saturante, aderência por minutos, f(a) linear por partes | Hipótese de engenharia |
| Atualização bayesiana de R com σ da margem V1RC | Hipótese de engenharia (estatística padrão) |
| G, τ, R_c0, s0, W_max | **Dependem de calibração empírica**; valores da V1 são provisórios do SSCTR |
| Cobertura real do envelope | Desconhecida até haver resultados reais (seção 9.3) |

## 3. Alternativas comparadas

| Abordagem | Dados que exige | Interpretável | Risco com poucos dados | Veredito V1 |
|---|---|---|---|---|
| B0 Persistência (estimativa atual = previsão) | já existe | sim | subestima quem treina | **Baseline obrigatório** de teste; é o lado lento sem dado individual |
| Lei de potência + extrapolação linear de dois resultados | 2+ resultados | sim | explode com ruído de 2 pontos e horizonte longo | Rejeitado (baseline B2) |
| Regressão temporal regularizada (ridge sobre tempo) | muitos resultados por atleta | médio | 1–3 resultados por bloco: o prior domina; equivale ao recomendado com forma pior | Rejeitado para V1 |
| Impulso-resposta (Banister fitness-fatigue) | carga diária quantificada + várias performances | médio | 4–5 parâmetros mal condicionados, instáveis por indivíduo (Hellard et al. 2006) | Rejeitado para V1; candidato V2 só para forma do taper |
| Modelo populacional (regressão tipo Vickers & Vertosick 2016, matriz de baixo posto tipo Blythe & Király 2016) | base grande de atletas | médio/baixo | não temos base; transferência incerta | V2: **fonte futura dos priors** G/τ |
| Filtro de Kalman nível + tendência completo | séries densas | sim | igual ao recomendado com mais parâmetros | V2: evolução natural (o recomendado é o caso de 1 parâmetro) |
| LLM generativo | — | não | sem garantia numérica | Desnecessário |
| **Recomendado:** estimativa atual V1RC × teto saturante por experiência × aderência × resposta individual bayesiana | o que a V1RC e o ledger já têm | sim | prior conservador explícito; alarga quando não sabe | **V1** |

## 4. Contratos

**Entrada:** nenhuma nova no intake nem no relato. Lê o resultado da V1RC da semana (`runCalibration`, inclusive `estimates`, `capacity`, `projection.comparisons`, `assessment`, `paceBands`, `warningSignScreen`), o `program` e o ledger que o motor já devolve. O Insights lê também, se existir, `actual.steps` da RWS (seção 8).

**Ponto de entrada novo** `CoachingCore/src/v1-run-forecast-index.mjs`: embrulha `v1-run-index.mjs`, devolve todas as chaves inalteradas e acrescenta `runForecast` e `paceInsights` em `generateProgram`, `evaluateProgram`, `restartProgram`. Não importa nada da RWS. Valores em `CoachingCore/v1/RACE_FORECAST_EXTENSION_V1.json` (cópia literal de `values` da decisão SSCTR, fixada por hash). Dois limites, `V1X-RUN-FORECAST` e `V1X-PACE-INSIGHTS`, ligados só por registro SSCTR independente vinculado a esse hash, e ambos exigem `V1X-RUN-ESTIMATE` ligado. Sem registro: `status: DISABLED`, saída da V1RC idêntica byte a byte.

**`runForecast`:**

| Chave | Conteúdo |
|---|---|
| `version`, `modelId` (`V1X-RACE-FORECAST-1`), `valuesSha256`, `asOf`, `week`, `inputDigest` (hash de `runCalibration.hash` + aderências + evento), `hash` | Rastreabilidade; a previsão de qualquer semana é recomputável do registro |
| `status` | `DISABLED`, `NOT_APPLICABLE` (`NO_EVENT`, `RUNNING_NOT_PROGRAMMED`), `UNAVAILABLE` (motivo, seção 5), `TOO_UNCERTAIN_TO_SHOW`, `SHOWN` (nomes e flags exatamente como nos `workedExamples`) |
| `flags` | `ASSUMES_PLAN_FOLLOWED`, `NO_GAIN_LATEST_RESULT_SLOWER`, `NO_GAIN_RECENT_SESSIONS_SLOWER`, `NO_TRAINING_GAIN_APPLIED_MARATHON` |
| `event` | `{kind, date, distanceKm, weeksAhead}` |
| `current` | Cópia da estimativa V1RC do evento (`low/central/high`, referência, confiança) |
| `forecast` | `lowSeconds`, `centralSeconds`, `highSeconds`, `kind: FUTURE_FORECAST`, `display: RANGE_FIRST_CENTRAL_NEVER_ALONE`, `promise: false`, `conditionalOn` (`CONTINUED_TRAINING_AT_OBSERVED_ADHERENCE`, `ASSUMES_PLAN_FOLLOWED`, `BLOCK_LONG_RUNS_COMPLETED` na maratona), `confidence` (`LOW`/`MODERATE`), `statement` |
| `drivers` | `gainCeiling` (G_x, τ, H_eff na referência e na semana da prova, g aplicado), `adherence` (por semana e ā), `response` (`source: PRIOR | INDIVIDUAL`, R_c, sd, R_hi, o par usado com datas e ids), `taper: NOT_MODELLED` |
| `goal` | Nenhuma comparação nova: a meta continua comparada **só com a estimativa atual** (V1RC `goal`), nunca com a previsão (SSCTR F11) |
| `statement` | `values.forecast.requiredText` (`beforeAnyWeek`, `afterWeeks`, `basis`, `marathon`); sempre "A ponta mais lenta assume nenhuma melhora adicional. Não é promessa."; nunca "você vai correr", "no caminho certo" ou um tempo único |
| `change` | Desde a semana anterior: `NEW_REFERENCE`, `RESPONSE_UPDATED`, `ADHERENCE_CHANGED`, `HORIZON_SHORTER`, `WITHDRAWN`, `REINSTATED`, com de/para |
| `history` | Previsões das semanas anteriores (recomputadas, não armazenadas), para "como a previsão evoluiu" |

**`paceInsights`:** seção 7.

## 5. Elegibilidade, horizonte, confiabilidade e retirada

**Disponível só se todas valem:** limites ligados; plano com evento datado e não de conclusão; `estimates[E].status = AVAILABLE` na V1RC (herda todas as portas: população, resistência, maratona no bloco, R-11); experiência ≠ NONE; modo da semana não é WALK_JOG/RESTART/RETURN; sem hold, sem pausa ≥ 14 dias, sem triagem de sinais REQUIRED; prova a ≤ 112 dias; semana em vigor anterior à RACE_WEEK.

**Motivos de indisponibilidade** (lista vinculante: `values.forecast.withdrawal`): `EXTENSION_NOT_ENABLED`, `CURRENT_ESTIMATE_UNAVAILABLE` (com o motivo V1RC), `HOLD_NO_PRESCRIPTION`, `BREAK_14_DAYS_OR_MORE`, `WARNING_SIGN_SCREEN_REQUIRED`, `MODE_WALK_JOG_RESTART_RETURN`, `EXPERIENCE_NONE`, `COMPLETION_EVENT`, `HORIZON_BEYOND_LIMIT`, `RACE_WEEK_REACHED`, `RACE_DATE_PASSED`, `MARATHON_CENTRAL_ABOVE_6H` (R-11, `centralMaxSeconds` 21600).

**Horizonte:** a previsão aparece a partir de 112 dias antes da prova (plano de 20 semanas: só nas últimas 16) e some na RACE_WEEK. Dali em diante vale só a estimativa atual da V1RC, com o texto de dia de prova e a cautela de ritmo dela. Taper, semana de prova e pós-prova não rendem ganho.

**Confiabilidade por distância:** 5K e 10K disponíveis mais cedo e mais estreitos; a partir de referência convertida (5K → 10K) e na maioria dos novatos, a largura passa de 12 % e o estado é `TOO_UNCERTAIN_TO_SHOW` (exemplos c, h: 15,5 % e 15,9 %); meia exige a porta de longão; **maratona sem ganho**: a "previsão" é a estimativa atual da V1RC com o texto próprio (`requiredText.marathon`), confiança no máximo MODERATE. Isso é desejado.

**Frequência:** recalculada a cada revisão, mas lê a V1RC da semana em vigor: muda só na virada da semana. Retirada imediata (hold, triagem, pausa) vale na hora, como na V1RC.

## 6. Atualização incremental

A cada revisão semanal: (1) a V1RC atualiza nível e estimativa pelas regras dela (nova prova/teste, conflito, envelhecimento, fator Q8 de descida); (2) a aderência da semana encerrada entra em H_eff e ā; (3) se a V1RC trocou de referência, o par (A mais antiga elegível, B atual) é recalculado e R recomputado a partir do prior (um par, não atualização sequencial: evita contar duas vezes o mesmo ruído); a regra de desaceleração é reavaliada; (4) a faixa é recomputada. Um resultado isolado entra pela V1RC (conflito em 28 dias com o mais lento prevalecendo protege contra outlier rápido); um par com ΔΓ pequeno não informa R (regra ΔΓ_min). Tudo é função pura do registro: nada é armazenado além do que a V1RC e o motor já guardam; o histórico é recomputado.

## 7. Contrato do Pace Insights

**Unidade:** um domínio de esforço. **Domínios votantes:** `THRESHOLD_CONTROLLED`, `HALF_MARATHON_EFFORT`, `MARATHON_EFFORT`, `TEN_K_EFFORT`, `FIVE_K_EFFORT`. `EASY` só informativo.

**Sessão comparável:** `comparableRun` da V1RC (sem HEAT/HILLY/TRAIL/WIND_STRONG, sem esteira, GPS não ruim), concluída, modo EASY, RPE dentro da faixa da dica, todos os blocos de trabalho ≥ 5 min (regra Q8), faixa do domínio `AVAILABLE` na semana da sessão (lida por `runCalibrationOf(..., weekIndex = semana da sessão)`, que já respeita o corte daquela semana). Depois de uma pausa ≥ 14 dias, hold ou retorno, só sessões posteriores (piso da V1RC).

**Classificação por sessão:** ritmo do trabalho contra a faixa em vigor naquela semana: `FASTER` se < borda rápida × (1 − 0,015); `SLOWER` se > borda lenta × (1 + 0,015); senão `INSIDE`. **Excepcional:** d = ln(ritmo do meio da faixa / ritmo executado); a mais de max(3·MAD, 5 %) da mediana (piso acima do erro de GPS; exemplo PI-1 da decisão) → `EXCEPTIONAL`, mostrado e fora da votação.

**Estado do domínio** (janela de 42 dias; ≥ 3 sessões não excepcionais cobrindo ≥ 14 dias): `IMPROVING` (≥ 2/3 FASTER, incluindo a mais recente), `SLOWER_THAN_BAND` (≥ 2/3 SLOWER), `STABLE` (maioria INSIDE), `MIXED`; abaixo do mínimo, `INSUFFICIENT_DATA`. Calor, percurso e interrupções entram como exclusão (flags) e o ruído não sinalizado é absorvido por mediana e maioria; uma sessão excepcional nunca muda o estado.

**Ação (sempre sugestão; nenhuma muda plano, faixa ou estimativa):**

| Situação | Ação |
|---|---|
| IMPROVING em domínio Q8 com fator abaixo do teto | `BAND_ADJUSTS_BY_EXISTING_RULE`: explica o ajuste semanal Q8 que já existe |
| IMPROVING em 5K/10K ou com fator Q8 no teto | `SUGGEST_FIELD_TEST` se `assessment.status = OFFERED`; senão `SUGGEST_RACE_RESULT` com os motivos de não oferta da V1RC |
| SLOWER_THAN_BAND | `EFFORT_GOVERNS_SLOW_TO_CUE`: "desacelere até a dica"; sessões mais duras que a dica são relatadas como fato, citando só os fatores V1RC (calor, subida, vento, fadiga); a descida Q8 existente responde; nenhuma inferência clínica, nenhum deload próprio |
| EXCEPTIONAL isolado | `NOTED_NOT_A_TREND` |
| EASY mais rápido a RPE ≤ 4; repetições curtas (< 5 min) | `INFORMATIVE_ONLY`; nunca sugestão (nada mais duro derivado de leve) |

**Confirmação:** aceitar `SUGGEST_FIELD_TEST` é escolher o teste P3 existente (declarado na mesma revisão que relata a sessão substituída, como manda a V1RC); só um resultado qualificado muda a capacidade, e a previsão o absorve na semana seguinte. Recusar não tem penalidade. **Anti-insistência:** cada insight tem `id = hash(domínio, estado, sessões)`; o cliente guarda dispensas por id; o mesmo id não reaparece, e um novo só surge com sessão nova.

**Estabilidade semanal:** calculado na virada da semana com o mesmo corte da V1RC; vale a semana toda.

**Apresentação:** estado, sessões usadas (data, ritmo, faixa da época, RPE), excluídas e por quê, e a ação. Sem número de "melhora %" isolado como promessa.

**Saída:** `paceInsights = {version, valuesSha256, week, status: DISABLED|WITHHELD|AVAILABLE, domains: {[d]: {state, sessions[], excluded[], action, id}}, hash}`. Retido nas mesmas condições da previsão.

## 8. Interface esperada com sessões por distância (RWS) — dependência marcada

A RWS (outra sessão, não finalizada) entrega `actual.formatHash` e `actual.steps[{block, rep, kind, targetMet, seconds?, metres?}]`. **Esta extensão não importa a RWS** e funciona sem ela:

- **Com `actual.steps`** (medição TRACK, ou GPS não ruim): ritmo do trabalho = Σ segundos / Σ metros das etapas `WORK` com `targetMet !== false` e ambos medidos; a sessão vota só se cada `WORK` durou ≥ 5 min; repetições curtas (400/800 m) ficam `INFORMATIVE_ONLY`.
- **Sem `actual.steps`:** `actual.work {distanceKm, seconds}` ou `paceSecondsPerKm`, como a V1RC já lê.
- **Aderência** usa os minutos de planejamento (`prescription.durationMinutes`, que a RWS mantém como dose canônica) e `actual.completed`: um contínuo "D km ou M min" concluído conta a dose inteira; distância não entra em nenhuma soma.
- **Dependência RWS-T3:** se o motor ou a custódia descartarem `actual.steps`, vale o caminho sem steps; nada a fazer aqui. Na integração, os dois embrulhos acrescentam chaves disjuntas e podem ser compostos em qualquer ordem.

## 9. Testes e critérios de aprovação

**9.1 Determinísticos e de regressão (obrigatórios para o freeze):**
- T1 Todos os `workedExamples` da decisão SSCTR (10 de previsão, horizonte, semana de prova, Pace Insights PI-1) reproduzidos ao segundo, com `status` e `flags` exatos (condição C8).
- T1b Conjunto de fases: toda fase que o motor produz está em `countedPhases` ∪ `zeroCreditPhases`; uma fase nova falha o teste (nunca rende ganho por omissão).
- T2 Mesmas entradas → mesmo `hash`; ordem do ledger irrelevante.
- T3 Não regressão: todas as chaves de `v1-run-index.mjs` idênticas pelo ponto novo (fuzz semeado + as 25 jornadas V1RC); `v1rc-freeze.mjs --check 1` continua 30/30 e V1 198/198.
- T4 Sem registro habilitador: `DISABLED`, nada mais muda.
- T5 Anti-vazamento (metamórfico, 500 casos semeados): acrescentar ou editar linhas com data **ou** `firstRecordedAt` ≥ corte da semana não muda `runForecast` nem `paceInsights` daquela semana.
- T6 Monotonicidade: mais aderência → central não mais lento; horizonte maior → faixa não mais estreita; R_hi ≤ 1 → borda rápida ≥ `est.lower·exp(−G_x)`; borda lenta = `est.upper` arredondada **sempre**; R_c ∈ [0,1].
- T7 Retirada: cada motivo da seção 5 em caso próprio; hold, pausa e triagem retiram na hora; o resto só muda na virada da semana; nada exibido a partir da RACE_WEEK.
- T8 Platô/regressão: segunda referência < 3 % mais lenta → R_c cai (exemplo d); ≥ 3 % → g = 0 com flag (d2); fator Q8 de descida em vigor → g = 0 com flag; maratona → g = 0 com flag.
- T8b Neutralidade: a previsão não altera nenhuma chave da V1RC (faixas, testes, estimativas, meta) nem do motor (C1, C2).
- T9 Robustez: um resultado 6 % mais rápido isolado em 28 dias → a V1RC não o adota (conflito) e a previsão não se move além do que a estimativa atual moveu; uma sessão excepcional não muda o estado do Insights.
- T10 Insights: cada linha da tabela de ações; janelas, mínimo de 3, 14 dias, 2/3; dispensa por id.
- T11 Texto: toda saída passa por `FORBIDDEN_CLAIM`; nenhuma contém promessa.

**9.2 Simulação sintética (sanidade, não validade preditiva):** gerador semeado com verdade conhecida: nível inicial na população V1RC, resposta verdadeira R* ∈ {0; 0,25; 0,5; 1} e um braço fora do modelo (ganho acima do teto; regressão), aderência {0,95; 0,7; 0,4; pausa}, ruído por medição (oficial < pista < GPS < manual) e ruído de dia de prova. ≥ 2000 atletas por braço. Métricas na data da prova: erro absoluto e percentual do central, cobertura do envelope, largura média, contra B0 (persistência) e B2 (extrapolação linear). **Aprovação:** cobertura agregada ≥ 80 % e ≥ 60 % em cada braço, inclusive os fora do modelo; MAPE ≤ B0 nos braços R* ≥ 0,5 e ≤ B0 + 1 p.p. no braço R* = 0; borda rápida mais rápida que a verdade em ≤ 10 % dos casos do braço R* = 0. Relatório em `evidence/`, com sementes.

**9.3 Backtesting real (quando houver dados; hoje não há atletas reais autorizados):** origem móvel com replays "as-of" (o próprio corte semanal), pré-registro de métricas por distância, cobertura nominal do envelope, MAPE e viés por experiência. Proposta: manter a exibição limitada por W_max e o rótulo provisório até ≥ 100 resultados reais por distância; recalibrar G/τ/W_max por decisão SSCTR nova. Não executável nesta V1.

## 10. Plano mínimo de implementação (Fable 5.2)

Ordem e paradas, no padrão da V1RC:

0. Trabalhar neste worktree/branch. Não tocar `v1-index.mjs`, `v1-run-index.mjs`, `v1-run-calibration.mjs`, valores V1RC nem freezes. Não importar arquivos da RWS.
1. **Checagens de código primeiro (parada material se falharem):** (a) `runCalibrationOf` com `weekIndex` de semana passada devolve a faixa daquela semana sem ler o futuro; (b) `projection.comparisons` traz `tenKEquivalentSeconds` e datas com o limite de estimativa ligado; (c) cada linha do ledger leva `sessionId` que resolve `prescription.durationMinutes`. Se (b) falhar, ler as referências de `runCalibration.evidence` (uso `CAPACITY`) — sem mudar a V1RC. *Leitura do código em `c8104c1` sustenta as três:* (a) `fold` usa corte = início da semana quando ela já começou (`v1-run-calibration.mjs:403`); (b) `shownChange` só remove o equivalente de 10 km com o limite de estimativa desligado (`:597`, `:601`), e as trocas de referência têm `reason` `FIRST_REFERENCE`/`NEW_REFERENCE` com `from`/`to`; (c) `hardExecution` resolve `o.sessionId` no mapa de sessões (`:176`). Os testes confirmam em execução.
2. `v1/RACE_FORECAST_EXTENSION_V1.json` = `values` da decisão, literal; teste que compara arquivo × decisão; hash fixado no módulo.
3. `src/v1-race-forecast.mjs`: funções puras `adherenceOf`, `gainCeiling`, `responseOf`, `forecastOf`, `paceInsightsOf`; autoridade e registros habilitadores no padrão `runCalibrationAuthority` (opções só para dev/testes).
4. `src/v1-run-forecast-index.mjs`: embrulho fino.
5. Testes T1–T11 (`test/v1rf-*.test.mjs`); `scripts/v1rf-simulate.mjs` (9.2) com saída em `audits/v1-race-forecast-2026-11-13/evidence/`.
6. Suíte completa uma vez no fim; depois revisão independente (SSCTR novo + QRE), **um** ciclo corretivo, freeze `v1rf-freeze.mjs` aditivo. Não reabrir a V1RC.

Estimativa: dois arquivos de código pequenos (~300–450 linhas no estilo do projeto), um de valores, ~6 de testes, um script de simulação.

## 11. Dependências e decisões abertas

| ID | Item | Dono | Bloqueia |
|---|---|---|---|
| D1 | Leitura formal da regra "não afirmar tempo de chegada ou ganho de forma" (catálogo R7-B0) diante de uma previsão **futura** condicionada; texto de Product | Founder + PCG; Product | Qualquer exibição ao atleta; **não** bloqueia implementação em dados sintéticos |
| D2 | Decisão esportiva RFC | SSCTR | **Resolvida** (seção 12) |
| D2b | Escolhas de produto dentro dos limites esportivos: (1) mostrar ou não a "previsão" de maratona, que é igual à estimativa atual; (2) W_max dentro da faixa permitida (nos padrões, referências convertidas e a maioria dos novatos ficam TOO_UNCERTAIN); (3) planos > 16 semanas só mostram a previsão nas últimas 16 | Founder | Nada na implementação (os valores padrão valem); afeta o que o atleta vê |
| D2c | Semântica de dados: classe de experiência autodeclarada, `completed`, relato ausente, tipos de referência (prova × teste) | Product/Data | Exibição ao atleta |
| D3 | Calibração empírica de G/τ/W_max e cobertura real | Data + SSCTR | Remoção do rótulo provisório; exige atletas reais autorizados |
| D4 | RWS-T3 (`actual.steps` sobrevive) | Sessão RWS | Nada; há caminho sem steps |
| D5 | Segurança: nenhum dado novo é guardado (histórico recomputado; dispensas no cliente); revisão leve na integração junto com a pendência V1RC (FC/laboratório) | Security | Integração |
| D6 | Condições V1RC herdadas (R-11, RC-01..04, QRE-V1RC-RC-01..07, integração sem opções) | Integração | Integração |
| D7 | Fila humana: HQ-RFC-SSCTR-FORECAST e HQ-RFC-SSCTR-INSIGHTS propostas, não anexadas (fila em 235) | Founder | Nada |
| D8 | Revisão da decisão SSCTR até 2027-05-13, ou antes no primeiro resultado real previsão × prova | Chief/SSCTR | Nada agora |

## 12. Resultado da decisão SSCTR (SSCTR-RFC-DECISION-r1)

**APPROVE_WITH_CONDITIONS**, como cenário limitado e reversível, não como modelo de predição validado. A abstenção da V1RC continua verdadeira (não existe modelo individual validado); a previsão é defensável porque a borda lenta nunca assume melhora, a rápida é um teto fixo ponderado pela aderência, ela some quando larga demais, distante demais, na semana da prova, após desaceleração ou quando a V1RC retém, e nunca alimenta ritmo, teste, meta ou plano.

| Pergunta | Decisão |
|---|---|
| F1 Admissibilidade | Aprovado para 5K/10K/meia (novato, intermediário, experiente); maratona modificada (sem ganho); recusado para NONE e walk/jog/restart/return. Evidência PLAUSIBLE_BUT_UNCERTAIN |
| F2 Tetos e τ | Aprovados como proposto; julgamento esportivo e placeholders (o central fica abaixo das médias de ensaios recreativos, Nuuttila 2022: −2,9 % ± 2,4 % em 12 semanas) |
| F3 Prior | Aprovado; estrutura modificada: borda lenta R = 0, um par do mesmo tipo, corte em [0,1], desaceleração ≥ 3 % zera o ganho |
| F4 Aderência | Aprovada com condições (fases nomeadas, média de a antes de f) |
| F5 Taper | Fora, para não contar duas vezes |
| F6 Horizonte | 16 semanas (não 26); nada a partir da RACE_WEEK; Q8 de descida zera o ganho |
| F7 Largura | Padrões aprovados; faixa permitida ao Founder |
| F8 Retirada | Aprovada com acréscimos |
| F9 Pace Insights | Aprovado com condições; piso de excepcional 5 %; **nenhuma mudança de capacidade sem teste ou prova** |
| F10 FC | Sem FC na V1 |
| F11 Texto | Aceitável com condições (opinião esportiva; a leitura formal é D1) |
| F12 Exemplos | 10 de previsão + horizonte + semana de prova + PI-1 |

**Correções que a decisão fez na proposta do Chief** (todas incorporadas acima): R_lo da proposta dava 0,116 sem dados (contradizia "sem melhora"); "horizonte 0 = estimativa atual" não saía da fórmula (ganhos não observados das semanas passadas ainda seriam somados); a atualização sequencial por pares contava o ruído duas vezes; R_c não era cortado.

**Condições C1–C9** (`conditions` da decisão): aditivo; nunca alimenta prescrição; borda lenta = estimativa atual; leitura Founder/PCG antes de uso pelo atleta; todo valor é provisório até calibração com resultados reais, sem alegação de precisão no texto; texto conforme `requiredText`; nenhuma inferência clínica; SSCTR novo julga a implementação contra os exemplos; só dados sintéticos.

**Literatura:** Europe PMC; texto completo de Vickers 2016, Nuuttila 2022, Wang 2023, Smyth & Lawlor 2021; 13 só por resumo (inclusive Hellard 2006). Buscas negativas registradas: nenhum estudo de ganho de desempenho de corrida em novatos nem dado longitudinal de mundo real. Revisão por IA não é validação empírica.
