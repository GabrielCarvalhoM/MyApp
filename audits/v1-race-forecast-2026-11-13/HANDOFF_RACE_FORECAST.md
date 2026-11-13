# Handoff — V1 Race Forecast + Pace Insights (RFC, r3 canônica, 2026-11-13)

**Estado:** especificação **encerrada** e aprovada pelo Founder (2026-11-13) como candidata à implementação pelo Fable 5.2 **em ambiente sintético**. Nenhum código, freeze, Figma, fila ou arquivo de missão alterado. Uso real **não** autorizado (seção 10).
**Onde:** branch `claude/v1-race-forecast`, worktree `.claude/worktrees/v1-race-forecast`, a partir de `c8104c1` (COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1, conferido 30/30; V1 198/198). Independente do worktree da RWS.
**Autoridade dos números:** `ssctr/SSCTR_RFC_DECISION_R2.json` (SSCTR-RFC-DECISION-r2, sha256 `51bec86b…1fe4`), objeto **`values`** (id `SSCTR-RFC-VALUES-r2`, consolidado: é o único que a implementação copia) e `workedExamples`. A r1 (`SSCTR_RFC_DECISION.json`, `1d032c40…6e72`) fica como histórico, inalterada. A r2 deste handoff está em `HANDOFF_RACE_FORECAST_r2_SUPERSEDED.md`. Em caso de divergência de texto, vale `values`.

---

## 1. Capacidades implementáveis agora

| Capacidade | Estado | Limite |
|---|---|---|
| Faixa de previsão **observada** (aderência real das últimas ≤ 4 semanas) para 5K, 10K e meia | Implementar | Disponível após 2 semanas contadas concluídas; até 112 dias antes da prova; some se larga demais |
| **Cenário do plano** ("se seguir o plano daqui em diante") | Implementar | Passado factual, futuro com aderência 1; nunca é a manchete quando a observada aparece |
| Maratona | Implementar | Só a **estimativa atual** de maratona (sem ganho, sem cenário, sem relação com a meta) |
| Estados úteis: `NOT_YET_IN_WINDOW` (com data), `TOO_UNCERTAIN_TO_SHOW`, `UNAVAILABLE` com orientação | Implementar | A orientação só cita rotas V1RC existentes |
| Semana da prova: última previsão válida congelada | Implementar | Só faixa, datada, depois da estimativa atual e da cautela de ritmo; nunca no dia da prova |
| Meta × faixa (posição) | Implementar | Ao lado da comparação V1RC meta × estimativa atual, que continua primeiro; nunca é evidência |
| Pace Insights (estado por domínio, explicação, sugestões) | Implementar | Nunca muda nada sozinho |
| **Revisão de ritmo confirmada pelo atleta sem prova** | Implementar **atrás de limite próprio, desligado** | Só no limiar (`THRESHOLD_CONTROLLED`), só com o fator Q8 no teto; liga quando a integração cumprir IC-2 (seção 7) |
| Ritmos de 5K, 10K, meia e maratona revisados por treino | **Não** | Restrição esportiva (seção 3); só prova ou teste P3 |

## 2. Modelo

### 2.1 Fórmula (inalterada desde a r2, com a contabilidade temporal corrigida)

```
Γ(·)     = G_x · (1 − exp(−H_eff / τ))          G 0,08 / 0,05 / 0,03 (novato/intermediário/experiente); τ = 10 semanas
H_eff    = Σ f(a_w) nas fases ESTABLISHMENT, BUILD, CONSOLIDATION, DEVELOPMENT, SPECIFIC
           (0 em TAPER, RACE_WEEK, POST_EVENT, NEXT_BLOCK, hold, WALK_JOG/RESTART/RETURN, antes do plano)
f(a)     = 0 se a < 0,5 ; (a − 0,5)/0,4 se 0,5 ≤ a < 0,9 ; 1 se a ≥ 0,9
central  = est.central · exp(−R_c · g)
rápido   = est.lower   · exp(−R_hi · g)          R_hi = min(1, R_c + 1,2816·sd)
lento    = est.upper                              sempre: nenhuma melhora assumida
g = 0    na maratona; após resultado ≥ 3 % mais lento; com fator Q8 de descida em vigor
```

