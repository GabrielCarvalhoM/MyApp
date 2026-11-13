# Run Workout Structure — handoff pré-implementação, revisão r3 (2026-11-13)

**Missão:** Founder, 2026-11-13, "RUN WORKOUT STRUCTURE", corrigida no mesmo dia duas vezes ("CORREÇÃO DO HANDOFF"; "r2 · CORREÇÃO DE DECISÃO DO FOUNDER"). Autor: Chief (Opus 5.5). Implementação: Fable 5.2.
**Base:** `COACHINGCORE-V1-FREEZE-1` (981a8f6) + `COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1` (c8104c1). Branch `claude/v1-run-workout-structure`, de c8104c1. Nenhum código, freeze ou Figma alterado.
**Estado:** ESPECIFICAÇÃO ENCERRADA PELO FOUNDER (2026-11-13). VERSÃO CANÔNICA r3, PRONTA PARA IMPLEMENTAÇÃO. Coerente com as decisões do Founder: prescrição nativa, distância como critério de conclusão e distância cumprida só quando de fato percorrida. Decisões esportivas vigentes, em camadas: `ssctr/SSCTR_RWS_R2_DECISION.json` (catálogo, sha `daf3d7a2…2213`) ← `ssctr/SSCTR_RWS_R3_DECISION.json` (conclusão, exposição, elegibilidade, sha `6b96d769…08e2`) ← `ssctr/SSCTR_RWS_R3A_AMENDMENT.json` (evidência da distância e histórico L30, sha `37047d21…d412`). A r1 e a N4 da r2 são histórico. Pendências objetivas de implementação: seção 13.

**O que mudou na r3 (decisão do Founder):** quando a prescrição tem alvo nativo de distância, **a distância é o critério de conclusão**: o longão de 16 km termina aos 16 km, a corrida leve de 9 km aos 9 km, cada repetição de 6 × 800 m nos seus 800 m e a recuperação por distância na sua distância. Não há teto de tempo como condição alternativa de conclusão; a duração é só estimativa. A regra SSCTR N4 ("D km ou M min, o que vier antes") fica como histórico, rejeitada para o produto. A leitura de conclusão por 90% da duração não pode invalidar um treino por distância cumprido, o que exige **uma emenda mínima no motor** (seção 5). Ela é feita num runtime novo; os freezes históricos ficam intactos.

**O que mudou da r1:** a r1 só convertia `workMinutes` em metros. Isso não atende o requisito V1: **o CoachingCore deve prescrever nativamente sessões por distância ou por tempo**, por exemplo 6 × 800 m, 8 × 400 m, 5 × 1.000 m, longão de 16 km, contínuo de 8 km, mistos, progressivos e pirâmides, com recuperação por tempo ou por distância. A conversão da r1 continua como **capacidade opcional** (seção 7). A decisão SSCTR `SSCTR-RWS-DECISION` (r1) é **histórico** e só cobre essa conversão. Não aprova esta arquitetura.

---

## 1. Quatro camadas que não se confundem

| Camada | O que é | Dono | Muda nesta extensão? |
|---|---|---|---|
| **Dose de planejamento** | A sessão canônica do motor: dia, papel, família, passo da escada, minutos de trabalho, duração, orçamento, taper, holds, coordenação corrida × força. Mecanismo interno de controle. | Motor congelado | Não |
| **Prescrição** | O que o atleta recebe: etapas nativas `TIME` ou `DISTANCE`, misturáveis, com intensidade e recuperação. **Requisito V1 obrigatório.** | Seletor de formato (novo) | Nova |
| **Conversão equivalente** | Os minutos canônicos expressos em metros (r1). Opcional; fallback. | Seletor de formato | Nova, opcional |
| **Execução** | Cumprimento do alvo de cada etapa (DISTANCE, TIME, PARTIAL, STOPPED, UNKNOWN) e registro do executado (duração, distância, medição, motivo de parada). | Relato + leitor de conclusão (novo) + motor | Campos novos opcionais; **emenda mínima no motor** para ler a conclusão por distância |

O seletor **não é um segundo planejador**: não escolhe dia, papel, família, passo, volume nem progressão. Ele escolhe só a **forma** de entregar a dose que o motor já decidiu, dentro de um envelope que a preserva.

## 2. Lacunas reais no código

| # | Lacuna | Onde |
|---|---|---|
| L1 | Prescrição de corrida só em minutos (`work: {repetitions, workMinutes, recoveryMinutes}`); o validador exige minutos. | `src/r6-prescription.mjs:45`, `:126-141` |
| L2 | Escadas, orçamentos, taper e toques em minutos. | `r6/INITIAL_PROGRAM_GENERATION_R6.json:254`, `v1/EVENT_EXTENSION_V1.json`, `src/r6-prescription.mjs:15` |
| L3 | Não há modelo de etapas: repetições iguais num único objeto; pirâmide, misto, progressivo e recuperação por distância não são representáveis. | `src/r6-prescription.mjs:37-56` |
| L4 | Não há catálogo de formatos (distâncias de repetição, recuperações, padrões) nem regra para escolhê-los por elegibilidade, experiência, objetivo, fase e carga. | — |
| L5 | A faixa de ritmo é orientação (`effortGoverns`), sem autoridade para dimensionar uma prescrição por distância. | `src/v1-run-calibration.mjs:11`, `:530` |
| L6 | Conclusão lida por minutos: completa se `actual.minutes ≥ 0,9 × durationMinutes`. | `src/r6-adaptation.mjs:195` |
| L7 | O relato tem só um agregado do trabalho (`actual.work`); não há alvo cumprido por etapa nem formato executado. | `RUN_CALIBRATION_CONTRACT_V1RC.md:43` |
| L8 | Tarefa familiar só em minutos ("6 × 800 m" relatado não é representável). Fica fora (RWS-Q10, abstido). | `src/r6-intake.mjs:64`, `:189` |

**Por que o motor precisa de uma emenda mínima, e só uma:** o estado avança pelos **minutos planejados** da sessão feita (`src/r6-program.mjs:278`, `runMinutesOf` `:1210`), então a progressão continua correta com a dose de planejamento. Mas a conclusão de uma corrida é lida num único ponto, `bindObservations` (`src/r6-adaptation.mjs:195`): completa só se `actual.minutes ≥ 0,9 × durationMinutes`. O ponto é chamado em `:553`, `:589` e na reconstrução histórica `:2503`. Um longão de 16 km feito mais rápido que a dose de planejamento seria lido como parcial. Não há como evitar isso por fora sem esconder do motor os minutos reais (alternativa rejeitada: apaga a duração executada do registro). Por isso a seção 5 emenda essa expressão e nada mais.

## 3. Contrato técnico: a sessão prescrita

Nova chave em cada resultado: `runSessions[sessionId]`.

