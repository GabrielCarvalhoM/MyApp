# #72: "Não estou 100%", readiness and the unavailable day ask the eligibility screen (evidence)

Branch `claude/v1-ios-swiftui-i72-eligibility-rest` from `claude/v1-ios-swiftui` @ fffefbb (#68, PR #71). Verified HEAD 719a4173 (code); this folder is committed after it.
CoachingCore, IntegrationContracts and CoachingPresentation are unchanged (frozen). Simulator only: RepMile-C-2. Synthetic data only.

## Engine audit (`engine-replay.txt`, script `scratch/i72-write-sites.mjs`, real integration boundary, ALL PASS)

It extends #68's replay. Each request is shaped as its Swift view model encodes it, with the engine's own sign set per condition.

| Write site | Without a screen | Red-flag sign "sim" WITHOUT a screen | With an answered screen (dated the plan's day) |
|---|---|---|---|
| "Não estou 100%" (every condition) | ASK `eligibility.currentAssessment`, no guidance | **ASK `eligibility.currentAssessment`, no clinical route, no guidance**, for every one of the 9/13 signs, the four urgent rest signs included, and a lone sign with no intent | all "não": KEEP · an urgent sign: CLINICAL_HUMAN_REQUIRED + URGENT_CARE_ADVISED, plan BLOCKED, **even as the only sign answered, with no intent** · another sign: CLINICAL + PROFESSIONAL_ASSESSMENT |
| "Não estou 100%" during a hold | chest pain: CLINICAL + PROFESSIONAL_ASSESSMENT, `eligibility.currentAssessment` missing | (same row) | chest pain: CLINICAL + URGENT_CARE_ADVISED |
| Readiness after a hold | CLINICAL + `eligibility.currentAssessment` missing: the hold stands | breathless at rest: CLINICAL + PROFESSIONAL_ASSESSMENT (the urgent level is lost) | every sign "não": MODIFY READINESS_RESTART (released) · urgent sign: CLINICAL + URGENT_CARE_ADVISED · **one sign unanswered: CLINICAL with `readiness.warningSigns.<sign>` missing (not ASK)** |
| Unavailable day | ASK `eligibility.currentAssessment`, **a decisionId but nothing pending** | n/a | MODIFY RESCHEDULE_WITHIN_WEEK, pending decision, accept applies it |

In every flow, an incomplete screen or a screen dated after the plan's day gets ASK (readiness: the hold stands). A screen flag "sim" gets CLINICAL_HUMAN_REQUIRED + PROFESSIONAL_ASSESSMENT, plan BLOCKED, and nothing pending.

**The engine does not route a red flag before the screen.** The eligibility gate (`r6-adaptation.mjs` ~555-559) returns before the sign route, so the app cannot show the red-flag route ahead of the triage. The app keeps the delay to the minimum the engine allows:
- the signs come first, and the screen right after them;
- the send waits for the screen only: no other sign and no intent ("Não estou 100%"). For readiness, every sign must be answered unless one is "sim" (see below).

**Residual in the engine (not changeable here; SSCTR F2, P0 for REAL_ATHLETE_READY):** an urgent sign together with any screen flag "sim" (illness, pain, clinicalConcern) gets PROFESSIONAL_ASSESSMENT, not URGENT_CARE_ADVISED. The flag gate wins over the sign route. The same holds during a hold without a screen.

## What changed in RepMileUI
- `NotFeeling100ViewModel`:
  - Every entry point asks the screen, with #68's rule (`EligibilityScreen.unanswered` / `answered` / `dated`).
  - `requireEligibility` is removed, and so is the device-day fallback: the screen is dated by the plan's day only.
  - `canSend` is "the screen is answered and the plan gives the day".
  - ASK goes to `.needsAnswers(condition, set)`; "Voltar" returns to the same draft.
  - The clinical route shows #68's not-kept banner.
- `ReadinessViewModel`:
  - Carries the screen.
  - Every sign must be answered unless one is "sim". The engine answers an unanswered sign CLINICAL with that sign missing. The port does not expose `decision.missingInputs`, so the app would show that answer as a reported sign.
  - The still-blocked result uses the not-kept banner.
- `UnavailableDayViewModel`:
  - Carries the screen.
  - Only a pending decision (from the view, or from a MODIFY answer) counts as a proposal. Before, the decisionId of an ASK or of a clinical route was shown as a proposal that could be confirmed.
  - New `needsInput` and `clinical` states (Close). The sheet is now `.large` and scrolls.
- `FixtureCoachingWriter`: the three intents pass the same gate as reports. A missing screen gets `14-setPreferences` (ASK), and for readiness `actions-E2-break-clinical` (the hold stands). A flag "sim" gets `actions-E2-break-clinical`. Only existing captures are used.

## Gates on 719a4173
- RepMileUI unit tests: 154/154, 0 failures (`unit-tests.txt`; 140 before).
- `sim.sh all --sim RepMile-C-2` on 719a4173: build, launch and tests pass, 45/45 XCUITest, 0 skipped (`sim-manifest.json`, `xcuitest.txt`; the 3 uncommitted files are this folder). The pre-review code passed 45/45 too.
- `guard.mjs` (role C): 308 paths OK, 0 need approval, 0 forbidden.
- `swift-size.mjs`: 0 files above 350. `ExecutionAndSafetyTests.swift` drops to 275 lines (its NF and readiness tests moved to `EligibilityRestUITests.swift`).

## Reviews
- SSCTR: APPROVE_WITH_CONDITIONS.
  - F1: the ordering and gating are the least delay the frozen engine allows.
  - F2: the engine residual above (follow-up).
  - F3: #73 must show `guidance.level`.
  - F4: readiness with an unanswered sign; applied here as the sign gate.
- QRE: approve with changes, no P0/P1 code defects. Applied:
  - "Voltar" on "Não estou 100%";
  - the not-kept banners;
  - the readiness comment and the sign gate;
  - no "Voltar" loop on the unavailable day;
  - XCUITest order;
  - a fixture-writer test for the unavailable day;
  - evidence.