`est` = valores **não arredondados** da estimativa atual V1RC do evento; arredondamento para fora como a V1RC; largura medida nos valores arredondados contra `wMax` (0,12 / 0,12 / 0,15 / 0,18). Resposta R: prior 0,5 ± 0,3, atualizada por **um** par de referências do mesmo tipo (`values.forecast.response`), cortada em [0,1].

### 2.2 Coerência temporal (item 1 do Founder) — sem dupla contagem

Com t_ref = data da referência atual, t_now = início da semana em vigor, t_RW = início da RACE_WEEK:

| Parcela | Fórmula | Natureza | Entra na previsão? |
|---|---|---|---|
| **O** ganho observado | ln(T10_A / T10_B) | Medido; já dentro da estimativa atual (B) | **Não** (só calibra R) |
| **U** progresso não observado | Γ(t_now) − Γ(t_ref) | Semanas executadas após a referência, com aderência **real**; ainda não medido | Sim |
| **F** ganho futuro hipotético | Γ(t_RW) − Γ(t_now) | Semanas por vir, com a aderência de cada faixa (cenário: 1; observada: ā) | Sim |
| g | U + F = Γ(t_RW) − Γ(t_ref) | | |

**Regra de crédito (`values.forecast.weekCredit`, correção A1):** Γ numa **data de referência** credita a semana que a contém (já observada: a V1RC só lê a referência a partir da semana seguinte, então essa semana está completa); Γ num **início de semana** credita só semanas terminadas. O mesmo vale para Γ(t_A), Γ(t_B) do par.

**Demonstração (intermediário, f = 1; conferida pelo Chief e pelo SSCTR):**

| Caso | Γ(t_ref) | U | F | g |
|---|---|---|---|---|
| Referência antiga, antes do plano, calculado na semana 5 (exemplo a) | 0 | 0,01648 | 0,02119 | 0,03767 |
| Atualização recente: referência no fim da semana 6, calculado na semana 7 | 0,02256 | 0 | 0,01511 | 0,01511 |
| Semanas intermediárias: mesma referência, calculado na semana 10 | 0,02256 | 0,00711 | 0,00800 | 0,01511 |
| Referência numa quarta da semana 6 — regra r1 | 0,01967 | 0,00289 | 0,01511 | 0,01800 (**sobrecontagem**) |
| Mesma, regra r3 | 0,02256 | 0 | 0,01511 | 0,01511 |

Conclusões: (i) o treino refletido na referência nunca volta a ser somado (U e F começam depois dela); (ii) com aderência igual à assumida, g não depende de "quando" se calcula (U só troca de lugar com F); (iii) a única falha da r1/r2 era a semana parcial da referência, até 0,0076 (novato), 0,0048 (intermediário) e 0,0029 (experiente) em log-tempo; corrigida para o lado conservador. Nenhum dos 10 exemplos da r1 muda (referências antes do plano ou no domingo); o exemplo novo **A1-1** fixa o caso de meio de semana (meia: 1:46:00–2:01:00, central 1:53:00; pela regra antiga o central seria 1:52:00).

### 2.3 Aderência e leitura estatística (item 2)

- **Duas faixas, dois significados** (`values.forecast.ranges`):
  - `OBSERVED_FORECAST` — previsão individual: aderência futura = média de a nas últimas ≤ 4 semanas contadas, depois f uma vez. Só após **2** semanas contadas concluídas; antes, `UNAVAILABLE: NOT_ENOUGH_HISTORY`.
  - `PLAN_SCENARIO` — cenário condicional: semanas passadas com aderência real (U factual), futuras com a = 1. Não é previsão do comportamento do atleta; é "se seguir o plano daqui em diante".
  - Se f(ā) = 1 ou os dois triplos arredondados coincidem: uma faixa só (`coincidesWithPlanScenario: true`).
  - Com as duas exibidas: a observada primeiro; o cenário como alternativa condicional, nunca manchete.
  - Exemplo A2-3 (intermediário, aderência 0,95/0,95/0,40/0,45): cenário 47:15–51:15; observada 47:30–51:15 (ā 0,6875, f 0,469). Conferido pelo Chief.
