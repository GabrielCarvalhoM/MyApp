# CCP-ONB-1 · Campos do onboarding que o motor já lê (#109)

**Decisão:** Founder, issue #109, comentário 7227378946 (27/11/2026): "APROVADO — Opção A, com revisão técnica obrigatória por campo".
Condições: experiência canônica do Figma preservada; nenhum dado inventado, nenhum default esportivo, nenhuma mudança silenciosa em regra
congelada; validar separadamente contratos, esporte único, iniciantes sem histórico, objetivos, preferências e critérios de segurança; Apple
Saúde só com consentimento explícito e sem bloquear o uso local; SSCTR + QRE, testes de contrato e integração A/C antes de concluir.

**Processo:** contrato paralelo §11 (`audits/v1-parallel-foundation-2026-11-24/PARALLEL_IMPLEMENTATION_CONTRACT.md`), aplicado pela integração
na branch `claude/v1-ios-integration-i109-ccp-onb` (base `6bc43620`). Fonte de campos: spec #101 §6
(`F-ONBOARDING-FIGMA.md`, worktree C, só leitura). Acréscimos do coordenador a partir das revisões do PR #119 (QRE P1, QRE P3-8, SSCTR C5): §X.

**Versões:** `CoachingContract.version` RM-ABC-CONTRACT-1 → **RM-ABC-CONTRACT-2**; `PROJECTIONS_VERSION` RM-APP-PROJECTIONS-1 →
**RM-APP-PROJECTIONS-2** (a fachada mudou: `weekPlan().marathon`). CoachingCore: **nenhum byte alterado**. Bundle de produção de A reconstruído
(`build/build.sh`): 108/108 fixtures compartilhadas reproduzidas byte a byte pela fachada de produção.

## 1. Regra de compatibilidade (aditiva)

- Todo campo novo é opcional e **omitido quando `nil`** (`encodeIfPresent`). Campos que passaram de obrigatórios a opcionais (`weeks`, meses de
  treino, `recent.*`, campos de agenda de cada esporte) continuam sendo enviados exatamente como antes quando têm valor.
- Prova: `baseline-intakes-before-ccp.json` foi capturado **antes** da mudança (três intakes do contrato antigo) e
  `OnboardingIntakeTests.testEarlierEncodingsAreUnchanged` exige o mesmo objeto JSON hoje. Regenerado de `6bc43620` numa worktree descartável
  (QRE P3): idêntico byte a byte, sha256 `ac550fe4…9915`; comando e teste em `baseline-regeneration.txt` e `baseline-dump-test.swift.txt`.
- A codificação escrita à mão de `AthleteIntake` não perde nada: `testAthleteIntakeCodingCoversEveryStoredProperty` (Mirror) exige uma
  CodingKey para cada propriedade armazenada exceto `specialPopulationNotStated`, e todas elas num intake totalmente preenchido. Os conjuntos de chaves de
  `RequestSchemaTests.testIntakeCarriesEverySafetyKey` ficaram intactos.
- Fonte Swift: os inicializadores existentes aceitam as mesmas chamadas (parâmetros novos com padrão `nil` no fim; `Int` → `Int?` aceita `Int`).
  Leitura de `RunCalibration.goal` e `WeekPlanProjection.marathon` é opcional: uma resposta antiga decodifica.

## 2. Campo a campo (escrita)

Caminhos do motor em `CoachingCore/src/r6-intake.mjs` salvo indicação. "Teste" = caso em `OnboardingEngineReplayTests` (Swift → fronteira real →
motor), `OnboardingIntakeTests` (contrato) e `OnboardingFieldsHostTests` (host de produção A).