```
RunSession = {
  sessionId, week, date, role, family,
  planning: { plannedPrescriptionHash, family, ladder, step,        // a dose canônica que esta sessão entrega
              workMinutes, durationMinutes, budgetMinutes },
  expression: 'NATIVE' | 'EQUIVALENT' | 'TIME',                    // NATIVE = formato nativo; TIME = a prescrição canônica em etapas
  formatId, formatHash,                                            // hash da sessão prescrita inteira; o relato o cita
  blocks: [ { repeat: n, steps: [Step] } ],                        // repeat 1 para etapas únicas; pirâmide = sequência de blocos
  estimate: { durationMinutes: {low, high}, distanceKm: {low?, high}, basis },   // estimado, nunca alvo
  dose:     { workMinutesAtBand: {low, high}, withinEnvelope: true, checks: {...} },
  unavailable?: { native: reason, equivalent: reason },            // por que caiu para EQUIVALENT ou TIME
  provisional                                                      // semana futura, como na V1RC
}

Step = {
  kind: 'WARMUP' | 'WORK' | 'RECOVERY' | 'COOLDOWN' | 'STEADY' | 'STRIDES',
  target: { type: 'TIME', seconds } | { type: 'DISTANCE', metres },    // o ALVO prescrito: uma dimensão só
  estimate: { seconds?: {low, high}, metres?: {low?, high} },          // a outra dimensão, ESTIMADA, rotulada
  intensity: { effortDomain, rpe: [lo, hi], talk, pace?: {fastSecondsPerKm, slowSecondsPerKm, domain} },
  recoveryMode?: 'JOG' | 'WALK_OR_JOG',                                 // só RECOVERY
  optional?: true,                                                      // strides
  effortGoverns: true
}
```

Regras do contrato:
- **Alvo × estimativa:** `target` é o que o atleta deve cumprir; `estimate` é derivado da faixa e nunca aparece como alvo, piso ou meta.
- **Repetição nativa por distância não termina pelo tempo**; mostra a faixa de tempo estimada. O teto de tempo da r1 vale só para o modo opcional `EQUIVALENT`.
- **Distância é o critério de conclusão** (decisão do Founder): contínuo por distância termina na distância; repetição por distância termina na distância; recuperação por distância avança pela distância. Não existe campo de teto de tempo numa etapa nativa. A duração aparece só em `estimate`.
- **O atleta pode parar a qualquer momento** (fadiga, desconforto, decisão própria). A execução real é registrada e o alvo não é declarado cumprido (seção 5, STOPPED).
- **Esforço governa** em toda etapa: se o esforço passar do alvo, a parte dura termina; terminar fácil é válido (texto existente).
- **TIME** é a prescrição canônica em etapas, sem decisão nova: aquecimento → (trabalho, recuperação) × n sem recuperação após a última → desaquecimento; WALK_JOG em segundos; strides opcionais.
- `formatHash` é estável na semana: o formato só muda na virada de semana, com a faixa (V1RC), salvo retirada imediata.

## 4. Seleção do formato e controle da dose

**Entradas** (nenhuma nova no intake): a sessão canônica (família, passo, envelope), a fase e o evento, `runExperience`, o modo de corrida, a faixa da semana (`runCalibration`), a preferência de expressão do atleta (opção do cliente: `NATIVE` | `TIME`), e o índice da semana.

**Algoritmo determinístico:**
1. Se uma regra de supressão vale (seção 6), a sessão sai em `TIME`, com o motivo.
2. Tomar do catálogo (`RUN_FORMATS_V1.json`, valores SSCTR) os formatos da família admitidos para a experiência e a fase.
3. Para cada formato, dimensionar repetições e distâncias e calcular as estimativas pela faixa do domínio de cada etapa.
4. Guardar os que passam **todas** as checagens do envelope:
   - **E1 trabalho:** trabalho estimado na borda lenta ≤ 1,015 × e na borda rápida ≥ 0,9 × o trabalho do passo (`repetições × workMinutes` canônicos, já reduzidos em taper e toque). Etapas por tempo contam exatas.
   - **E2 repetição:** cada repetição, nas mesmas bordas, entre 0,9 e 1,015 × a repetição do passo; só os flancos da pirâmide podem descer até a menor repetição da escada da família.
   - **E3 orçamento:** duração estimada alta ≤ min(orçamento da sessão, duração canônica + um intervalo de recuperação do passo). Contínuos: ver abaixo.
   - **E4 conclusão:** só para o modo `EQUIVALENT` (r1). Sessões nativas por distância não dependem mais dela: a conclusão é lida pela distância (seção 5).
   - **E6 exposição** (contínuos nativos, decisão r3 C1): `P_size` = o mais lento entre a borda lenta observada P1 do atleta, o ritmo da última corrida comparável da classe e, só no longão de maratona no teto de 180 min, a borda lenta da faixa LONG; `P_typ` = o mais lento entre o teto da classe e a mediana P1. D = o maior valor em 1 km (senão 0,5 km) que passa **CT-1** `D × P_size ≤ min(M planejado, minutos disponíveis)`, **CT-2** `D × P_typ ≥ 0,9 × M` e **CT-3** `D ≤ 1,10 × L30`. Nenhum D → TIME.
     - **O que é o CT-3** (r3a A2): heurística conservadora que limita só a **expressão** da sessão, ancorada no grupo de referência ≤10% de Frandsen 2025. Não é limiar seguro, nem regra de dose, nem regra de progressão. Reprovar o CT-3 escolhe uma distância menor (se a paridade de dose CT-2 ainda passar) ou dá TIME. Nunca muda os minutos planejados, o passo, o crédito ou a carga, e nunca bloqueia uma sessão.
     - **L30** = a maior corrida dos últimos 30 dias, de qualquer fonte registrada: registro do motor, importação HealthKit, entrada manual ou declaração do intake **com distância e data**. A mesma corrida conta uma vez só e minutos nunca viram km. Uma declaração sem medição conta como declarada; com medição, vale o menor valor.
     - **Requisito de dados:** o intake de hoje guarda só minutos e não contribui para o L30 até ganhar uma distância com data (Data). A janela é de 30 dias para todos; janela maior: abstido, e não mudaria nada, porque P1 e o longão comparável já exigem corridas nos últimos 28 dias. Repetições: continuam E1–E3 e E5 da r2.
   - **E5 texto:** passa por `FORBIDDEN_CLAIM` e pelo filtro de esforço.
5. Padrão = `weekIndex mod n` sobre os padrões admitidos que passam; dentro do padrão, a ordem de candidatos do catálogo (`values.candidateOrder` da r2: unidade de distância mais grossa primeiro, depois contagem n, n−1, n+1). Depois de uma sessão parcial, a próxima do mesmo passo volta a repetições iguais. Nenhum aprovado (`NO_FORMAT_WITHIN_ENVELOPE`) → `EQUIVALENT` (r1), se a família o admite; senão `TIME`.

