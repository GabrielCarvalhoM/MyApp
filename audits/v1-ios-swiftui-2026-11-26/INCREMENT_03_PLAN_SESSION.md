# Increment 03 · Plano, treino planejado and "não posso neste dia"

Base: increment 02 (`c6bf7e4`). Simulator `RepMile-C-SwiftUI` (iPhone 18 Pro, iOS 27.2), PT-BR.

## What is in it

| Screen | Content | Contract |
|---|---|---|
| Plano · Semana (`509:115`) | Unbounded title, Semana/Mês/Fases segments, week navigation over `allWeeks()`, double-lane ring (run line outside, strength blocks inside) with done/total sessions, run minutes and strength sessions, weekly training time, "Dia a dia" rows (done ✓ and "não feito" ✕ only from record rows; planned rest "não conta como falta"; "Prévia" for projected sessions), long-press menu "Não posso neste dia", phases chart. | `PlanView`, `[Week]`, `LoggedEntries`, `WeekPlanProjection` |
| Plano · Fases (`596:2125`) | Mirrored bars: planned run minutes above the baseline, planned strength sets below; past/current filled, ahead soft; phase groups under the weeks. Numbers only from `weekPlan`. | `WeekPlanProjection` (GAP-07) |
| Plano · Mês | Calendar grid of the plan's weeks, run line / strength block marks, done filled. | `[Week]`, `LoggedEntries` |
| Treino planejado · corrida (`643:317`) | Sport chip, duration (Número XL), date · turn · week · phase, metric grid (duration, RPE, pace band, estimated distance from step estimates, continuous part, turn; closes without gaps), structure chart, steps with repeat counts, pace and RPE dots, "Esforço e ritmo" card (effort leads, talk cue by code, calibrated pace bands on one axis, base result + confidence + validity), pinned start gated by `Startability`. | `runSession(for:)` only (FND-ABC-05); `Readings.runCalibration` |
| Treino planejado · força (`730:…` "carga a estabelecer") | Duration, exercise and set counts, exercise rows (name by id from the copy table, sets × reps, load by `prescription.load.mode` with no suggested number, RIR, rest), "Anterior" from the last logged set. | `PrescribedLoad` (GAP-10), `LoggedEntries` |
| Não posso neste dia (`593:689` → `597:1542`) | Sheet: tell the coach → proposal (run sessions of `presentation().pending`) → confirm → "Plano atualizado". The UI never chooses a destination. | `ReviewRequest.unavailableDays`, `accept(decisionId:)` (GAP-09) |

Under a hold or a pausing host gate, the session detail shows the paused state: no steps, minutes, targets or start.

## Tests

- XCUITest 12/12 ([log](results/inc03-plan-session/xcuitest.txt)). New: week navigation and segments, run detail with engine steps and an enabled start, strength detail with "carga a estabelecer", the unavailable-day proposal confirmed, blocked detail with no steps or start.
- `RepMileUI` unit 6/6. Frozen paths: diff empty. Forbidden imports: none.

## Visual comparison

| Frame | Screenshot | Differences |
|---|---|---|
| `509:115` | [plano-semana-today](results/inc03-plan-session/plano-semana-today.png) | Structure, type and colours match. The ring's inner strength lane uses dashed blocks and reads heavier than the Figma's; to refine in the motion/polish pass. The "Chave" chip is not shown: no engine code says a session is key (no invented classification). |
| `643:317` | [treino-planejado-longao](results/inc03-plan-session/treino-planejado-longao-643317.png) | Matches header, grid, structure, steps. Not shown: "Por que este treino" and "Como fazer" (engine English only, GAP-COPY-01), "Coordenação com a força" arc (needs reviewed copy; the day count itself is derivable and is a later candidate), share and more buttons. Step 2 is named "Parte principal" (from `STEADY`), where the Figma says "Corrida longa". |
| `596:2125` | [plano-fases](results/inc03-plan-session/plano-fases.png) | Bars and phase groups from `weekPlan`; the race flag and the "o volume sobe…" sentence are omitted (no engine copy). |

**REAL_ATHLETE_READY = NO.**
