# Application Data Contracts — CoachingCore ↔ aplicativo (VF-APP-0)

**Status:** contrato DERIVADO e candidato, **não canônico** e não julgado. Não substitui as fontes que reúne; só diz qual vale para o app e onde estão as lacunas. As autoridades de produto e de experiência continuam onde `canon/CANONICAL_INDEX.md` as põe. Nenhuma tela, texto ou componente é fixado aqui.

**Fontes reutilizadas, que continuam vinculantes:**
- `audits/v1-coaching-integration-boundary-2026-11-09/INTEGRATION_BOUNDARY_V1.md` (V1CIB): operações, estados do cliente, códigos de erro, adoção, ids e relógio, proteção de dados.
- `audits/v1-athlete-data-foundation-2026-11-13/ATHLETE_DATA_FOUNDATION.md` §2–§3: formas de entrada e hierarquia de fontes.
- `audits/v1-run-extensions-2026-11-13/phase-b/PHASE_B_CLOSURE.md` §5: o que a resposta traz e o que o app nunca faz.
- `audits/v1-run-extensions-2026-11-13/e01-patch/IOS_RUN_REPORT_INTEGRATION_CONTRACT.md`: duas vozes por execução.

**Executado por:** `harness/lib.mjs` (envelope e projeções) e `harness/journey.mjs` (29 verificações).

## 1. Camadas e quem é dono de quê

| Camada | Dono de | Nunca faz |
|---|---|---|
| SwiftUI | apresentação, navegação, captura, estado de UI, cache de views para o primeiro quadro | escolher treino, progressão, dose, interferência, triagem, calibração, previsão, insight ou exposição; montar campo do motor |
| Camada de domínio (JS) | o envelope do registro, ids e relógio, idempotência, reconciliação do registro (custódia V1CIB), projeções APP-VIEW-0 | decidir algo que o motor não decidiu |
| Motor (`v1-strength-index.mjs`, sem opções) | toda decisão esportiva, todo estado de indisponibilidade | — |

O app envia **fatos do atleta**: o que ele fez e disse. Recebe **projeções**. A regra do V1CIB continua: campos do motor (`asOf`, `weekIndex`, `event`, `actualLedger`, `referenceState`, `athleteModel` e o resto de `ENGINE_OWNED_FIELDS`) nunca vêm da UI.

## 2. Entradas: o que o motor suporta hoje

Legenda: **S** suportado como está · **T** suportado com transformação obrigatória no cliente · **L** lacuna, sem contrato (não inventar campo).