**Taper e toques:** o motor já reduz a dose (`reducedWork`); o seletor mantém a distância de pico registrada, em repetições iguais com a contagem reduzida do motor, se E1–E5 passarem; senão aplica o passo 5. Toque de semana de prova: repetições iguais ou tempo.

**Contínuos:** alvo `DISTANCE` (ex.: 9 km, 16 km), sem teto de tempo, só EASY e LONG (RECOVERY_EASY e SHAKEOUT ficam por tempo, r3 C2). D pela checagem E6. Elegibilidade (r3 C2): INTERMEDIATE+, modo EASY, faixa P1 observada disponível; o longão exige uma corrida executada nos últimos 28 dias com pelo menos M − 5 min e distância registrada (se essa corrida foi uma correção, conta a menor distância utilizável) (o `longestContinuous` do motor não serve: guarda minutos planejados, sem janela). **Exposição acima do estimado** (sem número aprovado, r3 C1 abstido): **X-1** o ritmo da última corrida dimensiona a próxima; **X-2** duas corridas seguidas da mesma classe acima do estimado, paradas ou parciais põem a classe em TIME por 28 dias. O longão da maratona continua sob o limite do motor (180 min) e as regras do evento.

**Sem dupla contagem:** a carga que limita o plano é a dose de planejamento (minutos canônicos), uma vez só. A distância prescrita e a estimada nunca entram em nenhuma soma de carga, gate, rampa ou taper. O km semanal (soma de alvos de distância + estimativas altas das etapas por tempo) é informativo e rotulado.

## 5. Execução, medição e leitura de conclusão

**Relato** (campos existentes + opcionais novos). Fatos crus, informados pelo atleta ou pelo aparelho:

```
actual: {
  completed, minutes, distanceKm, measurement, gpsQuality, rpe, work: {distanceKm, seconds},   // existentes
  formatHash,                                                     // novo: o formato que o atleta executou
  steps: [ { block, rep, kind, targetMet: true | false | null, seconds?, metres?, measurement? } ],   // novo
  stop?: { atStep, reason, metres?, seconds? },                   // novo: interrupção, com motivo e dados reais
  declared?: { distanceKm, reason, confirmedAt }                  // novo: correção ou declaração explícita do atleta
}
```

- `minutes` é sempre o tempo real; `distanceKm` é sempre a distância **medida**, como registrada, e nunca é sobrescrita.
- `declared` guarda a distância **declarada** pelo atleta, com o motivo. Ela nunca substitui `distanceKm`.
- Uma correção por falha de medição exige `gpsQuality: 'POOR'`, que é o próprio relato do atleta de que a medição falhou. A V1RC já exclui GPS `POOR` da evidência de ritmo (`comparableRun`, `src/v1-run-calibration.mjs:150`), sem mudar nada nela.
- Correção depois do registro: segue o caminho de correção que o motor já tem (linha nova que substitui a anterior, com `provenance.firstRecordedAt` preservado). As duas linhas guardam o mesmo `distanceKm` medido original.

**Leitura derivada, nunca aceita do cliente:**

```
completionRead = { status: 'DISTANCE' | 'PARTIAL' | 'STOPPED' | 'UNKNOWN', basis, formatHash, evidence: {source, reliability, measuredKm, declaredKm},
                   exposure: { estimateMinutes: {low, high}, actualMinutes, aboveEstimate: boolean } }
```

O leitor de conclusão (`v1-run-format.mjs`, função pura) calcula `completionRead` a partir dos fatos crus e do formato citado por `formatHash`. Ele não aceita um `completionRead` pronto de lugar nenhum (detalhes em "Confiança", abaixo).

| Status | Quando | Leitura pelo motor |
|---|---|---|
| **DISTANCE** | Todas as etapas pertinentes com o alvo cumprido pela regra de evidência abaixo. Repetições: as etapas WORK, decididas pela volta. Contínuo: a etapa principal. Etapas por tempo de um misto: pelo seu tempo. | Completa, sem a regra de 90% |
| *(TIME)* | Sessão por tempo: o leitor não escreve nada e vale a regra atual do motor (`minutes ≥ 0,9 × duração`). | Inalterada |
| **PARTIAL** | Executado abaixo do alvo sem interrupção declarada (14 de 16 km; 5 de 6 repetições), ou medido abaixo do alvo sem correção confirmada. Um ASK ao atleta, oferecendo a correção quando couber. Não é lido como sintoma sem parada declarada. | Não completa (como hoje) |
| **STOPPED** | Interrupção declarada, com motivo e dados reais. Motivos: SYMPTOM, FATIGUE, PACING, CONDITIONS, TIME, CHOICE, OTHER. Sem motivo = SYMPTOM (V1RC R-01). SYMPTOM leva à triagem de sinais existente, e a sessão seguinte fica por tempo até a resposta. FATIGUE leva à revisão de fadiga sistêmica existente, atrás da triagem. | Não completa; o alvo nunca é declarado cumprido |
| **UNKNOWN** | Evidência insuficiente ou conflito de medição, com ASK. Nunca sucesso, nunca falha. | Não completa e não comparável; corrigível depois pelo caminho de correção |

**Regra de evidência da distância (decisão SSCTR r3a, A1):**

| Base | Quando | Nível |
|---|---|---|
| **MEASURED** | Uma medição utilizável (pista ou percurso medido contado, mostrador da esteira, GPS, volta do aparelho) ≥ alvo. Uma perda maior que 9% só se fecha medindo a parte que faltou (segundo arquivo, contagem de pista, percurso medido): as medições são somadas e o resultado conta como MEASURED. | o da fonte |
| **CONFIRMED_CORRECTION** | Medição < alvo, mas ≥ 0,91 × alvo (a maior subleitura documentada, 9%), e o atleta declara ≥ alvo com um motivo da lista fechada: perda de sinal; céu obstruído (túnel, prédios altos, árvores densas); pausa automática; reinício do aparelho. Também vale quando o próprio aparelho marcou a leitura como POOR. A leitura fica registrada como POOR e o valor medido original é mantido. | o mais baixo; nunca evidência de ritmo |
| **DECLARED** | Sem aparelho, o atleta declara explicitamente ≥ alvo. **Decisão do Founder (2026-11-13):** vale para a adesão ao plano (conclusão da sessão), nunca para recalibrar ritmos, confirmar recordes ou demonstrar melhora de performance sem evidência adicional. | o mais baixo; nunca evidência de ritmo, recorde ou performance |

Fora dessas bases:
- Leitura curta sem resposta → PARTIAL + um ASK.
- Declaração sem motivo, ou medição abaixo de 0,91 × alvo com GPS bom → UNKNOWN (conflito) + ASK para medir a parte que falta.
- Leitura marcada POOR pelo aparelho e sem declaração → UNKNOWN.
- Declaração abaixo do alvo → PARTIAL.
- Não existe mais conclusão automática por tolerância de GPS (a regra de 0,97 da r3 foi removida).
- Repetições: decide a volta, como antes.

