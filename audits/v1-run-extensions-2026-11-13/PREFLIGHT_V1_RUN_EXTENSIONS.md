# V1 Extensions — Preflight de integração (RWS + RFC), 2026-11-13

**Autor:** Chief (Opus 5.5), somente leitura. **Para:** Fable 5.2. **Estado:** preflight **encerrado** pelo Founder (2026-11-13).

**Linha comum:**
- Branch `claude/v1-run-extensions`, worktree `.claude/worktrees/v1-run-extensions`.
- Parte de `c8104c1`, com `0010e7c` (RWS, fast-forward) e `9ffe163` (RFC, merge `155b4eb`).
- Os dois commits trazem só `audits/`.

**Handoffs na linha:**
- `audits/v1-run-workout-structure-2026-11-13/HANDOFF_RUN_WORKOUT_STRUCTURE.md`: r3 com r3a.
- `audits/v1-race-forecast-2026-11-13/HANDOFF_RACE_FORECAST.md`: r3 com `SSCTR-RFC-VALUES-r2`.

**Runtime lido:** `c8104c1`.

**Veredito:** compatibilidade suficiente para iniciar; nenhum impedimento material comprovado.
- Há **9 conflitos reais** (seção 4). Cada um é um **item verificável** pelo Fable, com resolução proposta e critério de prova.
- Nenhum conflito foi resolvido por implementação nesta sessão.
- Não houve conflito esportivo material comprovado; o SSCTR não foi convocado.
- O tratamento de `UNKNOWN` na previsão (V5) é proposta técnica e **depende da revisão SSCTR do candidato**.

## 0. Prioridades (verificar nesta ordem dentro de cada fase)

| P | Item | Conflito |
|---|---|---|
| 1 | Os cinco caminhos de leitura da conclusão | V1 (C4) |
| 2 | Persistência do formato histórico efetivamente prescrito | V2 (C5) |
| 3 | Crédito de aderência derivado da conclusão validada pelo motor | V3 (C6) |
| 4 | Exclusão de `UNKNOWN` da previsão, sujeita ao SSCTR | V5 (C7) |
| 5 | Composição única dos pontos de entrada | V4 (C2) |

## 1. Ordem de implementação e habilitação

| Fase | O quê | Base |
|---|---|---|
| 0 | **Feito:** linha comum criada (cabeçalho). Antes de qualquer código, verificar S1. | `155b4eb` + este relatório |
| A | **RWS completa** pelo plano do handoff (§12), com V1, V2, V4 (gancho), V6, V7 e V9. Revisão (SSCTR fresco + QRE), um ciclo, freeze próprio `V1RWS-1`. | linha comum |
| B | **RFC** sobre o resultado de A pelo plano do handoff (§9), com V3, V4, V5, V8 e V9. Revisão (SSCTR fresco, incluindo V5, + QRE), um ciclo, freeze próprio `V1RFC-1`. | A |

**Por que a RWS vem primeiro:** a RFC consome a execução da RWS (IC-1), e a RWS só precisa da RFC por um gancho inerte (IC-2, com `V1X-PACE-REVISION` desligado). Na ordem inversa, seria preciso editar a RFC já congelada para religá-la à RWS.

**Habilitação (registros SSCTR independentes, nesta ordem):**
1. `V1X-RUN-NATIVE`, depois da revisão A.
2. `V1X-RUN-FORECAST` e `V1X-PACE-INSIGHTS`, depois da revisão B.
3. `V1X-PACE-REVISION` por último, só com a IC-2 provada no ponto de entrada composto (I8) e na integração.

`V1X-RUN-DISTANCE` (modo EQUIVALENT) é opcional, em qualquer momento depois do nativo. Todas as fronteiras continuam exigindo os limites V1RC (`allowsRun`).

## 2. Pipeline único

Um só ponto de entrada para o produto: `src/v1-run-forecast-index.mjs` (B). Ele embrulha `src/v1-run-format-index.mjs` (A), que embrulha `v1-run-index.mjs` sem mudá-lo. Não existe um segundo embrulho sobre `v1-run-index.mjs`.

