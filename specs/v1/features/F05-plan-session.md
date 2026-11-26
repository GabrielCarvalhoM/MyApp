# F05 · Plano, detalhe do treino e "não posso neste dia"

**Situação:** IMPLEMENTADO em C (inc. 03 `99e31a4`) · spec de manutenção. Issue: #10.

**Objetivo.** Ver a semana, o mês e as fases do plano; abrir o treino planejado com os passos do motor; pedir para mover um treino.

**Comportamento.** Plano: segmentos semana / mês / fases (`weekPlan`); detalhe de corrida mostra só `PresentationSnapshot.runSession(for:)`;
detalhe de força mostra só a carga prescrita (`prescription.load`, sem número sugerido pela UI); "não posso neste dia" envia
`ReviewRequest.unavailableDays`, mostra a proposta **relida após a escrita** e confirma por `accept(decisionId:)`.

**Estados.** semana · mês · fases · proposta pendente · bloqueado (sem passos nem "Começar") · erro.

**Aceite.** Nada calculado na UI sobre o plano · a proposta exibida é a do motor depois da escrita · diff de força da proposta depende de A
(`pendingWeek`).

**Contratos.** `weekPlan`, `allWeeks`, `presentation().pending`, `submit`, `accept`. **Figma.** 30 Semana/Fases `596:2125`; mover
`593:689`, `597:1542`, `597:1909`; 31/41 detalhe.

**Testes.** `testPlanWeekNavigationAndSegments`, `testRunSessionDetailShowsEngineStepsAndStarts`,
`testStrengthSessionDetailShowsPrescribedLoadsOnly`, `testCantThisDayProposesAndConfirms`, `testBlockedSessionDetailShowsNoStepsOrStart`.

**Pendente.** Dividir `PlanScreen.swift` (395) e `SessionDetailView.swift` (354) · `UnavailableDayViewModel` · "Coordenação com a força",
"Por que este treino"/"Como fazer" (precisam de cópia revisada; texto do motor só em inglês) · marcador da prova (CCP-C-01).