- **Sem pretensão probabilística:** toda faixa leva `interval: {kind: PLAUSIBILITY_ENVELOPE, probabilistic: false, calibrated: false}`. z = 1,2816 é constante de espalhamento do prior, nunca exibida nem descrita como cobertura. Proibidos no texto: `values.forecast.forbiddenInCopy` ("probabilidade", "chance", "intervalo de confiança", porcentagem de cobertura, "você vai correr", "no caminho certo", "alcançável", tempo único…). A flag `ASSUMES_PLAN_FOLLOWED` foi aposentada (o tipo `PLAN_SCENARIO` carrega esse sentido).
- Confiança: `LOW` com ganho; sem ganho, o nível da estimativa atual, no máximo `MODERATE`.

## 3. Restrições esportivas justificadas (SSCTR r1 + r2)

| Restrição | Razão |
|---|---|
| Borda lenta = estimativa atual | Não existe modelo individual validado de melhora (abstenção V1RC mantida); a previsão nunca afirma ganho |
| Tetos G e τ provisórios | Julgamento esportivo; o central fica abaixo das médias de ensaios recreativos (Nuuttila 2022: −2,9 % ± 2,4 % em 12 semanas); exige calibração empírica |
| Maratona sem ganho | Onde uma estimativa rápida mais custa; portas V1RC + R-11 (centro ≤ 6:00:00) |
| Sem efeito de taper | A referência já foi corrida descansada: somar taper contaria duas vezes |
| Janela de 112 dias; nada recalculado na semana da prova | Incerteza cresce com o horizonte; dia de prova usa a estimativa atual e sua cautela de ritmo |
| Sem FC | V1RC: zonas só para exibição |
| **Ritmos de 5K/10K/meia/maratona não são revisados por treino** | São ritmos de prova, usados em toques de ritmo de prova e próximos do ritmo de dia de prova; revisá-los por treino convida a largada rápida cara. Repetições acima da velocidade crítica dependem de D′ e de sua recuperação; o erro de GPS tem o tamanho do passo |
| Repetições < 5 min não votam (inclusive 400/800/1000 m) | Mesma razão; regra Q8 da V1RC mantida |
| Revisão de limiar só com Q8 no teto, teste P3 oferecido primeiro | A rota real (teste/prova) continua preferida; a revisão cobre só o teto que o Q8 não alcança |

**Lacuna registrada (E2):** o Founder pediu revisão de ritmos por sessões comparáveis sem prova oficial. A V1 sustenta isso **só para o limiar**. Ritmos de 5K, 10K, meia e maratona mudam apenas por prova ou por teste P3 quando oferecido. A capacidade desejada (revisão em todos os domínios, como no produto de referência) fica para quando houver dados reais de revisão × resultado.

## 4. Experiência de previsão (item 4) — estados de saída