| Dado (lista da missão) | Forma no motor | Estado | Regra / lacuna |
|---|---|---|---|
| Onboarding (envelope) | `R6-INTAKE-1`: `athlete`, `schedule`, `asOf`, `startDate`, `weeks` (4, 8, 12 ou 16), `timezoneOffsetMinutes` | S | Fora de 4/8/12/16 → `INVALID_INPUT` (`weeks.4/8/12/16`, observado). Sem dias de treino → `INVALID_INPUT` com `missingInputs` (passo 2 da jornada) |
| Perfil | `athlete.ageYears` (18–80) ou `ageEligible`; `eligibility{status, assessedAt, pain…clinicalConcern}` | S | Desconhecido = ASK, nunca liberação. `weightKg`, `heightCm` e `sex` são só contexto (`doseConsumer:false`) |
| Objetivos de corrida e de força | `goals.run` (`PERFORMANCE`, `{kind:'RACE', event{kind, date, timeGoalMinutes?}}`), `goals.strength` | S | O tempo-meta é só contexto e nunca vira evidência |
| Experiência por modalidade | `runTrainingMonths`, `strengthTrainingMonths` | T | Enviar **só os meses**: a categoria junto apaga os meses (G5). Uma faixa respondida vira o seu limite inferior |
| Histórico e referências | `performanceAnchors[]{kind, distance, seconds, date, measurement, tolerated, rpe?}`; `knownExercises[]` (séries de trabalho atuais, até 28 dias) | T | Sem `date`, `measurement` ou `tolerated`, a evidência é rejeitada ou vira só histórico (G3). Nunca 1RM (PD-3). `history[]` do HealthKit fica fora desta missão |
| Equipamentos | `athlete.equipment[]` | S | Vocabulário do catálogo (`BARBELL`, `RACK`, `BENCH`, `DUMBBELLS`, …) |
| Disponibilidade semanal | `schedule.runDays`, `strengthDays` (0–6), `runMinutes`, `longRunMinutes`, `longRunDay`, `strengthMinutes` | S | **L: minutos por dia não existem.** Há um valor por esporte, mais o longão |
| Manhã, tarde e noite, com várias escolhas | `schedule.runTurn` e `strengthTurn` ∈ {`AM`, `PM`}, um por esporte | **L** | Não existe "noite", nem mais de um turno, nem turno por dia. Mapear tarde e noite para `PM` é uma transformação com perda: só com decisão de Product e SSCTR sobre o que o turno muda no motor (ordem e espaçamento no mesmo dia) |
| Corrida e força no mesmo dia | dias em comum; `sameTurnConfirmed`; `temporaryPreference` (`RUN` ou `STRENGTH`) | S | Turnos diferentes não geram pergunta |
| Respostas de execução | observação `{eventId, sessionId, occurrenceDate, actual{completed, minutes, distanceKm?, measurement?, exercises[{id, sets[{reps, load{value, unit, convention}, rir}]}]}, response{performance, recovery, effort, nextDayFunction}}` | T | **Duas vozes por execução** (contrato iOS): o relato do aparelho só com medidas e o relato do atleta sem id de atividade. A origem vem do canal, não do corpo |
| Percepção de esforço | `actual.rpe` (corrida), `rir` por série (força) | S | `workoutEffortScore` da Apple não vira `rpe` (PD-1) |
| Recuperação | `response.recovery`, `nextDayFunction` | S | **Gate E-1 aberto:** uma correção do aparelho apaga a resposta do atleta (§6) |
| Mudanças de agenda | `SCHEDULE_CHANGE{changes}` / `UNAVAILABLE_DAY{unavailableDates}` | S | Na custódia, a mudança espera confirmação do atleta (`CONFIRMATION_KINDS`) |
| Correções de registro | `correctionOf` + `correctedAt` (motor); `supersedes` (evidência V1RC); `declared` (RWS) | S | Cada correção é do seu autor e repete tudo o que ele diz. O original fica, marcado como `superseded` (passo 12) |
| Retorno após pausa | `RETURN_AFTER_PAUSE{interruption{startDate, endDate\|days, reasonCategory}}`; reinício com `athlete.pause{reasonCategory, weeks}` | S | Sem `reasonCategory`, o reinício pergunta (observado). **Gate RESTART aberto** (§6) |
| Resultado de prova declarado | `runEvidence` (V1RC) | S no motor, **L na custódia** | A custódia V1CIB não aceita `runEvidence` (passo 15) |
| "Não estou 100%", sinais, prontidão | `NOT_FEELING_100{wellbeing}`, `WELLBEING_CHECK`, `READINESS_DECLARATION{readiness}` | S | Um sinal de alerta dá `CLINICAL_HUMAN_REQUIRED`; só a declaração de prontidão libera (passo 13) |

## 3. O envelope do registro (VF-APP-RECORD-ENVELOPE-0)

O estado canônico de um atleta no aparelho. **Fonte da verdade: o que o motor devolveu por último.** A UI não edita o envelope.