```
review ──► [RFC] tira paceRevisionResponse/record (registro próprio, como runEvidenceRecord)
       ──► [RWS] tira completionRead de toda observação (revisão + actualLedger) e as chaves próprias
             resolve formatHash no runFormatRecord carregado (V2) → recalcula completionRead (leitor puro)
             liga READS_COMPLETION (Symbol interno, V1/SC-6)
       ──► v1-run-index ──► v1-index ──► motor (bindObservations lê completionRead)  → runCalibration (V1RC)
       ──► [RWS] bandOf(semana, domínio) = gancho (padrão V1RC; [RFC] injeta a faixa efetiva só com V1X-PACE-REVISION)
             seletor → runSessions{…, execution} ; acrescenta runFormatRecord
       ──► [RFC] paceRevision, paceInsights, runForecast, a partir do ledger vinculado + runSessions.execution (dados, sem import)
saída  = chaves de v1-run-index intactas + runSessions + runFormatRecord + runForecast + paceInsights + paceRevision
```

Funções puras ficam nos módulos (`v1-run-format.mjs`, `v1-race-forecast.mjs`, `v1-pace-insights.mjs`). Os índices são finos e nenhum módulo da RFC importa a RWS.

## 3. Contratos compartilhados

- **SC-1 Conclusão, uma fonte.** "Concluída" = linha vinculada pelo motor com `actual.completed===true && partial!==true && conflicted!==true`, o mesmo predicado de `runRows` (`v1-run-calibration.mjs:153`).
  - O `actual.completed` cru nunca é reescrito.
  - O leitor nunca dá DISTANCE quando o relato diz `completed:false`.
  - A regra 2 da RFC ("the engine's reading") usa esse predicado, nunca o campo cru.
- **SC-2 Extensão para adesão.** A RFC lê só `runSessions[id].execution`. Acrescentar `extentKm`, a menor distância entre os fatos utilizáveis (a regra de histórico da RWS), e os pesos `w_s` das etapas do formato fixado.
  - DECLARED e CONFIRMED_CORRECTION em DISTANCE: crédito 1.
  - `UNKNOWN`: ver V5.
- **SC-3 Evidência de ritmo, um predicado.** `runRows ∧ comparableRun ∧ execution.paceEvidence!==false`. DECLARED, correção, esteira e POOR nunca entram em P1, Q8, Pace Insights ou revisão. A declaração conta para a adesão (SC-2) e nunca para a recalibração.
- **SC-4 Faixa, uma fonte.** `bandOf(semana, domínio)` serve ao seletor RWS e à classificação dos Insights. Por padrão é a faixa V1RC; a efetiva só entra com `V1X-PACE-REVISION`. A revisão vale a partir da virada da semana, então não há ciclo dentro da semana.
- **SC-5 Dose.** Minutos planejados = `prescription.durationMinutes` em todo lugar. Distâncias e km nunca entram em carga, gate ou rampa.
- **SC-6 Opções e chaves.**
  - A integração não passa opções.
  - Flags internas são `Symbol` exportados pelo módulo dono (precedente: `RESTART_FACTS`, `r6-intake.mjs:79`).
  - O ponto de entrada composto tira da revisão todas as chaves das extensões antes do motor (V9).