| Estado | Quando | O que o atleta recebe (texto: `values.forecast.requiredText`) |
|---|---|---|
| `SHOWN` (uma ou duas faixas) | Elegível e largura ≤ wMax | Faixa(s) com base ("Com base na sua ‹referência› de ‹data›; resultados individuais variam. Um intervalo plausível, não uma probabilidade.") |
| `NOT_YET_IN_WINDOW` | Prova a mais de 112 dias (planos > 16 semanas) | "A previsão aparece a partir de ‹availableFrom›, 16 semanas antes da prova. Até lá, sua estimativa atual." `availableFrom` = primeiro início de semana do plano ≥ prova − 112 dias (exemplo i: 2027-03-08) |
| `TOO_UNCERTAIN_TO_SHOW` | Largura > wMax (ex.: 10K a partir de 5K, a maioria dos novatos) | Estimativa atual + o motivo + rotas V1RC existentes |
| `UNAVAILABLE` (motivo) | Lista `values.forecast.withdrawal` | Motivo + orientação (`unavailableGuidance`): relatar um resultado de prova na distância, ou o teste P3 **só** se a V1RC o oferece; nunca pedir corrida mais longa, mais treino, inscrição em prova ou teste não oferecido |
| Semana da prova | Do 1º dia da RACE_WEEK até a véspera | Estimativa atual + texto e cautela V1RC; depois, a última previsão observada exibida, congelada: "Previsão de ‹data›, não atualizada na semana da prova: ‹low›–‹high›. Para o ritmo, use sua estimativa atual e a cautela dela." Só faixa, sem central, sem relação com a meta. Não aparece se houve retirada, troca de referência ou de nível, novo Q8 de descida, g = 0, maratona ou prova de conclusão (A4-1, A4-2, A4-3) |
| Maratona | Plano de maratona | Só "Sua estimativa atual de maratona, assumindo que os longões do bloco sejam cumpridos…"; nunca chamada de previsão |

**Meta:** a comparação V1RC meta × estimativa atual vem sempre primeiro. Ao lado de cada faixa exibida: `FASTER_THAN_RANGE` / `INSIDE_RANGE` / `SLOWER_THAN_RANGE` contra low/high arredondados, inclusivos, nunca o central; texto neutro ("Sua meta ‹tempo› é mais rápida que / está dentro / é mais lenta que esta faixa"); sem estilo de sucesso/fracasso; nunca na semana da prova, na maratona ou sem faixa. Exemplo A5: metas 46:30 / 49:00 / 52:00 contra 47:00–51:15 → FASTER / INSIDE / SLOWER.

**Atualização:** só na virada da semana; retirada imediata.

## 5. Pace Insights e revisão confirmada (item 3)

**Insights (`values.paceInsights`, inalterado salvo nota):** por domínio mais duro, sessões comparáveis (V1RC `comparableRun`, concluída, RPE na dica, todo bloco ≥ 5 min) na janela de 42 dias, cada uma classificada contra a faixa **efetiva** da própria semana; excepcional se |d − mediana| > max(3·MAD, 5 %); ≥ 3 sessões em ≥ 14 dias → `IMPROVING` / `SLOWER_THAN_BAND` / `STABLE` / `MIXED`, senão `INSUFFICIENT_DATA`.

| Situação | Ação |
|---|---|
| Domínio Q8 com folga | `EXPLAIN_ONLY` (o ajuste semanal Q8 existente) |
| 5K, 10K, meia, maratona sem folga | `OFFER_V1RC_FIELD_TEST` se P3 oferece agora; senão `SUGGEST_REPORTING_A_RACE` |
| **Limiar com Q8 no teto (+4,5 %)** | Teste P3 primeiro se oferecido; senão `ATHLETE_CONFIRMED_PACE_REVISION` quando `athleteConfirmedRevision.offeredWhen` vale; senão `SUGGEST_REPORTING_A_RACE` |
| SLOWER_THAN_BAND | `EFFORT_GOVERNS_SLOW_TO_CUE`; sessões mais duras que a dica relatadas como fato, só com os fatores V1RC (calor, subida, vento, fadiga); nada clínico, nenhum deload próprio |
| Sessão curta ou leve | `INFORMATIVE_ONLY` |

**Revisão confirmada (`values.paceInsights.athleteConfirmedRevision`):** passo = min(margem mediana das sessões votantes, 2 %), total ≤ 3 % sobre a faixa V1RC em vigor (Q8 incluído), aplicado em velocidade com o arredondamento `paceEdge` e largura mínima de 10 s/km; no máximo um passo a cada 28 dias; vale a partir da virada da semana seguinte à confirmação. Sessões votantes: pista ou GPS de qualidade GOOD, blocos ≥ 5 min e trabalho ≥ 15 min, nenhuma mais dura que a dica, nenhuma resposta adversa em 7 dias. Fora de TAPER, RACE_WEEK, POST_EVENT e dos 14 dias antes da prova. **Termina na hora** com: nova referência V1RC, hold, pausa ≥ 7 dias, modos walk/jog/restart/return, uma única sessão mais dura que a dica, SLOWER_THAN_BAND, descida Q8, revogação pelo atleta; **caduca** em 56 dias salvo domínio STABLE ou IMPROVING. Muda só a faixa de limiar exibida/usada: nunca capacidade, estimativas, previsão, testes, meta, dose, progressão, fase ou elegibilidade. Exemplo PR-1: 300–320 s/km → 295–315 a partir da semana 10; segundo passo absorvido pelo arredondamento; termina em 2027-04-21 com uma sessão a RPE 8.