| Campo | Origem | Canônico? | Regra |
|---|---|---|---|
| `schema`, `engine` | camada de domínio | sim | `engine` = `V1_STRENGTH_ENGINE`. Um envelope de outro motor é **recusado** (`ENVELOPE_OF_ANOTHER_VERSION`): a migração é sempre explícita |
| `version` | camada de domínio | sim | Inteiro, +1 por resposta guardada. Concorrência otimista (V1CIB `expectedVersion`) |
| `program` | `generateProgram` / `proposal` / `restartProgram` | sim | O plano em vigor; uma proposta aplicada pelo motor substitui o anterior. `program.hash` identifica a versão do plano |
| `actualLedger` | `r.actualLedger` | sim | Só cresce, ou ganha uma anotação de correção (a reconciliação da custódia aplica isso) |
| `referenceState`, `athleteModel` | `r.referenceState`, `r.updatedModel` | sim | Devolvidos como guardados |
| `runEvidenceRecord`, `runFormatRecord`, `runHistoryRecord` | as respostas das extensões | sim | Devolvidos como guardados em toda revisão. **A custódia V1CIB não os guarda hoje** (lacuna L-APP-01) |
| `decisions[]` | camada de domínio | sim (registro das decisões) | `{eventId, kind, asOf, status, action, reason, programHash, guidance?}`, sem texto livre do atleta |
| `presentation` | a última resposta | **não, é cache** | `runSessions`, `runForecast`, `paceInsights`, `paceRevision`, `strengthExtension`, `strengthExposure`, status. É refeito pela próxima resposta e marcado com `asOf` e o motor |

**Persistência.** O envelope é escrito como JSON num arquivo temporário e renomeado, com o digest ao lado. Um digest que não confere dá `DIGEST_MISMATCH`, e nada é planejado em cima. Esse digest detecta acidente, não adulteração: a integridade contra adulteração é o HMAC da custódia (ADR §5).

**Tamanhos medidos:** 0,37 MB depois de uma semana, 1,1 MB depois de um plano de 16 semanas com 95 linhas. Stringify e parse de 4 ms cada, em laboratório.

**Reconstrução.** Um processo novo restaura o envelope e mostra a primeira tela sem chamar o motor. A próxima revisão dá exatamente a mesma resposta e o mesmo envelope que a continuação em memória (passo 11).

## 4. Saídas: projeções APP-VIEW-0

A resposta inteira tem 0,2 a 1,2 MB, e o programa sozinho 234 KB. A UI nunca a recebe: recebe estas projeções, calculadas dentro da camada de domínio. **Elas só reformatam; nenhuma decide.** A visão de plano é a `planView` do V1CIB, reutilizada.

| View | Conteúdo | Medido |
|---|---|---|
| `TODAY` | `state` (os estados do cliente V1CIB), `sports.RUN\|STRENGTH.state`, `hold`, `question`, sessões de hoje como linhas (`id, date, sport, role, turn, status, executable, projected, minutes, expression \| exercises`), totais da semana | 0,46 KB |
| `WEEK` | uma linha por sessão da semana | 1,1 KB |
| `SESSION` (corrida) | `expression` (`NATIVE` ou `TIME`), `formatHash`, `blocks`, `estimate`, `dose`, `unavailable`, `provisional`, `instructions` da camada de formatos; sem ela, a prescrição de tempo do motor como está | 1,2 KB |
| `SESSION` (força) | por exercício: `id, role, pattern, laterality, sets, reps, rir, restSeconds, load{mode, value?, unit, convention}, equipment, instructions` | 1,0 KB |
| `INSIGHTS` | `forecast{status, reason, shown, observed, plan, basis, raceWeek, availableFrom}`; `paceInsights{status, domains[d]{state, id, action}}`; `paceRevision` (sempre `INERT`); `strengthExposure{status, reason, descriptiveOnly, planned, executed}` | 1,9 KB |
| `DECISION`, `HISTORY`, `STATUS` | `decision`, `historyView` e `status` do V1CIB | — |

**Semântica de ausência (vale para todas):**
- Todo bloco começa por `status`. O app lê o status antes de qualquer número.
- `null` quer dizer "não se aplica neste estado". Nunca zero, nunca "nada a fazer".
- Faixa de previsão só pelo que está em `shown`; nunca o central sozinho (PHASE_B §5, 1 a 6).
- `HOLD` / `CLINICAL_HUMAN_REQUIRED`: nenhuma prescrição sai (`prescription:null`, nada `executable`). A previsão dá `UNAVAILABLE` com `reason:'HOLD'` e a exposição dá `NOT_APPLICABLE` com `NO_PRESCRIPTION` (passo 13).
- `UNSUPPORTED`: o motor não decide. Pode ser plano de outra versão ou **autoridade de habilitação expirada** (gate AUTHORITY_EXPIRY). O app mostra indisponibilidade técnica, nunca descanso (V1CIB §3).
- Erro técnico → `INTEGRITY_FAILURE` ou `OPERATIONAL_ERROR` (V1CIB). Nunca um dia vazio.
- A exposição de força é **só descritiva** (`descriptiveOnly:true`). Antes de qualquer tela, revisão de dados G03 (condição do registro SSCTR).

