# V1HR5R — Native validation report

All athletes and records are synthetic. Logs are in `results/mac/` (Mac) and `results/device/` (iPhone). The UDID, team ID, Apple ID and personal paths are left out.

## 1. What ran

- **Bytes:**
  - the CoachingCore of the closing tree, after QRE rounds 1–2;
  - values `784ba7fe…` and the code bytes SSCTR-HR5R-RECHECK-r2 binds;
  - the amended bundle **`d087ad51b37dfc4e35bcca60cfba55ee5ad854cfb5a6e67ba0ef3e7411829d44`**: 50 modules (the profile module among them), 18 assets (the revision-2 values and the new enabling records among them), export gate 0 mismatches over 811 bindings.
- **Build:** [`native/build.sh`](native/build.sh), copied from V1HR5's.
  - The historical linker and oracles run unchanged under `native/redirect.mjs`, and write only into this mission's copy of the iOS package.
  - It checks that the historical package and V1HR5's evidence are untouched, that the bundled values equal the engine pin, and that the records are bundled.
  - It is deterministic: `--twice` leaves no diff.
- **Fixtures,** all regenerated over the corrected engine: `j5`, `p16`, `focal`, `core`, `int`, `final`, `hmac`, and `hr5.json`.
  - `hr5.json` now holds this mission's journeys (`mac/hr5r-oracle.mjs` and `hr5r-driver.js`): 13 journeys and 98 steps, production authority on (the first session wrote 14; see §7).
  - It also holds its module-level unit input: 111 maxima (120–230), 63 ages, readings on and between the edges, custom limits, and the classifier (strap and optical, defaults and given limits).

## 2. Node × macOS JavaScriptCore

As before, a step is **IDENTICAL** when every digest equals Node's, and **EXPLAINED_LIBM** when only the Race Forecast's ULP noise (RFC-NUMERIC-1) differs while every other digest and the readable five- and three-zone summaries are equal. A step is **DIVERGED** otherwise, which fails the test.

| Fixture | Mac JSC | Frozen bundle (2026-11-24) |
|---|---|---|
| final, memory store (184 steps) | **0 DIVERGED**: 57 IDENTICAL, 127 EXPLAINED_LIBM | 57 / 127 / 0 (the same pattern) |
| final, native file store + Keychain anchor | the same; 66 anchor writes, 0 Keychain failures | the same |
| int (78 steps) | 0 DIVERGED: 22 IDENTICAL, 56 explained by their final replay, 0 unexplained | 56 explained |
| **hr5r, memory store (98 steps)** | **0 DIVERGED**: 14 IDENTICAL, 84 EXPLAINED_LIBM | — (new) |
| **hr5r, native file store + Keychain** | **0 DIVERGED**; 25 anchor writes, 0 Keychain failures | — |
| **five-zone module units** | **identical to Node**: 111 maxima; age 30 gives `123,153,169,184` | — |
| Core Safety & Lifecycle (171 steps) | 0 DIVERGED | the same |
| J5 / P16, restorations, tampered asset refused | pass | pass |

`P0Host` package: **29 tests, 0 failures, 6 phase tests skipped by design** (locked device, reinstall and process death run only as device phases). Log: [`results/mac/swift-test-mac.log`](results/mac/swift-test-mac.log); verdict counts: [`results/mac/verdicts.json`](results/mac/verdicts.json).

**The journeys the Mac replayed, each equal to Node:**

