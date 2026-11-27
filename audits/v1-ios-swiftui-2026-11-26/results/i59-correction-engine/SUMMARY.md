# #59 history correction accepted by the engine: evidence

Code under test: `3034f97` (branch `claude/v1-ios-swiftui-i59-correction-engine`, base `claude/v1-ios-swiftui` 7bdc06d). Simulator only.

| Check | Result | Evidence |
|---|---|---|
| RepMileUI unit (`xcodebuild test -scheme RepMileUI`, RepMile-C-3) | 130/130, 0 skipped | `repmileui-unit.txt` |
| `sim.sh all --sim RepMile-C-3` (build, launch, XCUITest) | ok · 41/41, 0 skipped | `sim-manifest.json` (uncommittedFiles=1: `repmileui-unit.txt` written beforehand, no code), `xcuitest.txt` |
| Engine replay (real CoachingCore + facade, synthetic athlete) | ALL PASS, journeys 0, A, A2, B–G | `engine-replay.txt`, `scratch/i59-engine-replay.mjs` |
| `guard.mjs` (role C) | 0 forbidden, 0 needing approval | run on the final HEAD |
| `swift-size.mjs` | 0 above 350 outside the baseline | run on the final HEAD |

`testKeptCorrectionIsSaved` cause: after one swipe, "Dor · Não" sat under the sheet's inline navigation bar, which took the tap. The screen was never answered, so "Enviar correção" stayed disabled. The test now taps only once the element is whole between the bar and the keyboard, and asserts each answer, the confirmation and the enabled send.

`scratch/`: `i59-engine-replay.mjs` is the replica of the final code. `replay59.mjs` (flags) and `i59-probe*.mjs` are the discovery path, superseded.

Reviews of 40a1039: QRE changes requested (P1 fixed in 3034f97). SSCTR APPROVE_WITH_NOTES (no P0/P1; P2-1 and P2-2 fixed).
Open: the run report sends no screen (replay G: ASK, so no ATHLETE voice exists in the app today); per-voice `observedAt`/`occurrenceDate` and seconds/conditions/walkBreaks need a contract change; a clinical "sim" discards the correction (frozen-core question).
