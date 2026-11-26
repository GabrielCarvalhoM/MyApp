# Front C · independent review R1 and dispositions (2026-11-26)

Two independent read-only reviews of `f2b5628..c36532c` (worker ≠ judge): **SSCTR** (copy of HR zones, warning signs, unplanned run, scope; READY_WITH_CONDITIONS) and **QRE** (code; NOT_READY). Every finding below was checked against the code before fixing; fixes are in increment 08. Tests after the fixes: XCUITest 32/32, RepMileUI unit 19/19, RunRecorder 10/10.

## SSCTR (provisional internal domain authority; clinical wording stays INTERIM)

| Finding | Disposition |
|---|---|
| `hr.slow.body` lacked the approximate-origin sentence (C5) | Fixed (PT/EN/ES as proposed) |
| Custom limits: the engine also checks 60–230 | Fixed `hr.customize.detail`, `hr.disclosure.ATHLETE_CUSTOM`; added `hr.error.maxHeartRateBpm.wholeBpm120to230`, `hr.error.zoneUpperBpm.wholeBpm60to230` (field codes verified in `v1-heart-rate-profile.mjs`) |
| `sign.gettingWorse` wording | Fixed |
| Condition labels said "leve"/"pequeno" (S1) | Fixed (`Indisposição`, `Resfriado ou outra doença`, `Incômodo no corpo`) |
| Eligibility title / confirmation asked the athlete to judge "clínico" | Fixed; key renamed `eligibility.confirm.interim` |
| Confirmation could be switched on with flags unanswered | Fixed: enabled only when all six are "não" |
| "Não estou 100%" showed "plano continua" on MODIFY | Fixed: KEEP → kept, MODIFY → `nf.modified`, ASK → needs answers, clinical → blocked, unknown → fail closed (unit `testNotFeeling100OutcomeReadsTheEngineStatus`) |
| Readiness showed "de volta" on ASK | Fixed: ASK → needs answers; returning only on `READINESS_RESTART` / RETURNING |
| `stopReason` preset to FATIGUE (also QRE P0-2) | Fixed: no preset; a stop needs a reason before saving |
| "Sim" skipped the flow on the screen-required path | Fixed: "Sim" opens the flow at the tap |
| Outside-scope body read as a contraindication (S2) | Fixed, still `.interim` |
| `readiness.*`, `state.blocked.action` | CLINICAL_HUMAN_REQUIRED (G04); `readiness.note` → `readiness.note.interim` |

## QRE

| # | Finding | Disposition |
|---|---|---|
| P0-1 | Age stepper clamped to 18–80 and defaulted to 30 | Fixed: typed, no default, no clamp (the engine refuses out of range); cannot continue without it (unit + UI) |
| P0-2 | Stop reason defaulted to FATIGUE | Fixed (see SSCTR) |
| P1-3 | Report screen had no exit | Fixed: "Concluir" after saved/screen required; "Sair sem salvar" (confirm → recording discarded) (UI `testReportCanBeLeftWithoutSaving`) |
| P1-4 | Signs sheet dismissal closed the run screen; "Sim" only after save | Fixed: dismissal returns to the report; "Sim" opens at once (UI) |
| P1-5 | Killed while paused → no GPS after resume | Fixed: `resume()` starts the source (unit `testKilledWhilePausedResumesWithFixes`) |
| P1-6 | Finished but unreported recording never came back | Fixed: restored to its report (unit `testFinishedUnreportedRecordingComesBack`) |
| P1-7 | Resumed planned recording outside the loaded week reported as unplanned | Fixed: the report's identity comes from the recording (`sessionId`, `sessionDate`), not from the loaded week |
| P1-8 | Strength: prescribed RIR copied as the athlete's; invented reps/minutes | Fixed: no RIR stated, no default reps, minutes entered by the athlete (save disabled until then) |
| P1-9 | New plan rendered with old gates | Fixed: gates cleared first, all reads published at once |
| P1-10 | Proposal shown from the pre-write presentation | Fixed: reload after the write |
| P1-11 | "Correr agora" not gated | Interim fail-closed gate under hold / outside scope / clinical / screen required (UI `testUnplannedRunIsNotStartedUnderAHold`). **Needs a Product/SSCTR ruling.** |
| P1-12 | Copy/flow items | Fixed (SSCTR rows) |
| P2 | History correction built from the row's top line | Fixed: the athlete's own voice (completed, minutes, RPE, stop, response) |
| P2 | Run screen step index drift | Fixed: same filter as `RecorderStep.steps` |
| P2 | `eraseAll` lost excluded-from-backup; GONE at launch erased nothing | Fixed both |
| P2 | Dates in UTC where no plan-local day exists | Fixed: device local day (`Fmt.deviceDay`) |
| P2 | Persisting every 5 fixes on the main thread; local splits include paused time; crash gap joined as a straight line | **Open** (performance and local-only display; scheduled with the device run) |
| P2 | A resumed recording shows its saved steps even if a hold arrived meanwhile | **Open**: needs a re-check of Startability on resume |

A narrow QRE + SSCTR recheck of this increment is the next gate before integration.
