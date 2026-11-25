# V1HR5 — Baseline audit (phases 1 and 2)

Mission: RepMile five-zone heart-rate intelligence V1 ([Founder request](FOUNDER_REQUEST.md)), 2026-11-25, Mac mini M4.

## 1. Environment

| Item | State |
|---|---|
| Machine | Mac mini M4 (Apple Silicon), macOS 27.0 (Darwin 27.0.0) |
| Node.js | v24.19.0 (fnm); CoachingCore `engines: >=24` |
| Swift / Xcode | Swift 6.4.2, Xcode 27.2 (27B52) |
| Physical iPhone | iPhone 17 Pro Max (iPhone18,2), connected (`xcrun devicectl list devices`: `connected`, physical) |
| Simulators | iPhone 17, 18 Pro, 18 Pro Max, 17e (not used for evidence) |
| Device lock | `tools/device-lock/with-device.sh <coachinghost|healthkit|integration> [--wait] -- <cmd>` (kernel flock) |
| Existing native harness | `audits/v1-aif-p0-jsc-2026-11-17/ios` (P0Host package and the plan B `DeviceHost` Xcode project), the Node oracles of the V1 final physical validation |

No tool was installed or reinstalled. The one install was the package's own locked dependencies (`npm ci`, `ajv` 8.20.0), for the new worktree, which has no `node_modules`. Its files are byte-identical to the final-freeze worktree's `node_modules` (compared file by file).

## 2. Git

`git fetch --all --prune --tags` ran from the AIF P0 worktree. The remote is `origin` (`GabrielCarvalhoM/MyApp`). Every branch named in the request is local and on the remote at the same commit:

| Branch | Local = remote | Worktree | Status |
|---|---|---|---|
| `claude/v1-cc-final-physical` | `a7e2e24` | `myapp-v1-final` | clean |
| `claude/v1-parallel-foundation` | `077f031` | `myapp-v1-foundation` | clean |
| `claude/v1-ui-functional-reconciliation` | `476b657` | `myapp-v1-ui-reconciliation` | clean |
| `claude/v1-ios-coachinghost` (A) | `8d2a7c0` | `myapp-v1-ios-coachinghost` | clean, not started |
| `claude/v1-ios-healthkit` (B) | `8d2a7c0` | `myapp-v1-ios-healthkit` | clean, not started |
| `claude/v1-five-zone-heart-rate` | did not exist | — | — |

- Tag `v1-parallel-base-2026-11-24` → `8d2a7c0`.
- Ancestry is linear: `460a9ab` (content bound by the freeze) → `6482749` (freeze record) → `a7e2e24` → `8d2a7c0` → `077f031` → `476b657`. All are ancestors of `476b657`.
- **Mission worktree:** `~/.codex/worktrees/myapp-v1-five-zone/MyApp`, new branch `claude/v1-five-zone-heart-rate` from `476b657`. No other branch or worktree was written.

## 3. The original freeze

`node CoachingCore/scripts/v1-final-release-freeze.mjs --check` on `476b657`, before any change:

```
REPMILE-COACHINGCORE-V1-RC-1: 85/85 of its other bound files byte-identical; 2 declared amendments
CoachingCore/src/boundary/views.mjs: amended (RC-1 38c3c6144273, now 6f0eb07c5093) for SEC-BC-R2-01
CoachingCore/src/boundary/custody.mjs: amended (RC-1 f58b52399eca, now fc576c433b26) for FPV-01
nothing else changed in CoachingCore since 89796df (7 files)
no untracked file in CoachingCore
every file the runtime reads is present (87)
bundle 9cf3149b83540685: 45 CoachingCore modules equal to the bound sources, 16 assets equal to the bound data files
REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE: 87/87 consumed files byte-identical; bundle 9cf3149b83540685 as recorded; two amendments over RC-1 declared
```

The historical linker (`audits/v1-aif-p0-jsc-2026-11-17/build/link.mjs`), run in a pristine detached checkout of `476b657`, rebuilds the frozen bundle `9cf3149b83540685` byte for byte (`git status` empty). The bundle build is therefore deterministic, and the amended bundle can be built with the same tool.

## 4. Baseline suite

`node --test` (spec reporter, as the freeze record) in a pristine detached checkout of `476b657` (`results/node/suite-baseline-476b657.txt`):

**1942 tests · 1895 pass · 47 fail.** The 47 distinct failing titles are exactly the freeze record's (`audits/v1-final-physical-2026-11-24/results/node/suite-freeze.txt`, diff empty). They are the known historical failures: earlier-freeze preservation checks that each later amendment fails by design, and named open limits. They are not regressions of this mission.

Two process notes, for honesty:

- The first run in the new worktree gave 1729/1674/55 because `ajv` was missing: 8 test files could not load. It was discarded, and the dependencies were installed.
- A second run was invalidated: it was still running in the mission worktree when the first source edit was made. It was stopped. The baseline above comes from a separate pristine checkout that no edit could reach.

## 5. The engine as found (phase 2)

### 5.1 Where heart rate lives