| Campo (Swift → JSON) | Figma | Motor lê (arquivo:linha) | Codificação | Ausente / `nil` | Teste |
|---|---|---|---|---|---|
| `AthleteIntake.knownExercises: [KnownExercise]?` → `athlete.knownExercises[{id,sets,reps,rir,load{value,unit,convention}}]` | 26 `836:3194` | `knownExercise` :52–63; `toKilograms` :44; dose só com `current/familiar/tolerated/observedAt≤28d` :37,:61–62; `loadHints` `r6-program.mjs:56`, linha FIRST_ESTABLISH `r6-program.mjs:523` | `id` do catálogo `r7b-repertoire.mjs`; carga reutiliza `LoggedLoadEntry` (kg/lb + convenção de `LOAD_CONVENTIONS`); `sets/reps/rir/load` opcionais | `nil` = tela não mostrada ou "Não sei minhas cargas"; dose desconhecida omitida (nunca 0); linha sem carga = exercício familiar sem carga | Também muda **qual exercício é escolhido**: o exercício listado vira familiar e passa à frente (F1 × C0: `back-squat` no lugar de `goblet-squat`, `barbell-row` no lugar de `db-row`). F1 (HINT 90/60/50, `leg-press` sem carga, agachamento ESTABLISH), `testNewFieldsEncodeAtTheEnginePaths` |
| `GoalEvent.timeGoalMinutes: Double?` → `goals.run.event.timeGoalMinutes` | 05 `835:2301` | :112 (10–400, fora vira `null` sem erro), incerteza :208, contexto do maratona :260 | minutos (min + s/60), ex. 44,5 | `nil` = "Seguir sem meta" | F2 (44,5 lido; `readings.runCalibration.goal` 2670 s, `usedForPace:false`) |
| `TrainingSchedule.temporaryPreference: TemporaryPreference?` → `schedule.temporaryPreference` `RUN`/`STRENGTH` | 07 `835:2400` | :227; `r6-program.mjs:70` → `chooseBalanced` `r6-balanced.mjs:94` | Corrida primeiro → `RUN`; Força primeiro → `STRENGTH` | `nil` = "Equilíbrio" (o motor não tem terceira palavra) ou não perguntado. **Só desempata** opções com o mesmo dano no pior caso (`chooseBalanced`); não protege um esporte de forma geral — a cópia de 07 não pode prometer isso | F3 ×3 |
| `TrainingSchedule.runTurn/strengthTurn: String?` → `schedule.runTurn/strengthTurn` `AM`/`PM` | 09 `862:2271` | :143–146 | Manhã → AM; Tarde, Noite → PM (decisão D10 já registrada) | `nil` omitido: em dia compartilhado o motor planeja em sequência e pede confirmação (`SHARED_DAY_TURN_UNKNOWN`, `BACK_TO_BACK_CONFIRMATION` `r6-program.mjs:1485`), sem bloquear | F4 shifts-not-answered |
| `TrainingSchedule.sameTurnConfirmed: Bool?` → `schedule.sameTurnConfirmed` | `838:4011` "Os dois no mesmo turno, um depois do outro" | :269 (`===true`); `r6-program.mjs:1485` | `true` | `nil` = não respondido (nunca `false` por padrão) | F4 same-shift-confirmed (sem `BACK_TO_BACK_CONFIRMATION`) |
| Turno **por dia** (09b) | 09b `862:2544` | **não existe no motor** (um turno por esporte) | — | — | **Precisa de mudança de motor** (§4) |
| `AthleteIntake.coaching: IntakeCoaching?` → `athlete.coaching.profile` | 15 `836:830` | :230 → `canonicalCoaching` `v1-coaching.mjs:39`, `COACH_PROFILES` :12 | Conservador/Equilibrado/Exigente → `CONSERVATIVE`/`BALANCED`/`DEMANDING`; volume e dificuldade não perguntados, não enviados | `nil` = caminho padrão do motor (sem chave `coaching`) | F5 ×3 (Conservador e Exigente geram as divulgações do motor) |
| `PerformanceAnchor.conditions: [RunCondition]?` → `performanceAnchors[].conditions` `HEAT`/`HILLY` | 24 `836:3049` "Condições" | `readEvidence` `v1-run-calibration.mjs:106`; `CONDITIONS_NOT_COMPARABLE` :228 (`RUN_CALIBRATION_EXTENSION_V1.json evidence.excludedConditions`) | "Normais" → `[]` | `nil` = não perguntado. "Calor ou subida" (um item, dois códigos): **não codificado** (§4, D20) | F6 (a-heat REJECTED CONDITIONS_NOT_COMPARABLE; a-pista CAPACITY) |
| "Teste" em "Como foi medido" | 24 | `MEASUREMENT_UNKNOWN` `v1-run-calibration.mjs:229` | sem campo novo: `kind: TIME_TRIAL`, `measurement` **omitido** (o Figma não diz como foi medido) | o resultado fica fora da calibração | F6 (a-teste REJECTED MEASUREMENT_UNKNOWN). Ver §4: o texto de 23 promete faixas de ritmo |
| `OnboardingAnswers.weeks: Int?` | 04/08 (derivado da data, D03) | :85 (`weeks??12`) | com prova: 4/8/12/16 pela data | `nil` **só sem prova**: o motor planeja as suas 12 semanas. Com prova e sem semanas: `IntakeHold.raceWithoutWeeks`, nada é enviado (salvo sinal clínico, que o motor tria primeiro) | G1, S1, S2 (12 semanas); `testRaceWithoutWeeksIsHeld`; K-*-race-no-weeks |
| `TrainingSchedule.runMinutes/longRunMinutes/longRunDay/strengthMinutes: Int?`; `runDays/strengthDays` `[]` | 09–11 | :139–153 (`longRunDay` fora de `runDays` = erro :152; minutos exigidos só com dias :149–150) | "Só força": `runDays: []` e nenhum campo de corrida; "Só corrida": idem para força | omitidos; sem sentinela | S1, S2, `testWhatWasNotAskedIsOmitted` |
| `AthleteIntake.runTrainingMonths/strengthTrainingMonths: Int?` | 22, 25 | :130–138 | limite inferior da faixa (D13) | `nil` = esporte não perguntado; `0` para "Nunca corri/treinei" **e para "Já corri e parei"** (SSCTR D12: meses do período contínuo atual; B1) | S1, S2, B1, B2 |
| `RecentTraining.*: Int?` | 21, 21b, 25 | :154–156; exposição ausente → estabelecimento conservador :193 | o que foi respondido | `nil` omitido (SSCTR D12: nunca zerar o desconhecido). "Já corri e parei" com 1–3 dias envia só `runDaysPerWeek` | B1 (2 dias, minutos `null`, `SAFE_CONSERVATIVE_ESTABLISHMENT`, WALK_JOG); B2 (zeros verdadeiros) |
| `AthleteIntake.specialPopulationNotStated: SpecialPopulationGap?` (não é chave do motor) | 27 `836:3299` item 7 e caixa não marcada | :91 (só 4 códigos; ausente/vazio = nenhum; código desconhecido ignorado) | ver §X.2 | ver §X.2 | `testSpecialPopulationNotStated`, K-* |