- **SC-7 Valores e fronteiras próprios.** `v1/RUN_FORMATS_V1.json` e `v1/RACE_FORECAST_EXTENSION_V1.json`, cada um com sha fixado e autoridade própria no padrão `runCalibrationAuthority`. Nunca mexer em `RUN_BOUNDARIES` (`v1-run-calibration.mjs:26`, arquivo congelado).
- **SC-8 Prefixos reservados.**

  | Extensão | Testes | Scripts | Registro de freeze | Evidências |
  |---|---|---|---|---|
  | RWS | `test/v1rws-*.test.mjs` | `scripts/v1rws-*.mjs` | `v1/RUNTIME_FREEZE_V1RWS_<n>.json` | — |
  | RFC | `test/v1rfc-*.test.mjs` | `scripts/v1rfc-*.mjs` (freeze, simulate) | `v1/RUNTIME_FREEZE_V1RFC_<n>.json` | `audits/v1-race-forecast-2026-11-13/evidence/` |

  O regex do V1RC (`/\/v1rc-[^/]+\.test\.mjs$/`, `v1rc-freeze.mjs:21`) não captura nenhum dos dois. O `test/v1rc-helpers.mjs` pode ser importado, não editado.

## 4. Conflitos reais: itens verificáveis

Cada item: conflito → evidência → resolução proposta → **critério de verificação** (o Fable só o marca resolvido com o teste verde).

**V1 (C4) — Cinco caminhos de leitura da conclusão. Prioridade 1, fase A.**
- *Conflito.* O RWS §5 cita três chamadas e trata `canonicalRecord` como alcançado só por `historicalStateOf`. No código, `canonicalRecord` (que chama `bindObservations` em `r6-adaptation.mjs:2503`) também roda em toda revisão por `viewMovedBy` (`:2301`) e `gapAnsweredBy` (`:2359`), com um `ctx` montado em `:600`, sem `options`.
- *Os cinco caminhos:*
  - a revisão (`:589`);
  - a gravação sob hold clínico (`:553`);
  - `viewMovedBy`;
  - `gapAnsweredBy`;
  - `historicalStateOf` (`:2480`).
- *Fora do escopo do conflito.* `historicalStateOf` não tem chamador em `src/`, só em testes.
- *Resolução.* `READS_COMPLETION` (Symbol) levado em `ctx` (`:600`) e no `ctx` de `historicalStateOf` (`:2481`) até as cinco vinculações. Só `r6-adaptation.mjs` muda.
- *Verificação.* I2: um 16 km cumprido em minutos < 0,9 × planejados é completo nos cinco caminhos; T16 da RWS (flag desligada = byte a byte igual) verde.

**V2 (C5) — Persistência do formato histórico efetivamente prescrito. Prioridade 2, fase A.**
- *Conflito.* Cada revisão revincula o registro inteiro (`:589`, `prior`), então o leitor precisa do formato de toda sessão nativa passada.
- *Por que recalcular falha.*
  - A faixa V1RC de uma semana passada lê linhas por `firstRecordedAt` (`v1-run-calibration.mjs:160`) e descarta as substituídas (`:153`).
  - Uma correção preserva o `firstRecordedAt` original (RWS §5).
  - Portanto, uma correção posterior muda a faixa recalculada: outro `formatHash`, ASK numa sessão já concluída e mudança retroativa de estado.
  - Além disso há um ciclo: faixa → `partial` → leitura → formato → faixa.
- *Resolução.* Registro carregado `runFormatRecord`:
  - append-only, como `runEvidenceRecord`;
  - cada formato emitido, com hash verificado, chave `sessionId` + `formatHash`;
  - o leitor resolve a partir dele; hash ausente → ASK (SSCTR r2);
  - atende também "taper lê o formato de pico do registro" (SSCTR r2);
  - é dado novo guardado → Segurança e Data na integração.
- *Verificação.* I4: depois de uma correção tardia, os formatos passados continuam resolvendo e o estado das semanas passadas não muda. T8 da RWS verde.

**V3 (C6) — Crédito de aderência derivado da conclusão validada pelo motor. Prioridade 3, fase B.**
- *Conflito.* A regra 2 da IC-1 (`sessionCredit.rules[1]`), lida ao pé da letra, usa o `actual.completed` cru. Um STOPPED aos 12 km com `completed:true` do cliente ganharia crédito 1 (contraria AD-1). O próprio texto SSCTR diz "the engine's reading".
- *Resolução.* SC-1.
- *Verificação.* I5: um STOPPED forjado nunca recebe crédito 1; T12 da RFC verde.

