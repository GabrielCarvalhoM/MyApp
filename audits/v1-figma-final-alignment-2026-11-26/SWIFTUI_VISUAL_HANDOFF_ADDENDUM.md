# C · SwiftUI: visual handoff addendum (Figma final alignment V1)

**Adds to:** `audits/v1-abc-foundation-consolidation-2026-11-26/C_SWIFTUI_HANDOFF.md`, which stays authoritative. This addendum replaces only §3 item 5 there ("estados novos de `FIGMA_FUNCTIONAL_ALIGNMENT.md` §1") and §3 of `FIGMA_FUNCTIONAL_ALIGNMENT.md` ("ajustes de texto para C, não aplicados no Figma"). **Those adjustments are now applied in the Figma.**

**Implement the Figma as of 2026-11-26 after this session, not the snapshot from before the reconciliation.**

## 1. Visual reference

| Item | Value |
|---|---|
| File | `90oyvXHxxBQAvr1netov7S`: https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/Vilumo-%C2%B7-Hoje-e-Plano-%E2%80%94-estilo-Pierre--proposta-?node-id=835-2069 |
| Version | The Guia (`897:2`) reads "591 quadros … alinhamento funcional da V1 em 26 nov 2026". The Plugin API cannot name a version. **The Founder should save a named version** ("V1 alinhamento funcional · 26 nov") in the version history; C uses that version. |
| Node changelog | `FIGMA_NODE_CHANGELOG.md` (this directory) |
| Where the contract lives in the file | Dev Mode annotations on the frames. Every changed or affected frame carries the contract mapping. Read them in Dev Mode before implementing a screen. |
| Name tags | `[FUTURO · fora da V1]`: build the complete component, hidden (`Availability.unsupported`). `[V1: usar variante sem FC ao vivo]`: the V1 renders the variant from row `879:3062`. `[V1: oculto até prova A+B]` / `[V1: oculto até OPEN-1]`: hidden until the gate closes. |

## 2. Screens → contracts → fixtures

Fixtures are in `ios/Packages/CoachingPresentation/Tests/CoachingPresentationTests/Fixtures/`. The fixture provider only replays them.