| Journey | Five zones |
|---|---|
| `hr5r-age30` (no device) | AGE_ESTIMATE 190: Z1 ≤123, Z2 124–153, Z3 154–169, Z4 170–184, Z5 ≥185. It survives a week and a reopen; a tampered cue (170 → 171) gives `INTEGRITY_FAILURE`. |
| `hr5r-declared` | declared 195 gives 126 / 157 / 173 / 189; custom limits 130 / 150 / 165 / 180 survive a reopen and a week; cleared, it is back to 190. A tampered override gives `INTEGRITY_FAILURE`. |
| `hr5r-strap-above` (40 y, strap 186) | OBSERVED_MAXIMUM 186: 120 / 150 / 165 / 180 |
| `hr5r-strap-below` (30 y, strap 186) | AGE_ESTIMATE 190; the strap value is shown and classified Z5 as a single value |
| `hr5r-lab` (25 y, lab 190) | LAB_MEASURED_MAXIMUM 190 |
| `hr5r-conflict` (40 y, strap 192, lab 180) | AGE_ESTIMATE 180; the conflict is shown |
| `hr5r-noage` | AGE_REQUIRED; then a declared 188 gives zones |
| `hr5r-hold` | CLINICAL_HUMAN_REQUIRED, withheld; a declaration during the hold is recorded and still withheld; the hold persists across a reopen |
| `hr5r-invalid` | four refusals, a replayed retry, `CONFLICT_IDEMPOTENCY_KEY` |
| `hr5r-restart` (age 31) | the declared maximum is kept, the age in force is 31 |
| `hr5r-optical` | AGE_ESTIMATE; the optical 176 is classified Z4 with the optical caveat |
| `hr5r-age18` / `-age80` | 202 / 140 |

## 3. iPhone: run (2026-11-25, completion session)

The first session could not reach the device (§6). In the completion session the Founder connected the iPhone by cable and signed in to Xcode. Nothing in the CoachingCore, the bundle, the fixtures, the tests or the host project was changed or rebuilt from source: the committed `native/ios` copy was built for the device and run as it stands.

- **Device:** iPhone 17 Pro Max (`iPhone18,2`), iOS 27.2.1, paired over USB, Developer Mode on. Release, `debuggerAttached: false`, Low Power Mode off, battery 75 % and charging. Thermal state `nominal` at the start; `serious` during the performance and cold-start phases.
- **Bytes on the device:** the shipped bundle is **`d087ad51b37dfc4e35bcca60cfba55ee5ad854cfb5a6e67ba0ef3e7411829d44`**. Each replay checks it against the manifest, and the units test reports it.
- **How:**
  - every invocation went through `tools/device-lock/with-device.sh integration --wait`;
  - plan B host, a clean `build-for-testing` (automatic signing, `-allowProvisioningUpdates`, the Xcode account), then `xcodebuild test-without-building` per suite;
  - `-testLanguage`/`-testRegion` were given where a locale is named.
- **Logs:** [`results/device/`](results/device/). The UDID, team ID, Apple ID, device name and personal paths are redacted.

### 3.1 Node × macOS JavaScriptCore × iPhone JavaScriptCore

| Fixture | Mac JSC | iPhone JSC | Log |
|---|---|---|---|
| **hr5r, memory store** (13 journeys, 98 steps) | 0 DIVERGED: 14 IDENTICAL, 84 EXPLAINED_LIBM | **the same** | `boundary.log`, `fivezone-en.log` |
| **hr5r, native file store + Keychain** | 0 DIVERGED; 25 anchor writes, 0 Keychain failures | **the same: 25 anchor writes, 0 Keychain failures**, also in en-US | `boundary.log`, `fivezone-en.log` |
| **five-zone module units** (111 maxima 120–230, 63 ages 18–80, edges, custom limits, classifier, refusals) | identical to Node | **identical to Node**; age 30 gives `123,153,169,184` | `boundary.log`, `fivezone-en.log` |
| final, memory store (12 journeys, 184 steps) | 0 DIVERGED: 57 / 127 | **the same: 57 IDENTICAL, 127 EXPLAINED_LIBM** (the frozen pattern) | `boundary.log` |
| final, native file store + Keychain | the same; 66 anchor writes | **the same; 66 anchor writes, 0 Keychain failures** | `boundary.log` |
| int (4 journeys, 78 steps) | 0 DIVERGED: 22 IDENTICAL, 56 explained | **the same: 56 candidates, 0 unexplained by their final replay** | `boundary.log` |
| Core Safety & Lifecycle (24 journeys, 171 steps) | 0 DIVERGED | **0 DIVERGED, 56 EXPLAINED_LIBM, digest and anchors equal, in en-US and in pt-BR** | `core-en.log`, `core-pt-BR.log` |
| J5 / P16, restoration continuity, host contract, tampered asset refused | pass | **5/5**; J5 and P16 every step IDENTICAL; host contract 0 misses, 0 unsupported calls | `equivalence.log` |
| HMAC vectors (CryptoKit = Node) | pass | **40/40 direct and via JS**, Keychain class `cku` | `boundary.log` |
| Locale and sort coverage | pass | **pass**: `localeCompare` 0, digest equal, 0 pairs differing across en-US / pt-BR / code units | `focal-en.log` |
| libm bits | — | **31 calls (exp 17, pow 14); 3 at ±1 ULP, at the RFC-NUMERIC-1 sites**: the same calls and differences as V1HR5's run | `libm.log` |