**V4 (C2) — Composição única dos pontos de entrada. Prioridade 5, fases A e B.**
- *Conflito.* Dois embrulhos concorrentes sobre `v1-run-index.mjs`: RWS §12 (`v1-run-format-index`) e RFC §6 (`v1-run-forecast-index`, "sobre v1-run-index"). A IC-2 também não tem onde se encaixar, porque o seletor RWS lê a faixa direto de `runCalibration` (RWS §4).
- *Resolução.*
  - Encadear (seção 2).
  - O T3 da RFC passa a comparar as chaves de `v1-run-format-index`.
  - Gancho `bandOf` em A, inerte (SC-4).
- *Verificação.* I1 (igualdade chave a chave com tudo desligado) e I8 (IC-2).

**V5 (C7) — `UNKNOWN` na previsão. Prioridade 4, fase B. Depende do SSCTR.**
- *Conflito.* A RWS diz que `UNKNOWN` "fica fora de qualquer cálculo" (§5, T20). A regra 5 da RFC (`sessionCredit.rules[4]`) daria crédito pelos minutos reais. Nenhuma das duas decisões SSCTR define o tratamento semanal de uma sessão `UNKNOWN`.
- *Proposta técnica (não é decisão esportiva).* `UNKNOWN` fica fora da previsão: sua distância e seus minutos nunca geram crédito. O tratamento semanal fica num único ponto nomeado do código (`unknownSessionCredit`), com as duas leituras implementáveis registradas:
  - **(a)** excluir a sessão dos dois lados da média semanal (numerador e minutos planejados);
  - **(b)** contá-la com crédito 0.
  - Valor provisório no candidato: (b), o lado conservador para a previsão (a borda lenta não muda), corrigível por correção posterior.
- *Revisão.* O SSCTR que revisa o candidato B **decide** entre (a), (b) ou outra leitura. Esta proposta não substitui o SSCTR, e a resposta dele prevalece sem ciclo extra de discussão.
- *Verificação.* I6 nos dois valores do ponto nomeado, e o pedido de revisão de B listando V5 explicitamente.

**V6 (C3) — Validação dos freezes sem alterar verificadores históricos. Fases A e B.**
- *Conflito.*
  - O T1 da RWS ("os dois freezes passam") e o T3 da RFC ("V1 198/198") são impossíveis na linha comum depois de A.
  - `r6-adaptation.mjs` é um dos 198 arquivos de `RUNTIME_FREEZE_V1_1.json`, e `preserved()` falha com qualquer mudança (`v1rc-freeze.mjs:27`, `:49`).
- *Resolução (governança do Founder, 2026-11-13).*
  - **Nenhum** contrato ou verificador de freeze original é alterado para aceitar a diferença: `v1fc-freeze.mjs`, `v1rc-freeze.mjs`, `RUNTIME_FREEZE_V1_1.json` e `RUNTIME_FREEZE_V1RC_1.json` ficam como estão.
  - A validação histórica roda sobre o **snapshot congelado**: `node scripts/v1rc-freeze.mjs --check 1` no worktree `v1-run-calibration` (`c8104c1`), e o V1FC no seu worktree. Na linha comum, depois de A, o check V1RC acusa a emenda, como é esperado, e não é gate de aprovação.
- *Verificador próprio da extensão* (`scripts/v1rws-freeze.mjs`), que declara a emenda autorizada:
  - (i) os 197 outros arquivos do registro V1 são byte a byte iguais aos hashes do registro V1;
  - (ii) `src/r6-adaptation.mjs` tem, como base, exatamente o hash que o registro V1 guarda e, como novo, o hash declarado no `V1RWS-1`, com o diff registrado;
  - (iii) os 30 arquivos do registro V1RC são byte a byte iguais;
  - (iv) os arquivos adicionados pela RWS conferem.
  - O `v1rfc-freeze.mjs` repete o mesmo para o registro `V1RWS-1` e não declara emenda nova.