## 3. Leitura (o que o motor já produz)

| Leitura | Figma | Fonte | Tipo Swift | Ausente | Teste |
|---|---|---|---|---|---|
| Meta × estimativa | 31 "Sua meta … está dentro" | `goalOf` `v1-run-calibration.mjs:469`, em `readings.runCalibration.goal` :607 (já ia na apresentação; só faltava o tipo) | `RunCalibration.goal: AthleteGoalReading?` (`relation` INSIDE/FASTER/SLOWER_THAN_RANGE, NO_CURRENT_ESTIMATE; `isPrediction:false`, `usedForPace:false`) | `nil` = sem meta | F2, fixture `onb-time-goal-presentation` |
| Critérios do bloco de maratona | 31 `838:1478` / `838:1568` | `canonical.goals.contextEvent.unmet` (r6-intake :244–262) = `MARATHON_PREPARATORY_PLAN.unmet` (`r6-program.mjs:171`) | `WeekPlanProjection.marathon: MarathonPlanReading?` (`status` BLOCK/PREPARATORY, `date`, `unmet[{id,value,needed}]`, `disclosures`) | `nil` = plano sem maratona | G2, G3, fixtures `onb-marathon-*-week-plan`, `projections.test.mjs` |
| Divulgações do maratona (SSCTR C5) | 31 | `r6-program.mjs:171` (preparatório), :173 e `MARATHON_PROJECTION` (bloco) | `MarathonPlanReading.disclosures[{id,blocking,detail,options,projectedLongRunMinutes?}]` | `nil` = projeção anterior | §X.3 |
| "Três decisões do treinador" | 34 `837:1239` | **não existe**: `explanation` por sessão, em inglês, quase sempre `null` | — | — | §4 (D26 continua aberta) |

O BLOCK não lista critérios atendidos (o motor não os lista): a tela não pode desenhar "6 de 6" a partir do motor.

## X. Acréscimos das revisões do PR #119

### X.1 Sinal clínico sempre chega ao motor (QRE P1)

Antes, um rascunho retido (esporte único, sem prova, item combinado) nunca chegava ao motor, e o sinal clínico não era encaminhado. O motor
responde `CLINICAL_HUMAN_REQUIRED` antes de qualquer campo faltante ou escopo (`r6-intake.mjs:274`) e a custódia não grava nada fora de
`PROPOSED` (`custody.mjs:234`). Com esta CCP todos esses rascunhos são expressáveis; `OnboardingAnswers.hold` é `nil` sempre que há um sinal.
**Prova:** `testEveryClinicalSignReachesTheEngineFromEveryHeldDraft` — 6 sinais × {só força, só corrida, sem prova e sem semanas, item combinado,
caixa não marcada, prova sem semanas} = **36 casos**, tela como a UI envia (um sinal `true`, os outros `nil`, sem confirmação), todos `CLINICAL_HUMAN_REQUIRED`,
`enrolled:false`, `plan` → `NOT_ENROLLED` (`replay/replay-clinical-*`). Host de produção: `OnboardingFieldsHostTests` (item combinado + dor).