`BoundaryTests` on the iPhone: 9 passed, 6 skipped by design. Five of the skips are the phase tests, which need `P0_PHASE` (§3.3). The sixth, `testIntegrationBoundaryNativeStore`, is skipped by its own rule ("int-driver.js has no store hook; covered by testFinalJourneysNativeStore"), as on the Mac and in V1HR5's run.

### 3.2 What the iPhone computed: the mission's cases

Every step of every journey below is the Node oracle's answer on the device. Each step compares the digests **and** the readable five- and three-zone summaries; 0 steps diverged, over the memory store and over the native file store + Keychain.

| Founder check | Journey(s) on the iPhone | Result |
|---|---|---|
| Five zones for an athlete with no wearable | `hr5r-age30`, `hr5r-noage`, `hr5r-optical` | **YES:** AGE_ESTIMATE 190, Z1 ≤123 · Z2 124–153 · Z3 154–169 · Z4 170–184 · Z5 ≥185, cue at 170. No age gives AGE_REQUIRED; an optical reading is a single classified value with its caveat. |
| Estimate by age | `hr5r-age30`, `-age18`, `-age80`, `hr5r-restart`; units over 63 ages | **YES:** 220 − age: 190 / 202 / 140; in `hr5r-restart` the declared maximum is kept and the age in force is 31; every age 18–80 equal to Node |
| Personalised maximum | `hr5r-declared`, `hr5r-noage` | **YES:** declared 195 gives 126 / 157 / 173 / 189; a declared 188 gives zones without an age |
| Custom limits | `hr5r-declared`; units (custom limits and their refusals) | **YES:** 130 / 150 / 165 / 180 exact; cleared, back to 190 |
| Persistence after closing and reopening | `hr5r-age30`, `hr5r-declared`, `hr5r-hold` (`reopen`), native store; process death (§3.3) | **YES:** after a reopen (a new integration over the same native file store and Keychain anchor) and a week, the estimate, the declared maximum, the custom limits and a hold are all still in force. A process killed mid-commit is recovered by a new process over the same files and Keychain. |
| Integrity and custody | `hr5r-age30` and `hr5r-declared` (`raw.tamper`), tampered asset, HMAC, anchors | **YES:** a tampered cue (170 → 171) and a tampered override (195 → 205) give `INTEGRITY_FAILURE`; a tampered bundle asset is refused; the host's CryptoKit HMAC gives Node's seals; 25 + 66 anchor writes, 0 Keychain failures |
| Safety states | `hr5r-hold`, Core Safety (24 journeys, en-US and pt-BR) | **YES:** CLINICAL_HUMAN_REQUIRED withholds the zones at once (`HOLD_NO_PRESCRIPTION`, every session role NONE); a declaration during the hold is recorded and withholds nothing less; the hold persists across a reopen. The Core Safety journeys are equal to Node. |
| Measured references kept apart | `hr5r-strap-above`, `-strap-below`, `-lab`, `-conflict` | **YES:** OBSERVED_MAXIMUM 186 (120 / 150 / 165 / 180); strap below the estimate shown and classified Z5; LAB_MEASURED_MAXIMUM 190; a conflict falls back to AGE_ESTIMATE 180 and is shown |
| Invalid input | `hr5r-invalid` | **YES:** four refusals, a replayed retry, `CONFLICT_IDEMPOTENCY_KEY` |

