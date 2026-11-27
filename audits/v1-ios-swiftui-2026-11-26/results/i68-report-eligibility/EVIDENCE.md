# #68: athlete reports carry the eligibility screen (evidence)

Branch `claude/v1-ios-swiftui-i68-report-eligibility`, merged with `origin/claude/v1-ios-swiftui` @ e5425f6 (#59, PR #69). Verified HEAD d750b3f (code); this folder is committed after it.
CoachingCore, IntegrationContracts and CoachingPresentation are unchanged (frozen). Simulator only: RepMile-C-2. Synthetic data only.

## Engine audit (`engine-replay.txt`, script `scratch/i68-write-sites.mjs`, real integration boundary, ALL PASS)

| RepMileUI write site | Sent before #68 | Engine without a screen | This PR |
|---|---|---|---|
| RunReportViewModel, planned run | `eligibility: nil` | ASK `eligibility.currentAssessment`, recorded 0 | the report asks the screen |
| RunReportViewModel, unplanned run | `nil` | ASK, recorded 0 | the report asks the screen |
| StrengthLogViewModel, planned | `nil` | ASK, recorded 0 | the log asks the screen |
| StrengthLogViewModel, unplanned | `nil` | ASK, recorded 0 | the log asks the screen |
| HistoryCorrectionViewModel (#59) | the screen | OK with the screen | unchanged; shares the `answered` rule |
| UnavailableDayViewModel | `nil` | ASK (a decisionId, nothing pending; view NEEDS_INPUT) | **not changed: follow-up** |
| NotFeeling100ViewModel from the shell (`requireEligibility=false`) | `nil` | ASK; a red-flag sign gets no urgent guidance (SSCTR probe) | **not changed: separate P0** |
| ReadinessViewModel | `nil` | CLINICAL_HUMAN_REQUIRED + missing `eligibility.currentAssessment` (the hold cannot be released) | **not changed: follow-up** |
| NotFeeling100 from the report or history (`requireEligibility=true`) | the screen, even when incomplete | OK only when answered | not changed (the send is not gated on an answered screen: same follow-up) |

Window (replay 8): the screen counts when assessed 0 to 14 days before. A screen dated tomorrow, a flag left null, or six "não" without the confirmation all get ASK. A screen answered earlier the same day is not reused on the athlete channel (ASK). With a "sim", the engine answers CLINICAL_HUMAN_REQUIRED, records nothing and the plan becomes BLOCKED (7). A symptom stop together with a "sim" is also clinical, and the engine asks the warning-sign screen (REQUIRED, 7b).

## Gates on d750b3f
- RepMileUI unit tests: 140/140, 0 failures (`unit-tests.txt`; there were 125 before #68 plus #59's).
- `sim.sh all --sim RepMile-C-2`: build, launch and tests pass, 43/43 XCUITest, 0 skipped (`sim-manifest.json`, `xcuitest.txt`). On the pre-merge base, the only failure was #59's known `testKeptCorrectionIsSaved`, which #59 fixed.
- `guard.mjs` (role C): 301 paths OK, 0 need approval, 0 forbidden.
- `swift-size.mjs`: 0 files above 350. One warning: `ExecutionAndSafetyTests.swift`, 309 lines (it was already 302 before).

## Fixture mode
`FixtureCoachingWriter` answers a report that has no answered, dated screen with the engine's captured ASK (`14-setPreferences`). It answers a "sim" with the captured clinical route (`actions-E2-break-clinical`). No capture holds a clinical route together with REQUIRED, so fixture mode shows the clinical route alone for case 7b. The app's handling of both is unit-tested from a scripted answer.
