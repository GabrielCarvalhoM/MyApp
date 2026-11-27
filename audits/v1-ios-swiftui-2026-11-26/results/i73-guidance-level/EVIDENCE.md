# #73: every clinical surface shows the engine's guidance level (evidence)

Branch `claude/v1-ios-swiftui-i73-guidance` from `claude/v1-ios-swiftui` @ c04ee8c4 (#72, PR #78). Verified HEAD dd877b2a (code); this folder is
committed after it. CoachingCore, IntegrationContracts and CoachingPresentation are unchanged (frozen). Simulator only: RepMile-C-2. Synthetic
data only.

## Where the level is in the frozen port

`BoundaryAnswer` has no `guidance` at its top level (the engine's `decision.guidance` is not decoded). The host facade appends the plan view
after each write (`facade/entry.mjs` `done`, the shape of api.mjs), and that view carries the level twice:
- `view.lastDecision.guidance`: the decision this answer made, read only when `lastDecision.decisionId == answer.decisionId`;
- `view.hold.guidance`: the standing hold.

`ClinicalGuidance` (RepMileUI `Features/Adapt/ClinicalGuidance.swift`) reads both and shows the higher. It is `urgentCare` only for
URGENT_CARE_ADVISED. Any other level, a code this build does not know, or no level at all shows the existing professional-assessment copy:
never nothing. A screen that keeps a route across resends (run report, strength log) only raises the level. The readiness result uses the
answer's level. When the answer has no view (a failed write: nothing changed), it uses the level of the hold the declaration answered.

## Engine replay (`engine-replay.txt`, script `scratch/i73-guidance.mjs`, real integration boundary + the host's view, ALL PASS)

`App shows` mirrors the Swift mapping exactly.

| Case | Engine level (decision) | App shows |
|---|---|---|
| NF, urgent sign "sim" + complete screen (each condition, each of the 4 urgent signs it asks; also alone, others unanswered, no intent) | URGENT_CARE_ADVISED | urgent route; Today and session detail: urgent hold |
| NF, non-urgent sign "sim" + complete screen (every non-urgent sign of each condition) | PROFESSIONAL_ASSESSMENT | professional assessment |
| NF, a non-urgent and an urgent sign "sim" + screen | URGENT_CARE_ADVISED | urgent (the higher) |
| NF during a hold, urgent sign + screen (the app always sends it since #72) | URGENT_CARE_ADVISED | urgent; Today urgent |
| NF during a hold, urgent sign, no screen (never sent by the app) | PROFESSIONAL_ASSESSMENT | professional (the engine's level; residual #79) |
| Readiness during a hold, urgent sign + screen (each of the 4) | URGENT_CARE_ADVISED | hold stands, urgent |
| Readiness during a hold, non-urgent sign + screen | PROFESSIONAL_ASSESSMENT | hold stands, professional |
| Readiness during an urgent hold, every sign "não" + screen | (released) | "de volta" |
| NF, urgent sign + screen flag "illness" sim | PROFESSIONAL_ASSESSMENT | professional (residual #79, SSCTR F2) |
| Urgent hold, then NF fever + screen | PROFESSIONAL_ASSESSMENT; `hold.guidance` becomes PROFESSIONAL_ASSESSMENT | professional; Today professional |
| Urgent hold, then a run report (screen none applies) | CLINICAL_HUMAN_REQUIRED PROFESSIONAL_ASSESSMENT; `hold.guidance` becomes PROFESSIONAL_ASSESSMENT | professional; Today professional |
| Run report, screen flag "injury" sim | PROFESSIONAL_ASSESSMENT | professional |

The app never shows less than the engine's level for an answer, and it never shows a level the engine did not give.

**New engine finding (for #79, not changeable here).** `hold.guidance` is the level of the *latest* decision that has one
(`views.mjs:58`), not the highest since the hold began. After an urgent hold, any later clinical answer at the professional level lowers the
standing hold's level. That includes a plain run report during the hold. Today then shows the professional-assessment banner. The app shows
the engine's level. Keeping the highest level since `hold.since` (from `HistoryView.decisions[].guidance`, which the port exposes) would be
an app-side persistence rule for clinical guidance. That needs an SSCTR/clinical decision; it is not implemented here.

## What changed in RepMileUI
- `ClinicalGuidance`, plus `BoundaryAnswer.clinicalGuidance` and `PlanView.clinicalGuidance`: pure mappings, no SwiftUI.
- The level is carried in each screen's state enum, so the view only renders it:
  - `NotFeeling100ViewModel.Outcome.blocked(_)`;
  - `ReadinessViewModel.Phase/Reply.stillBlocked(_)`, with `holdGuidance` injected for an answer without a view;
  - `UnavailableDayViewModel.Phase.clinical(_)`;
  - `clinicalGuidance` (sticky, rising only) on `RunReportViewModel`, `StrengthLogViewModel` and `HistoryCorrectionViewModel`.
- `UrgentCareBanner` is distinct from and more prominent than the professional banner:
  - a filled safety card with a 2 pt border, the urgent instruction as the title, and the blocked state as its label;
  - VoiceOver reads it as one element (header, first in its container) and gets a high-priority announcement when it appears.
- `ClinicalRouteBanner(reportKept:guidance:)` picks it on NF, readiness, unavailable day, run report, strength log and history correction.
  Today's blocked banner (with "Estou pronto para voltar") and the session detail's pause pick it from the hold's level.
- No history screen renders `HistoryView.decisions`, so there is no history decision surface to change.

## INTERIM copy added (CLINICAL_HUMAN_REQUIRED, G04)
No urgent string existed. The three keys below are new, marked INTERIM in `Copy/copy.psv`. They mirror the engine's own interim wording
(`v1-f08.mjs` signRoute, SSCTR-FF-Q9: "stop now and seek urgent medical care; if it is severe or does not settle, call your local emergency
number"). They give a care-seeking level only: no diagnosis, no treatment.

| Key | pt-BR |
|---|---|
| `state.blocked.urgent.title.interim` | Procure atendimento médico urgente |
| `state.blocked.urgent.body.interim` | Você informou um sinal de alerta. Pare agora e procure atendimento médico urgente; se for intenso ou não passar, ligue para o número de emergência local. Enquanto ele valer, não há treino planejado, e o seu registro continua guardado. |
| `state.blocked.urgent.body.interim.reportNotKept` | The same without "e o seu registro continua guardado". |

en and es are in `copy.psv`. The generator also exposed drift: `state.blocked.body.interim.reportNotKept` and `report.clinical.notKept`
(#68/#72) had been added only to the generated `.strings`, so regenerating would have deleted them. They are now in `copy.psv` with their
exact texts, and the generated diff only adds keys.

## Fixtures (real engine captures)
The shared set held no URGENT_CARE_ADVISED answer, so fixture mode showed chest pain at the professional level and hid the engine's outcome.
Front C now has its own captures:
- `RepMileUI/Captures`, generated by `RepMileUI/Tools/capture-engine.mjs` from the frozen engine through the integration boundary and the
  host's view. They are deterministic: regenerated byte-identical (`captures-fresh.txt`).
- One NF and one readiness answer per urgent sign, a readiness answer with a non-urgent sign, and the urgent hold's plan view.
- The app bundles them as the `Captures` folder reference (pbxproj `CC00000000000000000073A0`/`A1`). `FixtureStore` reads them after the
  shared set.
- `FixtureCoachingWriter` answers a "sim" sign with the capture of that urgent sign, if one exists. Which signs are urgent is not listed in
  Swift.
- A readiness declaration with a sign "sim" now gets the captured clinical answer. Before, it got the restart capture: another hidden outcome.
- New scenario `blocked-urgent`.

## Gates on dd877b2a
- RepMileUI unit tests: 167/167, 0 failures (`unit-tests.txt`; 154 before, 13 new in `GuidanceLevelTests`; existing assertions now carry
  the level).
- `sim.sh all --sim RepMile-C-2`: build, launch and tests pass, 49/49 XCUITest, 0 skipped (`sim-manifest.json`, `xcuitest.txt`; 45 before,
  plus 4 in `GuidanceLevelUITests`; the one uncommitted entry is this folder). `urgent-not-feeling-100-RepMile-C-2.png` is the urgent
  route screenshot from that run.
- `guard.mjs` (role C): 329 paths OK, 0 need approval, 0 forbidden.
- `swift-size.mjs`: 0 files above 350.

## Port gaps (CCP proposals for #20)
- CCP-73-1: `BoundaryAnswer` does not decode the decision's `guidance` (nor its `missingInputs`, #72). The level is reachable only through
  the plan view the host appends. If that read fails (`viewError`), a clinical answer carries no level: the app shows the
  professional-assessment copy (readiness: the level of the hold it answered). Proposal: `BoundaryAnswer.decision: DecisionSummary?` (or
  `guidance: Guidance?`), read-only, additive.