Consequências para o histórico e para a exposição:
- A distância que vai para o histórico é a **menor** entre os fatos utilizáveis. Uma correção nunca infla o histórico.
- Uma leitura curta (≥ 0,91 × alvo) sem parada e sem resposta não conta para a regra X-2 nem a reinicia. Duas subleituras de GPS não pausam a distância.

Regras gerais:
- A duração estimada nunca é critério de conclusão.
- Ausência de medição nunca é sucesso.
- Precisão absoluta de sensor nunca é exigida.
- Nenhuma tolerância técnica vira conclusão: a distância executada nunca é inventada.
- `actual.completed` passado ao motor é coerente com o status (true só em DISTANCE).

**Exposição acima do estimado:**
- Um treino de 16 km que leva mais que a estimativa continua **DISTANCE**, ou seja, concluído; `exposure.aboveEstimate = true`.
- Os minutos reais ficam em `actual.minutes`, no registro do motor, que já os soma na carga semanal registrada (`src/r6-adaptation.mjs:324`).
- O excesso entra só nas revisões futuras, pelas regras X-1 (a última corrida dimensiona a próxima) e X-2 (duas acima do estimado, paradas ou parciais na mesma classe → classe por tempo por 28 dias). Elas mudam a **expressão** das sessões seguintes, nunca a conclusão já registrada nem o passo do motor.

**Emenda mínima no motor** (`src/r6-adaptation.mjs`, `bindObservations`, a única leitura de conclusão de corrida, linha 195):

```
// hoje
complete = o.actual.completed===true && minutesOk && setsOk
// emenda: só com a leitura habilitada pelo ponto de entrada novo
const read = readsCompletion && s.sport==='RUN' && READ_STATUSES.has(o.actual?.completionRead?.status) ? o.actual.completionRead.status : null;
complete = read ? read==='DISTANCE' : (o.actual.completed===true && minutesOk && setsOk)
```

- `readsCompletion` é um parâmetro novo de `bindObservations`, levado pelas três chamadas: `:553`, `:589` e `:2503`. A última fica dentro de `canonicalRecord` (`:2499`), chamada por `historicalStateOf(program, {asOf, actualLedger}, options)` (`:2473`), que já recebe `options`. O valor vem de uma opção interna que **só** `v1-run-format-index.mjs` liga.
- Sem a opção, o campo é ignorado e a saída é byte a byte a de hoje: `v1-index.mjs`, `v1-run-index.mjs`, a custódia e toda sessão por tempo.
- `READ_STATUSES` = DISTANCE, PARTIAL, STOPPED, UNKNOWN.
- **Freezes:** nenhum registro de freeze é editado. O freeze novo declara exatamente um arquivo emendado (`r6-adaptation.mjs`: a expressão e o parâmetro), com diff e hash. Os `--check 1` antigos apontam esse arquivo como diferença, por desenho.

**Confiança: o `completionRead` nunca vem do cliente.**
- **Pontos de entrada antigos** (`v1-index`, `v1-run-index`, custódia): ignoram o campo, porque a opção está desligada.
- **Ponto de entrada novo:** antes de chamar o motor, apaga qualquer `completionRead` de **toda** observação recebida, tanto da revisão quanto do registro carregado (`actualLedger`). Depois recalcula cada um pelo leitor a partir dos fatos crus e do formato citado. O valor gravado no registro é só uma cópia, recalculada a cada avaliação.
- **Opção de chamador:** a opção que liga a leitura é interna. O ponto de entrada novo descarta a mesma chave se ela vier nas opções do chamador (a integração não passa opções; condição QRE-V1RC).
- Os fatos crus (distância, tempo, voltas, declaração) continuam sendo relato do atleta, como hoje. A garantia é que a **leitura** nunca é aceita pronta.

**Reconstrução histórica e sessões por tempo:**
- `historicalStateOf` com a opção ligada recalcula as mesmas leituras a partir do mesmo registro e chega à mesma conclusão que a avaliação ao vivo (determinismo).
- Sessões por tempo nunca recebem `completionRead`, com ou sem a opção, e continuam na regra dos 90%.

**Formato fixado:** o leitor usa o formato citado por `formatHash`, não o de hoje. Hash desconhecido → `ASK`, nada registrado.

**Duração e distância executadas** ficam no `actualLedger` do motor, que preserva `actual` inteiro no caminho atual (T3 confirma). Se o motor ou a custódia descartarem os campos novos, é impedimento material: parar e reportar, sem criar um segundo registro.

**Contrato para a futura extensão Race Forecast** (só leitura; ela não existe ainda e não é implementada aqui). Cada sessão executada expõe `runSessions[id].execution`:

```
{ status, basis, targetKm, measuredKm, declaredKm, reliability, actualMinutes, estimateMinutes: {low, high}, aboveEstimate, paceEvidence: boolean }
```

- Só **DISTANCE** (e, nas sessões por tempo, a conclusão do motor) é treino feito.
- Uma duração **menor** que a estimada com a distância cumprida é treino feito, nunca treino perdido.
- PARTIAL e STOPPED são treino feito em parte, com os dados reais; UNKNOWN fica fora de qualquer cálculo.
- `paceEvidence` é falso para distância declarada ou corrigida, esteira e GPS `POOR`, seguindo a V1RC. Uma sessão DECLARED também nunca confirma recorde nem demonstra melhora de performance (decisão do Founder).

## 6. Segurança, supressões e integração

**Sempre `TIME` (nenhum formato nativo):** hold, rota clínica, triagem de sinais requerida; modos WALK_JOG, RESTART, RETURN; primeira exposição a uma escada; faixa indisponível para o domínio; família sem formato no catálogo (FAMILIAR_REPEATED_BOUTS, RACE, prova de conclusão); sessão que o motor converteu em leve; sessão mais dura depois de teste na mesma semana (V1RC R-12); estimativa de maratona com centro > 6:00:00; erro da extensão. Lista final (22 motivos) e ordem de precedência: `values.suppression` da decisão r3, que emenda a da r2 (seção 9).

**Herdado:** nenhum ritmo de tempo-alvo de prova, de corrida leve ou de projeção (a faixa V1RC já garante); `FORBIDDEN_CLAIM`; falha fechada com motor e V1RC intactos (`safely`); valores fixados por sha256 e liberados por registro SSCTR (`V1X-RUN-NATIVE`, e `V1X-RUN-DISTANCE` para a conversão opcional).

**Coordenação corrida × força:** o motor continua decidindo dias, papéis, interferência (`interferenceBefore`) e holds a partir da dose de planejamento; E1–E3 e E6 impedem que o formato planeje mais carga que essa dose dentro da tolerância decidida; a duração real, inclusive maior que a planejada num atleta mais lento, fica registrada nos minutos reais que o motor já soma. Nada da força muda.

