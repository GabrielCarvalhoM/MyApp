# F04 · Hoje e "Começar" condicionado

**Situação:** IMPLEMENTADO em C (inc. 02) · spec de manutenção. Issue: #9.

**Objetivo.** Mostrar o treino do dia e a semana, e só permitir iniciar o que o motor declarou iniciável.

**Comportamento.** Conteúdo de `PlanView` + `PresentationSnapshot`; painéis da semana (`WeekPanels`); "Começar" habilitado apenas com
`Startability.startable`; para cada `NotStartableReason` um motivo visível; gate global (`AppModel.globalGate`) desabilita tudo;
sessão sem gate carregado = não iniciável (falha fechada).

**Estados.** carregando (skeleton) · treino do dia · descanso real (quando o motor diz) · bloqueado · pendente · voltando · precisa de resposta.

**Aceite.** §8.4/§8.5 do handoff C: "Começar" off para todo `NotStartableReason`; sob `17`/`17b` nenhum passo, carga ou alvo.

**Contratos.** `CoachingReading.plan/presentation/startability`. **Figma.** 20 Hoje (variante sem FC ao vivo `879:3062`).

**Testes.** `testTodayStartsOnlyWhenStartable`, `testBlockedShowsSafetyStateAndNoStart`, `testScreenRequiredDisablesStartWithReason`,
`testOutsideScopeRestartStartsNothing`; unit `testStartOnlyWhenStartable`, `testBlockedShowsNoPrescription`, `testTodayContentFromFixtures`.

**Pendente.** Sinais do relógio (sono/VFC) dependem de #24 (hoje `[FUTURO]`). Validação visual (#14).
