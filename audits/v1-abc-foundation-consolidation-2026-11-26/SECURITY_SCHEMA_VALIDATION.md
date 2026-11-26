# Validação de segurança dos schemas (CHG-UI-2)

Regra: nenhuma camada descarta em silêncio um campo de triagem; schemas explícitos e fechados; nenhuma entrada nova aberta no motor.

## 1. `specialPopulation` de ponta a ponta (GAP-02, CHG-UI-2 2.7)

| # | Elo | Como está garantido | Prova |
|---|---|---|---|
| 1 | Entrada no onboarding (Figma 10 · 27 Cuidados `836:3299`, "Gestação atual ou parto nos últimos 12 meses") | `AthleteIntake.specialPopulation: [SpecialPopulation]` é **não opcional**: um formulário não compila sem responder; "nenhum" é `[]` | compilação; `RequestSchemaTests.testIntakeCarriesEverySafetyKey` |
| 2 | Validação | enum fechado `PREGNANCY`, `POSTPARTUM` (os valores que o motor lê; `ELITE`/`ADOLESCENT` existem no motor mas nenhum formulário V1 os pergunta) | `testEnumerationsAreTheFrozenOnes` (lê `r6-intake.mjs`) |
| 3 | Transporte pelo Swift | `OnboardingAnswers` → `IntakeRequest` (A só acrescenta o envelope do host) | `EndToEndBoundaryTests` |
| 4 | Serialização | a chave sai sempre, inclusive `[]` | `testIntakeCarriesEverySafetyKey` |
| 5 | Recebimento pela fronteira | o runner devolve o que recebeu (`received.specialPopulation`) antes de chamar `api.onboard` | `testSpecialPopulationReachesTheEngineAndBlocksThePlan` |
| 6 | Interpretação pelo CoachingCore | `r6-intake.mjs:91` → `SPECIAL_POPULATION_OUTSIDE_V1` | fixtures `special-*-onboard` (resposta real) |
| 7 | Bloqueio correspondente | `ok:true, status:UNSUPPORTED, enrolled:false`; `plan` → `NOT_ENROLLED` / `NO_DATA`; `planOutcome = .outsideV1Scope` (tela 81 "Plano indisponível · sinal informado no cadastro"), nunca um plano vazio | Swift e Node (`projections.test.mjs` "special population") |

**Prova de que a chave é estrutural:** o mesmo intake **sem** a chave gera um plano (`PROPOSED`). Uma lista fechada sem `specialPopulation` daria um plano a uma gestante; o tipo Swift torna isso impossível.

**FND-ABC-04 (aberto, mitigado no contrato):** no `restart`, a mesma declaração é recusada por escopo, mas o plano anterior continua executável no registro (`evidence/probe-restart-special-population.mjs`). O motor não muda nesta missão; A implementa um sinal persistente e `Startability.notStartable(.outsideV1Scope)` até um intake aceito ou o apagamento da conta (padrão SEC-FPV-01). Revisão SSCTR + SEC: `INDEPENDENT_REVIEW.md`.

## 2. Triagem de elegibilidade (`eligibility`)

- Seis flags clínicas + `status` + `assessedAt`. Flag não respondida = **omitida** (o motor lê `UNASSESSED` → ASK), nunca `false` (`testIntakeCarriesEverySafetyKey`).
- Qualquer flag `true` → o motor roteia a humano (`CLINICAL_HUMAN_REQUIRED`); a UI mostra o estado da resposta, não calcula (`statesAClinicalFlag` é só para a cópia).
- `assessedAt` vale 14 dias para o motor; as ações que pedem triagem atual (GAP-20) levam `ReviewRequest.eligibility`.

## 3. Execução de treino (SEC-INT-12, CHG-UI-2 2.8)

- `AthleteObservation` codifica exatamente `OBSERVATION_KEYS.ATHLETE` (lido de `admission.mjs`), nenhuma chave `BOUNDARY_OWNED`, nenhum fato só do aparelho (`measurement`, `gpsQuality`, `heartRate`) (`testAthleteObservationsAreClosed`).
- Avulsa: `actual.sport` (como o motor lê um relato sem sessão), `observedAt` **obrigatório** (FND-ABC-01), **sem `stop`** (FND-ABC-02).
- Contestar a distância do aparelho: `actual.declared {distanceKm, reason}` com as razões congeladas (`declaredFailureReasons`).
- `StopReason` = `RUN_FORMATS_V1.json stops.reasons` (7 valores; o handoff §5.2 listava 5 — prevalece o arquivo congelado). Respostas = `r6-provenance.mjs RESPONSE`; `UNKNOWN` sempre enviado.
- Todo relato vai por `integration.submit` (FND-ABC-03: os formulários de `api.mjs` perdem campos).

## 4. Respostas aos sinais de alerta (GAP-03)

- O conjunto de sinais vem do motor pela fachada (`warningSignSet`, reexport de `signsFor` congelado): 9 / 13 / 15 por condição, 15 na prontidão. Nenhuma tabela em Swift.
- `SignAnswers` recusa um sinal não perguntado (`notAsked`) e omite o não respondido (o motor pergunta de novo, pelo nome: `wellbeing.warningSigns.<sinal>`).
- Provas na fronteira real: um "sim" → `CLINICAL_HUMAN_REQUIRED` e `BLOCKED` sem prescrição; a prontidão é a saída; um sinal sem resposta → `ASK`; nove "não" em `MINOR_DISCOMFORT` → plano mantido (`testWarningSignFlows`).
- Chaves de cada formulário ⊆ a lista do próprio leitor F08 (`unknownKeys(w|c|r,[…])`, lidas do fonte).

## 5. Dados cardíacos

- Perfil: `HeartRateProfileRequest` (int, `null` limpa, omitido mantém); a validação é do motor (`INVALID_REQUEST` com `fields`, p.ex. `zoneUpperBpm.strictlyIncreasing`).
- Anchors de intake: `heartRate {maxBpm, sensor: CHEST_STRAP|ECG|OPTICAL}` e `lab {protocol, source, modality, values}` — as chaves que as referências medidas leem (HR5R).
- Série (tempo em zona): `HeartRateSeries` validada (ordem, dentro do treino, finita, ≤ 12 000 amostras), sensor nunca adivinhado; a classificação é do motor e fica fechada por portão.
- Dado de saúde não vai a log (handoffs A/B §logs).

## 6. Entradas que continuam fechadas

- `runEvidence` numa revisão: recusado pela custódia (FND-HR5-01); **não** foi aberto.
- Intake real: `IntakeCustodyMode` só tem `syntheticShadowReference` (`synthetic:true`, `purpose:SHADOW_REFERENCE`); `createIntegration({syntheticOnly:true})` continua o padrão (OPEN-4). Um caso real só entra com o portão de atleta real do Founder.
- Canal DEVICE: inalterado (`DeviceActivity`, testes originais).

## 7. Resultado

| Item | Estado |
|---|---|
| `specialPopulation` preservado de ponta a ponta | **SIM** (7 elos provados; FND-ABC-04 mitigado por contrato, aberto até A) |
| Schemas de execução, sinais, FC | **fechados e testados** contra os fontes congelados |
| Nenhuma entrada aceita pelo motor foi ampliada | **SIM** (nenhum byte de `CoachingCore/`) |