**Integração:** a preferência de expressão é do cliente; a integração não passa opções ao ponto de entrada (condição QRE-V1RC); entrega ao relógio e write-back HealthKit continuam pós-V1 (DR-117–123); o modelo de blocos é compatível com treino estruturado da plataforma, sem depender dele.

## 7. Capacidade opcional: conversão equivalente (r1)

Mantida como modo `EQUIVALENT` e fallback: minutos canônicos → metros pela borda lenta, arredondamento para baixo em 100/50/10 m dentro de 1,5%, só repetições ≥ 5 min, teto de tempo por repetição, checagem de 0,9. Valores e 17 exemplos em `ssctr/SSCTR_RWS_DECISION.json` (r1, sha `e17e2519…`). Pode ser implementada depois do nativo, ou omitida, sem bloquear a V1.

## 8. Famílias e formatos V1

Famílias (inalteradas, `RUN_FAMILIES`): WALK, WALK_JOG, EASY (+ strides), LONG, RECOVERY_EASY, SHAKEOUT, THRESHOLD, FIVE_K_SPECIFIC, TEN_K_SPECIFIC, HALF_MARATHON_SPECIFIC, MARATHON_SPECIFIC, RACE_TOUCH, RACE, FAMILIAR_REPEATED_BOUTS. Fora: VO2 de novo (`LATER.RUN.VO2_DE_NOVO`), subidas, fartlek.

Catálogo decidido (N1, N6; `values.catalog`, `values.patterns`). O formato não muda a família.

| Família | Padrões nativos | Fallback EQUIVALENT |
|---|---|---|
| THRESHOLD, HALF_MARATHON_SPECIFIC, MARATHON_SPECIFIC | iguais, iguais com recuperação por distância, misto, pirâmide, repetições progressivas | sim |
| FIVE_K_SPECIFIC, TEN_K_SPECIFIC | iguais, iguais com recuperação por distância, misto, pirâmide | não |
| RACE_TOUCH | iguais | só toques de 5 min |
| EASY, LONG | contínuo por distância (sem teto de tempo, r3), progressivo leve (dentro de uma faixa) | — |
| RECOVERY_EASY, SHAKEOUT | só tempo (r3 C2) | — |
| WALK, WALK_JOG, RACE, FAMILIAR_REPEATED_BOUTS | só tempo | — |

Distâncias de repetição: 200–950 m em passos de 50 m; 1.000–6.000 m em passos de 100 m. Recuperação = os minutos do passo, caminhada ou trote; por distância (trote, caminhar permitido) só para INTERMEDIATE+ em repetições iguais: minutos do passo na borda rápida da faixa RECOVERY, arredondado para cima a 50 m. Progressivo entre domínios (leve → moderado → limiar): **rejeitado** na V1 (não há faixa de "moderado"; ver seção 13).

## 9. Decisões esportivas

Autoridade: `ssctr/SSCTR_RWS_R2_DECISION.json` (sha256 `daf3d7a2…2213`) e `.md`. Autor das propostas: o Chief. Decisor: instância SSCTR separada, PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, sem credencial humana nem validação empírica. Categorias: **a** já aprovado (V1RC, escadas R6, V1FC), **b** decisão nova, **c** dependente de evidência. A r1 (`SSCTR_RWS_DECISION.json`) fica como histórico e vale só para o modo `EQUIVALENT`; a r2 a substitui para prescrição nativa em Q1, Q3, Q4 e Q6.

| Item | Decisão | Cat. | Conteúdo |
|---|---|---|---|
| N1 Catálogo | APPROVE_WITH_CONDITIONS | b sobre a | Cada família mantém o domínio, os minutos de repetição e de recuperação da sua escada; a distância é a forma desse estímulo. |
| N2 E1/E2 | APPROVE_WITH_CONDITIONS | b ligada a a | [0,9; 1,015] do passo, nas duas bordas: 0,9 hoje é paridade de dose com a versão por tempo (re-vinculado pela r3 C6), 1,015 a fração da V1RC. E3 = orçamento + no máximo um intervalo de recuperação. Tolerância maior: abstido (c). |
| N3 Elegibilidade | APPROVE_WITH_CONDITIONS | b | NOVICE: só repetições iguais com recuperação por tempo, contínuos por tempo. ESTABLISHMENT e POST_EVENT: tempo. CONSOLIDATION: iguais e contínuos. SPECIFIC: sem pirâmide. TAPER e semana de prova: só iguais. |
| N4 Contínuos | ~~APPROVE_WITH_CONDITIONS~~ **histórico, rejeitado pelo Founder** | b | "D km ou M min, o que vier antes". Substituído pela r3 C1–C3; não aprova a regra nova. |
| N5 Recuperação por distância | APPROVE_WITH_CONDITIONS | b | INTERMEDIATE+, só em repetições iguais; substitui r1 Q4. |
| N6 Progressivo | REJECT + APPROVE_WITH_CONDITIONS + ABSTAIN | b; c | Rejeitado o leve→moderado→limiar. Aprovados repetições progressivas (limiar, meia, maratona) e progressivo leve (EASY, LONG), cada um dentro de uma faixa. Entre domínios: abstido. |
| N7 Conclusão e medição | APPROVE_WITH_CONDITIONS, **emendado pela r3 e pela r3a** | a+b | Vigente: etapa por distância decidida pela volta, não por igualdade de GPS. Substituído: o resíduo "atleta muito mais rápido que a faixa é lido como parcial" deixou de valer para sessões nativas, que são lidas pela distância (seção 5). |
| N8 Supressões | APPROVE_WITH_CONDITIONS | a+b | 18 motivos em ordem fixa (`values.suppression.order`); só `NO_FORMAT_WITHIN_ENVELOPE` cai para EQUIVALENT. |
| N9 Taper e toque | APPROVE_WITH_CONDITIONS | b | Distância de pico com contagem reduzida, se E1–E5 passam. |
| N10 Variedade | APPROVE_WITH_CONDITIONS | b | Rotação `weekIndex mod n`; não é progressão; `doseKey` inalterado. |

**Exemplos do Founder (verificados pelo SSCTR com script avulso; `founderExamplesAdmission` no JSON):**

