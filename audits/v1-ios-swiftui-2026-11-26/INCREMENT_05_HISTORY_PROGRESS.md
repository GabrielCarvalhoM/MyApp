# Increment 05 · Histórico and Progresso

Base: increment 04 (`45cf8e9`). Simulator `RepMile-C-SwiftUI`, PT-BR.

| Screen | Content | Contract |
|---|---|---|
| Histórico (50) | Rows from `loggedEntries` only, grouped by plan week. Measured ("12,5 km medidos · GPS"), declared ("informados por você") and contested ("você corrigiu para 7 km · Perdeu o sinal") distances never merged. `unplannedMerge` → "não foi salvo como sessão separada". Conflicted rows say who disagrees (watch vs athlete, or several athlete logs). Row detail: **every voice** (done, minutes, distances, stop, RPE), sets and loads as logged; "Distância parece errada?" on a planned run the device measured → `actual.declared` (NATIVE 7.5). Apple Saúde status from B's port: "nada recebido", never "negado". Empty state with line art. No delete (GAP-13). | `LoggedEntries`, `HealthIngestStatusSource` |
| Progresso (60) | Estimates 5K–marathon range first, central never alone; an unavailable one shows its reason (e.g. marathon needs a half or longer result). Race forecast as the plan scenario ("se você seguir o plano", not a probability or goal) and the observed forecast's weeks still needed. Volume per week: planned (outline) vs done (solid), run minutes above and strength sets below, drawn progressively (Reduce Motion: no animation). Consistency grid from record rows. Results the athlete ran. Strength sets per primary muscle, descriptive only. Hidden: hybrid map, watch signals, time in zone. | `Readings` (`runCalibration.estimates`, `runForecast`, `strengthExposure`), `WeekPlanProjection`, `LoggedEntries` |

New scenarios: `history-unplanned` (`P-logged-unplanned`, `unplanned-7-history`, `unplanned-8-presentation`) and `history-conflict` (`P-logged-conflict`).

## Tests

XCUITest 22/22 ([log](results/inc05-history-progress/xcuitest.txt)); new: distances apart and merge copy, every voice of a conflicted row with the athlete's stop, empty history, progress range-first and plan scenario. RepMileUI unit 12/12.

## Fixed during the increment

The conflict copy named the watch for a row with two athlete voices only; the copy now depends on the channels.

**REAL_ATHLETE_READY = NO.**