"Reopen" is a new integration over the same store and anchor inside one test process. Persistence of the same native store across a real process end is the process-death phase (§3.3), which uses the store mechanism and not a heart-rate journey. No heart-rate profile was written by one process and read by the next.

### 3.3 Persistence and process death (iPhone)

| Phase | Result | Log |
|---|---|---|
| `deathA1`: killed after the rename, before the answer | the process died, by design (`xcodebuild` exit 65, "Restarting after unexpected exit") | `deathA1.log` |
| `deathB1`: killed after the temporary file was synced, before the rename | the same | `deathB1.log` |
| `recover`: a new process over the same files and Keychain | **A:** stale `.lock` cleaned, record v2 reads and verifies, the retry is `replayed`, v2. **B:** `.lock` and `.json.tmp` cleaned, record v1 verifies, the retry is recorded, v2. | `recover.log` |
| `testWriteFailureConfirmsNothing` | a failed write answers `PERSISTENCE_FAILURE`, then `OK`, v2 | `boundary.log` |
| `testConcurrentWriters` | 200 rounds: 200 wins, 200 refusals, `NSFileProtectionCompleteUntilFirstUserAuthentication` | `boundary.log` |

### 3.4 Performance and memory (PF-0, iPhone, `audits/v1-aif-p0-jsc-2026-11-17/lab/device-budgets.mjs`, exit 0)

The run is valid: one device, Release, no simulator, no debugger, no Low Power Mode. Inputs: [`results/device/p0-results.txt`](results/device/p0-results.txt) (`PerformanceTests` and 10 `ColdStartTests` processes, [`cold.txt`](results/device/cold.txt)). Verdict: [`device-budgets.txt`](results/device/device-budgets.txt).

| Measure | V1HR5R | V1HR5 (2026-11-25) | Budget |
|---|---|---|---|
| Cold context + bundle p95 (n=10) | 44.9 ms | 46.4 ms | 1 s |
| Cold first plan p95 (n=10) | 103.5 ms | 112.7 ms | 2 s |
| Warm context + bundle p95 | 43.4 ms | 44.2 ms | 1 s |
| First plan p95, fresh context | 100.3 ms | 110.4 ms | 2 s |
| Full-plan review p95 | 294.0 ms | 294.6 ms | 1.5 s |
| Review worst case | 297.9 ms | 300.7 ms | 3 s |
| Footprint after GC | 13.8 MB | 13.9 MB | 150 MB |
| Lifetime peak footprint | 34.2 MB | 33.1 MB | 350 MB |
| Atomic write p95 | 5.0 ms | 3.3 ms | 50 ms |
| Max main-queue stall | 9.0 ms | 9.1 ms | 100 ms |

**There is no performance regression: all ten budgets pass.**
- Every time measure is equal to V1HR5's or lower.
- The peak footprint is 1.1 MB higher.
- Atomic write p95 is 5.0 ms against 3.3 ms, at 10 % of its budget. It is a file-system measure that the amendment does not touch.
- These were measured in thermal state `serious`, while the device was charging. That condition is unfavourable to the device, so it does not favour the numbers.

## 4. Not run (stated, not claimed)