| Exemplo | Admitido em | Quando não |
|---|---|---|
| 6 × 800 m | 10K passo 3 a 4:50–5:00/km; 5K passo 3 a 3:40–3:45 | a 5:05–5:20 vira 6 × 750 m |
| 8 × 400 m | 5K passo 1 a 4:50–5:00 | borda lenta 5:05 → TIME |
| 5 × 1.000 m | limiar passo 2 a 4:50–5:00; 10K passo 2 a 3:50–4:00 | — |
| Contínuo de 8 km | INTERMEDIATE+ com P1: 8 km, cerca de 45–49 min (r3) | NOVICE ou sem P1: tempo |
| Longão de 16 km | M 100 min, P1 340/370 s/km, longão recente 95 min / 15,5 km: 16 km, cerca de 92–99 min (r3) | sem longão comparável em 28 dias, ou CT-1/CT-3 falham: distância menor ou tempo |
| Pirâmide | ex.: 1400-1600-1600-1400 m | não em SPECIFIC |
| Misto | ex.: 2 × 1500 m + 2 × 8 min | — |
| Progressivo | dentro de uma faixa | entre domínios: não |
| Recuperação por distância | ex.: 4 × 900 m com 300 m de trote | INTERMEDIATE+ |

Nunca nativos: passo 0 de qualquer escada (primeira exposição), faixas largas demais, a maioria dos toques de 5K. **Cobertura nativa** na varredura de faixas plausíveis: 5K 39–58%, 10K 58–65%, limiar 68–73%, meia e maratona 73–82%, contínuos 95%. O resto sai em EQUIVALENT ou TIME, com motivo.

**Emenda r3 (`SSCTR_RWS_R3_DECISION.json`, sha `6b96d769…08e2`, valores `RWS-R3-1`):** revisão delimitada da regra do Founder; não a reabre e não reintroduz teto de tempo.

| Item | Decisão | Cat. | Conteúdo |
|---|---|---|---|
| C1 Dimensionamento | APPROVE_WITH_CONDITIONS (contínuos) + KEEP (repetições: E1–E3, E5 da r2) + ABSTAIN (número para o excesso aceitável) | b sobre a; a; c | `P_size`/`P_typ` e CT-1..CT-3 (seção 4, E6); X-1 e X-2 no lugar de um número de excesso. A borda lenta da faixa não serve: as faixas leve e longa têm 20–27% de largura. |
| C2 Elegibilidade | APPROVE_WITH_CONDITIONS | b | INTERMEDIATE+, modo EASY, P1 disponível; longão com corrida comparável em 28 dias; RECOVERY_EASY e SHAKEOUT por tempo; RETURN: tudo por tempo, sem misto. |
| C3 Alvo cumprido | **Emendado pela r3a A1** | b + a; c | A regra de GPS a 0,97 foi removida; vale a regra de evidência da seção 5. |
| C4 STOPPED | APPROVE_WITH_CONDITIONS | a + b | Sete motivos; sem motivo = SYMPTOM; FATIGUE → revisão de fadiga existente. |
| C5 PARTIAL / UNKNOWN | APPROVE_WITH_CONDITIONS | b | PARTIAL: um ASK, mantém o passo; UNKNOWN: nem sucesso nem falha. |
| C6 Envelope | APPROVE_WITH_CONDITIONS | a + b | [0,9; 1,015] mantido como paridade de dose com a versão por tempo (não mais como leitura de conclusão); E4 só como checagem de compatibilidade. |

Confiança BAIXA em C1, C2, C3, C5, C6 e MODERADA em C4. Novos motivos de supressão depois de `BAND_UNAVAILABLE` (22 no total): `CONTINUOUS_PACE_UNOBSERVED`, `LONG_HISTORY_NOT_COMPARABLE`, `DISTANCE_HISTORY_UNKNOWN`, `CONTINUOUS_FORMAT_PAUSED`.

**Exemplos r3 obrigatórios (atleta A: faixa LONG 345–420 s/km, P1 340/370, longão comparável 95 min / 15,5 km):**

| Caso | Esperado |
|---|---|
| Longão de 16 km, M 100 | NATIVE 16 km, cerca de 92–99 min |
| Feito a 5:35/km (mais rápido que o teto de ritmo da faixa) | DISTANCE |
| Feito a 6:00/km (na faixa) | DISTANCE |
| Feito a 6:45/km, 108 min | DISTANCE + `EXPOSURE_ABOVE_ESTIMATE`; o próximo longão é por tempo |
| Feito a 7:15/km, 116 min | DISTANCE + `EXPOSURE_ABOVE_ESTIMATE` (resíduo aceito) |
| Parado aos 12 km por fadiga | STOPPED (FATIGUE); oferta de revisão de fadiga; passo mantido; próximo longão de novo 16 km |
| Medições de GPS curtas e sem aparelho | ver os exemplos da r3a, abaixo (substituem WE3-07 a WE3-09) |
| 6 × 800 m, 5 de 6 feitas | PARTIAL; passo mantido; ASK; próxima sessão em repetições iguais |
| 6 × 800 m, parada por sintoma | STOPPED (SYMPTOM) → triagem de sinais; tempo até a resposta |
| Parada sem motivo | lida como SYMPTOM |
| Corrida leve de NOVICE | TIME (`EXPERIENCE_NOT_ELIGIBLE`) |
| Atleta em RETURN | TIME em todas as corridas; sem misto no modo RETURN |
| Depois do retorno | repetições nativas quando a faixa volta; contínuos por tempo até P1 voltar |
| Corrida leve de 8 km | 8 km, cerca de 45–49 min |
| Longão de maratona no teto de 180 min | TIME |
| Último longão de 80 min | TIME |
| Duas corridas leves seguidas acima do estimado | corridas leves por tempo por 28 dias |
| Corrida de recuperação | TIME |
| Esteira | DISTANCE no nível TREADMILL |

**Emenda r3a (`SSCTR_RWS_R3A_AMENDMENT.json`, sha `37047d21…d412`, valores `RWS-R3A-1`, emenda `RWS-R3-1`):** pedida pela checagem final do Founder. Substitui exatamente: `tiedValues.gpsMetFraction` (removido), `gpsConfirmedFloorFraction` (agora `correctionFloorFraction`, 0,91), `distanceReferenceMaxFraction` (1,10, reclassificado), `completion.continuousBySource` (agora `completion.continuous`), `statuses.PARTIAL`, `statuses.UNKNOWN`, `exposure.X-2.counting`, `continuous.checks.CT-3`, `continuous.paceSizingSources.S2`, `eligibility.continuous.LONG.comparableLongRun`, `suppression.newDefinitions.DISTANCE_HISTORY_UNKNOWN`, `textRequirements.afterRun`. Acrescenta `runFacts` e `historyReference`. Tudo o mais da r3 continua.

| Item | Decisão | Tipo de regra |
|---|---|---|
| A1 Alvo cumprido | APPROVE_WITH_CONDITIONS | regra do Founder + heurística (0,91) |
| A2 (i) CT-3 | reclassificado: heurística conservadora | heurística |
| A2 (ii) Fontes do L30 | APPROVE_WITH_CONDITIONS | requisito de dados |
| A2 (iii) Efeito do CT-3 | confirmado: só muda a expressão | — |
| A2 (iv) Janela maior para EXPERIENCED | NÃO ADOTADO (abstido, sem evidência) | — |