**Decisão do Chief sobre E1 (registrada aqui):** a revisão de limiar **pode** ser autorizada por registro SSCTR novo, numa camada aditiva, **sem reabrir a V1RC**. A saída `runCalibration` continua byte a byte idêntica e o freeze não é tocado. O teto de +4,5 % do Q8 era um valor esportivo do próprio SSCTR, e um registro SSCTR posterior o supera, só para o limiar e sob confirmação do atleta. O Founder pediu essa capacidade explicitamente. Condições: limite próprio `V1X-PACE-REVISION`, ligado só por registro SSCTR independente vinculado aos valores e **só depois de IC-2** (seção 7); um SSCTR novo julga a implementação. Mantida pelo Founder ao aprovar a r3 (seção 11, F-1).

## 6. Contratos de saída

Ponto de entrada novo `CoachingCore/src/v1-run-forecast-index.mjs` sobre `v1-run-index.mjs` (todas as chaves inalteradas) + `runForecast`, `paceInsights`, `paceRevision`. Valores em `CoachingCore/v1/RACE_FORECAST_EXTENSION_V1.json` = `values` da r2, literal, fixado por hash. Limites: `V1X-RUN-FORECAST`, `V1X-PACE-INSIGHTS`, `V1X-PACE-REVISION`, todos exigindo `V1X-RUN-ESTIMATE`. Sem registro habilitador: `DISABLED` e saída V1RC idêntica.

**`runForecast`:** `version`, `modelId`, `valuesSha256`, `asOf`, `week`, `inputDigest`, `hash`; `status` (`DISABLED`, `NOT_APPLICABLE`, `UNAVAILABLE`+`reason`, `NOT_YET_IN_WINDOW`+`availableFrom`, `WITHHELD_R11_CENTRAL_ABOVE_6H`, `SHOWN`, `TOO_UNCERTAIN_TO_SHOW`); `event`; `current` (estimativa V1RC); `decomposition {O, U, F, g, gZeroReason}`; `observedForecast` e `planScenario`, cada um `{kind, status, lowSeconds, centralSeconds, highSeconds, width, wMax, futureAdherence, f, interval, conditionalOn, goalRelation, statement}`; `display` (`BOTH_RANGES`, `PLAN_SCENARIO_ONLY`, `ONE_RANGE_OBSERVED_FORECAST_COINCIDES_WITH_PLAN_SCENARIO`, `CURRENT_MARATHON_ESTIMATE_ONLY_NEVER_LABELLED_FORECAST`); `raceWeek {status: SHOWN_FROZEN | NOT_SHOWN, frozenForecast, label, notShownReason}`. **Nomes de estado, exibição e flags: exatamente os dos `workedExamples` da r2, que prevalecem sobre esta lista;** `marathon {currentEstimateOnly: true}`; `response {source, R_c, sd, R_hi, pair}`; `adherence {weeks[{week, a, f, credits[]}], mean}`; `confidence`; `guidance`; `flags`; `history` (recomputado).

**`paceInsights`:** `{version, valuesSha256, week, status, domains: {[d]: {state, sessions[], excluded[], action, id}}, hash}`; `id = hash(domínio, estado, sessões)` para dispensa no cliente.

