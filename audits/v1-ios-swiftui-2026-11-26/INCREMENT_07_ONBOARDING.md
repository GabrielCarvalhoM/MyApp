# Increment 07 · Onboarding (10) and "Plano indisponível" (81)

Base: increment 06 (`4dc51a7`). Simulator `RepMile-C-SwiftUI`, PT-BR.

Steps: welcome (line art) → age (18–80) → run goal (RACE / PERFORMANCE / REGULAR / GENERAL, with race distance and date) and strength goal (RUNNING_SUPPORT / STRENGTH / HYPERTROPHY / MAINTAIN / GENERAL) → experience and recent training → week (run and strength days, long-run day, minutes, turns, 4/8/12/16 weeks) → equipment → optional recent result (performance anchor) → **Cuidados** → consents → "Montar meu plano" → building motion → the engine's outcome.

| Rule | How |
|---|---|
| Cuidados (`836:3299`) | "Gestação atual" → `PREGNANCY`, "Parto nos últimos 12 meses" → `POSTPARTUM`, "Nenhum destes" → `[]`; **no choice = cannot continue**; the key is always sent. |
| Eligibility | Six flags nil until answered (never false by default); the nonclinical confirmation is required unless a flag is yes (then the engine routes to a human). |
| Consents | Three explicit yes/no choices, none defaulted. |
| Outcome | Only `BoundaryAnswer.planOutcome`: plan created → the app; **outside V1 scope → 81 "Plano indisponível · sinal informado no cadastro"** (`838:4053`), no tabs, nothing startable, "Revisar minhas respostas"; clinical → professional assessment; ASK / invalid → review; failure → retry. |
| Fixture phase | After `planCreated`, the composition swaps to the reader of the state the engine captured after enrolment (`special-none-plan` → first week). A clinical flag at enrolment has no capture: the fixture writer answers an honest failure, never a plan. |

## Tests

- RepMileUI unit 17/17; new `OnboardingTests`: no choice or an unanswered flag cannot be sent; "Nenhum destes" encodes `specialPopulation: []` inside the real `IntakeRequest`; pregnancy/postpartum encode the engine codes; captured outcomes (`planCreated`, `outsideV1Scope`); anchor time parsing.
- XCUITest 29/29 ([log](results/inc07-onboarding/xcuitest.txt)); new: "Nenhum destes" → plan → Hoje of the first week; pregnancy → 81 with no tabs.

## Found and fixed

`.none` as an argument of type `Care?` meant `nil`, not "Nenhum destes": the case is now `.noneOfThese`.

**REAL_ATHLETE_READY = NO.**