### X.2 População especial "não respondida" (QRE P3-8, SSCTR; #110)

O motor não tem palavra para "não respondido" nem para o item combinado: lista vazia e chave ausente são "nenhum", e um código desconhecido é
**ignorado e o plano é montado** (`probe-special-population-codes.txt`: `PREGNANCY_OR_POSTPARTUM` e `SPECIAL_POPULATION_UNSPECIFIED` →
`PROPOSED`, `enrolled:true`). Por isso nenhum código novo foi criado.
Modelo: `AthleteIntake.specialPopulationNotStated: SpecialPopulationGap?` — `.notAnswered` (caixa não marcada ao lado de outro item marcado) e
`.pregnancyOrPostpartumUnspecified` (item 7). Com ele: `specialPopulation` fica `[]` e **a chave é omitida** (nunca "nenhum"); a codificação só
acontece se a tela declara um sinal clínico (o motor encaminha a um profissional antes de ler escopo); sem sinal, `encode` lança
`IntakeHold.specialPopulationNotStated` e o host A responde `INVALID_REQUEST` sem enviar nada (fail closed, sem código novo no host). `[]`
continua sendo só "Nenhum destes". **O tipo da lacuna não sobrevive à decodificação** (documentado em `SpecialPopulationGap`): as duas lacunas
saem como a mesma chave omitida, e um intake sem a chave decodifica sempre como `.notAnswered` (fail closed); C guarda o tipo no seu rascunho.
**Para ir além (planejar quem marcou o item combinado sem sinal) é preciso mudança de motor** (§4).

### X.3 Divulgação do maratona preparatório (SSCTR C5)

`weekPlan().marathon.disclosures` traz as divulgações do próprio plano, literalmente: no PREPARATORY, `MARATHON_PREPARATORY_PLAN` (não prepara
para a data informada, nenhuma data é prometida, 7 dias sem treino se correr assim mesmo, e as três opções); no BLOCK, `MARATHON_BLOCK_NOTES` e
`MARATHON_PROJECTION`. O texto é inglês do motor: a tela 31 mostra a cópia PT por `id` (cópia do design, ainda não escrita) sempre que `status`
for PREPARATORY. **Teste:** G2 exige as três afirmações e as três opções no texto da projeção (se o motor mudar o texto, o teste falha e a cópia é
revista); `projections.test.mjs` exige `detail`/`options` iguais aos da divulgação do plano.

### Notas SSCTR (PR #121, APPROVE_WITH_CONDITIONS; nenhuma emenda de motor necessária para a V1)

- **Minimização de dados (para o dono de Dados):** séries, repetições e RIR das cargas conhecidas (26) são coletados e **nunca usados**
  enquanto a carga for só dica (sem `current/tolerated/observedAt` não há dose; o motor usa `loadHint` e a familiaridade). Coletar ou não esses
  três campos é decisão do dono de Dados.
- **Prova sem `weeks`:** o motor faria o plano crescer até as suas 12 semanas, com semanas depois da prova. O `IntakeHold.raceWithoutWeeks`
  (QRE P3-4) impede esse envio; com sinal clínico o envio segue porque o motor responde `CLINICAL_HUMAN_REQUIRED` antes e nada é gravado.

### Validade da aprovação SSCTR (gatilhos de expiração)

A aprovação SSCTR deste registro deixa de valer, e o CCP volta à revisão, com qualquer um destes:
1. qualquer emenda do motor (CoachingCore);
2. qualquer mudança de codificação dos campos deste registro (tipos, chaves, palavras, regras de `hold`);
3. mudança no Figma das telas 07, 09b, 23, 24, 26, 27 ou 31.

## 4. O que precisa de mudança de motor ou decisão (não feito aqui)