**`paceRevision`:** `{status: DISABLED | INERT | NONE | OFFERED | ACTIVE | ENDED, domain: THRESHOLD_CONTROLLED, offer {stepFraction, sessions[], expiresAtWeekBoundary}, active {fraction, effectiveFrom, endsOn[], lapsesOn}, effectivePaceBands {THRESHOLD_CONTROLLED}}`. A confirmação chega como entrada do relato (`review.paceRevisionResponse {offerId, response: ACCEPT | DECLINE | REVOKE}`), carregada pelo cliente num registro próprio, como o `runEvidenceRecord` da V1RC. **É o único dado novo guardado; vai para a Segurança na integração (D5).**

## 7. Integração com a prescrição por distância (RWS) — item 5, só contrato

A RWS (outra sessão, não final) faz da **distância o critério de conclusão** de uma sessão com alvo de distância; minutos estimados não a substituem. Contrato esperado:

**IC-1 Crédito de aderência por sessão (`values.forecast.adherence.sessionCredit`, primeira regra que se aplica):**
1. Sem relato → 0.
2. `actual.completed === true` (leitura do motor; com a emenda RWS, cumprir a distância) → 1, minutos e etapas ignorados.
3. Não concluída, com `actual.steps` (WORK/STEADY) → Σ w_s·m_s / Σ w_s. w_s = participação de planejamento (segundos-alvo numa etapa por tempo; ponto médio dos segundos estimados numa etapa por distância). m_s: 1 se `targetMet === true`; repetição não cumprida = 0; etapa contínua não cumprida = extensão medida / alvo, na própria unidade.
4. Não concluída, sem etapas, alvo de distância com distância registrada → min(1, distância / alvo).
5. Senão → min(minutos reais, planejados) / planejados (leitura r1).

a_w = Σ planejados · c / Σ planejados. O crédito mede **extensão, nunca intensidade**, e alimenta só a previsão. Com isso, quem termina 16 km em menos minutos que o estimado não aparece como parcial, e quem para em 12 km não ganha crédito cheio por ter corrido muitos minutos (AD-1: a = 0,817 pela regra nova contra 0,984 pela leitura r1).

**IC-2 Uma fonte de faixa:** com a revisão ativa, `effectiveBand(THRESHOLD_CONTROLLED) = paceRevision.effectivePaceBands.THRESHOLD_CONTROLLED`; nos demais casos, a faixa V1RC. O seletor de formatos da RWS deve ler a faixa efetiva. Uma repetição por distância pode ficar mais longa para os mesmos minutos planejados; as checagens E1–E4 da RWS não mudam. **Até a integração cumprir IC-2, `V1X-PACE-REVISION` fica desligado**, para a faixa exibida e a usada no dimensionamento nunca divergirem.

**IC-3 Composição:** os embrulhos acrescentam chaves disjuntas. A RWS consome `paceRevision` pela IC-2; não há outra dependência. A previsão não importa a RWS e funciona sem `actual.steps` (regras 4–5).

**IC-4 `targetMet`** significa extensão cumprida, não intensidade (pendência de Product/Data, E4).

## 8. Testes e critérios de aprovação

