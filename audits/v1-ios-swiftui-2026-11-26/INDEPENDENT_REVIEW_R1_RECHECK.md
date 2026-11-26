# Front C · narrow recheck of increment 08 and dispositions (2026-11-26)

Two independent read-only rechecks of `c36532c..a8aefa0` (fresh contexts, worker ≠ judge), run by the engineering orchestrator after the
C session closed: **QRE** (code) → NOT_READY; **SSCTR** (copy, gates) → READY_WITH_CONDITIONS. Every finding was checked against the code.
Fixes are in increment 09 (this commit). Tests after the fixes: XCUITest 33/33, RepMileUI unit 23/23, RunRecorder 10/10,
CoachingPresentation 29/29, IntegrationContracts 10/10, 0 skipped ([results](results/inc09-recheck-fixes/)).

## Fixed in increment 09

| Finding | Fix | Regression test |
|---|---|---|
| QRE N1 **P1** (SSCTR N1 P2): `load()` cleared the gates, so during every read `globalGate` was nil — "Correr agora" opened and the outside-scope / clinical banners vanished | gates are no longer cleared; `isLoading` makes every start fail closed (`canStart`, `runGate`, "Começar" disabled); a generation token keeps only the newest read (QRE N9); an erase during a read is not undone | `ReloadGateTests` (3 tests) |
| QRE N3 / SSCTR N7: unplanned start not re-checked after the sheet closed | `startUnplannedRun()` re-reads `runGate` and `isLoading` | — (defence in depth) |
| QRE N2 P2: a restored recording already reported could be sent again | report opens as saved when `reportedEventId` is set | — (needs the kill/relaunch UI harness; see #39) |
| QRE N5 P2: unplanned run filed under the report day | `occurrenceDay(end:)`: device-local day of the recording's end; plan "today" only when it is that day | `testUnplannedRunDayIsTheDayTheRecordingEnded` |
| QRE N7 P2: screen required with the report not kept closed the recording | "screen required" only when kept; otherwise resendable | — |
| SSCTR N8 / QRE N11: only the BLOCKED gate tested | outside-scope and screen-required scenarios | `testUnplannedRunIsNotStartedOutsideScopeOrWithAScreenPending` |

## Rulings

- **QRE P1-11 / N3, the unplanned-run gate:** SSCTR rules that it matches the Founder's provisional decision (26/11: no unplanned run under a
  clinical block, outside V1 scope or with a symptom assessment pending) and that adding ASK, clock, record or repertoire reasons would be a
  new prescriptive rule. The allow-list stays; QRE N3's broader list is not applied.
- **Week without sessions (SSCTR N2):** a host-level gate is a contract change → CCP-C-04, issue #40. Front C invents no fallback rule.

## Open, tracked

#37 strength sets/reps from the athlete (SSCTR N3, QRE P1-8 partial, G03) · #38 resumed recording under a later hold (SSCTR rule recorded
there; blocks REAL_ATHLETE_READY) · #39 remaining P2/P3 (QRE N4, N6, N8, N10, N11; SSCTR N4–N6, N9; R1 P2 RunRecorder performance).

Clinical wording stays INTERIM / CLINICAL_HUMAN_REQUIRED. REAL_ATHLETE_READY = NO. A narrow independent verification of increment 09 is
required before integration (P1).

## Verification of increment 09 → increment 10

Independent read-only verification of `a15e938..3035841`: items 1–6 FIXED; **NOT_READY** for one P1 regression introduced by the fix of N7:
with `warningSignScreen = REQUIRED` and the report not kept (reproducible: planned run stopped for a symptom, fixture
`actions-C1-run-stop-symptom`), the screen banner was no longer shown. Increment 10: the screen-required flag is kept apart from `kept`; not
kept shows the banner with "Reenviar"/"Sair", kept shows it with "Concluir". New UI test `testSymptomStopAlwaysOffersTheWarningSignScreen`.
Test hardening: time deadline in `ReloadGateTests` (N3), Gregorian calendar in the day test (N4). XCUITest 34/34, RepMileUI unit 23/23
([results](results/inc10-screen-required/)). Remaining P3 (overlapping-load ordering test, reported-restore and not-kept+REQUIRED unit tests,
start briefly disabled during reloads without a hint, `PlanView.today` time base to confirm with A) → #39.

Verification of increment 10: READY_WITH_CONDITIONS. Applied: F1 (P2) the screen-required banner is sticky for the life of the report and
also shows with "Salvo" or an error; F2 the UI test asserts `report-not-kept`; F3 bounded scroll loops. XCUITest 34/34, unit 23/23.
F4 (pre-existing P3: a kept + REQUIRED report restored after a kill shows "Salvo" without the banner; the host gate still applies) → #39.
