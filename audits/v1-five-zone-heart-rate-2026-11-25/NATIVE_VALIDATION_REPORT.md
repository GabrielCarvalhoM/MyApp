# V1HR5 — Native validation report (phase 7)

All athletes and records are synthetic. Nothing was written to the device's Apple Health, no real data was used, and `syntheticOnly` was never set to `false`. Logs are in `results/mac/` and `results/device/`. UDID, team ID, Apple ID, device name and personal paths are removed.

## 1. What ran

- **Bytes:**
  - CoachingCore as in `822e2c0`: values `387d66a7…`, module `86ff6fd5…`, `v1-run-calibration.mjs` `8203b875…`, exactly the bytes SSCTR-HR5-RECHECK-r1 binds;
  - the amended bundle `2f69066416cdec4e8ed171933ab3d03a7412f44105122eb3a1a7f907e84b7e9c`: 49 modules, 18 assets (the five-zone values and the enabling records among them), export gate 0 mismatches;
  - every test checked that the shipped bundle hashes to its build manifest.
- **Build:** `native/build.sh`.
  - The historical linker and oracles run unchanged under `native/redirect.mjs` and write only into this mission's copy of the iOS package.
  - It checks that the historical package is untouched (no tracked change and no untracked or ignored residue), that the bundled values equal the engine pin, and that the records are bundled.
  - It is deterministic: `--twice` leaves no diff.
  - The historical linker also rebuilds the frozen bundle `9cf3149b…` byte for byte from `476b657`.
- **Fixtures** (all regenerated over the amended engine): `j5`, `p16`, `focal`, `core`, `int`, `final`, `hmac`, and the new `hr5` (10 journeys, 64 steps, the boundary **on**) with its module-level unit input.
- **Host:** Mac mini M4, macOS 27.0, Xcode 27.2, Swift 6.4.2, Node v24.19.0.
- **Device:** iPhone 17 Pro Max (`iPhone18,2`), iOS 27.2.1, Release, `debuggerAttached: false`, Low Power Mode off, battery 85 %, thermal state `fair`. It was reached through `tools/device-lock/with-device.sh integration --wait` for every invocation (plan B host, `xcodebuild test-without-building`, a clean `build-for-testing` first).

## 2. Node × macOS JavaScriptCore × iPhone JavaScriptCore

A step is:

- **IDENTICAL** when every digest equals Node's;
- **EXPLAINED_LIBM** when only the raw answer and stored digests differ, while the digests without the Race Forecast, the canonical record, the codes, and the five- and three-zone summaries are equal. This is the Race Forecast's ULP noise (RFC-NUMERIC-1). For hr5, the forecast-stripped digests `answerSans`/`storedSans` were added to the driver so that this rule is as strict as final-driver.js's;
- **DIVERGED** otherwise, which fails the test.

| Fixture | Mac JSC | iPhone JSC | Frozen bundle on the iPhone (2026-11-24) |
|---|---|---|---|
| final, memory store (184 steps) | 0 DIVERGED: 57 IDENTICAL, 127 EXPLAINED_LIBM | the same | 57 / 127 / 0 |
| final, native file store + Keychain anchor | the same; 66 anchor writes, 0 Keychain failures | the same | the same |
| int (78 steps) | 0 DIVERGED: 22 IDENTICAL, 56 explained by their final replay, 0 unexplained | the same | 56 explained |
| **hr5, memory store (64 steps)** | **0 DIVERGED**: 10 IDENTICAL, 54 EXPLAINED_LIBM | **the same** | — (new) |
| **hr5, native file store + Keychain** | **0 DIVERGED**; 17 anchor writes, 0 Keychain failures | **the same**, also in en-US | — |
| **five-zone module units** (`__hr5units`: edges for every maximum 140–220, readings on the edges, the classifier, refusals) | **identical to Node, 81 maxima** | **identical** | — |
| Core Safety & Lifecycle (24 journeys, 171 steps) | 0 DIVERGED, digest equal, anchors equal | the same in en-US and pt-BR | the same |
| J5 / P16 and restorations, tampered asset refused | 5/5 | 5/5 | 5/5 |
| Locale and sort coverage, libm bits | pass; `localeCompare` 0 | pass (en-US); libm 31 calls, only at RFC-NUMERIC-1 sites | the same |

- **The five zones are the same value in all three runtimes.** Each hr5 step compares the readable summary (status, reason, reference kind/bpm/evidence, confidences, conflict, the five edges, the safety flags, the session-role histogram) **and** the engine-hash digest of the whole `heartRateFiveZones`, all equal on every step.
- **The amendment adds no runtime divergence:** the final journeys keep exactly the frozen bundle's pattern (57 / 127 / 0).