| Screen (node) | V1 state | Swift contract | Fixture(s) |
|---|---|---|---|
| 71 `1102:4302` zones estimated from age (**default**) | functional, no watch | `HeartRateFiveZones` (`reference.kind = AGE_ESTIMATE`) | `hr5r-age30-presentation` (exact values in the Figma) |
| 71 `760:1484` declared maximum (Lucas 188) | functional | `ATHLETE_DECLARED_MAXIMUM`; write `setHeartRateProfile` | `hr5r-declared-presentation` (195), `hr5r-declared-answer`, `-replay`, `-invalid-answer`, `-stale-answer`, `-reuse-answer`, `-set-without-consent` |
| 71 `1102:4428` custom limits | functional | `boundarySource = ATHLETE_CUSTOM`; `zoneUpperBpm` | `hr5r-custom-presentation` (130 · 150 · 165 · 180, the same as the Figma) |
| 71 `760:1611` chest-strap maximum | functional when it qualifies (onboarding) | `OBSERVED_MAXIMUM`, `notUsed` (C1) | `hr5r-strap-above-presentation`, `hr5r-strap-below-presentation`, `hr5r-optical-presentation` |
| 71 `760:1693` lab | functional, onboarding only | `LAB_MEASURED_MAXIMUM`; values as supplied | `hr5r-lab-presentation`, `hr5r-conflict-presentation` (C2: both values plus manual entry) |
| 71 `845:4225` no zones | functional | `status UNAVAILABLE` (`AGE_REQUIRED`, `AGE_OUTSIDE_ESTIMATE_RANGE`, `HOLD_NO_PRESCRIPTION`, `REFERENCE_CONFLICT`) | `hr5r-noage-presentation`, `hr5r-hold-presentation` |
| 71 erase | functional (inside the edit sheet) | `eraseHeartRateProfile()` | `hr5r-erase-answer`, `-erase-without-consent`, `-after-erase-presentation` |
| 50 "Tempo por zona" | **FUTURE (C10)**: complete and hidden | `Availability.unsupported("SERIES_CHANNEL_NOT_REVIEWED")` | `hr5r-time-in-zone-gated`, `-no-series`, `-hold` |
| 10 `836:3299` Cuidados | functional | `OnboardingAnswers.specialPopulation` (required), `EligibilityScreen` (nil ≠ false) | `special-none-onboard`, `special-pregnancy-onboard`, `special-postpartum-onboard` |
| 10 `838:4053` out of scope (onboarding) | blocked | `planOutcome.outsideV1Scope` | `special-pregnancy-plan`, `special-postpartum-plan`, `special-pregnancy-sessions` |
| 10 `1103:2299` out of scope **on restart** | blocked (P0) | `Startability.notStartable(.outsideV1Scope)`, persistent (A) | no fixture: A produces the state (see `evidence/probe-restart-special-population.mjs` and the E2E test on the foundation branch) |
| 81 `849:3994` / 10 `838:3689`, `838:3756` / 72 `805:410` / 31 `645:749` / 30 "treino pausado por segurança" | blocked | `ClientState.blocked`; no steps, load or "Começar" | `17-plan-blocked`, `17b-presentation-blocked`, `17c-sessions-blocked`, `actions-E2-break-clinical` |
| 72 `843:1696`, `843:1751`, `843:1923`, `843:1980` | functional | `warningSignSet(condition)` (9/13/15), `SignAnswers` | `P-warning-sign-sets`, `16-notFeeling100-sign`, `actions-D1`, `actions-D3`, `actions-F1`, `18-declareReadiness`, `19-plan-after-readiness` |
| 20/31/40/41 "Começar" | functional with a gate | `Startability` | `actions-F2-eraseHealthFacts`, `actions-F3-plan-after-erase`, `actions-C1-run-stop-symptom`, `actions-C2-plan-after-symptom-stop` |
| 31/40 run steps | functional | `PresentationSnapshot.runSession(for:)` only | `03-sessions`, `04-presentation-after-onboard`; under a hold: `17b` (no steps) |
| 30 Week / Phases (`596:2125`) | functional | `weekPlan` | `P-week-plan`, `02-plan-w0`, `13-plan-w1` |
| 30 Move / Proposal (`593:689`, `597:1542`, `597:1909`) | functional (runs only); strength diff = A (`pendingWeek`) | `ReviewRequest.unavailableDays`, `presentation().pending` | `actions-B1-unavailable-day`, `actions-B1b-presentation-pending`, `actions-B2-accept-unavailable` |
| 41 load adjustment (`665:486`) | functional, no suggested number | `prescription.load` | `03-sessions`, `09-logStrength` |
| 41 unplanned strength / 50 `684:4381` | functional with a rule | `observedAt` required; `WriteOutcome.kept`; `LoggedEntry.unplannedMerge` | `unplanned-6-strength-observedAt`, `unplanned-2-strength-no-observedAt`, `P-kept-check`, `P-logged-unplanned` |
| 40 unplanned run (`661:1215`, `661:1289`) / 50 `682:2528` | functional | unplanned report without `stop`; the question opens 72 | `unplanned-3-run-observedAt`, `unplanned-1-run-no-observedAt`, `unplanned-8-presentation` |
| 50 History (list, detail, voices) | functional | `loggedEntries` | `P-logged-after-w0`, `P-logged-final`, `P-logged-two-voices`, `P-logged-conflict`, `20-history`, `26-history-final`, `unplanned-7-history` |
| 50 "Distância parece errada?" | functional | `actual.declared` | `unplanned-5-athlete-contests-distance` |
| 50 / 81 imported | functional (B) | `HealthIngestStatusSource`, `ImportedWorkoutSummary` | `06-import-device-run`, `24-import-unlinked`, `25-import-before-start`, `unplanned-4-device-run`; for B's stub, `IntegrationContracts` |
| 60 estimates / forecast / records | functional (range first) | `Readings` (`estimates`, `runForecast`), `loggedEntries` | `12-presentation-after-w0`, `08-presentation-after-run` |
| States 20/30/50/60/81 | functional | `ClientState` / `error.code` | `14-setPreferences` (NEEDS_INPUT), `actions-A2b` (PENDING), `19` (RETURNING), `22-error-stale-version`, `23-error-not-enrolled`, `actions-F5` (NO_DATA) |