| Question | Finding (code, values) |
|---|---|
| 1. Where the three zones are computed | `CoachingCore/src/v1-run-calibration.mjs` `heartRateOf`, values `CoachingCore/v1/RUN_CALIBRATION_EXTENSION_V1.json` `heartRate`, decided by SSCTR-V1RC-DECISION-r1 Q6 and enabled by the V1X-RUN-HR record bound to `d9f7429b…84aa`. |
| 2. Domains or HR bands? | Three **heart-rate bands as fractions of an observed maximum** (LOW < 0.80, MODERATE 0.80–0.87, HIGH ≥ 0.87). They carry the three physiological intensity **domains** of the endurance literature (Seiler's three-zone model: SRC23, SRC24 of that decision) as a coarse, display-only reference. The engine's *prescription* domains are the effort cues (`effortCues`: EASY_CONVERSATIONAL … FIVE_K_EFFORT) and the pace domains (`domains`). Q6.separation keeps the three representations apart and never converts them. |
| 3. Lab references and measured maximum | `LAB_TEST` evidence (protocol, source, values with units, ≤ 182 days, no break of 14 days or more since): returned **as supplied** (`MEASURED_AS_SUPPLIED`, `checkedByTheApp:false`, `engineNamesThresholds:false`), never turned into zones and never mixed with estimated zones. The maximum observed by chest strap in a race, time trial or field test of 10 min or more at RPE ≥ 8, within 140–220 bpm and 365 days, gives the three zones. |
| 4. Informed or estimated maximum | **Neither.** A declared maximum with no qualifying effort and sensor is `HEART_RATE_DATA_NOT_QUALIFYING`. An age formula is refused (`ageFormula: AGE_FORMULA_NOT_INDIVIDUAL`), and heart-rate reserve is not used. |
| 5. Data used | `heartRate: {maxBpm, sensor}` on performance evidence: intake `performanceAnchors`, `runEvidence` declarations (v1-run-index), and the plan's own race rows (`actual.heartRate`). No average, resting heart rate or series. |
| 6. Effect on prescription and progression | **None.** `role: REFERENCE_SCALE_ONLY`, `sessionTarget:false`, `gatesProgression:false`, `convertedToPaceOrEffort:false`. A test asserts that heart rate changes no pace band, estimate or session guidance. The only behavioural statement is the conservative cue text: a HIGH reading in an easy, long or recovery run may suggest slowing, never speeding up. |
| 7. Exposure at the boundary | `runCalibration` is one of the readings (`integration.mjs READINGS`) kept in `carried.presentation.readings` under the carried MAC, and returned by `presentation()`. |
| 8. Path to SwiftUI | Proposal CHG-UI-1 (`audits/v1-ui-functional-reconciliation/proposals/CoachingPresentation`, `Readings.swift` `HeartRateZones`) decodes `status`, `reason`, `basis`, `observedMaximumBpm`, `zones` (name, low, high) and `values`. GAP-37 records the Figma's five zones and "informed maximum" against the engine's three zones. |
| 9. No heart rate | `UNAVAILABLE` with a typed reason (`NO_MEASURED_HEART_RATE`, `HEART_RATE_DATA_NOT_QUALIFYING`, `MODE_WALK_JOG_RESTART_RETURN`, `HOLD_NO_PRESCRIPTION`, `EXTENSION_NOT_ENABLED`). The prescription is unaffected (effort cue, pace band when calibrated). |
| 10. Dependencies | `runCalibration` sits inside v1-run-index (CAPACITY gates every boundary). `runForecast` and `paceInsights` do not read heart rate (`paceInsights.heartRateInput:false`). Withdrawal (Q9) and the hold floor (SSCTR-V1RC-R-09) apply to both heart-rate paths. Recovery, safety screens and strength never read heart rate. |

### 5.2 Constraints that bind the amendment

- **The V1X-RUN-HR record** (`SSCTR_V1RC_RUN_RECORDS.json`) is bound to the heart-rate paths of `v1-run-calibration.mjs`: "a change to any of them requires the recheck to confirm or remove this record". So `heartRateOf`, the withdrawal fold and the heart-rate output fields must stay as they are. The amendment must be additive, beside them.
- **The integration contract** (`audits/v1-parallel-foundation-2026-11-24/PARALLEL_IMPLEMENTATION_CONTRACT.md` G-1): `heartRate` is not sent on the DEVICE channel and no heart-rate permission is requested. `IntegrationContracts/DeviceActivity.swift` omits `heartRate` on purpose. This mission does not widen either.
- **Custody keys:** the integration boundary's review allow-list does not include `runEvidence` (FND-HR5-01 below). Through the app, a heart-rate reference therefore reaches the engine only through intake anchors (enroll, restart) and the plan's own race rows.

### 5.3 Findings of the audit (pre-existing; not fixed by this mission)

| Id | Finding | Evidence | Owner |
|---|---|---|---|
| FND-HR5-01 | The frozen integration boundary refuses a review carrying `runEvidence` (`INVALID_REQUEST`, "1 field is not part of a review"). Declared performance evidence (a field test, a race outside the plan) cannot reach the run calibration from the app. | `hr5-oracle.mjs` journey `hr5-declared`; `custody.mjs` review keys | A + SEC (contract closure mission) |
| FND-HR5-03 | CHG-UI-1 `StrengthExposure.descriptiveOnly` is not optional. The frozen engine answers `{status: NOT_APPLICABLE, reason: NO_PRESCRIPTION}` under a hold, so a whole hold presentation does not decode with the proposal's types. | reproduced on `476b657` (probe of a hold after onboarding) | C (CHG-UI-1) |

FND-HR5-02 was found and fixed during implementation; it is recorded in the [test report](TEST_REPORT.md).

## 6. Gate

Repository intact, baseline available and verified (freeze 87/87, suite = freeze record), worktree isolated. Sporting changes were authorized to start.
