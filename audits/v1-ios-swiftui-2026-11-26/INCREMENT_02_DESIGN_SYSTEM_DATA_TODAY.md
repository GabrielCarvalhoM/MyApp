# Increment 02 · design system, fixture ports, Hoje and root states

Base `f2b5628` (shell), preserved. Xcode 27.2, simulator `RepMile-C-SwiftUI` (iPhone 18 Pro, iOS 27.2), synthetic mode only.

## What is in it

| Area | Content |
|---|---|
| Design system | 44 colour variables and 15 text styles read from Figma `901:109` / `880:4257` (`RM.Palette`, `RMTextStyle`); Geist and Unbounded bundled under OFL (licences in `Resources/Fonts`); 28 icons from `507:51` rebuilt as 24 pt vector template assets at the exact Figma insets; 11 line-art illustrations; tab bar, primary/secondary buttons, card, chevron row, state banner, focus-ring avatar. |
| Data | `FixtureStore` replays the committed CoachingCore captures (the app bundles the CoachingPresentation `Fixtures/` folder by reference, no copy). `FixtureCoachingReader` / `FixtureCoachingWriter` implement the shared `CoachingReading` / `CoachingWriting`; 15 scenarios combine captures, never edit them. Startability, pending reports and Apple Health status are Swift port fixtures, as allowed (handoff §8 "estados que não são do motor"). |
| Copy | `Copy/copy.psv` → PT-BR, EN, ES `.strings` (131 keys). Engine English text is never shown. Clinical/legal copy keys end in `.interim`. |
| Hoje | Header, two-tone hero, "semana em painéis" (mirrored grammar: run above, strength below; filled done, dashed planned, white halo next, red "não feito" only from a `completed:false` record row), week summary, start/secondary actions, race card (range first, base result, phases from `weekPlan`), "Algo mudou na sua semana?". |
| States | Banners for BLOCKED, PENDING_CONFIRMATION, RETURNING, NEEDS_INPUT and the host gates; full-screen states for NO_DATA (onboarding entry), GONE, INTEGRITY_FAILURE, RECORD_LOST, OPERATIONAL_ERROR (stale version copy) and `unrecognized` (fail closed). Loading skeleton. |

## Safety behaviour verified

- "Começar" only for `.startable`; every `NotStartableReason` has copy and disables the start (unit `testStartOnlyWhenStartable`).
- Hold (`17-plan-blocked` + `17b`), restart outside V1 scope (FND-ABC-04) and clinical-human gates **pause** Hoje: no next session, no start, no minutes, no step, pace or effort target; the hero never invites training (unit `testBlockedShowsNoPrescription`; UI `testBlockedShowsSafetyStateAndNoStart`, `testOutsideScopeRestartStartsNothing`).
- Screen required after a symptom stop: banner, start disabled with reason (UI `testScreenRequiredDisablesStartWithReason`).
- Run steps, effort and pace only through `PresentationSnapshot.runSession(for:)`.

## Tests

- `RepMileUI` unit tests (simulator): 6/6. Every fixture of `INDEX.json` (99 unique; the index lists `hr5r-declared-presentation` twice) decodes through its port; every plan view builds Hoje; every scenario routes.
- XCUITest: 7/7 ([log](results/inc02-today/xcuitest.txt)): tabs and profile round trip, start when startable, outside scope, blocked, screen required, five root states, EN and ES.
- Frozen paths: `git diff --stat v1-abc-ready-2026-11-26 -- CoachingCore ios/Packages/IntegrationContracts ios/Packages/CoachingPresentation tools/device-lock` empty. Forbidden imports: none.

## Visual comparison with Figma `880:4257` (same width, PT-BR)

Screenshot: [hoje-today-scenario](results/inc02-today/hoje-today-scenario.png). Fixture day is Sunday with one session (the long run), so the closest frames are `880:4257` (structure) and `572:675` (single session).

| Element | Result |
|---|---|
| Header, avatar ring, hero two-tone, body | Match (type, colours, spacing). The date reads "Domingo · 22 de nov" (locale template) where Figma has "Quinta · 12 nov". |
| Week panels | Match geometry (40 pt panels, 190 pt today panel, baseline at 170, marks 32 pt, card 174×124, halo 2 pt). Today on Sunday sits right of centre as in the "outro dia em foco" variants. |
| Start + secondary | Match. "Por que nessa ordem?" omitted: the reason exists only as engine English text (GAP-COPY-01). |
| Race card | Range, caption, base, phase row and phase track match. **No goal marker** ("meta 44:30"): the goal is not in the shared `Readings` type (see CCP-C-01 below). The footnote about volume is not shown (no engine copy). |
| Weather, sleep, HRV | Hidden: no WeatherKit source in V1 fixtures; sleep/HRV `notInV1` (frame `880:4257` is the reference without them). |
| Streak row "3ª semana seguida no plano" | Not shown yet: needs the gamification increment. |

## Open items carried forward

- **CCP-C-01 (proposal, not an edit):** `runCalibration.goal` is in the captures but not typed in `Readings`; the race card's goal marker needs it. Written to `CONTRACT_CHANGE_PROPOSALS.md`.
- Light mode ("A · Claro") values not yet read from Figma; the app runs dark (`preferredColorScheme(.dark)`).
- Plano, Histórico, Progresso, Perfil, session detail, "+" and "Algo mudou" are provisional destinations, labelled as such, built in the next increments.

**REAL_ATHLETE_READY = NO.**