## 3. What depends on what

| Depends on | Elements |
|---|---|
| **Nothing (works without a watch)** | plan, week, phases; run sessions by time and effort; strength with sets, load and RIR; manual logging; history; age-estimated zones Z1–Z5; declared maximum; custom limits; estimates; adaptations; blocks |
| **GPS / `RunRecorder` (C)** | live distance, pace and route; local summary "Medido pelo iPhone, não usado pelo plano" (50 `880:19765`, `880:20729`, `682:2528`); local map and shareable (route hidden by default, first and last 200 m hidden). Location states: not requested, denied, no signal, poor accuracy (40 `657:1144`, `657:1243`). These never block a run by time. |
| **HealthKit (B)** | imported workouts (run with time and distance; strength "só a duração"); Apple Saúde status ("nada recebido", never "negado"); route presence |
| **Still blocked** | the earlier plan after a restart with pregnancy or postpartum (FND-ABC-04); any state where `Startability ≠ .startable`; post-onboarding lab or test entry (`UNSUPPORTED_V1`); "Mais pesadas" in the quick question (GAP-11, `UNVERIFIED`) |
| **FUTURE only (complete component, hidden)** | Time in zone (C10); live heart rate (GAP-34); sleep, HRV and resting HR in Hoje, Progresso and 72 (`notInV1`); "Mapa híbrido" (GAP-25); coach suggestion inside the session (`665:1079`); delete or remove (GAP-13: `683:2360`, `684:4669`, `687:4651`, `849:1153`); another device and sync (`849:3330`, `805:2723`); the athlete's own sleep report (`806:3406`); "longão após noite curta" (`572:1379`); the import link chosen by the athlete (`849:811`); duplicate between sources (`849:1066`) |
| **HealthKit write** | off by default; DR-121 is pending. No screen says the app writes runs to Apple Saúde. |

## 4. Motion priorities (V1)

1. Splash (81 `969:3138` / `969:3171`) and entry.
2. Plan building (10 · 30 Montando o plano and its twin).
3. Skeletons and loading (20/30/50/60 "carregando").
4. Progressive chart drawing (50 pace, 60 volume). **The heart-rate and zone charts do not animate in V1**: they are hidden.
5. Workout completion (40 "salvando" → summary). The celebration fires **only after `WriteOutcome.kept`**.
6. Number roll-ups where data exists.
7. Route animation **only with a real local route** (`RunRecorder`). With no coordinates, the header becomes a simple header (rule 99).
8. Feedback on key actions (confirm a proposal, declare readiness).

Zone bars on 71 (the motion twins `785:5601`, `785:5837`): the bar construction uses the engine's `minBpm`/`maxBpm` on a 90 → maximum axis (the convention in the Figma). Never hard-code positions.

## 5. Checklist for C (in addition to handoff §8)

- [ ] Snapshot of 71 for each `hr5r-*-presentation`. The rendered bpm equals the fixture. No percentage is computed in Swift; the percentage text comes from the copy table by `boundarySource`.
- [ ] No screen in the V1 build reaches any frame tagged `[FUTURO …]` or `[V1: oculto …]`.
- [ ] 40 renders only the "sem FC ao vivo" variants.
- [ ] 50/40: no iPhone-measured distance reaches a report (`declaredDistanceKm` stays empty).
- [ ] 10: Cuidados with no choice does not move forward; "Nenhum destes" sends `specialPopulation: []`.
- [ ] Restart with pregnancy or postpartum: screen `1103:2299` appears, and Hoje, Plano and Treino show no "Começar".