- *Verificação.* I10.

**V7 (C1) — Prefixos.**
- *Conflito.* Os dois handoffs reservam `test/v1rf-*` (RWS §12; RFC §9.5), e a RFC usa `v1rf-freeze.mjs` e `v1rf-simulate.mjs`.
- *Resolução.* SC-8.
- *Verificação.* Nenhum arquivo `v1rf-*` na linha; cada verificador de freeze captura só o próprio prefixo.

**V8 — Admissão de ritmo (implícito em C5/R3; mantido como item).**
- *Conflito.* Com a emenda, um 16 km MEASURED feito rápido passa a alimentar P1/Q8 (`runRows`, `:153`). DECLARED e correção precisam continuar fora em todos os consumidores.
- *Resolução.* SC-3.
- *Verificação.* I3 e I4 (nunca evidência de ritmo, recorde ou melhora).

**V9 (C9) — O motor faz hash da revisão inteira.**
- *Conflito.* `r6-adaptation.mjs:597` (`inputHash:hash({programHash,review:input})`): qualquer chave de extensão que chegue ao motor muda a saída.
- *Resolução.* SC-6. O `completionRead` injetado só existe em relatos nativos.
- *Verificação.* I1, I7.

## 5. Riscos a verificar, dependências e pendências

**Riscos (confirmar por teste; não são bloqueios):**
- **R1 (T3).** `normalizeObservations` copia `o` inteiro e só valida `completed`, `minutes`, `sets`, `reps`, `loadKg` e `distanceKm` (`r6-provenance.mjs:105-106`). Deve passar. A custódia importa `v1-index` (`custody.mjs:11`) mas aceita um motor injetado (`custody.mjs:51`): testar com o ponto de entrada composto injetado.
- **R2 Identidade de replay.** Os `inputHashes` incluem o `completionRead` injetado (`r6-provenance.mjs:110`, `:131`). Regra: **um registro, um ponto de entrada**.
- **R3 Checagem (a) da RFC.** O `runCalibrationOf` por semana sem futuro precisa incluir o caso de uma correção gravada depois do início da semana (mesmo mecanismo do V2). Se a faixa passada se mover, a RFC usa o valor registrado ou para (S6).
- **R4 Voto Q8 de ≥ 5 min.** Vem dos `workMinutes` de planejamento (`v1-run-calibration.mjs:181`). Insights e revisão usam o mesmo predicado, nunca segundos estimados ou reais de repetições por distância.

**Dependências de integração:**
- A custódia guarda só os campos do motor (`custody.mjs:19`). `runEvidenceRecord`, `runFormatRecord` e o registro de `paceRevisionResponse` precisam de armazenamento (Data + Segurança).
- A integração não passa opções.
- Mapeamento HealthKit → `measurement`, `gpsQuality`, voltas e segundo arquivo (Data/G03).
- Fluxos de ASK e texto (Product).

**Pendências para uso real (não bloqueiam):**
- D1 (regra "tempo de chegada / ganho de forma") e D2–D7 da RFC.
- Registros SSCTR habilitadores sobre os bytes implementados.
- R-11 e as condições V1RC.
- V1_COACHING_AUTHORITY_READY = NO; fila em 235.

## 6. Testes de integração indispensáveis (além dos T de cada handoff)

