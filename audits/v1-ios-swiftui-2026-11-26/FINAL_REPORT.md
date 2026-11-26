# Front C · SwiftUI · report (2026-11-26)

Worktree `~/.codex/worktrees/myapp-v1-ios-swiftui/MyApp`, branch `claude/v1-ios-swiftui`, base tag `v1-abc-ready-2026-11-26` (`065178f`). The shell commit `f2b5628` is preserved; this session added increments 02–08 on top of it (no rewrite, no force, no merge). Xcode 27.2, simulator `RepMile-C-SwiftUI` (iPhone 18 Pro, iOS 27.2). Synthetic mode only; all engine data comes from the committed CoachingCore captures.

**Status: mission C in progress, not closed.** The core app (navigation, design system, Hoje, Plano, session detail, run and strength execution, RunRecorder, unplanned workouts, safety flows, Histórico, Progresso, Perfil, heart-rate zones, onboarding) is implemented, tested on the simulator and compared with the Figma. The items in "Not done" below remain for front C before the §10 gates can all be true.

## Increments

| # | Commit | Content | Record |
|---|---|---|---|
| 01 | `f2b5628` | Shell, four tabs, profile round trip (previous session) | [INITIAL_SHELL_VERIFICATION](INITIAL_SHELL_VERIFICATION.md) |
| 02 | `c6bf7e4` | Design system from Figma (44 colours, 15 text styles, OFL fonts, 28 icons, line art), fixture ports, Hoje, root states | [INCREMENT_02](INCREMENT_02_DESIGN_SYSTEM_DATA_TODAY.md) |
| 03 | `99e31a4` | Plano (week, month, phases), treino planejado, "não posso neste dia" | [INCREMENT_03](INCREMENT_03_PLAN_SESSION.md) |
| 04 | `45cf8e9` | RunRecorder, run/strength execution, unplanned workouts, Não estou 100%, prontidão | [INCREMENT_04](INCREMENT_04_RUN_RECORDER_EXECUTION_SAFETY.md) |
| 05 | `894c4fe` | Histórico, Progresso | [INCREMENT_05](INCREMENT_05_HISTORY_PROGRESS.md) |
| 06 | `4dc51a7` | Perfil e ajustes, zonas de FC | [INCREMENT_06](INCREMENT_06_PROFILE_ZONES.md) |
| 07 | `c36532c` | Onboarding, Cuidados, "Plano indisponível" | [INCREMENT_07](INCREMENT_07_ONBOARDING.md) |
| 08 | (this commit) | Large Dynamic Type; SSCTR + QRE review R1 findings fixed; this report | [INDEPENDENT_REVIEW_R1](INDEPENDENT_REVIEW_R1.md) |

## Architecture

- `ios/Packages/RepMileUI`: `DesignSystem/` (tokens, icons, components, tab bar), `Data/` (`FixtureStore`, `FixtureCoachingReader/Writer` implementing the shared `CoachingReading`/`CoachingWriting`, `Scenario`, `AppModel`), `Copy/` (copy table → PT-BR/EN/ES `.strings`), `Features/` (Today, Plan, Session, Run, Adapt, History, Progress, Profile, Onboarding, States), `App/RepMileShell` (composition root, one sheet router, run cover).
- `ios/Packages/RunRecorder`: CoreLocation, step timer, pause/resume, background location, protected atomic file, resume after process death, `AppRecordingIndex`, erase.
- `ios/App`: the app target bundles the CoachingPresentation `Fixtures/` folder **by reference** (no copy). At integration the composition root passes A's CoachingHost and B's adapter; no screen changes.

## Tests (latest full runs)

| Suite | Result |
|---|---|
| XCUITest (simulator) | 32/32 ([log](results/inc08-a11y/xcuitest.txt)) |
| RepMileUI unit (simulator) | 19/19 |
| RunRecorder `swift test` | 10/10 |
| IntegrationContracts / CoachingPresentation `swift test` | 10/10 · 29/29 (baseline, untouched) |
| Frozen paths `git diff --stat v1-abc-ready-2026-11-26 -- CoachingCore ios/Packages/IntegrationContracts ios/Packages/CoachingPresentation tools/device-lock` | empty |
| Forbidden imports (HealthKit, JavaScriptCore, CryptoKit, Security; CoreLocation outside RunRecorder) | none |