**Obrigatórios para o freeze (determinísticos e de regressão):**
- **T1** Todos os `workedExamples` da r2 ao segundo, com `status`, `display` e flags exatos: a–h, d2, e1, e2, i, A1-1, A1-2, A2-1..3, A4-1..3, os nove A5-*, PI-1, PR-1..3, AD-1 e os casos de crédito S1–S6 (inclusive `S3-completedSlow`, `S3-completedFast`, `S3-noSteps`, `S3-minutesOnly`, `S4-timeStep`, `S5-noWorkSteps`, `S6-missing`) — 43 casos.
- **T1b** Toda fase que o motor produz está em `countedPhases` ∪ `zeroCreditPhases`.
- **T2** Determinismo: mesmo `hash`; ordem do ledger irrelevante.
- **T3** Não regressão: chaves de `v1-run-index.mjs` idênticas (fuzz semeado + as 25 jornadas V1RC); `v1rc-freeze.mjs --check 1` 30/30 e V1 198/198.
- **T4** Sem registro habilitador por limite: `DISABLED`/`INERT` e nada mais muda; `V1X-PACE-REVISION` desligado por padrão.
- **T5** Anti-vazamento (metamórfico, 500 casos): linhas com data ou `firstRecordedAt` ≥ corte da semana não mudam a saída daquela semana.
- **T6** Contabilidade temporal: g = U + F; mover t_now sem mudar a aderência não muda g; referência no meio da semana credita a semana (A1-1); O nunca entra em g.
- **T7** Monotonicidade: mais aderência → central não mais lento; borda lenta = `est.upper` arredondada sempre; R_c ∈ [0,1]; cenário nunca mais lento que a observada.
- **T8** Retirada e estados: cada motivo; `NOT_YET_IN_WINDOW` com data; semana da prova com o congelado e cada causa de não exibição; maratona só estimativa.
- **T9** Platô/regressão: < 3 % mais lento reduz R_c; ≥ 3 % e Q8 de descida → g = 0 com flag.
- **T10** Insights: cada ação; excepcional com piso de 5 %; dispensa por id.
- **T11** Revisão: cada condição de `offeredWhen`, cada término, caducidade de 56 dias, teto de 3 %, um passo a cada 28 dias, nenhum efeito fora da faixa de limiar.
- **T12** Crédito de aderência: as cinco regras de IC-1, inclusive "16 km concluídos em menos minutos" = 1 e "parou em 12 km com muitos minutos" < 1.
- **T13** Texto: nada de `forbiddenInCopy`; tudo passa por `FORBIDDEN_CLAIM`; nenhuma faixa exibida com porcentagem.

**Simulação sintética (sanidade, não validade preditiva):** gerador semeado com resposta verdadeira {0; 0,25; 0,5; 1}, braços fora do modelo (acima do teto, regressão), aderência {0,95; 0,7; 0,4; pausa}, ruído por medição e de dia de prova; ≥ 2000 por braço; contra B0 (persistência) e B2 (extrapolação linear). Aprovação: a verdade cai no envelope em ≥ 80 % dos casos agregados e ≥ 60 % em cada braço; MAPE do central ≤ B0 nos braços de resposta ≥ 0,5 e ≤ B0 + 1 p.p. no braço sem resposta; borda rápida mais rápida que a verdade em ≤ 10 % do braço sem resposta. Esses números descrevem o gerador, não atletas; **não** viram alegação no texto.

**Backtesting real:** origem móvel com replays "as-of", pré-registrado, por distância e experiência. Só quando houver resultados reais autorizados. É o gatilho de revisão SSCTR (C5).

## 9. Plano mínimo para o Fable 5.2

0. Trabalhar neste worktree. Não tocar `v1-index.mjs`, `v1-run-index.mjs`, `v1-run-calibration.mjs`, valores V1RC, freezes nem a RWS.
1. **Checagens primeiro (parada material se falharem):** (a) `runCalibrationOf` com `weekIndex` passado devolve a faixa daquela semana sem ler o futuro (`v1-run-calibration.mjs:403`); (b) `projection.comparisons` traz `tenKEquivalentSeconds` e datas com o limite de estimativa ligado (`:597`, `:601`); (c) cada linha do ledger resolve `sessionId` → `prescription.durationMinutes` (`:176`); (d) as fases produzidas pelo motor ⊂ listas de `values`. As três primeiras foram sustentadas pela leitura do código; os testes confirmam.
2. `v1/RACE_FORECAST_EXTENSION_V1.json` = `values` da r2 literal + teste arquivo × decisão.
3. `src/v1-race-forecast.mjs` (funções puras: `sessionCredit`, `adherenceOf`, `gammaAt`, `responseOf`, `rangesOf`, `forecastOf`, `raceWeekOf`, `goalRelationOf`); `src/v1-pace-insights.mjs` (`paceInsightsOf`, `paceRevisionOf`, `effectiveBands`); autoridade e registros habilitadores no padrão `runCalibrationAuthority`.
4. `src/v1-run-forecast-index.mjs` (embrulho fino; registro do cliente para `paceRevisionResponse`).
5. Testes T1–T13 (`test/v1rf-*.test.mjs`), `scripts/v1rf-simulate.mjs` → `audits/v1-race-forecast-2026-11-13/evidence/`.
6. Suíte completa uma vez no fim; revisão independente (SSCTR novo contra os exemplos, condição C8; QRE); **um** ciclo corretivo; freeze aditivo `v1rf-freeze.mjs`.