## 3. Cases on the device (journeys of `hr5.json`, the boundary on)

| Journey | What the iPhone computed (equal to Node) |
|---|---|
| `hr5-strap` (chest strap 186) | AVAILABLE, OBSERVED_MAXIMUM, Z1 < 134, Z2 134–148, Z3 149–161, Z4 162–170, Z5 ≥ 171; easy-family cue at 162; survives a week, a **reopen** (new integration over the same store and anchor) and a **tampered five-zone value** (`INTEGRITY_FAILURE`, plan refused; restored, OK) |
| `hr5-lab` (lab 190, treadmill, ECG) | AVAILABLE, LAB_MEASURED_MAXIMUM, 137 / 152 / 165 / 175; the three-zone output shows the lab values as supplied |
| `hr5-conflict` (strap 192, lab 180) | UNAVAILABLE / REFERENCE_CONFLICT, both reported, no cue |
| `hr5-none` (no watch) | UNAVAILABLE / NO_MEASURED_HEART_RATE through two weeks; the plan runs by effort |
| `hr5-invalid` (optical, 300 bpm, `"188"`) | UNAVAILABLE / HEART_RATE_DATA_NOT_QUALIFYING; no failure |
| `hr5-extreme-low` / `-high` (140 / 220) | 101 / 112 / 122 / 129 and 158 / 176 / 191 / 202, the SSCTR worked example for 140 |
| `hr5-hold` (pain) | CLINICAL_HUMAN_REQUIRED; at once UNAVAILABLE / HOLD_NO_PRESCRIPTION, every session NONE; the hold persists across a reopen |
| `hr5-declared` (runEvidence in a review) | refused by the frozen boundary (`INVALID_REQUEST`, FND-HR5-01); nothing moves |
| `hr5-restart` | the new plan from the canonical record keeps the reference (186) |

## 4. Persistence and process death (iPhone)

The carried readings, the five zones among them, persist in the native file store under the carried MAC.

| Phase | Result |
|---|---|
| `deathA1`: killed after the rename, before the answer | the process died, by design (`xcodebuild` exit 65, "restarting after unexpected exit") |
| `deathB1`: killed after the temporary file was synced, before the rename | the same |
| `recover`: a new process over the same files and Keychain | **A:** stale `.lock` cleaned, record v2 reads and verifies, the retry is `replayed`. **B:** `.lock` and `.json.tmp` cleaned, record v1 verifies, the retry is recorded (v2). |
| `testWriteFailureConfirmsNothing`, `testConcurrentWriters`, `testHmacVectors` (CryptoKit = Node) | pass |

## 5. Performance and memory (PF-0, iPhone, `lab/device-budgets.mjs`, exit 0)

| Measure | Amended | Frozen (2026-11-24) | Budget |
|---|---|---|---|
| Cold context + bundle p95 (n=10) | 46.4 ms | 47.4 ms | 1 s |
| Cold first plan p95 (n=10) | 112.7 ms | 105.7 ms | 2 s |
| Full-plan review p95 | 294.6 ms | 285.4 ms | 1.5 s |
| Review worst case | 300.7 ms | 290.2 ms | 3 s |
| Footprint after GC | 13.9 MB | 13.2 MB | 150 MB |
| Lifetime peak footprint | 33.1 MB | 33.4 MB | 350 MB |
| Atomic write p95 | 3.3 ms | 3.3 ms | 50 ms |
| Max main-queue stall | 9.1 ms | 9 ms | 100 ms |

The new reading costs about 3 % of review time and 0.7 MB after GC: all budgets pass.

## 6. Swift contract

- `proposals/CoachingPresentation`: 9/9 on the Mac (TEST_REPORT §4).
- The P0Host package (the native harness): 29 tests on the Mac, 0 failures (6 phase tests skipped by design); on the iPhone, every suite above.

## 7. Not run (stated, not claimed)

| Item | Why |
|---|---|
| Locked-device phase | It needs a person to lock the iPhone during the run. The amendment does not touch store or Keychain classes; it passed on the frozen bundle on 2026-11-24. |
| Reinstall phase | It deletes the host app from the device. Not done in this session; the persistence behaviour is unchanged by the amendment. |
| Airplane mode | Not set. The bundle and the tests make no network call (host contract: four functions, no network). |
| HealthKit, heart-rate series, a watch | Out of scope: no HealthKit, and the device channel sends no heart rate (G-1). Time in zone stays `UNAVAILABLE` by design. |

**Verdict: MACOS_JSC_VALIDATED and IPHONE_PHYSICAL_VALIDATED** for the five-zone amendment: calibration, contracts and serialization, sessions with and without a heart-rate reference, safety preservation, persistence and integrity. Locked-device and reinstall were not run in this mission.