## Handoff C §8 / §10 gates

| Gate | State | Evidence |
|---|---|---|
| §8.1 each fixture through a screen or preview | PARTIAL: all 99 decode through their port; every plan view builds Hoje; 26 scenarios render on screen. Not every answer capture has its own screen. | `FixtureReplayTests` |
| §8.2 snapshot per `UI_DATA_STATES` row | PARTIAL: simulator screenshots per key state in `results/inc0*`; no systematic snapshot suite yet. | results folders |
| §8.3 each state its own screen; none shows an empty plan or a rest day | YES (BLOCKED, PENDING, RETURNING, NEEDS_INPUT banners; NO_DATA → onboarding; GONE; OPERATIONAL_ERROR; INTEGRITY_FAILURE; RECORD_LOST; `unrecognized` fail closed) | `testRootRoutes`, `testRootStates` |
| §8.4 "Começar" off for every `NotStartableReason` | YES | `testStartOnlyWhenStartable`, UI gates |
| §8.5 under `17` + `17b` no step, load or target | YES (and the same for outside-scope / clinical host gates) | `testBlockedShowsNoPrescription`, blocked UI tests |
| §8.6 forms produce the shared JSON, `specialPopulation` always present | YES for run reports (planned identity from the recording), unplanned run/strength, Não estou 100%, onboarding; readiness and HR profile go through the shared initialisers but have no key-set assertion yet | `RequestShapeTests`, `OnboardingTests` |
| §8.7 RunRecorder with simulated location | YES | `RunRecorderTests`, kill/resume UI test |
| §8.8 accessibility, PT-BR/EN/ES | PARTIAL: three languages (569 keys, EN in miles), VoiceOver labels on data components, Dynamic Type through `relativeTo` + large-text test; no formal contrast measurement, no VoiceOver audit pass | `testLanguages`, `testLargeDynamicType` |
| §8.9 shared packages green, frozen diff empty | YES | above |
| iPhone: install, real GPS run, Live Activity, scroll/animation performance | NOT DONE (needs the device lock `swiftui` and a physical run) | — |
| Independent review | R1 done: SSCTR READY_WITH_CONDITIONS, QRE NOT_READY; all conditions fixed except QRE P1-11 (needs a Product/SSCTR ruling) and three P2 items; Product/UX review and the narrow recheck of increment 08 pending | [INDEPENDENT_REVIEW_R1](INDEPENDENT_REVIEW_R1.md) |

## Not done (front C scope still open)

- Live Activity / Dynamic Island (needs a widget extension target; no health data in it).
- Gamification V1, shareables (82), paywall with StoreKit 2 local testing (80), notifications, account screens on an `AccountService` fixture.
- Light mode ("A · Claro" values not read yet; the app runs dark).
- Motion: done for skeleton, plan building, progressive volume bars, save feedback, presses; not yet splash, zone-bar twin `785:5837`, route animation, number roll-ups.
- "Coordenação com a força" arc, "Por que este treino"/"Como fazer" (need reviewed copy by code; engine text is English only), race goal marker (CCP-C-01).
- Physical iPhone checks.

## Decisions needed

- **Unplanned run under a gate (QRE P1-11):** the app now refuses to start a live unplanned run under a hold, outside V1 scope, clinical-human-required or screen-required (fail closed). Product/SSCTR to confirm or relax.

## Contract change proposals

[CONTRACT_CHANGE_PROPOSALS.md](CONTRACT_CHANGE_PROPOSALS.md): CCP-C-01 (`runCalibration.goal`), CCP-C-02 (duplicate INDEX entry), CCP-C-03 (no decline capture).

## Depends on others

A: real readings and writes, Startability rules, `pendingWeek` (proposal strength rows), consent state read. B: Apple Health status and imported workouts. INT: replace the fixture composition, dedupe end to end. FDR / SEC: HealthKit write-back (DR-121), store bundle id, clinical/legal final copy (keys `*.interim`). Backend: account, subscription, sync.

**REAL_ATHLETE_READY = NO.**
