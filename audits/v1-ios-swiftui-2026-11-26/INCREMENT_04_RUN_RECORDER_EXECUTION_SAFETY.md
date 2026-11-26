# Increment 04 · RunRecorder, execution, unplanned workouts, safety flows

Base: increment 03 (`99e31a4`). Simulator `RepMile-C-SwiftUI` (iPhone 18 Pro, iOS 27.2), PT-BR; location scripted in UI tests (`-simulatedLocation`).

## RunRecorder (`ios/Packages/RunRecorder`, no UI)

- Steps only from `runSession(for:)` (`RecorderStep.steps(of:)`): timed steps by the moving-time clock; distance steps by measured distance, or by the athlete's "próxima etapa" when no usable GPS exists. **Time is never converted into distance or the reverse**; a timed step after a distance step counts from that step's end.
- Pause/resume (fixes while paused are ignored; distance never spans a pause), background location (`UIBackgroundModes = location`, fitness activity type), visible states not requested / denied / no signal / poor accuracy (> 30 m); none stops a run by time.
- Crash safety: the active state is written atomically with `completeFileProtectionUntilFirstUserAuthentication` (iOS), excluded from backup; `resumeIfNeeded()` restores after a killed process and the app re-presents the run.
- `AppRecordingIndex` for B's dedupe (identity and interval only, no coordinates or distance); `markReported(eventId:)` after `kept`; `discard`; `eraseAll` for account erasure (G07).
- The local measurement (distance, pace, splits, route) is returned separately and is **never** a parameter of a report.

## Screens

| Screen | Behaviour |
|---|---|
| Execução de corrida (40, "sem FC ao vivo") | Step label, Número XXL countdown (or moving time without steps), effort cue and pace band of the current step, moving time, local distance "medido pelo iPhone · não usado pelo plano", location chip, pause/continue, finish → confirm (finish / discard). |
| Relato (40 → 50) | Planned: complete/partial, minutes (pre-filled from moving time, athlete-editable), RPE 0–10, effort response, stop + reason (SYMPTOM raises `warningSignScreen: REQUIRED` → screen banner → signs). Unplanned: **"Parou ou sentiu algo fora do normal?"** required (save disabled until answered; no answer ≠ no); "Sim" opens "Não estou 100%" with eligibility at once (SSCTR-ABC-S1). "Salvo" only for `kept`; otherwise "não foi salvo como sessão separada" with resend. |
| Força (41) / força avulsa | Set rows with prescribed reps, **empty** load field (no suggested number, GAP-10), unit and convention as logged; unplanned report with `observedAt`; "salvo" only for `kept`. |
| "+" (tab bar) | Start a run now · log a strength session already done. |
| "Algo mudou na sua semana?" | Não estou 100% · (when blocked) Estou pronto para voltar · how to declare an unavailable day. |
| Não estou 100% (72) | Condition → `warningSignSet(condition:)` (9/13/15) → yes/no per sign with "Sem resposta não conta como não" → eligibility (when the entry asks it; flags nil until answered; confirmation disabled while a flag is yes) → the engine's intents → answer state (kept / BLOCKED / ASK). |
| Prontidão | READINESS set (15 signs), "recuperado?", run/strength readiness, "declaração sua; o app não faz avaliação médica". |

## Tests

- RunRecorder `swift test` 8/8: timed steps, pause/resume without time or distance, killed process resumes, finish indexes without coordinates and drives `RecordingDedupe`, distance step never converted from time, distance step ended by measured distance, poor accuracy visible and not counted, discard and erase.
- RepMileUI unit 12/12, new `RequestShapeTests` (§8.6): planned run report keys exactly `completed/minutes/rpe` (no `distanceKm`); symptom stop → `completed:false` + `stop.reason`; unplanned run with `observedAt`, `actual.sport`, no stop, no distance; Não estou 100% asks only the engine set, omits unanswered signs and refuses unasked ones; eligibility flags nil until answered; fixture writer routes by signs; unplanned strength kept with `observedAt`.
- XCUITest 18/18 ([log](results/inc04-run-safety/xcuitest.txt)), new: planned run → pause → finish → report → saved; unplanned run with the required question opening Não estou 100%; 9 signs for MINOR_DISCOMFORT → kept; blocked → readiness with 15 signs → returning; recording resumed after the process is killed; unplanned strength saved.
- Frozen paths: diff empty. Forbidden imports: CoreLocation only in RunRecorder.

## Found and fixed during the increment

- Timed step after a distance step counted time spent in the distance step (recorder test caught it).
- Six chained presentations on one view did not present reliably: one sheet router plus a post-dismiss action.
- A confirmation dialog on a view replaced at confirm dismissed the run cover: moved to the stable container.
- UI tests shared a recording store, so a journey's recording resumed in the next (crash recovery working as designed): one store per launch.

## Open

- Live Activity / Dynamic Island needs a widget extension target (ActivityKit); not in this increment. No health data will be in it.
- Real-device GPS run (lock `swiftui`) pending.
- SSCTR review of the warning-sign and avulsa copy (marked INTERIM) pending.

**REAL_ATHLETE_READY = NO.**
