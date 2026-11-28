# F03 · Onboarding, Cuidados e elegibilidade

**Situação:** IMPLEMENTADO em C (inc. 07 `c36532c`, correções R1 no inc. 08) com fixtures · motor real pendente (#17). Issue: #8.

**Objetivo.** Coletar as respostas que o motor exige e gerar o primeiro plano real, sem inventar nenhum valor.

**Comportamento.** Etapas do Figma 10; Cuidados (`specialPopulation`, sempre presente; "nenhuma destas" envia vazio); gravidez/pós-parto →
"Plano indisponível" (`planOutcome.outsideV1Scope`); idade digitada, sem default e sem limite local (o motor recusa fora de faixa);
confirmação de elegibilidade só habilitada com as seis perguntas respondidas "não"; consentimentos → `Consents`.

**Estados.** editando · enviando · plano gerado · fora do escopo · erro do motor (código mostrado, campo marcado) · sem conexão com o motor.

**Aceite.** O pedido gerado é o JSON compartilhado (`OnboardingAnswers`) · nada pré-preenchido que o atleta não disse · fora do escopo não
mostra nenhum treino · duplo toque em "Criar plano" envia uma vez.

**Contratos.** `CoachingWriting.onboard(_:consents:)`, `OnboardingAnswers`, `EligibilityScreen` (nil ≠ false).
**Figma.** 10 `836:3299` Cuidados · `838:4053` fora do escopo · `1103:2299` fora do escopo no reinício (A) · `836:2649` altura/peso (#26).

**Testes.** `testNoneOfTheseBuildsAPlan`, `testPregnancyShowsPlanUnavailable`; unit `testNoChoiceCannotBeSent`,
`testNoneSendsAnEmptySpecialPopulation`, `testPregnancyAndPostpartumMapToTheEngineCodes`, `testAgeIsTypedNeverDefaultedOrClamped`.

**Segurança.** Textos `eligibility.confirm.interim` e de fora do escopo são INTERIM (clínico humano).

**Pendente.** `OnboardingViewModel` + divisão do arquivo (378 linhas) — ARCHITECTURE §4 #1 · motor real (#17) · decisão #26.