## 10. Governança: implementar × usar de verdade

**Autorizado agora (por esta r3 e pelas decisões SSCTR r1+r2):** implementar e testar em **dados sintéticos**, com os limites ligados só por registros de desenvolvimento nos testes.

**Exigido antes de qualquer exibição a atleta real** (nada disso bloqueia a implementação):

| ID | Item | Dono |
|---|---|---|
| **D1/E3** | Decisão explícita de produto/governança sobre a regra do catálogo R7-B0 "não afirmar … tempo de chegada ou ganho de forma", cobrindo a previsão observada, o cenário do plano, a previsão congelada da semana da prova e a relação meta × faixa. A opinião esportiva (r1 F11, r2 A5) é "aceitável com condições"; a decisão é do Founder e do PCG | Founder + PCG |
| D2 | Texto final de Product para cada `requiredText` (o sentido não pode mudar) e a semântica de dados: classe de experiência autodeclarada, `completed`, relato ausente, tipos de referência, `targetMet` como extensão (E4) | Product/UX + Data |
| D3 | Segurança: o registro de respostas da revisão (`paceRevisionResponse`) e a pendência V1RC de FC/laboratório | Security |
| D4 | Registros SSCTR habilitadores independentes por limite, sobre os bytes implementados, e o julgamento do SSCTR novo (C8) | SSCTR |
| D5 | IC-2 cumprida na integração antes de ligar `V1X-PACE-REVISION` | Integração |
| D6 | Condições V1RC herdadas (R-11, RC-01..04, QRE-V1RC-RC-01..07, integração sem opções) e V1_COACHING_AUTHORITY_READY = NO | Integração / Founder |
| D7 | Calibração empírica de G, τ, wMax e da revisão (primeiro dado real = gatilho de revisão SSCTR; revisão até 2027-05-13) | Data + SSCTR |

**Pendências que bloqueiam a implementação:** nenhuma. A RWS final (IC-1/IC-2) não bloqueia: há regras sem `actual.steps` e a revisão nasce desligada.

## 11. Decisões de produto do Founder (2026-11-13)

O Founder aprovou esta r3 como **candidata à implementação sintética da V1**, mantendo os limites e as condições do SSCTR, e declarou a especificação encerrada. As decisões abaixo **não autorizam exibição ao atleta** enquanto as pendências de governança, segurança, validação e integração da seção 10 seguirem abertas.

| # | Escolha | Decisão |
|---|---|---|
| F-1 | Decisão E1 do Chief (revisão de limiar confirmada pelo atleta, aditiva) | Mantida (aprovação da r3 com os limites SSCTR); `V1X-PACE-REVISION` desligado até IC-2 |
| F-2 | wMax (permitido até 0,18 / 0,18 / 0,20 / 0,20) | **Manter os atuais:** 0,12 / 0,12 / 0,15 / 0,18 |
| F-3 | Cenário do plano × previsão observada | **Observada como principal quando elegível; cenário do plano secundário** |
| F-4 | Última previsão congelada na semana da prova | **Preservar**, datada, conforme a seção 4 |
| F-5 | Relação meta × faixa | **Permitir**, neutra, conforme a seção 4 |
| F-6 | Maratona | **Nunca apresentar a estimativa atual como previsão futura**; só como estimativa atual |
| F-7 | Lacuna E2 (ritmos de prova só por prova ou teste) | **Aceita provisoriamente** |
| F-8 | Fila humana (HQ-RFC-SSCTR-FORECAST, -FORECAST-R2, -INSIGHTS, -PACE-REVISION) | Não decidido: continuam só propostas (fila em 235) |
| — | Indisponibilidade | Orientação apropriada, sem inventar previsão (`unavailableGuidance`) |