**Exemplos r3a** (0,91 × 16 = 14,56 km):

| # | Caso | Esperado | Nível |
|---|---|---|---|
| 01 | GPS 15,52, sem resposta | PARTIAL + ASK; não conta para X-2 nem o reinicia; histórico 15,52 | GPS |
| 02 | Igual + declara 16 por perda de sinal | DISTANCE (CONFIRMED_CORRECTION); histórico 15,52 | o mais baixo |
| 03 | Igual + declara 16 sem motivo | UNKNOWN (conflito) + ASK | GPS |
| 04 | GPS 14,0 bom + declara 16 | UNKNOWN com ou sem motivo; ASK para medir a parte que faltou | GPS |
| 05 | Sem aparelho, declara 16 | DISTANCE (DECLARED); histórico 16 | o mais baixo |
| 06 | Pista, 40 × 400 m | DISTANCE (MEASURED) | TRACK |
| 07 | EXPERIENCED cujo único longão é um intake de 15 km | longão: TIME (sem longão comparável); leve: 9,5 km se o intake tiver distância e data, senão TIME; dose de 60 min nos dois casos | declarado |
| 08 | Janela de 30 dias vazia depois de taper | TIME (em geral `CONTINUOUS_PACE_UNOBSERVED`); dose inalterada | — |
| 09 | GPS 16,4 marcado POOR pelo aparelho | sem resposta: UNKNOWN; declara 16: DISTANCE (correção), histórico 16 | o mais baixo |
| 10 | Reinício + segundo arquivo de 2,1 km | DISTANCE, 16,1 medidos | GPS |
| 11 | GPS 16,3, atleta diz "parei antes, uns 15" | PARTIAL; conta para X-2 | declarado |

34 exemplos (r2), 23 (r3, dos quais WE3-07 a 09 substituídos) e os da r3a em `workedExamples`: oráculo de T13, lidos do JSON; divergência é achado, não ajuste. Validade até 2027-05-11 ou gatilho do JSON. Fila humana proposta, não anexada: HQ-RWS2-SSCTR-NATIVE; HQ-RWS3-SSCTR-CONTINUOUS-DISTANCE (substitui HQ-RWS2-SSCTR-CONTINUOUS); HQ-RWS3-SSCTR-COMPLETION (emenda HQ-RWS2-SSCTR-MEASURE e -NATIVE); HQ-RWS3A-SSCTR-COMPLETION-BASIS; HQ-RWS3A-SSCTR-L30-HISTORY. Nenhuma decisão habilita `V1X-RUN-NATIVE`.

## 10. Testes essenciais

- **T1 Preservação:** com e sem a extensão, `program`, decisões, `actualLedger`, `runCalibration`, `runEvidenceRecord` byte-iguais nas jornadas `evidence/JOURNEYS_V1RC.json`; os dois freezes passam (`v1rc-freeze --check 1`; `v1fc-freeze --check 1` no worktree V1FC).
- **T2 TIME sem perda:** cada prescrição canônica vira blocos cuja soma fecha com ela.
- **T3 Passagem do relato:** `actual.formatHash` e `actual.steps` sobrevivem no `actualLedger` do motor e na custódia.
- **T4 Exemplos do Founder:** cada linha da tabela de exemplos da seção 9, com a faixa e o passo indicados, produz exatamente o formato da tabela; a coluna "quando não" produz o fallback indicado; nenhum é produzido para quem não é elegível (N3).
- **T5 Envelope:** cada checagem E1–E5 tem um caso que a reprova sozinha e cai para `EQUIVALENT` ou `TIME` com o motivo certo.
- **T6 Leitura de conclusão:** os casos "16 km" da tabela r3 (5:35, 6:00, 6:45 e 7:15/km) são todos DISTANCE e completos para o motor, inclusive quando os minutos reais ficam abaixo de 0,9 × a duração planejada; o passo liberado é o mesmo da versão por tempo. Nenhuma sessão nativa é concluída por tempo.
- **T7 Medição:** os exemplos r3a 01–11 dão o status, a base e o nível esperados. `distanceKm` medido nunca muda; nenhuma tolerância conclui sozinha; ausência de medição sem declaração é UNKNOWN; correção feita depois preserva o valor original nas duas linhas do registro; correção e declaração nunca chegam à V1RC como evidência de ritmo (GPS `POOR`).
- **T8 Formato fixado:** a faixa muda na semana seguinte; um relato com o `formatHash` antigo é lido contra o formato antigo; hash desconhecido → `ASK`.
- **T9 Supressões:** cada motivo da seção 6 produz `TIME`, e só ele.
- **T10 Sem dupla contagem:** mutar distâncias, estimativas e km semanal não muda nenhuma decisão do motor.
- **T11 Determinismo:** mesma entrada, mesmo formato; a rotação só muda com o índice da semana.
- **T12 Mutação** das checagens E1–E5, da ordem de supressão e do arredondamento.
- **T13 Exemplos SSCTR** das decisões r2, r3 e r3a (sem os WE3-07 a 09 substituídos), lidos dos JSON, como oráculo: divergência é achado.
- **T14 Parada e parcial:** 16 km parado aos 12 km por fadiga → STOPPED, 12 km e o tempo real gravados, alvo não cumprido, passo mantido; 6 × 800 m com 5 feitas → PARTIAL; 6 × 800 m parado por sintoma → STOPPED + triagem de sinais; parada sem motivo → lida como SYMPTOM.
- **T15 Iniciante, retorno e exposição:** NOVICE → TIME; RETURN → TIME em todas as corridas, sem misto; depois do retorno, a semana mista da tabela r3; X-1 e X-2 (duas corridas acima do estimado pausam a classe por 28 dias); CT-1..CT-3 cada um reprovado sozinho dá TIME ou distância menor, sem mudar minutos planejados, passo ou carga do motor; L30 de cada fonte (registro, HealthKit, manual, intake com distância e data) e a mesma corrida contada uma vez.
- **T17 Exposição:** 16 km concluídos em 108 e 116 min → DISTANCE, `aboveEstimate`, `actual.minutes` real no registro e na carga semanal registrada; a sessão seguinte muda de expressão (X-1) e a conclusão registrada não muda.
- **T18 Confiança:** um `completionRead` forjado (DISTANCE numa sessão de 12 km parada) enviado (a) a `v1-index`, (b) a `v1-run-index`, (c) a `v1-run-format-index` na revisão, (d) dentro do `actualLedger` carregado e (e) com a opção interna nas opções do chamador nunca torna a sessão completa; em (c) e (d) é substituído pela leitura recalculada.
- **T19 Histórico e tempo:** `historicalStateOf` com a opção ligada reproduz as leituras e o estado da avaliação ao vivo; sessões por tempo, com e sem a opção, ficam byte-iguais às de hoje.
- **T20 Contrato Race Forecast:** `runSessions[id].execution` para os casos de T6, T14 e T7: DISTANCE com duração menor que a estimada = treino feito; PARTIAL e STOPPED = em parte; UNKNOWN fora; `paceEvidence` falso para declarada, corrigida, esteira e POOR.
- **T16 Emenda isolada:** com `completionRead` ausente, toda a suíte e as jornadas são byte-iguais; com ele, só a leitura de conclusão muda (mutante: inverter a precedência deve falhar T6 e T14).

