# F01 · Raiz, navegação e telas de estado

**Situação:** IMPLEMENTADO em C (inc. 01–02, `f2b5628`, `c6bf7e4`) · validado no simulador (sintético) · spec de manutenção. Issues: #4, #7.

**Objetivo.** O app abre na tela certa para o estado do motor e nunca mostra um plano vazio ou um "dia de descanso" falso.

**Comportamento.** `RootRoute.from(plan:)` decide: `loading` → skeleton; `app` → abas Hoje · Plano · Histórico · Progresso (+ Perfil);
`NOT_ENROLLED`/`noData` → onboarding; `GONE` → conta excluída; `INTEGRITY_FAILURE`; `RECORD_LOST`/`RECORD_ROLLED_BACK`;
`OPERATIONAL_ERROR` (com tentar de novo); estado desconhecido → `unrecognized` (falha fechada). Banners na app: BLOCKED, PENDING,
RETURNING, NEEDS_INPUT. Navegação: `NavigationStack` por aba com `Route` tipado; uma sheet por vez (`AppTabs.Sheet`); corrida em
full-screen cover.

**Aceite.** Cada estado tem tela própria (§8.3 do handoff C) · desconhecido não mostra prescrição · GONE apaga gravações locais.

**Contratos.** `PlanView.state` (`ClientState`), `BoundaryError.code`. **Figma:** estados 20/30/50/60/81 (adendo §2, última linha).

**Testes.** `testRootRoutes`, `testRootStates`, `testTabsAndProfileRoundTrip`, `testEveryPlanViewBuildsTodayAndEveryScenarioRoutes`.

**Pendente.** Light mode (valores "A · Claro" não lidos; app força dark) — decidir se é V1. Validação visual formal (#14).