| Item | Por quê | Dono |
|---|---|---|
| Turno por dia (09b) | o motor tem um turno por esporte | Core + SSCTR (emenda) |
| Item combinado de gestação/pós-parto sem sinal clínico; "não respondido" | sem código e com código desconhecido ignorado (fail open) | Core + SSCTR + SEC (emenda: código combinado/não especificado tratado como fora do escopo ou ASK) |
| "Calor ou subida" (24) | um item para dois códigos; qualquer um isola o resultado da calibração, mas escolher um é registro falso | Founder/design (dividir o item) ou emenda |
| Cargas como dose conhecida (26, 31 "Força com as suas cargas") | sem `current/tolerated/observedAt` o motor usa a carga como dica e estabelece por esforço (F1); a tela não pergunta essas três coisas, então o contrato não as carrega | SSCTR + Founder |
| "Teste" sem medida (24) | `MEASUREMENT_UNKNOWN`: não calibra; o texto de 23 ("o plano já começa com faixas de ritmo") não vale para ele | SSCTR (medida de um teste) |
| "Equilíbrio" (07) num empate real | o motor pede `schedule.temporaryPreference` (`r6-program.mjs:1461`); "Equilíbrio" não responde a essa pergunta | SSCTR + design |
| Meta fora de 10–400 min | o motor a descarta sem erro (:112) | Core (informativo) |
| "Três decisões do treinador" (34) | sem fonte | Core + design (D26) |
| Critérios atendidos ("6 de 6") | o motor só lista os não atendidos | Core |
| Resultado recente como "maior corrida" (V1CP E2, :165) | o motor lê `sport`, `completed`, `durationMinutes`/`time`; o contrato envia `seconds` e não envia `sport`/`completed`, então esse caminho nunca vale a partir do app | Core + SSCTR (achado; fora do escopo) |

## 5. Apple Saúde

Nada nesta CCP pede, lê ou exige HealthKit: todos os casos (59 réplicas + host) montam plano ou encaminham sem nenhum dado do Apple Saúde. A
autorização continua com B, só com consentimento explícito; nenhum campo novo depende dela.

## 6. Evidência

- `replay/replay-fields-{input-swift-encoded,output-engine}.json` (23 casos) e `replay/replay-clinical-*` (36 casos): entrada codificada pelo
  Swift e respostas cruas do motor (`CCP_ONB_REPLAY_DIR=… swift test --filter OnboardingEngineReplayTests`); resumo em `replay-summary.txt`.
- `probe-special-population-codes.{mjs,txt}`: leitura do motor de códigos desconhecidos (JSON cru, fora dos tipos Swift).
- `baseline-intakes-before-ccp.json`: codificação anterior.
- Logs: `coachingpresentation-swift-test.txt`, `coachinghost-swift-test.txt`, `gates.txt`.
- Fixtures novas para C (`Tests/CoachingPresentationTests/Fixtures/onb-*`), reproduzidas pela fachada de produção de A (`facade-calls.json`).

## 8. Entrega para C (#101) — QRE P3

- **Antes** de `onboard` e de `restart`, C lê `OnboardingAnswers.hold`. Se não for `nil`, não chama a porta e mostra o estado específico:
  - `.specialPopulationNotStated(.pregnancyOrPostpartumUnspecified)` → Cuidados, item "Gestação atual ou parto nos últimos 12 meses" marcado
    sem sinal clínico: o envio fica retido (#110, `BuildHold.pregnancyCode`), com a cópia já prevista para esse estado;
  - `.specialPopulationNotStated(.notAnswered)` → Cuidados com a caixa sem resposta: volta a Cuidados (só ocorre sem sinal marcado);
  - `.raceWithoutWeeks` → a data da prova (04): as semanas vêm da data (D03).
- C **nunca** mostra o `.failed("INVALID_REQUEST")` genérico por causa de um `hold`: essa resposta do host (e agora do `FixtureCoachingWriter`,
  igual ao host) só aparece se a tela esqueceu a verificação, e é um defeito.
- Com um sinal clínico marcado, `hold` é sempre `nil`: o envio segue e o motor responde `CLINICAL_HUMAN_REQUIRED` (`838:3689`).
- O tipo da lacuna vem do rascunho de C, nunca de um intake decodificado.
- `FixtureCoachingWriter` (RepMileUI, editado nesta branch de integração a pedido do coordenador): `hold` → INVALID_REQUEST como o host;
  `restart` agora também recusa um sinal clínico (como `onboard`). Teste `FixtureHoldTests` (roda no simulador, `sim.sh test`).

## 7. Revisões pendentes

SSCTR (§2 linhas de cargas, recentes, "Teste", "Equilíbrio"; §X.2; §X.3) e QRE (contrato, §X.1, §X.2) roteadas pelo orquestrador. Rótulo
`governance:approved` nos caminhos SHARED: só o Founder aplica.