## 5. Versões e continuidade

- **Motor:** `V1_STRENGTH_ENGINE` = `COACHINGCORE-V1-1+V1X-RUN-CALIBRATION-1+V1X-RUN-FORMATS-1+V1X-RACE-FORECAST-1+V1X-STRENGTH-1`. Os sha256 dos valores vêm em cada bloco (`strengthExtension.sha256`, `runForecast.valuesSha256`, …).
- **Plano de outra versão:**
  - um plano construído sem as regras de força é revisado sem elas e diz isso (`PLAN_BUILT_WITHOUT_THE_RULES`, passo 14);
  - um plano construído sob outras regras → `UNSUPPORTED`, exceto uma resposta clínica, que sempre passa.
  - A migração de planos anteriores às regras de força é condição aberta dos registros.
- **Envelope de outra versão:** recusado na restauração. A migração é um passo explícito, com teste próprio; nunca uma leitura tolerante.
- **Esquemas:** `VF-APP-RECORD-ENVELOPE-0` e `VF-APP-VIEW-0`. Campo novo = versão nova; campo removido = migração.

## 6. Lacunas reais (com dono)

| Id | Lacuna | Dono | Menor resolução |
|---|---|---|---|
| L-APP-01 | A custódia V1CIB não guarda `runEvidenceRecord`, `runFormatRecord` nem `runHistoryRecord`, e chama `v1-index.mjs` por padrão (é G7, mais o roteamento de todo plano pelo ponto de entrada novo, condição dos registros de força) | Engineering + Security | Estender o documento da custódia com os três registros, sob o mesmo selo, e injetar `v1-strength-index.mjs`. Mudança em `src/boundary/` = decisão do Founder sobre freeze |
| L-APP-02 | A custódia não aceita `runEvidence` (resultado de prova declarado) | Engineering + Security | Incluir em `CLIENT_REVIEW_FIELDS`, com a mesma recusa de campos do motor |
| L-APP-03 | O turno só aceita AM/PM, um por esporte: sem noite, sem várias escolhas, sem turno por dia | Product + SSCTR | Decidir se AM/PM basta. Se não basta, é mudança de motor |
| L-APP-04 | Sem minutos por dia | Product + SSCTR | Como L-APP-03 |
| L-APP-05 | Não há revisão "só leitura": atualizar a previsão do primeiro dia da semana exige uma revisão (`WEEKLY_REVIEW` sem relatos), que é um evento do registro | Engineering + SSCTR | Decidir se o app chama essa revisão no primeiro acesso da semana (é o que os testes do motor fazem) ou se o motor precisa de uma leitura sem evento |
| L-APP-06 | Gate **RESTART**, observado: depois de um reinício, o plano novo reusa os ids de sessão do anterior (`w0-run-d1`, …). O primeiro relato do plano novo não ganha linha própria, e a linha do plano anterior com o mesmo id fica `conflicted` | Founder (é mudança no motor congelado) | Identidade de sessão por plano, num freeze sucessor. Até lá, nenhum reinício com atleta real |
| L-APP-07 | Gate **E-1** e QRE-RWS-F-01 (duas vozes e fontes conflitantes): continuam como no contrato iOS §6; esta missão não os reproduziu de novo | Founder + SSCTR + QRE | Teste de resultado do adaptador, exigido pelo contrato iOS |
| L-APP-08 | Expiração dos registros de habilitação (R7-B0 `review_by: 2027-04-30`): depois dela o motor falha fechado | Founder + SSCTR | Calendário de renovação antes da data; um estado do app para "o treinador está indisponível nesta versão" |