| # | Teste |
|---|---|
| I1 | Com todas as fronteiras novas desligadas: ponto de entrada composto = `v1-run-index`, chave a chave, nas 25 jornadas V1RC + fuzz. Com a RWS ligada e sem relato nativo: igual, mais `runSessions`. |
| I2 | 16 km cumpridos em minutos < 0,9 × planejados: completa nos cinco caminhos (V1); crédito RFC 1; entra em P1 se MEASURED. |
| I3 | 16 km DECLARED: completa e crédito 1; fora de P1, Q8, Insights e revisão; nunca recorde nem melhora. |
| I4 | CONFIRMED_CORRECTION em linha posterior: completa e crédito 1; fora do ritmo; os formatos passados continuam resolvendo (V2) e o estado das semanas passadas não muda. |
| I5 | STOPPED aos 12 km com `completed:true` e `completionRead: DISTANCE` forjado (na revisão, no registro e nas opções): incompleto; crédito pela extensão < 1. |
| I6 | `UNKNOWN`: incompleto; sem crédito por distância ou minutos; nos dois valores de `unknownSessionCredit` (V5); fora do ritmo; uma correção posterior reclassifica. |
| I7 | Replay exato pelo ponto de entrada composto = `EXACT_REPLAY`. |
| I8 | Revisão de ritmo ligada por registro de desenvolvimento: faixa do seletor = faixa exibida na mesma semana, efetiva só na virada (IC-2). Desligada: as faixas V1RC. |
| I9 | Ordem do registro irrelevante; linhas com `firstRecordedAt` ≥ corte não mudam a saída da semana (T5 da RFC aplicado ao ponto de entrada composto). |
| I10 | **Freezes (V6):** os verificadores históricos verdes no snapshot `c8104c1`, sem edição; `v1rws-freeze --check 1` verde com a única emenda declarada; depois de B, `v1rfc-freeze --check 1` verde com `V1RWS-1` preservado. |

## 7. Pontos de parada objetivos

- **S1.** Base vermelha: suíte ≠ 1334/1334 na linha comum, ou os verificadores históricos falham no snapshot `c8104c1`.
- **S2.** T3 falha: o motor ou a custódia descartam campos novos de `actual`.
- **S3.** A emenda exige outro arquivo de `src/` além de `r6-adaptation.mjs`, ou a saída com a flag desligada não é byte a byte igual.
- **S4.** Um dos cinco caminhos (V1) não recebe a flag sem mudar uma assinatura fora de `r6-adaptation.mjs`.
- **S5.** I4 falha: a resolução de formatos passados não fica determinística mesmo com `runFormatRecord`.
- **S6.** Alguma checagem (a)–(d) da RFC falha (§9.1 da RFC; com a (a) estendida pelo R3).
- **S7.** Divergência de um exemplo do SSCTR: é achado, nunca ajuste.
- **S8.** Necessidade de editar `v1-index`, `v1-run-index`, `v1-run-calibration`, os valores V1RC, os registros ou verificadores de freeze existentes, ou os pacotes encerrados.
- **S9.** Contradição demonstrada entre um exemplo da RWS e um da RFC: só aí se convoca o SSCTR fora das revisões já previstas.
- **S10.** Um ciclo corretivo por extensão; depois, fechar com bloqueio nomeado.

## 8. Instruções para começar (Fable 5.2)

1. Trabalhar em `.claude/worktrees/v1-run-extensions` (branch `claude/v1-run-extensions`). Ler este relatório, depois os dois handoffs (cabeçalho).
2. Verificar S1:
   - `npm test` em `CoachingCore/` na linha comum;
   - os verificadores históricos no worktree `v1-run-calibration`.
3. Fase A pelo plano da RWS (§12), resolvendo nesta ordem:
   - V1 (no passo 3b);
   - V2 (no passo 7);
   - V4: o gancho `bandOf`;
   - SC-2: `extentKm` e os pesos em `execution`;
   - V6, com o verificador `v1rws-freeze`;
   - V7, V8 e V9.
4. Freeze `V1RWS-1`; revisão; um ciclo.
5. Fase B pela RFC (§9 dela), resolvendo V3, V4 (embrulhar `v1-run-format-index`), V5 (ponto nomeado, provisório (b), listado para o SSCTR), V8, V9 e V6 (`v1rfc-freeze`). `V1X-PACE-REVISION` nasce desligado.
6. I1–I10 no fim de B; suíte inteira uma vez; freeze `V1RFC-1`.
7. Não tocar: os branches `claude/v1-run-workout-structure` e `claude/v1-race-forecast`, os freezes e verificadores existentes, o Figma e as decisões esportivas.