## 11. Critérios objetivos de aprovação

1. T1–T20 verdes; suíte inteira verde (1334 + novos), nenhum teste antigo editado.
2. Registros de freeze intactos; em `src/` existente, só `r6-adaptation.mjs` (a expressão de conclusão e o parâmetro `readsCompletion` nas três chamadas); com a opção desligada, saídas byte-iguais.
3. Juízes independentes no candidato: SSCTR fresco (fidelidade ao catálogo e às regras) e QRE. Um ciclo de correção no máximo; depois fecha com bloqueio nomeado.
4. Registro SSCTR de habilitação de `V1X-RUN-NATIVE` emitido pelo juiz, não pelo autor.

## 12. Impactos mínimos no runtime e plano para o Fable 5.2

**Arquivo emendado (só este):** `CoachingCore/src/r6-adaptation.mjs`: a expressão de conclusão em `bindObservations` e o parâmetro `readsCompletion` levado pelas chamadas `:553`, `:589` e `canonicalRecord`/`historicalStateOf` (seção 5).

**Arquivos novos:** `CoachingCore/src/v1-run-format.mjs` (catálogo lido, etapas, estimativas, envelope, seletor, leitor de conclusão), `CoachingCore/src/v1-run-format-index.mjs` (embrulha `v1-run-index.mjs` e acrescenta `runSessions`; apaga `completionRead` de toda observação recebida, na revisão e no registro carregado, recalcula pelo leitor, liga a opção interna e descarta a mesma chave das opções do chamador), `CoachingCore/v1/RUN_FORMATS_V1.json` (valores SSCTR, sha fixado), testes `test/v1rf-*.test.mjs`, registro e freeze `COACHINGCORE-V1-RUN-FORMAT-FREEZE-1`, que declara o único arquivo emendado.

1. Worktree de c8104c1; suíte e os dois `--check 1` verdes antes de começar.
2. Modelo de etapas + `TIME` sem perda (T2) e o embrulho com `safely` (T1, T9 parcial).
3. T3 primeiro em código de teste: se o relato não passa, parar e reportar (impedimento material).
3b. Emenda de `bindObservations` + T1, T16, T18 e T19 antes de qualquer outra coisa usar o campo.
4. `RUN_FORMATS_V1.json` com os valores da seção 9 e leitura do registro SSCTR.
5. Estimativas por faixa e checagens E1–E5 (T5, T6).
6. Seletor determinístico, taper e contínuos (T4, T11).
7. Leitor de conclusão: status, regra de evidência r3a, parada, exposição, formato fixado, contrato Race Forecast (T6, T7, T8, T14, T17, T20).
8. Supressões, texto, mutantes, exemplos SSCTR (T9, T10, T12, T13).
9. Opcional: modo `EQUIVALENT` da seção 7.
10. Pedido de revisão (SSCTR fresco + QRE), um ciclo, freeze aditivo.

## 13. Fora do escopo e dependências

**Fora do escopo:** escadas nativas por distância (a progressão continua por passo de escada em minutos); progressivo entre domínios (exige o domínio "moderado", `LATER.RUN.STEADY`: decisão de escopo do Founder); tarefa familiar por distância (RWS-Q10); VO2 de novo, subidas, fartlek; entrega ao relógio e write-back HealthKit (pós-V1); F08, força e outros domínios.

**Pendências objetivas de implementação:**
1. **T3:** confirmar que o motor e a custódia preservam `formatHash`, `steps`, `stop` e `declared` em `actual`. Se não preservarem, é impedimento material: parar e reportar.
2. **Opção interna até `canonicalRecord`:** levar `readsCompletion` de `historicalStateOf` (que já recebe `options`) até `bindObservations`. Se algum chamador de `historicalStateOf` não repassar `options`, parar e reportar antes de inventar outro caminho.
3. **L30 a partir do intake:** o intake de hoje guarda só minutos; até Data acrescentar distância com data, ele não alimenta o L30 (comportamento correto, não bloqueio).

**Informação ao Founder (não bloqueia):**
- Cobertura nativa parcial em 5K e 10K (39–65%) e nenhuma no passo 0. Ampliar exige evidência ou revisão humana financiada.
- As salvaguardas da r3 restringem os contínuos por distância: só INTERMEDIATE+ com corridas leves recentes que qualificam; longão só com corrida recente de duração comparável; recuperação e shakeout por tempo; longão de maratona no teto de 180 min quase sempre por tempo; um longão muito lento torna o seguinte por tempo.
- Uma leitura de relógio um pouco curta agora precisa da resposta do atleta, com motivo, para contar como cumprida; uma falta acima de 9% precisa medir a parte que faltou. A declaração sem aparelho conta como conclusão, no nível mais baixo: **confirmado pelo Founder em 2026-11-13**, só para adesão ao plano, nunca para ritmo, recorde ou performance sem evidência adicional.
- Quem corre mais devagar que o próprio ritmo lento recente fica mais tempo que o planejado. Isso é limitado por regra (X-1, X-2), não por número: um número exigiria teto de tempo, evidência que não existe, ou revisão humana financiada.
- Observação do SSCTR, fora do escopo: na versão por tempo, o passo de 5 min do longão é aumento acima de 10% para longões abaixo de 50 min. Registrada como gatilho de revisão; não é decisão.

**Dependências de outros donos:**
- **Product:** fluxos de pergunta (ASK) e texto dos motivos de correção; texto da interrupção e dos status; como mostrar a duração estimada; recomendar a versão por tempo com calor, subida, vento, trilha ou esteira; expressão padrão.
- **Data / G03:** esquema dos quatro fatos (medida, declarada, confiabilidade, alvo cumprido com base), estados de qualidade, de-duplicação de corridas entre fontes, distância com data no intake; km planejado frente a executado.
- **Engenharia / QRE:** se a recalibração V1RC Q8 lê o indicador de parcial; descontar strides ao dimensionar contínuos; entradas de ritmo e histórico (P1, última corrida comparável, maior corrida em 30 dias) determinísticas a partir do registro; varredura de cobertura no candidato.
- **Antes da integração:** as pendências V1RC (Segurança do registro de evidências, leitura Founder/PCG da regra de tempo de chegada, texto de Product).
- **Governança:** V1_COACHING_AUTHORITY_READY = NO, INTEGRATION_READY = NO, F08_OPEN; fila em 235.