| Item | Why |
|---|---|
| Locked-device phase (`P0_PHASE=locked`) | It needs a person to lock the iPhone during the run. The amendment does not touch store or Keychain protection classes. It passed on the frozen bundle (2026-11-24) and was not run in V1HR5 either. |
| Reinstall phase (`reinstall1`/`reinstall2`) | It deletes the host app from the device: a destructive reinstall, not authorised. The persistence behaviour is unchanged by the amendment. |
| A heart-rate profile written by one process and read by another | No such test exists in the committed suite, and adding one would change the mission's test sources. Covered separately: the in-process reopen over the native store (§3.2) and the store's cross-process recovery (§3.3). |
| Airplane mode | Not set. The bundle and the tests make no network call (host contract: four functions, no network). |
| HealthKit, heart-rate series, a watch | Out of scope. No HealthKit, nothing written to the personal Apple Health, no series channel (G-1). `sessionDistribution` and `liveHeartRate` stay `UNAVAILABLE` by design. |
| `StressTests`, execution-tier probe, bridge aggregate | Not part of the device set defined for this amendment (V1HR5's run). |

The only thing installed on the iPhone is the synthetic test host `fit.vilumo.p0.devicehost.<TEAM>`. No app or personal data was deleted. The tests clean up their own files and Keychain items.

## 5. Verdict

- **MACOS_JSC_VALIDATED:** YES.
- **IPHONE_PHYSICAL_VALIDATED:** **YES**, for the amended bundle `d087ad51…`:
  - Node = macOS JavaScriptCore = iPhone JavaScriptCore, 0 DIVERGED everywhere;
  - the mission's cases, persistence, integrity and safety states as in §3.2–3.3;
  - PF-0 budgets pass with no regression.
  - Locked-device and reinstall were not run (§4).

## 6. History: the first session (blocked) and how it was unblocked

**The first session** (commit `465e7c8`) did not reach the device:
- `devicectl` listed the iPhone as `unavailable` and `xctrace` as offline;
- `build-for-testing` stopped at signing, with *No Accounts* and an empty provisioning-profile folder.

**Exact causes, as found in the completion session:**

1. **Device unavailable.** The iPhone was not connected and paired. Connected by cable, `devicectl` shows it `connected`, paired, tunnel `connected`, transport `wired`, Developer Mode `enabled`, DDI services available.
2. **Signing.** The Xcode account was missing. With the account signed in, there is one valid Apple Development identity, and `-allowProvisioningUpdates` created the team's development profile. `build-for-testing` then succeeded ([`results/device/build.log`](results/device/build.log)).
3. **A third block, found only on the first launch.** iOS refused to start the test runner: "The application could not be launched because the Developer App Certificate is not trusted". The only fix is on the device. At Claude's request, the Founder trusted the developer app in Settings → General → VPN & Device Management. Nothing else was changed. The two launches that failed for this reason are not counted as results.

No project or build setting was changed.

**Reproducing the run** from `audits/v1-hr5-runna-parity-2026-11-25/native/ios/DeviceHost` (`tools/` is relative to the repository root):

```sh
TEAM=<team id>; DD=<scratch>/dd-device
tools/device-lock/with-device.sh integration --wait -- xcodebuild build-for-testing -scheme P0DeviceHost -configuration Release -destination 'generic/platform=iOS' -derivedDataPath $DD DEVELOPMENT_TEAM=$TEAM -allowProvisioningUpdates
# then, per suite (EquivalenceTests, BoundaryTests, FocalTests/testCoreSafetyLifecycle with -testLanguage en|pt-BR, FocalTests/testLocaleAndSortCoverage,
# FocalTests/testLibmBits, PerformanceTests, ColdStartTests x10; the death phases with TEST_RUNNER_P0_PHASE=deathA1|deathB1|recover):
tools/device-lock/with-device.sh integration --wait -- xcodebuild test-without-building -scheme P0DeviceHost -configuration Release -destination platform=iOS,id=<UDID> -derivedDataPath $DD DEVELOPMENT_TEAM=$TEAM "-only-testing:P0DeviceTests/<suite>"
```

## 7. Erratum

- The first session's reports said "14 journeys" for `hr5.json`. The fixture holds **13**: the age18/age80 row is two journeys, and the Mac log reports `"journeys":13`.
- Steps (98) and verdicts (14 IDENTICAL, 84 EXPLAINED_LIBM) were and are correct.
